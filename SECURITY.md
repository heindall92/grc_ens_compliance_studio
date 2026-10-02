# Seguridad

ENS Compliance Studio maneja información sensible: el estado de cumplimiento de una organización, sus riesgos y sus vulnerabilidades abiertas. Por eso está diseñado para que **ningún dato salga del navegador** y para que **cualquier fichero importado se trate como hostil**.

## Modelo de amenazas

| Vector | Ejemplo | Defensa |
|---|---|---|
| XSS almacenado o reflejado | Un proyecto JSON o una SoA en Excel con `"><img onerror=…>` en un nombre | Todo texto se escapa al renderizar (`esc`). Los valores que acaban en clases o atributos pasan por listas blancas. No se inserta HTML procedente de datos. El tooltip usa `textContent`. |
| Prototype pollution | Claves `__proto__`, `constructor` o `prototype` en JSON o en rutas de edición | Se eliminan al parsear (`safeParse`). Las rutas de escritura se bloquean (`setPath`). `Object.prototype` se congela al arrancar. |
| CVE-2023-30533 y CVE-2024-22363 (SheetJS CE) | Libro .xlsx manipulado para contaminar prototipos o bloquear el navegador (ReDoS) | Los ficheros ajenos se leen con SheetJS CE **0.20.3**, que corrige ambas. `xlsx-js-style` (SheetJS 0.18.5) solo escribe el Excel propio. Además: `Object.prototype` y `Array.prototype` congelados al arrancar, lectura sin fórmulas ni HTML, límites de hojas, filas y columnas, y revalidación con `sanitizeState`. |
| Datos fuera de esquema | Probabilidad `x" onmouseover=…`, CVSS 99, madurez inexistente, referencias rotas | `sanitizeState` normaliza cada campo: tipos, rangos, enumeraciones, identificadores (`^[A-Za-z0-9][A-Za-z0-9._-]{0,39}$`) e integridad referencial. |
| CSV/Formula injection | Un hallazgo o activo llamado `=HYPERLINK(...)` que se exporta a CSV | Toda celda que empieza por `= + - @` (también tras espacios, NBSP, U+3000 o caracteres invisibles, y en sus variantes de ancho completo `＝ ＋ － ＠`), tabulador o salto de línea se prefija con `'`. En Excel las celdas se escriben como texto, nunca como fórmula. |
| HTML y Markdown en informes | Texto con `<script>`, `![](https://…)` (baliza) o `\n## falso` en el informe Markdown de la app o del auditor CLI | `<` y `>` se escapan; enlaces, imágenes, énfasis, encabezados, saltos de línea y barras de tabla se neutralizan. El auditor CLI quita además los caracteres de control de la salida por consola. |
| `localStorage` manipulado | Otra extensión o script altera la configuración guardada | El espacio de trabajo y los proyectos se revalidan en cada carga (`sanitizeWs`, `sanitizeState`). |
| Denegación de servicio | Ficheros enormes o con millones de filas | Límites: JSON 25 MB, Excel 15 MB, CSV 5 MB; máximo 5.000 filas × 60 columnas por hoja, 40 hojas; longitud máxima por campo. |
| Ejecución de código inyectado | Un fallo de escapado que deje pasar `<img onerror=…>` | CSP por hashes generada en el build: solo se ejecutan los `<script>` y el `<style>` que salen de `build.js` (y las dos librerías de Excel incrustadas, también por hash). Sin `'unsafe-inline'` ni `'unsafe-eval'` para código. `style-src-attr 'unsafe-inline'` queda por los atributos `style=""` de las plantillas y no permite ejecutar nada. |
| Exfiltración | Código inyectado que intenta enviar datos fuera | `default-src 'none'; connect-src 'none'; font-src 'none'; form-action 'none'; base-uri 'none'; object-src 'none'; frame-src 'none'; worker-src 'none'; manifest-src 'none'`, y referrer desactivado. La versión autónoma no hace ninguna petición de red. |
| Cadena de suministro | Una copia alterada de la librería de Excel en el CDN | La versión autónoma lleva las librerías dentro. La versión alojada las pide a jsDelivr con integridad SRI (`sha384`), igual al fichero de `app/vendor/`. |
| Acceso al estado desde la página | Una extensión o un script que lee `window` | El estado solo se expone en `window.__ENS_STUDIO__` cuando la URL lleva `?test` (pruebas automáticas). |
| Salidas del asistente | Respuesta manipulada por un texto malicioso en la descripción de un activo (prompt injection) | La respuesta se valida contra el catálogo MAGERIT (códigos, escalas y rangos), se escapa al mostrarse y nunca entra en el proyecto sin una acción explícita del usuario. |

## Verificación automática

`tests/e2e_app.py` ejecuta en cada pasada:

- la importación de un proyecto con cargas XSS en todos los campos, claves `__proto__` y valores fuera de rango, comprobando que no se ejecuta ningún script, que no hay atributos `on*` ni etiquetas inyectadas en el DOM y que `Object.prototype` no se contamina;
- la normalización de cada tipo de dato;
- la exportación de una fórmula maliciosa y su neutralización en el CSV;
- la manipulación de `localStorage` y su saneamiento al recargar;
- el rechazo de ficheros por encima del límite;
- una fecha manipulada en el almacenamiento que intentaba inyectar HTML en Inicio;
- la CSP: que esté por hashes, que no registre ninguna violación en el uso normal y que bloquee manejadores en línea, scripts nuevos y `fetch`;
- que las librerías de Excel no queden en el objeto global.

`tests/a11y_app.py` pasa axe-core (WCAG 2.2 A/AA) por todas las vistas en claro y oscuro, a 1440 y 390 px, y falla con una sola infracción. `tests/test_auditor.py` comprueba el escapado del informe Markdown del auditor CLI y su límite de tamaño.

Las auditorías completas, con pruebas de concepto, están en [docs/auditoria/](docs/auditoria/) y su estado en [docs/AUDITORIA_PRODUCCION.md](docs/AUDITORIA_PRODUCCION.md).

## Privacidad

Sin servidor, sin cuentas, sin analítica ni telemetría. La versión autónoma no hace ninguna petición de red: usa la fuente del sistema y lleva dentro las librerías de Excel. Los datos viven en el `localStorage` del navegador y salen de él solo mediante las exportaciones que el usuario pide o, si se activa el asistente en Ajustes, en cada petición al modelo de lenguaje.

## Riesgo residual

- **Almacenamiento sin cifrar y origen compartido.** `localStorage` guarda los proyectos en claro. Al abrir el HTML desde el disco, Chromium comparte el origen `file://` con cualquier otro HTML local; en GitHub Pages, `heindall92.github.io` lo comparte con los demás proyectos del mismo usuario. Ajustes y el README lo advierten. Para datos reales: fichero descargado, perfil de navegador propio y borrado al terminar. El cifrado en reposo (AES-GCM con clave derivada de contraseña) queda como mejora futura.
- **`style-src-attr 'unsafe-inline'`.** Lo exigen los anchos y colores calculados en las plantillas. No permite ejecutar código; eliminarlo requiere pasar esos valores a propiedades CSS asignadas desde JavaScript.

## Versiones soportadas

| Versión | Soporte |
|---|---|
| 2.1.x | Sí — versión actual |
| < 2.1 | No — actualizar a 2.1.0 |

## Informar de una vulnerabilidad

1. **No abras una *issue* pública.** Usa el *Security Advisory* privado del repositorio (pestaña «Security» → «Report a vulnerability») o escribe directamente a **yoandyramirezdelgado@gmail.com** con el asunto `[SECURITY] ens-compliance-studio`.
2. Incluye una prueba de concepto mínima (fichero de entrada, pasos, resultado esperado vs. obtenido) y, si es posible, el impacto (qué dato o control se ve comprometido).
3. Confirmación de recepción: en un plazo de **72 horas**.
4. Primer diagnóstico (válida / no válida / necesita más información): en un plazo de **7 días naturales**.
5. Si se confirma, se publica una corrección y un aviso en el CHANGELOG. Al ser una aplicación estática sin backend ni usuarios registrados, no hay despliegue centralizado que parchear: el aviso indica qué versión de `dist/` sustituye a la vulnerable.
6. Se acredita al reportante en el aviso, salvo que pida lo contrario.

No se ofrece recompensa económica (bug bounty); es un proyecto sin ánimo de lucro.
