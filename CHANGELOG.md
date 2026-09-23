# Cambios

## Sin publicar
- `package.json` (sin dependencias npm, solo `engines`/scripts) y `requirements.txt` (openpyxl, pytest, playwright fijados) para builds y entornos de prueba reproducibles.
- `SECURITY.md`: proceso de reporte de vulnerabilidades con contacto, plazos y versiones soportadas; riesgo residual de CVE-2023-30533 (SheetJS CE 0.18.5 vía `xlsx-js-style`) documentado explícitamente con su mitigación.
- README: instrucciones de entorno virtual para ejecutar la suite completa (`requirements.txt` + `playwright install chromium`).

## 2.0.1 · septiembre de 2026
- Los círculos de acento y de avatar se ven en tema claro y oscuro, y el color activo tiñe la navegación, los botones y las tarjetas seleccionadas (verde agua, azul, verde, amarillo, rojo y grafito).
- Las tarjetas de los casos de ejemplo conservan su color en tema oscuro.
- Paneles translúcidos en tema claro y oscuro.
- Interruptor de idioma español / inglés en la barra superior y en Ajustes.
- El menú de proyecto avisa, en lugar de parecer desactivado, cuando todavía no hay un proyecto abierto. El rol no lo bloquea.
- La abreviatura `m` (y B / ALT) en la categorización se lee como MEDIO. En TechServ no cambia la categoría: la disponibilidad ya es ALTO por I-04.

## 2.0.0 · septiembre de 2026
- Nueva interfaz: sistema de diseño propio, iconografía, tema claro y oscuro, 4 colores de acento, densidad compacta y diseño responsive con menú en cajón.
- Espacio de trabajo con varios proyectos: asistente de nuevo proyecto en 3 pasos, importación de la SoA desde Excel y conmutador de proyectos.
- 5 casos de ejemplo (TechServ, Ayuntamiento de Valdemora, Universidad del Litoral, Hospital Comarcal Sierra Norte y CitaFácil Cloud) con un aviso de demo y el paso a datos propios.
- Perfil de usuario, que figura como autor en los informes y en la SoA exportada.
- Ajustes: umbrales CVSS, madurez mínima de AR-01, reglas activables, tema y datos.
- Centro de ayuda: primeros pasos, flujo, glosario, reglas, atajos, preguntas frecuentes y «Acerca de».
- Plan de acción con verificación automática del cierre, y evolución histórica en el panel.
- Buscador de comandos (Ctrl + K) y atajos de teclado.
- Estado «Pendiente» de declarar, con la observación SOA-10.
- Seguridad: validación por esquema, defensa ante prototype pollution, CSV injection y XSS, CSP estricta y límites de tamaño (ver SECURITY.md).
- 85 comprobaciones automáticas (15 del motor, 61 de extremo a extremo y seguridad, 9 del auditor CLI).

## 1.0.0 · septiembre de 2026
- Primera versión: categorización, análisis MAGERIT, SoA dinámica, evidencia técnica, auditor de 26 reglas, exportación a Excel y auditor CLI.
