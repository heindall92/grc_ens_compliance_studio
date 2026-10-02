# Auditoría de seguridad · ENS Compliance Studio

> Informe tal como se redactó el 2 de octubre de 2026, sobre el código de ese día. Las rutas `ens-sec/`, `ens-ux/` y `scratchpad/` eran la carpeta de trabajo de la auditoría y no forman parte del repositorio. El estado de cada hallazgo está en [AUDITORIA_PRODUCCION.md](../AUDITORIA_PRODUCCION.md).

**Alcance:** `/home/user/grc_ens_compliance_studio` (HEAD `0b67ff9` más los cambios sin confirmar de la barra lateral que había en el árbol durante la auditoría, en `01-core.js`, `01b-security.js`, `02-icons.js`, `03-shell.js` y `07-events.js`). Cubre los dos ficheros `dist` generados por `node app/build.js`, el auditor `auditor/ens_soa_audit.py` y la CI.
**Método:** revisión de código con evidencia `fichero:línea` y prueba de concepto (PoC) en Playwright, Node o Python para cada punto. Las PoC de inyección usan marcadores inocuos (`<b id=inj>`, `<x-p>`): prueban que entra HTML sin ejecutar nada. No se ha modificado el repositorio. Todo está en `ens-sec/` (`poc/`, `orig/`, `fixed/`, `ens-sec.patch`).
**Fecha:** 2026-10-02.

## Resumen

La base es sólida. Casi todas las interpolaciones pasan por `esc()`, `sanitizeState` y `sanitizeWs` validan por esquema, `safeParse` descarta `__proto__`, la exportación .xlsx escribe texto y nunca fórmulas, y la capa i18n solo toca `nodeValue` y `setAttribute`. Aun así hay **una inyección de HTML confirmada** y, sobre todo, **una CSP que no la contiene** (`script-src 'unsafe-inline'`). Esa combinación es el riesgo principal con datos reales de cliente: basta una copia de seguridad `.json` manipulada.

| Severidad | Nº |
|---|---|
| Alta | 2 |
| Media | 4 |
| Baja | 6 |
| Informativa | 3 |

Con el parche aplicado sobre una copia, la verificación da:
- **0 violaciones de CSP** con la CSP por hashes en todas las vistas, en ES y EN, en los 5 casos, con 5 exportaciones y 3 importaciones;
- la PoC 1 ya no inyecta;
- `tests/e2e_app.py` da **61/61** y `tests/engine.test.js` **15/15**.

## Tabla de hallazgos

| ID | Sev. | Estado | Hallazgo | Evidencia |
|---|---|---|---|---|
| F1 | **Alta** | Confirmado (PoC) | Inyección de HTML almacenada. `fmtDate()` devuelve la cadena original sin escapar cuando no es una fecha válida. `projects[].updated` viene de `localStorage` o de una copia restaurada (`s(p.updated,40)`) y acaba en `innerHTML`. | `app/src/ui/01-core.js:18` (`isNaN(d) ? iso`), `app/src/ui/04-global.js:18` (`${fmtDate(p.updated)}` sin `esc`), `app/src/ui/01b-security.js:84` (`created/updated: s(...)`), `06-io.js:208-213` (restoreBackup). PoC `poc/poc1_markup.mjs` → `{"injectedB":true,"customEl":true}`. La carga persiste tras recargar porque se guarda en `localStorage`. |
| F2 | **Alta** | Confirmado | La CSP del fichero autónomo permite `script-src 'unsafe-inline' https://cdn.jsdelivr.net`, así que no frena F1 ni ningún XSS futuro (los manejadores en línea se ejecutan). Además permite **todo** jsDelivr, cualquier paquete npm, y Google Fonts. **La versión `dist/artifact` no lleva ninguna CSP ni `referrer`.** | `app/build.js:147`, `app/build.js:143` |
| F3 | Media | Confirmado (Node) | La neutralización de fórmulas en CSV es incompleta. No cubre espacio, NBSP o U+3000 delante del signo, las variantes de ancho completo `＝ ＋ － ＠`, ni `\n` al inicio. | `app/src/ui/01b-security.js:90`. PoC: `' =1+1'`, `'＝1+1'`, `'＠SUM(1)'` y `'\n=1+1'` salen **sin neutralizar**. El .xlsx exportado no tiene fórmulas (0 celdas `f`). |
| F4 | Media | Confirmado (código) | SheetJS CE **0.18.5** va embebido (`xlsx-js-style 1.2.0`) y se usa para **leer** .xlsx no fiables. Le afectan CVE-2023-30533 (prototype pollution, corregido en 0.19.3) y **CVE-2024-22363** (ReDoS, corregido en 0.20.2). Congelar `Object.prototype` mitiga la primera pero no la segunda, ni la contaminación de otros prototipos. | `app/vendor/xlsx.bundle.js:2` (`a.version="0.18.5"`), `06-io.js:126` |
| F5 | Media | Confirmado | La librería de Excel se carga desde el CDN **sin SRI** (`integrity`). Un CDN comprometido ejecutaría código con acceso a todos los proyectos. | `01-core.js:5`, `06-io.js:48` |
| F6 | Media | Confirmado | `localStorage` guarda en claro todos los proyectos (SoA, riesgos, vulnerabilidades abiertas con CVSS). Abierto como `file://`, Chromium comparte el origen con cualquier otro HTML local. En GitHub Pages (`heindall92.github.io/*`) lo comparte con todos los demás proyectos del usuario (p. ej. rosetta_multinorma). Cualquier XSS en uno de ellos lee los datos de este. | `01-core.js:25-29` |
| F7 | Baja | Confirmado | El informe Markdown solo escapa `< > |` y saltos de línea. Pasan `![](https://…)`, que en un visor carga una imagen remota (baliza), los enlaces `[..](..)` y los encabezados. | `01b-security.js:92` |
| F8 | Baja | Confirmado (código) | `Object.freeze(Object.prototype)` se ejecuta al final del último módulo, después de `store.get(WS_KEY)`. Hoy no es explotable porque `safeParse` filtra, pero conviene congelar antes que nada. `Array.prototype` no se congela. | `07-events.js:193` |
| F9 | Baja | Confirmado | `window.__ENS_STUDIO__` expone `state`, `ws`, `openCase` y `go` a cualquier script del origen (extensiones, XSS) y simplifica la exfiltración. | `07-events.js:199` |
| F10 | Baja | Confirmado | Un JSON de hallazgos `null` o con `hallazgos` no iterable lanza un TypeError fuera de `try` (DoS local). Tampoco hay límite de elementos antes de iterar. | `06-io.js:184` |
| F11 | Baja | Confirmado (PoC Python) | El auditor CLI no escapa el informe `--md`. Contenido de celdas (valores de categorización, IDs `S-01…`, `MC-…`, cabeceras) entra tal cual: HTML, `|` y saltos de línea que rompen la tabla. En consola se imprimen celdas sin filtrar caracteres de control. | `auditor/ens_soa_audit.py:457-468`, `:483-484`. PoC: `<b>x</b>` y `\n## falso` aparecen en `inj.md`. La secuencia ANSI vía `_x001B_` **no** se reprodujo con openpyxl 3.1.5, así que el riesgo de terminal es teórico. |
| F12 | Baja | Confirmado | El auditor no tiene límite de tamaño y carga el libro **dos veces** en memoria (`data_only` True y False). Un .xlsx muy comprimible agota la RAM. Tampoco usa `defusedxml`. | `ens_soa_audit.py:169-172` |
| F13 | Baja | Confirmado | CI: acciones fijadas por **etiqueta** (`@v4`, `@v5`) y no por SHA. `pip install` sin versiones (ignora `requirements.txt`). Sin bloque `permissions:`. | `.github/workflows/tests.yml:7-12` |
| I1 | Info | Refutado | **XXE y billion laughs en el auditor:** con Python 3.11.15 y expat 2.6.1, openpyxl rechaza ambos (`limit on input amplification factor`, `undefined entity`). Depende de la versión de expat del sistema, por eso se recomienda `defusedxml`. | PoC en `poc/` (lol.xlsx, xxe.xlsx) |
| I2 | Info | Refutado | **i18n:** `translateDom` solo reescribe `nodeValue` y atributos con `setAttribute`, y `toast` aplica `esc(tr(msg))`. No convierte texto en HTML. | `00-i18n.js:339-360`, `03-shell.js:187` |
| I3 | Info | Refutado | **Importaciones JSON y xlsx:** pasan por `createProject→sanitizeState` y el estado no contamina prototipos. `importHallazgos` valida categoría, activo, CVSS e id. Las claves `__proto__` de la portada xlsx solo asignan primitivos (se ignoran). No hay exportación DOCX ni PDF en la app. | `06-io.js:122-203`, `01b-security.js:26-73` |

### Privacidad (texto vs. realidad)
- SECURITY.md («Privacidad») sí avisa de que las fuentes vienen de Google Fonts. Pero el README y la interfaz (`04-global.js:169`) dicen «Nada se envía a ningún servidor». Al abrir la app se envía la IP a fonts.googleapis.com y fonts.gstatic.com. En `dist/artifact` además sin `referrer`, y al exportar a Excel se contacta con jsDelivr. Hay que corregir el texto o eliminar esas cargas: el parche quita Google Fonts y usa las fuentes del sistema (la alternativa es embeberlas en base64, como hace rosetta_multinorma).
- El modelo de amenazas de SECURITY.md describe la CSP como estricta, y no lo es (F2).

## CSP verificada (fichero autónomo)

Generada en el build con los hashes SHA-256 de los 4 `<script>` y el `<style>` en línea (`fixed/app/build.js`). Los hashes cambian con cada build, así que **se deben calcular en `build.js` y no escribirse a mano**. Valor de esta build:

```
default-src 'none'; script-src 'sha256-mosUtWFuK2Km5IOSqiYWkl3QoXdx4Zqg1aL4jX5rHDc=' 'sha256-UQTTxqoQgiNR/bB6NxTutwZL/WJ94gTDgrYv7C8NKiw=' 'sha256-PsoH4VtwlY3ggo0r2ApW2BFE3Cv858DLBBsSYsmypY8=' 'sha256-+9iBzuPVWBq9deSbx5Slsbg01cO14NszETHxBv6nirY='; style-src 'sha256-hfmbnUdPyfFCaF4zhj8kNtL1qZ72LSXr4Su64JKL5XY='; style-src-attr 'unsafe-inline'; font-src 'none'; img-src data: blob:; connect-src 'none'; media-src 'none'; object-src 'none'; frame-src 'none'; worker-src 'none'; manifest-src 'none'; base-uri 'none'; form-action 'none'
```

Verificación con `poc/csp_run.mjs` (escucha de `securitypolicyviolation`). Recorre las 14 vistas × 5 casos × ES/EN, las pestañas de riesgos, una fila de SoA, las pestañas de ayuda y la paleta. Prueba las exportaciones xlsx, md, csv de riesgos, csv de plan y json, y las importaciones de proyecto JSON, SoA `data/SoA_TechServ_original.xlsx` y CSV de hallazgos.

| Variante | Violaciones | Exportaciones/importaciones |
|---|---|---|
| CSP actual | 0 (permite todo en línea) | OK |
| Estricta sin `style-src-attr` (`poc/strict.html`) | **`style-src-attr inline`** | OK |
| **Propuesta (por hashes + `style-src-attr 'unsafe-inline'`)** | **0** | 5 descargas, 7 proyectos, hallazgo importado |

**Qué impide una CSP 100 % estricta:** solo los atributos `style=""` de las plantillas (anchos de barras `05-project.js:41,61,225`, `--s` del avatar `03-shell.js:22`, márgenes en `04-global.js` y `05-project.js`). **No hay** manejadores en línea (`onclick=`), ni `eval`, ni `new Function` (tampoco en el bundle xlsx: 0 apariciones), ni `javascript:`. Las asignaciones `el.style.x = …` (tooltip y barra lateral) son CSSOM y la CSP no las bloquea. Para llegar a 0 excepciones: sustituir los `style=""` por clases o por variables CSS fijadas por JS después de renderizar, y quitar `style-src-attr`.

**`dist/artifact`:** la plataforma añade el `<head>`, así que un `<meta>` CSP en el cuerpo no sirve. Si se publica fuera de claude.ai, generar también ese fichero con `<head>` y CSP, añadiendo `https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/` a `script-src` y SRI (F5).

## Recomendaciones fuera del parche mínimo
1. **F4:** como en rosetta_multinorma (`src/app/06-io.js`), leer los ficheros no fiables con **SheetJS CE 0.20.3** (de cdn.sheetjs.com, vendorizado y con SRI) y usar `xlsx-js-style` solo para **escribir**.
2. **F6:** publicar en un origen propio y no en `usuario.github.io` compartido. Ofrecer el borrado de datos al cerrar sesión y, como opción, cifrar el `localStorage` con una contraseña (WebCrypto AES-GCM + PBKDF2).
3. El SRI del parche es el hash del `app/vendor/xlsx.bundle.js` local. **Comprobad que coincide con el fichero del CDN** (desde aquí no se pudo descargar: el proxy devolvió 403). Si no coincide, servir solo el local.
4. Completar el SHA de `actions/setup-python@v5` en la CI (desde esta sesión no se pudo resolver).

## Parche (diff unificado contra el árbol auditado)

Fichero: `ens-sec/ens-sec.patch`. Aplicar con `git apply` desde la raíz del repo. Cubre F1, F2, F3, F5 (SRI), F7, F8, F9 (expuesto solo con `?test`; incluye el ajuste de `tests/e2e_app.py`), F10, F11, F12 y F13. Las fuentes de Google se eliminan.

```diff

--- a/.github/workflows/tests.yml
+++ b/.github/workflows/tests.yml
@@ -1,15 +1,17 @@
 name: tests
 on: [push, pull_request]
+permissions:
+  contents: read
 jobs:
   test:
     runs-on: ubuntu-latest
     steps:
-      - uses: actions/checkout@v4
-      - uses: actions/setup-node@v4
+      - uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4
+      - uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4
         with: { node-version: 22 }
-      - uses: actions/setup-python@v5
+      - uses: actions/setup-python@<SHA-de-v5> # v5
         with: { python-version: '3.12' }
-      - run: pip install openpyxl pytest playwright && python -m playwright install --with-deps chromium
+      - run: pip install -r requirements.txt && python -m playwright install --with-deps chromium
       - run: ./run_tests.sh
       - name: Auditar la SoA de ejemplo (falla si hay NC mayores nuevas)
         run: python3 auditor/ens_soa_audit.py data/SoA_TechServ_original.xlsx --fail-on mayor

--- a/app/build.js
+++ b/app/build.js
@@ -137,16 +137,20 @@
   .replace('/*__STYLES__*/', () => src('styles.css'))
   .replace('/*__DATA__*/', () => DATA_JS)
   .replace('/*__ENGINE__*/', () => src('engine.js'))
-  .replace('/*__APP__*/', () => '(function () {\n\'use strict\';\n' + fs.readdirSync(path.join(ROOT, 'src', 'ui')).filter((f) => f.endsWith('.js')).sort().map((f) => `/* ===== ${f} ===== */\n` + src('ui/' + f)).join('\n') + '\n})();');
+  .replace('/*__APP__*/', () => '(function () {\n\'use strict\';\ntry { Object.freeze(Object.prototype); Object.freeze(Array.prototype); } catch (e) { /* n/a */ }\n' + fs.readdirSync(path.join(ROOT, 'src', 'ui')).filter((f) => f.endsWith('.js')).sort().map((f) => `/* ===== ${f} ===== */\n` + src('ui/' + f)).join('\n') + '\n})();');
 // 1) Página para publicar como web alojada (el esqueleto <html><head> lo añade la plataforma; xlsx-js-style se carga bajo demanda desde jsDelivr)
 fs.mkdirSync(path.join(ROOT, 'dist', 'artifact'), { recursive: true });
 fs.writeFileSync(path.join(ROOT, 'dist', 'artifact', 'ens-compliance-studio.html'), html.replace('<!--__XLSX__-->', ''));
 // 2) Versión autónoma: un único .html que funciona sin conexión (librería de Excel embebida)
 const xlsx = fs.readFileSync(path.join(ROOT, 'vendor', 'xlsx.bundle.js'), 'utf8').replace(/<\/script/gi, '<\\/script');
 // CSP estricta: sin conexiones salientes (connect-src 'none'), sin plugins ni formularios; solo fuentes de Google y el CDN de la librería de Excel
-const CSP = "default-src 'none'; script-src 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src data: blob:; connect-src 'none'; media-src 'none'; object-src 'none'; frame-src 'none'; worker-src 'none'; base-uri 'none'; form-action 'none'";
+const crypto = require('crypto');
+const hashes = (doc, tag) => [...doc.matchAll(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'g'))].map((m) => `'sha256-${crypto.createHash('sha256').update(m[1], 'utf8').digest('base64')}'`).join(' ');
+const body = html.replace('<!--__XLSX__-->', () => '<script>/*! xlsx-js-style 1.2.0 · Apache-2.0 · SheetJS CE */\n' + xlsx + '\n</script>');
+// CSP por hashes: sin 'unsafe-inline' en scripts; style-src-attr solo por los style="" de las plantillas
+const CSP = `default-src 'none'; script-src ${hashes(body, 'script')}; style-src ${hashes(body, 'style')}; style-src-attr 'unsafe-inline'; font-src 'none'; img-src data: blob:; connect-src 'none'; media-src 'none'; object-src 'none'; frame-src 'none'; worker-src 'none'; manifest-src 'none'; base-uri 'none'; form-action 'none'`;
 const standalone = '<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n<meta http-equiv="Content-Security-Policy" content="' + CSP + '">\n<meta name="referrer" content="no-referrer">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
-  + html.replace('<!--__XLSX__-->', () => '<script>/*! xlsx-js-style 1.2.0 · Apache-2.0 · SheetJS CE */\n' + xlsx + '\n</script>')
+  + body
     .replace('<div class="shell">', '</head>\n<body>\n<div class="shell">') + '\n</body>\n</html>\n';
 fs.writeFileSync(path.join(ROOT, 'dist', 'ens-compliance-studio.html'), standalone);
 console.log('OK dist/artifact/ens-compliance-studio.html', (html.length / 1024).toFixed(0) + ' KB · dist/ens-compliance-studio.html (autónomo)', (standalone.length / 1024).toFixed(0) + ' KB');

--- a/app/src/index.html
+++ b/app/src/index.html
@@ -1,8 +1,5 @@
 <title>ENS Compliance Studio</title>
 <meta name="description" content="Categorización ENS, análisis de riesgos MAGERIT, Declaración de Aplicabilidad y preauditoría en una sola herramienta.">
-<link rel="preconnect" href="https://fonts.googleapis.com">
-<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
-<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap">
 <style>
 /*__STYLES__*/
 </style>

--- a/app/src/ui/01-core.js
+++ b/app/src/ui/01-core.js
@@ -2,6 +2,7 @@
 const D = window.ENS_DATA;
 const E = window.ENSEngine;
 const CTX = { anexo: D.anexo, mapping: D.mapping, amenazasCatalogo: D.catalogos.AMENAZAS };
+const XLSX_SRI = 'sha384-OUW9euuUyxyHcAhTqbhI+Iyb8LMssXt/cpz0yXhs9UWG2/R/uaWdakx/4cfww7Vb'; // = app/vendor/xlsx.bundle.js; verificar contra el CDN
 const XLSX_URL = 'https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js';
 const HALL = D.mapping.hallazgo_categorias;
 const CAT_AM = D.catalogos.AMENAZAS;
@@ -15,7 +16,7 @@
 const blank = E.isBlank;
 const pct = (x, d = 1) => (Number(x) * 100).toLocaleString(locale(), { maximumFractionDigits: d, minimumFractionDigits: d }) + ' %';
 const today = () => new Date().toISOString().slice(0, 10);
-const fmtDate = (iso) => { if (!iso) return '—'; const d = new Date(iso.length === 10 ? iso + 'T00:00:00' : iso); return isNaN(d) ? iso : d.toLocaleDateString(locale(), { day: 'numeric', month: 'short', year: 'numeric' }); };
+const fmtDate = (iso) => { if (!iso) return '—'; const d = new Date(iso.length === 10 ? iso + 'T00:00:00' : iso); return isNaN(d) ? '—' : d.toLocaleDateString(locale(), { day: 'numeric', month: 'short', year: 'numeric' }); };
 const plural = (n, s, p) => `${n} ${n === 1 ? s : p}`;
 const uid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
 const initials = (name) => String(name || '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '··';

--- a/app/src/ui/01b-security.js
+++ b/app/src/ui/01b-security.js
@@ -11,6 +11,7 @@
 const idOk = (v) => (typeof v === 'string' || typeof v === 'number') && /^[A-Za-z0-9][A-Za-z0-9._-]{0,39}$/.test(String(v)) ? String(v) : null;
 const oneOf = (v, list, def) => (list.includes(v) ? v : def);
 const num = (v, min, max, def = min) => { const n = Number(v); return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : def; };
+const isoTs = (v) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}(T[\d:.]+Z?)?$/.test(v) ? v : '');
 const dateOk = (v) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : '');
 const arr = (v, max = LIM.arr) => (Array.isArray(v) ? v.slice(0, max) : []);
 function safeEntries(o, max = 500) { return isObj(o) ? Object.keys(o).filter((k) => !BAD_KEYS.has(k)).slice(0, max).map((k) => [k, o[k]]) : []; }
@@ -81,13 +82,13 @@
       idioma: oneOf(se.idioma, ['es', 'en'], 'es'),
       apetito: oneOf(se.apetito, E.NIVELES, 'M'), cvss: { ma: num(cv.ma, 0, 10, 9), a: num(cv.a, 0, 10, 7), m: num(cv.m, 0, 10, 4) }, conHallazgos: se.conHallazgos !== false,
       madurezMin: oneOf(se.madurezMin, ['L1', 'L2', 'L3'], 'L2'), reglasOff: arr(se.reglasOff, 60).filter((x) => /^[A-Z]{2,3}-\d{2}$/.test(String(x))), asistente: se.asistente === true, mostrarCasos: se.mostrarCasos !== false, railMin: se.railMin === true },
-    projects: arr(r.projects, 300).filter((p) => isObj(p) && PROJ_ID.test(String(p.id))).map((p) => ({ id: p.id, kind: oneOf(p.kind, ['own', 'demo'], 'own'), caseId: CASE_IDS.includes(p.caseId) ? p.caseId : undefined, nombre: s(p.nombre, 200), organizacion: s(p.organizacion, 200), created: s(p.created, 40), updated: s(p.updated, 40), categoria: oneOf(p.categoria, ['ALTA', 'MEDIA', 'BÁSICA'], undefined), grado: p.grado === undefined ? undefined : num(p.grado, 0, 1, 0), ncMayor: Math.round(num(p.ncMayor, 0, 9999, 0)) })),
+    projects: arr(r.projects, 300).filter((p) => isObj(p) && PROJ_ID.test(String(p.id))).map((p) => ({ id: p.id, kind: oneOf(p.kind, ['own', 'demo'], 'own'), caseId: CASE_IDS.includes(p.caseId) ? p.caseId : undefined, nombre: s(p.nombre, 200), organizacion: s(p.organizacion, 200), created: isoTs(p.created), updated: isoTs(p.updated), categoria: oneOf(p.categoria, ['ALTA', 'MEDIA', 'BÁSICA'], undefined), grado: p.grado === undefined ? undefined : num(p.grado, 0, 1, 0), ncMayor: Math.round(num(p.ncMayor, 0, 9999, 0)) })),
     activeId: PROJ_ID.test(String(r.activeId)) ? r.activeId : null, onboarded: r.onboarded === true, profileDone: r.profileDone === true
   };
 }
 const COLOR_IDS = ['teal', 'blue', 'green', 'amber', 'rose', 'slate'];
 /* CSV: una celda que empieza por = + - @ (o tab/CR) se ejecutaría como fórmula al abrirla en una hoja de cálculo */
-const noFormula = (v) => { const x = String(v ?? ''); return /^[=+\-@\t\r]/.test(x) ? "'" + x : x; };
+const noFormula = (v) => { const x = String(v ?? ''); return /^[\s\u00A0\u3000]*[=+\-@\uFF1D\uFF0B\uFF0D\uFF20]|^[\t\r\n]/.test(x) ? "'" + x : x; };
 /* Markdown: se neutraliza HTML incrustado y las barras de tabla */
-const mdSafe = (v) => String(v ?? '').replace(/[<>]/g, (c) => (c === '<' ? '&lt;' : '&gt;')).replace(/\|/g, '/').replace(/\r?\n/g, ' ');
+const mdSafe = (v) => String(v ?? '').replace(/[<>]/g, (c) => (c === '<' ? '&lt;' : '&gt;')).replace(/\|/g, '/').replace(/[\\`*_[\]()!#]/g, '\\$&').replace(/[\r\n]+/g, ' ');
 function checkSize(f, max, label) { if (f.size > max) { toast(`${label} demasiado grande (máximo ${Math.round(max / 1048576)} MB)`); return false; } return true; }

--- a/app/src/ui/04-global.js
+++ b/app/src/ui/04-global.js
@@ -15,7 +15,7 @@
       <span class="proj-ic lg ${p.kind === 'demo' ? 'demo' : ''}">${icon(p.kind === 'demo' ? caseIcon(p.caseId) : 'building', 18)}</span>
       <div class="pr-main"><b>${esc(p.nombre)}</b><small>${esc(p.organizacion || '')}${p.kind === 'demo' ? ' · caso de ejemplo' : ''}</small></div>
       <div class="pr-meta">${catPill(p.categoria)}${p.grado !== undefined && p.grado !== null ? `<span class="muted small num">${pct(p.grado, 0)} implantado</span>` : ''}${p.ncMayor ? `<span class="badge crit">${plural(p.ncMayor, 'NC mayor', 'NC mayores')}</span>` : ''}</div>
-      <span class="muted small pr-date">${icon('clock', 14)} ${fmtDate(p.updated)}</span>
+      <span class="muted small pr-date">${icon('clock', 14)} ${esc(fmtDate(p.updated))}</span>
       <div class="row">${del ? `<span class="small">¿Eliminar?</span><button type="button" class="btn sm danger-solid" data-act="del-project" data-id="${esc(p.id)}">Eliminar</button><button type="button" class="btn sm" data-act="confirm-no">Cancelar</button>`
         : `<button type="button" class="btn sm" data-act="open-project" data-id="${esc(p.id)}">Abrir</button><button type="button" class="icon-btn sm" data-act="ask" data-what="del:${esc(p.id)}" aria-label="Eliminar ${esc(p.nombre)}">${icon('trash', 16)}</button>`}</div></div>`;
   };

--- a/app/src/ui/06-io.js
+++ b/app/src/ui/06-io.js
@@ -45,7 +45,7 @@
 function loadXLSX() {
   if (window.XLSX) return Promise.resolve(window.XLSX);
   return new Promise((res, rej) => {
-    const s = document.createElement('script'); s.src = XLSX_URL; s.async = true;
+    const s = document.createElement('script'); s.src = XLSX_URL; s.async = true; s.integrity = XLSX_SRI; s.crossOrigin = 'anonymous';
     s.onload = () => (window.XLSX ? res(window.XLSX) : rej(new Error('Librería no disponible')));
     s.onerror = () => rej(new Error('No se pudo cargar la librería de Excel (¿sin conexión?)'));
     document.head.appendChild(s);
@@ -181,7 +181,8 @@
 function importHallazgos(text, name) {
   let items;
   try { items = /\.json$/i.test(name) || /^\s*[[{]/.test(text) ? safeParse(text) : parseCsv(text); } catch (e) { toast('El fichero no es un CSV o JSON válido'); return; }
-  if (!Array.isArray(items)) items = items.hallazgos || [];
+  if (!Array.isArray(items)) items = isObj(items) && Array.isArray(items.hallazgos) ? items.hallazgos : [];
+  items = items.filter(isObj).slice(0, LIM.arr);
   let ok = 0, bad = 0;
   for (const it of items) {
     const cat = String(it.categoria || '').toUpperCase(); const act = state.activos.find((a) => a.id === it.activoId || a.id === it.activo);

--- a/app/src/ui/07-events.js
+++ b/app/src/ui/07-events.js
@@ -196,7 +196,7 @@
 ui.view = [...PROJECT_VIEWS, ...GLOBAL_VIEWS].includes(initialView) && (state || !PROJECT_VIEWS.includes(initialView)) ? initialView : (state ? 'panel' : 'inicio');
 render();
 aiNS().then((s) => { if (s) { ui.ai.available = true; if (ws.settings.asistente) render(); } });
-window.__ENS_STUDIO__ = { get state() { return state; }, get calc() { return calc; }, get audit() { return audit; }, get plan() { return plan; }, get ws() { return ws; }, openCase, go };
+if (/[?&]test\b/.test(location.search)) window.__ENS_STUDIO__ = { get state() { return state; }, get calc() { return calc; }, get audit() { return audit; }, get plan() { return plan; }, get ws() { return ws; }, openCase, go };
 
 /* Barra lateral: resaltado que sigue al puntero, despliegue con teclado y cambio de ancho de ventana */
 document.addEventListener('pointerover', (ev) => {

--- a/auditor/ens_soa_audit.py
+++ b/auditor/ens_soa_audit.py
@@ -166,7 +166,18 @@
     return None, None
 
 
+MAX_BYTES = 15 * 1024 * 1024
+_CTRL = re.compile(r"[\x00-\x08\x0b-\x1f\x7f-\x9f]")
+
+
+def md(s) -> str:
+    s = _CTRL.sub("", str(s))
+    return re.sub(r"[\\`*_\[\]()!#<>|]", lambda m: "\\" + m.group(0), s).replace("\r", " ").replace("\n", " ")
+
+
 def load_workbook(path: Path):
+    if path.stat().st_size > MAX_BYTES:
+        raise SystemExit(f"{path.name}: fichero demasiado grande (> {MAX_BYTES // 1048576} MB)")
     wb_v = openpyxl.load_workbook(path, data_only=True)
     wb_f = openpyxl.load_workbook(path, data_only=False)
     return wb_v, wb_f
@@ -455,7 +466,7 @@
 
 # ---------------------------------------------------------------- salida
 def to_markdown(res: Result) -> str:
-    L = [f"# Preauditoría de la SoA — {res.fichero}", "",
+    L = [f"# Preauditoría de la SoA — {md(res.fichero)}", "",
          f"**Fecha:** {res.fecha} · **Herramienta:** ens-soa-audit {__version__}", "",
          "## Resumen", "",
          f"- Categoría recalculada: **{res.categoria or 'no determinable'}** ({' · '.join(f'{d}={res.niveles.get(d) or chr(8212)}' for d in DIMS)}).",
@@ -466,7 +477,7 @@
         if not fs:
             continue
         L += [f"## {title} ({len(fs)})", "", "| Regla | Ámbito | Hallazgo | Acción recomendada | Referencia |", "|---|---|---|---|---|"]
-        L += [f"| {f.id} | {f.ambito} | **{f.titulo}.** {f.detalle.replace('|', '/')} | {f.recomendacion.replace('|', '/')} | {f.ref} |" for f in fs]
+        L += [f"| {md(f.id)} | {md(f.ambito)} | **{md(f.titulo)}.** {md(f.detalle)} | {md(f.recomendacion)} | {md(f.ref)} |" for f in fs]
         L.append("")
     L.append("_Preauditoría automática: prepara la auditoría formal del art. 31 RD 311/2022, no la sustituye._")
     return "\n".join(L)
@@ -480,8 +491,9 @@
     print(f"Categoría recalculada: {res.categoria} ({' '.join(f'{d}={res.niveles.get(d) or chr(8212)}' for d in DIMS)}) · "
           f"medidas {res.medidas} · exigidas {res.aplicables}" + (f" · implantación {res.grado * 100:.1f} %" if res.grado is not None else ""), file=stream)
     for f in res.hallazgos:
-        print(f"  {col(f.sev.ljust(11), colors[f.sev])} {f.id:<7} {f.ambito:<18} {f.titulo}", file=stream)
-        print(f"  {'':11} {'':7} {'':18} {f.detalle}", file=stream)
+        clean = lambda v: _CTRL.sub("", str(v))
+        print(f"  {col(f.sev.ljust(11), colors[f.sev])} {clean(f.id):<7} {clean(f.ambito):<18} {clean(f.titulo)}", file=stream)
+        print(f"  {'':11} {'':7} {'':18} {clean(f.detalle)}", file=stream)
     print(col(f"\n{res.count(MAYOR)} NC mayores · {res.count(MENOR)} NC menores · {res.count(OBS)} observaciones", "1"), file=stream)
 
 

--- a/requirements.txt
+++ b/requirements.txt
@@ -4,5 +4,6 @@
 #   pip install -r requirements.txt
 #   playwright install chromium
 openpyxl==3.1.5
+defusedxml==0.7.1
 pytest==9.1.1
 playwright==1.63.0

--- a/tests/e2e_app.py
+++ b/tests/e2e_app.py
@@ -39,7 +39,7 @@
     page.on("pageerror", lambda e: errors.append(str(e)))
     page.on("console", lambda m: errors.append(m.text) if m.type == "error" and "net::" not in m.text and "Content Security Policy" not in m.text else None)
     page.on("dialog", lambda d: (errors.append("dialog: " + d.message), d.dismiss()))
-    page.goto(APP.as_uri()); page.wait_for_selector("#view h1")
+    page.goto(APP.as_uri() + "?test"); page.wait_for_selector("#view h1")
     J = lambda js: page.evaluate(js)
     audit = lambda: J("window.__ENS_STUDIO__.audit.map(f => f.id + '|' + f.ambito)")
     nav = lambda v: page.click(f'nav [data-view="{v}"]')
```
