# ENS Compliance Studio

**Conciliación automática entre la categorización, el análisis de riesgos MAGERIT, la Declaración de Aplicabilidad del ENS y la evidencia técnica.**

Proyecto del módulo de GRC · Máster en Ciberseguridad & IA (Evolve Academy) · Yoandy Ramírez Delgado · septiembre 2026.
Parte de los dos materiales del caso docente **TechServ** (ficticio): la SoA en Excel y el laboratorio *MAGERIT Lab*.

---

## El problema

En una organización sujeta al Esquema Nacional de Seguridad (RD 311/2022) hay tres documentos que deberían contar la misma historia y casi nunca lo hacen:

1. La **categorización** del sistema (art. 40, Anexo I), que fija qué nivel se exige a cada medida.
2. El **análisis de riesgos** (art. 14, [op.pl.1]), normalmente en PILAR o en una hoja MAGERIT.
3. La **Declaración de Aplicabilidad** (art. 28), que dice qué medidas se aplican, cómo y con qué evidencias.

Viven en ficheros distintos, los mantienen personas distintas y se desalinean en silencio. Y aparece un cuarto documento que ninguno de los tres mira: **el informe de pentest**.

## La solución

| Pieza | Qué hace |
|---|---|
| **App web** (`app/`) | Categorización en vivo → nivel exigido y refuerzos de las 73 medidas → análisis MAGERIT con las fórmulas de MAGERIT Lab → SoA editable con trazabilidad riesgo↔medida → registro de medidas compensatorias → hallazgos de pentest convertidos en riesgo → **auditor de 26 reglas** → exportación a Excel con la estructura de la SoA original. Un único `.html`, sin servidor. |
| **Auditor CLI** (`auditor/`) | `ens_soa_audit.py`: audita **cualquier** SoA en Excel con la plantilla TechServ, recalcula de forma independiente el nivel exigido y aplica las mismas reglas documentales (mismos identificadores) que la app. Apto para CI (`--fail-on mayor`). |
| **Pruebas** (`tests/`) | 54 comprobaciones automáticas: paridad con el Excel del profesor, paridad con el código original de MAGERIT Lab, paridad Python↔JavaScript y prueba end-to-end en navegador. |
| **Documentación** (`docs/`) | Memoria del proyecto (.docx y .md) y guion de la defensa. |

## Lo que encuentra en el caso TechServ

Sobre los datos del profesor, sin tocar nada:

- **2 celdas no válidas** en la categorización (`'m'` en la disponibilidad de S-01 y S-04). No cambian la categoría porque I-04 ya es ALTO, pero son un error de calidad de datos.
- **1 cabecera corrupta** en la hoja SoA (texto pegado en la columna O).
- **4 incoherencias SoA ↔ análisis de riesgos**: la SoA declara *Implantada 100 %* medidas cuyas salvaguardas el AR valora en madurez L2 (mp.com.2, mp.per.3, mp.per.4, op.acc.3).
- Con los 6 hallazgos de pentest de ejemplo: **11 NC mayores por evidencia técnica** (medidas «implantadas» con vulnerabilidades abiertas) y los riesgos fuera de apetito pasan de **2 a 5**.
- Solo **55 de las 66** medidas «implantadas al 100 %» sobreviven sin una no conformidad mayor.

## Uso rápido

```bash
# App: abrir en el navegador (funciona sin conexión; la librería de Excel va embebida)
open app/dist/ens-compliance-studio.html

# Auditor CLI (requiere openpyxl)
python3 auditor/ens_soa_audit.py data/SoA_TechServ_original.xlsx --md informe.md --json informe.json
python3 auditor/ens_soa_audit.py mi_SoA.xlsx --fail-on mayor   # código 2 si hay NC mayores

# Reconstruir la app desde las fuentes
node app/build.js

# Todas las pruebas
./run_tests.sh
```

## Estructura

```
ens-compliance-studio/
├── app/
│   ├── src/engine.js        motor de cálculo puro (categorización, MAGERIT, SoA, auditor) — se prueba en Node
│   ├── src/app.js           interfaz (vanilla JS)
│   ├── src/styles.css       diseño (tema claro/oscuro, responsive)
│   ├── src/index.html       plantilla
│   ├── build.js             genera dist/ (versión autónoma + versión para claude.ai)
│   ├── vendor/              xlsx-js-style 1.2.0 (Apache-2.0) para la exportación a Excel
│   └── dist/                ens-compliance-studio.html (autónoma), seed_techserv.json, ens_data.json
├── auditor/
│   ├── ens_soa_audit.py     CLI de preauditoría
│   └── anexo_ii.json        niveles y refuerzos de las 73 medidas del Anexo II
├── data/
│   ├── SoA_TechServ_original.xlsx   material del profesor (sin modificar)
│   ├── magerit-lab-original.html    material del profesor (sin modificar)
│   ├── mapping.json                 tablas de trazabilidad amenaza/salvaguarda/hallazgo ↔ medida ENS
│   ├── techserv_magerit.json        AR del caso ampliado (8 activos, 21 amenazas, 18 salvaguardas, 7 hallazgos)
│   ├── ens_techserv.json            extracción estructurada del Excel
│   └── magerit_catalogos.json       catálogos extraídos de MAGERIT Lab
├── tests/
│   ├── engine.test.js       11 tests del motor (node --test)
│   ├── test_auditor.py      9 tests de la CLI (pytest)
│   ├── e2e_app.py           34 comprobaciones en navegador (Playwright)
│   └── artifacts/           capturas y ficheros exportados por la última ejecución
├── docs/
│   ├── Memoria_ENS_Compliance_Studio.docx
│   ├── MEMORIA.md
│   └── GUION_DEFENSA.md
└── run_tests.sh
```

## Decisiones de diseño

- **Un solo fichero, cero servidor.** La app es un `.html` que se abre con doble clic, también sin conexión. Los datos no salen del navegador (se guardan en `localStorage` y se exportan a JSON).
- **Motor separado de la interfaz.** `engine.js` no toca el DOM: el mismo código corre en el navegador y en los tests de Node.
- **Fidelidad antes que originalidad.** Las fórmulas de riesgo son las de MAGERIT Lab y se verifica ejecutando el JavaScript original del profesor contra el motor. El nivel exigido de las 73 medidas se verifica contra los valores calculados por el propio Excel.
- **Dos implementaciones del auditor.** JavaScript (app) y Python (CLI) se escribieron por separado y se comprueba que dan el mismo resultado sobre el mismo libro. Si una se equivoca, la otra lo delata.
- **La IA propone, la persona firma.** En claude.ai la app puede sugerir amenazas MAGERIT para un activo y redactar justificaciones de aplicabilidad; todo pasa por revisión y aceptación explícita.

## Limitaciones conocidas

- Las tablas de correspondencia amenaza/salvaguarda ↔ medida ENS (`data/mapping.json`) son criterio del autor, razonado a partir de MAGERIT v3 y la CCN-STIC 804. Para un sistema real hay que revisarlas.
- El auditor no infiere equivalencias entre refuerzos (p. ej. que R2 «formal» de [op.pl.1] cubre R1 «semiformal»): lo marca y deja la decisión al analista.
- Hereda una particularidad de MAGERIT Lab: un impacto de 1–2 se clasifica como B (nunca MB). Se mantiene para conservar la paridad con el material de clase.
- No sustituye a PILAR ni a la auditoría formal del art. 31; es una herramienta de preauditoría y docencia.

## Licencia y datos

Código: MIT. `xlsx-js-style`: Apache-2.0 (ver `app/vendor/`). Todos los datos de TechServ son ficticios y de uso docente. Texto normativo: RD 311/2022 (BOE-A-2022-7191).
