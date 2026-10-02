"""Capturas del README (Playwright + Chromium).

Uso:  python3 docs/capturas.py        (escribe docs/img/readme/*.png a partir de app/dist/)

La app usa la fuente del sistema: SF Pro en macOS e iOS. En Linux no existe, así que para las capturas se
sustituye por Inter (OFL, docs/assets/fonts/), la más parecida. Solo en este script: la app no la incluye.
Para poder inyectarla se desactiva la CSP en este contexto; la CSP se prueba en tests/e2e_app.py.
"""
import base64
import json
import pathlib

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
APP = (ROOT / "app" / "dist" / "ens-compliance-studio.html").as_uri() + "?test"
OUT = ROOT / "docs" / "img" / "readme"
OUT.mkdir(parents=True, exist_ok=True)
INTER = base64.b64encode((ROOT / "docs" / "assets" / "fonts" / "inter-latin-wght.woff2").read_bytes()).decode()
FONT_CSS = "".join(
    f'@font-face{{font-family:"{f}";src:url(data:font/woff2;base64,{INTER}) format("woff2");font-weight:100 900}}'
    for f in ("SF Pro Text", "SF Pro Display")
) + ":root{--f:'SF Pro Text',system-ui,sans-serif}"
WS = {"profile": {"nombre": "Yoandy Ramírez Delgado", "rol": "Consultor/a GRC", "organizacion": "Evolve Academy", "color": "blue"},
      "profileDone": True, "onboarded": True, "settings": {"tema": "claro", "acento": "blue"}}


def page_for(b, w, h, theme, scale=1.5):
    ctx = b.new_context(viewport={"width": w, "height": h}, device_scale_factor=scale, bypass_csp=True,
                        color_scheme=theme, reduced_motion="reduce", locale="es-ES")
    ws = dict(WS, settings=dict(WS["settings"], tema="oscuro" if theme == "dark" else "claro"))
    ctx.add_init_script(f"if (!sessionStorage.getItem('cap')) {{ localStorage.clear(); localStorage.setItem('ens-studio/v2/ws', {json.dumps(json.dumps(ws))}); sessionStorage.setItem('cap', '1'); }}")
    p = ctx.new_page()
    p.route("**/*", lambda r: r.abort() if r.request.url.startswith("http") else r.continue_())
    p.goto(APP); p.wait_for_selector("#view h1")
    p.add_style_tag(content=FONT_CSS); p.evaluate("document.fonts.ready")
    return ctx, p


def go(p, view, case=None):
    if case:
        p.evaluate(f"window.__ENS_STUDIO__.openCase('{case}')")
    p.evaluate(f"window.__ENS_STUDIO__.go('{view}')")
    p.evaluate("document.activeElement && document.activeElement.blur(); document.getElementById('toast').hidden = true")
    p.mouse.move(1000, 700); p.wait_for_timeout(250)


def shot(p, name, **kw):
    p.screenshot(path=str(OUT / f"{name}.png"), **kw); print("  ·", name)


with sync_playwright() as pw:
    b = pw.chromium.launch()
    for theme in ("light", "dark"):
        ctx, p = page_for(b, 1280, 800, theme)
        go(p, "inicio"); shot(p, f"inicio-{theme}")
        go(p, "panel", "techserv"); shot(p, f"panel-{theme}")
        if theme == "light":
            go(p, "categorizacion"); shot(p, "categorizacion-light")
            go(p, "soa"); p.click("#soa-op\\.acc\\.6"); p.evaluate("window.scrollTo(0, document.getElementById('soa-op.acc.6').getBoundingClientRect().top + scrollY - 124)")
            p.mouse.move(1000, 700); p.wait_for_timeout(600); shot(p, "soa-light")
            go(p, "plan"); shot(p, "plan-light")
            go(p, "exportar"); shot(p, "exportar-light")
            go(p, "ayuda"); shot(p, "ayuda-light")
        else:
            go(p, "riesgos"); p.click('[data-act="riesgos-tab"][data-tab="registro"]'); p.mouse.move(1000, 700); p.wait_for_timeout(200); shot(p, "riesgos-dark")
            go(p, "hallazgos"); shot(p, "hallazgos-dark")
            go(p, "auditoria"); shot(p, "auditoria-dark")
            go(p, "ajustes"); shot(p, "ajustes-dark")
        ctx.close()

    # Barra lateral: completa, compacta y compacta desplegada al pasar el ratón
    ctx, p = page_for(b, 1280, 800, "light")
    go(p, "plan", "techserv")
    clip = {"x": 0, "y": 0, "width": 318, "height": 640}
    shot(p, "rail-completa", clip=clip)
    p.evaluate("document.querySelector('[data-act=\"rail-toggle\"]').click()"); p.mouse.move(1000, 700); p.wait_for_timeout(500)
    shot(p, "rail-compacta", clip=clip)
    p.hover('nav [data-view="soa"]'); p.wait_for_timeout(500)
    shot(p, "rail-desplegada", clip=clip)
    p.evaluate("document.querySelector('[data-act=\"rail-toggle\"]').click()")
    ctx.close()

    # Móvil
    ctx, p = page_for(b, 390, 844, "light", scale=2)
    go(p, "panel", "techserv"); shot(p, "movil-panel")
    go(p, "soa"); shot(p, "movil-soa")
    p.click('.top [data-act="drawer"]'); p.wait_for_timeout(400); shot(p, "movil-menu")
    ctx.close()
    b.close()
