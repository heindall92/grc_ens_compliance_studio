/* ---------- Descargas, exportaciones e importaciones ---------- */
async function saveFile(filename, data) {
  try {
    const dl = window.claude && typeof window.claude.use === 'function' ? await window.claude.use('downloads') : null;
    if (dl) { await dl.save({ filename, data }); toast(`Guardado: ${filename}`); return; }
  } catch (e) {
    if (e && e.code === 'declined') { toast('Descarga cancelada'); return; }
    if (e && e.code === 'rate_limited') { toast('Ya hay una descarga pendiente de confirmar'); return; }
    if (e && e.code && !['unavailable', 'not_granted', 'capability_disabled', 'capability_removed'].includes(e.code)) { toast(`No se pudo guardar: ${e.message || e.code}`); return; }
  }
  const blob = data instanceof Blob ? data : new Blob([data], { type: 'application/octet-stream' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  toast(`Descargado: ${filename}`);
}
const slug = () => (state?.proyecto?.codigoSoA || 'SoA').replace(/[^\w-]+/g, '_');
const csvCell = (v) => { const x = noFormula(v); return /[",;\n\r]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x; };
const toCsv = (rows) => '﻿' + rows.map((r) => r.map(csvCell).join(';')).join('\r\n');

function informeMd() {
  const k = calc.kpi; const L = []; const p = state.proyecto || {};
  L.push(`# Informe de preauditoría ENS — ${mdSafe(p.sistema || p.nombre || '')}`, '');
  L.push(`**Organización:** ${mdSafe(p.organizacion || '')}  `, `**SoA:** ${mdSafe(p.codigoSoA || '')} · **Análisis de riesgos:** ${mdSafe(p.codigoAR || '')}  `, `**Fecha:** ${today()} · **Elaborado por:** ${mdSafe(firma())}`, '');
  L.push('## Resumen ejecutivo', '');
  L.push(`- Categoría del sistema: **${calc.categoria}** (${E.DIMS.map((d) => `${d}=${calc.niveles[d] || '—'}`).join(' · ')}).`);
  L.push(`- Medidas exigidas: **${k.aplicables} de ${k.medidas}**; implantadas ${k.implantadas}, parciales ${k.parciales} (${k.compensadas} con medida compensatoria)${k.pendientes ? `, ${k.pendientes} pendientes de declarar` : ''}. Grado de implantación declarado: **${pct(k.grado)}**.`);
  L.push(`- Riesgos analizados: ${k.riesgos}; por encima del apetito (${state.apetito}): **${k.fueraApetito}** con la evidencia técnica, frente a ${k.fueraApetitoDeclarado} en el análisis aprobado.`);
  L.push(`- Hallazgos técnicos abiertos: ${k.hallazgosAbiertos}. Acciones abiertas en el plan: ${plan.filter((a) => a.estado !== 'Hecha' && !a.verificada).length}.`);
  L.push(`- Resultado: **${auditCount('NC mayor')} NC mayores**, **${auditCount('NC menor')} NC menores** y ${plural(auditCount('Observación'), 'observación', 'observaciones')}.`, '');
  for (const sev of ['NC mayor', 'NC menor', 'Observación']) {
    const fs = audit.filter((f) => f.sev === sev); if (!fs.length) continue;
    L.push(`## ${sev === 'Observación' ? 'Observaciones' : sev === 'NC mayor' ? 'No conformidades mayores' : 'No conformidades menores'} (${fs.length})`, '', '| Regla | Ámbito | Hallazgo | Acción recomendada | Referencia |', '|---|---|---|---|---|');
    for (const f of fs) L.push(`| ${mdSafe(f.id)} | ${mdSafe(f.ambito)} | **${mdSafe(f.titulo)}.** ${mdSafe(f.detalle)} | ${mdSafe(f.recomendacion)} | ${mdSafe(f.ref)} |`);
    L.push('');
  }
  const fuera = calc.riesgos.filter((x) => x.fueraApetito);
  if (fuera.length) { L.push('## Riesgos por encima del apetito', '', '| ID | Activo | Amenaza | Inherente | Residual | Tratamiento | Plazo |', '|---|---|---|---|---|---|---|'); for (const r of fuera) L.push(`| ${mdSafe(r.amenaza.id)} | ${mdSafe(r.activo.nombre)} | ${mdSafe(r.amenaza.codigo + ' ' + r.amenaza.nombre)} | ${r.inhMax} | ${r.resMax} | ${mdSafe(r.tratamiento?.opcion || '—')} | ${mdSafe(r.tratamiento?.plazo || '—')} |`); L.push(''); }
  L.push('---', '_Preauditoría automática generada con ENS Compliance Studio. Las correspondencias amenaza/salvaguarda ↔ medida ENS deben revisarse para cada sistema. No sustituye a la auditoría formal del art. 31 RD 311/2022._');
  return L.join('\n');
}
const riesgosCsv = () => toCsv([['ID', 'Activo', 'Tipo', 'Amenaza', 'Nombre', 'Origen', 'Probabilidad', 'Inherente', 'Salvaguardas', 'Prob. residual', 'Residual', 'Fuera de apetito', 'Medidas ENS', 'Hallazgos', 'Tratamiento', 'Responsable', 'Plazo'],
  ...calc.riesgos.map((r) => [r.amenaza.id, r.activo.nombre, r.activo.tipo, r.amenaza.codigo, r.amenaza.nombre, r.amenaza.origen === 'hallazgo' ? 'Evidencia técnica' : 'AR', r.amenaza.prob, r.inhMax, r.salvs.map((s) => `${s.codigo} (${s.madurez})`).join(' | '), r.probRes, r.resMax, r.fueraApetito ? 'SÍ' : 'NO', r.ens.join(' '), (r.amenaza.hallazgos || []).join(' '), r.tratamiento?.opcion || '', r.tratamiento?.responsable || '', r.tratamiento?.plazo || ''])]);
const planCsv = () => toCsv([['Prioridad', 'Acción', 'Detalle', 'Origen', 'Referencia', 'Responsable', 'Fecha límite', 'Estado', 'Nota'], ...plan.map((a) => [a.prioridad, a.titulo, a.detalle, a.origen, a.ref, a.responsable, a.fecha, a.estado, a.nota])]);

function loadXLSX() {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  return new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = XLSX_URL; s.async = true;
    s.onload = () => (window.XLSX ? res(window.XLSX) : rej(new Error('Librería no disponible')));
    s.onerror = () => rej(new Error('No se pudo cargar la librería de Excel (¿sin conexión?)'));
    document.head.appendChild(s);
  });
}
const SOA_HEADERS = ['Marco / familia', 'Código', 'Medida de seguridad', 'Dimensiones afectadas (Anexo II)', 'Nivel BAJO', 'Nivel MEDIO', 'Nivel ALTO', 'Nivel exigido', 'Regla aplicada', 'Exigencia aplicable (Anexo II)', 'Refuerzos exigidos (Rn)', 'Refuerzos / alternativa elegida', '¿Aplica?', 'Justificación de aplicabilidad / exclusión', 'Medidas ORGANIZATIVAS implantadas', 'Medidas TÉCNICAS implantadas', 'Medida compensatoria (ref.)', 'Estado de implantación', '% implantación', 'Evidencias / documentos', 'Responsable', 'Control ISO/IEC 27001:2022 equivalente (CCN-STIC 825)', 'Guías CCN-STIC / verificación', 'Observaciones / PTR', 'Riesgos del AR vinculados', 'Riesgo residual máx.', 'Hallazgos técnicos abiertos', 'Incidencias del auditor'];
async function exportXlsx() {
  ui.busyXlsx = true; render();
  try {
    const X = await loadXLSX();
    const wb = X.utils.book_new();
    const acc = getComputedStyle(document.documentElement).getPropertyValue('--accent-xl').trim().replace('#', '') || '0E7C7B';
    const C = { head: { font: { bold: true, color: { rgb: 'FFFFFF' }, name: 'Calibri', sz: 10 }, fill: { fgColor: { rgb: acc } }, alignment: { wrapText: true, vertical: 'center' } },
      cell: { font: { name: 'Calibri', sz: 10 }, alignment: { wrapText: true, vertical: 'top' } },
      title: { font: { bold: true, sz: 14, name: 'Calibri', color: { rgb: '0F1B22' } } }, sub: { font: { italic: true, sz: 10, name: 'Calibri', color: { rgb: '5B6B74' } } },
      lvl: { ALTO: 'FBE3E0', MEDIO: 'FBEFD9', BAJO: 'E3F2E8' }, risk: { MB: 'D4E8D9', B: 'AED3A6', M: 'F1D57E', A: 'EEA064', MA: 'D95B50' }, sev: { 'NC mayor': 'FBE3E0', 'NC menor': 'FBEFD9', 'Observación': 'E3F3F2' } };
    const sheet = (aoa, widths, headerRow = 0, opts = {}) => {
      const w = X.utils.aoa_to_sheet(aoa); const rng = X.utils.decode_range(w['!ref']);
      for (let R = rng.s.r; R <= rng.e.r; R++) for (let Cc = rng.s.c; Cc <= rng.e.c; Cc++) {
        const ref = X.utils.encode_cell({ r: R, c: Cc }); const cell = w[ref]; if (!cell) continue;
        cell.s = R === headerRow ? C.head : (R < headerRow ? (R === 0 ? C.title : C.sub) : C.cell);
        if (opts.fill) { const f = opts.fill(R, Cc, cell.v); if (f) cell.s = { ...cell.s, fill: { fgColor: { rgb: f } } }; }
      }
      w['!cols'] = widths.map((x) => ({ wch: x }));
      if (opts.autofilter !== false && headerRow >= 0) w['!autofilter'] = { ref: X.utils.encode_range({ s: { r: headerRow, c: 0 }, e: { r: rng.e.r, c: rng.e.c } }) };
      return w;
    };
    const p = state.portada || {};
    const port = [['DECLARACIÓN DE APLICABILIDAD (SoA) – ESQUEMA NACIONAL DE SEGURIDAD'], [`Real Decreto 311/2022 – Anexo II · Categoría del sistema: ${calc.categoria}`], ['Aspecto', 'Valor'],
      ['Organización', state.proyecto?.organizacion || ''], ['Sistema de información', state.proyecto?.sistema || ''], ['Código / versión del documento', state.proyecto?.codigoSoA || ''],
      ...Object.entries(p).filter(([k2]) => !['Organización', 'Sistema de información', 'Código / versión del documento'].includes(k2)).map(([k2, v]) => [k2, k2.startsWith('Categoría del sistema') ? `${calc.categoria}  (${E.DIMS.map((d) => `${d}=${calc.niveles[d] || '—'}`).join(' · ')})` : v]),
      ['Generado por', `${firma()} · ENS Compliance Studio ${VERSION} · ${today()}`]];
    X.utils.book_append_sheet(wb, sheet(port, [44, 110], 2, { autofilter: false }), 'Portada');
    const cat = [['Categorización del sistema – Anexo I RD 311/2022'], ['Valores permitidos: BAJO / MEDIO / ALTO. Nivel por dimensión = máximo; categoría = nivel más alto.'], [],
      ['Tipo', 'ID', 'Activo esencial (servicio / información)', 'Responsable de la Información / Servicio', 'D', 'I', 'C', 'A', 'T', 'Justificación de la valoración (Anexo I)'],
      ...state.categorizacion.map((a) => [a.tipo, a.id, a.nombre, a.responsable, a.D, a.I, a.C, a.A, a.T, a.justificacion || '']),
      ['RESULTADO', 'Nivel del sistema por dimensión', '', '', ...E.DIMS.map((d) => calc.niveles[d] || '—'), ''], ['CATEGORÍA', `Categoría del sistema (art. 40): ${calc.categoria}`, '', '', '', '', '', '', '', '']];
    X.utils.book_append_sheet(wb, sheet(cat, [12, 10, 44, 30, 9, 9, 9, 9, 9, 70], 3, { fill: (R, Cc, v) => (Cc >= 4 && Cc <= 8 && R > 3 ? (C.lvl[v] || (v && !E.ENS_LEVELS.includes(v) && v !== '—' ? 'D95B50' : null)) : null) }), 'Categorización');
    const soaRows = calc.filas.map((f) => {
      const d = f.decl || {}; const ax = D.anexo[f.codigo]; const fs = findingsFor(f.codigo);
      const refs = [...f.refuerzos.obligatorios, ...f.refuerzos.grupos.map((g) => `[${g.join(' o ')}]`)].join(' + ') || '—';
      return [f.familia, f.codigo, f.nombre, f.dims, ax.bajo, ax.medio, ax.alto, f.nivel, f.regla, f.exigencia, refs, d.refuerzos_elegidos || '—', d.aplica || '', d.justificacion || f.justAuto,
        d.org || '', d.tec || '', d.mc_ref || '—', d.estado || '', d.pct === null || d.pct === undefined || d.pct === '' ? '' : Number(d.pct), d.evidencias || '', d.responsable || '', ax.iso27001, ax.guias, d.observaciones || '',
        f.riesgos.map((r) => `${r.amenaza.id} (${r.resMax || '—'})`).join(', '), f.resMax || '', f.hallazgos.map((h) => `${h.id} CVSS ${h.cvss}`).join(', '), fs.map((x) => `${x.id} ${x.sev}`).join(', ')];
    });
    const wsSoa = sheet([SOA_HEADERS, ...soaRows], [22, 10, 32, 12, 12, 16, 22, 10, 22, 24, 18, 26, 12, 60, 50, 50, 14, 18, 10, 36, 22, 40, 22, 30, 30, 10, 22, 26], 0, {
      fill: (R, Cc, v) => (R === 0 ? null : Cc === 7 ? C.lvl[v] : Cc === 25 ? C.risk[v] : Cc === 27 && v ? (/NC mayor/.test(v) ? 'FBE3E0' : /NC menor/.test(v) ? 'FBEFD9' : 'E3F3F2') : null) });
    for (let R = 1; R <= soaRows.length; R++) { const ref = X.utils.encode_cell({ r: R, c: 18 }); if (wsSoa[ref] && typeof wsSoa[ref].v === 'number') wsSoa[ref].z = '0%'; }
    wsSoa['!freeze'] = { xSplit: 3, ySplit: 1 };
    X.utils.book_append_sheet(wb, wsSoa, 'SoA ENS');
    X.utils.book_append_sheet(wb, sheet([['Código medida', 'Medida', 'Refuerzo', 'Nombre del refuerzo', 'Nivel(es) en que se exige (Anexo II)', 'Nivel exigido', '¿Exigible?', 'Texto del refuerzo (RD 311/2022)', 'Implementación / alternativa elegida (ver SoA)'],
      ...state.refuerzos.map((r) => [r.codigo, r.medida, r.refuerzo, r.nombre, r.niveles, (calc.filas.find((f) => f.codigo === r.codigo) || {}).nivel || r.nivel_exigido, r.exigible, r.texto, r.implementacion])], [12, 28, 9, 36, 18, 12, 18, 80, 50]), 'Refuerzos');
    X.utils.book_append_sheet(wb, sheet([['ID', 'Medida / refuerzo ENS sustituido', 'Ámbito de aplicación', 'Limitaciones o restricciones', 'Objetivo de la medida original', 'Riesgo identificado', 'Definición de la(s) medida(s) compensatoria(s)', 'Validación de la medida compensatoria', 'Mantenimiento / revisión', 'Aprobación'],
      ...state.compensatorias.map((m) => [m.id, m.medida, m.ambito, m.limitaciones, m.objetivo, m.riesgo, m.definicion, m.validacion, m.mantenimiento, m.aprobacion])], [8, 30, 40, 40, 40, 40, 60, 40, 30, 30]), 'Medidas compensatorias');
    X.utils.book_append_sheet(wb, sheet([['ID', 'Activo', 'Tipo', 'Soporta', 'Amenaza', 'Nombre', 'Origen', 'Prob.', 'Inherente', 'Salvaguardas (madurez)', 'Prob. residual', 'Residual', '¿Fuera de apetito?', 'Medidas ENS', 'Tratamiento', 'Responsable', 'Plazo'],
      ...calc.riesgos.map((r) => [r.amenaza.id, r.activo.nombre, r.activo.tipo, (r.activo.soporta || []).join(', '), r.amenaza.codigo, r.amenaza.nombre, r.amenaza.origen === 'hallazgo' ? `Evidencia técnica (${r.amenaza.hallazgos.join(', ')})` : (r.amenaza.hallazgos?.length ? `AR + ${r.amenaza.hallazgos.join(', ')}` : 'AR'), r.amenaza.prob, r.inhMax || '', r.salvs.map((s) => `${s.codigo} (${s.madurez})`).join(', '), r.probRes, r.resMax || '', r.fueraApetito ? 'SÍ' : 'NO', r.ens.join(', '), r.tratamiento?.opcion || '', r.tratamiento?.responsable || '', r.tratamiento?.plazo || ''])],
      [9, 34, 10, 16, 9, 34, 22, 7, 10, 40, 10, 10, 10, 36, 12, 24, 12], 0, { fill: (R, Cc, v) => (R && (Cc === 8 || Cc === 11) ? C.risk[v] : R && Cc === 12 && v === 'SÍ' ? 'FBE3E0' : null) }), 'Análisis de riesgos');
    X.utils.book_append_sheet(wb, sheet([['ID', 'Hallazgo', 'Categoría', 'CWE', 'CVSS', 'Severidad', 'Activo', 'Estado', 'Amenaza MAGERIT', 'Medidas ENS afectadas', 'Fuente'],
      ...state.hallazgos.map((h) => { const c2 = HALL[h.categoria] || {}; return [h.id, h.titulo, c2.label || h.categoria, c2.cwe || '', Number(h.cvss) || 0, E.sevCvss(Number(h.cvss) || 0), `${h.activoId} ${activoNombre(h.activoId)}`, h.estado, c2.amenaza || '', (c2.ens || []).join(', '), h.fuente || '']; })], [8, 50, 30, 11, 7, 10, 34, 10, 12, 28, 34]), 'Evidencia técnica');
    X.utils.book_append_sheet(wb, sheet([['Regla', 'Severidad', 'Ámbito', 'Hallazgo', 'Detalle', 'Acción recomendada', 'Referencia'], ...audit.map((f) => [f.id, f.sev, f.ambito, f.titulo, f.detalle, f.recomendacion, f.ref])], [9, 12, 16, 40, 80, 60, 22], 0, { fill: (R, Cc, v) => (R && Cc === 1 ? C.sev[v] : null) }), 'Auditoría');
    X.utils.book_append_sheet(wb, sheet([['Prioridad', 'Acción', 'Detalle', 'Origen', 'Referencia', 'Responsable', 'Fecha límite', 'Estado'], ...plan.map((a) => [a.prioridad, a.titulo, a.detalle, a.origen, a.ref, a.responsable, a.fecha, a.estado])], [10, 60, 60, 18, 22, 24, 12, 12]), 'Plan de acción');
    const k = calc.kpi;
    const rs = [['Indicador', 'Valor'], ['Categoría del sistema', calc.categoria], ['Medidas del Anexo II', k.medidas], ['Medidas exigidas', k.aplicables], ['Medidas no exigidas', k.noAplicables], ['Implantadas', k.implantadas], ['Parciales (incl. compensadas)', k.parciales], ['Con medida compensatoria', k.compensadas], ['Pendientes de declarar', k.pendientes], ['Grado medio de implantación', k.grado], ['Riesgos analizados', k.riesgos], ['Riesgos fuera de apetito (con evidencia técnica)', k.fueraApetito], ['Riesgos fuera de apetito (AR aprobado)', k.fueraApetitoDeclarado], ['Hallazgos técnicos abiertos', k.hallazgosAbiertos], ['NC mayores', auditCount('NC mayor')], ['NC menores', auditCount('NC menor')], ['Observaciones', auditCount('Observación')], [], ['Familia', 'Grado de implantación'], ...calc.familias.map((f) => [f.familia, f.grado])];
    const wsR = sheet(rs, [48, 22], 0, { autofilter: false });
    for (let R = 1; R < rs.length; R++) { const r2 = X.utils.encode_cell({ r: R, c: 1 }); if (wsR[r2] && typeof wsR[r2].v === 'number' && (String(rs[R][0]).startsWith('Grado') || R > 18)) wsR[r2].z = '0.0%'; }
    X.utils.book_append_sheet(wb, wsR, 'Resumen');
    const out = X.write(wb, { bookType: 'xlsx', type: 'array' });
    await saveFile(`${slug()}_SoA_ENS_${today()}.xlsx`, new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  } catch (e) { toast(e.message || 'No se pudo generar el Excel'); } finally { ui.busyXlsx = false; render(); }
}

/* --- Importar SoA desde Excel (plantilla de 73 medidas) --- */
const normH = (s) => String(s ?? '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9%?]+/g, ' ').trim();
async function importXlsx(file) {
  if (!checkSize(file, LIM.fileXlsx, 'El Excel es')) return;
  try {
    const X = await loadXLSX();
    const wb = X.read(await file.arrayBuffer(), { type: 'array', cellFormula: false, cellHTML: false, sheetStubs: false });
    if (wb.SheetNames.length > 40) throw new Error('El libro tiene demasiadas hojas para ser una SoA.');
    const rowsOf = (name) => X.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: null, raw: true }).slice(0, 5000).map((r) => (r || []).slice(0, 60).map((c) => (c === null || typeof c === 'number' ? c : s(c))));
    const findHdr = (rows, must) => { for (let i = 0; i < Math.min(10, rows.length); i++) { const v = (rows[i] || []).map(normH); if (must.every((m) => v.includes(m))) return i; } return -1; };
    let soaName = null, soaRows = null, soaH = -1;
    for (const n of wb.SheetNames) { const r = rowsOf(n); const h = findHdr(r, ['codigo', '?aplica?'.replace(/^\?/, '')]); const h2 = h < 0 ? findHdr(r, ['codigo', 'aplica?']) : h; if (h2 >= 0) { soaName = n; soaRows = r; soaH = h2; break; } }
    if (!soaName) { for (const n of wb.SheetNames) { const r = rowsOf(n); const h = r.findIndex((row) => (row || []).some((c) => normH(c) === 'codigo') && (row || []).some((c) => /aplica/.test(normH(c)))); if (h >= 0 && h < 10) { soaName = n; soaRows = r; soaH = h; break; } } }
    if (!soaName) throw new Error('No encuentro una hoja de SoA con las columnas «Código» y «¿Aplica?».');
    const hdr = soaRows[soaH].map(normH);
    const col = (...keys) => hdr.findIndex((h) => keys.some((k) => h === normH(k) || h.startsWith(normH(k))));
    const cols = { codigo: col('Código'), aplica: col('¿Aplica?', 'Aplica'), just: col('Justificación'), org: col('Medidas ORGANIZATIVAS'), tec: col('Medidas TÉCNICAS'), mc: col('Medida compensatoria'), estado: col('Estado de implantación', 'Estado'), pct: col('% implantación'), ev: col('Evidencias'), resp: col('Responsable'), obs: col('Observaciones'), refs: col('Refuerzos / alternativa') };
    const st = blankState({});
    let n = 0;
    for (const r of soaRows.slice(soaH + 1)) {
      const code = String(r[cols.codigo] ?? '').trim(); if (!D.anexo[code]) continue;
      const g = (i) => (i >= 0 ? (r[i] ?? '') : '');
      let pv = g(cols.pct); if (typeof pv === 'string' && pv.trim()) { const x = parseFloat(pv.replace('%', '').replace(',', '.')); pv = isNaN(x) ? null : (x > 1 ? x / 100 : x); } else if (pv === '') pv = null;
      st.soa[code] = { aplica: String(g(cols.aplica)).trim(), estado: String(g(cols.estado)).trim() || 'Pendiente', pct: pv, justificacion: String(g(cols.just)), org: String(g(cols.org)), tec: String(g(cols.tec)), mc_ref: String(g(cols.mc)) || '—', evidencias: String(g(cols.ev)), responsable: String(g(cols.resp)), observaciones: String(g(cols.obs)), refuerzos_elegidos: String(g(cols.refs)) };
      n++;
    }
    // Categorización
    for (const name of wb.SheetNames) {
      const r = rowsOf(name); const h = findHdr(r, ['id', 'd', 'i', 'c', 'a', 't']); if (h < 0) continue;
      const hh = r[h].map(normH); const ix = (k) => hh.indexOf(k); const nameC = hh.findIndex((x) => x.startsWith('activo esencial')); const respC = hh.findIndex((x) => x.startsWith('responsable')); const tipoC = hh.indexOf('tipo');
      st.categorizacion = r.slice(h + 1).filter((row) => row && /^[A-Za-z]+-\d+/.test(String(row[ix('id')] || ''))).map((row) => ({ tipo: String(row[tipoC] || 'Servicio'), id: String(row[ix('id')]), nombre: String(row[nameC] || ''), responsable: String(row[respC] || ''), D: row[ix('d')], I: row[ix('i')], C: row[ix('c')], A: row[ix('a')], T: row[ix('t')], justificacion: '' }));
      break;
    }
    // Refuerzos
    const refName = wb.SheetNames.find((x) => normH(x) === 'refuerzos');
    if (refName) { const r = rowsOf(refName); const h = findHdr(r, ['codigo medida', 'refuerzo']); if (h >= 0) { const hh = r[h].map(normH); const ex = hh.findIndex((x) => x.startsWith('exigible')); const im = hh.findIndex((x) => x.startsWith('implementacion')); st.refuerzos = r.slice(h + 1).filter((row) => row && D.anexo[String(row[hh.indexOf('codigo medida')] || '').trim()]).map((row) => ({ codigo: String(row[hh.indexOf('codigo medida')]).trim(), medida: String(row[hh.indexOf('medida')] || ''), refuerzo: String(row[hh.indexOf('refuerzo')]).trim(), nombre: '', niveles: '', nivel_exigido: '', exigible: String(row[ex] ?? ''), texto: '', implementacion: String(row[im] ?? '') })); } }
    // Compensatorias
    const mcName = wb.SheetNames.find((x) => normH(x).startsWith('medidas compensatorias'));
    if (mcName) { const r = rowsOf(mcName); const h = findHdr(r, ['id']); if (h >= 0) { const hh = r[h].map(normH); const f = (p) => hh.findIndex((x) => x.startsWith(p)); const map = { medida: f('medida'), ambito: f('ambito'), limitaciones: f('limitaciones'), objetivo: f('objetivo'), riesgo: f('riesgo'), definicion: f('definicion'), validacion: f('validacion'), mantenimiento: f('mantenimiento'), aprobacion: f('aprobacion') }; st.compensatorias = r.slice(h + 1).filter((row) => row && /^MC-\d+/.test(String(row[hh.indexOf('id')] || ''))).map((row) => { const o = { id: String(row[hh.indexOf('id')]) }; for (const [k2, i] of Object.entries(map)) o[k2] = i >= 0 ? String(row[i] ?? '') : ''; return o; }); } }
    // Portada
    const pName = wb.SheetNames.find((x) => normH(x) === 'portada');
    if (pName) { for (const row of rowsOf(pName)) { const v = (row || []).filter((c) => c !== null && c !== ''); if (v.length === 2) st.portada[String(v[0]).trim()] = v[1]; } }
    st.proyecto.organizacion = String(st.portada['Organización'] || file.name.replace(/\.xlsx$/i, '')).replace(/\s+–.*$/, '');
    st.proyecto.nombre = st.proyecto.organizacion; st.proyecto.sistema = String(st.portada['Sistema de información'] || '');
    st.proyecto.codigoSoA = String(st.portada['Código / versión del documento'] || 'SOA').split('·')[0].trim();
    const arRef = String(st.portada['Análisis de riesgos de referencia (art. 14, [op.pl.1])'] || ''); st.proyecto.codigoAR = (arRef.match(/AR-[\w-]+/) || ['AR'])[0];
    createProject(st, { msg: `SoA importada: ${plural(n, 'medida', 'medidas')} y ${plural(st.categorizacion.length, 'activo esencial', 'activos esenciales')}` });
  } catch (e) { toast(e.message || 'No se pudo leer el Excel'); }
}
function parseCsv(text) {
  const rows = []; let row = [], cur = '', q = false;
  const first = text.split(/\r?\n/)[0]; const sep = (first.match(/;/g) || []).length > (first.match(/,/g) || []).length ? ';' : ',';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"' && text[i + 1] === '"') { cur += '"'; i++; } else if (ch === '"') q = false; else cur += ch; }
    else if (ch === '"') q = true; else if (ch === sep) { row.push(cur); cur = ''; } else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cur); rows.push(row); row = []; cur = ''; } else cur += ch;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  const h = (rows.shift() || []).map((x) => x.replace(/^﻿/, '').trim());
  return rows.filter((r) => r.some((x) => x.trim())).map((r) => Object.fromEntries(h.map((k, i) => [k, (r[i] || '').trim()])));
}
function importHallazgos(text, name) {
  let items;
  try { items = /\.json$/i.test(name) || /^\s*[[{]/.test(text) ? safeParse(text) : parseCsv(text); } catch (e) { toast('El fichero no es un CSV o JSON válido'); return; }
  if (!Array.isArray(items)) items = items.hallazgos || [];
  let ok = 0, bad = 0;
  for (const it of items) {
    const cat = String(it.categoria || '').toUpperCase(); const act = state.activos.find((a) => a.id === it.activoId || a.id === it.activo);
    if (!HALL[cat] || !act || isNaN(Number(it.cvss))) { bad++; continue; }
    const id = it.id && !state.hallazgos.some((h) => h.id === it.id) ? String(it.id) : nextId('H-', state.hallazgos, 2);
    if (state.hallazgos.length >= LIM.arr) { bad++; continue; }
    state.hallazgos.push({ id: idOk(id) || nextId('H-', state.hallazgos, 2), titulo: s(it.titulo || HALL[cat].label, 300), categoria: cat, cvss: num(it.cvss, 0, 10, 0), activoId: act.id, estado: /cerr/i.test(String(it.estado || '')) ? 'cerrado' : 'abierto', fuente: s(it.fuente || name, 200) });
    ok++;
  }
  commit(`${plural(ok, 'hallazgo importado', 'hallazgos importados')}${bad ? ` · ${bad} descartados (categoría, activo o CVSS no válidos)` : ''}`);
}
function importProyecto(text) {
  try {
    const o = safeParse(text);
    if (o && o.kind === 'ens-studio-backup') { restoreBackup(o); return; }
    if (!isObj(o) || !isObj(o.soa) || !Array.isArray(o.categorizacion)) throw new Error('formato');
    createProject(o, { msg: 'Proyecto importado' });
  } catch (e) { toast('No es un proyecto ni una copia de ENS Compliance Studio'); }
}
function backup() {
  const projects = ws.projects.map((p) => ({ meta: p, state: store.get(PKEY(p.id)) }));
  saveFile(`ens-studio_copia_${today()}.json`, JSON.stringify({ kind: 'ens-studio-backup', version: VERSION, fecha: new Date().toISOString(), profile: ws.profile, settings: ws.settings, projects }, null, 1));
}
function restoreBackup(b) {
  const nw = sanitizeWs({ profile: b.profile, settings: b.settings, projects: arr(b.projects, 300).map((x) => x && x.meta), onboarded: true, profileDone: true });
  ws.profile = nw.profile; ws.settings = nw.settings;
  let n = 0;
  for (const item of arr(b.projects, 300)) { if (!isObj(item) || !isObj(item.state)) continue; const meta = nw.projects.find((m) => m.id === item.meta?.id); if (!meta) continue; store.set(PKEY(meta.id), sanitizeState(item.state)); ws.projects = ws.projects.filter((p) => p.id !== meta.id); ws.projects.push(meta); n++; }
  ws.onboarded = true; ws.profileDone = true; saveWs(); applyTheme(); toast(`Copia restaurada: ${plural(n, 'proyecto', 'proyectos')}`); go('inicio');
}

/* --- Asistente de análisis (capacidad opcional de la plataforma) --- */
async function aiNS() { try { return window.claude && typeof window.claude.use === 'function' ? await window.claude.use('sample') : null; } catch (e) { return null; } }
async function aiAmenazas(id) {
  const s = await aiNS(); if (!s) return;
  const act = state.activos.find((a) => a.id === id); if (!act) return;
  const tipo = act.tipo.replace(/[[\]]/g, '').replace('essential.service', 'S').replace('essential.info', 'D');
  const cands = CAT_AM.filter((c) => c.tipos.includes(tipo));
  const ya = state.amenazas.filter((a) => a.activoId === id).map((a) => a.codigo);
  ui.ai = { ...ui.ai, busy: 'amenazas', activo: id, props: [], error: '' }; render();
  const prompt = `Eres analista de riesgos experto en MAGERIT v3 y en el Esquema Nacional de Seguridad (RD 311/2022).
Activo: ${act.nombre} (tipo ${act.tipo}). Descripción: ${act.descripcion || 'n/d'}. Valoración 0-10: ${JSON.stringify(act.valoracion)}.
Contexto: ${state.proyecto?.organizacion || ''}, sistema de categoría ${calc.categoria}.
Amenazas ya identificadas para este activo: ${ya.join(', ') || 'ninguna'}.
Catálogo MAGERIT aplicable (código: nombre · dimensiones): ${cands.map((c) => `${c.code}: ${c.nombre} · ${c.dims.join('')}`).join('; ')}.
Propón entre 3 y 5 amenazas NUEVAS del catálogo (no repitas las ya identificadas), las más relevantes para este activo concreto.
Responde SOLO con JSON: {"propuestas":[{"codigo":"[A.11]","prob":"MB|B|M|A|MA","deg":{"D":0,"I":0,"C":0,"A":0,"T":0},"motivo":"una frase en español"}]}. Degradación 0-100 en múltiplos de 10, solo en las dimensiones afectadas.`;
  try {
    const r = await s.json(prompt, { modelTier: 'default' });
    const props = (r && Array.isArray(r.propuestas) ? r.propuestas : []).map((p) => {
      const c = cands.find((x) => x.code === p.codigo) || CAT_AM.find((x) => x.code === p.codigo); if (!c || ya.includes(c.code)) return null;
      const deg = {}; for (const d of E.DIMS) deg[d] = Math.max(0, Math.min(100, Math.round((Number(p.deg?.[d]) || 0) / 10) * 10));
      return { codigo: c.code, nombre: c.nombre, prob: E.NIVELES.includes(p.prob) ? p.prob : 'M', deg, motivo: String(p.motivo || '').slice(0, 240) };
    }).filter(Boolean).slice(0, 5);
    ui.ai = { ...ui.ai, busy: null, props, error: props.length ? '' : 'La respuesta no contenía amenazas válidas del catálogo.' };
  } catch (e) { ui.ai = { ...ui.ai, busy: null, error: e && e.code === 'rate_limited' ? 'Demasiadas peticiones seguidas; espera un momento.' : e && e.code === 'not_granted' ? 'Permiso no concedido.' : 'No se pudo completar la petición.' }; }
  render();
}
async function aiJust(code) {
  const s = await aiNS(); if (!s) return;
  const f = calc.filas.find((x) => x.codigo === code); const d = f.decl || {};
  ui.ai = { ...ui.ai, busy: 'just', justCode: code, just: '', error: '' }; render();
  const prompt = `Redacta la justificación de aplicabilidad de la medida ${code} "${f.nombre}" para la Declaración de Aplicabilidad del ENS (RD 311/2022, art. 28) de ${state.proyecto?.organizacion || 'la organización'}.
Datos: categoría ${calc.categoria}; dimensiones ${f.dims}; nivel exigido ${f.nivel} (${f.regla}); exigencia '${f.exigencia}'; ¿exigida? ${f.aplicaNorma ? 'sí' : 'no'}; aplicabilidad declarada ${d.aplica || 'n/d'}; estado ${d.estado || 'n/d'}.
Riesgos que trata: ${f.riesgos.map((r) => `${r.amenaza.id} ${r.amenaza.nombre} (residual ${r.resMax})`).join('; ') || 'ninguno'}.
Medidas implantadas: ${String(d.org || '').slice(0, 400)} ${String(d.tec || '').slice(0, 400)}. Compensatoria: ${d.mc_ref || 'ninguna'}.
Texto normativo (extracto): ${String(D.anexo[code].texto).slice(0, 900)}
Escribe 2-4 frases en español, registro formal, empezando por "APLICA:" o "NO APLICA:". Sin viñetas ni comillas.`;
  try { const r = await s(prompt, { modelTier: 'default' }); ui.ai = { ...ui.ai, busy: null, just: String(r.text || '').trim() }; }
  catch (e) { ui.ai = { ...ui.ai, busy: null, error: 'No se pudo redactar la propuesta.' }; }
  render();
}
