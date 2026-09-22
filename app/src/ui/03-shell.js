/* ---------- Piezas de presentación ---------- */
const riskChip = (n, title) => { const v = E.NIVELES.includes(n) ? n : null; return `<span class="risk ${v || 'none'}"${title ? ` title="${esc(title)}"` : ''}>${v || '—'}</span>`; };
const dimsChips = (dims) => dims === 'Categoría' ? '<span class="dimcat">Categoría</span>'
  : `<span class="dims">${String(dims).split('').filter((c) => E.DIMS.includes(c)).map((d) => `<span class="dim ${d}" title="${E.DIM_LABEL[d]}">${d}</span>`).join('')}</span>`;
const codeChip = (code) => `<button type="button" class="code-chip" data-act="goto-soa" data-code="${esc(code)}">${esc(code)}</button>`;
const catPill = (c) => c ? `<span class="cat-pill ${c === 'BÁSICA' ? 'BASICA' : c}"><span class="dot"></span>${c === 'BÁSICA' ? 'Básica' : c === 'MEDIA' ? 'Media' : 'Alta'}</span>` : '';
function estadoBadge(d, aplicaNorma) {
  if (!d || E.esPendiente(d)) return '<span class="badge neutral">Pendiente</span>';
  const e = d.estado || '';
  if (!E.aplicaDeclarada(d)) return `<span class="badge neutral">${aplicaNorma ? 'Excluida' : 'No aplica'}</span>`;
  if (/compensada/i.test(e) || /compensada/i.test(d.aplica || '')) return `<span class="badge accent">${esc(e || 'Compensada')}</span>`;
  if (/^implantada$/i.test(e)) return '<span class="badge ok">Implantada</span>';
  return `<span class="badge warn">${esc(e || 'Sin estado')}</span>`;
}
const sevClass = (s) => (s === 'NC mayor' ? 'mayor' : s === 'NC menor' ? 'menor' : 'obs');
const sevBadge = (s) => `<span class="badge ${s === 'NC mayor' ? 'crit' : s === 'NC menor' ? 'warn' : 'accent'}">${esc(s)}</span>`;
const cvssBadge = (c) => { const s = E.sevCvss(Number(c) || 0); return `<span class="badge ${s === 'Crítica' || s === 'Alta' ? 'crit' : s === 'Media' ? 'warn' : 'neutral'}">${s} · ${Number(c || 0).toFixed(1)}</span>`; };
const auditCount = (sev) => (audit || []).filter((f) => f.sev === sev).length;
const findingsFor = (code) => (audit || []).filter((f) => String(f.ambito).split(' ')[0] === code);
const opt = (v, label, sel) => `<option value="${esc(v)}"${String(sel) === String(v) ? ' selected' : ''}>${esc(label ?? v)}</option>`;
const activoNombre = (id) => (state.activos.find((a) => a.id === id) || {}).nombre || id;
const avatar = (size = 32) => `<span class="avatar c-${esc(ws.profile.color || 'teal')}" style="--s:${size}px">${esc(initials(ws.profile.nombre))}</span>`;
function nextId(prefix, list, pad = 3) {
  let n = 0;
  for (const x of list) { const m = String(x.id || '').match(new RegExp('^' + prefix.replace('-', '\\-') + '(\\d+)$')); if (m) n = Math.max(n, +m[1]); }
  return prefix + String(n + 1).padStart(pad, '0');
}
const caseIcon = (id) => ({ techserv: 'server', ayuntamiento: 'landmark', universidad: 'graduation', hospital: 'hospital', saas: 'cloud' }[id] || 'building');
function pageHead(eyebrow, title, lead, actions = '') {
  return `<header class="page-head"><div class="ph-text">${eyebrow ? `<div class="eyebrow">${eyebrow}</div>` : ''}<h1>${title}</h1>${lead ? `<p class="lead">${lead}</p>` : ''}</div>${actions ? `<div class="ph-actions">${actions}</div>` : ''}</header>`;
}
function emptyState(ic, title, text, action = '') {
  return `<div class="empty-state">${icon(ic, 28)}<h3>${title}</h3><p>${text}</p>${action}</div>`;
}
function heatmap(rows, impKey, probKey) {
  const m = {}; for (const r of rows) { const im = r[impKey], p = r[probKey]; if (!im || !p) continue; const k = im + '|' + p; m[k] = (m[k] || 0) + 1; }
  let html = '<div class="heat" role="img" aria-label="Mapa de calor: impacto por probabilidad">';
  for (let i = 4; i >= 0; i--) {
    const im = E.NIVELES[i]; html += `<div class="ax">${im}</div>`;
    for (let j = 0; j < 5; j++) {
      const p = E.NIVELES[j]; const n = m[im + '|' + p] || 0; const lv = E.MATRIZ[i][j];
      html += `<div class="cell risk ${lv}${n ? ' has' : ''}" data-tip="Impacto ${im} · probabilidad ${p} → riesgo ${lv}: ${plural(n, 'amenaza', 'amenazas')}">${n || ''}</div>`;
    }
  }
  return html + '<div></div>' + E.NIVELES.map((p) => `<div class="ax">${p}</div>`).join('') + '</div><div class="heat-cap"><span>↑ Impacto</span><span>Probabilidad →</span></div>';
}

/* ---------- Render principal ---------- */
const PROJECT_VIEWS = ['panel', 'categorizacion', 'riesgos', 'soa', 'compensatorias', 'hallazgos', 'plan', 'auditoria', 'exportar'];
const GLOBAL_VIEWS = ['inicio', 'nuevo', 'perfil', 'ajustes', 'ayuda'];
function go(view) {
  if (PROJECT_VIEWS.includes(view) && !state) view = 'inicio';
  ui.view = view; ui.menu = null; ui.drawer = false; ui.confirm = null;
  try { history.replaceState(null, '', '#' + view); } catch (e) { /* sandbox */ }
  render(); window.scrollTo({ top: 0 });
  const h = $('#main h1'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
}
function render() {
  const ae = document.activeElement; const active = ae && ae.id;
  let sel = null; try { if (ae && typeof ae.selectionStart === 'number') sel = [ae.selectionStart, ae.selectionEnd]; } catch (e) { sel = null; }
  $('#side').innerHTML = renderSide();
  $('#top').innerHTML = renderTop();
  const V = { inicio: vInicio, nuevo: vNuevo, perfil: vPerfil, ajustes: vAjustes, ayuda: vAyuda, panel: vPanel, categorizacion: vCat, riesgos: vRiesgos, soa: vSoa, compensatorias: vMC, hallazgos: vHall, plan: vPlan, auditoria: vAudit, exportar: vExport };
  $('#view').innerHTML = (state && isDemo() && PROJECT_VIEWS.includes(ui.view) ? demoBanner() : '') + (V[ui.view] || vInicio)();
  document.body.classList.toggle('drawer-open', ui.drawer);
  renderPalette();
  if (active) { const el = document.getElementById(active); if (el) { el.focus({ preventScroll: true }); if (sel) { try { el.setSelectionRange(sel[0], sel[1]); } catch (e) { /* n/a */ } } } }
}
function renderSide() {
  const p = activeMeta();
  const may = auditCount('NC mayor');
  const abiertas = plan.filter((a) => a.estado !== 'Hecha' && !a.verificada).length;
  const item = (id, label, ic, badge = '') => `<button type="button" class="nav-item" data-act="nav" data-view="${id}"${ui.view === id ? ' aria-current="page"' : ''}${!state && PROJECT_VIEWS.includes(id) ? ' disabled' : ''}>${icon(ic)}<span>${label}</span>${badge}</button>`;
  const proj = state ? `<button type="button" class="proj-switch" data-act="menu" data-menu="proyectos" aria-haspopup="true" aria-expanded="${ui.menu === 'proyectos'}">
      <span class="proj-ic ${p?.kind === 'demo' ? 'demo' : ''}">${icon(p?.kind === 'demo' ? caseIcon(p.caseId) : 'building', 16)}</span>
      <span class="proj-txt"><b>${esc(state.proyecto?.nombre || 'Proyecto')}</b><small>${p?.kind === 'demo' ? 'Caso de ejemplo' : esc(state.proyecto?.sistema || 'Mi proyecto')}</small></span>${icon('chevronDown', 16, 'muted')}</button>`
    : `<button type="button" class="proj-switch empty" data-act="nav" data-view="inicio"><span class="proj-ic">${icon('folder', 16)}</span><span class="proj-txt"><b>Sin proyecto abierto</b><small>Elige o crea uno</small></span></button>`;
  return `
    <div class="brand"><span class="logo" aria-hidden="true"><svg viewBox="0 0 32 32" width="30" height="30"><rect width="32" height="32" rx="9" fill="var(--accent)"/><path d="M16 6.5c2.6 2.1 5.4 3 8 3v6.3c0 5.2-3.3 8.4-8 9.7-4.7-1.3-8-4.5-8-9.7V9.5c2.6 0 5.4-.9 8-3Z" fill="none" stroke="var(--accent-ink)" stroke-width="1.8" stroke-linejoin="round"/><path d="m12.4 16 2.5 2.5 4.8-5" fill="none" stroke="var(--accent-ink)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
      <span><b>ENS Compliance</b><small>Studio</small></span></div>
    ${proj}
    ${ui.menu === 'proyectos' ? projectMenu() : ''}
    <nav class="nav" aria-label="Secciones">
      ${item('inicio', 'Inicio', 'home')}
      <div class="nav-group">Proyecto</div>
      ${item('panel', 'Panel', 'dashboard')}
      ${item('categorizacion', 'Categorización', 'layers')}
      ${item('riesgos', 'Análisis de riesgos', 'activity')}
      ${item('soa', 'Declaración de Aplicabilidad', 'fileCheck')}
      ${item('compensatorias', 'Compensatorias', 'scale')}
      <div class="nav-group">Seguimiento</div>
      ${item('hallazgos', 'Evidencia técnica', 'target', state && calc.kpi.hallazgosAbiertos ? `<span class="count warn">${calc.kpi.hallazgosAbiertos}</span>` : '')}
      ${item('plan', 'Plan de acción', 'listChecks', state && abiertas ? `<span class="count">${abiertas}</span>` : '')}
      ${item('auditoria', 'Auditoría', 'shieldCheck', state && may ? `<span class="count crit">${may}</span>` : '')}
      ${item('exportar', 'Exportar', 'download')}
    </nav>
    <div class="side-foot">
      ${item('ayuda', 'Ayuda', 'help')}
      ${item('ajustes', 'Ajustes', 'sliders')}
      <button type="button" class="me" data-act="nav" data-view="perfil"${ui.view === 'perfil' ? ' aria-current="page"' : ''}>${avatar(30)}<span><b>${esc(ws.profile.nombre || 'Tu perfil')}</b><small>${esc(ws.profile.rol || 'Completa tu perfil')}</small></span></button>
    </div>`;
}
function projectMenu() {
  const own = ws.projects.filter((p) => p.kind === 'own'); const demos = ws.projects.filter((p) => p.kind === 'demo');
  const row = (p) => `<button type="button" class="menu-item${p.id === ws.activeId ? ' on' : ''}" data-act="open-project" data-id="${esc(p.id)}">${icon(p.kind === 'demo' ? caseIcon(p.caseId) : 'building', 16)}<span>${esc(p.nombre)}</span>${p.id === ws.activeId ? icon('check', 16, 'accent') : ''}</button>`;
  return `<div class="menu" role="menu">
    ${own.length ? `<div class="menu-label">Mis proyectos</div>${own.map(row).join('')}` : ''}
    ${demos.length ? `<div class="menu-label">Casos de ejemplo abiertos</div>${demos.map(row).join('')}` : ''}
    <div class="menu-sep"></div>
    <button type="button" class="menu-item" data-act="nav" data-view="nuevo">${icon('plus', 16)}<span>Nuevo proyecto</span></button>
    <button type="button" class="menu-item" data-act="import-xlsx">${icon('upload', 16)}<span>Importar SoA desde Excel</span></button>
    <button type="button" class="menu-item" data-act="nav" data-view="inicio">${icon('home', 16)}<span>Todos los proyectos y casos</span></button>
  </div>`;
}
const TITLES = { inicio: 'Inicio', nuevo: 'Nuevo proyecto', perfil: 'Perfil', ajustes: 'Ajustes', ayuda: 'Ayuda', panel: 'Panel', categorizacion: 'Categorización', riesgos: 'Análisis de riesgos', soa: 'Declaración de Aplicabilidad', compensatorias: 'Medidas compensatorias', hallazgos: 'Evidencia técnica', plan: 'Plan de acción', auditoria: 'Auditoría', exportar: 'Exportar' };
function renderTop() {
  const inProj = state && PROJECT_VIEWS.includes(ui.view);
  const temaIc = ws.settings.tema === 'oscuro' ? 'moon' : ws.settings.tema === 'claro' ? 'sun' : 'monitor';
  return `
    <button type="button" class="icon-btn only-mobile" data-act="drawer" aria-label="Abrir menú">${icon('menu', 20)}</button>
    <div class="crumbs">${inProj ? `<span class="crumb-proj">${esc(state.proyecto?.nombre || '')}</span>${icon('chevronRight', 14, 'muted')}` : ''}<span class="crumb-cur">${TITLES[ui.view] || ''}</span>${inProj ? catPill(calc.categoria) : ''}</div>
    <button type="button" class="search-btn" data-act="palette" aria-label="Buscar y ejecutar comandos">${icon('search', 16)}<span>Buscar medida, riesgo o acción…</span><kbd>Ctrl K</kbd></button>
    <button type="button" class="icon-btn" data-act="cycle-theme" aria-label="Cambiar tema" title="Tema: ${ws.settings.tema}">${icon(temaIc, 18)}</button>
    <button type="button" class="icon-btn" data-act="nav" data-view="ayuda" aria-label="Ayuda">${icon('help', 18)}</button>
    <button type="button" class="avatar-btn" data-act="nav" data-view="perfil" aria-label="Perfil">${avatar(32)}</button>`;
}
function demoBanner() {
  const p = activeMeta();
  return `<div class="demo-banner">${icon('info', 18)}<p><b>Caso de ejemplo con datos ficticios.</b> Puedes editarlo libremente: los cambios solo afectan a esta copia.</p>
    <div class="row"><button type="button" class="btn sm ghost" data-act="reset-case" data-case="${esc(p.caseId)}">${icon('refresh', 15)}Restablecer</button>
    <button type="button" class="btn sm primary" data-act="nav" data-view="nuevo">Empezar con mis datos${icon('arrowRight', 15)}</button></div></div>`;
}

/* ---------- Paleta de comandos ---------- */
function paletteItems() {
  const q = ui.paletteQ.trim().toLowerCase();
  const items = [];
  const V = [['inicio', 'Inicio', 'home'], ['panel', 'Panel', 'dashboard'], ['categorizacion', 'Categorización', 'layers'], ['riesgos', 'Análisis de riesgos', 'activity'], ['soa', 'Declaración de Aplicabilidad', 'fileCheck'], ['compensatorias', 'Medidas compensatorias', 'scale'], ['hallazgos', 'Evidencia técnica', 'target'], ['plan', 'Plan de acción', 'listChecks'], ['auditoria', 'Auditoría', 'shieldCheck'], ['exportar', 'Exportar', 'download'], ['ayuda', 'Ayuda', 'help'], ['ajustes', 'Ajustes', 'sliders'], ['perfil', 'Perfil', 'user'], ['nuevo', 'Nuevo proyecto', 'plus']];
  for (const [v, l, ic] of V) if (state || !PROJECT_VIEWS.includes(v)) items.push({ grupo: 'Ir a', label: l, ic, act: () => go(v) });
  if (state) {
    items.push({ grupo: 'Acciones', label: 'Descargar la SoA en Excel', ic: 'sheet', act: () => exportXlsx() });
    items.push({ grupo: 'Acciones', label: 'Descargar el informe de auditoría', ic: 'download', act: () => saveFile(`${slug()}_informe_preauditoria_${today()}.md`, informeMd()) });
  }
  items.push({ grupo: 'Acciones', label: 'Cambiar entre tema claro y oscuro', ic: 'moon', act: () => { ws.settings.tema = document.documentElement.getAttribute('data-theme') === 'dark' || (ws.settings.tema === 'sistema' && matchMedia('(prefers-color-scheme: dark)').matches) ? 'claro' : 'oscuro'; saveWs(); applyTheme(); render(); } });
  for (const c of D.casos) items.push({ grupo: 'Casos de ejemplo', label: `Abrir ${c.titulo}`, ic: caseIcon(c.id), act: () => openCase(c.id) });
  if (state) {
    for (const f of calc.filas) items.push({ grupo: 'Medidas', label: `${f.codigo} · ${f.nombre}`, ic: 'fileCheck', act: () => gotoSoa(f.codigo), hint: f.aplicaNorma ? f.nivel : 'no exigida' });
    for (const r of calc.riesgos) items.push({ grupo: 'Riesgos', label: `${r.amenaza.id} · ${r.amenaza.nombre} — ${r.activo.nombre || ''}`, ic: 'activity', act: () => { ui.riesgosTab = 'registro'; go('riesgos'); }, hint: r.resMax || '' });
  }
  const res = q ? items.filter((it) => it.label.toLowerCase().includes(q) || it.grupo.toLowerCase().includes(q)) : items.filter((it) => it.grupo !== 'Medidas' && it.grupo !== 'Riesgos');
  return res.slice(0, 40);
}
function renderPalette() {
  const host = $('#palette');
  if (!ui.palette) { host.hidden = true; host.innerHTML = ''; return; }
  const items = paletteItems(); ui._pItems = items;
  if (ui.paletteIdx >= items.length) ui.paletteIdx = Math.max(0, items.length - 1);
  let last = ''; let html = '';
  items.forEach((it, i) => {
    if (it.grupo !== last) { html += `<div class="pal-group">${esc(it.grupo)}</div>`; last = it.grupo; }
    html += `<button type="button" class="pal-item${i === ui.paletteIdx ? ' on' : ''}" data-act="pal-run" data-i="${i}" id="pal-${i}">${icon(it.ic, 16)}<span>${esc(it.label)}</span>${it.hint ? `<small>${esc(it.hint)}</small>` : ''}</button>`;
  });
  const wasOpen = !host.hidden;
  host.hidden = false;
  if (!wasOpen || !$('#pal-q')) {
    host.innerHTML = `<div class="overlay" data-act="pal-close"></div><div class="palette" role="dialog" aria-label="Buscar"><div class="pal-in">${icon('search', 18)}<input id="pal-q" type="text" placeholder="Busca una medida (op.acc.6), un riesgo, una sección o una acción…" value="${esc(ui.paletteQ)}" autocomplete="off"><kbd>Esc</kbd></div><div class="pal-list" id="pal-list"></div></div>`;
  }
  $('#pal-list').innerHTML = html || '<div class="pal-empty">Sin resultados.</div>';
  const on = $('#pal-' + ui.paletteIdx); if (on) on.scrollIntoView({ block: 'nearest' });
  if (!wasOpen) $('#pal-q').focus();
}
function gotoSoa(code) {
  ui.soaOpen = code; ui.soaQ = ''; ui.soaMarco = 'todos'; ui.soaEstado = 'todos'; go('soa');
  requestAnimationFrame(() => { const r = document.getElementById('soa-' + code); if (r) r.scrollIntoView({ block: 'center', behavior: 'smooth' }); });
}

/* ---------- Avisos ---------- */
let toastT = null;
function toast(msg) { const t = $('#toast'); t.innerHTML = `${icon('check', 16)}<span>${esc(msg)}</span>`; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2600); }
