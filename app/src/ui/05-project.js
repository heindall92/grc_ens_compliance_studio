/* ---------- Vistas del proyecto ---------- */
function kpiTile(label, value, sub, opts = {}) {
  const d = opts.delta;
  const delta = d === undefined || d === null || d === 0 ? '' : `<span class="delta ${(opts.goodDown ? d < 0 : d > 0) ? 'good' : 'bad'}">${d > 0 ? '▲' : '▼'} ${opts.fmt ? opts.fmt(Math.abs(d)) : Math.abs(d)}</span>`;
  return `<div class="kpi${opts.alert ? ' alert' : ''}"><span class="kpi-l">${opts.ic ? icon(opts.ic, 16) : ''}${label}</span><span class="kpi-v num">${value}${delta}</span><span class="kpi-s">${sub}</span></div>`;
}
function evolucion() {
  const h = (state.historial || []).slice(-8);
  if (h.length < 2) return emptyState('clock', 'La evolución aparecerá aquí', 'Cada día que trabajes en el proyecto se guarda una instantánea de las no conformidades.');
  const W = 560, H = 190, P = { l: 30, r: 8, t: 12, b: 26 };
  const max = Math.max(4, ...h.map((x) => x.ncMayor + x.ncMenor));
  const step = Math.ceil(max / 4); const top = step * 4;
  const bw = (W - P.l - P.r) / h.length; const y = (v) => P.t + (H - P.t - P.b) * (1 - v / top);
  let g = '';
  for (let i = 0; i <= 4; i++) { const v = step * i; g += `<line x1="${P.l}" x2="${W - P.r}" y1="${y(v)}" y2="${y(v)}" class="grid-l"/><text x="${P.l - 6}" y="${y(v) + 3.5}" class="ax-t" text-anchor="end">${v}</text>`; }
  h.forEach((s, i) => {
    const x = P.l + i * bw + bw * 0.22, w = bw * 0.56;
    const y1 = y(s.ncMayor), y2 = y(s.ncMayor + s.ncMenor);
    const lab = new Date(s.fecha + 'T00:00:00').toLocaleDateString(locale(), { day: 'numeric', month: 'short' });
    g += `<g class="bar-g" data-tip="${esc(lab)} · ${plural(s.ncMayor, 'NC mayor', 'NC mayores')} · ${plural(s.ncMenor, 'NC menor', 'NC menores')} · implantación ${pct(s.grado, 0)}">
      <rect x="${x - bw * 0.2}" y="${P.t}" width="${bw * 0.96}" height="${H - P.t - P.b}" class="hit"/>
      <path d="M${x},${y(0)} V${y1 + 2} a2,2 0 0 1 2,-2 H${x + w - 2} a2,2 0 0 1 2,2 V${y(0)} Z" class="s-mayor"/>
      ${s.ncMenor ? `<path d="M${x},${y1 - 2} V${y2 + 3} a3,3 0 0 1 3,-3 H${x + w - 3} a3,3 0 0 1 3,3 V${y1 - 2} Z" class="s-menor"/>` : ''}
      <text x="${x + w / 2}" y="${H - 8}" class="ax-t" text-anchor="middle">${lab}</text></g>`;
  });
  const ejemplo = h.some((x) => x.ejemplo);
  return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Evolución de no conformidades">${g}</svg>
    <div class="legend"><span><i class="lg s-mayor"></i>NC mayores</span><span><i class="lg s-menor"></i>NC menores</span>${ejemplo ? '<span class="muted small">· incluye historial de ejemplo</span>' : ''}</div>`;
}
function vPanel() {
  const k = calc.kpi;
  const objetadas = new Set(audit.filter((f) => f.sev === 'NC mayor').map((f) => String(f.ambito).split(' ')[0]));
  const limpias = calc.filas.filter((f) => f.aplicaNorma && f.decl && /^implantada$/i.test(f.decl.estado || '') && E.pctDe(f.decl) >= 1 && !objetadas.has(f.codigo)).length;
  const h = state.historial || []; const prev = h.length > 1 ? h[h.length - 2] : null;
  const fam = [...calc.familias].sort((a, b) => a.grado - b.grado);
  const abiertas = plan.filter((a) => a.estado !== 'Hecha' && !a.verificada);
  const vencidas = abiertas.filter((a) => a.fecha && a.fecha < today()).length;
  const p = state.proyecto || {};
  return `${pageHead(esc(p.organizacion || ''), 'Panel de conformidad', `${esc(p.sistema || '')}${p.codigoSoA ? ` · ${esc(p.codigoSoA)}` : ''}${p.codigoAR ? ` · ${esc(p.codigoAR)}` : ''}`,
    `<button type="button" class="btn" data-act="export-md">${icon('download', 16)}Informe</button><button type="button" class="btn primary" data-act="export-xlsx">${icon('sheet', 16)}SoA en Excel</button>`)}
  ${k.pendientes ? `<div class="progress-card card"><div><b>Declaración en curso</b><p class="muted small">${plural(k.aplicables - k.pendientes, 'medida declarada', 'medidas declaradas')} de ${k.aplicables} exigidas.</p></div><div class="pbar lg"><span class="bar"><i style="width:${((k.aplicables - k.pendientes) / Math.max(1, k.aplicables) * 100).toFixed(1)}%"></i></span><span class="num">${Math.round((k.aplicables - k.pendientes) / Math.max(1, k.aplicables) * 100)} %</span></div><button type="button" class="btn sm primary" data-act="soa-pend">Continuar${icon('arrowRight', 15)}</button></div>` : ''}
  <div class="kpi-grid">
    ${kpiTile('Implantación declarada', pct(k.grado), `Media de las ${k.aplicables} medidas exigidas`, { ic: 'fileCheck', delta: prev ? Math.round((k.grado - prev.grado) * 1000) / 10 : null, fmt: (v) => v.toFixed(1) + ' pp' })}
    ${kpiTile('Implantadas sin objeción', `${limpias}<small>/${k.implantadas}</small>`, 'Implantadas al 100 % sin NC mayor', { ic: 'shieldCheck', alert: limpias < k.implantadas })}
    ${kpiTile('Riesgos fuera de apetito', `${k.fueraApetito}<small> antes ${k.fueraApetitoDeclarado}</small>`, `Con la evidencia técnica · apetito ${state.apetito}`, { ic: 'activity', alert: k.fueraApetito > k.fueraApetitoDeclarado })}
    ${kpiTile('No conformidades', `${auditCount('NC mayor')}<small> mayores · ${auditCount('NC menor')} menores</small>`, `${plural(auditCount('Observación'), 'observación', 'observaciones')}`, { ic: 'alert', delta: prev ? auditCount('NC mayor') - prev.ncMayor : null, goodDown: true })}
  </div>
  <div class="grid g-main">
    <div class="card"><div class="card-head"><h3>Evolución</h3><span class="muted small">No conformidades abiertas</span></div>${evolucion()}</div>
    <div class="card"><div class="card-head"><h3>Próximas acciones</h3><button type="button" class="btn ghost sm" data-act="nav" data-view="plan">Plan completo${icon('arrowRight', 15)}</button></div>
      <div class="mini-stats"><span><b class="num">${abiertas.length}</b> abiertas</span><span class="${vencidas ? 'crit-t' : ''}"><b class="num">${vencidas}</b> vencidas</span><span><b class="num">${plan.filter((a) => a.estado === 'Hecha').length}</b> hechas</span></div>
      <ul class="act-list">${abiertas.slice(0, 5).map((a) => `<li><span class="prio ${a.prioridad === 'Alta' ? 'hi' : 'mid'}"></span><div><b>${esc(a.titulo)}</b><small>${esc(a.origen)}${a.fecha ? ` · ${fmtDate(a.fecha)}` : ''}${a.responsable ? ` · ${esc(a.responsable)}` : ''}</small></div></li>`).join('') || '<li class="muted small">Sin acciones abiertas.</li>'}</ul></div>
  </div>
  <div class="grid g3">
    <div class="card"><div class="card-head"><h3>Riesgo inherente</h3><span class="muted small">${plural(k.riesgos, 'riesgo', 'riesgos')}</span></div>${heatmap(calc.riesgos, 'impInh', 'probIn')}</div>
    <div class="card"><div class="card-head"><h3>Residual declarado</h3><span class="muted small">AR aprobado</span></div>${heatmap(calc.riesgosDeclarados, 'impRes', 'probRes')}</div>
    <div class="card"><div class="card-head"><h3>Residual real</h3><span class="muted small">con evidencia técnica</span></div>${heatmap(calc.riesgos, 'impRes', 'probRes')}</div>
  </div>
  <div class="grid g2">
    <div class="card"><div class="card-head"><h3>Implantación por familia</h3><span class="muted small">de menor a mayor</span></div>
      <div class="bars">${fam.map((f) => `<div class="bar-row" data-tip="${esc(f.familia)}: ${plural(f.n, 'medida exigida', 'medidas exigidas')}"><span class="nm"><code>${esc(f.prefijo)}</code> ${esc(f.familia)}</span><span class="bar"><i class="${f.grado < 1 ? 'part' : ''}" style="width:${(f.grado * 100).toFixed(1)}%"></i></span><span class="pc num">${Math.round(f.grado * 100)} %</span></div>`).join('') || '<p class="muted small">Aún no hay medidas declaradas.</p>'}</div></div>
    <div class="card"><div class="card-head"><h3>Lo que ha encontrado el auditor</h3><button type="button" class="btn ghost sm" data-act="nav" data-view="auditoria">Ver ${audit.length}${icon('arrowRight', 15)}</button></div>
      <div class="findings compact">${audit.slice(0, 5).map((f) => findingCard(f, true)).join('') || emptyState('check', 'Sin incidencias', 'El auditor no encuentra nada que objetar.')}</div></div>
  </div>`;
}
function findingCard(f, compact = false) {
  const code = String(f.ambito).split(' ')[0];
  return `<div class="finding ${sevClass(f.sev)}"><div class="f-hd">${sevBadge(f.sev)}<code class="muted">${esc(f.id)}</code>${D.anexo[code] ? codeChip(code) : `<span class="chip">${esc(f.ambito)}</span>`}</div>
    <b class="f-t">${esc(f.titulo)}</b><p class="f-d">${esc(f.detalle)}</p>${compact ? '' : `<p class="f-r">${icon('arrowRight', 14)}${esc(f.recomendacion)}</p><span class="f-ref">${esc(f.ref)}</span>`}</div>`;
}

/* --- Categorización --- */
function vCat() {
  const rows = state.categorizacion.map((a, i) => {
    const sel = (d) => {
      const v = a[d]; const l = E.ensLevel(v); const bad = l === undefined;
      return `<td class="c"><select id="cat-${i}-${d}" class="lvl${bad ? ' bad' : ` l-${l || 'none'}`}" data-set="categorizacion.${i}.${d}" aria-label="${esc(a.id)} ${E.DIM_LABEL[d]}">
        ${bad ? `<option value="${esc(v)}" selected>'${esc(v)}' ⚠</option>` : ''}${opt('', '—', l === null ? '' : '#')}${E.ENS_LEVELS.map((x) => opt(x, x[0] + x.slice(1).toLowerCase(), l || '')).join('')}</select></td>`;
    };
    return `<tr><td><select id="cat-${i}-tipo" data-set="categorizacion.${i}.tipo">${['Servicio', 'Información'].map((t) => opt(t, t, a.tipo)).join('')}</select></td>
      <td><code>${esc(a.id)}</code></td>
      <td><input type="text" id="cat-${i}-n" class="w-full" data-set="categorizacion.${i}.nombre" value="${esc(a.nombre)}" aria-label="Nombre del activo esencial"></td>
      <td><input type="text" id="cat-${i}-r" class="w-full" data-set="categorizacion.${i}.responsable" value="${esc(a.responsable || '')}" aria-label="Responsable"></td>
      ${E.DIMS.map(sel).join('')}
      <td class="c"><button type="button" class="icon-btn sm" data-act="del-cat" data-i="${i}" aria-label="Eliminar ${esc(a.id)}">${icon('trash', 16)}</button></td></tr>`;
  }).join('');
  const refs = calc.filas.filter((f) => f.aplicaNorma).reduce((a, f) => ({ o: a.o + f.refuerzos.obligatorios.length, g: a.g + f.refuerzos.grupos.flat().length }), { o: 0, g: 0 });
  const conseq = { 'ALTA': 'Auditoría formal bienal y Certificación de Conformidad por entidad acreditada (arts. 31 y 38).', 'MEDIA': 'Auditoría formal bienal y Certificación de Conformidad (arts. 31 y 38).', 'BÁSICA': 'Autoevaluación bienal y Declaración de Conformidad (arts. 31 y 38).' }[calc.categoria];
  return `${pageHead('RD 311/2022 · art. 40 y Anexo I', 'Categorización del sistema', 'Valora cada activo esencial en las cinco dimensiones. El nivel del sistema en cada dimensión es el máximo de sus activos, y la categoría es el nivel más alto. Todo lo demás se recalcula al instante.',
    `<button type="button" class="btn" data-act="add-cat">${icon('plus', 16)}Añadir activo esencial</button>`)}
  ${calc.invalidos.length ? `<div class="alert warn">${icon('alert', 18)}<div><b>${plural(calc.invalidos.length, 'valor no válido', 'valores no válidos')}</b> (${calc.invalidos.map((x) => `${x.activo}·${x.dim} = '${esc(x.valor)}'`).join(', ')}). Se ignoran en el cálculo y el auditor los reporta como CAT-01. Corrígelos eligiendo un nivel.</div></div>` : ''}
  <div class="grid g-cat">
    <div class="cat-result card"><div class="seal ${calc.categoria === 'BÁSICA' ? 'BASICA' : calc.categoria}"><small>Categoría</small><b>${calc.categoria}</b></div>
      <div class="dim-levels">${E.DIMS.map((d) => `<div><span class="dim ${d}">${d}</span><span class="lvl-tag l-${calc.niveles[d] || 'none'}">${calc.niveles[d] ? calc.niveles[d][0] + calc.niveles[d].slice(1).toLowerCase() : '—'}</span><small>${E.DIM_LABEL[d]}</small></div>`).join('')}</div>
      <p class="small muted">${conseq}</p></div>
    <div class="card"><h3>Qué exige esta categorización</h3>
      <div class="req-grid"><div><b class="num">${calc.kpi.aplicables}</b><span>medidas exigidas de 73</span></div><div><b class="num">${refs.o}</b><span>refuerzos obligatorios</span></div><div><b class="num">${refs.g}</b><span>en grupos alternativos</span></div></div>
      <p class="small muted" style="margin-top:12px">No exigidas: ${calc.filas.filter((f) => !f.aplicaNorma).map((f) => codeChip(f.codigo)).join(' ') || '—'}</p></div>
  </div>
  <div class="table-wrap"><table class="tbl">
    <thead><tr><th>Tipo</th><th>ID</th><th>Activo esencial</th><th>Responsable</th>${E.DIMS.map((d) => `<th class="c" title="${E.DIM_LABEL[d]}"><span class="dim ${d}">${d}</span></th>`).join('')}<th></th></tr></thead>
    <tbody>${rows || `<tr><td colspan="11">${emptyState('layers', 'Sin activos esenciales', 'Añade la información y los servicios que maneja el sistema.')}</td></tr>`}</tbody></table></div>`;
}

/* --- Análisis de riesgos --- */
function vRiesgos() {
  const tabs = [['registro', 'Registro de riesgos'], ['activos', `Activos · ${state.activos.length}`], ['amenazas', `Amenazas · ${state.amenazas.length}`], ['salvaguardas', `Salvaguardas · ${state.salvaguardas.length}`]];
  const body = ({ registro: rRegistro, activos: rActivos, amenazas: rAmenazas, salvaguardas: rSalvs })[ui.riesgosTab]();
  return `${pageHead(`MAGERIT v3 · ${esc(state.proyecto?.codigoAR || '')}`, 'Análisis de riesgos', 'Impacto = valor × degradación; riesgo según la matriz 5×5; eficacia de cada salvaguarda modulada por su madurez (L0–L5). Cada amenaza queda enlazada con las medidas del ENS que la tratan.')}
  <div class="tabs" role="tablist">${tabs.map(([id, l]) => `<button type="button" role="tab" data-act="riesgos-tab" data-tab="${id}" aria-selected="${ui.riesgosTab === id}">${l}</button>`).join('')}</div>${body}`;
}
function rRegistro() {
  const rows = E.registroRiesgos(state, CTX, ui.conHallazgos, { cvss: ws.settings.cvss });
  rows.sort((a, b) => (E.NN[b.resMax] || 0) - (E.NN[a.resMax] || 0) || (E.NN[b.inhMax] || 0) - (E.NN[a.inhMax] || 0));
  const nFuera = rows.filter((r) => r.fueraApetito).length;
  const tr = rows.map((r) => {
    const t = r.tratamiento || {}; const hid = r.amenaza.id;
    return `<tr class="${r.amenaza.origen === 'hallazgo' ? 'derived' : ''}">
      <td><code>${esc(hid)}</code>${r.amenaza.hallazgos?.length ? `<div><span class="badge warn" title="Afectado por evidencia técnica">${r.amenaza.hallazgos.join(', ')}</span></div>` : ''}</td>
      <td><b class="t-strong">${esc(r.activo.nombre || r.amenaza.activoId)}</b><div class="muted small">${esc(r.amenaza.activoId)}</div></td>
      <td><code class="muted">${esc(r.amenaza.codigo)}</code> ${esc(r.amenaza.nombre)}</td>
      <td class="c"><code>${esc(r.amenaza.prob)}</code></td>
      <td class="c">${riskChip(r.inhMax)}</td>
      <td><div class="chips">${r.salvs.map((s) => `<span class="chip" title="${esc(s.nombre)}">${esc(s.codigo)} <em>${s.madurez}</em></span>`).join('') || '<span class="muted small">ninguna</span>'}</div></td>
      <td class="c">${riskChip(r.resMax)}${r.fueraApetito ? '<div class="over">sobre apetito</div>' : ''}</td>
      <td><div class="chips">${r.ens.map(codeChip).join('')}</div></td>
      <td class="tr-cell"><div class="tr-grid"><select id="tr-${hid}-o" data-set="tratamiento.${hid}.opcion" aria-label="Opción de tratamiento">${opt('', 'Decidir…', t.opcion || '')}${['mitigar', 'transferir', 'evitar', 'aceptar'].map((o) => opt(o, o[0].toUpperCase() + o.slice(1), t.opcion)).join('')}</select>
        <input type="date" id="tr-${hid}-p" data-set="tratamiento.${hid}.plazo" value="${esc(t.plazo || '')}" aria-label="Plazo">
        <input type="text" id="tr-${hid}-r" data-set="tratamiento.${hid}.responsable" value="${esc(t.responsable || '')}" placeholder="Responsable" aria-label="Responsable"></div></td></tr>`;
  }).join('');
  return `<div class="toolbar">
      <label class="inline-fld">Apetito<select id="apetito" data-set="apetito">${E.NIVELES.map((n) => opt(n, `${n} · ${E.NIVEL_LABEL[n]}`, state.apetito)).join('')}</select></label>
      <label class="switch-l"><span class="switch"><input type="checkbox" id="sw-hall" data-act="toggle-hall"${ui.conHallazgos ? ' checked' : ''}><span></span></span>Aplicar la evidencia técnica</label>
      <span class="spacer"></span><span class="badge ${nFuera ? 'crit' : 'ok'}">${plural(nFuera, 'riesgo', 'riesgos')} por encima del apetito</span></div>
    <div class="grid g2"><div class="card"><div class="card-head"><h3>Inherente</h3></div>${heatmap(rows, 'impInh', 'probIn')}</div><div class="card"><div class="card-head"><h3>Residual</h3><span class="muted small">tras salvaguardas</span></div>${heatmap(rows, 'impRes', 'probRes')}</div></div>
    <div class="table-wrap"><table class="tbl wide">
      <thead><tr><th>ID</th><th>Activo</th><th>Amenaza</th><th class="c">Prob.</th><th class="c">Inherente</th><th>Salvaguardas</th><th class="c">Residual</th><th>Medidas ENS</th><th>Tratamiento</th></tr></thead>
      <tbody>${tr || `<tr><td colspan="9">${emptyState('activity', 'Aún no hay amenazas', 'Da de alta activos y amenazas en las pestañas de al lado.')}</td></tr>`}</tbody></table></div>
    <p class="muted small">Las filas resaltadas son riesgos que no estaban en el análisis aprobado y han aparecido por un hallazgo técnico abierto.</p>`;
}
function rActivos() {
  const aiOn = ui.ai.available && ws.settings.asistente;
  const rows = state.activos.map((a, i) => `<tr>
    <td><code>${esc(a.id)}</code></td>
    <td><input type="text" id="ac-${i}-n" class="w-full" data-set="activos.${i}.nombre" value="${esc(a.nombre)}" aria-label="Nombre"><input type="text" id="ac-${i}-d" class="w-full sub" data-set="activos.${i}.descripcion" value="${esc(a.descripcion || '')}" placeholder="Descripción" aria-label="Descripción"></td>
    <td><select id="ac-${i}-t" data-set="activos.${i}.tipo">${TIPOS.map((t) => opt(t.code, `${t.code} ${t.label}`, a.tipo)).join('')}</select></td>
    <td><input type="text" id="ac-${i}-s" data-set="activos.${i}.soporta" data-type="list" value="${esc((a.soporta || []).join(', '))}" placeholder="S-01, I-01" class="w-md" aria-label="Activos esenciales que soporta"></td>
    ${E.DIMS.map((d) => `<td class="c"><input type="number" min="0" max="10" id="ac-${i}-${d}" data-set="activos.${i}.valoracion.${d}" data-type="num" value="${a.valoracion?.[d] ?? 0}" class="num-in" aria-label="${E.DIM_LABEL[d]}"></td>`).join('')}
    <td class="c nowrap">${aiOn ? `<button type="button" class="btn sm" data-act="ai-amenazas" data-id="${esc(a.id)}"${ui.ai.busy ? ' disabled' : ''}>${icon('lightbulb', 15)}Sugerir</button>` : ''}<button type="button" class="icon-btn sm" data-act="del-activo" data-i="${i}" aria-label="Eliminar ${esc(a.id)}">${icon('trash', 16)}</button></td></tr>`).join('');
  return `<div class="toolbar"><p class="muted small">Valoración 0–10 por dimensión (MAGERIT, Libro II). «Soporta» enlaza el activo con los activos esenciales de la categorización.</p><span class="spacer"></span><button type="button" class="btn" data-act="add-activo">${icon('plus', 16)}Añadir activo</button></div>
    ${aiBox()}
    <div class="table-wrap"><table class="tbl wide"><thead><tr><th>ID</th><th>Activo</th><th>Tipo</th><th>Soporta</th>${E.DIMS.map((d) => `<th class="c"><span class="dim ${d}">${d}</span></th>`).join('')}<th></th></tr></thead><tbody>${rows || `<tr><td colspan="10">${emptyState('server', 'Sin activos', 'Añade los activos que soportan tus servicios: datos, aplicaciones, equipos, redes, personas…')}</td></tr>`}</tbody></table></div>`;
}
function aiBox() {
  const a = ui.ai;
  if (!a.available || !ws.settings.asistente || !a.activo) return '';
  const act = state.activos.find((x) => x.id === a.activo); if (!act) return '';
  if (a.busy === 'amenazas') return `<div class="assist">${icon('lightbulb', 18)}<div><b>Analizando ${esc(act.nombre)}…</b><p class="small muted">Revisando el catálogo MAGERIT para este tipo de activo.</p></div></div>`;
  if (a.error) return `<div class="assist">${icon('alert', 18)}<div><b>No se pudo generar la propuesta</b><p class="small">${esc(a.error)}</p></div></div>`;
  if (!a.props.length) return '';
  return `<div class="assist col"><div class="row spread"><b>${icon('lightbulb', 16)} Amenazas sugeridas para ${esc(act.nombre)}</b><button type="button" class="icon-btn sm" data-act="ai-close" aria-label="Cerrar">${icon('x', 16)}</button></div>
    <p class="small muted">Propuesta basada en el catálogo MAGERIT. Revísala antes de incorporarla.</p>
    ${a.props.map((p, i) => `<div class="proposal"><div><code class="muted">${esc(p.codigo)}</code> <b>${esc(p.nombre)}</b> · prob. <code>${esc(p.prob)}</code> · ${E.DIMS.filter((d) => p.deg[d]).map((d) => `${d} ${p.deg[d]} %`).join(', ') || '—'}<div class="small muted">${esc(p.motivo || '')}</div></div>
      <button type="button" class="btn sm" data-act="ai-add" data-i="${i}"${p.added ? ' disabled' : ''}>${p.added ? icon('check', 15) + 'Añadida' : icon('plus', 15) + 'Añadir'}</button></div>`).join('')}</div>`;
}
function rAmenazas() {
  const rows = state.amenazas.map((am, i) => {
    const act = state.activos.find((a) => a.id === am.activoId);
    const tipo = act ? act.tipo.replace(/[[\]]/g, '').replace('essential.service', 'S').replace('essential.info', 'D') : '';
    const cands = CAT_AM.filter((c) => !tipo || c.tipos.includes(tipo) || c.code === am.codigo);
    return `<tr><td><code>${esc(am.id)}</code></td>
      <td><select id="am-${i}-a" data-set="amenazas.${i}.activoId">${state.activos.map((a) => opt(a.id, `${a.id} · ${a.nombre}`, am.activoId)).join('')}</select></td>
      <td><select id="am-${i}-c" data-set="amenazas.${i}.codigo" data-sync-name="${i}">${cands.map((c) => opt(c.code, `${c.code} ${c.nombre}`, am.codigo)).join('')}</select></td>
      <td class="c"><select id="am-${i}-p" class="lvl" data-set="amenazas.${i}.prob">${E.NIVELES.map((n) => opt(n, n, am.prob)).join('')}</select></td>
      ${E.DIMS.map((d) => `<td class="c"><input type="number" min="0" max="100" step="10" id="am-${i}-${d}" data-set="amenazas.${i}.deg.${d}" data-type="num" value="${am.deg?.[d] ?? 0}" class="num-in" aria-label="Degradación ${E.DIM_LABEL[d]}"></td>`).join('')}
      <td><div class="chips">${(D.mapping.amenaza_ens[am.codigo] || []).map(codeChip).join('')}</div></td>
      <td class="c"><button type="button" class="icon-btn sm" data-act="del-amenaza" data-i="${i}" aria-label="Eliminar ${esc(am.id)}">${icon('trash', 16)}</button></td></tr>`;
  }).join('');
  return `<div class="toolbar"><p class="muted small">Probabilidad de MB a MA y degradación en % por dimensión. El catálogo se filtra según el tipo del activo.</p><span class="spacer"></span><button type="button" class="btn" data-act="add-amenaza"${state.activos.length ? '' : ' disabled'}>${icon('plus', 16)}Añadir amenaza</button></div>
    <div class="table-wrap"><table class="tbl wide"><thead><tr><th>ID</th><th>Activo</th><th>Amenaza (catálogo MAGERIT)</th><th class="c">Prob.</th>${E.DIMS.map((d) => `<th class="c"><span class="dim ${d}">${d}</span></th>`).join('')}<th>Medidas ENS</th><th></th></tr></thead><tbody>${rows || `<tr><td colspan="11">${emptyState('alert', 'Sin amenazas', state.activos.length ? 'Añade amenazas a tus activos.' : 'Primero da de alta algún activo.')}</td></tr>`}</tbody></table></div>`;
}
function rSalvs() {
  const rows = state.salvaguardas.map((s, i) => `<tr>
    <td><code>${esc(s.id)}</code></td>
    <td><select id="sa-${i}-c" data-set="salvaguardas.${i}.codigo">${CAT_SAL.map((c) => opt(c.code, `${c.code} · ${c.nombre}`, s.codigo)).join('')}</select><input type="text" id="sa-${i}-n" class="w-full sub" data-set="salvaguardas.${i}.nombre" value="${esc(s.nombre)}" aria-label="Descripción de la salvaguarda"></td>
    <td><select id="sa-${i}-m" data-set="salvaguardas.${i}.madurez">${Object.entries(E.MADUREZ).map(([k, v]) => opt(k, `${k} · ${v.label}`, s.madurez)).join('')}</select></td>
    <td class="c"><input type="number" min="0" max="100" step="10" id="sa-${i}-rp" data-set="salvaguardas.${i}.reduceProb" data-type="num" value="${s.reduceProb}" class="num-in" aria-label="Reducción de probabilidad"></td>
    <td class="c"><input type="number" min="0" max="100" step="10" id="sa-${i}-ri" data-set="salvaguardas.${i}.reduceImp" data-type="num" value="${s.reduceImp}" class="num-in" aria-label="Reducción de impacto"></td>
    <td><div class="cover">${state.amenazas.map((am) => `<label title="${esc(am.nombre)} · ${esc(activoNombre(am.activoId))}"><input type="checkbox" data-cover="${i}" value="${esc(am.id)}"${(s.cubre || []).includes(am.id) ? ' checked' : ''}>${esc(am.id)}</label>`).join('')}</div></td>
    <td><div class="chips">${(D.mapping.salvaguarda_ens[s.codigo] || []).map(codeChip).join('')}</div></td>
    <td class="c"><button type="button" class="icon-btn sm" data-act="del-salv" data-i="${i}" aria-label="Eliminar ${esc(s.id)}">${icon('trash', 16)}</button></td></tr>`).join('');
  return `<div class="toolbar"><p class="muted small">Eficacia = reducción × factor de madurez (L0 0 · L1 0,1 · L2 0,3 · L3 0,5 · L4 0,7 · L5 1). Varias salvaguardas se combinan como 1 − Π(1 − eficacia).</p><span class="spacer"></span><button type="button" class="btn" data-act="add-salv">${icon('plus', 16)}Añadir salvaguarda</button></div>
    <div class="table-wrap"><table class="tbl wide"><thead><tr><th>ID</th><th>Salvaguarda</th><th>Madurez</th><th class="c">↓ Prob.</th><th class="c">↓ Imp.</th><th>Amenazas que cubre</th><th>Medidas ENS</th><th></th></tr></thead><tbody>${rows || `<tr><td colspan="8">${emptyState('shieldCheck', 'Sin salvaguardas', 'Registra los controles que ya tienes y a qué amenazas afectan.')}</td></tr>`}</tbody></table></div>`;
}

/* --- SoA --- */
function soaFiltered() {
  const q = ui.soaQ.trim().toLowerCase();
  const incid = new Set(audit.map((f) => String(f.ambito).split(' ')[0]));
  return calc.filas.filter((f) => {
    if (ui.soaMarco !== 'todos' && !f.codigo.startsWith(ui.soaMarco)) return false;
    const d = f.decl || {};
    if (ui.soaEstado === 'aplicables' && !f.aplicaNorma) return false;
    if (ui.soaEstado === 'noaplica' && f.aplicaNorma) return false;
    if (ui.soaEstado === 'incidencias' && !incid.has(f.codigo)) return false;
    if (ui.soaEstado === 'pendientes' && !(f.aplicaNorma && E.esPendiente(d))) return false;
    if (ui.soaEstado === 'parciales' && !/parcial|compensada|planificad/i.test((d.estado || '') + (d.aplica || ''))) return false;
    if (q && !(`${f.codigo} ${f.nombre} ${f.familia} ${d.responsable || ''} ${D.anexo[f.codigo].iso27001}`.toLowerCase().includes(q))) return false;
    return true;
  });
}
function vSoa() {
  const list = soaFiltered();
  const famGrade = Object.fromEntries(calc.familias.map((f) => [f.familia, f.grado]));
  let html = ''; let lastFam = '';
  for (const f of list) {
    if (f.familia !== lastFam) { lastFam = f.familia; html += `<div class="fam-sep"><span>${esc(f.familia)}</span><code>${f.codigo.replace(/\.\d+$/, '')} · ${famGrade[f.familia] !== undefined ? Math.round(famGrade[f.familia] * 100) + ' %' : 'n.a.'}</code></div>`; }
    const d = f.decl || {}; const p = E.pctDe(d); const fs = findingsFor(f.codigo); const open = ui.soaOpen === f.codigo;
    const worst = fs.find((x) => x.sev === 'NC mayor') ? 'crit' : fs.find((x) => x.sev === 'NC menor') ? 'warn' : fs.length ? 'accent' : '';
    html += `<div class="soa-row${open ? ' open' : ''}${!f.aplicaNorma ? ' na' : ''}" data-act="soa-toggle" data-code="${esc(f.codigo)}" role="button" tabindex="0" aria-expanded="${open}" id="soa-${esc(f.codigo)}">
      <code class="s-code">${esc(f.codigo)}</code>
      <span class="s-name">${esc(f.nombre)}</span>
      <span class="s-dim">${dimsChips(f.dims)}<small>${f.nivel[0] + f.nivel.slice(1).toLowerCase()}</small></span>
      <span class="s-exig" title="Exigencia del Anexo II en nivel ${f.nivel}"><code>${esc(f.exigencia)}</code></span>
      <span class="s-state">${estadoBadge(f.decl, f.aplicaNorma)}${E.aplicaDeclarada(d) && !E.esPendiente(d) ? `<span class="pbar"><span class="bar"><i class="${p < 1 ? 'part' : ''}" style="width:${Math.round(p * 100)}%"></i></span><span class="num">${Math.round(p * 100)}%</span></span>` : ''}</span>
      <span class="s-risk">${f.riesgos.length ? riskChip(f.resMax, `${plural(f.riesgos.length, 'riesgo vinculado', 'riesgos vinculados')}; residual máximo`) + `<small>×${f.riesgos.length}</small>` : '<small class="muted">—</small>'}</span>
      <span class="s-flags">${f.hallazgos.length ? `<span class="badge warn" title="Hallazgos técnicos abiertos">${icon('target', 13)}${f.hallazgos.length}</span>` : ''}${fs.length ? `<span class="badge ${worst}">${fs.length}</span>` : '<span class="ok-dot" title="Sin incidencias">' + icon('check', 14) + '</span>'}</span>
      <span class="s-chev">${icon('chevronDown', 16)}</span>
    </div>`;
    if (open) html += soaDetail(f, fs);
  }
  const pend = calc.filas.filter((f) => f.aplicaNorma && E.esPendiente(f.decl)).length;
  return `${pageHead('RD 311/2022 · art. 28 y Anexo II', 'Declaración de Aplicabilidad', 'El nivel exigido, la exigencia y los refuerzos se calculan desde la categorización. La aplicabilidad, el estado y las evidencias son lo que declaras. Cada medida muestra qué riesgos trata y qué objeta el auditor.',
    `<button type="button" class="btn" data-act="export-xlsx">${icon('sheet', 16)}Exportar</button>`)}
  <div class="toolbar sticky">
    <div class="search-in">${icon('search', 16)}<input type="search" id="soa-q" data-uiq="soaQ" value="${esc(ui.soaQ)}" placeholder="Código, medida, responsable o control ISO…" aria-label="Buscar en la SoA"></div>
    <div class="seg" role="group" aria-label="Marco">${[['todos', 'Todas'], ['org', 'org'], ['op', 'op'], ['mp', 'mp']].map(([v, l]) => `<button type="button" data-act="soa-marco" data-v="${v}" aria-pressed="${ui.soaMarco === v}">${l}</button>`).join('')}</div>
    <select id="soa-estado" data-ui="soaEstado" aria-label="Filtro">${[['todos', 'Todas las medidas'], ['aplicables', 'Exigidas'], ['incidencias', 'Con incidencias'], ['pendientes', `Pendientes (${pend})`], ['parciales', 'Parciales o compensadas'], ['noaplica', 'No exigidas']].map(([v, l]) => opt(v, l, ui.soaEstado)).join('')}</select>
    <span class="muted small">${list.length} de 73</span></div>
  <div class="soa-list">
    <div class="soa-row soa-head"><span>Código</span><span>Medida</span><span>Dimensión · nivel</span><span class="s-exig">Exigencia</span><span class="s-state">Estado</span><span class="s-risk">Riesgo</span><span class="s-flags">Auditor</span><span></span></div>
    ${html || emptyState('search', 'Nada coincide', 'Prueba con otro filtro o término de búsqueda.')}</div>`;
}
function soaDetail(f, fs) {
  const d = f.decl || {}; const ax = D.anexo[f.codigo]; const c = f.codigo;
  const fld = (k, label, type = 'text', ph = '') => type === 'area'
    ? `<label class="fld">${label}<textarea id="soa-${c}-${k}" data-set="soa.${c}.${k}" placeholder="${esc(ph)}">${esc(d[k] || '')}</textarea></label>`
    : `<label class="fld">${label}<input type="text" id="soa-${c}-${k}" data-set="soa.${c}.${k}" value="${esc(d[k] ?? '')}" placeholder="${esc(ph)}"></label>`;
  const aiJ = ui.ai.justCode === c ? ui.ai : null; const aiOn = ui.ai.available && ws.settings.asistente;
  return `<div class="detail">
    <div class="d-left">
      <div class="d-sec"><h4>Anexo II · ${esc(ax.nombre)}</h4><div class="norma">${esc(ax.texto)}</div>
        ${ax.refuerzosTexto ? `<details class="refs"><summary>Refuerzos (texto normativo)</summary><div class="norma">${esc(ax.refuerzosTexto)}</div></details>` : ''}</div>
      <dl class="kv">
        <dt>Dimensiones</dt><dd>${dimsChips(f.dims)}</dd>
        <dt>Nivel exigido</dt><dd><b>${f.nivel}</b> <span class="muted small">${esc(f.regla)}</span></dd>
        <dt>Exigencia</dt><dd><code>${esc(f.exigencia)}</code></dd>
        <dt>Bajo · Medio · Alto</dt><dd class="small"><code>${esc(ax.bajo)}</code> · <code>${esc(ax.medio)}</code> · <code>${esc(ax.alto)}</code></dd>
        <dt>ISO/IEC 27001</dt><dd class="small">${esc(ax.iso27001 || '—')}</dd>
        <dt>Guías CCN-STIC</dt><dd class="small">${esc(ax.guias || '—')}</dd></dl>
      <div class="d-sec"><h4>Riesgos que trata</h4><ul class="plain">${f.riesgos.map((r) => `<li>${riskChip(r.resMax)}<code class="muted">${esc(r.amenaza.id)}</code>${esc(r.amenaza.nombre)}<span class="muted small">· ${esc(r.activo.nombre || '')}</span></li>`).join('') || '<li class="muted small">Ningún riesgo del análisis se trata con esta medida.</li>'}</ul></div>
      <div class="d-sec"><h4>Salvaguardas del análisis</h4><ul class="plain">${f.salvs.map((s) => `<li><span class="chip">${esc(s.codigo)}</span>${esc(s.nombre)}<span class="badge ${E.MADUREZ[s.madurez].eficacia <= 0.3 ? 'warn' : 'ok'}">${s.madurez} · ${E.MADUREZ[s.madurez].label}</span></li>`).join('') || '<li class="muted small">Sin salvaguarda equivalente.</li>'}</ul></div>
      ${f.hallazgos.length ? `<div class="d-sec"><h4>Evidencia técnica abierta</h4><ul class="plain">${f.hallazgos.map((h) => `<li>${cvssBadge(h.cvss)}<code class="muted">${esc(h.id)}</code>${esc(h.titulo)}</li>`).join('')}</ul></div>` : ''}
    </div>
    <div class="d-right">
      <div class="form-grid">
        <label class="fld">¿Aplica?<select id="soa-${c}-aplica" data-set="soa.${c}.aplica">${opt('', 'Sin declarar', d.aplica || '')}${['SÍ', 'SÍ (compensada)', 'NO'].map((v) => opt(v, v, d.aplica)).join('')}</select></label>
        <label class="fld">Estado<select id="soa-${c}-estado" data-set="soa.${c}.estado">${['Pendiente', 'Implantada', 'Parcial', 'Parcial (compensada)', 'Planificada', 'No aplica'].map((v) => opt(v, v, d.estado || 'Pendiente')).join('')}</select></label>
        <label class="fld">% implantación<input type="number" min="0" max="100" id="soa-${c}-pct" data-set="soa.${c}.pct" data-type="pct" value="${d.pct === null || d.pct === undefined || d.pct === '' ? '' : Math.round(Number(d.pct) * 100)}"></label>
        ${fld('responsable', 'Responsable', 'text', 'Rol responsable')}
        <div class="span2">${fld('evidencias', 'Evidencias', 'text', 'Procedimientos, registros, capturas…')}</div>
        <div class="span2">${fld('org', 'Medidas organizativas', 'area')}</div>
        <div class="span2">${fld('tec', 'Medidas técnicas', 'area')}</div>
        ${fld('mc_ref', 'Medida compensatoria')}${fld('observaciones', 'Observaciones / PTR', 'text', 'PTR-…')}
        <div class="span2">${fld('refuerzos_elegidos', 'Refuerzos / alternativa elegida')}</div>
        <label class="fld span2">Justificación<textarea id="soa-${c}-justificacion" data-set="soa.${c}.justificacion" class="tall">${esc(d.justificacion || '')}</textarea></label>
      </div>
      <div class="row"><button type="button" class="btn sm" data-act="use-just" data-code="${esc(c)}">${icon('refresh', 15)}Usar la justificación calculada</button>
        ${aiOn ? `<button type="button" class="btn sm" data-act="ai-just" data-code="${esc(c)}"${ui.ai.busy ? ' disabled' : ''}>${icon('lightbulb', 15)}${ui.ai.busy === 'just' && aiJ ? 'Redactando…' : 'Proponer redacción'}</button>` : ''}</div>
      <p class="small muted calc-just"><b>Calculada:</b> ${esc(f.justAuto)}</p>
      ${aiJ && aiJ.just ? `<div class="assist col"><b>${icon('lightbulb', 16)} Propuesta de redacción</b><p class="small">${esc(aiJ.just)}</p><div class="row"><button type="button" class="btn sm primary" data-act="ai-just-use" data-code="${esc(c)}">Usar este texto</button><span class="small muted">Revísala antes de firmar la SoA.</span></div></div>` : ''}
      ${aiJ && aiJ.error ? `<div class="assist"><span class="small">${esc(aiJ.error)}</span></div>` : ''}
      ${fs.length ? `<div class="d-sec"><h4>Lo que objeta el auditor</h4><div class="findings">${fs.map((x) => findingCard(x)).join('')}</div></div>` : `<div class="ok-box">${icon('shieldCheck', 18)}Sin incidencias del auditor</div>`}
    </div></div>`;
}

/* --- Compensatorias --- */
function vMC() {
  const reg = new Map(calc.riesgos.map((r) => [r.amenaza.id, r]));
  const campos = [['medida', 'Medida o refuerzo sustituido'], ['ambito', 'Ámbito de aplicación'], ['limitaciones', 'Limitaciones o restricciones'], ['objetivo', 'Objetivo de la medida original'], ['riesgo', 'Riesgo identificado'], ['definicion', 'Medidas compensatorias'], ['validacion', 'Validación'], ['mantenimiento', 'Mantenimiento y revisión'], ['aprobacion', 'Aprobación']];
  const cards = state.compensatorias.map((mc, i) => {
    const rids = String(mc.riesgo || '').match(/\bR-\d{3}\b/g) || [];
    const fs = audit.filter((f) => f.ambito === mc.id);
    return `<article class="card mc"><div class="card-head"><div class="row"><span class="mc-id">${esc(mc.id)}</span><h3>${esc(String(mc.medida || 'Nueva medida compensatoria').slice(0, 90))}</h3></div>
      <div class="row">${rids.map((r) => reg.get(r) ? `<span class="chip" title="${esc(reg.get(r).amenaza.nombre)}">${esc(r)} ${riskChip(reg.get(r).resMax)}</span>` : `<span class="badge crit">${esc(r)} no está en el AR</span>`).join('')}
      <button type="button" class="icon-btn sm" data-act="del-mc" data-i="${i}" aria-label="Eliminar">${icon('trash', 16)}</button></div></div>
      <div class="form-grid">${campos.map(([k, l]) => `<label class="fld${k === 'definicion' ? ' span2' : ''}">${l}<textarea id="mc-${i}-${k}" data-set="compensatorias.${i}.${k}">${esc(mc[k] || '')}</textarea></label>`).join('')}</div>
      ${fs.length ? `<div class="findings" style="margin-top:14px">${fs.map((x) => findingCard(x)).join('')}</div>` : ''}</article>`;
  }).join('');
  return `${pageHead('RD 311/2022 · art. 28.3', 'Medidas compensatorias', 'Cuando una medida no puede implantarse como describe el Anexo II, se sustituye por otras que protejan igual o mejor, justificadas documentalmente. Los riesgos citados se enlazan con el análisis y muestran su residual actual.',
    `<button type="button" class="btn" data-act="add-mc">${icon('plus', 16)}Añadir</button>`)}
  ${cards || `<div class="card">${emptyState('scale', 'Sin medidas compensatorias', 'Si alguna medida no puede implantarse tal cual, documenta aquí cómo se compensa.')}</div>`}`;
}

/* --- Evidencia técnica --- */
function vHall() {
  const reg = E.registroRiesgos(state, CTX, true, { cvss: ws.settings.cvss });
  const rows = state.hallazgos.map((h, i) => {
    const cat = HALL[h.categoria] || {}; const r = reg.find((x) => (x.amenaza.hallazgos || []).includes(h.id));
    return `<tr class="${h.estado === 'cerrado' ? 'dim-row' : ''}"><td><code>${esc(h.id)}</code></td>
      <td><input type="text" id="h-${i}-t" class="w-full" data-set="hallazgos.${i}.titulo" value="${esc(h.titulo)}" aria-label="Título"><div class="muted small sub-t">${esc(h.fuente || '')}</div></td>
      <td><select id="h-${i}-c" data-set="hallazgos.${i}.categoria">${Object.entries(HALL).map(([k, v]) => opt(k, `${v.label} (${v.cwe})`, h.categoria)).join('')}</select></td>
      <td class="c"><input type="number" min="0" max="10" step="0.1" id="h-${i}-cv" data-set="hallazgos.${i}.cvss" data-type="num" value="${esc(h.cvss)}" class="num-in" aria-label="CVSS"><div class="sub-t">${cvssBadge(h.cvss)}</div></td>
      <td><select id="h-${i}-a" data-set="hallazgos.${i}.activoId">${state.activos.map((a) => opt(a.id, `${a.id} · ${a.nombre}`, h.activoId)).join('')}</select></td>
      <td><select id="h-${i}-e" data-set="hallazgos.${i}.estado">${opt('abierto', 'Abierto', h.estado)}${opt('cerrado', 'Cerrado (retest OK)', h.estado)}</select></td>
      <td>${h.estado === 'abierto' && r ? `<code class="muted">${esc(r.amenaza.id)}</code> ${riskChip(r.resMax)}` : '<span class="muted small">—</span>'}</td>
      <td><div class="chips">${(cat.ens || []).map(codeChip).join('')}</div></td>
      <td class="c"><button type="button" class="icon-btn sm" data-act="del-hall" data-i="${i}" aria-label="Eliminar ${esc(h.id)}">${icon('trash', 16)}</button></td></tr>`;
  }).join('');
  return `${pageHead('Del pentest al riesgo', 'Evidencia técnica', 'Los hallazgos de pruebas de intrusión, escaneos o campañas de phishing se convierten en riesgo MAGERIT y se contrastan con la SoA. Un hallazgo abierto contra una medida declarada implantada es una no conformidad.',
    `<button type="button" class="btn" data-act="import-hall">${icon('upload', 16)}Importar CSV o JSON</button><button type="button" class="btn primary" data-act="add-hall"${state.activos.length ? '' : ' disabled'}>${icon('plus', 16)}Añadir hallazgo</button>`)}
  <div class="table-wrap"><table class="tbl wide"><thead><tr><th>ID</th><th>Hallazgo</th><th>Categoría</th><th class="c">CVSS</th><th>Activo</th><th>Estado</th><th>Riesgo</th><th>Medidas ENS</th><th></th></tr></thead>
    <tbody>${rows || `<tr><td colspan="9">${emptyState('target', 'Sin hallazgos', 'Importa los resultados de tu último pentest o escaneo, o añádelos a mano.')}</td></tr>`}</tbody></table></div>
  <div class="grid g2">
    <div class="card"><h3>Cómo se traduce un hallazgo</h3><dl class="kv">
      <dt>Probabilidad</dt><dd class="small">CVSS ≥ ${ws.settings.cvss.ma} → MA · ≥ ${ws.settings.cvss.a} → A · ≥ ${ws.settings.cvss.m} → M · resto → B (configurable en Ajustes).</dd>
      <dt>Amenaza</dt><dd class="small">Cada categoría apunta a una amenaza MAGERIT. Si ya existe en el activo, se endurecen su probabilidad y degradación; si no, aparece un riesgo nuevo «R-H-xx».</dd>
      <dt>SoA</dt><dd class="small">CVSS ≥ 7 contra medida «Implantada 100 %» → NC mayor (PT-01); de 4 a 6,9 → NC menor (PT-02).</dd></dl></div>
    <div class="card"><h3>Formato de importación</h3><p class="small muted">CSV con cabecera o JSON (array de objetos). Categorías admitidas:</p>
      <div class="chips" style="margin:10px 0">${Object.entries(HALL).map(([k, v]) => `<span class="chip" title="${esc(v.label)} → ${esc(v.amenaza)}">${k}</span>`).join('')}</div>
      <pre class="code">id,titulo,categoria,cvss,activoId,estado,fuente
H-08,XSS en el buzón,XSS,6.1,ACT-002,abierto,Pentest 2027</pre>
      <button type="button" class="btn sm" data-act="export-tpl">${icon('download', 15)}Descargar plantilla</button></div>
  </div>`;
}

/* --- Plan de acción --- */
function vPlan() {
  const origenes = [...new Set(plan.map((a) => a.origen))].filter(Boolean);
  const list = plan.filter((a) => (ui.planFiltro === 'todas' || (ui.planFiltro === 'abiertas' ? a.estado !== 'Hecha' && !a.verificada : ui.planFiltro === 'vencidas' ? a.estado !== 'Hecha' && !a.verificada && a.fecha && a.fecha < today() : a.estado === 'Hecha' || a.verificada)) && (ui.planOrigen === 'todos' || a.origen === ui.planOrigen));
  const abiertas = plan.filter((a) => a.estado !== 'Hecha' && !a.verificada);
  const venc = abiertas.filter((a) => a.fecha && a.fecha < today()).length;
  const sem = abiertas.filter((a) => a.fecha && a.fecha >= today() && a.fecha <= new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10)).length;
  const row = (a) => {
    const k = esc(a.key); const late = a.fecha && a.fecha < today() && a.estado !== 'Hecha' && !a.verificada;
    return `<div class="act-row${a.estado === 'Hecha' || a.verificada ? ' done' : ''}">
      <span class="prio-pill ${a.prioridad === 'Alta' ? 'hi' : a.prioridad === 'Media' ? 'mid' : ''}">${esc(a.prioridad)}</span>
      <div class="ar-main"><b>${esc(a.titulo)}</b><p>${esc(a.detalle)}</p><span class="ar-meta"><span class="chip">${esc(a.origen)}</span><code class="muted">${esc(a.ref)}</code></span></div>
      <input type="text" data-plan="${k}" data-f="responsable" id="pl-${k}-r" value="${esc(a.responsable)}" placeholder="Responsable" aria-label="Responsable"${a.verificada ? ' disabled' : ''}>
      <input type="date" data-plan="${k}" data-f="fecha" id="pl-${k}-f" value="${esc(a.fecha)}" class="${late ? 'late' : ''}" aria-label="Fecha límite"${a.verificada ? ' disabled' : ''}>
      ${a.verificada ? '<span class="badge ok">Verificada</span>' : `<select data-plan="${k}" data-f="estado" id="pl-${k}-e" aria-label="Estado">${['Pendiente', 'En curso', 'Hecha'].map((s) => opt(s, s, a.estado)).join('')}</select>`}</div>`;
  };
  return `${pageHead('Seguimiento', 'Plan de acción', 'Las no conformidades del auditor, los riesgos por encima del apetito y los hallazgos técnicos abiertos, convertidos en tareas con responsable y fecha. Cuando el origen desaparece, la acción se marca como verificada.',
    `<button type="button" class="btn" data-act="export-plan">${icon('download', 16)}Exportar CSV</button>`)}
  <div class="kpi-grid">${kpiTile('Abiertas', abiertas.length, 'Pendientes o en curso', { ic: 'listChecks' })}${kpiTile('Vencidas', venc, 'Fecha límite superada', { ic: 'clock', alert: venc > 0 })}${kpiTile('Esta semana', sem, 'Vencen en 7 días', { ic: 'calendar' })}${kpiTile('Cerradas', plan.length - abiertas.length, 'Hechas o verificadas', { ic: 'check' })}</div>
  <div class="toolbar"><div class="seg" role="group">${[['abiertas', 'Abiertas'], ['vencidas', 'Vencidas'], ['cerradas', 'Cerradas'], ['todas', 'Todas']].map(([v, l]) => `<button type="button" data-act="plan-f" data-v="${v}" aria-pressed="${ui.planFiltro === v}">${l}</button>`).join('')}</div>
    <select id="plan-o" data-ui="planOrigen" aria-label="Origen">${opt('todos', 'Todos los orígenes', ui.planOrigen)}${origenes.map((o) => opt(o, o, ui.planOrigen)).join('')}</select><span class="muted small">${plural(list.length, 'acción', 'acciones')}</span></div>
  <div class="card flush act-table">${list.map(row).join('') || emptyState('check', 'Nada por aquí', 'No hay acciones con este filtro.')}</div>`;
}

/* --- Auditoría --- */
function vAudit() {
  const fams = [...new Set(audit.map((f) => f.id.split('-')[0]))];
  const list = audit.filter((f) => (ui.auditSev === 'todas' || f.sev === ui.auditSev) && (ui.auditFam === 'todas' || f.id.startsWith(ui.auditFam + '-')));
  const famLabel = { CAT: 'Categorización', SOA: 'SoA', REF: 'Refuerzos', MC: 'Compensatorias', AR: 'Análisis de riesgos', PT: 'Evidencia técnica', DOC: 'Documento' };
  return `${pageHead('Preauditoría · CCN-STIC 802 y 808', 'Auditoría', `${RULES.length - ws.settings.reglasOff.length} reglas revisan la coherencia de la SoA con la categorización, el análisis de riesgos y la evidencia técnica. Prepara la auditoría formal; no la sustituye.`,
    `<button type="button" class="btn primary" data-act="export-md">${icon('download', 16)}Descargar informe</button>`)}
  <div class="sev-cards">${[['NC mayor', 'crit'], ['NC menor', 'warn'], ['Observación', 'accent']].map(([s, c]) => `<button type="button" class="sev-card ${c}${ui.auditSev === s ? ' on' : ''}" data-act="audit-sev" data-v="${ui.auditSev === s ? 'todas' : s}"><b class="num">${auditCount(s)}</b><span>${s === 'Observación' ? 'Observaciones' : s === 'NC mayor' ? 'NC mayores' : 'NC menores'}</span></button>`).join('')}</div>
  <div class="toolbar"><select id="audit-fam" data-ui="auditFam" aria-label="Área">${opt('todas', 'Todas las áreas', ui.auditFam)}${fams.map((f) => opt(f, famLabel[f] || f, ui.auditFam)).join('')}</select>
    ${ui.auditSev !== 'todas' ? `<button type="button" class="btn sm ghost" data-act="audit-sev" data-v="todas">${icon('x', 15)}Quitar filtro: ${esc(ui.auditSev)}</button>` : ''}<span class="spacer"></span><span class="muted small">${plural(list.length, 'resultado', 'resultados')}</span></div>
  <div class="findings">${list.map((f) => findingCard(f)).join('') || `<div class="card">${emptyState('shieldCheck', 'Sin incidencias', 'No hay hallazgos del auditor con este filtro.')}</div>`}</div>`;
}

/* --- Exportar --- */
function vExport() {
  return `${pageHead('Entrega', 'Exportar e importar', 'El libro de Excel mantiene las columnas de la plantilla de SoA y añade la trazabilidad con el análisis de riesgos, la evidencia técnica y el informe del auditor.')}
  <div class="export-grid">
    <div class="card ex primary-ex"><span class="ex-ic">${icon('sheet', 22)}</span><h3>Declaración de Aplicabilidad</h3><p>Libro .xlsx con portada, categorización, SoA (73 medidas y trazabilidad), refuerzos, compensatorias, análisis de riesgos, evidencia técnica, auditoría, plan de acción y resumen.</p><button type="button" class="btn primary" data-act="export-xlsx"${ui.busyXlsx ? ' disabled' : ''}>${ui.busyXlsx ? 'Generando…' : icon('download', 16) + 'Descargar .xlsx'}</button></div>
    <div class="card ex"><span class="ex-ic">${icon('shieldCheck', 22)}</span><h3>Informe de preauditoría</h3><p>Markdown con resumen ejecutivo, no conformidades por severidad y riesgos por encima del apetito.</p><button type="button" class="btn" data-act="export-md">${icon('download', 16)}Descargar .md</button></div>
    <div class="card ex"><span class="ex-ic">${icon('listChecks', 22)}</span><h3>Plan de acción</h3><p>CSV con prioridad, origen, responsable, fecha y estado de cada acción.</p><button type="button" class="btn" data-act="export-plan">${icon('download', 16)}Descargar .csv</button></div>
    <div class="card ex"><span class="ex-ic">${icon('activity', 22)}</span><h3>Registro de riesgos</h3><p>CSV con riesgo inherente y residual, salvaguardas, medidas ENS y tratamiento.</p><button type="button" class="btn" data-act="export-csv">${icon('download', 16)}Descargar .csv</button></div>
    <div class="card ex"><span class="ex-ic">${icon('folder', 22)}</span><h3>Proyecto completo</h3><p>Todo el proyecto en JSON para archivarlo, compartirlo o auditarlo con la herramienta de línea de comandos.</p><div class="row"><button type="button" class="btn" data-act="export-json">${icon('download', 16)}.json</button><button type="button" class="btn" data-act="import-json">${icon('upload', 16)}Importar</button></div></div>
    <div class="card ex"><span class="ex-ic">${icon('upload', 22)}</span><h3>Importar una SoA</h3><p>Crea un proyecto nuevo a partir de una Declaración de Aplicabilidad en Excel con la plantilla de 73 medidas.</p><button type="button" class="btn" data-act="import-xlsx">${icon('sheet', 16)}Elegir .xlsx</button></div>
  </div>`;
}
