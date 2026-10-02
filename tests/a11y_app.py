"""Accesibilidad con axe-core (WCAG 2.2 A/AA) en todas las vistas, tema claro y oscuro, escritorio y móvil.

Uso:  python3 tests/a11y_app.py     (falla si hay alguna infracción; detalle en tests/artifacts/a11y.json)
axe-core se inyecta con la CSP desactivada solo en este contexto de prueba; la CSP se prueba en e2e_app.py.
"""
import json
import pathlib
import sys

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
APP = (ROOT / "app" / "dist" / "ens-compliance-studio.html").as_uri() + "?test"
AXE = ROOT / "tests" / "vendor" / "axe.min.js"
OUT = ROOT / "tests" / "artifacts"
OUT.mkdir(parents=True, exist_ok=True)
TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]

GLOBAL = ["inicio", "nuevo", "perfil", "ajustes", "ayuda"]
PROJECT = ["panel", "categorizacion", "riesgos", "soa", "compensatorias", "hallazgos", "plan", "auditoria", "exportar"]


def states(page):
    """Recorre las vistas y los estados que cambian el DOM (pestañas, fila desplegada, asistente, paleta)."""
    J = page.evaluate
    for v in GLOBAL:
        J(f"window.__ENS_STUDIO__.go('{v}')"); yield v
    for t in ["reglas", "glosario"]:
        if page.locator(f'[data-act="help-tab"][data-tab="{t}"]').count():
            J(f"window.__ENS_STUDIO__.go('ayuda')"); page.click(f'[data-act="help-tab"][data-tab="{t}"]'); yield f"ayuda/{t}"
    J("window.__ENS_STUDIO__.go('nuevo')")
    for _ in range(2):
        b = page.locator('#view [data-act="wz-next"]')
        if not b.count():
            break
        b.first.click(); yield "asistente/siguiente"
    J("window.__ENS_STUDIO__.openCase('techserv')")
    for v in PROJECT:
        J(f"window.__ENS_STUDIO__.go('{v}')"); yield v
    J("window.__ENS_STUDIO__.go('riesgos')")
    for t in ["activos", "amenazas", "salvaguardas", "registro"]:
        page.click(f'[data-act="riesgos-tab"][data-tab="{t}"]'); yield f"riesgos/{t}"
    J("window.__ENS_STUDIO__.go('soa')"); page.click("#soa-op\\.acc\\.6"); yield "soa/op.acc.6"
    page.keyboard.press("Control+k"); page.keyboard.type("op"); yield "paleta"
    page.keyboard.press("Escape")


def main():
    total, report = 0, []
    with sync_playwright() as p:
        b = p.chromium.launch()
        for scheme in ["light", "dark"]:
            for w, h in [(1440, 900), (390, 844)]:
                ctx = b.new_context(viewport={"width": w, "height": h}, color_scheme=scheme, bypass_csp=True, reduced_motion="reduce")
                page = ctx.new_page()
                page.route("**/*", lambda r: r.abort() if r.request.url.startswith("http") else r.continue_())
                page.goto(APP); page.wait_for_selector("#view h1")
                page.add_script_tag(path=str(AXE))
                for name in states(page):
                    page.wait_for_timeout(60)
                    res = page.evaluate("tags => axe.run(document, { runOnly: { type: 'tag', values: tags }, resultTypes: ['violations'] })", TAGS)
                    for v in res["violations"]:
                        n = len(v["nodes"]); total += n
                        report.append({"tema": scheme, "ancho": w, "estado": name, "regla": v["id"], "nodos": n,
                                       "ejemplo": v["nodes"][0]["target"], "detalle": v["nodes"][0].get("failureSummary", "")[:300]})
                ctx.close()
        b.close()
    (OUT / "a11y.json").write_text(json.dumps(report, ensure_ascii=False, indent=1), encoding="utf-8")
    for r in report:
        print(f"  ✘ {r['tema']:5} {r['ancho']:4} {r['estado']:22} {r['regla']:28} {r['nodos']:3}  {r['ejemplo']}")
    print(f"\naxe-core: {total} nodos con infracciones en {len(report)} combinaciones")
    sys.exit(1 if total else 0)


if __name__ == "__main__":
    main()
