# Preauditoría de la SoA — SoA_TechServ_original.xlsx

**Fecha:** 2026-09-22 · **Herramienta:** ens-soa-audit 1.0.0

## Resumen

- Categoría recalculada: **ALTA** (D=ALTO · I=ALTO · C=ALTO · A=ALTO · T=MEDIO).
- Medidas en la SoA: 73 · exigidas por el Anexo II: 72 · grado de implantación declarado: 98.9 %.
- Resultado: **0 NC mayores**, **2 NC menores**, 1 observaciones.

## No conformidades menores (2)

| Regla | Ámbito | Hallazgo | Acción recomendada | Referencia |
|---|---|---|---|---|
| CAT-01 | S-01 · D | **Valor de categorización no válido.** El activo esencial S-01 (Sede tributaria electrónica (autoliquidaciones, pagos, notificaciones)) tiene 'm' en la dimensión Disponibilidad. Solo se admiten BAJO, MEDIO o ALTO; la celda se ignora en el cálculo. No altera el resultado: Disponibilidad ya es ALTO por I-04. | Corregir la valoración con criterio del Responsable de la Información (CCN-STIC 803) y volver a aprobar la categorización en el CSI. | RD 311/2022, Anexo I |
| CAT-01 | S-04 · D | **Valor de categorización no válido.** El activo esencial S-04 (Servicios transversales (Directorio, correo corporativo, VPN, PKI interna, monitorización)) tiene 'm' en la dimensión Disponibilidad. Solo se admiten BAJO, MEDIO o ALTO; la celda se ignora en el cálculo. No altera el resultado: Disponibilidad ya es ALTO por I-04. | Corregir la valoración con criterio del Responsable de la Información (CCN-STIC 803) y volver a aprobar la categorización en el CSI. | RD 311/2022, Anexo I |

## Observaciones (1)

| Regla | Ámbito | Hallazgo | Acción recomendada | Referencia |
|---|---|---|---|---|
| STR-01 | Cabecera col. O | **Cabecera de columna alterada.** La cabecera 'Medidas ORGANIZATIVAS implantadasPortal de firma de normativas (registro de aceptación); b' contiene texto ajeno a la plantilla (esperado: 'Medidas ORGANIZATIVAS implantadas'). | Restaurar la cabecera; un texto pegado en la cabecera suele indicar una edición accidental. | Control documental |

_Preauditoría automática: prepara la auditoría formal del art. 31 RD 311/2022, no la sustituye._