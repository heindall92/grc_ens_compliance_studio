---
title: "ENS Compliance Studio"
subtitle: "Conciliación automática entre categorización, análisis de riesgos MAGERIT, Declaración de Aplicabilidad del ENS y evidencia técnica"
author: "Yoandy Ramírez Delgado"
date: "Máster en Ciberseguridad & IA · Evolve Academy · Módulo de Gobierno, Riesgo y Cumplimiento · Septiembre de 2026"
lang: es-ES
toc-title: "Índice"
---

# Resumen

El Esquema Nacional de Seguridad (RD 311/2022) obliga a quien presta servicios al sector público a categorizar su sistema, a analizar sus riesgos y a declarar qué medidas del Anexo II aplica y cómo (Declaración de Aplicabilidad, SoA). En la práctica son tres documentos separados, mantenidos por personas distintas y con herramientas distintas, que se desalinean sin que nadie lo note. Además, la evidencia más dura que tiene una organización sobre su seguridad real, el informe de pentest, casi nunca se cruza con la SoA.

**ENS Compliance Studio** une las cuatro piezas en una herramienta. La categorización calcula en vivo el nivel exigido y los refuerzos de las 73 medidas. El análisis de riesgos usa exactamente las fórmulas de MAGERIT Lab y enlaza cada amenaza con las medidas que la tratan. Los hallazgos de pentest se convierten en riesgo MAGERIT. Un auditor de 27 reglas señala lo que no cuadra antes de que lo haga el auditor de certificación. La versión 2 la convierte en una herramienta de uso diario:

- varios proyectos, con un asistente de alta y la importación de la SoA en Excel;
- cinco casos de ejemplo de distinta categoría;
- plan de acción y evolución histórica;
- perfil, ajustes y centro de ayuda;
- buscador de comandos;
- diseño responsive;
- una capa de seguridad que trata como hostil cualquier fichero importado.

El proyecto incluye además una herramienta de línea de comandos que audita cualquier SoA en Excel, y 85 comprobaciones automáticas que demuestran que los cálculos coinciden con el material de clase y que la aplicación resiste ataques habituales.

Aplicada al caso docente TechServ tal como se entregó, la herramienta encuentra dos valores no válidos en la categorización, una cabecera corrupta y cuatro medidas que la SoA declara implantadas al 100 % mientras el análisis de riesgos valora sus salvaguardas como inmaduras. Al añadir seis hallazgos de pentest de ejemplo, aparecen 11 no conformidades mayores y los riesgos fuera de apetito pasan de 2 a 5.

# Contexto y problema

## El marco normativo

El RD 311/2022 establece que la seguridad de un sistema se gestiona a partir de tres decisiones encadenadas:

1. **Categorización (art. 40 y Anexo I).** Se valoran los activos esenciales (información y servicios) en cinco dimensiones: Disponibilidad, Integridad, Confidencialidad, Autenticidad y Trazabilidad, con nivel BAJO, MEDIO o ALTO. El nivel del sistema en cada dimensión es el máximo de sus activos, y la categoría (BÁSICA, MEDIA o ALTA) la marca el nivel más alto.
2. **Análisis y gestión de riesgos (art. 14 y medida [op.pl.1]).** En categoría ALTA se exige un análisis formal (refuerzo R2), habitualmente con la metodología MAGERIT v3 y la herramienta PILAR del CCN.
3. **Declaración de Aplicabilidad (art. 28).** Relación de las 73 medidas del Anexo II con su aplicabilidad, justificación, estado de implantación y evidencias, firmada por el Responsable de Seguridad. Cuando una medida no puede implantarse como dice la norma, puede sustituirse por medidas compensatorias justificadas (art. 28.3).

La regla que conecta la categorización con la SoA es mecánica: si una medida afecta a la «Categoría», se exige en el nivel de la categoría; si afecta a dimensiones concretas, en el nivel más alto de esas dimensiones. Cada nivel del Anexo II indica si la medida aplica y con qué refuerzos (por ejemplo, `+ [R1 o R2 o R3 o R4] + R5 + R6 + R7 + R8 + R9` para [op.acc.6] en nivel ALTO).

## Dónde se rompe

- **La categorización cambia y la SoA no.** El propio Excel del caso registra una recategorización de MEDIA a ALTA (v2.0). Cada cambio de nivel altera qué medidas y qué refuerzos se exigen; hacerlo a mano es propenso a errores.
- **La SoA y el análisis de riesgos no se hablan.** La SoA puede decir «Implantada 100 %» de una medida cuyo control el análisis de riesgos valora como «reproducible pero intuitivo». Las dos afirmaciones no pueden ser ciertas a la vez.
- **El pentest no llega a la SoA.** Un hallazgo crítico de autenticación convive con una SoA que declara [op.acc.6] implantada. El auditor de certificación lo encontrará; mejor que lo encuentre la organización antes.

# Material de partida

## La Declaración de Aplicabilidad (Excel)

El libro `DECLARACIÓN DE APLICABILIDAD (SoA) – ESQUEMA NACIONAL DE SEGURIDAD.xlsx` modela a TechServ Administración, S.L., empresa ficticia de 85 empleados que presta servicios TIC a tres consejerías. Tiene nueve hojas:

| Hoja | Contenido |
|---|---|
| Portada | Identificación, firmas, infraestructura, control de cambios |
| Ámbito y perfil | Base jurídica (art. 2.3), aplicación parcial, criterios de selección y regla de aplicación |
| Categorización | 8 activos esenciales valorados en D/I/C/A/T; resultado D=I=C=A=ALTO, T=MEDIO ⇒ categoría **ALTA** |
| SoA ENS | Las 73 medidas con 24 columnas: exigencia por nivel, refuerzos, aplicabilidad, justificación, medidas organizativas y técnicas, estado, evidencias, responsable y equivalencia ISO/IEC 27001:2022 |
| Refuerzos | 92 filas de refuerzos Rn con su exigibilidad |
| Medidas compensatorias | MC-01 a MC-04 (componentes certificados, inundación, cifrado hardware, cifrado de soportes) |
| Resumen | Indicadores por fórmula: 72 medidas aplicables, 1 no aplicable, 66 implantadas, 6 parciales, grado medio 98,9 % |
| Texto Anexo II | Texto normativo de cada medida y sus refuerzos |
| Leyenda | Valores permitidos y convenciones |

## MAGERIT Lab (HTML)

`magerit-lab.html` es una aplicación docente que recorre los siete pasos del método MAGERIT v3: criterios de valoración, activos, amenazas, riesgo inherente, salvaguardas, riesgo residual y plan de tratamiento. Su modelo de cálculo es:

- **Impacto** = valor del activo (0–10) × degradación de la amenaza (%), redondeado; se clasifica en B (1–2), M (3–5), A (6–8) y MA (9–10).
- **Riesgo** = matriz 5×5 de impacto por probabilidad (MB–MA).
- **Eficacia de una salvaguarda** = reducción declarada × factor de madurez (L0 = 0; L1 = 0,1; L2 = 0,3; L3 = 0,5; L4 = 0,7; L5 = 1). Varias salvaguardas se combinan como 1 − Π(1 − eficacia).
- **Riesgo residual**: se reduce la probabilidad y el impacto con esas eficacias y se vuelve a la matriz.

Trae un caso TechServ con 4 activos, 14 amenazas y 12 salvaguardas.

## Lo que se ve al cruzarlos

El Excel cita como análisis de riesgos de referencia el «AR-2026-01 (MAGERIT v3 / PILAR)», que es justo lo que modela MAGERIT Lab. Pero ninguno de los dos ficheros sabe del otro: el laboratorio no conoce las 73 medidas del ENS y el Excel no contiene el análisis que cita. Esa desconexión es el núcleo de este proyecto.

Además, la lectura detallada del material revela incidencias reales, que la herramienta detecta de forma automática:

1. En la hoja Categorización, la disponibilidad de S-01 y S-04 contiene el valor `'m'` en lugar de BAJO, MEDIO o ALTO. La fórmula del libro lo ignora; no cambia el resultado porque I-04 ya es ALTO, pero es un error de datos que un auditor señalaría.
2. La cabecera de la columna O de la hoja SoA contiene texto pegado por accidente («Medidas ORGANIZATIVAS implantadasPortal de firma de normativas…»).
3. La SoA declara implantadas al 100 % [mp.com.2], [mp.per.3], [mp.per.4] y [op.acc.3], mientras que MAGERIT Lab valora en L2 las salvaguardas equivalentes (cifrado, formación y segregación de tareas).

# Objetivos

1. Calcular de forma automática el nivel exigido, la exigencia y los refuerzos de las 73 medidas a partir de la categorización, con resultados idénticos a los del Excel.
2. Reproducir el análisis de riesgos de MAGERIT Lab con resultados idénticos y enlazar cada amenaza y cada salvaguarda con las medidas del ENS.
3. Convertir hallazgos técnicos (pentest, escaneo, phishing simulado) en riesgo MAGERIT y en contraste contra la SoA.
4. Auditar la coherencia de la SoA con reglas explícitas, trazables a la norma, con severidad y acción recomendada.
5. Exportar una SoA en Excel que respete la estructura del original y añada la trazabilidad.
6. Ofrecer una herramienta de línea de comandos para auditar cualquier SoA en Excel, integrable en un flujo de revisión documental.
7. Demostrar todo lo anterior con pruebas automáticas reproducibles.

# Diseño de la solución

## Arquitectura

```
                 ┌───────────────────────────── app/dist/ens-compliance-studio.html ──┐
 data/*.json ──► │  ENS_DATA (Anexo II, catálogos MAGERIT, tablas de trazabilidad,      │
 (extraídos del  │            caso TechServ)                                            │
  Excel y del    │  engine.js  ── categorización · nivel exigido · MAGERIT · SoA ·      │
  laboratorio)   │               hallazgos→riesgo · auditor (27 reglas)   ◄── tests Node │
                 │  app.js     ── interfaz · edición · exportación .xlsx/.md/.json/.csv │
                 └────────────────────────────────────┬─────────────────────────────────┘
                                                      │ exporta SoA .xlsx
                                                      ▼
                           auditor/ens_soa_audit.py (Python, independiente) ◄── tests pytest
```

- **`engine.js`** es un módulo puro, sin acceso al DOM. Se ejecuta igual en el navegador y en Node, lo que permite probarlo contra el material del profesor.
- **`app.js`** es la interfaz, en JavaScript sin frameworks. El estado se guarda en el navegador y se exporta o importa como JSON.
- **`build.js`** genera un único fichero HTML autocontenido. Hay dos variantes: una autónoma, que funciona sin conexión y lleva embebida la librería de Excel, y otra para publicarla como página web alojada.
- **`ens_soa_audit.py`** es una segunda implementación, en Python y escrita por separado, de las reglas documentales del auditor. Solo depende de `openpyxl`.

## Modelo de datos

| Entidad | Origen | Campos principales |
|---|---|---|
| Activo esencial | Excel · Categorización | id, tipo, nombre, responsable, D/I/C/A/T |
| Medida (Anexo II) | Excel · Texto Anexo II | código, dimensiones, exigencia BAJO/MEDIO/ALTO, texto, ISO 27001 |
| Declaración SoA | Excel · SoA ENS | aplica, estado, %, evidencias, responsable, org./téc., MC, observaciones |
| Refuerzo | Excel · Refuerzos | medida, Rn, exigible, implementación |
| Medida compensatoria | Excel · Medidas compensatorias | id, medida sustituida, riesgo, definición, validación, mantenimiento, aprobación |
| Activo MAGERIT | MAGERIT Lab + ampliación | id, tipo, valoración 0–10, activos esenciales que soporta |
| Amenaza | MAGERIT Lab + ampliación | id, activo, código MAGERIT, probabilidad, degradación por dimensión |
| Salvaguarda | MAGERIT Lab + ampliación | código, madurez L0–L5, reducción de probabilidad e impacto, amenazas que cubre |
| Hallazgo técnico | Nuevo | id, título, categoría, CVSS, activo, estado |

El caso MAGERIT se amplía con cuatro activos (CPD principal, cortafuegos del CPD de respaldo, túnel IPsec y cintas LTO) y con los riesgos R-034, R-051, R-062 y R-070, que son los que citan las medidas compensatorias MC-01 a MC-04 del Excel. Así, cada medida compensatoria queda enlazada con un riesgo real del análisis y muestra su nivel residual.

## Trazabilidad

El enlace entre MAGERIT y el ENS se apoya en tres tablas (`data/mapping.json`):

- **Amenaza → medidas ENS** (53 amenazas del catálogo). Ejemplo: [A.5] Suplantación de la identidad → op.acc.1, op.acc.5, op.acc.6, mp.info.3.
- **Salvaguarda → medidas ENS** (42 salvaguardas). Ejemplo: H.IA Identificación y autenticación → op.acc.1, op.acc.5, op.acc.6.
- **Categoría de hallazgo → amenaza, degradación, salvaguarda y medidas ENS** (14 categorías con su CWE). Ejemplo: Inyección SQL (CWE-89) → [A.15], degradación I 100 % · C 100 %, salvaguarda S.www, medidas mp.s.2, mp.sw.1, op.exp.4.

Las 73 medidas del Anexo II están cubiertas por al menos una entrada, y la integridad de los códigos se verifica automáticamente. Las tablas son criterio del autor, razonado a partir de los catálogos de MAGERIT v3 (Libro II) y de la guía CCN-STIC 804. Se documentan como tales: en un sistema real, las debe revisar el analista.

# Experiencia de uso (versión 2)

La herramienta está pensada para dos públicos: quien la evalúa en cinco minutos (un tribunal o un reclutador) y quien la usa a diario (un responsable de seguridad o un consultor GRC).

- **Inicio.** Tres caminos:
  - *Empezar con mis datos*: asistente en tres pasos (organización, activos esenciales y punto de partida) que termina con la categoría y las medidas exigidas ya calculadas.
  - *Importar mi SoA*: la plantilla de 73 medidas en Excel.
  - *Explorar un caso*.
- **Cinco casos de ejemplo**, cada uno con una historia distinta para que el auditor encuentre problemas distintos:

| Caso | Categoría | Qué descubre el auditor |
|---|---|---|
| TechServ Administración | ALTA | La SoA y el análisis de riesgos se contradicen; 11 NC por evidencia técnica; celdas 'm' |
| Ayuntamiento de Valdemora | MEDIA | Exclusión indebida de op.nub.1 (usa Microsoft 365), refuerzo R5 de op.acc.6 sin contemplar, medida sin evidencias ni responsable |
| Universidad del Litoral | MEDIA | Ocho medidas parciales bien trazadas con PTR, compensatoria sin aprobar, porcentaje incoherente con el estado |
| Hospital Comarcal Sierra Norte | ALTA | Medida marcada como compensada sin ficha, refuerzo R5 de op.exp.8 sin contemplar tras subir la trazabilidad, copias sin inmutabilidad |
| CitaFácil Cloud | BÁSICA | SoA sin firmar y sin revisar en más de un año, sobrecumplimiento sin justificar, aislamiento entre clientes roto |

- **Modo demo explícito.** Un caso abierto muestra un aviso con dos salidas: restablecerlo o empezar con datos propios. Los casos se pueden ocultar o cerrar desde Ajustes.
- **Plan de acción.** Las no conformidades, los riesgos por encima del apetito y los hallazgos abiertos se convierten en tareas con prioridad, responsable, fecha y estado. Cuando su origen desaparece (por ejemplo, un retest correcto), la acción se marca como *verificada* sin intervención manual.
- **Uso diario.**
  - Perfil (autor de los informes).
  - Ajustes: umbrales CVSS, madurez mínima de AR-01, reglas activables, tema, cuatro acentos y densidad.
  - Centro de ayuda con primeros pasos, flujo, glosario, reglas, atajos y preguntas frecuentes.
  - Buscador de comandos (Ctrl + K) y atajos de teclado.
  - Evolución histórica de las no conformidades.
  - Copia de seguridad completa.
- **Diseño.** Sistema de diseño propio basado en *tokens*:
  - tema claro y oscuro;
  - bordes redondeados y tipografía Geist;
  - iconografía dibujada a medida;
  - color semántico reservado para estados;
  - diseño responsive con menú en cajón y sin desbordamiento horizontal a 390 px.

# Seguridad

Una herramienta de cumplimiento maneja información sensible: riesgos y vulnerabilidades abiertas. Por eso el diseño parte de dos principios: **ningún dato sale del navegador** y **todo fichero importado se trata como hostil**.

| Vector | Defensa |
|---|---|
| XSS | Toda salida escapada; listas blancas para lo que acaba en clases o atributos; nunca se inserta HTML procedente de datos |
| Prototype pollution | Claves peligrosas eliminadas al parsear y bloqueadas en las rutas de escritura; `Object.prototype` congelado (mitiga además la CVE-2023-30533 de SheetJS CE al leer libros manipulados) |
| Datos fuera de esquema | Validación de cada campo: tipos, rangos, enumeraciones, identificadores e integridad referencial |
| CSV injection | Celdas que empiezan por `= + - @` prefijadas con `'` |
| Denegación de servicio | Límites de tamaño de fichero, de hojas, filas, columnas y longitud de campo |
| Exfiltración | CSP estricta en la versión autónoma (`connect-src 'none'`, sin formularios, marcos ni *workers*) |
| Manipulación del almacenamiento local | Revalidación del espacio de trabajo y de los proyectos en cada carga |

Las pruebas de extremo a extremo incluyen ataques reales contra estas defensas (ver «Verificación»).

# Metodología de cálculo

## Nivel exigido de cada medida

```
nivel(d)       = máx. de la valoración de los activos esenciales en d
                 (los valores no válidos se ignoran y se reportan)
categoría      = ALTA si algún nivel es ALTO
                 MEDIA si alguno es MEDIO; si no, BÁSICA
nivel exigido  = nivel de la categoría, si la medida afecta a «Categoría»
                 máx. de nivel(d) en sus dimensiones, en otro caso
exigencia      = Anexo II [medida][nivel exigido]
                 («n.a.», «aplica», «+ R1 + [R2 o R3]»…)
```
La exigencia se descompone en refuerzos obligatorios y grupos alternativos. En TechServ salen 78 refuerzos obligatorios y 9 en grupos alternativos, las mismas cifras que calcula la hoja Resumen del Excel.

## Riesgo

Se usan las fórmulas de MAGERIT Lab sin cambios (ver la sección «Material de partida»). La única diferencia es de modelo: en el laboratorio una salvaguarda cubre todas las amenazas con el mismo código, y aquí cubre una lista explícita de amenazas. El caso semilla reproduce las coberturas del laboratorio, y los tests demuestran que los resultados son idénticos.

## Del hallazgo técnico al riesgo

| CVSS | Probabilidad MAGERIT |
|---|---|
| ≥ 9,0 | MA (a diario) |
| 7,0 – 8,9 | A (mensualmente) |
| 4,0 – 6,9 | M (una vez al año) |
| < 4,0 | B (cada varios años) |

Si el activo ya tenía esa amenaza en el análisis, el hallazgo eleva su probabilidad y su degradación al máximo de ambos: la evidencia técnica demuestra que la estimación era optimista. Si no la tenía, aflora un riesgo nuevo (`R-H-xx`), mitigado por las salvaguardas del tipo indicado. La vista de riesgos permite comparar el análisis «tal como se aprobó» con el análisis «con evidencia técnica».

# El auditor

Cada regla tiene un identificador estable, una severidad (según la terminología de la CCN-STIC 802: no conformidad mayor, no conformidad menor u observación), una referencia normativa y una acción recomendada.

| Regla | Severidad | Qué comprueba |
|---|---|---|
| CAT-01 | NC menor | Valor de categorización no válido; indica si altera o no el resultado |
| CAT-02 | NC mayor | Activo esencial sin valorar |
| SOA-01 | NC mayor | Exclusión indebida: medida exigida declarada NO aplicable |
| SOA-02 | Observación | Medida no exigida declarada aplicable (sobrecumplimiento) |
| SOA-03 | NC mayor | Medida del Anexo II ausente de la SoA |
| SOA-04 / SOA-05 | NC menor | Medida aplicable sin evidencias / sin responsable |
| SOA-06 | NC menor | Implantación parcial sin acción PTR ni medida compensatoria |
| SOA-07 | NC menor | Porcentaje incoherente con el estado |
| SOA-08 | NC menor | Exclusión sin justificar |
| SOA-09 *(CLI)* | NC mayor | Nivel exigido declarado distinto del calculado |
| REF-01 | NC mayor | Refuerzo exigido por el nivel no contemplado |
| REF-02 | NC menor | Grupo de refuerzos alternativos sin opción elegida |
| REF-03 | Observación | Refuerzo marcado como exigible que ya no lo es |
| MC-01 | NC mayor | Medida compensada sin registro de medida compensatoria |
| MC-02 | NC menor | Ficha de medida compensatoria incompleta |
| MC-03 | Observación | Medida compensatoria no reflejada en la SoA |
| MC-04 | NC menor | Riesgo citado en la medida compensatoria inexistente en el AR |
| AR-01 | NC mayor | SoA «Implantada 100 %» con salvaguarda del AR en madurez ≤ L2 |
| AR-02 | NC menor | Riesgo fuera de apetito sin tratamiento o aceptado sin aprobación formal |
| AR-03 | Observación | Tratamiento sin plazo o responsable |
| AR-04 | Observación | Medidas exigidas sin riesgo vinculado en el AR |
| AR-05 | Observación | Activo del AR sin vínculo con activos esenciales |
| PT-01 | NC mayor | Hallazgo abierto con CVSS ≥ 7 contra una medida «Implantada 100 %» |
| PT-02 | NC menor | Hallazgo abierto con CVSS 4–6,9 contra una medida «Implantada 100 %» |
| DOC-01 / DOC-02 | NC menor | SoA sin firma / sin revisar en los últimos 12 meses |
| STR-01…03 *(CLI)* | Obs. / NC | Cabecera alterada, medida duplicada o desconocida, error de fórmula |

# Resultados sobre el caso TechServ

## Estado de partida

| Indicador | Valor | Coincide con el Excel |
|---|---|---|
| Categoría | ALTA (D=I=C=A=ALTO, T=MEDIO) | Sí |
| Medidas exigidas / no exigidas | 72 / 1 ([mp.info.4]) | Sí |
| Implantadas / parciales / compensadas | 66 / 6 / 4 | Sí |
| Grado medio de implantación | 98,9 % | Sí |
| Refuerzos obligatorios / en grupos alternativos | 78 / 9 | Sí |

## Lo que encuentra el auditor

**Con la documentación tal como está (sin evidencia técnica):** 4 NC mayores (AR-01), 2 NC menores (CAT-01) y 1 observación (AR-04: 25 medidas exigidas sin riesgo vinculado, porque el AR modela 8 activos y la SoA cubre todo el sistema).

**Con los 6 hallazgos abiertos del pentest de ejemplo:** 15 NC mayores, 6 NC menores y 1 observación.

- Las 11 PT-01 afectan a op.acc.5, op.acc.6, op.exp.2, op.exp.4, mp.s.1, mp.s.2, mp.sw.2, mp.per.3 y mp.per.4.
- Los riesgos por encima del apetito (M) pasan de 2 (R-005 y R-008) a 5. Se suman R-002, que la inyección SQL eleva de probabilidad B a MA y que estaba aceptado, y dos riesgos nuevos, R-H-04 (credenciales por defecto en iDRAC) y R-H-06 (firmware del cortafuegos de respaldo, justo el equipo que ya cubre la MC-01).
- Solo **55 de las 66** medidas declaradas «Implantada 100 %» quedan libres de no conformidades mayores.

## Escenarios de recategorización

| Escenario | Categoría | Medidas exigidas | Refuerzos | Efecto en el auditor |
|---|---|---|---|---|
| Base | ALTA | 72 | 78 + 9 | — |
| I-02 · T = ALTO | ALTA (T=ALTO) | 73 | 79 + 9 | SOA-01 en [mp.info.4] (los sellos de tiempo pasan a ser exigibles) y REF-01 en [op.exp.8] R5 |
| Todo ALTO → MEDIO | MEDIA | 68 | 42 + 12 | 36 REF-03 (refuerzos que sobran), 4 SOA-02 (medidas que ya no se exigen) y REF-01 en [op.pl.1] R1 (el nivel MEDIO pide análisis semiformal y la tabla solo recoge el formal) |

Este último caso muestra una limitación deliberada: el auditor no da por hecho que un refuerzo superior cubre otro inferior. Lo señala y deja la decisión al analista.

# Verificación

| Suite | Herramienta | Pruebas | Qué demuestra |
|---|---|---|---|
| Motor | `node --test` | 15 | Paridad con el Excel en las 73 medidas (nivel, exigencia, aplicabilidad) y en los indicadores del Resumen; **paridad con MAGERIT Lab ejecutando el JavaScript original del profesor** en un entorno aislado y comparando el riesgo inherente y residual de las 14 amenazas; escenarios de recategorización, medidas compensatorias y evidencia técnica |
| Aplicación | Playwright + Chromium | 61 | Flujo completo: perfil, los casos de ejemplo, todas las vistas, recategorización en vivo, edición de la SoA, plan de acción, asistente de nuevo proyecto, **importación del Excel del profesor** (vuelven a salir ALTA, 72 medidas exigidas, 66 implantadas y las 2 celdas 'm'), importación de hallazgos, exportaciones, ajustes, ayuda, buscador, copia de seguridad y restauración, responsive a 390 y 768 px. **Pruebas de ataque**: proyecto con cargas XSS y `__proto__`, normalización de datos fuera de esquema, CSV injection, `localStorage` manipulado y ficheros sobredimensionados |
| Auditor CLI | pytest | 9 | Resultado exacto sobre el Excel original; mutaciones controladas (recategorización, fila vacía, duplicado, evidencias vacías, estado parcial sin PTR, compensatoria sin registro, SoA caducada y sin firma); códigos de salida; **paridad Python ↔ JavaScript** sobre un libro exportado por la app con incidencias forzadas |

La paridad entre implementaciones es la prueba más exigente. La app exporta una SoA recategorizada y con una medida sin evidencias ni responsable. La CLI en Python lee solo el Excel y tiene que encontrar exactamente las mismas incidencias documentales que la app escribió en su hoja «Auditoría».

Durante el desarrollo, las pruebas end-to-end encontraron un defecto real: la edición de campos de la SoA no se guardaba porque los códigos de las medidas contienen puntos (`op.acc.6`) y la ruta de los datos se partía mal. Se corrigió y quedó cubierto por una prueba de regresión.

# Uso de inteligencia artificial

Cuando la herramienta se publica en una plataforma que ofrece un modelo de lenguaje, el asistente de análisis puede:

1. **Proponer amenazas** para un activo, eligiéndolas solo del catálogo MAGERIT filtrado por el tipo de activo y descartando las ya identificadas. La respuesta se valida: los códigos tienen que existir en el catálogo, la probabilidad tiene que estar en la escala y la degradación se acota a múltiplos de 10 entre 0 y 100.
2. **Redactar la justificación** de aplicabilidad de una medida a partir de su nivel, su exigencia, los riesgos que trata y lo que la organización ha implantado.

Siguiendo los principios de ISO/IEC 42001 (supervisión humana y transparencia), nada entra en el análisis ni en la SoA sin una acción explícita de la persona («Añadir», «Usar este texto»). La interfaz recuerda que la SoA la firma el Responsable de Seguridad. En la versión 2 el asistente está **desactivado por defecto**: se activa en Ajustes y, cuando no está disponible, desaparece sin afectar al resto de la herramienta.

# Limitaciones y trabajo futuro

- **Tablas de correspondencia.** Son criterio del autor. Una evolución natural es contrastarlas con la guía CCN-STIC 825 y con el cuestionario de verificación CCN-STIC 808.
- **Importación desde PILAR.** Hoy el análisis de riesgos se introduce en la herramienta; leer las exportaciones de PILAR cerraría el círculo en un entorno real.
- **Equivalencia de refuerzos.** Modelar qué refuerzos cubren a otros evitaría falsos positivos como el de [op.pl.1] R1.
- **Informes de escáneres.** Importadores para Nessus, OpenVAS o Burp llevarían la conversión hallazgo → riesgo a un flujo real.
- **Multiusuario.** El estado vive en el navegador de cada persona; para un equipo haría falta almacenamiento compartido con registro de cambios.
- **Otros marcos.** La columna ISO/IEC 27001:2022 ya está en el modelo; añadir NIS2 y el perfil de cumplimiento del CCN convertiría la herramienta en un mapa multinorma.

# Conclusiones

El ENS no falla por falta de medidas, sino por falta de coherencia entre los documentos que las justifican. Este proyecto demuestra que esa coherencia se puede comprobar de forma automática y reproducible. Sobre un caso preparado para docencia, y por tanto cuidado, la herramienta encuentra errores de datos, una contradicción sistemática entre la SoA y el análisis de riesgos y, en cuanto entra la evidencia técnica, una distancia considerable entre lo que se declara y lo que se puede defender ante un auditor.

Para un perfil que viene de la parte técnica (pentesting y respuesta a incidentes), el aprendizaje principal es que el hallazgo de un pentest no termina en el informe: su sitio natural es el análisis de riesgos y la Declaración de Aplicabilidad. Es ahí donde se convierte en una decisión de gestión.

# Referencias

- Real Decreto 311/2022, de 3 de mayo, por el que se regula el Esquema Nacional de Seguridad. BOE-A-2022-7191.
- MAGERIT v3. Metodología de Análisis y Gestión de Riesgos de los Sistemas de Información. Libros I (Método), II (Catálogo de elementos) y III (Guía de técnicas). Ministerio de Hacienda y Administraciones Públicas, 2012.
- CCN-STIC 802 (Auditoría del ENS), 803 (Valoración de los sistemas), 804 (Guía de implantación), 808 (Verificación del cumplimiento) y 825 (ENS e ISO/IEC 27001).
- ISO/IEC 27001:2022 e ISO/IEC 27002:2022. Seguridad de la información, ciberseguridad y protección de la privacidad.
- ISO/IEC 42001:2023. Sistemas de gestión de la inteligencia artificial.
- Material docente del módulo de GRC: *Declaración de Aplicabilidad (SoA) – Esquema Nacional de Seguridad* (caso TechServ) y *MAGERIT Lab v1.0*.

# Anexo A · Reproducir los resultados

```bash
node app/build.js                                          # genera la app
node --test tests/engine.test.js                           # 15 tests del motor
python3 tests/e2e_app.py                                   # 61 comprobaciones en navegador y seguridad
python3 -m pytest -q tests/test_auditor.py                 # 9 tests del auditor CLI
python3 auditor/ens_soa_audit.py data/SoA_TechServ_original.xlsx --md informe.md
```
