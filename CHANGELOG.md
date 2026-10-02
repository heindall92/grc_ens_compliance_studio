# Cambios

## 2.1.0 · octubre de 2026

**Interfaz**
- Barra lateral con dos anchos: completa (280 px) y compacta (76 px). Compacta automática entre 901 y 1240 px o al plegarla con el botón o con «[»; en compacta se despliega por encima del contenido con el ratón o el teclado, sin mover los iconos. El resaltado sigue al puntero.
- Sin proyecto abierto, las vistas del proyecto aparecen con candado y una nota que explica cómo activarlas.
- Estilo según las guías de Apple: fuente del sistema, grises y colores del sistema (contraste aumentado en claro), azul por defecto, sin degradados de fondo, material translúcido solo en la barra superior, la lateral, los menús y la paleta, transiciones sin rebote, respuesta al pulsar, `prefers-reduced-transparency` y `prefers-contrast`.
- Textos revisados: 62 cambios para quitar eslóganes, tono de chat y afirmaciones que el código no sostenía (privacidad del asistente, firma en el plan de acción). El motor de reglas se llama «preauditoría» para no confundirlo con la auditoría formal del art. 31.
- El aviso inferior ya se oculta (antes quedaba fijo en pantalla).
- Móvil: plan de acción legible, Ayuda → Reglas sin desplazamiento lateral, cabecera sin solapes y lista de la SoA sin cabecera cortada.

**Accesibilidad (axe-core: 0 infracciones WCAG 2.2 AA en todas las vistas, claro y oscuro, escritorio y móvil)**
- Nombre accesible en 560 desplegables y 28 campos; contraste corregido en estados, riesgo «muy alto», textos atenuados y acento como texto.
- El foco vuelve al mismo control tras cada redibujado; la paleta atrapa el foco y lo devuelve al cerrar; flechas en pestañas y en el menú de proyectos; Esc devuelve el foco a quien abrió el menú; enlace «Ir al contenido»; tooltips del panel accesibles con teclado.

**Seguridad** (detalle en [docs/AUDITORIA_PRODUCCION.md](docs/AUDITORIA_PRODUCCION.md))
- CSP por hashes generada en el build, sin `'unsafe-inline'` para código ni dominios externos.
- Sin Google Fonts: ninguna petición a terceros.
- Lectura de Excel ajeno con SheetJS CE 0.20.3 (CVE-2023-30533, CVE-2024-22363); `xlsx-js-style` solo escribe. Librerías incrustadas sin ejecutar y activadas bajo demanda; SRI en la versión alojada.
- Corregida una inyección de HTML por fecha manipulada en el almacenamiento.
- Neutralización de fórmulas CSV y escapado Markdown ampliados; importar hallazgos con JSON nulo ya no falla.
- `window.__ENS_STUDIO__` solo con `?test`; `Object.prototype` y `Array.prototype` congelados al inicio.
- Auditor CLI: informe Markdown escapado, consola sin caracteres de control, límite de 15 MB y `defusedxml`.
- CI con acciones fijadas por SHA, permisos de solo lectura y dependencias de `requirements.txt`.

**Pruebas**: 15 del motor, 87 de extremo a extremo, axe-core en 4 combinaciones de tema y ancho, 11 del auditor.

**Mantenimiento**
- `package.json` (sin dependencias npm, solo `engines`/scripts) y `requirements.txt` (openpyxl, pytest, playwright fijados) para builds y entornos de prueba reproducibles.
- `SECURITY.md`: proceso de reporte de vulnerabilidades con contacto, plazos y versiones soportadas.
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
