"""Tests del auditor CLI (pytest).

- Resultado exacto sobre el Excel original del profesor.
- Mutaciones controladas del Excel (recategorización, fila borrada, evidencias vacías, duplicados…).
- Paridad entre implementaciones: las reglas documentales de la CLI (Python) y de la app (JavaScript)
  producen los mismos hallazgos sobre un libro exportado por la app.
"""
import datetime as dt
import pathlib
import shutil
import sys

import openpyxl
import pytest

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "auditor"))
import ens_soa_audit as A  # noqa: E402

ORIG = ROOT / "data" / "SoA_TechServ_original.xlsx"
HOY = dt.date(2026, 9, 22)


def ids(res):
    return sorted(f"{f.id}|{f.ambito}" for f in res.hallazgos)


def mutate(tmp_path, fn, name="mut.xlsx"):
    dst = tmp_path / name
    shutil.copy(ORIG, dst)
    wb = openpyxl.load_workbook(dst)
    fn(wb)
    wb.save(dst)
    return dst


def soa_row(ws, code):
    for r in ws.iter_rows(min_row=2):
        if r[1].value == code:
            return r
    raise KeyError(code)


def test_original_resultado_exacto():
    res = A.audit(ORIG, HOY)
    assert res.categoria == "ALTA"
    assert res.niveles == {"D": "ALTO", "I": "ALTO", "C": "ALTO", "A": "ALTO", "T": "MEDIO"}
    assert (res.medidas, res.aplicables) == (73, 72)
    assert abs(res.grado - 0.98888888) < 1e-6
    assert ids(res) == ["CAT-01|S-01 · D", "CAT-01|S-04 · D", "STR-01|Cabecera col. O"]


def test_recategorizacion_al_alza_detecta_exclusion_y_refuerzo(tmp_path):
    def f(wb):
        ws = wb["Categorización"]
        for r in ws.iter_rows(min_row=5, max_row=12):
            if r[1].value == "I-02":
                r[8].value = "ALTO"  # T
    res = A.audit(mutate(tmp_path, f), HOY)
    got = ids(res)
    assert "SOA-01|mp.info.4" in got
    assert "REF-01|op.exp.8 R5" in got


def test_fila_borrada_evidencias_vacias_y_duplicado(tmp_path):
    def f(wb):
        ws = wb["SoA ENS"]
        soa_row(ws, "op.exp.10")[19].value = None          # evidencias
        soa_row(ws, "op.acc.3")[20].value = "  "           # responsable
        soa_row(ws, "mp.s.4")[1].value = None              # medida ausente (se vacía la fila; delete_rows no desplaza celdas combinadas)
        soa_row(ws, "org.3")[1].value = "org.2"            # duplicado → org.3 ausente
    got = ids(A.audit(mutate(tmp_path, f), HOY))
    for exp in ["SOA-04|op.exp.10", "SOA-05|op.acc.3", "SOA-03|mp.s.4", "SOA-03|org.3", "STR-02|org.2"]:
        assert exp in got, exp


def test_parcial_sin_ptr_y_porcentaje_incoherente(tmp_path):
    def f(wb):
        ws = wb["SoA ENS"]
        r = soa_row(ws, "op.mon.3")
        for c in r:
            if isinstance(c.value, str) and "PTR" in c.value:
                c.value = c.value.replace("PTR", "plan")
        r2 = soa_row(ws, "org.1")
        r2[18].value = 0.5                                  # Implantada al 50 %
    got = ids(A.audit(mutate(tmp_path, f), HOY))
    assert "SOA-06|op.mon.3" in got
    assert "SOA-07|org.1" in got


def test_compensada_sin_mc_y_mc_incompleta(tmp_path):
    def f(wb):
        ws = wb["Medidas compensatorias"]
        for r in ws.iter_rows(min_row=4):
            if r[0].value == "MC-02":
                r[1].value = "Sustitución genérica sin código"
            if r[0].value == "MC-03":
                r[7].value = None                           # validación
    got = ids(A.audit(mutate(tmp_path, f), HOY))
    assert "MC-01|mp.if.6" in got
    assert "MC-02|MC-03" in got


def test_soa_caducada_y_sin_firma(tmp_path):
    def f(wb):
        ws = wb["Portada"]
        for r in ws.iter_rows():
            for i, c in enumerate(r[:-1]):
                if c.value and str(c.value).startswith("Firma"):
                    r[i + 1].value = None
    got = ids(A.audit(mutate(tmp_path, f), dt.date(2027, 12, 1)))
    assert "DOC-01|Portada" in got and "DOC-02|Portada" in got


def test_cli_codigo_de_salida_y_salidas(tmp_path):
    md, js = tmp_path / "r.md", tmp_path / "r.json"
    assert A.main([str(ORIG), "-q", "--fecha", "2026-09-22", "--md", str(md), "--json", str(js), "--fail-on", "mayor"]) == 0
    assert A.main([str(ORIG), "-q", "--fecha", "2026-09-22", "--fail-on", "menor"]) == 2
    assert "CAT-01" in md.read_text(encoding="utf-8")
    assert '"NC menor": 2' in js.read_text(encoding="utf-8")


PARIDAD = ROOT / "tests" / "artifacts" / "paridad_SoA_ENS.xlsx"
DOCFAM = {"CAT", "SOA", "REF", "MC", "DOC"}


@pytest.mark.skipif(not PARIDAD.exists(), reason="ejecuta antes tests/e2e_app.py para generar el Excel exportado por la app")
def test_paridad_python_js_sobre_excel_exportado_con_incidencias():
    """La app exporta una SoA recategorizada (I-02·T=ALTO) y con org.2 sin evidencias ni responsable.
    La CLI, leyendo solo el Excel, debe encontrar exactamente las mismas incidencias documentales que la app."""
    res = A.audit(PARIDAD, HOY)
    py = {f"{f.id}|{f.ambito}" for f in res.hallazgos if f.id.split("-")[0] in DOCFAM}
    ws = openpyxl.load_workbook(PARIDAD, data_only=True)["Auditoría"]
    js = {f"{r[0]}|{r[2]}" for r in ws.iter_rows(min_row=2, values_only=True)
          if r[0] and r[0].split("-")[0] in DOCFAM and r[0] != "MC-04"}  # MC-04 necesita el AR, que la CLI no tiene
    assert py == js
    assert {"SOA-01|mp.info.4", "REF-01|op.exp.8 R5", "SOA-04|org.2", "SOA-05|org.2"} <= py
    assert res.categoria == "ALTA" and res.niveles["T"] == "ALTO"
    assert not [f for f in res.hallazgos if f.id.startswith("STR-")]  # la exportación respeta la plantilla


def test_paridad_python_js_con_hallazgos_documentales(tmp_path):
    """Mismo contraste forzando incidencias: se genera la SoA con la CLI de Node y se compara."""
    import json
    import subprocess
    script = ROOT / "tests" / "_js_audit.js"
    if not shutil.which("node"):
        pytest.skip("node no disponible")
    dst = mutate(tmp_path, lambda wb: None)
    out = subprocess.run(["node", str(script), str(ROOT)], capture_output=True, text=True, check=True).stdout
    js = {x for x in json.loads(out) if x.split("-")[0] in {"CAT", "SOA", "REF", "MC", "DOC"} and not x.startswith("MC-04")}
    py = {f"{f.id}|{f.ambito}" for f in A.audit(dst, HOY).hallazgos if f.id.split("-")[0] in {"CAT", "SOA", "REF", "MC", "DOC"}}
    assert py == js == {"CAT-01|S-01 · D", "CAT-01|S-04 · D"}
