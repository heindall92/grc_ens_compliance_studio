# Informe de preauditoría ENS — Sistemas de información clínica

**Organización:** Hospital Comarcal Sierra Norte (ficticio)  
**SoA:** SOA-HSN-2026 · **Análisis de riesgos:** AR-HSN-2026  
**Fecha:** 2026-09-22 · **Elaborado por:** Yoandy Ramírez Delgado – Consultor/a GRC

## Resumen ejecutivo

- Categoría del sistema: **ALTA** (D=ALTO · I=ALTO · C=ALTO · A=MEDIO · T=ALTO).
- Medidas exigidas: **73 de 73**; implantadas 69, parciales 4 (2 con medida compensatoria). Grado de implantación declarado: **98,2 %**.
- Riesgos analizados: 12; por encima del apetito (B): **7** con la evidencia técnica, frente a 5 en el análisis aprobado.
- Hallazgos técnicos abiertos: 5. Acciones abiertas en el plan: 17.
- Resultado: **11 NC mayores**, **5 NC menores** y 1 observación.

## No conformidades mayores (11)

| Regla | Ámbito | Hallazgo | Acción recomendada | Referencia |
|---|---|---|---|---|
| AR-01 | mp.com.4 | **La SoA declara implantada una medida que el análisis de riesgos valora inmadura.** mp.com.4 figura 'Implantada' al 100 %, pero en el AR-HSN-2026 COM.DS (VLAN de electromedicina) está en L2 · Reproducible pero intuitivo. | Revisar una de las dos fuentes: o se rebaja el estado en la SoA con acción PTR, o se actualiza la madurez de la salvaguarda con evidencias. | RD 311/2022, art. 28.1.c |
| AR-01 | mp.per.3 | **La SoA declara implantada una medida que el análisis de riesgos valora inmadura.** mp.per.3 figura 'Implantada' al 100 %, pero en el AR-HSN-2026 PS.AT (Formación en ciberseguridad sanitaria) está en L2 · Reproducible pero intuitivo. | Revisar una de las dos fuentes: o se rebaja el estado en la SoA con acción PTR, o se actualiza la madurez de la salvaguarda con evidencias. | RD 311/2022, art. 28.1.c |
| AR-01 | mp.per.4 | **La SoA declara implantada una medida que el análisis de riesgos valora inmadura.** mp.per.4 figura 'Implantada' al 100 %, pero en el AR-HSN-2026 PS.AT (Formación en ciberseguridad sanitaria) está en L2 · Reproducible pero intuitivo. | Revisar una de las dos fuentes: o se rebaja el estado en la SoA con acción PTR, o se actualiza la madurez de la salvaguarda con evidencias. | RD 311/2022, art. 28.1.c |
| MC-01 | mp.eq.4 | **Medida compensada sin registro de medida compensatoria.** mp.eq.4 se declara compensada pero ninguna MC del registro la sustituye. | Registrar la medida compensatoria: ámbito, restricción, riesgo, medida, validación, mantenimiento y aprobación. | RD 311/2022, art. 28.3 |
| PT-01 | mp.com.1 | **Evidencia técnica contradice la SoA.** mp.com.1 figura 'Implantada' al 100 %, pero el hallazgo H-02 (Alta, CVSS 8.3) sigue abierto: Modalidades de imagen alcanzables desde la red de usuarios. | Corregir la vulnerabilidad y aportar evidencia del retest, o reflejar la implantación parcial en la SoA. | RD 311/2022, art. 8 y 31 |
| PT-01 | mp.com.4 | **Evidencia técnica contradice la SoA.** mp.com.4 figura 'Implantada' al 100 %, pero el hallazgo H-02 (Alta, CVSS 8.3) sigue abierto: Modalidades de imagen alcanzables desde la red de usuarios. | Corregir la vulnerabilidad y aportar evidencia del retest, o reflejar la implantación parcial en la SoA. | RD 311/2022, art. 8 y 31 |
| PT-01 | mp.info.6 | **Evidencia técnica contradice la SoA.** mp.info.6 figura 'Implantada' al 100 %, pero el hallazgo H-01 (Crítica, CVSS 9) sigue abierto: Repositorio de copias accesible con credenciales de dominio y sin inmutabilidad. | Corregir la vulnerabilidad y aportar evidencia del retest, o reflejar la implantación parcial en la SoA. | RD 311/2022, art. 8 y 31 |
| PT-01 | mp.sw.2 | **Evidencia técnica contradice la SoA.** mp.sw.2 figura 'Implantada' al 100 %, pero el hallazgo H-03 (Alta, CVSS 8.1) sigue abierto: Servidor PACS con componente DICOM vulnerable. | Corregir la vulnerabilidad y aportar evidencia del retest, o reflejar la implantación parcial en la SoA. | RD 311/2022, art. 8 y 31 |
| PT-01 | op.acc.6 | **Evidencia técnica contradice la SoA.** op.acc.6 figura 'Implantada' al 100 %, pero el hallazgo H-04 (Alta, CVSS 7.4) sigue abierto: Credenciales por defecto en la consola de un ecógrafo. | Corregir la vulnerabilidad y aportar evidencia del retest, o reflejar la implantación parcial en la SoA. | RD 311/2022, art. 8 y 31 |
| PT-01 | op.exp.2 | **Evidencia técnica contradice la SoA.** op.exp.2 figura 'Implantada' al 100 %, pero el hallazgo H-04 (Alta, CVSS 7.4) sigue abierto: Credenciales por defecto en la consola de un ecógrafo. | Corregir la vulnerabilidad y aportar evidencia del retest, o reflejar la implantación parcial en la SoA. | RD 311/2022, art. 8 y 31 |
| REF-01 | op.exp.8 R5 | **Refuerzo exigido no contemplado.** Con nivel ALTO, op.exp.8 exige R5, pero la tabla de refuerzos lo marca como 'No'. | Incorporar el refuerzo a la implantación o justificar una medida compensatoria. | RD 311/2022, Anexo II |

## No conformidades menores (5)

| Regla | Ámbito | Hallazgo | Acción recomendada | Referencia |
|---|---|---|---|---|
| AR-02 | R-007 | **Riesgo por encima del apetito aceptado.** R-007 Vulnerabilidades de los programas se acepta con residual M (apetito B); el hallazgo H-03 lo ha elevado desde la aceptación original. | Requiere aprobación formal del Responsable de la Información y constancia en acta del CSI. | RD 311/2022, art. 14 |
| AR-02 | R-H-02 | **Riesgo fuera de apetito sin tratamiento.** R-H-02 Acceso no autorizado sobre Red de electromedicina y modalidades: residual M, apetito B (riesgo nuevo aflorado por H-02, H-04). | Decidir tratamiento (mitigar, transferir, evitar o aceptar formalmente). | RD 311/2022, art. 14 |
| PT-02 | mp.per.3 | **Evidencia técnica contradice la SoA.** mp.per.3 figura 'Implantada' al 100 %, pero el hallazgo H-05 (Media, CVSS 6) sigue abierto: Phishing simulado: 12 % de clics. | Corregir la vulnerabilidad y aportar evidencia del retest, o reflejar la implantación parcial en la SoA. | RD 311/2022, art. 8 y 31 |
| PT-02 | mp.per.4 | **Evidencia técnica contradice la SoA.** mp.per.4 figura 'Implantada' al 100 %, pero el hallazgo H-05 (Media, CVSS 6) sigue abierto: Phishing simulado: 12 % de clics. | Corregir la vulnerabilidad y aportar evidencia del retest, o reflejar la implantación parcial en la SoA. | RD 311/2022, art. 8 y 31 |
| PT-02 | mp.s.1 | **Evidencia técnica contradice la SoA.** mp.s.1 figura 'Implantada' al 100 %, pero el hallazgo H-05 (Media, CVSS 6) sigue abierto: Phishing simulado: 12 % de clics. | Corregir la vulnerabilidad y aportar evidencia del retest, o reflejar la implantación parcial en la SoA. | RD 311/2022, art. 8 y 31 |

## Observaciones (1)

| Regla | Ámbito | Hallazgo | Acción recomendada | Referencia |
|---|---|---|---|---|
| AR-04 | 40 medidas | **Medidas aplicables sin riesgo vinculado en el AR.** No hay ningún riesgo del análisis que se trate con: org.1, org.2, org.3, org.4, op.pl.1, op.pl.2, op.acc.1, op.acc.3, op.acc.5, op.ext.1, op.ext.2, op.ext.4, op.nub.1, op.exp.1, op.exp.3, op.exp.5, op.exp.7, op.exp.9, op.exp.10, op.cont.1, op.cont.3, op.mon.2, op.mon.3, mp.if.1, mp.if.2, mp.if.3, mp.if.4, mp.if.5, mp.if.6, mp.if.7, mp.per.1, mp.eq.3, mp.com.4, mp.si.1, mp.si.3, mp.si.4, mp.si.5, mp.info.3, mp.info.4, mp.info.5. | Ampliar el inventario de activos y amenazas del AR o documentar que son exigencias de base. | RD 311/2022, art. 28.1.c |

## Riesgos por encima del apetito

| ID | Activo | Amenaza | Inherente | Residual | Tratamiento | Plazo |
|---|---|---|---|---|---|---|
| R-006 | Red de electromedicina y modalidades | [A.22] Manipulación de programas/equipos | A | M | mitigar | 2027-03-31 |
| R-007 | Servidor PACS | [E.20] Vulnerabilidades de los programas | A | M | aceptar | — |
| R-008 | Repositorio de copias de seguridad | [A.18] Destrucción de información | MA | A | mitigar | 2027-03-31 |
| R-009 | Personal sanitario y administrativo | [A.30] Ingeniería social | A | M | mitigar | 2027-03-31 |
| R-010 | Personal sanitario y administrativo | [E.19] Fugas de información | A | M | mitigar | 2027-03-31 |
| R-011 | Red de electromedicina y modalidades | [I.5] Avería de origen físico o lógico | A | M | mitigar | 2027-03-31 |
| R-H-02 | Red de electromedicina y modalidades | [A.11] Acceso no autorizado | A | M | — | — |

---
_Preauditoría automática generada con ENS Compliance Studio. Las correspondencias amenaza/salvaguarda ↔ medida ENS deben revisarse para cada sistema. No sustituye a la auditoría formal del art. 31 RD 311/2022._