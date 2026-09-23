<h1 align="center">ENS Compliance Studio</h1>

<p align="center">
  <b><i>Categorización, análisis de riesgos MAGERIT, Declaración de Aplicabilidad y preauditoría del ENS — en un solo fichero.</i></b>
</p>

<p align="center">
  <a href="LICENSE"><img alt="License MIT" src="https://img.shields.io/badge/LICENSE-MIT-4169A1?style=flat"/></a>
  <img alt="Node 18+" src="https://img.shields.io/badge/Node-18%2B-339933?style=flat&logo=node.js&logoColor=white"/>
  <img alt="Python 3.10+" src="https://img.shields.io/badge/Python-3.10%2B-3776AB?style=flat&logo=python&logoColor=white"/>
  <img alt="ENS RD 311/2022" src="https://img.shields.io/badge/ENS-RD%20311%2F2022-8B1142?style=flat"/>
  <img alt="73 medidas Anexo II" src="https://img.shields.io/badge/73-MEDIDAS%20ANEXO%20II-CC8F00?style=flat"/>
  <img alt="85 comprobaciones" src="https://img.shields.io/badge/85-COMPROBACIONES-2E8B57?style=flat"/>
  <img alt="Sin servidor" src="https://img.shields.io/badge/SIN%20SERVIDOR-1A73E8?style=flat"/>
</p>

<p align="center">
  <img src="docs/img/panel.png" alt="Panel de conformidad" width="820"/>
</p>

> Proyecto de fin de máster · Máster en Ciberseguridad & IA (Evolve Academy) · Módulo de Gobierno, Riesgo y Cumplimiento
> Autor: **Yoandy Ramírez Delgado** · Septiembre de 2026 · Versión 2.0.1

---

## Índice

- [Por qué existe](#por-qué-existe)
- [Qué hace](#qué-hace)
- [Arranque rápido](#arranque-rápido)
- [Lo que encuentra en el caso de clase](#lo-que-encuentra-en-el-caso-de-clase)
- [Seguridad](#seguridad)
- [Calidad](#calidad)
- [Estructura](#estructura)
- [Limitaciones](#limitaciones)
- [Licencia](#licencia)
- [Mantenedor](#mantenedor)

---

## <img src="docs/assets/icons/route.svg" width="20" height="20" valign="middle"/> Por qué existe

Quien presta servicios al sector público en España tiene que cumplir el ENS (RD 311/2022), y para eso mantiene tres documentos que deberían contar la misma historia:

1. La **categorización** del sistema (art. 40), que fija el nivel exigido a cada una de las 73 medidas del Anexo II.
2. El **análisis de riesgos** (art. 14), normalmente con MAGERIT y PILAR.
3. La **Declaración de Aplicabilidad (SoA)** (art. 28), que dice qué medidas se aplican, cómo y con qué evidencias.

Viven en ficheros distintos, los mantienen personas distintas y se desalinean sin que nadie lo note. Hay además un cuarto documento que casi nunca se cruza con los otros tres: **el informe de pentest**.

ENS Compliance Studio los concilia y señala lo que no cuadra antes de que lo haga el auditor de certificación.

## <img src="docs/assets/icons/list-checks.svg" width="20" height="20" valign="middle"/> Qué hace

| | |
|---|---|
| **Categorización en vivo** | Valora los activos esenciales y obtén al momento la categoría, el nivel exigido, la exigencia y los refuerzos de las 73 medidas. |
| **Análisis de riesgos MAGERIT** | Activos, amenazas, salvaguardas con madurez L0–L5, riesgo inherente y residual, apetito y tratamiento. Usa las mismas fórmulas que el MAGERIT Lab de clase, verificadas contra su código original. |
| **SoA viva** | Las 73 medidas con el texto del Anexo II, la equivalencia con ISO/IEC 27001:2022 y, para cada medida, los riesgos que trata, las salvaguardas que la implementan, los hallazgos abiertos y lo que objeta el auditor. |
| **Evidencia técnica** | Los hallazgos de pentest, escaneos y phishing (CSV o JSON) se convierten en riesgo MAGERIT y se contrastan con lo declarado. |
| **Auditor de 27 reglas** | No conformidades mayores y menores y observaciones, con referencia normativa y acción recomendada. Las reglas se pueden configurar. |
| **Plan de acción** | Las no conformidades, los riesgos fuera de apetito y los hallazgos se convierten en tareas con responsable y fecha. Cuando el origen desaparece, la tarea queda verificada. |
| **Proyectos propios** | Asistente en tres pasos, o importación directa de tu SoA en Excel. |
| **5 casos de ejemplo** | TechServ (ALTA), un ayuntamiento (MEDIA), una universidad (MEDIA), un hospital (ALTA) y un SaaS (BÁSICA), cada uno con problemas distintos que descubrir. |
| **Exportación** | SoA en Excel con la estructura de la plantilla y la trazabilidad añadida, informe de preauditoría en Markdown, plan de acción y registro de riesgos en CSV, y el proyecto en JSON. |
| **Hecha para el uso diario** | Buscador de comandos (Ctrl + K), atajos de teclado, perfil, ajustes, tema claro y oscuro con paneles translúcidos, seis acentos, interfaz en español e inglés, densidad compacta, centro de ayuda con glosario, copia de seguridad y diseño responsive. |
| **Auditor por línea de comandos** | `ens_soa_audit.py` audita cualquier SoA en Excel con la plantilla, apto para CI. |

<table><tr>
<td><img src="docs/img/soa.png" alt="Declaración de Aplicabilidad"></td>
<td><img src="docs/img/riesgos.png" alt="Análisis de riesgos"></td>
</tr><tr>
<td><img src="docs/img/nuevo_proyecto.png" alt="Nuevo proyecto"></td>
<td><img src="docs/img/ajustes_oscuro.png" alt="Ajustes en tema oscuro"></td>
</tr></table>

## <img src="docs/assets/icons/rocket.svg" width="20" height="20" valign="middle"/> Arranque rápido

```bash
# 1. Abrir la aplicación (sin instalar nada; funciona sin conexión)
open app/dist/ens-compliance-studio.html        # Windows: start app\dist\ens-compliance-studio.html

# 2. Auditar una SoA en Excel desde la terminal
pip install openpyxl
python3 auditor/ens_soa_audit.py data/SoA_TechServ_original.xlsx --md informe.md
python3 auditor/ens_soa_audit.py mi_SoA.xlsx --fail-on mayor      # código 2 si hay NC mayores
```

<details>
<summary><b>Desarrollo</b> — reconstruir desde las fuentes y correr la suite completa</summary>

```bash
# Reconstruir dist/ (Node ≥ 18, sin dependencias npm)
node app/build.js

# Entorno de pruebas (Node, Python 3.10+, pytest, Playwright)
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
playwright install chromium

# Ejecutar todo: build + motor + app en navegador + auditor CLI
./run_tests.sh
```

`run_tests.sh` reconstruye `dist/` y falla si queda desincronizado del `src/`, corre las 15 comprobaciones del motor (`node --test`), las 61 de la app en Playwright (incluidas las de ataque) y las 9 del auditor CLI (`pytest`).

</details>

## <img src="docs/assets/icons/bug.svg" width="20" height="20" valign="middle"/> Lo que encuentra en el caso de clase

Sobre el Excel y el MAGERIT Lab del profesor, tal cual se entregaron:

- **1 cabecera corrupta** en la hoja SoA (columna O). La disponibilidad de S-01 y S-04 viene abreviada como `m`: se lee como MEDIO y no cambia la categoría, porque I-04 ya es ALTO.
- **4 contradicciones entre la SoA y el análisis de riesgos**: medidas declaradas implantadas al 100 % cuyas salvaguardas el análisis valora en madurez L2.
- Con seis hallazgos de pentest de ejemplo: **11 no conformidades mayores** por evidencia técnica, los riesgos fuera de apetito pasan **de 2 a 5**, y solo **55 de 66** medidas «implantadas» quedan sin objeciones.

## <img src="docs/assets/icons/shield-check.svg" width="20" height="20" valign="middle"/> Seguridad

Se asume que cualquier fichero importado puede ser hostil. Resumen (detalle y proceso de reporte de vulnerabilidades en [SECURITY.md](SECURITY.md)):

- Validación por esquema de todo lo que entra: proyectos, copias, Excel, CSV, `localStorage` y respuestas del asistente. Se aplican listas blancas, límites de longitud y de tamaño, identificadores filtrados y números acotados.
- Salida siempre escapada. Nunca se inserta HTML procedente de datos.
- Protección contra prototype pollution: claves bloqueadas y `Object.prototype` congelado.
- Neutralización de fórmulas en CSV (CSV injection) y de HTML en los informes Markdown.
- CSP estricta en la versión autónoma: `connect-src 'none'`, es decir, la página no puede enviar datos a ningún sitio.
- Pruebas de ataque automatizadas: XSS, prototype pollution, fórmulas maliciosas, `localStorage` manipulado y ficheros sobredimensionados.

> **Riesgo residual conocido:** `app/vendor/xlsx.bundle.js` empaqueta una base SheetJS CE 0.18.5, afectada por **CVE-2023-30533**. Está mitigado (congelación de `Object.prototype`, límites de tamaño, sin fórmulas/HTML al leer, `sanitizeState` sobre todo lo importado) pero no reemplazado — no hay build parcheado del fork usado. Detalle completo en [SECURITY.md](SECURITY.md#riesgo-residual-aceptado).

## <img src="docs/assets/icons/terminal.svg" width="20" height="20" valign="middle"/> Calidad

| Suite | Herramienta | Comprobaciones | Qué demuestra |
|---|---|---|---|
| Motor | `node --test` | 15 | Paridad con el Excel (73 medidas e indicadores) y con **el código original de MAGERIT Lab**; los 5 casos; ajustes; plan de acción. |
| Aplicación | Playwright | 61 | Flujo completo en navegador, importación del Excel del profesor, exportaciones, seguridad y diseño responsive a 390 y 768 px. |
| Auditor CLI | pytest | 9 | Resultado exacto sobre el Excel original, mutaciones controladas y **paridad Python ↔ JavaScript**. |

## <img src="docs/assets/icons/folder-tree.svg" width="20" height="20" valign="middle"/> Estructura

```
grc_ens_compliance_studio/
│
├── 🖥️  app/
│   ├── src/engine.js          Motor puro (sin DOM): categorización, MAGERIT, SoA, auditor, plan de acción
│   ├── src/ui/*.js            Interfaz por módulos: núcleo, seguridad, iconos, shell, vistas, E/S, eventos
│   ├── src/styles.css         Sistema de diseño (tokens, tema claro/oscuro, acentos, densidad, responsive)
│   ├── cases/                 Textos genéricos de implantación y los 4 casos de ejemplo adicionales
│   ├── build.js                Genera dist/: versión autónoma (sin conexión, con CSP) y versión web alojada
│   ├── dist/                  ens-compliance-studio.html — el fichero final, autocontenido
│   └── vendor/                 xlsx-js-style 1.2.0 (Apache-2.0)
│
├── 🔎 auditor/                 ens_soa_audit.py + anexo_ii.json — auditor CLI, apto para CI
│
├── 📊 data/                    Material del profesor (sin modificar) y tablas de trazabilidad
│
├── 🧪 tests/                   engine.test.js · test_auditor.py · e2e_app.py
│
├── 📄 docs/                     Memoria (.docx y .md), guion de la defensa y capturas
│
├── package.json                Sin dependencias npm — solo engines/scripts
├── requirements.txt             openpyxl · pytest · playwright (versiones fijadas)
└── run_tests.sh                 Build + motor + app + auditor, en un solo comando
```

## <img src="docs/assets/icons/triangle-alert.svg" width="20" height="20" valign="middle"/> Limitaciones

- Las correspondencias amenaza/salvaguarda ↔ medida ENS (`data/mapping.json`) son criterio del autor, razonado a partir de MAGERIT v3 y la CCN-STIC 804. Para un sistema real hay que revisarlas.
- El auditor no infiere equivalencias entre refuerzos (por ejemplo, que R2 «formal» de [op.pl.1] cubra R1 «semiformal»).
- Los datos se guardan en el navegador. Para trabajo en equipo haría falta un servidor con control de acceso.
- No sustituye a PILAR ni a la auditoría formal del art. 31: es una herramienta de preauditoría.

## <img src="docs/assets/icons/scale.svg" width="20" height="20" valign="middle"/> Licencia

Distribuido bajo licencia [MIT](LICENSE) · Copyright © 2026 Yoandy Ramírez Delgado.

`xlsx-js-style` bajo Apache-2.0. Los casos de ejemplo son ficticios. Texto normativo: RD 311/2022 (BOE-A-2022-7191). Iconografía de este README: [Lucide](https://lucide.dev) (ISC License).

## <img src="docs/assets/icons/user-round.svg" width="20" height="20" valign="middle"/> Mantenedor

<table>
<tr>
<td align="center" valign="top">
<img src="https://avatars.githubusercontent.com/u/238087465?v=4" alt="Yoandy Ramírez Delgado" width="120"/><br/>
<b>Yoandy Ramírez Delgado</b>: Creador y Mantenedor<br/>
<sub>Junior Pentester · eJPTv2 · Offensive Security · AI Governance (ISO 42001) · SysAdmin</sub><br/><br/>
<small>¿Encontraste un problema o quieres probarlo contra tu propia SoA? Abre una <i>issue</i>, escribe a <a href="mailto:yoandyramirezdelgado@gmail.com">yoandyramirezdelgado@gmail.com</a> o usa el proceso de reporte de <a href="SECURITY.md">SECURITY.md</a> si es una vulnerabilidad.</small><br/><br/>
<a href="https://www.linkedin.com/in/yoandyrd92/">LinkedIn</a> · <a href="https://github.com/heindall92">GitHub</a> · <a href="https://yoandyramirez.com">Portafolio</a> · <a href="https://profile.hackthebox.com/profile/019c5812-b4ca-7315-b12f-14db6d2b42fa">HackTheBox</a>
</td>
</tr>
</table>
