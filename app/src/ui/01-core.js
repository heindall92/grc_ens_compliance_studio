/* ---------- Núcleo: datos, almacenamiento, estado global ---------- */
const D = window.ENS_DATA;
const E = window.ENSEngine;
const CTX = { anexo: D.anexo, mapping: D.mapping, amenazasCatalogo: D.catalogos.AMENAZAS };
const XLSX_URL = 'https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js';
const HALL = D.mapping.hallazgo_categorias;
const CAT_AM = D.catalogos.AMENAZAS;
const CAT_SAL = D.catalogos.SALVAGUARDAS;
const TIPOS = D.catalogos.TIPOS_ACTIVO;
const VERSION = '2.0.0';

const clone = (o) => JSON.parse(JSON.stringify(o));
const $ = (s, r = document) => r.querySelector(s);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const blank = E.isBlank;
const pct = (x, d = 1) => (Number(x) * 100).toLocaleString(locale(), { maximumFractionDigits: d, minimumFractionDigits: d }) + ' %';
const today = () => new Date().toISOString().slice(0, 10);
const fmtDate = (iso) => { if (!iso) return '—'; const d = new Date(iso.length === 10 ? iso + 'T00:00:00' : iso); return isNaN(d) ? iso : d.toLocaleDateString(locale(), { day: 'numeric', month: 'short', year: 'numeric' }); };
const plural = (n, s, p) => `${n} ${n === 1 ? s : p}`;
const uid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
const initials = (name) => String(name || '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '··';

/* Almacenamiento: localStorage si está disponible; si no, memoria (la app funciona igual) */
const MEM = {};
const store = {
  get(k) { try { const v = localStorage.getItem(k); return v ? safeParse(v) : (MEM[k] ?? null); } catch (e) { return MEM[k] ?? null; } },
  set(k, v) { MEM[k] = v; try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin persistencia */ } },
  del(k) { delete MEM[k]; try { localStorage.removeItem(k); } catch (e) { /* nada */ } }
};
const WS_KEY = 'ens-studio/v2/ws';
const PKEY = (id) => 'ens-studio/v2/p/' + id;


let ws = null; // se carga y valida al arrancar (sanitizeWs)
const saveWs = () => store.set(WS_KEY, ws);

let state = null;         // proyecto activo
let calc = null, audit = null, plan = [];
const initialView = (location.hash || '').replace('#', '');
const ui = {
  view: 'inicio', riesgosTab: 'registro', conHallazgos: true,
  soaQ: '', soaMarco: 'todos', soaEstado: 'todos', soaOpen: null,
  auditSev: 'todas', auditFam: 'todas', planFiltro: 'abiertas', planOrigen: 'todos',
  confirm: null, menu: null, palette: false, paletteQ: '', paletteIdx: 0, drawer: false, helpTab: 'inicio', glosarioQ: '',
  wizard: null, busyXlsx: false,
  ai: { available: false, busy: null, activo: null, props: [], just: '', justCode: null, error: '' }
};

function cfgCalc() { return { conHallazgos: true, cfg: { cvss: ws.settings.cvss } }; }
function cfgAudit() { return { reglasOff: ws.settings.reglasOff, madurezMin: ws.settings.madurezMin }; }
function recompute() {
  if (!state) { calc = audit = null; plan = []; return; }
  calc = E.calcular(state, CTX, cfgCalc());
  audit = E.auditar(state, CTX, calc, cfgAudit());
  plan = E.planAccion(state, calc, audit);
}
function snapshot() {
  if (!state || !calc) return;
  const s = { fecha: today(), ...E.instantanea(calc, audit) };
  state.historial = (state.historial || []).filter((h) => h.fecha !== s.fecha);
  state.historial.push(s); state.historial = state.historial.slice(-24);
}
let saveT = null;
function saveProject() {
  if (!state || !ws.activeId) return;
  clearTimeout(saveT);
  saveT = setTimeout(() => {
    store.set(PKEY(ws.activeId), state);
    const p = ws.projects.find((x) => x.id === ws.activeId);
    if (p) { p.updated = new Date().toISOString(); p.nombre = state.proyecto?.nombre || p.nombre; p.organizacion = state.proyecto?.organizacion || ''; p.categoria = calc?.categoria; p.grado = calc?.kpi.grado; p.ncMayor = audit ? audit.filter((f) => f.sev === 'NC mayor').length : 0; }
    saveWs();
  }, 200);
}
function commit(msg) { recompute(); snapshot(); saveProject(); render(); if (msg) toast(msg); }

/* ---------- Proyectos ---------- */
const activeMeta = () => ws.projects.find((p) => p.id === ws.activeId) || null;
const isDemo = () => activeMeta()?.kind === 'demo';
function openProject(id, view = 'panel') {
  const st = store.get(PKEY(id));
  if (!st) { toast('No se encuentra el proyecto'); return; }
  state = migrate(st); ws.activeId = id; saveWs();
  ui.soaOpen = null; ui.ai = { ...ui.ai, activo: null, props: [], just: '', justCode: null };
  recompute(); snapshot(); saveProject(); go(view);
}
function migrate(st) { return sanitizeState(st); }
function openCase(caseId) {
  const cs = D.casos.find((c) => c.id === caseId); if (!cs) return;
  const id = 'demo-' + caseId;
  if (!store.get(PKEY(id))) {
    store.set(PKEY(id), clone(cs.state));
    ws.projects = ws.projects.filter((p) => p.id !== id);
    ws.projects.unshift({ id, kind: 'demo', caseId, nombre: cs.titulo, organizacion: cs.state.proyecto.organizacion, created: new Date().toISOString(), updated: new Date().toISOString(), categoria: cs.meta.categoria });
  }
  ws.onboarded = true; openProject(id);
  toast(`Caso de ejemplo: ${cs.titulo}`);
}
function resetCase(caseId) {
  const cs = D.casos.find((c) => c.id === caseId); if (!cs) return;
  store.set(PKEY('demo-' + caseId), clone(cs.state));
  if (ws.activeId === 'demo-' + caseId) { state = migrate(clone(cs.state)); recompute(); render(); }
  toast('Caso restablecido a su estado original');
}
function createProject(st, { view = 'panel', msg } = {}) {
  const id = 'p-' + uid();
  st = migrate(st);
  store.set(PKEY(id), st);
  ws.projects.unshift({ id, kind: 'own', nombre: st.proyecto.nombre || st.proyecto.organizacion || 'Proyecto', organizacion: st.proyecto.organizacion || '', created: new Date().toISOString(), updated: new Date().toISOString() });
  ws.onboarded = true; saveWs(); openProject(id, view);
  const p = activeMeta(); if (p) { p.categoria = calc.categoria; saveWs(); }
  snapshot(); saveProject();
  if (msg) toast(msg);
}
function deleteProject(id) {
  store.del(PKEY(id)); ws.projects = ws.projects.filter((p) => p.id !== id);
  if (ws.activeId === id) { ws.activeId = null; state = null; recompute(); }
  saveWs();
}
function blankState({ organizacion = '', sistema = '', nombre = '', codigoSoA = '', codigoAR = '', sector = '', categorizacion = [], apetito, plantilla = false, responsable = '' } = {}) {
  const st = { version: 2, proyecto: { nombre: nombre || organizacion, organizacion, sistema, sector, codigoAR: codigoAR || 'AR-01', codigoSoA: codigoSoA || 'SOA-01' },
    portada: { 'Fecha de emisión': new Date().toLocaleDateString('es-ES'), 'Elaborada por': responsable, 'Firma (art. 28.2 RD 311/2022)': '', 'Próxima revisión': '' },
    categorizacion, soa: {}, refuerzos: [], compensatorias: [], apetito: apetito || ws.settings.apetito, activos: [], amenazas: [], salvaguardas: [], hallazgos: [], tratamiento: {}, acciones: {}, historial: [] };
  const { niveles } = E.nivelesSistema(categorizacion); const cat = E.categoria(niveles);
  for (const code of Object.keys(D.anexo)) {
    const ax = D.anexo[code]; const { nivel } = E.nivelExigido(ax.dims, niveles, cat); const pe = E.parseExigencia(ax[nivel.toLowerCase()]);
    st.soa[code] = plantilla
      ? { aplica: pe.aplica ? 'SÍ' : 'NO', estado: pe.aplica ? 'Pendiente' : 'No aplica', pct: null, evidencias: '', responsable: '', justificacion: '', org: '', tec: '', mc_ref: '—', observaciones: '' }
      : { aplica: '', estado: 'Pendiente', pct: null, evidencias: '', responsable: '', justificacion: '', org: '', tec: '', mc_ref: '—', observaciones: '' };
    if (pe.aplica) {
      for (const r of pe.obligatorios) st.refuerzos.push({ codigo: code, medida: ax.nombre, refuerzo: r, nombre: '', niveles: nivel, nivel_exigido: nivel, exigible: 'Sí', texto: '', implementacion: '' });
      for (const g of pe.grupos) g.forEach((r) => st.refuerzos.push({ codigo: code, medida: ax.nombre, refuerzo: r, nombre: '', niveles: nivel, nivel_exigido: nivel, exigible: 'Alternativa (elegir ≥1 del grupo)', texto: '', implementacion: '' }));
    }
  }
  return st;
}

/* ---------- Apariencia ---------- */
function applyTheme() {
  const r = document.documentElement;
  if (ws.settings.tema === 'claro') r.setAttribute('data-theme', 'light');
  else if (ws.settings.tema === 'oscuro') r.setAttribute('data-theme', 'dark');
  else r.removeAttribute('data-theme');
  r.setAttribute('data-accent', ws.settings.acento);
  r.setAttribute('data-density', ws.settings.densidad);
  r.lang = ws.settings.idioma === 'en' ? 'en' : 'es';
}
