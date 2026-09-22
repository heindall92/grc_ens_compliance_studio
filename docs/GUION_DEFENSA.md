# Guion de la defensa · ENS Compliance Studio

**Duración objetivo:** 10 minutos de exposición y demo + 5 de preguntas.
**Preparación:** abrir `ens-compliance-studio.html` en una ventana limpia (o borrar los datos desde Ajustes) para que se vea la pantalla de Inicio. Tener el Excel original en otra pestaña y una terminal en la carpeta del proyecto.

---

## 0:00 – 1:00 · El problema, en una frase

> «El ENS no falla por falta de medidas: falla porque la categorización, el análisis de riesgos, la SoA y el pentest viven en cuatro ficheros que no se hablan. Mi proyecto los hace hablar y comprueba que cuentan la misma historia.»

En **Inicio**, rellena tu nombre y tu rol: son los que firmarán los informes. Señala los tres caminos (*Empezar con mis datos*, *Importar mi SoA* y *Explorar un caso*) y los cinco casos de ejemplo, de categoría BÁSICA a ALTA. Abre **TechServ**, el caso de clase. En el **Panel**, la cadena de indicadores: categoría ALTA, 72 medidas exigidas, riesgos fuera de apetito, no conformidades y próximas acciones.

## 1:00 – 2:30 · Primero, fidelidad al material de clase

- **Categorización**: «Estos son los 8 activos del Excel. La herramienta calcula D=I=C=A=ALTO y T=MEDIO: categoría ALTA, como el libro.»
- Señala el aviso de las **dos celdas `'m'`**: «El Excel lo tiene y la fórmula lo ignora. No cambia la categoría porque I-04 ya es ALTO, y la herramienta lo explica. Pero un auditor lo marcaría.»
- «Qué exige esta categorización»: **72 medidas, 78 refuerzos obligatorios y 9 alternativos**, «exactamente los números de la hoja Resumen».
- Frase clave: «Tengo un test que compara las 73 medidas con el Excel y otro que **ejecuta el código original de MAGERIT Lab** y compara el riesgo de las 14 amenazas. Si mi motor se desviara un nivel en una sola celda, el test fallaría.»

## 2:30 – 4:30 · El momento «ajá»: recategorizar en vivo

1. En **Categorización**, cambia **I-02 · T** de MEDIO a **ALTO**.
2. Mira la cabecera: sube el contador de NC mayores.
3. Ve a **Auditoría** y filtra por NC mayor:
   - **SOA-01 [mp.info.4]**: «Los sellos de tiempo estaban excluidos. Con trazabilidad ALTA pasan a ser exigibles y la SoA sigue diciendo NO.»
   - **REF-01 [op.exp.8] R5**: «El registro de actividad necesita un refuerzo nuevo que nadie ha contemplado.»
4. Vuelve a poner MEDIO: las dos desaparecen.

> «Esto, en la vida real, es la v2.0 del Excel: TechServ pasó de MEDIA a ALTA. Hacerlo a mano sobre 73 medidas y 92 refuerzos es exactamente donde se cuelan los errores.»

## 4:30 – 6:30 · La SoA contra el análisis de riesgos

- Abre **Declaración de Aplicabilidad** y filtra «Con incidencias del auditor».
- Despliega **[op.acc.3] Segregación de funciones**:
  - Texto del Anexo II a la izquierda, declaración a la derecha.
  - Abajo, **AR-01**: «La SoA dice *Implantada 100 %*, pero en el AR-2026-01 la salvaguarda H.ST está en **L2, reproducible pero intuitivo**. Las dos afirmaciones no pueden ser ciertas a la vez.»
- «Esto no me lo he inventado: está en el material de clase. El Excel y MAGERIT Lab se contradicen en cuatro medidas (mp.com.2, mp.per.3, mp.per.4 y op.acc.3).»
- Enseña **Compensatorias**: MC-01 a MC-04 enlazadas con los riesgos R-034, R-051, R-062 y R-070 del análisis y su residual actual. «El Excel cita esos riesgos; aquí existen y se puede comprobar que la compensatoria realmente los deja en nivel bajo.»

## 6:30 – 8:30 · De Red Team a GRC: el pentest entra en la SoA

- Ve a **Evidencia técnica**: 7 hallazgos de ejemplo (SQLi, panel sin MFA, TLS 1.0, iDRAC con credenciales por defecto, phishing, firmware con CVE crítica).
- Ve a **Análisis de riesgos → Registro** y activa y desactiva **«Incluir evidencia técnica»**:
  - «Con el AR tal como se aprobó, 2 riesgos por encima del apetito. Con la evidencia técnica, **5**.»
  - R-002: «Estaba **aceptado**; la inyección SQL lo sube de probabilidad B a MA y la herramienta avisa de que hay que volver a decidir.»
  - Filas sombreadas R-H-04 y R-H-06: «Riesgos que ni siquiera estaban en el análisis.»
- Vuelve al **Panel**: «**55 de 66** medidas "implantadas al 100 %" sobreviven sin una no conformidad mayor. Esa es la distancia entre lo que se declara y lo que se puede defender.»

> «Vengo de la parte ofensiva: eJPT, Hack The Box, Sherlocks. Lo que he aprendido en este módulo es que un hallazgo de pentest no termina en el informe. Su sitio es el análisis de riesgos y la SoA, porque ahí se convierte en una decisión de gestión.»

## 8:30 – 9:30 · Entregable y automatización

- **Exportar → SoA (.xlsx)**: abre el Excel. Tiene las mismas columnas que el original y cuatro nuevas (riesgos vinculados, residual máximo, hallazgos e incidencias del auditor), además de hojas de AR, evidencia y auditoría.
- En la terminal:
  ```bash
  python3 auditor/ens_soa_audit.py data/SoA_TechServ_original.xlsx
  ```
  «Esto audita **cualquier** SoA con esta plantilla. Encuentra las celdas `'m'` y la cabecera corrupta de la columna O. Con `--fail-on mayor` devuelve un código de error, así que puede ir en un flujo de revisión documental.»
- «Hay dos implementaciones del auditor, en JavaScript y en Python, escritas por separado. Un test comprueba que dan el mismo resultado sobre el mismo Excel.»

## Si sobra tiempo · Tus datos y la seguridad

- Pulsa **«Empezar con mis datos»** en el aviso de demo: son tres pasos y el proyecto sale con la categoría calculada y las medidas pendientes de declarar.
- O importa el Excel del profesor desde el menú de proyectos: la herramienta lo audita al momento y vuelve a encontrar las celdas `'m'`.
- Pulsa **Ctrl + K** y escribe `op.acc.6`: se abre la medida directamente.
- «Todo fichero importado se trata como hostil. Las pruebas automáticas atacan la aplicación con XSS, prototype pollution y fórmulas maliciosas en CSV, y los datos nunca salen del navegador: la versión autónoma lleva una CSP que prohíbe cualquier conexión saliente.»

## 9:30 – 10:00 · Cierre

> «85 comprobaciones automáticas, incluidas pruebas de ataque, paridad con los dos materiales de clase, un único HTML que funciona sin conexión y un auditor por línea de comandos. No sustituye a PILAR ni a la auditoría formal: prepara la auditoría para que no haya sorpresas.»

---

## Preguntas probables

**¿Por qué no usar PILAR directamente?**
PILAR es la herramienta oficial para el análisis de riesgos y el proyecto no pretende sustituirla. Lo que aporta es lo que PILAR no hace: conciliar el análisis con la SoA en Excel y con la evidencia técnica, y auditar la coherencia documental. Importar las exportaciones de PILAR es la primera línea de trabajo futuro.

**¿De dónde salen las correspondencias amenaza → medida?**
Son criterio propio, razonado a partir de los catálogos de MAGERIT v3 (Libro II) y de la CCN-STIC 804, y están documentadas en `data/mapping.json`. Un test garantiza que los códigos existen y que las 73 medidas están cubiertas. Para un sistema real, las revisaría el analista; está explícito en la memoria.

**¿Cómo sabes que tus cálculos son correctos?**
No lo afirmo, lo compruebo. El nivel y la exigencia de las 73 medidas se comparan con los valores que calcula el propio Excel. El riesgo inherente y residual se compara ejecutando el JavaScript original de MAGERIT Lab. Y el auditor tiene dos implementaciones independientes que se contrastan entre sí.

**¿Por qué AR-01 es una NC mayor y no una observación?**
Porque la SoA es un documento firmado (art. 28.2) y declarar implantada al 100 % una medida que tu propio análisis de riesgos considera inmadura es una declaración que no se puede sostener con evidencias. La severidad es configurable en el código si el criterio del auditor es otro.

**¿Qué pasa con el refuerzo R1 de [op.pl.1] en el escenario MEDIA?**
En nivel MEDIO se exige un análisis semiformal (R1) y la tabla solo recoge el formal (R2). Materialmente el formal cubre al semiformal, pero el auditor no hace esa inferencia a propósito: la señala y decide la persona. Está documentado como limitación conocida.

**¿Y la IA?**
Cuando se activa en Ajustes, propone amenazas del catálogo MAGERIT y redacta borradores de justificación. Todo pasa por aceptación explícita y las respuestas se validan contra el catálogo antes de mostrarse. Es supervisión humana en el sentido de ISO/IEC 42001: la IA propone y la Responsable de Seguridad firma.

**¿Por qué CVSS a probabilidad y no a impacto?**
Porque el CVSS mide sobre todo la facilidad y el alcance de la explotación, que es lo que MAGERIT llama frecuencia. El impacto ya lo fija la valoración del activo. La degradación sí la toma de la categoría del hallazgo (una SQLi degrada integridad y confidencialidad).

**¿Es segura? ¿Qué pasa si alguien me pasa un proyecto manipulado?**
Todo lo que entra (JSON, Excel, CSV y el propio almacenamiento local) pasa por una validación por esquema: tipos, rangos, listas blancas e identificadores filtrados. La salida siempre se escapa y `Object.prototype` está congelado, lo que además mitiga una CVE conocida de la librería de Excel. Los CSV exportados neutralizan fórmulas. Los tests de extremo a extremo lanzan esos ataques en cada ejecución. Detalle en SECURITY.md.

**¿Por qué no un servidor con base de datos?**
Porque para el caso de uso (preparar una auditoría) es más seguro que los datos no salgan del equipo. Para un equipo grande sería el siguiente paso, con control de acceso y registro de cambios.
