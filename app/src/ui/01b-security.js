/* ---------- Seguridad: todo lo que entra se trata como no fiable ----------
 * - Validación por esquema de proyectos, copias, importaciones y almacenamiento local (listas blancas, límites, tipos).
 * - Claves peligrosas (__proto__, constructor, prototype) bloqueadas en cualquier ruta de escritura.
 * - Neutralización de fórmulas en CSV (CSV/Formula injection) y de HTML en informes Markdown.
 * - Límites de tamaño en ficheros importados.
 * La salida al DOM se escapa siempre con esc(); nunca se inserta HTML procedente de datos. */
const BAD_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const LIM = { str: 4000, short: 300, arr: 2000, fileJson: 25 * 1024 * 1024, fileXlsx: 15 * 1024 * 1024, fileCsv: 5 * 1024 * 1024 };
const s = (v, max = LIM.str) => (v === null || v === undefined ? '' : String(typeof v === 'object' ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').slice(0, max));
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const idOk = (v) => (typeof v === 'string' || typeof v === 'number') && /^[A-Za-z0-9][A-Za-z0-9._-]{0,39}$/.test(String(v)) ? String(v) : null;
const oneOf = (v, list, def) => (list.includes(v) ? v : def);
const num = (v, min, max, def = min) => { const n = Number(v); return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : def; };
const dateOk = (v) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : '');
const arr = (v, max = LIM.arr) => (Array.isArray(v) ? v.slice(0, max) : []);
function safeEntries(o, max = 500) { return isObj(o) ? Object.keys(o).filter((k) => !BAD_KEYS.has(k)).slice(0, max).map((k) => [k, o[k]]) : []; }
function safeParse(text) {
  // JSON.parse crea «__proto__» como propiedad propia (no contamina), pero se eliminan de todo el árbol
  return JSON.parse(text, (k, v) => (BAD_KEYS.has(k) ? undefined : v));
}
const TIPO_CODES = TIPOS.map((t) => t.code);
const AM_CODES = new Set(CAT_AM.map((a) => a.code));
const SAL_CODES = new Set(CAT_SAL.map((a) => a.code));
const CASE_IDS = D.casos.map((c) => c.id);

function sanitizeState(raw) {
  const r = isObj(raw) ? raw : {};
  const st = { version: 2 };
  if (CASE_IDS.includes(r.caseId)) st.caseId = r.caseId;
  const p = isObj(r.proyecto) ? r.proyecto : {};
  st.proyecto = { nombre: s(p.nombre, 200), organizacion: s(p.organizacion, 200), sistema: s(p.sistema, 300), sector: s(p.sector, 120), codigoAR: s(p.codigoAR, 60), codigoSoA: s(p.codigoSoA, 60) };
  st.portada = {}; for (const [k, v] of safeEntries(r.portada, 60)) st.portada[s(k, 160)] = s(v, 2000);
  const seenCat = new Set();
  st.categorizacion = arr(r.categorizacion, 200).filter(isObj).map((a, i) => {
    let id = idOk(a.id) || `S-${String(i + 1).padStart(2, '0')}`; if (seenCat.has(id)) id = `${id}-${i}`; seenCat.add(id);
    const o = { tipo: oneOf(a.tipo, ['Servicio', 'Información'], 'Servicio'), id, nombre: s(a.nombre, 300), responsable: s(a.responsable, 200), justificacion: s(a.justificacion, 2000) };
    for (const d of E.DIMS) {
      const lv = E.ensLevel(a[d]);
      o[d] = lv === undefined ? s(a[d], 20) : (lv || ''); // B/M/ALT pasan a BAJO/MEDIO/ALTO; lo ilegible se conserva para CAT-01
    }
    return o;
  });
  st.soa = {};
  const rs = isObj(r.soa) ? r.soa : {};
  for (const code of Object.keys(D.anexo)) {
    const d = isObj(rs[code]) ? rs[code] : null; if (!d) continue;
    st.soa[code] = { aplica: s(d.aplica, 30), estado: s(d.estado, 40), pct: d.pct === null || d.pct === undefined || d.pct === '' ? null : num(d.pct, 0, 1, null),
      justificacion: s(d.justificacion), org: s(d.org), tec: s(d.tec), mc_ref: s(d.mc_ref, 120), evidencias: s(d.evidencias, 2000), responsable: s(d.responsable, 200), observaciones: s(d.observaciones, 2000), refuerzos_elegidos: s(d.refuerzos_elegidos, 2000) };
  }
  st.refuerzos = arr(r.refuerzos, 1500).filter((x) => isObj(x) && D.anexo[x.codigo] && /^R\d{1,2}$/.test(String(x.refuerzo))).map((x) => ({ codigo: x.codigo, medida: s(x.medida, 200), refuerzo: String(x.refuerzo), nombre: s(x.nombre, 300), niveles: s(x.niveles, 40), nivel_exigido: s(x.nivel_exigido, 20), exigible: s(x.exigible, 60), texto: s(x.texto, 3000), implementacion: s(x.implementacion, 2000) }));
  st.compensatorias = arr(r.compensatorias, 200).filter(isObj).map((m, i) => { const o = { id: idOk(m.id) || `MC-${String(i + 1).padStart(2, '0')}` }; for (const k of ['medida', 'ambito', 'limitaciones', 'objetivo', 'riesgo', 'definicion', 'validacion', 'mantenimiento', 'aprobacion']) o[k] = s(m[k]); return o; });
  st.apetito = oneOf(r.apetito, E.NIVELES, 'M');
  const ids = new Set();
  st.activos = arr(r.activos, 500).filter((a) => isObj(a) && idOk(a.id) && !ids.has(a.id) && ids.add(a.id)).map((a) => {
    const v = isObj(a.valoracion) ? a.valoracion : {};
    return { id: String(a.id), nombre: s(a.nombre, 200), tipo: oneOf(a.tipo, TIPO_CODES, '[D]'), soporta: arr(a.soporta, 30).map(idOk).filter(Boolean), descripcion: s(a.descripcion, 500), valoracion: Object.fromEntries(E.DIMS.map((d) => [d, Math.round(num(v[d], 0, 10, 0))])) };
  });
  const actIds = new Set(st.activos.map((a) => a.id)); const amIds = new Set();
  st.amenazas = arr(r.amenazas).filter((a) => isObj(a) && idOk(a.id) && !amIds.has(a.id) && actIds.has(a.activoId) && AM_CODES.has(a.codigo) && amIds.add(a.id)).map((a) => {
    const g = isObj(a.deg) ? a.deg : {};
    return { id: String(a.id), activoId: a.activoId, codigo: a.codigo, nombre: (CAT_AM.find((c) => c.code === a.codigo) || {}).nombre || s(a.nombre, 200), prob: oneOf(a.prob, E.NIVELES, 'M'), deg: Object.fromEntries(E.DIMS.map((d) => [d, Math.round(num(g[d], 0, 100, 0))])) };
  });
  const salIds = new Set();
  st.salvaguardas = arr(r.salvaguardas, 500).filter((x) => isObj(x) && idOk(x.id) && !salIds.has(x.id) && SAL_CODES.has(x.codigo) && salIds.add(x.id)).map((x) => ({ id: String(x.id), codigo: x.codigo, nombre: s(x.nombre, 200), madurez: oneOf(x.madurez, Object.keys(E.MADUREZ), 'L0'), reduceProb: num(x.reduceProb, 0, 100, 0), reduceImp: num(x.reduceImp, 0, 100, 0), cubre: arr(x.cubre, 500).filter((c) => amIds.has(c)) }));
  const hIds = new Set();
  st.hallazgos = arr(r.hallazgos).filter((h) => isObj(h) && idOk(h.id) && !hIds.has(h.id) && HALL[h.categoria] && actIds.has(h.activoId) && hIds.add(h.id)).map((h) => ({ id: String(h.id), titulo: s(h.titulo, 300), categoria: h.categoria, cvss: num(h.cvss, 0, 10, 0), activoId: h.activoId, estado: oneOf(h.estado, ['abierto', 'cerrado'], 'abierto'), fuente: s(h.fuente, 200) }));
  st.tratamiento = {};
  for (const [k, t] of safeEntries(r.tratamiento, 5000)) if (idOk(k) && isObj(t)) st.tratamiento[k] = { opcion: oneOf(t.opcion, ['', 'mitigar', 'transferir', 'evitar', 'aceptar'], ''), responsable: s(t.responsable, 200), plazo: dateOk(t.plazo), notas: s(t.notas, 1000) };
  st.acciones = {};
  for (const [k, a] of safeEntries(r.acciones, 5000)) if (isObj(a) && k.length <= 300) st.acciones[k] = { estado: oneOf(a.estado, ['Pendiente', 'En curso', 'Hecha'], 'Pendiente'), responsable: s(a.responsable, 200), fecha: dateOk(a.fecha), nota: s(a.nota, 1000), titulo: s(a.titulo, 400), origen: s(a.origen, 60), ref: s(a.ref, 160) };
  st.historial = arr(r.historial, 60).filter((h) => isObj(h) && dateOk(h.fecha)).map((h) => ({ fecha: h.fecha, grado: num(h.grado, 0, 1, 0), ncMayor: Math.round(num(h.ncMayor, 0, 9999, 0)), ncMenor: Math.round(num(h.ncMenor, 0, 9999, 0)), fuera: Math.round(num(h.fuera, 0, 9999, 0)), ejemplo: h.ejemplo === true }));
  return st;
}
const PROJ_ID = /^(p-[a-z0-9]{4,20}|demo-[a-z]{2,20})$/;
function sanitizeWs(raw) {
  const r = isObj(raw) ? raw : {};
  const pr = isObj(r.profile) ? r.profile : {}; const se = isObj(r.settings) ? r.settings : {}; const cv = isObj(se.cvss) ? se.cvss : {};
  return {
    profile: { nombre: s(pr.nombre, 120), rol: s(pr.rol, 80), organizacion: s(pr.organizacion, 160), email: s(pr.email, 160), color: oneOf(pr.color, COLOR_IDS, 'teal') },
    settings: { tema: oneOf(se.tema, ['sistema', 'claro', 'oscuro'], 'sistema'), acento: oneOf(se.acento, ['teal', 'blue', 'green', 'amber', 'rose', 'graphite'], 'teal'), densidad: oneOf(se.densidad, ['comoda', 'compacta'], 'comoda'),
      idioma: oneOf(se.idioma, ['es', 'en'], 'es'),
      apetito: oneOf(se.apetito, E.NIVELES, 'M'), cvss: { ma: num(cv.ma, 0, 10, 9), a: num(cv.a, 0, 10, 7), m: num(cv.m, 0, 10, 4) }, conHallazgos: se.conHallazgos !== false,
      madurezMin: oneOf(se.madurezMin, ['L1', 'L2', 'L3'], 'L2'), reglasOff: arr(se.reglasOff, 60).filter((x) => /^[A-Z]{2,3}-\d{2}$/.test(String(x))), asistente: se.asistente === true, mostrarCasos: se.mostrarCasos !== false },
    projects: arr(r.projects, 300).filter((p) => isObj(p) && PROJ_ID.test(String(p.id))).map((p) => ({ id: p.id, kind: oneOf(p.kind, ['own', 'demo'], 'own'), caseId: CASE_IDS.includes(p.caseId) ? p.caseId : undefined, nombre: s(p.nombre, 200), organizacion: s(p.organizacion, 200), created: s(p.created, 40), updated: s(p.updated, 40), categoria: oneOf(p.categoria, ['ALTA', 'MEDIA', 'BÁSICA'], undefined), grado: p.grado === undefined ? undefined : num(p.grado, 0, 1, 0), ncMayor: Math.round(num(p.ncMayor, 0, 9999, 0)) })),
    activeId: PROJ_ID.test(String(r.activeId)) ? r.activeId : null, onboarded: r.onboarded === true, profileDone: r.profileDone === true
  };
}
const COLOR_IDS = ['teal', 'blue', 'green', 'amber', 'rose', 'slate'];
/* CSV: una celda que empieza por = + - @ (o tab/CR) se ejecutaría como fórmula al abrirla en una hoja de cálculo */
const noFormula = (v) => { const x = String(v ?? ''); return /^[=+\-@\t\r]/.test(x) ? "'" + x : x; };
/* Markdown: se neutraliza HTML incrustado y las barras de tabla */
const mdSafe = (v) => String(v ?? '').replace(/[<>]/g, (c) => (c === '<' ? '&lt;' : '&gt;')).replace(/\|/g, '/').replace(/\r?\n/g, ' ');
function checkSize(f, max, label) { if (f.size > max) { toast(`${label} demasiado grande (máximo ${Math.round(max / 1048576)} MB)`); return false; } return true; }
