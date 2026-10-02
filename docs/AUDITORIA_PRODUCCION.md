# Auditoría para producción

ENS Compliance Studio trabaja con información sensible: el estado de cumplimiento de una organización, sus riesgos y sus vulnerabilidades abiertas. Antes de usarlo con datos reales se auditaron dos áreas el 2 de octubre de 2026. Este documento resume qué se encontró, qué está corregido y qué prueba lo comprueba, y qué queda pendiente.

| Área | Informe completo | Resultado |
|---|---|---|
| Seguridad de la aplicación, del auditor CLI y de la CI | [01-seguridad.md](auditoria/01-seguridad.md) | 13 hallazgos (2 altos, 4 medios, 7 bajos) y 3 refutados. Corregidos 12; el 13.º (datos sin cifrar) queda advertido en la app y en la documentación. |
| Experiencia de uso, redacción y accesibilidad | [02-ux-redaccion-accesibilidad.md](auditoria/02-ux-redaccion-accesibilidad.md) | 885 nodos con infracciones WCAG 2.2 AA, 62 textos que cambiar y 6 fallos de maquetación en móvil. Ahora 0 infracciones, con prueba de regresión. |

---

## 1. Seguridad

| ID | Hallazgo | Severidad | Estado | Prueba |
|---|---|---|---|---|
| F1 | Inyección de HTML almacenada: una fecha manipulada en `localStorage` o en una copia restaurada llegaba sin escapar a Inicio | Alta | ✅ `fmtDate` ya no devuelve la entrada, la fecha se escapa y `sanitizeWs` solo admite fechas ISO | `e2e_app.py`: fecha manipulada |
| F2 | CSP con `script-src 'unsafe-inline'`, todo jsDelivr y Google Fonts: no contenía F1 | Alta | ✅ CSP por hashes calculada en el build; sin dominios externos | `e2e_app.py`: CSP por hashes, 0 violaciones en uso normal, bloqueo de `onerror`, `<script>` nuevo y `fetch` |
| F3 | Neutralización de fórmulas CSV incompleta (espacios, NBSP, U+3000, `＝ ＋ － ＠`, salto de línea) | Media | ✅ `noFormula` ampliado | `e2e_app.py`: exportación CSV |
| F4 | SheetJS CE 0.18.5 leyendo Excel ajeno (CVE-2023-30533, CVE-2024-22363) | Media | ✅ Lectura con SheetJS CE 0.20.3; `xlsx-js-style` solo escribe | `e2e_app.py`: importación de la SoA del profesor; las librerías no quedan en `window` |
| F5 | Librería de Excel desde el CDN sin SRI | Media | ✅ Incrustada en la versión autónoma; SRI `sha384` en la alojada, comprobado contra el paquete npm publicado | — |
| F6 | `localStorage` sin cifrar y origen compartido (`file://`, `heindall92.github.io`) | Media | 🟡 Aviso en Ajustes, en SECURITY.md y en el README. Cifrado en reposo: pendiente | — |
| F7 | Informe Markdown: pasaban imágenes remotas (baliza), enlaces y encabezados | Baja | ✅ `mdSafe` escapa `[ ] ! * _ \` y saltos | — |
| F8 | `Object.prototype` se congelaba al final | Baja | ✅ `Object.prototype` y `Array.prototype` se congelan en la primera línea de la app; importar y exportar Excel siguen funcionando | `e2e_app.py`: ambos congelados, sin contaminación |
| F9 | `window.__ENS_STUDIO__` expuesto siempre | Baja | ✅ Solo con `?test` | `e2e_app.py`: sin `?test` no existe |
| F10 | Importar hallazgos con JSON `null` lanzaba una excepción | Baja | ✅ Validación de tipo y límite de elementos | — |
| F11 | Auditor CLI: informe `--md` con HTML, `\|` y saltos sin escapar; caracteres de control en consola | Baja | ✅ Función `md()` y limpieza de controles | `test_auditor.py`: informe con carga maliciosa |
| F12 | Auditor CLI sin límite de tamaño y sin `defusedxml` | Baja | ✅ Límite de 15 MB y `defusedxml` en `requirements.txt` (openpyxl lo usa si está instalado) | `test_auditor.py`: fichero de 15 MB + 1 |
| F13 | CI con acciones por etiqueta, `pip` sin versiones y sin `permissions:` | Baja | ✅ Acciones por SHA, `permissions: contents: read`, `pip install -r requirements.txt` | — |
| — | Google Fonts en cada arranque (la IP del usuario llegaba a Google) | Privacidad | ✅ Fuente del sistema; ninguna petición a terceros | `e2e_app.py`: CSP sin dominios externos |
| — | Texto de Ajustes «Nada se envía a ningún servidor», falso con el asistente activado | Privacidad | ✅ Texto corregido | — |

Descartados tras probarlos: XXE y *billion laughs* contra openpyxl (los rechaza expat 2.6.1), conversión de texto en HTML en la capa de idiomas, contaminación de prototipos por las importaciones JSON y xlsx.

**Qué impide una CSP del todo estricta:** solo los atributos `style=""` de las plantillas (anchos de barras, colores calculados). No hay manejadores en línea, `eval` ni `new Function`, tampoco en las librerías de Excel.

## 2. Experiencia de uso, redacción y accesibilidad

| Hallazgo | Estado |
|---|---|
| El aviso inferior no se ocultaba nunca (`display: flex` anulaba `hidden`) | ✅ Prueba en `e2e_app.py` |
| 560 desplegables y 28 campos sin nombre accesible | ✅ |
| 297 nodos con contraste insuficiente: estados, riesgo «muy alto», filas atenuadas con `opacity`, acento como texto | ✅ |
| Regiones desplazables sin foco (texto del Anexo II, ejemplo CSV, tablas en móvil) | ✅ |
| El foco volvía a `<body>` tras pulsar pestañas, filtros, tarjetas o papeleras | ✅ Se recupera por `id` o por los `data-*` del control; prueba en `e2e_app.py` |
| Paleta sin gestión de foco; menú y pestañas sin flechas; sin enlace de salto | ✅ Paleta con `aria-modal`, patrón *combobox* y retorno del foco; flechas; «Ir al contenido». Pruebas en `e2e_app.py` |
| 99 tooltips del panel solo con ratón | ✅ Alcanzables con el teclado y con nombre accesible |
| 62 textos con eslóganes, tono de chat o afirmaciones que el código no sostiene | ✅ Aplicados con su traducción al inglés |
| Móvil: plan de acción palabra a palabra, desbordamiento en Ayuda → Reglas, solapes en la cabecera, cabecera de la SoA cortada | ✅ Prueba de desbordamiento en `e2e_app.py` |
| Traducción EN incompleta en entradillas, rótulos y glosario | ⏳ Quedan las cadenas listadas en el informe, §1.4 |
| Mapas de calor con etiqueta genérica | 🟡 Cada celda con amenazas tiene ahora su etiqueta; falta un resumen de la matriz |

`tests/a11y_app.py` ejecuta axe-core (WCAG 2.2 A/AA) en todas las vistas, pestañas, fila desplegada de la SoA, asistente y paleta, en tema claro y oscuro, a 1440 y 390 px. Resultado: **0 infracciones**. Falla con una sola.

## 3. Pendiente

| Tema | Por qué no está hecho |
|---|---|
| Cifrado del almacenamiento (AES-GCM con clave derivada de contraseña) | Cambia el modelo de uso: hace falta desbloquear al abrir y una recuperación si se olvida la contraseña. |
| Origen propio en lugar de `heindall92.github.io` | Necesita un dominio. |
| `style-src-attr` sin `'unsafe-inline'` | Requiere pasar los estilos calculados a propiedades asignadas desde JavaScript en todas las plantillas. |
| Traducción EN completa | Lista exacta en el informe de UX, §1.4. |
