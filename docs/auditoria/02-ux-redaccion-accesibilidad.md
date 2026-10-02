# Auditoría de UX, redacción y accesibilidad: ENS Compliance Studio

> Informe tal como se redactó el 2 de octubre de 2026, sobre el código de ese día. Las rutas `ens-sec/`, `ens-ux/` y `scratchpad/` eran la carpeta de trabajo de la auditoría y no forman parte del repositorio. El estado de cada hallazgo está en [AUDITORIA_PRODUCCION.md](../AUDITORIA_PRODUCCION.md).

Fecha: 2 de octubre de 2026. Alcance: `app/src/ui/*.js`, `app/src/index.html` y `app/src/styles.css` del árbol de trabajo a las 15:09. Hay cambios sin confirmar en curso en el repositorio (barra lateral plegable, paleta de colores nueva, SheetJS 0.20.3); todo lo de abajo está medido sobre ese estado. No se ha modificado ningún fichero del repositorio: la compilación y las pruebas se hicieron sobre copias en `scratchpad/ens-ux/repo` y `scratchpad/ens-ux/applytest`.

Método:
- Redacción: lectura de todos los textos visibles en español (títulos, entradillas, estados vacíos, avisos, ayuda, tooltips, botones, errores) con las reglas del humanizer (`linkedin-humanizer/SKILL.md`, `references/audit-ai-tells.md`) adaptadas a una interfaz: eslóganes, metáforas, rellenos temporales, verbos de descubrimiento, preguntas retóricas, saludos, personificación, cadenas de imperativos y afirmaciones que el código no sostiene. Cada propuesta se contrastó con el código; ninguna describe funciones inexistentes.
- Accesibilidad: axe-core con `wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa` en 28 estados (todas las vistas, pestañas de Riesgos y Ayuda, fila de SoA desplegada, los 3 pasos del asistente, paleta y menú móvil) con el caso TechServ abierto, en claro y oscuro, a 1440 y 390 px: 114 ejecuciones. Pruebas de foco con Playwright.
- UX: 114 capturas de página completa y capturas de ventana a 390 px en `shots/`.

Comprobación de los cambios: con `copy-fixes.json` aplicado en `applytest/`, el modo EN traduce los textos nuevos (Inicio, KPI del panel, Ajustes, Plan, SoA, Categorización, asistente) y no hay errores de página. En el árbol actual `window.__ENS_STUDIO__` solo existe con `?test` en la URL; `run-audit.mjs` se ejecutó con la versión anterior, que lo exponía siempre.

Ficheros en `scratchpad/ens-ux/`:
- `copy-fixes.json`: 102 sustituciones exactas. Cada `old` aparece una sola vez en su fichero (validado contra el árbol actual) y el conjunto se aplicó en `applytest/`, que compila sin errores con `node app/build.js`.
- `axe-results.json`, `axe-summary.txt`, `focus.json`, `overflow.json`, `untranslated-en.json`.
- `shots/*.png` (`{tema}-{ancho}-{nº}-{vista}.png` y `m-*.png` para móvil), `run-audit.mjs`, `mobile.mjs`, `gen-fixes.js` (fuente de la tabla y del JSON).

## Resumen y prioridades

| Prioridad | Problema | Dónde | Arreglo |
|---|---|---|---|
| P0 | El aviso (toast) no desaparece nunca: `.toast { display: flex }` anula el atributo `hidden` (comprobado: `hidden=true`, `display=flex` 4 s después). Tapa contenido en todas las vistas; en móvil, la parte inferior de la pantalla. | `styles.css` | `.toast[hidden], .tip[hidden] { display: none; }` |
| P0 | Ajustes dice «Nada se envía a ningún servidor». Con el asistente activado se envían al modelo nombre, descripción y valoración del activo, o el texto normativo, la declaración y las medidas implantadas de la medida (`aiAmenazas`, `aiJust`). Es un dato falso sobre tratamiento de datos. | `04-global.js` | Filas 22 y 24 de la tabla |
| P0 | Perfil dice que el autor aparece «en el plan de acción». `firma()` solo se usa en el informe .md y en la portada del Excel. | `04-global.js` | Fila 17 |
| P1 | Pérdida de foco: cualquier botón sin `id` (pestañas, filtros, tarjetas de severidad, «Añadir», papelera, menú de proyectos, cierre de paleta) deja el foco en `<body>` tras `render()`. | `03-shell.js` | §2.3 |
| P1 | 560 `select` y 28 campos sin nombre accesible (categorización, activos, amenazas, salvaguardas, hallazgos, asistente, ajustes). | `04-global.js`, `05-project.js` | §2.2 |
| P1 | Contraste insuficiente: verde de estado, chip de riesgo MA, texto atenuado sobre fondos translúcidos y filas atenuadas con `opacity`. | `styles.css` | §2.2 |
| P1 | Plan de acción en móvil: la columna del título mide 56 px y el texto sale palabra a palabra. | `styles.css` | §3 |
| P1 | El motor de reglas aparece personificado como «el auditor» («Lo que ha encontrado el auditor», «un auditor revisando tu declaración»). Se confunde con el auditor de la auditoría formal del art. 31. | varios | Terminología «preauditoría» / «incidencias» |
| P2 | Ayuda → Reglas a 390 px: desplazamiento horizontal de página (567 px). | `styles.css` | §3 |
| P2 | Cabecera móvil: título de vista y píldora de categoría quedan debajo del botón de búsqueda. | `styles.css` | §3 |
| P2 | Lista SoA en móvil: la fila de encabezado conserva las columnas ocultas y se corta. | `styles.css` | §3 |
| P2 | Paleta y menú de proyectos sin gestión de foco (no se atrapa, no se devuelve, el menú no admite flechas). | `03-shell.js`, `07-events.js` | §2.3 |
| P2 | Traducción EN incompleta: entradillas de proyecto, tooltips `data-tip` y varios rótulos. | `00-i18n.js` | §1.4 |

## 1. Redacción

### 1.1 Criterios

- Se quitan saludos y tono de conversación: «Hola, X», «Bienvenido», «Encantado, X», «¿quién eres?», «Ahora no», «Nada por aquí», «Nada coincide».
- Se quitan rellenos temporales sin dato: «al instante», «al momento», «desde el primer momento», «aparecerá aquí».
- Se quitan eslóganes y frases de venta: «en una sola herramienta», «Del pentest al riesgo», «Todo lo que necesitas para sacar partido…», «problemas distintos que descubrir», «audítala al momento».
- Se quita la personificación del motor de reglas («el auditor encuentra / objeta / señala / reporta»). Son reglas de preauditoría; el auditor es la persona que hace la auditoría del art. 31.
- Se sustituyen fragmentos valorativos («Lo más riguroso.»), adjetivos que el cálculo no respalda («Residual real») y etiquetas que no dicen qué hacen o qué significan («Continuar», «Añadir», «antes 2»).
- Se mantiene lo que ya es preciso: textos de las 27 reglas, glosario (salvo una entrada), criterios del Anexo I, fórmulas MAGERIT, avisos de éxito («Amenaza añadida»), etiquetas de formulario, entradillas de Análisis de riesgos, Compensatorias, Evidencia técnica y Exportar.

### 1.2 Tabla de sustituciones

Cada fila corresponde a una entrada de `copy-fixes.json`. El JSON añade 40 entradas para `00-i18n.js`: pares `'ES': 'EN'` renombrados con el texto nuevo, claves obsoletas retiradas cuando el texto nuevo ya existía (p. ej. «Empezar con mis datos» pasa a «Nuevo proyecto»), claves nuevas insertadas tras `'Acción completada': 'Action completed',` y cambios en `EN_RE` (regex nuevas para «Media del % declarado en las N medidas exigidas», «· AR aprobado: N» y el subtítulo del KPI; se borran las de «Hola, X» y «Encantado, X»).

| # | Fichero | Texto actual (subcadena exacta) | Propuesta | Motivo | EN (nuevo) |
|---|---|---|---|---|---|
| 1 | index.html | Categorización ENS, análisis de riesgos MAGERIT, Declaración de Aplicabilidad y preauditoría en una sola herramienta. | Categorización ENS (RD 311/2022), análisis de riesgos MAGERIT, Declaración de Aplicabilidad y preauditoría documental. | Quita el eslogan «en una sola herramienta»; añade la norma de referencia. | — |
| 2 | 03-shell.js | Puedes editarlo libremente: los cambios solo afectan a esta copia. | Los cambios se guardan en una copia local; «Restablecer» recupera el estado original. | «libremente» es relleno; explica qué hace el botón de al lado. | Changes are saved to a local copy; “Reset” restores the original state. |
| 3 | 03-shell.js | data-act="nav" data-view="nuevo">Empezar con mis datos${icon('arrowRight', 15)} | data-act="nav" data-view="nuevo">Nuevo proyecto${icon('arrowRight', 15)} | Mismo destino que «Nuevo proyecto» del menú: una sola etiqueta para una sola acción. | New project |
| 4 | 03-shell.js | label: 'Descargar el informe de auditoría' | label: 'Descargar el informe de preauditoría (.md)' | El fichero es un informe de preauditoría en Markdown, no de auditoría. | Download the pre-audit report (.md) |
| 5 | 04-global.js | const hola = ws.profile.nombre ? `Hola, ${esc(ws.profile.nombre.split(' ')[0])}` : 'Bienvenido a ENS Compliance Studio'; | const hola = 'Proyectos y casos de ejemplo'; | Saludo coloquial («Hola, X» / «Bienvenido») sin información. El título describe lo que hay en la pantalla. | Projects and sample cases |
| 6 | 04-global.js | Categoriza tu sistema, analiza sus riesgos, declara la aplicabilidad de las 73 medidas del Esquema Nacional de Seguridad y comprueba que todo cuadra, incluida la evidencia de tus pruebas de intrusión. | Categorización del sistema (Anexo I), análisis de riesgos MAGERIT, Declaración de Aplicabilidad de las 73 medidas del Anexo II y comprobación de coherencia entre la SoA, el análisis de riesgos y los hallazgos de pruebas de intrusión. | Cadena de cuatro imperativos con tono de anuncio y coloquialismo «que todo cuadra». Se sustituye por lo que hace la herramienta, con referencias normativas. | System categorisation (Annex I), MAGERIT risk analysis, Statement of Applicability for the 73 Annex II measures and consistency checks between the SoA, the risk analysis and penetration-test findings. |
| 7 | 04-global.js | <h3>Antes de empezar, ¿quién eres?</h3> | <h3>Autor de los informes (opcional)</h3> | Pregunta retórica y tono informal. El bloque solo pide nombre y rol para firmar los informes. | Report author (optional) |
| 8 | 04-global.js | El nombre y el rol solo aparecen como autor en los informes. No hace falta rellenarlos: el menú de la izquierda se activa al crear o abrir un proyecto. | El nombre y el rol figuran como autor en el informe de preauditoría y en la portada del Excel de la SoA. No condicionan el acceso a ninguna sección. | Precisa en qué documentos aparece el autor (firma() se usa en informeMd y en la portada del xlsx) y elimina la explicación defensiva sobre el menú. | Name and role appear as the author of the pre-audit report and of the SoA Excel cover sheet. They do not restrict access to any section. |
| 9 | 04-global.js | data-act="ob-skip">Ahora no</button> | data-act="ob-skip">Omitir</button> | Registro coloquial. | Skip |
| 10 | 04-global.js | <b>Empezar con mis datos</b><span>Asistente en tres pasos: organización, activos esenciales y punto de partida. Sale con la categoría y las medidas exigidas calculadas.</span> | <b>Nuevo proyecto</b><span>Asistente en tres pasos: organización, activos esenciales y estado inicial de la SoA. Al terminar, la categoría y las medidas exigidas están calculadas.</span> | «Sale con» es coloquial; «punto de partida» es vago (el paso 3 elige el estado inicial de la SoA y el apetito). | Three-step wizard: organisation, essential assets and initial SoA status. When it finishes, the category and the required measures are calculated. |
| 11 | 04-global.js | <b>Importar mi SoA</b><span>Trae tu Declaración de Aplicabilidad en Excel (plantilla de 73 medidas) y audítala al momento.</span> | <b>Importar una SoA</b><span>Crea un proyecto a partir de una Declaración de Aplicabilidad en Excel (plantilla de 73 medidas). Las reglas de preauditoría se aplican al importar.</span> | «Trae tu… y audítala al momento»: imperativo comercial y relleno temporal. La herramienta crea un proyecto y ejecuta reglas, no audita. | Creates a project from a Statement of Applicability in Excel (73-measure template). The pre-audit rules run on import. |
| 12 | 04-global.js | <b>Explorar un caso</b><span>Cinco organizaciones ficticias, de categoría básica a alta, cada una con problemas distintos que descubrir.</span> | <b>Abrir un caso de ejemplo</b><span>Cinco organizaciones ficticias de categoría BÁSICA, MEDIA y ALTA, cada una con no conformidades distintas.</span> | «problemas que descubrir» es tono de juego («descubre»). Se dice qué contiene cada caso. | Five fictional organisations in BASIC, MEDIUM and HIGH categories, each with different nonconformities. |
| 13 | 04-global.js | <span><b class="num">${c.meta.aplicables}</b> medidas</span> | <span><b class="num">${c.meta.aplicables}</b> medidas exigidas</span> | El número es meta.aplicables (medidas exigidas), no el total de medidas. | — |
| 14 | 04-global.js | ${pageHead('Nuevo proyecto', 'Empieza con tus datos', 'Tres pasos y tendrás tu categoría, las medidas que te exige el Anexo II y un auditor revisando tu declaración desde el primer momento.')} | ${pageHead('RD 311/2022 · art. 40 y Anexo I', 'Nuevo proyecto', 'Datos de la organización, valoración de los activos esenciales y estado inicial de la SoA. Con esos datos se calculan la categoría del sistema y las medidas exigidas del Anexo II.')} | Promesa de marketing («tendrás… un auditor revisando… desde el primer momento»); el «auditor» son reglas automáticas. El título repetía el antetítulo. | Organisation details, essential-asset valuation and initial SoA status. These determine the system category and the Annex II measures required. |
| 15 | 04-global.js | <small>Declararás una a una la aplicabilidad, el estado y las evidencias. Lo más riguroso.</small> | <small>Todas las medidas empiezan sin declarar; la aplicabilidad, el estado y las evidencias se declaran una a una.</small> | Fragmento valorativo «Lo más riguroso.» sin dato. | Every measure starts undeclared; applicability, status and evidence are declared one by one. |
| 16 | 04-global.js | <small>La herramienta marca como aplicables las medidas que exige tu categoría; tú completas estado y evidencias.</small> | <small>Las medidas exigidas por la categoría se marcan «SÍ» y las no exigidas «NO»; el estado y las evidencias quedan pendientes.</small> | Precisa el efecto real de blankState(plantilla=true): aplica SÍ/NO y estado Pendiente / No aplica. | Measures required by the category are set to “YES” and the rest to “NO”; status and evidence stay pending. |
| 17 | 04-global.js | 'Se usa como autor en los informes, en la portada de la SoA exportada y en el plan de acción. Se guarda solo en este navegador.' | 'Figura como autor en el informe de preauditoría y en la portada del Excel de la SoA, y como «Elaborada por» por defecto en los proyectos nuevos. Se guarda solo en este navegador.' | Dato incorrecto: el perfil no aparece en el plan de acción (firma() solo se usa en informeMd y en la portada xlsx; wzInit lo usa como «Elaborada por»). | Shown as author of the pre-audit report and of the SoA Excel cover sheet, and as default “Prepared by” in new projects. Stored only in this browser. |
| 18 | 04-global.js | Este color es el del círculo de tu perfil. Verde agua, azul, verde, amarillo y rojo cambian también el acento de botones y tarjetas. La pizarra solo cambia el avatar. | Color del avatar. Verde agua, azul, verde, ámbar y rojo cambian también el color de acento de la interfaz; pizarra solo cambia el avatar. | Más corto y coherente con los nombres de color de los botones («Ámbar», no «amarillo»). | Avatar colour. Teal, blue, green, amber and red also change the interface accent colour; slate only changes the avatar. |
| 19 | 04-global.js | ['amber', 'Amarillo'] | ['amber', 'Ámbar'] | El mismo color se llama «Ámbar» en Perfil y «Amarillo» en Ajustes. | — |
| 20 | 04-global.js | 'Personaliza la apariencia y los criterios de análisis y auditoría. Los cambios se aplican al instante a todos los proyectos.' | 'Apariencia, criterios del análisis de riesgos y reglas de preauditoría. Salvo el apetito por defecto, que solo afecta a proyectos nuevos, los cambios se aplican a todos los proyectos de este navegador.' | «al instante» es relleno y la afirmación era inexacta: el apetito por defecto solo se aplica a proyectos nuevos. | Appearance, risk-analysis criteria and pre-audit rules. Except for the default appetite, which only affects new projects, changes apply to every project in this browser. |
| 21 | 04-global.js | 'Español o inglés para menús, ajustes y ayuda. El texto del Anexo II y los hallazgos del auditor siguen en español, que es el de la norma.' | 'Idioma de menús, ajustes y ayuda. El texto del Anexo II, las incidencias de preauditoría y los datos de los proyectos se muestran en español.' | Terminología («auditor» → preauditoría) y dato completo: las leyendas, notas de cabecera y datos de proyecto tampoco se traducen. | Language for menus, settings and help. Annex II text, pre-audit findings and project data are shown in Spanish. |
| 22 | 04-global.js | 'Propone amenazas del catálogo MAGERIT para un activo y borradores de justificación de aplicabilidad. Siempre requieren tu revisión. Solo disponible en la versión publicada en línea.' | 'Un modelo de lenguaje propone amenazas del catálogo MAGERIT para un activo y borradores de justificación de aplicabilidad. Al pedir una propuesta se envían al modelo el nombre, la descripción y la valoración del activo, o el texto de la medida y su declaración. Ninguna propuesta se guarda sin confirmación. Solo disponible en la versión publicada en línea.' | Omisión relevante en una herramienta de cumplimiento: no decía que es un modelo de lenguaje ni qué datos salen del navegador (ver prompts en aiAmenazas y aiJust). | A language model suggests MAGERIT catalogue threats for an asset and draft applicability justifications. Each request sends the model the asset name, description and valuation, or the measure text and its declaration. No suggestion is saved without confirmation. Only available in the online version. |
| 23 | 04-global.js | 'Desactívalo cuando trabajes solo con tus proyectos.' | 'Muestra u oculta la sección «Casos de ejemplo» en Inicio.' | Consejo de uso en lugar de describir el efecto del interruptor. | Shows or hides the “Sample cases” section on Home. |
| 24 | 04-global.js | Todo se guarda en este navegador. Nada se envía a ningún servidor. Haz copias de seguridad con regularidad. | Los proyectos, el perfil y los ajustes se guardan solo en el almacenamiento local de este navegador; si se borran los datos del sitio, se pierden. El asistente de análisis, si está activado, envía al modelo los datos de cada petición. | «Nada se envía a ningún servidor» es falso con el asistente activado. Se sustituye el consejo genérico por el riesgo concreto (borrado de datos del sitio). | Projects, profile and settings are stored only in this browser’s local storage and are lost if site data is cleared. When enabled, the analysis assistant sends the data of each request to the model. |
| 25 | 04-global.js | ['Activo esencial', 'Información o servicio que da razón de ser al sistema. Es lo que se valora para categorizar.'] | ['Activo esencial', 'Información que trata o servicio que presta el sistema. Es lo que se valora en las cinco dimensiones para categorizar (Anexo I).'] | «da razón de ser» es figurado; definición operativa. | — |
| 26 | 04-global.js | ['¿Qué pasa si recategorizo?', 'La herramienta recalcula al momento el nivel, la exigencia y los refuerzos de las 73 medidas, y el auditor señala qué declaraciones han quedado desalineadas.'] | ['¿Qué ocurre al cambiar la categorización?', 'Se recalculan el nivel exigido, la exigencia y los refuerzos de las 73 medidas. Las reglas SOA-01, SOA-02 y REF-01 a REF-03 señalan las declaraciones que ya no corresponden al nuevo nivel.'] | Registro coloquial («qué pasa»), «al momento» y «el auditor señala»; se nombran las reglas que actúan. | — |
| 27 | 04-global.js | ['Revisa y actúa', 'El auditor señala lo que no cuadra y el plan de acción lo convierte en tareas con responsable y fecha.', 'auditoria'] | ['Revisa las incidencias', 'Las reglas de preauditoría señalan las incoherencias y el plan de acción las convierte en tareas con responsable y fecha.', 'auditoria'] | Eslogan de dos verbos y coloquialismo «lo que no cuadra». | — |
| 28 | 04-global.js | <b>Auditor</b><small>${RULES.length} reglas</small> | <b>Preauditoría</b><small>${RULES.length} reglas</small> | El nodo representa reglas automáticas, no a un auditor. | Pre-audit |
| 29 | 04-global.js | ${pageHead('Centro de ayuda', 'Ayuda', 'Todo lo que necesitas para sacar partido a la herramienta, desde el primer proyecto hasta la auditoría.')} | ${pageHead('Centro de ayuda', 'Ayuda', 'Flujo de trabajo, método de cálculo, reglas de preauditoría, glosario y atajos de teclado.')} | Frase de relleno («todo lo que necesitas para sacar partido»). Se enumeran las secciones reales. | Workflow, calculation method, pre-audit rules, glossary and keyboard shortcuts. |
| 30 | 04-global.js | ['reglas', 'Reglas del auditor', 'shieldCheck'] | ['reglas', 'Reglas de preauditoría', 'shieldCheck'] | Terminología uniforme: las reglas son comprobaciones automáticas. | Pre-audit rules |
| 31 | 05-project.js | emptyState('clock', 'La evolución aparecerá aquí', 'Cada día que trabajes en el proyecto se guarda una instantánea de las no conformidades.') | emptyState('clock', 'Sin historial suficiente', 'Cada día en que se modifica el proyecto se guarda una instantánea de las no conformidades y del grado de implantación. El gráfico necesita al menos dos días.') | Promesa vaga («aparecerá aquí»). Se explica la condición exacta (h.length < 2). | Not enough history |
| 32 | 05-project.js | data-act="soa-pend">Continuar${icon('arrowRight', 15)} | data-act="soa-pend">Ver pendientes${icon('arrowRight', 15)} | El botón abre la SoA filtrada por pendientes; «Continuar» no dice adónde lleva. | View pending |
| 33 | 05-project.js | `Media de las ${k.aplicables} medidas exigidas` | `Media del % declarado en las ${k.aplicables} medidas exigidas` | Aclara qué se promedia. | Average declared % across the $1 required measures |
| 34 | 05-project.js | kpiTile('Implantadas sin objeción', `${limpias}<small>/${k.implantadas}</small>`, 'Implantadas al 100 % sin NC mayor' | kpiTile('Implantadas sin NC mayor', `${limpias}<small>/${k.implantadas}</small>`, 'Declaradas implantadas al 100 % sin ninguna NC mayor asociada' | «sin objeción» es impreciso; el cálculo es «implantada 100 % y sin NC mayor». | Implemented with no major NC |
| 35 | 05-project.js | <small> antes ${k.fueraApetitoDeclarado}</small> | <small> · AR aprobado: ${k.fueraApetitoDeclarado}</small> | «antes» no dice antes de qué; el segundo número es el del análisis aprobado sin evidencia técnica. | regex: /^· AR aprobado: (\d+)$/ → "· approved RA: $1" |
| 36 | 05-project.js | <h3>Próximas acciones</h3> | <h3>Acciones abiertas</h3> | La lista son las 5 primeras abiertas por prioridad, no por fecha; «próximas» sugiere un orden temporal. | Open actions |
| 37 | 05-project.js | <h3>Residual real</h3><span class="muted small">con evidencia técnica</span> | <h3>Residual con evidencia técnica</h3><span class="muted small">hallazgos abiertos aplicados</span> | «real» es una afirmación que la herramienta no puede sostener; es el residual recalculado con hallazgos abiertos. | Residual with technical evidence |
| 38 | 05-project.js | <h3>Lo que ha encontrado el auditor</h3> | <h3>Incidencias de preauditoría</h3> | Personificación coloquial del motor de reglas. | Pre-audit findings |
| 39 | 05-project.js | emptyState('check', 'Sin incidencias', 'El auditor no encuentra nada que objetar.') | emptyState('check', 'Sin incidencias', 'Ninguna regla de preauditoría activa genera incidencias.') | Personificación y registro informal. | No active pre-audit rule raises a finding. |
| 40 | 05-project.js | El nivel del sistema en cada dimensión es el máximo de sus activos, y la categoría es el nivel más alto. Todo lo demás se recalcula al instante. | El nivel del sistema en cada dimensión es el máximo de sus activos, y la categoría, el nivel más alto de las cinco dimensiones (art. 40). Al cambiar un valor se recalculan el nivel exigido de cada medida y las reglas de preauditoría. | «Todo lo demás… al instante» no dice qué se recalcula. | Rate each essential asset on the five dimensions. The system level in each dimension is the highest of its assets, and the category is the highest level across the five dimensions (art. 40). Changing a value recalculates the level required of each measure and the pre-audit rules. |
| 41 | 05-project.js | Se ignoran en el cálculo y el auditor los reporta como CAT-01. Corrígelos eligiendo un nivel. | Se ignoran en el cálculo y generan la no conformidad CAT-01. Selecciona un nivel válido en la tabla. | Terminología («el auditor los reporta»). | — |
| 42 | 05-project.js | emptyState('activity', 'Aún no hay amenazas', 'Da de alta activos y amenazas en las pestañas de al lado.') | emptyState('activity', 'Sin riesgos', 'Registra activos en la pestaña «Activos» y amenazas en «Amenazas».') | «de al lado» es vago; se nombran las pestañas. | No risks |
| 43 | 05-project.js | Las filas resaltadas son riesgos que no estaban en el análisis aprobado y han aparecido por un hallazgo técnico abierto. | Las filas resaltadas son riesgos que no figuran en el análisis aprobado y se generan a partir de un hallazgo técnico abierto (identificador R-H-xx). | Precisión: indica cómo identificarlos. | — |
| 44 | 05-project.js | <b>Analizando ${esc(act.nombre)}…</b><p class="small muted">Revisando el catálogo MAGERIT para este tipo de activo.</p> | <b>Generando propuesta para ${esc(act.nombre)}…</b><p class="small muted">Consulta al modelo de lenguaje con el catálogo MAGERIT filtrado por el tipo del activo.</p> | Antropomorfiza («analizando», «revisando»); en realidad es una petición a un modelo. | — |
| 45 | 05-project.js | Propuesta basada en el catálogo MAGERIT. Revísala antes de incorporarla. | Propuesta generada por un modelo de lenguaje a partir del catálogo MAGERIT. Comprueba la probabilidad y la degradación antes de añadirla. | Debe constar que la propuesta la genera un modelo, y qué revisar. | — |
| 46 | 05-project.js | Cada medida muestra qué riesgos trata y qué objeta el auditor. | Al desplegar una medida se muestran los riesgos que trata y sus incidencias de preauditoría. | Terminología y precisión (la información está en el detalle desplegado). | Required level, requirement and reinforcements are calculated from the categorisation. Applicability, status and evidence are what you declare. Expanding a measure shows the risks it addresses and its pre-audit findings. |
| 47 | 05-project.js | <span class="s-flags">Auditor</span> | <span class="s-flags">Incidencias</span> | Cabecera de columna: muestra el número de incidencias. | Findings |
| 48 | 05-project.js | emptyState('search', 'Nada coincide', 'Prueba con otro filtro o término de búsqueda.') | emptyState('search', 'Sin resultados', 'Ninguna medida cumple el filtro y la búsqueda actuales.') | Registro coloquial; describe el estado. | No measure matches the current filter and search. |
| 49 | 05-project.js | <h4>Lo que objeta el auditor</h4> | <h4>Incidencias de preauditoría</h4> | Personificación. | Pre-audit findings |
| 50 | 05-project.js | Sin incidencias del auditor</div> | Sin incidencias de preauditoría</div> | Terminología. | No pre-audit findings |
| 51 | 05-project.js | data-act="add-mc">${icon('plus', 16)}Añadir</button> | data-act="add-mc">${icon('plus', 16)}Añadir medida compensatoria</button> | Etiqueta de botón sin objeto. | Add compensating measure |
| 52 | 05-project.js | pageHead('Del pentest al riesgo', 'Evidencia técnica' | pageHead('Pentest, escaneos y phishing', 'Evidencia técnica' | Antetítulo tipo eslogan; se sustituye por las fuentes admitidas. | Pentests, scans and phishing |
| 53 | 05-project.js | <h3>Cómo se traduce un hallazgo</h3> | <h3>Conversión de hallazgo a riesgo</h3> | Título más preciso. | Finding-to-risk conversion |
| 54 | 05-project.js | 'Las no conformidades del auditor, los riesgos por encima del apetito y los hallazgos técnicos abiertos, convertidos en tareas con responsable y fecha. Cuando el origen desaparece, la acción se marca como verificada.' | 'Una acción por cada no conformidad de preauditoría, riesgo por encima del apetito y hallazgo técnico abierto. Cuando la condición de origen deja de cumplirse, la acción pasa a «Verificada».' | Frase nominal sin verbo y terminología («del auditor»). | One action for each pre-audit nonconformity, risk above appetite and open technical finding. When the source condition no longer holds, the action becomes “Verified”. |
| 55 | 05-project.js | emptyState('check', 'Nada por aquí', 'No hay acciones con este filtro.') | emptyState('check', 'Sin acciones', 'Ninguna acción cumple este filtro.') | Registro coloquial. | No actions |
| 56 | 05-project.js | Prepara la auditoría formal; no la sustituye. | Sirve para preparar la auditoría formal del art. 31; no la sustituye. | Añade la referencia normativa. | — |
| 57 | 05-project.js | emptyState('shieldCheck', 'Sin incidencias', 'No hay hallazgos del auditor con este filtro.') | emptyState('shieldCheck', 'Sin incidencias', 'Ninguna incidencia cumple este filtro.') | Terminología. | No finding matches this filter. |
| 58 | 06-io.js | 'No encuentro una hoja de SoA con las columnas «Código» y «¿Aplica?».' | 'No se encuentra ninguna hoja de SoA con las columnas «Código» y «¿Aplica?».' | Primera persona impropia de un mensaje de sistema. | No SoA sheet with the columns “Código” and “¿Aplica?” was found. |
| 59 | 06-io.js | 'El libro tiene demasiadas hojas para ser una SoA.' | 'El libro tiene más de 40 hojas y no se reconoce como SoA.' | Da el límite concreto (wb.SheetNames.length > 40). | The workbook has more than 40 sheets and is not recognised as an SoA. |
| 60 | 06-io.js | 'Demasiadas peticiones seguidas; espera un momento.' | 'Límite de peticiones alcanzado. Vuelve a intentarlo en unos segundos.' | Mensaje de error más neutro. | — |
| 61 | 07-events.js | toast('Abre o crea un proyecto para entrar aquí. El rol no bloquea el menú.') | toast('Esta sección requiere un proyecto abierto.') | Aclaración defensiva no pedida sobre el rol. | This section requires an open project. |
| 62 | 07-events.js | toast(ws.profile.nombre ? `Encantado, ${ws.profile.nombre.split(' ')[0]}` : 'Perfil guardado') | toast('Perfil guardado') | Tono casual («Encantado, X»). | (eliminar la entrada de EN_RE) |

### 1.3 Textos revisados que se mantienen

- `RULES` (27 reglas), `GLOSARIO` (salvo «Activo esencial»), `CRITERIOS` del Anexo I, `FAQ` (salvo «¿Qué pasa si recategorizo?»), atajos de teclado, «Acerca de».
- Avisos de operación de `07-events.js` y `06-io.js` («Hallazgo añadido», «Descarga cancelada», «SoA importada: N medidas…», «N hallazgos importados · M descartados (categoría, activo o CVSS no válidos)»). Son concretos.
- Entradillas de Análisis de riesgos (fórmulas), Compensatorias (art. 28.3), Evidencia técnica, Exportar y la nota de pie del informe .md.
- Estados vacíos de activos, amenazas, salvaguardas, compensatorias, hallazgos y categorización: dicen qué falta y qué hacer.
- Tarjetas de Exportar: describen el contenido de cada fichero. «auditarlo con la herramienta de línea de comandos» es correcto (existe `auditor/ens_soa_audit.py`).
- Nota de la barra lateral sin proyecto ya reescrita en el árbol de trabajo («Sin proyecto abierto / Las vistas del proyecto se activan al crear o abrir uno.»); está bien.

Pendientes menores, sin entrada en el JSON por ser de criterio:
- «Tema: sistema» (toast de `cycle-theme`) muestra el valor interno en minúscula. Propuesta: mapear a «Tema: Sistema / Claro / Oscuro».
- Los títulos de `TITLES` usan «Panel» y la vista «Panel de conformidad»: conviene unificar.
- `xlsx` columna «Incidencias del auditor» (`SOA_HEADERS`, `06-io.js`): si se adopta «preauditoría», renombrar también a «Incidencias de preauditoría». No se incluye en el JSON porque cambia el formato del Excel exportado y la importación busca cabeceras por prefijo.

### 1.4 Traducción inglesa

- `translateDom()` no traduce `data-tip`: los 99 tooltips del panel (mapa de calor, barras por familia, evolución) salen en español en modo EN. Añadir `'data-tip'` a la lista de atributos en la línea `for (const attr of ['placeholder', 'aria-label', 'title'])` y a `root.querySelectorAll('[placeholder], [aria-label], [title], [data-tip]')`.
- Sin clave EN hoy: entradillas de Categorización, SoA, Plan, Auditoría, Exportar, Compensatorias y Evidencia técnica; rótulos «Código», «Dimensión · nivel», «Categoría», «Añadir activo», «Añadir hallazgo», «Ámbito de aplicación», «Validación», «Aprobación», «Organización *», «Sistema de información *», glosario completo (ver `untranslated-en.json`). El JSON añade las claves de los textos que cambia; el resto queda como trabajo aparte.
- Claves muertas en `EN`: `'Tu nombre y tu rol aparecen como autor en los informes y en la SoA exportada…'`, `'Menú en espera'`, `'Panel, categorización y el resto se activan…'`, `'Abre o crea un proyecto. El rol no bloquea esta sección.'` ya no se usan.
- Claves duplicadas en el objeto `EN` (la última gana, sin efecto pero confunde): `'Casos de ejemplo'` ×3, `'Continuar'` ×2, `'Organización'`, `'Activos esenciales'`, `'Refuerzos'`, `'Documento'`, `'Seguimiento'`, `'Análisis de riesgos'`, `'Auditoría'`.

## 2. Accesibilidad

### 2.1 Resultados de axe-core (árbol actual)

| Regla axe | Impacto | Ejecuciones con fallo / nodos | Vistas | Selectores de ejemplo |
|---|---|---|---|---|
| `select-name` | crítico | 28 / 560 | categorización, riesgos (activos, amenazas, salvaguardas), evidencia técnica, ajustes, asistente paso 2 | `#cat-0-tipo`, `#ac-0-t`, `#am-0-a`, `#am-0-c`, `#am-0-p`, `#sa-0-c`, `#sa-0-m`, `#h-0-c`, `#h-0-a`, `#h-0-e`, `#wz-a0-t`, `#st-ap`, `#st-mad` |
| `label` | crítico | 8 / 28 | ajustes, asistente paso 2 | `#st-ch`, `#st-as`, `#st-mc`, `#wz-a0-id`, `#wz-a0-r`, `#wz-a1-id`, `#wz-a1-r` |
| `color-contrast` | grave | 31 / 297 | riesgos, SoA, SoA desplegada, evidencia técnica, categorización, asistente, perfil, ayuda | ver tabla siguiente |
| `scrollable-region-focusable` | grave | 6 / 6 | SoA desplegada, evidencia técnica (390 px) | `.norma`, `pre.code` |

En la primera pasada (antes de la paleta nueva) el contraste fallaba en 76 ejecuciones con 1.300+ nodos, casi todos por `--muted: #687880` sobre los fondos translúcidos. La paleta nueva lo reduce a 297 nodos; quedan estos pares:

| Tema | Texto / fondo | Ratio | Elementos |
|---|---|---|---|
| claro | `#ffffff` / `#ff6961` | 2,82 | `.risk.MA` (registro de riesgos, SoA) |
| claro | `#248a3d` / `#e8f6ec` | 3,94 | `.badge.ok` («Implantada»), `.cat-pill.BASICA`, `select.lvl.l-BAJO` |
| claro | `#dc2335` / `#fbe8ea` | 4,11 | `.seal > small` (efecto de `opacity: .85`) |
| claro | `#6e6e73` / `#e0eef4`…`#f0f0f3` | 4,27–4,45 | `.s-dim small`, `.pbar .num` en fila SoA abierta, `.chip em`, `.nav-group`, `.brand-txt small`, `.me-txt small`, `#pal-q` |
| claro | `#a8a8ab`, `#d19666`, `#777779` / blanco | 2,37–4,46 | filas de hallazgos cerrados `.tbl tr.dim-row td` (`opacity: .6`) |
| claro | `#66aac8` / `#ecf5f8` | 2,32 | `.code-chip` dentro de fila atenuada |
| oscuro | `#ffffff` / `#ff6961` | 2,82 | `.risk.MA` |
| oscuro | `#98989d` / `#2c4450` | 3,56 | texto atenuado en fila SoA abierta (`.soa-row.open`) |
| oscuro | `#4789a5` / `#26343c` | 3,28 | `.code-chip` atenuado |
| oscuro | `#66666a`, `#a46b12` | 2,97–3,57 | filas `.dim-row` |
| oscuro | `#e03f36` / `#302021` | 3,64 | `.seal > small` |

No se detectaron fallos en Panel, Plan, Auditoría, Exportar, Inicio, Compensatorias ni en la paleta con la paleta nueva (sí en la primera pasada).

### 2.2 Correcciones propuestas

CSS (`styles.css`), ratios calculados:

```css
/* Tokens (tema claro) */
:root { --muted: #636366; /* 5,05–5,26 sobre los fondos translúcidos medidos */
        --ok: #1e7b34;    /* 4,78 sobre --ok-soft, 5,33 sobre blanco */ }
/* Tema oscuro (en los dos bloques: prefers-color-scheme y [data-theme="dark"]) */
--muted: #aeaeb2; /* 4,63 sobre la fila SoA abierta, 7,69 sobre --surface */

/* Riesgo MA: tinta oscura sobre el rojo claro (5,97) */
.risk.MA { color: var(--r-ink); }

/* Sin opacidad en texto: atenuar con color */
.seal small { opacity: 1; }
.tbl tr.dim-row td { opacity: 1; color: var(--muted); }
.tbl tr.dim-row td .badge, .tbl tr.dim-row td .code-chip { filter: grayscale(1); }

/* Avisos y tooltip: respetar [hidden] */
.toast[hidden], .tip[hidden] { display: none; }

/* El foco programático del h1 tras go() no debe pintar el anillo */
h1[tabindex="-1"]:focus { outline: none; }

/* Enlace de salto */
.skip { position: absolute; left: 8px; top: -48px; z-index: 100; padding: 8px 12px; border-radius: 8px; background: var(--ink); color: var(--bg); }
.skip:focus { top: 8px; }
```

`index.html`: añadir `<a class="skip" href="#view">Ir al contenido</a>` como primer hijo de `<body>` y `tabindex="-1"` en `<div id="view">`. Hoy no hay enlace de salto y la barra lateral tiene 15 paradas de tabulación antes del contenido.

Nombres accesibles (`aria-label`; `translateDom` ya los traduce):
- `05-project.js` `vCat`: `<select id="cat-${i}-tipo" … aria-label="${esc(a.id)} tipo">`.
- `rActivos`: `<select id="ac-${i}-t" … aria-label="Tipo de activo">`.
- `rAmenazas`: `am-${i}-a` → `aria-label="Activo"`, `am-${i}-c` → `aria-label="Amenaza"`, `am-${i}-p` → `aria-label="Probabilidad"`.
- `rSalvs`: `sa-${i}-c` → `aria-label="Salvaguarda"`, `sa-${i}-m` → `aria-label="Madurez"`; los `<label>` de `.cover` ya tienen texto.
- `vHall`: `h-${i}-c` → `aria-label="Categoría"`, `h-${i}-a` → `aria-label="Activo"`, `h-${i}-e` → `aria-label="Estado"`.
- `04-global.js` asistente paso 2: `wz-a${i}-t` → `aria-label="Tipo"`, `wz-a${i}-id` → `aria-label="ID"`, `wz-a${i}-r` → `aria-label="Responsable"`; `wz-a${i}-n` solo tiene placeholder: `aria-label="Nombre del activo esencial"`.
- `vAjustes`: `setRow` no asocia el título al control. Cambiar `sw` a `const sw = (key, id, label) => \`<label class="switch"><input type="checkbox" id="${id}" aria-label="${label}" …\`` y pasar el título de la fila; `#st-ap` → `aria-label="Apetito de riesgo por defecto"`, `#st-mad` → `aria-label="Madurez mínima"`, inputs CVSS ya tienen `<label class="mini">`.
- Regiones desplazables: `<div class="norma" tabindex="0" role="region" aria-label="Texto del Anexo II">` en `soaDetail` (también el de refuerzos) y `<pre class="code" tabindex="0" aria-label="Ejemplo de CSV">` en `vHall`.
- Mapas de calor: `role="img"` con etiqueta genérica oculta los números. Etiqueta con el contenido: en `heatmap()` construir `aria-label="Mapa de calor ${titulo}: ${celdas no vacías como 'impacto A, probabilidad M: 2 amenazas'}"` o usar una `<table>` visualmente igual.
- Tooltips: 99 elementos con `data-tip` en el Panel, 1 enfocable. La información de la evolución y de las barras por familia solo existe al pasar el ratón. Añadir `tabindex="0"` y `aria-label` igual al `data-tip` en `.bar-g` y `.bar-row`, y mostrar el tooltip también en `focusin`.

### 2.3 Foco por teclado tras `render()`

Resultados (`focus.json`):

| Acción | Foco después |
|---|---|
| `go(view)` (navegación) | `h1` de la vista (correcto) |
| Enter en filtro SoA «op», pestaña de Riesgos, segmento del Plan, tarjeta de severidad, pestaña de Ayuda, «Añadir activo esencial», papelera de Inicio | `<body>` (se pierde) |
| Enter en fila SoA (`id` propio) | se conserva |
| Cambio en `select` con `id` | se conserva |
| Abrir paleta | `#pal-q` (correcto) |
| Tab dentro de la paleta | sale a los elementos de detrás (sin trampa; `role="dialog"` sin `aria-modal`) |
| Esc en la paleta | `<body>` (no vuelve al botón de búsqueda) |
| Abrir menú de proyectos | `<body>`; flechas sin efecto |
| Flechas en `role="tablist"` | sin efecto |
| Primer Tab tras cargar | no hay enlace de salto |

Cambio en `render()` (`03-shell.js`): recordar el control por sus `data-*` cuando no tiene `id`.

```js
const FOCUS_KEYS = ['act', 'view', 'tab', 'v', 'code', 'k', 'id', 'case', 'i', 'what', 'menu'];
function focusKey(el) {
  if (!el || !el.dataset || !el.dataset.act) return null;
  return FOCUS_KEYS.filter((k) => el.dataset[k] !== undefined)
    .map((k) => `[data-${k}="${CSS.escape(el.dataset[k])}"]`).join('');
}
function render() {
  const ae = document.activeElement; const active = ae && ae.id; const fkey = !active && focusKey(ae);
  /* … render actual … */
  if (active) { /* … igual que ahora … */ }
  else if (fkey) { const el = document.querySelector(fkey); if (el) el.focus({ preventScroll: true }); }
  if (ui.confirm) { const c = document.querySelector('[data-act="del-project"], [data-act="wipe"]'); if (c) c.focus(); }
}
```

Para la papelera de Inicio y «Borrar…» de Ajustes basta con la última línea: el foco pasa al botón de confirmación. Al cancelar (`confirm-no`), volver a `[data-act="ask"][data-what="…"]`; guardar `ui._askFrom = el.dataset.what` en el caso `ask`.

Paleta (`renderPalette`, `07-events.js`):
- Guardar `ui._palReturn = document.activeElement` al abrir y llamar `ui._palReturn?.focus()` al cerrar (Esc, clic en overlay, `pal-run`).
- `role="dialog" aria-modal="true"`; patrón combobox: `#pal-q` con `role="combobox" aria-expanded="true" aria-controls="pal-list" aria-activedescendant="pal-${ui.paletteIdx}"`, `#pal-list` con `role="listbox"`, cada `.pal-item` con `role="option" aria-selected`. Con `tabindex="-1"` en las opciones, Tab ya no se escapa.

Menú de proyectos: al abrir, enfocar el primer `.menu-item`; `role="menuitem"` en cada botón; ↑/↓ mueven el foco, Esc cierra y devuelve el foco a `.proj-switch`.

Pestañas (`.tabs`, `.help-nav`): `role="tab"` sin `aria-controls`, sin `tabpanel` y sin flechas. O se completa el patrón (`tabindex="-1"` en las no activas, ←/→ en `keydown`, `role="tabpanel"` en el cuerpo) o se quita `role="tab"` y se usa `aria-current="page"` como ya hace `.help-nav`.

Otros:
- El toast tiene `role="status" aria-live="polite"`: correcto, pero al no ocultarse nunca, los lectores de pantalla reciben cada mensaje sin que desaparezca el anterior visualmente.
- `.soa-row` con `role="button"` contiene `.code-chip` en el detalle, no en la fila: correcto.

## 3. UX por vista

Capturas en `shots/`. Nota: algunas capturas de página completa a 1440 px muestran la barra lateral desplegada encima del contenido; es un artefacto del redimensionado de Playwright durante la transición de la barra nueva (con la ventana fija, `#main` empieza en 264 px y la barra no tapa nada).

| Vista | Observaciones | Prioridad / arreglo |
|---|---|---|
| Global | El toast no se oculta (P0, arriba). | `.toast[hidden]{display:none}` |
| Cabecera móvil | `.crumbs` ocupa 56 px (62–118) y la píldora de categoría y el título largo («Declaración de Aplicabilidad») se montan bajo el botón de búsqueda (128 px). | P2: `@media (max-width:900px){ .crumbs .cat-pill{display:none} .crumb-cur{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap} }` |
| Inicio (sin proyecto) | Saludo y bloque «¿quién eres?» en tono informal (tabla). La tarjeta primaria tenía texto a 3,4:1 con la paleta anterior; con la nueva pasa. | Textos |
| Inicio (casos) | «72 medidas» en la tarjeta del caso es el número de medidas exigidas, no el total. | Fila 13 |
| Asistente | Paso 2: tabla de 9 columnas en móvil con desplazamiento horizontal; los campos ID y Responsable sin etiqueta. El paso 3 resume bien categoría, medidas y refuerzos. | §2.2 |
| Panel | «5 antes 2» no se entiende sin leer el código; «Residual real» afirma más de lo que calcula; «Próximas acciones» no está ordenado por fecha sino por prioridad. En 390 px las cuatro tarjetas KPI ocupan casi 800 px en una columna. | Filas 33–38; `@media (max-width:560px){ .kpi-grid{grid-template-columns:repeat(2,minmax(0,1fr))} }` |
| Panel (vacío) | Sin historial, el gráfico dice «La evolución aparecerá aquí»; no dice que hacen falta dos días con cambios. | Fila 31 |
| Categorización | Bien. Los selects de tipo sin nombre accesible. En 390 px la tabla se desplaza dentro de `.table-wrap` (correcto). | §2.2 |
| Análisis de riesgos | Registro de 9 columnas: a 1440 px la columna «Tratamiento» queda cortada (fecha `mm/dd/` visible a medias) y requiere desplazamiento. La fila derivada de hallazgo se distingue solo por color de fondo. | P2: `min-width` a `.tr-grid` o pasar responsable y plazo a una segunda línea; añadir texto «derivado de H-xx» (ya existe el badge, falta en filas sin badge). |
| SoA | Cabecera de lista en móvil con columnas ocultas que se cortan («DIMENSIÓN · NIVEL»); el separador de familia queda tapado. El detalle desplegado funciona bien a 1440 px. | P2: `@media (max-width:900px){ .soa-head{display:none} }` o añadir `s-dim`/`s-state` a los `<span>` de la cabecera |
| Compensatorias | Botón «Añadir» sin objeto. Tarjetas largas (9 textareas) sin contraer. | Fila 51; P3: `<details>` por ficha |
| Evidencia técnica | Antetítulo eslogan. Hallazgos cerrados con `opacity:.6` (contraste). | Filas 52–53; §2.2 |
| Plan de acción | Móvil roto: `grid-template-columns: 41.8px 0px 109px 127px`; el título de la acción sale palabra a palabra. Causa: la regla de ≤1180 px `.act-row > select, .act-row > .badge { grid-column: 4; }` sigue activa en ≤900 px, donde la rejilla es de 2 columnas. | P1: `@media (max-width:900px){ .act-row > select, .act-row > .badge { grid-column: auto; } .act-row .ar-main{grid-column:1 / -1} }` |
| Auditoría | Bien. Las tarjetas de severidad funcionan como filtro pero pierden el foco al pulsarlas. | §2.3 |
| Exportar | Bien. | — |
| Perfil | Dato falso sobre el plan de acción; «Ámbar»/«Amarillo» para el mismo color. | Filas 17–19 |
| Ajustes | Privacidad del asistente (P0). Interruptores sin nombre accesible. | Filas 20–24; §2.2 |
| Ayuda | En 390 px la pestaña Reglas provoca desplazamiento horizontal de toda la página (567 px): el cuerpo de la rejilla usa `1fr` y la tabla impone su ancho mínimo. | P2: `@media (max-width:900px){ .help-layout{grid-template-columns:minmax(0,1fr)} } .help-body{min-width:0}` |
| Paleta | Funciona con teclado; falta gestión de foco (§2.3). | §2.3 |
| Menú móvil | Abre y se cierra con el fondo; al abrir no mueve el foco al menú y Esc no lo devuelve al botón. | P2 |

Estados vacíos revisados: evolución, acciones abiertas, auditoría sin incidencias, SoA sin resultados, plan sin acciones, registro, activos, amenazas, salvaguardas, compensatorias, hallazgos, categorización, glosario sin resultados, paleta sin resultados. Todos existen; los textos que se cambian están en la tabla.

## 4. Cómo aplicar `copy-fixes.json`

```js
const fs = require('fs');
for (const f of require('./copy-fixes.json')) {
  const p = '/home/user/grc_ens_compliance_studio/' + f.file;
  const s = fs.readFileSync(p, 'utf8');
  if (s.split(f.old).length !== 2) throw new Error('no único: ' + f.file + ' ' + f.old.slice(0, 60));
  fs.writeFileSync(p, s.replace(f.old, () => f.new));
}
```

Aplicar en el orden del fichero. Si el árbol cambia antes de aplicar, `node gen-fixes.js` vuelve a validar cada subcadena y regenera el JSON. Después: `node app/build.js` y comprobar en modo EN que los textos cambiados se traducen.
