# Seguridad

ENS Compliance Studio maneja información sensible: el estado de cumplimiento de una organización, sus riesgos y sus vulnerabilidades abiertas. Por eso está diseñado para que **ningún dato salga del navegador** y para que **cualquier fichero importado se trate como hostil**.

## Modelo de amenazas

| Vector | Ejemplo | Defensa |
|---|---|---|
| XSS almacenado o reflejado | Un proyecto JSON o una SoA en Excel con `"><img onerror=…>` en un nombre | Todo texto se escapa al renderizar (`esc`). Los valores que acaban en clases o atributos pasan por listas blancas. No se inserta HTML procedente de datos. El tooltip usa `textContent`. |
| Prototype pollution | Claves `__proto__`, `constructor` o `prototype` en JSON o en rutas de edición | Se eliminan al parsear (`safeParse`). Las rutas de escritura se bloquean (`setPath`). `Object.prototype` se congela al arrancar. |
| CVE-2023-30533 (SheetJS CE ≤ 0.19.2) | Libro .xlsx manipulado para contaminar prototipos al leerlo | `Object.prototype` congelado. Lectura sin fórmulas ni HTML. Límites de hojas, filas y columnas. Todo lo leído se revalida con `sanitizeState`. |
| Datos fuera de esquema | Probabilidad `x" onmouseover=…`, CVSS 99, madurez inexistente, referencias rotas | `sanitizeState` normaliza cada campo: tipos, rangos, enumeraciones, identificadores (`^[A-Za-z0-9][A-Za-z0-9._-]{0,39}$`) e integridad referencial. |
| CSV/Formula injection | Un hallazgo o activo llamado `=HYPERLINK(...)` que se exporta a CSV | Toda celda que empieza por `= + - @`, tabulador o retorno de carro se prefija con `'`. En Excel las celdas se escriben como texto, nunca como fórmula. |
| HTML en informes | Texto con `<script>` en el informe Markdown | `<` y `>` se escapan y los saltos de línea y las barras de tabla se neutralizan. |
| `localStorage` manipulado | Otra extensión o script altera la configuración guardada | El espacio de trabajo y los proyectos se revalidan en cada carga (`sanitizeWs`, `sanitizeState`). |
| Denegación de servicio | Ficheros enormes o con millones de filas | Límites: JSON 25 MB, Excel 15 MB, CSV 5 MB; máximo 5.000 filas × 60 columnas por hoja, 40 hojas; longitud máxima por campo. |
| Exfiltración | Código inyectado que intenta enviar datos fuera | Versión autónoma con CSP `default-src 'none'; connect-src 'none'; form-action 'none'; base-uri 'none'; object-src 'none'; frame-src 'none'; worker-src 'none'`, y referrer desactivado. |
| Salidas del asistente | Respuesta manipulada por un texto malicioso en la descripción de un activo (prompt injection) | La respuesta se valida contra el catálogo MAGERIT (códigos, escalas y rangos), se escapa al mostrarse y nunca entra en el proyecto sin una acción explícita del usuario. |

## Verificación automática

`tests/e2e_app.py` ejecuta en cada pasada:

- la importación de un proyecto con cargas XSS en todos los campos, claves `__proto__` y valores fuera de rango, comprobando que no se ejecuta ningún script, que no hay atributos `on*` ni etiquetas inyectadas en el DOM y que `Object.prototype` no se contamina;
- la normalización de cada tipo de dato;
- la exportación de una fórmula maliciosa y su neutralización en el CSV;
- la manipulación de `localStorage` y su saneamiento al recargar;
- el rechazo de ficheros por encima del límite.

## Privacidad

Sin servidor, sin cuentas, sin analítica ni telemetría. Los datos viven en el `localStorage` del navegador y salen de él solo mediante las exportaciones que el usuario pide. Las fuentes tipográficas se cargan de Google Fonts; si se prefiere no hacerlo, la aplicación funciona igual con las fuentes del sistema.

## Informar de una vulnerabilidad

Abre una *issue* privada (Security Advisory) en el repositorio o escribe al autor. Se agradece incluir una prueba de concepto mínima.
