/* ---------- Eventos ---------- */
function setPath(obj, path, value) {
  let ks = path.split('.');
  if (ks[0] === 'soa') ks = ['soa', ks.slice(1, -1).join('.'), ks[ks.length - 1]]; // los códigos ENS contienen puntos
  let o = obj;
  if (ks.some((k) => BAD_KEYS.has(k))) return; // defensa ante prototype pollution
  for (let i = 0; i < ks.length - 1; i++) { const k = ks[i]; if (!Object.prototype.hasOwnProperty.call(o, k) || o[k] === null || typeof o[k] !== 'object') o[k] = {}; o = o[k]; }
  o[ks[ks.length - 1]] = typeof value === 'string' ? s(value) : value;
}
function readVal(el) {
  let v = el.type === 'checkbox' ? el.checked : el.value;
  if (el.dataset.type === 'num') v = v === '' ? 0 : Number(v);
  if (el.dataset.type === 'pct') v = v === '' ? null : Math.max(0, Math.min(100, Number(v))) / 100;
  if (el.dataset.type === 'list') v = String(v).split(/[,;\s]+/).map((x) => x.trim()).filter(Boolean);
  if (el.dataset.type === 'bool') v = !!el.checked;
  return v;
}
function pickFile(accept, cb) {
  const inp = $('#file-any'); inp.accept = accept; inp.value = '';
  inp.onchange = () => { const f = inp.files && inp.files[0]; if (f) cb(f); };
  inp.click();
}
const readText = (f, cb) => { const r = new FileReader(); r.onload = () => cb(String(r.result)); r.readAsText(f); };

document.addEventListener('change', (ev) => {
  const el = ev.target;
  if (el.dataset.ui) { ui[el.dataset.ui] = el.value; render(); return; }
  if (el.dataset.ws) { setPath(ws, el.dataset.ws, readVal(el)); saveWs(); if (el.dataset.ws.startsWith('settings.')) { if (el.dataset.ws === 'settings.conHallazgos') ui.conHallazgos = ws.settings.conHallazgos; recompute(); } render(); return; }
  if (el.dataset.wz) { const w = ui.wizard; setPath(w, el.dataset.wz, readVal(el)); w.error = ''; render(); return; }
  if (el.dataset.rule) { const s = new Set(ws.settings.reglasOff); el.checked ? s.delete(el.dataset.rule) : s.add(el.dataset.rule); ws.settings.reglasOff = [...s]; saveWs(); recompute(); render(); return; }
  if (el.dataset.plan) {
    const a = plan.find((x) => x.key === el.dataset.plan); if (!a) return;
    state.acciones[a.key] = { ...(state.acciones[a.key] || {}), titulo: a.titulo, origen: a.origen, ref: a.ref, estado: a.estado, responsable: a.responsable, fecha: a.fecha, [el.dataset.f]: el.value };
    commit(el.dataset.f === 'estado' && el.value === 'Hecha' ? 'Acción completada' : null); return;
  }
  if (el.dataset.cover !== undefined) {
    const s = state.salvaguardas[+el.dataset.cover]; s.cubre = s.cubre || [];
    s.cubre = el.checked ? [...new Set([...s.cubre, el.value])] : s.cubre.filter((x) => x !== el.value);
    commit(); return;
  }
  const path = el.dataset.set; if (!path || !state) return;
  const v = readVal(el);
  setPath(state, path, v);
  if (el.dataset.syncName !== undefined) { const am = state.amenazas[+el.dataset.syncName]; const c = CAT_AM.find((x) => x.code === am.codigo); if (c) am.nombre = c.nombre; }
  if (path.startsWith('soa.') && path.endsWith('.aplica') && v === 'NO') { const d = state.soa[path.slice(4, -'.aplica'.length)]; if (d.estado !== 'No aplica') d.estado = 'No aplica'; d.pct = null; }
  if (path.startsWith('soa.') && path.endsWith('.estado') && v === 'Implantada') { const d = state.soa[path.slice(4, -'.estado'.length)]; if (d.pct === null || d.pct === undefined || d.pct === '') d.pct = 1; if (!d.aplica) d.aplica = 'SÍ'; }
  commit();
});
document.addEventListener('input', (ev) => {
  const el = ev.target;
  if (el.dataset.uiq) { ui[el.dataset.uiq] = el.value; clearTimeout(ui._qT); ui._qT = setTimeout(render, 150); }
  if (el.id === 'glo-q') { ui.glosarioQ = el.value; clearTimeout(ui._qT); ui._qT = setTimeout(render, 150); }
  if (el.id === 'pal-q') { ui.paletteQ = el.value; ui.paletteIdx = 0; renderPalette(); }
  if (el.dataset.ws === 'profile.nombre' && el.id === 'pf-n') { ws.profile.nombre = el.value; saveWs(); $('#side').innerHTML = renderSide(); $('#top').innerHTML = renderTop(); localize(); }
});

let gPending = false;
document.addEventListener('keydown', (ev) => {
  const t = ev.target; const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) && t.id !== 'pal-q';
  if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'k') { ev.preventDefault(); ui.palette = !ui.palette; ui.paletteQ = ''; ui.paletteIdx = 0; renderPalette(); return; }
  if (ui.palette) {
    const items = ui._pItems || [];
    if (ev.key === 'Escape') { ui.palette = false; renderPalette(); return; }
    if (ev.key === 'ArrowDown') { ev.preventDefault(); ui.paletteIdx = Math.min(items.length - 1, ui.paletteIdx + 1); renderPalette(); return; }
    if (ev.key === 'ArrowUp') { ev.preventDefault(); ui.paletteIdx = Math.max(0, ui.paletteIdx - 1); renderPalette(); return; }
    if (ev.key === 'Enter') { ev.preventDefault(); const it = items[ui.paletteIdx]; ui.palette = false; renderPalette(); if (it) it.act(); return; }
    return;
  }
  if (ev.key === 'Escape') { if (ui.menu || ui.drawer || ui.confirm) { ui.menu = null; ui.drawer = false; ui.confirm = null; render(); } return; }
  if ((ev.key === 'Enter' || ev.key === ' ') && t.classList && t.classList.contains('soa-row') && t.dataset.act) { ev.preventDefault(); t.click(); return; }
  if (typing || ev.ctrlKey || ev.metaKey || ev.altKey) return;
  if (ev.key === '/') { const s = $('#soa-q') || $('#glo-q'); if (s) { ev.preventDefault(); s.focus(); } else { ev.preventDefault(); ui.palette = true; ui.paletteQ = ''; renderPalette(); } return; }
  if (ev.key === '?') { go('ayuda'); ui.helpTab = 'atajos'; render(); return; }
  if (ev.key.toLowerCase() === 'g') { gPending = true; setTimeout(() => { gPending = false; }, 900); return; }
  if (gPending) { gPending = false; const m = { p: 'panel', s: 'soa', a: 'auditoria', r: 'riesgos', c: 'categorizacion', h: 'hallazgos', l: 'plan', i: 'inicio' }[ev.key.toLowerCase()]; if (m) go(m); }
});

/* Conserva abiertos los <details> marcados con data-keep entre renderizados */
document.addEventListener('toggle', (ev) => { const k = ev.target && ev.target.dataset && ev.target.dataset.keep; if (k) ui[k] = ev.target.open; }, true);

/* Tooltip ligero para [data-tip] */
const tip = () => $('#tip');
document.addEventListener('mouseover', (ev) => {
  const el = ev.target.closest && ev.target.closest('[data-tip]'); const t = tip();
  if (!el) { t.hidden = true; return; }
  t.textContent = el.getAttribute('data-tip'); t.hidden = false;
  const r = el.getBoundingClientRect(); const tw = t.offsetWidth;
  t.style.left = Math.max(8, Math.min(window.innerWidth - tw - 8, r.left + r.width / 2 - tw / 2)) + 'px';
  t.style.top = Math.max(8, r.top - t.offsetHeight - 8) + 'px';
});
document.addEventListener('scroll', () => { tip().hidden = true; }, true);

document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-act]');
  if (ui.menu && !ev.target.closest('.menu') && !(el && el.dataset.act === 'menu')) { ui.menu = null; render(); }
  if (!el || el.disabled) return;
  const act = el.dataset.act; const i = el.dataset.i !== undefined ? +el.dataset.i : null;
  switch (act) {
    case 'nav': {
      if (el.dataset.locked === '1') { toast('Abre o crea un proyecto para entrar aquí. El rol no bloquea el menú.'); break; }
      if (el.dataset.view === 'nuevo' && ui.view !== 'nuevo') ui.wizard = null; go(el.dataset.view); break;
    }
    case 'menu': ui.menu = ui.menu === el.dataset.menu ? null : el.dataset.menu; render(); break;
    case 'drawer': ui.drawer = !ui.drawer; render(); break;
    case 'palette': ui.palette = true; ui.paletteQ = ''; ui.paletteIdx = 0; renderPalette(); break;
    case 'pal-close': ui.palette = false; renderPalette(); break;
    case 'pal-run': { const it = (ui._pItems || [])[i]; ui.palette = false; renderPalette(); if (it) it.act(); break; }
    case 'cycle-theme': { const order = ['sistema', 'claro', 'oscuro']; ws.settings.tema = order[(order.indexOf(ws.settings.tema) + 1) % 3]; saveWs(); applyTheme(); render(); toast(`Tema: ${ws.settings.tema}`); break; }
    case 'set': ws.settings[el.dataset.k] = el.dataset.v; saveWs(); applyTheme(); render(); break;
    case 'set-color': {
      ws.profile.color = el.dataset.c;
      const asAccent = { teal: 'teal', blue: 'blue', green: 'green', amber: 'amber', rose: 'rose' }[el.dataset.c];
      if (asAccent) { ws.settings.acento = asAccent; applyTheme(); }
      saveWs(); render(); break;
    }
    case 'help-tab': ui.helpTab = el.dataset.tab; render(); break;
    case 'open-project': openProject(el.dataset.id); break;
    case 'open-case': openCase(el.dataset.case); break;
    case 'reset-case': resetCase(el.dataset.case); break;
    case 'close-demos': for (const p of ws.projects.filter((x) => x.kind === 'demo')) deleteProject(p.id); render(); toast('Casos de ejemplo cerrados'); break;
    case 'ask': ui.confirm = el.dataset.what; render(); break;
    case 'confirm-no': ui.confirm = null; render(); break;
    case 'del-project': deleteProject(el.dataset.id); ui.confirm = null; render(); toast('Proyecto eliminado'); break;
    case 'wipe': for (const p of ws.projects) store.del(PKEY(p.id)); store.del(WS_KEY); ws = sanitizeWs(null); state = null; recompute(); applyTheme(); ui.confirm = null; go('inicio'); toast('Datos borrados'); break;
    case 'ob-save': ws.profileDone = true; saveWs(); render(); toast(ws.profile.nombre ? `Encantado, ${ws.profile.nombre.split(' ')[0]}` : 'Perfil guardado'); break;
    case 'ob-skip': ws.profileDone = true; saveWs(); render(); break;
    case 'backup': backup(); break;
    case 'restore': pickFile('.json,application/json', (f) => checkSize(f, LIM.fileJson, 'El fichero es') && readText(f, importProyecto)); break;
    case 'import-xlsx': ui.menu = null; pickFile('.xlsx', importXlsx); break;
    case 'import-json': pickFile('.json,application/json', (f) => checkSize(f, LIM.fileJson, 'El fichero es') && readText(f, importProyecto)); break;
    case 'import-hall': pickFile('.csv,.json,text/csv,application/json', (f) => checkSize(f, LIM.fileCsv, 'El fichero es') && readText(f, (t) => importHallazgos(t, f.name))); break;
    /* asistente de nuevo proyecto */
    case 'wz-add': { const w = ui.wizard; const tipo = w.activos.filter((a) => a.tipo === 'Servicio').length <= w.activos.filter((a) => a.tipo === 'Información').length ? 'Servicio' : 'Información'; const pref = tipo === 'Servicio' ? 'S-' : 'I-'; w.activos.push({ tipo, id: nextId(pref, w.activos, 2), nombre: '', responsable: '', D: 'BAJO', I: 'BAJO', C: 'BAJO', A: 'BAJO', T: 'BAJO' }); render(); break; }
    case 'wz-del': ui.wizard.activos.splice(i, 1); render(); break;
    case 'wz-back': ui.wizard.step--; ui.wizard.error = ''; render(); break;
    case 'wz-next': { const w = ui.wizard;
      if (w.step === 1 && (blank(w.organizacion) || blank(w.sistema))) { w.error = 'Indica la organización y el sistema de información.'; render(); break; }
      if (w.step === 2 && w.activos.some((a) => blank(a.nombre))) { w.error = 'Pon nombre a todos los activos esenciales (o quita los que sobren).'; render(); break; }
      w.step++; w.error = ''; render(); break; }
    case 'wz-create': { const w = ui.wizard;
      const st = blankState({ organizacion: w.organizacion, sistema: w.sistema, nombre: w.organizacion, sector: w.sector, codigoSoA: w.codigoSoA, codigoAR: w.codigoAR, responsable: w.responsable, apetito: w.apetito, plantilla: w.plantilla === 'sugerida', categorizacion: w.activos.map((a) => ({ ...a, justificacion: '' })) });
      ui.wizard = null; createProject(st, { msg: 'Proyecto creado. Siguiente paso: declara las medidas.' }); break; }
    /* proyecto */
    case 'goto-soa': ev.stopPropagation(); gotoSoa(el.dataset.code); break;
    case 'soa-toggle': if (ev.target.closest('.code-chip')) return; ui.soaOpen = ui.soaOpen === el.dataset.code ? null : el.dataset.code; render(); break;
    case 'soa-marco': ui.soaMarco = el.dataset.v; render(); break;
    case 'soa-pend': ui.soaEstado = 'pendientes'; ui.soaOpen = null; go('soa'); break;
    case 'audit-sev': ui.auditSev = el.dataset.v; render(); break;
    case 'plan-f': ui.planFiltro = el.dataset.v; render(); break;
    case 'riesgos-tab': ui.riesgosTab = el.dataset.tab; render(); break;
    case 'toggle-hall': ui.conHallazgos = el.checked; render(); break;
    case 'add-cat': state.categorizacion.push({ tipo: 'Servicio', id: nextId('S-', state.categorizacion, 2), nombre: 'Nuevo activo esencial', responsable: '', D: 'BAJO', I: 'BAJO', C: 'BAJO', A: 'BAJO', T: 'BAJO', justificacion: '' }); commit('Activo esencial añadido'); break;
    case 'del-cat': state.categorizacion.splice(i, 1); commit('Activo esencial eliminado'); break;
    case 'add-activo': state.activos.push({ id: nextId('ACT-', state.activos), nombre: 'Nuevo activo', tipo: '[D]', soporta: [], descripcion: '', valoracion: { D: 5, I: 5, C: 5, A: 5, T: 5 } }); commit('Activo añadido'); break;
    case 'del-activo': { const id = state.activos[i].id; const ams = state.amenazas.filter((a) => a.activoId === id).map((a) => a.id);
      state.activos.splice(i, 1); state.amenazas = state.amenazas.filter((a) => a.activoId !== id);
      for (const s of state.salvaguardas) s.cubre = (s.cubre || []).filter((x) => !ams.includes(x)); for (const a of ams) delete state.tratamiento[a];
      state.hallazgos = state.hallazgos.filter((h) => h.activoId !== id); commit(`Activo ${id} eliminado con sus amenazas`); break; }
    case 'add-amenaza': { const a0 = state.activos[0]; state.amenazas.push({ id: nextId('R-', state.amenazas), activoId: a0.id, codigo: '[A.11]', nombre: 'Acceso no autorizado', prob: 'M', deg: { D: 0, I: 50, C: 50, A: 0, T: 0 } }); commit('Amenaza añadida'); break; }
    case 'del-amenaza': { const id = state.amenazas[i].id; state.amenazas.splice(i, 1); for (const s of state.salvaguardas) s.cubre = (s.cubre || []).filter((x) => x !== id); delete state.tratamiento[id]; commit('Amenaza eliminada'); break; }
    case 'add-salv': state.salvaguardas.push({ id: nextId('SAL-', state.salvaguardas), codigo: 'H.AC', nombre: 'Control de acceso lógico', madurez: 'L3', reduceProb: 50, reduceImp: 20, cubre: [] }); commit('Salvaguarda añadida'); break;
    case 'del-salv': state.salvaguardas.splice(i, 1); commit('Salvaguarda eliminada'); break;
    case 'add-mc': state.compensatorias.push({ id: nextId('MC-', state.compensatorias, 2), medida: '', ambito: '', limitaciones: '', objetivo: '', riesgo: '', definicion: '', validacion: '', mantenimiento: '', aprobacion: '' }); commit('Medida compensatoria añadida'); break;
    case 'del-mc': state.compensatorias.splice(i, 1); commit('Medida compensatoria eliminada'); break;
    case 'add-hall': state.hallazgos.push({ id: nextId('H-', state.hallazgos, 2), titulo: 'Nuevo hallazgo', categoria: 'OUTDATED', cvss: 7.5, activoId: state.activos[0].id, estado: 'abierto', fuente: 'Manual' }); commit('Hallazgo añadido'); break;
    case 'del-hall': state.hallazgos.splice(i, 1); commit('Hallazgo eliminado'); break;
    case 'use-just': { const f = calc.filas.find((x) => x.codigo === el.dataset.code); state.soa[f.codigo] = state.soa[f.codigo] || {}; state.soa[f.codigo].justificacion = f.justAuto; commit('Justificación actualizada'); break; }
    case 'ai-amenazas': aiAmenazas(el.dataset.id); break;
    case 'ai-close': ui.ai = { ...ui.ai, activo: null, props: [], error: '' }; render(); break;
    case 'ai-add': { const p = ui.ai.props[i]; if (!p || p.added) break; const id = nextId('R-', state.amenazas);
      state.amenazas.push({ id, activoId: ui.ai.activo, codigo: p.codigo, nombre: p.nombre, prob: p.prob, deg: p.deg });
      const row = E.registroRiesgos(state, CTX, false).find((r) => r.amenaza.id === id); if (row) state.tratamiento[id] = E.tratamientoSugerido(row, state.apetito);
      p.added = true; commit(`${id} añadida al análisis`); break; }
    case 'ai-just': aiJust(el.dataset.code); break;
    case 'ai-just-use': { const c = el.dataset.code; state.soa[c] = state.soa[c] || {}; state.soa[c].justificacion = ui.ai.just; ui.ai = { ...ui.ai, just: '', justCode: null }; commit('Justificación actualizada'); break; }
    case 'export-xlsx': exportXlsx(); break;
    case 'export-md': saveFile(`${slug()}_informe_preauditoria_${today()}.md`, informeMd()); break;
    case 'export-json': saveFile(`${slug()}_proyecto_${today()}.json`, JSON.stringify(state, null, 1)); break;
    case 'export-csv': saveFile(`${slug()}_registro_riesgos_${today()}.csv`, riesgosCsv()); break;
    case 'export-plan': saveFile(`${slug()}_plan_accion_${today()}.csv`, planCsv()); break;
    case 'export-tpl': saveFile('plantilla_hallazgos.csv', '﻿id,titulo,categoria,cvss,activoId,estado,fuente\r\nH-08,XSS almacenado en el buzón del ciudadano,XSS,6.1,ACT-002,abierto,Pentest 2027\r\nH-09,Copias accesibles desde la red de usuarios,BACKUP,8.2,ACT-001,abierto,Pentest 2027\r\n'); break;
    default: break;
  }
});

/* ---------- Arranque ---------- */
ws = sanitizeWs(store.get(WS_KEY));
const avatarAccent = { teal: 'teal', blue: 'blue', green: 'green', amber: 'amber', rose: 'rose' }[ws.profile.color];
if (avatarAccent && avatarAccent !== 'teal' && ws.settings.acento === 'teal') { ws.settings.acento = avatarAccent; saveWs(); }
ui.conHallazgos = ws.settings.conHallazgos;
try { Object.freeze(Object.prototype); } catch (e) { /* entorno que no lo permite */ }
applyTheme();
if (ws.activeId && store.get(PKEY(ws.activeId))) { state = migrate(store.get(PKEY(ws.activeId))); recompute(); }
ui.view = [...PROJECT_VIEWS, ...GLOBAL_VIEWS].includes(initialView) && (state || !PROJECT_VIEWS.includes(initialView)) ? initialView : (state ? 'panel' : 'inicio');
render();
aiNS().then((s) => { if (s) { ui.ai.available = true; if (ws.settings.asistente) render(); } });
window.__ENS_STUDIO__ = { get state() { return state; }, get calc() { return calc; }, get audit() { return audit; }, get plan() { return plan; }, get ws() { return ws; }, openCase, go };
