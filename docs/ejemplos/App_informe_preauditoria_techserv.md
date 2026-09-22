# Informe de preauditoría ENS — PSTA – Plataforma de Servicios TIC para la Administración Autonómica

**Organización:** TechServ Administración, S.L. (ficticia)  
**SoA:** SOA-ENS-PSTA · **Análisis de riesgos:** AR-2026-01  
**Fecha:** 2026-09-22 · **Elaborado por:** Yoandy Ramírez Delgado – Consultor/a GRC

## Resumen ejecutivo

- Categoría del sistema: **ALTA** (D=ALTO · I=ALTO · C=ALTO · A=ALTO · T=MEDIO).
- Medidas exigidas: **72 de 73**; implantadas 66, parciales 6 (4 con medida compensatoria). Grado de implantación declarado: **98,9 %**.
- Riesgos analizados: 24; por encima del apetito (M): **5** con la evidencia técnica, frente a 2 en el análisis aprobado.
- Hallazgos técnicos abiertos: 6. Acciones abiertas en el plan: 17.
- Resultado: **15 NC mayores**, **6 NC menores** y 1 observación.

## No conformidades mayores (15)

| Regla | Ámbito | Hallazgo | Acción recomendada | Referencia |
|---|---|---|---|---|
| AR-01 | mp.com.2 | **La SoA declara implantada una medida que el análisis de riesgos valora inmadura.** mp.com.2 figura 'Implantada' al 100 %, pero en el AR-2026-01 D.C (Cifrado de la información) está en L2 · Reproducible pero intuitivo. | Revisar una de las dos fuentes: o se rebaja el estado en la SoA con acción PTR, o se actualiza la madurez de la salvaguarda con evidencias. | RD 311/2022, art. 28.1.c |
| AR-01 | mp.per.3 | **La SoA declara implantada una medida que el análisis de riesgos valora inmadura.** mp.per.3 figura 'Implantada' al 100 %, pero en el AR-2026-01 PS.AT (Formación y concienciación) está en L2 · Reproducible pero intuitivo. | Revisar una de las dos fuentes: o se rebaja el estado en la SoA con acción PTR, o se actualiza la madurez de la salvaguarda con evidencias. | RD 311/2022, art. 28.1.c |
| AR-01 | mp.per.4 | **La SoA declara implantada una medida que el análisis de riesgos valora inmadura.** mp.per.4 figura 'Implantada' al 100 %, pero en el AR-2026-01 PS.AT (Formación y concienciación) está en L2 · Reproducible pero intuitivo. | Revisar una de las dos fuentes: o se rebaja el estado en la SoA con acción PTR, o se actualiza la madurez de la salvaguarda con evidencias. | RD 311/2022, art. 28.1.c |
| AR-01 | op.acc.3 | **La SoA declara implantada una medida que el análisis de riesgos valora inmadura.** op.acc.3 figura 'Implantada' al 100 %, pero en el AR-2026-01 H.ST (Segregación de tareas) está en L2 · Reproducible pero intuitivo. | Revisar una de las dos fuentes: o se rebaja el estado en la SoA con acción PTR, o se actualiza la madurez de la salvaguarda con evidencias. | RD 311/2022, art. 28.1.c |
| PT-01 | mp.per.3 | **Evidencia técnica contradice la SoA.** mp.per.3 figura 'Implantada' al 100 %, pero el hallazgo H-05 (Alta, CVSS 7) sigue abierto: Phishing simulado: 18 % de clics y 6 % de credenciales entregadas. | Corregir la vulnerabilidad y aportar evidencia del retest, o reflejar la implantación parcial en la SoA. | RD 311/2022, art. 8 y 31 |
| PT-01 | mp.per.4 | **Evidencia técnica contradice la SoA.** mp.per.4 figura 'Implantada' al 100 %, pero el hallazgo H-05 (Alta, CVSS 7) sigue abierto: Phishing simulado: 18 % de clics y 6 % de credenciales entregadas. | Corregir la vulnerabilidad y aportar evidencia del retest, o reflejar la implantación parcial en la SoA. | RD 311/2022, art. 8 y 31 |
| PT-01 | mp.s.1 | **Evidencia técnica contradice la SoA.** mp.s.1 figura 'Implantada' al 100 %, pero el hallazgo H-05 (Alta, CVSS 7) sigue abierto: Phishing simulado: 18 % de clics y 6 % de credenciales entregadas. | Corregir la vulnerabilidad y aportar evidencia del retest, o reflejar la implantación parcial en la SoA. | RD 311/2022, art. 8 y 31 |
| PT-01 | mp.s.2 | **Evidencia técnica contradice la SoA.** mp.s.2 figura 'Implantada' al 100 %, pero el hallazgo H-01 (Crítica, CVSS 9.1) sigue abierto: Inyección SQL en el buscador de expedientes del backoffice. | Corregir la vulnerabilidad y aportar evidencia del retest, o reflejar la implantación parcial en la SoA. | RD 311/2022, art. 8 y 31 |
| PT-01 | mp.sw.2 | **Evidencia técnica contradice la SoA.** mp.sw.2 figura 'Implantada' al 100 %, pero el hallazgo H-06 (Crítica, CVSS 9.8) sigue abierto: Firmware del cortafuegos de respaldo con CVE crítica sin parchear. | Corregir la vulnerabilidad y aportar evidencia del retest, o reflejar la implantación parcial en la SoA. | RD 311/2022, art. 8 y 31 |
| PT-01 | op.acc.5 | **Evidencia técnica contradice la SoA.** op.acc.5 figura 'Implantada' al 100 %, pero el hallazgo H-02 (Alta, CVSS 8.1) sigue abierto: Panel de administración de la sede accesible sin doble factor. | Corregir la vulnerabilidad y aportar evidencia del retest, o reflejar la implantación parcial en la SoA. | RD 311/2022, art. 8 y 31 |
| PT-01 | op.acc.6 | **Evidencia técnica contradice la SoA.** op.acc.6 figura 'Implantada' al 100 %, pero el hallazgo H-02 (Alta, CVSS 8.1) sigue abierto: Panel de administración de la sede accesible sin doble factor. | Corregir la vulnerabilidad y aportar evidencia del retest, o reflejar la implantación parcial en la SoA. | RD 311/2022, art. 8 y 31 |
| PT-01 | op.acc.6 | **Evidencia técnica contradice la SoA.** op.acc.6 figura 'Implantada' al 100 %, pero el hallazgo H-04 (Alta, CVSS 8.8) sigue abierto: Credenciales por defecto en las interfaces iDRAC de los servidores. | Corregir la vulnerabilidad y aportar evidencia del retest, o reflejar la implantación parcial en la SoA. | RD 311/2022, art. 8 y 31 |
| PT-01 | op.exp.2 | **Evidencia técnica contradice la SoA.** op.exp.2 figura 'Implantada' al 100 %, pero el hallazgo H-04 (Alta, CVSS 8.8) sigue abierto: Credenciales por defecto en las interfaces iDRAC de los servidores. | Corregir la vulnerabilidad y aportar evidencia del retest, o reflejar la implantación parcial en la SoA. | RD 311/2022, art. 8 y 31 |
| PT-01 | op.exp.4 | **Evidencia técnica contradice la SoA.** op.exp.4 figura 'Implantada' al 100 %, pero el hallazgo H-01 (Crítica, CVSS 9.1) sigue abierto: Inyección SQL en el buscador de expedientes del backoffice. | Corregir la vulnerabilidad y aportar evidencia del retest, o reflejar la implantación parcial en la SoA. | RD 311/2022, art. 8 y 31 |
| PT-01 | op.exp.4 | **Evidencia técnica contradice la SoA.** op.exp.4 figura 'Implantada' al 100 %, pero el hallazgo H-06 (Crítica, CVSS 9.8) sigue abierto: Firmware del cortafuegos de respaldo con CVE crítica sin parchear. | Corregir la vulnerabilidad y aportar evidencia del retest, o reflejar la implantación parcial en la SoA. | RD 311/2022, art. 8 y 31 |

## No conformidades menores (6)

| Regla | Ámbito | Hallazgo | Acción recomendada | Referencia |
|---|---|---|---|---|
| AR-02 | R-002 | **Riesgo por encima del apetito aceptado.** R-002 Modificación deliberada de la información se acepta con residual A (apetito M); el hallazgo H-01 lo ha elevado desde la aceptación original. | Requiere aprobación formal del Responsable de la Información y constancia en acta del CSI. | RD 311/2022, art. 14 |
| AR-02 | R-H-04 | **Riesgo fuera de apetito sin tratamiento.** R-H-04 Acceso no autorizado sobre Servidores de aplicación (clúster): residual A, apetito M (riesgo nuevo aflorado por H-04). | Decidir tratamiento (mitigar, transferir, evitar o aceptar formalmente). | RD 311/2022, art. 14 |
| AR-02 | R-H-06 | **Riesgo fuera de apetito sin tratamiento.** R-H-06 Vulnerabilidades de los programas sobre Clúster de cortafuegos del CPD de respaldo: residual A, apetito M (riesgo nuevo aflorado por H-06). | Decidir tratamiento (mitigar, transferir, evitar o aceptar formalmente). | RD 311/2022, art. 14 |
| CAT-01 | S-01 · D | **Valor de categorización no válido.** El activo esencial S-01 (Sede tributaria electrónica (autoliquidaciones, pagos, notificaciones)) tiene 'm' en la dimensión Disponibilidad. Solo se admiten BAJO, MEDIO o ALTO; la celda se ignora en el cálculo. No altera el resultado: Disponibilidad ya es ALTO por I-04. | Corregir la valoración con criterio del Responsable de la Información (CCN-STIC 803) y volver a aprobar la categorización en el CSI. | RD 311/2022, Anexo I |
| CAT-01 | S-04 · D | **Valor de categorización no válido.** El activo esencial S-04 (Servicios transversales (Directorio, correo corporativo, VPN, PKI interna, monitorización)) tiene 'm' en la dimensión Disponibilidad. Solo se admiten BAJO, MEDIO o ALTO; la celda se ignora en el cálculo. No altera el resultado: Disponibilidad ya es ALTO por I-04. | Corregir la valoración con criterio del Responsable de la Información (CCN-STIC 803) y volver a aprobar la categorización en el CSI. | RD 311/2022, Anexo I |
| PT-02 | mp.com.2 | **Evidencia técnica contradice la SoA.** mp.com.2 figura 'Implantada' al 100 %, pero el hallazgo H-03 (Media, CVSS 5.9) sigue abierto: TLS 1.0 y 1.1 habilitados en el balanceador del portal. | Corregir la vulnerabilidad y aportar evidencia del retest, o reflejar la implantación parcial en la SoA. | RD 311/2022, art. 8 y 31 |

## Observaciones (1)

| Regla | Ámbito | Hallazgo | Acción recomendada | Referencia |
|---|---|---|---|---|
| AR-04 | 25 medidas | **Medidas aplicables sin riesgo vinculado en el AR.** No hay ningún riesgo del análisis que se trate con: org.2, org.4, op.pl.1, op.pl.2, op.acc.3, op.ext.1, op.ext.2, op.ext.4, op.nub.1, op.exp.3, op.exp.5, op.exp.7, op.exp.9, op.exp.10, op.cont.1, op.cont.3, op.mon.2, op.mon.3, mp.if.1, mp.if.2, mp.if.3, mp.if.7, mp.com.4, mp.si.5, mp.info.5. | Ampliar el inventario de activos y amenazas del AR o documentar que son exigencias de base. | RD 311/2022, art. 28.1.c |

## Riesgos por encima del apetito

| ID | Activo | Amenaza | Inherente | Residual | Tratamiento | Plazo |
|---|---|---|---|---|---|---|
| R-002 | Base de datos de expedientes ciudadanos | [A.15] Modificación deliberada de la información | MA | A | aceptar | — |
| R-005 | Base de datos de expedientes ciudadanos | [E.19] Fugas de información | A | A | mitigar | 2027-01-31 |
| R-008 | Servicio web Sede Electrónica | [E.24] Caída por agotamiento de recursos | A | A | mitigar | 2027-03-31 |
| R-H-04 | Servidores de aplicación (clúster) | [A.11] Acceso no autorizado | A | A | — | — |
| R-H-06 | Clúster de cortafuegos del CPD de respaldo | [E.20] Vulnerabilidades de los programas | A | A | — | — |

---
_Preauditoría automática generada con ENS Compliance Studio. Las correspondencias amenaza/salvaguarda ↔ medida ENS deben revisarse para cada sistema. No sustituye a la auditoría formal del art. 31 RD 311/2022._