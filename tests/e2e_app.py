"""Prueba end-to-end de ENS Compliance Studio (Playwright + Chromium headless).

Cubre: primera ejecución y perfil, los 5 casos de ejemplo, todas las vistas, recategorización en vivo,
edición de la SoA, plan de acción, asistente de nuevo proyecto, importación de la SoA en Excel del
profesor, importación de hallazgos, exportaciones, ajustes, ayuda, buscador (Ctrl+K), copia de seguridad,
diseño responsive (390 px y 768 px) y pruebas de ataque (XSS, prototype pollution, inyección de fórmulas,
manipulación de localStorage, ficheros sobredimensionados).
Uso:  python3 tests/e2e_app.py      (deja capturas y ficheros en tests/artifacts/)
"""
import json
import pathlib
import sys

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
APP = ROOT / "app" / "dist" / "ens-compliance-studio.html"
OUT = ROOT / "tests" / "artifacts"
OUT.mkdir(parents=True, exist_ok=True)
checks = []


def ok(cond, msg):
    checks.append((bool(cond), msg))
    print(("  ✔ " if cond else "  ✘ ") + msg)


def offline(page):
    page.route("**/*", lambda r: r.abort() if r.request.url.startswith("http") else r.continue_())


VIEWS = ["panel", "categorizacion", "riesgos", "soa", "compensatorias", "hallazgos", "plan", "auditoria", "exportar"]

with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 1440, "height": 900}, accept_downloads=True)
    page = ctx.new_page(); offline(page)
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" and "net::" not in m.text and "Content Security Policy" not in m.text else None)
    page.on("dialog", lambda d: (errors.append("dialog: " + d.message), d.dismiss()))
    page.goto(APP.as_uri()); page.wait_for_selector("#view h1")
    J = lambda js: page.evaluate(js)
    audit = lambda: J("window.__ENS_STUDIO__.audit.map(f => f.id + '|' + f.ambito)")
    nav = lambda v: page.click(f'nav [data-view="{v}"]')

    print("Primera ejecución")
    ok(page.locator(".case-card").count() == 5, "Inicio muestra los 5 casos de ejemplo")
    ok(J("Object.isFrozen(Object.prototype)"), "Object.prototype congelado (defensa ante prototype pollution)")
    page.fill("#ob-nombre", "Yoandy Ramírez Delgado"); page.locator("#ob-nombre").blur()
    page.select_option("#ob-rol", "Consultor/a GRC"); page.click('[data-act="ob-save"]')
    ok("Yoandy" in page.locator(".me").inner_text(), "El perfil aparece en la barra lateral")
    page.screenshot(path=str(OUT / "01_inicio.png"), full_page=True)

    print("Caso TechServ")
    page.click('[data-act="open-case"][data-case="techserv"]'); page.wait_for_selector(".kpi")
    k = J("window.__ENS_STUDIO__.calc.kpi")
    ok(k["aplicables"] == 72 and k["implantadas"] == 66, f"KPI = Excel del profesor (72 exigidas, 66 implantadas): {k['aplicables']}, {k['implantadas']}")
    ok(page.locator(".demo-banner").count() == 1, "Aviso de caso de ejemplo con salida a datos propios")
    page.screenshot(path=str(OUT / "02_panel.png"), full_page=True)
    for v in VIEWS:
        nav(v); page.wait_for_timeout(60)
        ok(page.locator("#view h1").count() == 1, f"Vista {v}")
        page.screenshot(path=str(OUT / f"03_{v}.png"), full_page=(v != "soa"))

    print("Análisis de riesgos")
    nav("riesgos")
    for tab in ["activos", "amenazas", "salvaguardas", "registro"]:
        page.click(f'[data-act="riesgos-tab"][data-tab="{tab}"]')
        ok(page.locator("#view table").count() >= 1, f"Subpestaña {tab}")
    n_on = J("document.querySelectorAll('#view tbody tr').length"); page.click("#sw-hall")
    n_off = J("document.querySelectorAll('#view tbody tr').length"); page.click("#sw-hall")
    ok(n_on > n_off, f"La evidencia técnica añade riesgos derivados ({n_on} → {n_off})")

    print("SoA")
    nav("soa"); page.click("#soa-op\\.acc\\.6")
    ok("PT-01" in page.locator(".detail").inner_text(), "op.acc.6 muestra la NC PT-01 (panel sin doble factor)")
    page.screenshot(path=str(OUT / "04_soa_detalle.png"))
    page.fill("#soa-q", "copias"); page.wait_for_timeout(300)
    ok(page.locator(".soa-row:not(.soa-head)").count() >= 1 and J("document.activeElement.id") == "soa-q", "La búsqueda filtra y conserva el foco")
    page.fill("#soa-q", ""); page.wait_for_timeout(250)

    print("Recategorización en vivo")
    nav("categorizacion")
    idx = J("window.__ENS_STUDIO__.state.categorizacion.findIndex(a => a.id === 'I-02')")
    page.select_option(f"#cat-{idx}-T", "ALTO")
    a = audit()
    ok(any(x.startswith("SOA-01|mp.info.4") for x in a), "T=ALTO → SOA-01 en mp.info.4")
    ok(any(x.startswith("REF-01|op.exp.8 R5") for x in a), "T=ALTO → REF-01 en op.exp.8 R5")

    print("SoA exportada con incidencias (paridad Python ↔ JS)")
    nav("soa"); page.click("#soa-org\\.2")
    page.fill("#soa-org\\.2-evidencias", ""); page.locator("#soa-org\\.2-evidencias").blur()
    page.fill("#soa-org\\.2-responsable", ""); page.locator("#soa-org\\.2-responsable").blur()
    ok(any(x.startswith("SOA-04|org.2") for x in audit()), "Vaciar evidencias genera SOA-04 al instante")
    nav("exportar")
    with page.expect_download() as d:
        page.click('.export-grid [data-act="export-xlsx"]')
    d.value.save_as(str(OUT / "paridad_SoA_ENS.xlsx"))
    ok((OUT / "paridad_SoA_ENS.xlsx").stat().st_size > 1000, "Excel de paridad exportado")
    page.click('.demo-banner [data-act="reset-case"]')
    ok(not any(x.startswith("SOA-01") for x in audit()), "Restablecer devuelve el caso a su estado original")

    print("Plan de acción")
    nav("plan")
    before = J("window.__ENS_STUDIO__.plan.filter(a => a.estado !== 'Hecha' && !a.verificada).length")
    first = page.locator('select[data-f="estado"]').first
    first.select_option("Hecha")
    after = J("window.__ENS_STUDIO__.plan.filter(a => a.estado !== 'Hecha' && !a.verificada).length")
    ok(after == before - 1, f"Marcar una acción como hecha la cierra ({before} → {after})")
    ok(len(J("Object.keys(window.__ENS_STUDIO__.state.acciones)")) == 1, "El estado de la acción se guarda en el proyecto")

    print("Hallazgos: importación")
    nav("hallazgos")
    csv = OUT / "hallazgos_import.csv"
    csv.write_text("id,titulo,categoria,cvss,activoId,estado,fuente\nH-08,=HYPERLINK(\"http://evil\";\"clic\"),XSS,6.1,ACT-002,abierto,Pentest 2027\nH-09,Categoria inventada,NOEXISTE,5,ACT-002,abierto,x\n", encoding="utf-8")
    with page.expect_file_chooser() as fc:
        page.click('[data-act="import-hall"]')
    fc.value.set_files(str(csv)); page.wait_for_timeout(300)
    hs = J("window.__ENS_STUDIO__.state.hallazgos.map(h => h.id)")
    ok("H-08" in hs and "H-09" not in hs, "Importa el válido y descarta el inválido")

    print("Exportaciones")
    nav("riesgos"); page.click('[data-act="riesgos-tab"][data-tab="activos"]')
    page.fill("#ac-0-n", '=HYPERLINK("http://evil";"clic")'); page.locator("#ac-0-n").blur()
    nav("exportar")
    for act, ext in [("export-xlsx", ".xlsx"), ("export-md", ".md"), ("export-json", ".json"), ("export-csv", ".csv"), ("export-plan", ".csv")]:
        with page.expect_download() as d:
            page.click(f'.export-grid [data-act="{act}"]')
        t = OUT / d.value.suggested_filename; d.value.save_as(str(t))
        ok(t.suffix == ext and t.stat().st_size > 200, f"{act} → {t.name}")
    riesgos_csv = next(OUT.glob("*_registro_riesgos_*.csv")).read_text(encoding="utf-8-sig")
    plan_csv = next(OUT.glob("*_plan_accion_*.csv")).read_text(encoding="utf-8-sig")
    ok("\"'=HYPERLINK" in riesgos_csv and ";=HYPERLINK" not in riesgos_csv and ';"=HYPERLINK' not in riesgos_csv and len(plan_csv) > 100, "Fórmula maliciosa neutralizada en el CSV exportado (CSV injection)")

    print("Asistente de nuevo proyecto")
    page.click('.demo-banner [data-view="nuevo"]')
    page.fill("#wz-org", "Diputación de Prueba"); page.locator("#wz-org").blur()
    page.click('[data-act="wz-next"]')
    ok(page.locator(".alert.crit").count() == 1, "Valida los campos obligatorios")
    page.fill("#wz-sis", "Sede electrónica provincial"); page.locator("#wz-sis").blur()
    page.click('[data-act="wz-next"]')
    page.fill("#wz-a0-n", "Registro electrónico"); page.locator("#wz-a0-n").blur()
    page.fill("#wz-a1-n", "Datos de expedientes"); page.locator("#wz-a1-n").blur()
    page.select_option("#wz-a1-C", "MEDIO")
    page.screenshot(path=str(OUT / "05_wizard.png"), full_page=True)
    page.click('[data-act="wz-next"]'); page.click('[data-act="wz-create"]'); page.wait_for_selector(".kpi")
    ok(J("window.__ENS_STUDIO__.calc.categoria") == "MEDIA", "Proyecto propio creado con categoría MEDIA")
    ok(any(x.startswith("SOA-10") for x in audit()) and page.locator(".progress-card").count() == 1, "Medidas pendientes: observación SOA-10 y barra de progreso")
    ok(page.locator(".demo-banner").count() == 0, "Sin aviso de demo en un proyecto propio")

    print("Importar la SoA en Excel del profesor")
    page.click('[data-act="menu"]')
    with page.expect_file_chooser() as fc:
        page.click('.menu [data-act="import-xlsx"]')
    fc.value.set_files(str(ROOT / "data" / "SoA_TechServ_original.xlsx")); page.wait_for_function("window.__ENS_STUDIO__.state && window.__ENS_STUDIO__.state.categorizacion.length === 8", timeout=15000)
    c = J("window.__ENS_STUDIO__.calc")
    ok(c["categoria"] == "ALTA" and c["kpi"]["aplicables"] == 72 and c["kpi"]["implantadas"] == 66, "Importada: ALTA, 72 exigidas, 66 implantadas")
    ok(sum(1 for x in audit() if x.startswith("CAT-01")) == 0 and J("window.__ENS_STUDIO__.calc.niveles.D") == "ALTO" and len(J("window.__ENS_STUDIO__.state.compensatorias")) == 4, "m cuenta como MEDIO, la disponibilidad sigue en ALTO e importa las 4 compensatorias")

    print("Ajustes")
    page.click('.side-foot [data-view="ajustes"]')
    page.click('[data-act="set"][data-k="tema"][data-v="oscuro"]')
    ok(J("document.documentElement.getAttribute('data-theme')") == "dark", "Tema oscuro")
    page.click('[data-act="set"][data-k="acento"][data-v="blue"]')
    ok(J("document.documentElement.getAttribute('data-accent')") == "blue", "Color de acento")
    page.screenshot(path=str(OUT / "06_ajustes_oscuro.png"), full_page=True)
    page.click('[data-act="set"][data-k="tema"][data-v="claro"]'); page.click('[data-act="set"][data-k="acento"][data-v="teal"]')
    page.click(".rules-box summary"); page.uncheck('[data-rule="CAT-01"]')
    ok(not any(x.startswith("CAT-01") for x in audit()), "Desactivar una regla la quita del auditor")
    page.check('[data-rule="CAT-01"]')

    print("Ayuda y buscador")
    page.click('.side-foot [data-view="ayuda"]')
    for t in ["inicio", "flujo", "glosario", "reglas", "atajos", "faq", "acerca"]:
        page.click(f'[data-act="help-tab"][data-tab="{t}"]')
    ok(page.locator(".about").count() == 1, "Todas las pestañas de ayuda")
    page.keyboard.press("Control+k"); page.keyboard.type("op.acc.6"); page.keyboard.press("Enter"); page.wait_for_timeout(300)
    ok(J("window.__ENS_STUDIO__.state && document.querySelector('#soa-op\\\\.acc\\\\.6.open') !== null"), "Ctrl+K → op.acc.6 abre la medida en la SoA")

    print("Seguridad: proyecto JSON malicioso")
    payload = '"><img src=x onerror="window.__pwned=1"><script>window.__pwned=2</script>'
    evil = {
        "version": 2, "__proto__": {"polluted": True}, "constructor": {"prototype": {"polluted": True}},
        "proyecto": {"nombre": payload, "organizacion": payload, "sistema": payload, "codigoSoA": payload},
        "portada": {payload: payload, "__proto__": {"polluted": True}},
        "categorizacion": [{"tipo": payload, "id": payload, "nombre": payload, "responsable": payload, "D": payload, "I": "ALTO", "C": "BAJO", "A": "BAJO", "T": "BAJO"}],
        "soa": {"org.1": {"aplica": payload, "estado": payload, "pct": "1e999", "evidencias": payload, "responsable": payload, "justificacion": payload}, "__proto__": {"x": 1}},
        "activos": [{"id": "ACT-001", "nombre": payload, "tipo": payload, "valoracion": {"D": "9e9", "I": -5}}, {"id": payload, "nombre": "x"}],
        "amenazas": [{"id": "R-001", "activoId": "ACT-001", "codigo": "[A.11]", "prob": 'x" onmouseover="window.__pwned=3', "deg": {"C": 100}}],
        "salvaguardas": [{"id": "SAL-001", "codigo": "H.AC", "nombre": payload, "madurez": payload, "cubre": ["R-001", payload]}],
        "hallazgos": [{"id": "H-01", "titulo": payload, "categoria": "XSS", "cvss": 99, "activoId": "ACT-001", "estado": payload}],
        "tratamiento": {"__proto__": {"opcion": "x"}, "R-001": {"opcion": payload, "plazo": payload}},
        "acciones": {"__proto__": {"estado": "Hecha"}}, "compensatorias": [{"id": payload, "medida": payload}],
    }
    evil_path = OUT / "proyecto_malicioso.json"; evil_path.write_text(json.dumps(evil), encoding="utf-8")
    nav("exportar")
    with page.expect_file_chooser() as fc:
        page.click('.export-grid [data-act="import-json"]')
    fc.value.set_files(str(evil_path)); page.wait_for_timeout(400)
    for v in VIEWS:
        nav(v); page.wait_for_timeout(40)
        if v == "riesgos":
            for t in ["activos", "amenazas", "salvaguardas", "registro"]:
                page.click(f'[data-act="riesgos-tab"][data-tab="{t}"]')
    page.click('nav [data-view="soa"]'); page.click("#soa-org\\.1"); page.hover(".risk >> nth=0")
    page.click('nav [data-view="inicio"]')
    ok(J("window.__pwned") is None, "Ninguna carga XSS se ejecuta")
    handlers = J("[...document.querySelectorAll('*')].filter(e => [...e.attributes].some(a => a.name.startsWith('on'))).length")
    ok(handlers == 0, "Ningún atributo de evento (on*) inyectado en el DOM")
    ok(J("document.querySelectorAll('#view img, #view script, #side img').length") == 0, "Ninguna etiqueta <img>/<script> inyectada")
    ok(J("({}).polluted") is None and J("({}).opcion") is None and J("({}).estado") is None, "Sin contaminación de Object.prototype")
    st = J("(() => { const s = window.__ENS_STUDIO__.state; return { prob: s.amenazas[0].prob, tipo: s.activos[0].tipo, val: s.activos[0].valoracion, n: s.activos.length, cvss: s.hallazgos[0].cvss, mad: s.salvaguardas[0].madurez, cubre: s.salvaguardas[0].cubre, op: s.tratamiento['R-001'].opcion, pct: s.soa['org.1'].pct }; })()")
    ok(st["prob"] == "M" and st["tipo"] == "[D]" and st["val"]["D"] == 10 and st["val"]["I"] == 0 and st["n"] == 1, "Valores fuera de esquema normalizados (probabilidad, tipo, valoración, ids)")
    ok(st["cvss"] == 10 and st["mad"] == "L0" and st["cubre"] == ["R-001"] and st["op"] == "" and st["pct"] is None, "CVSS acotado, madurez y tratamiento en lista blanca, referencias rotas eliminadas")

    print("Seguridad: localStorage manipulado y ficheros grandes")
    ws_evil = {"profile": {"nombre": payload, "color": '"><img src=x onerror=alert(1)>'}, "settings": {"tema": payload, "acento": '" onload="x', "cvss": {"ma": "NaN"}, "reglasOff": ["<b>"]}, "projects": [{"id": "../../etc", "nombre": "x"}], "activeId": "__proto__"}
    J(f"localStorage.setItem('ens-studio/v2/ws', {json.dumps(json.dumps(ws_evil))})")
    page.reload(); page.wait_for_selector("#view h1")
    ok(J("document.documentElement.getAttribute('data-accent')") == "teal" and J("window.__ENS_STUDIO__.ws.projects.length") == 0 and J("window.__pwned") is None, "Espacio de trabajo manipulado: se sanea al cargar")
    big = OUT / "grande.csv"; big.write_bytes(b"a" * (6 * 1024 * 1024))
    page.click('[data-act="open-case"][data-case="saas"]'); nav("hallazgos")
    with page.expect_file_chooser() as fc:
        page.click('[data-act="import-hall"]')
    fc.value.set_files(str(big)); page.wait_for_timeout(300)
    ok("demasiado grande" in page.locator("#toast").inner_text(), "Rechaza ficheros por encima del límite")
    big.unlink()

    print("Copia de seguridad")
    page.click('.side-foot [data-view="ajustes"]')
    with page.expect_download() as d:
        page.click('[data-act="backup"]')
    bk = OUT / "copia.json"; d.value.save_as(str(bk))
    n_proj = J("window.__ENS_STUDIO__.ws.projects.length")
    page.click('[data-act="ask"][data-what="wipe"]'); page.click('[data-act="wipe"]')
    ok(J("window.__ENS_STUDIO__.ws.projects.length") == 0, "Borrar todos los datos")
    page.click('.side-foot [data-view="ajustes"]')
    with page.expect_file_chooser() as fc:
        page.click('[data-act="restore"]')
    fc.value.set_files(str(bk)); page.wait_for_timeout(400)
    ok(J("window.__ENS_STUDIO__.ws.projects.length") == n_proj and n_proj > 0, f"Restaurar la copia recupera {n_proj} proyectos")

    print("Responsive")
    for w in (390, 768):
        page.set_viewport_size({"width": w, "height": 844})
        page.click('.top [data-act="drawer"]') if w < 900 else None
        page.wait_for_timeout(250)
        ok(J("document.querySelector('.side').getBoundingClientRect().left") >= -1, f"{w}px: el menú lateral se abre como cajón")
        page.click('.side [data-view="inicio"]')
        worst = 0
        for v in ["inicio", "ayuda", "ajustes", "perfil", "nuevo"]:
            J(f"window.__ENS_STUDIO__.go('{v}')"); worst = max(worst, J("document.documentElement.scrollWidth"))
        J("window.__ENS_STUDIO__.openCase('hospital')")
        for v in VIEWS:
            J(f"window.__ENS_STUDIO__.go('{v}')"); page.wait_for_timeout(30); worst = max(worst, J("document.documentElement.scrollWidth"))
        ok(worst <= w + 1, f"{w}px: ninguna vista desborda horizontalmente (máx. {worst})")
        J("window.__ENS_STUDIO__.go('panel')"); page.screenshot(path=str(OUT / f"07_movil_{w}.png"))
    page.set_viewport_size({"width": 1440, "height": 900})

    ok(not errors, "Sin errores de JavaScript ni diálogos" + ("" if not errors else f": {errors[:3]}"))
    b.close()

failed = [m for c, m in checks if not c]
print(f"\n{len(checks) - len(failed)}/{len(checks)} comprobaciones OK")
(OUT / "e2e_result.json").write_text(json.dumps({"total": len(checks), "fallos": failed}, ensure_ascii=False, indent=1), encoding="utf-8")
sys.exit(1 if failed else 0)
