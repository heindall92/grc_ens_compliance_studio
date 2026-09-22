#!/usr/bin/env node
/* Construye dist/ens-compliance-studio.html (un único fichero autocontenido)
 * a partir de src/ (engine.js, app.js, styles.css, index.html) y ../data/*.json */
'use strict';
const fs = require('fs');
const path = require('path');
const E = require('./src/engine.js');

const ROOT = __dirname;
const DATA = path.join(ROOT, '..', 'data');
const rd = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));

const ens = rd('ens_techserv.json');
const cat = rd('magerit_catalogos.json');
const mapping = rd('mapping.json');
const mag = rd('techserv_magerit.json');

/* Anexo II: texto normativo + exigencias por nivel + equivalencia ISO (estático) */
const anexo = {};
for (const [code, a] of Object.entries(ens.anexo)) {
  const m = ens.medidas.find((x) => x.codigo === code) || {};
  anexo[code] = { nombre: a.nombre, dims: a.dims, bajo: a.bajo, medio: a.medio, alto: a.alto, texto: a.texto,
    refuerzosTexto: a.refuerzos || '', iso27001: m.iso27001 || '', guias: m.guias || '' };
}

/* Estado semilla: caso TechServ (SoA del profesor + AR MAGERIT ampliado) */
const soa = {};
for (const m of ens.medidas) {
  soa[m.codigo] = { aplica: m.aplica, justificacion: m.justificacion, org: m.org, tec: m.tec, mc_ref: m.mc_ref,
    estado: m.estado, pct: m.pct, evidencias: m.evidencias, responsable: m.responsable,
    refuerzos_elegidos: m.refuerzos_elegidos, observaciones: m.observaciones };
}
const seed = {
  version: 1,
  proyecto: { nombre: 'TechServ · PSTA', organizacion: 'TechServ Administración, S.L. (ficticia)',
    sistema: 'PSTA – Plataforma de Servicios TIC para la Administración Autonómica', codigoAR: mag.proyecto.codigo, codigoSoA: 'SOA-ENS-PSTA' },
  portada: ens.portada,
  categorizacion: ens.categorizacion.map((c) => ({ ...c })),
  soa,
  refuerzos: ens.refuerzos,
  compensatorias: ens.compensatorias,
  apetito: mag.apetito,
  activos: mag.activos,
  amenazas: mag.amenazas,
  salvaguardas: mag.salvaguardas,
  hallazgos: mag.hallazgos,
  tratamiento: {}
};
const ctx = { anexo, mapping, amenazasCatalogo: cat.CATALOGO_AMENAZAS };
for (const r of E.registroRiesgos(seed, ctx, false)) seed.tratamiento[r.amenaza.id] = E.tratamientoSugerido(r, seed.apetito);
// Plazos y responsables realistas para los riesgos a mitigar del caso (el AR "aprobado" los tendría)
const plazos = { 'R-006': '2026-12-31', 'R-012': '2026-11-30', 'R-007': '2026-12-15', 'R-001': '2027-01-31', 'R-005': '2027-01-31', 'R-013': '2027-03-31' };
for (const [id, t] of Object.entries(seed.tratamiento)) if (t.opcion === 'mitigar') t.plazo = plazos[id] || '2027-03-31';

/* ---------- Casos de ejemplo ---------- */
const GEN = require('./cases/generic_measures.js');
const { CASES, RESP } = require('./cases/cases.js');
const fill = (txt, c) => String(txt || '').replace(/\{(\w+)\}/g, (_, k) => (k === 'ORG' ? c.proyecto.organizacion.replace(/ \(fictici[oa]\)/, '') : (c.herramientas[k] || k)));
function refNames(code) {
  const out = {}; const t = anexo[code].refuerzosTexto || '';
  for (const m of t.matchAll(/(R\d+)-([^.\n]+)/g)) if (!out[m[1]]) out[m[1]] = m[2].trim();
  return out;
}
function historia(finalSnap, seedN) {
  // Evolución de ejemplo (6 meses) que termina en el estado actual del caso. Datos ficticios, marcados como tales en la interfaz.
  const out = []; const hoy = new Date(2026, 8, 1);
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const k = i / 5; const wob = ((seedN * (i + 3)) % 5) / 100;
    out.push({ fecha: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`, grado: Math.max(0, Math.min(1, finalSnap.grado - 0.16 * k + wob * k)),
      ncMayor: Math.round(finalSnap.ncMayor + 6 * k), ncMenor: Math.round(finalSnap.ncMenor + 4 * k + (i % 2)), fuera: Math.round(finalSnap.fuera + 2 * k), ejemplo: true });
  }
  return out;
}
function buildCase(c) {
  const st = { version: 2, caseId: c.id, proyecto: { nombre: c.titulo, ...c.proyecto }, portada: c.portada, categorizacion: c.categorizacion.map((a) => ({ justificacion: '', ...a })),
    soa: {}, refuerzos: [], compensatorias: c.compensatorias, apetito: c.apetito, activos: c.activos,
    amenazas: c.amenazas.map((a) => ({ nombre: (cat.CATALOGO_AMENAZAS.find((x) => x.code === a.codigo) || {}).nombre || a.codigo, ...a })),
    salvaguardas: c.salvaguardas, hallazgos: c.hallazgos, tratamiento: {}, acciones: {} };
  const { niveles } = E.nivelesSistema(st.categorizacion); const categ = E.categoria(niveles);
  let sobre = c.sobrecumplimiento || 0;
  for (const code of Object.keys(anexo).sort(E.codeSort)) {
    const ax = anexo[code]; const { nivel } = E.nivelExigido(ax.dims, niveles, categ);
    const exig = ax[nivel.toLowerCase()]; const pe = E.parseExigencia(exig); const g = GEN[code];
    const fam = code.replace(/\.\d+$/, '');
    let d;
    if (pe.aplica || sobre > 0) {
      if (!pe.aplica) sobre--;
      d = { aplica: 'SÍ', estado: 'Implantada', pct: 1, org: fill(g.org, c), tec: fill(g.tec, c), evidencias: fill(g.ev, c), responsable: code === 'mp.info.1' ? 'Delegado de Protección de Datos' : RESP[fam],
        mc_ref: '—', observaciones: '', refuerzos_elegidos: pe.obligatorios.length || pe.grupos.length ? [...pe.obligatorios, ...pe.grupos.map((gr) => gr[0])].join(' + ') + ' implantados.' : '—' };
    } else d = { aplica: 'NO', estado: 'No aplica', pct: null, org: '', tec: '', evidencias: '—', responsable: RESP[fam], mc_ref: '—', observaciones: '', refuerzos_elegidos: '—' };
    st.soa[code] = { ...d, ...(c.soa[code] || {}) };
    if (pe.aplica) {
      const nm = refNames(code);
      for (const r of pe.obligatorios) {
        const no = (c.refuerzosNo || []).some(([cc, rr]) => cc === code && rr === r);
        st.refuerzos.push({ codigo: code, medida: ax.nombre, refuerzo: r, nombre: nm[r] || '', niveles: nivel, nivel_exigido: nivel, exigible: no ? 'No' : 'Sí', texto: '', implementacion: no ? '—' : 'Implantado; ver SoA.' });
      }
      for (const gr of pe.grupos) gr.forEach((r, i) => st.refuerzos.push({ codigo: code, medida: ax.nombre, refuerzo: r, nombre: nm[r] || '', niveles: nivel, nivel_exigido: nivel, exigible: 'Alternativa (elegir ≥1 del grupo)', texto: '', implementacion: i === 0 ? 'Alternativa elegida.' : '—' }));
    }
  }
  const ctxC = { anexo, mapping, amenazasCatalogo: cat.CATALOGO_AMENAZAS };
  const calc0 = E.calcular(st, ctxC);
  for (const f of calc0.filas) if (f.aplicaNorma && st.soa[f.codigo] && E.isBlank(st.soa[f.codigo].justificacion)) st.soa[f.codigo].justificacion = f.justAuto;
  for (const f of calc0.filas) if (!f.aplicaNorma && st.soa[f.codigo].aplica === 'NO' && E.isBlank(st.soa[f.codigo].justificacion)) st.soa[f.codigo].justificacion = f.justAuto;
  for (const r of E.registroRiesgos(st, ctxC, false)) { const t = E.tratamientoSugerido(r, st.apetito); if (t.opcion === 'mitigar') t.plazo = '2027-03-31'; st.tratamiento[r.amenaza.id] = t; }
  return st;
}
const ctx0 = { anexo, mapping, amenazasCatalogo: cat.CATALOGO_AMENAZAS };
const casos = [];
const techserv = { ...seed, version: 2, caseId: 'techserv', acciones: {} };
casos.push({ id: 'techserv', icono: 'server', sector: 'Proveedor TIC de la Administración', titulo: 'TechServ Administración',
  resumen: 'El caso de clase: empresa privada de 85 personas que presta servicios TIC a tres consejerías. Categoría ALTA, SoA muy trabajada y análisis MAGERIT formal. Aun así, la SoA y el análisis de riesgos se contradicen, y un pentest deja al descubierto medidas declaradas como implantadas.',
  retos: ['SoA y análisis de riesgos se contradicen', '11 NC por evidencia técnica', 'Medidas exigidas sin riesgo vinculado'], state: techserv });
for (const c of CASES) casos.push({ id: c.id, icono: c.icono, sector: c.sector, titulo: c.titulo, resumen: c.resumen, retos: c.retos, state: buildCase(c) });
casos.forEach((cs, i) => {
  const c1 = E.calcular(cs.state, ctx0); const a1 = E.auditar(cs.state, ctx0, c1, { hoy: '2026-09-22' });
  cs.state.historial = historia(E.instantanea(c1, a1), i + 2);
  cs.meta = { categoria: c1.categoria, aplicables: c1.kpi.aplicables, grado: c1.kpi.grado, ncMayor: a1.filter((f) => f.sev === 'NC mayor').length, ncMenor: a1.filter((f) => f.sev === 'NC menor').length, riesgos: c1.kpi.riesgos, hallazgos: c1.kpi.hallazgosAbiertos };
  console.log(`  caso ${cs.id.padEnd(12)} ${c1.categoria.padEnd(7)} exigidas ${c1.kpi.aplicables} · grado ${(c1.kpi.grado * 100).toFixed(1)} % · NC ${cs.meta.ncMayor}/${cs.meta.ncMenor} · ${[...new Set(a1.map((f) => f.id))].join(' ')}`);
});

const DATA_JS = 'window.ENS_DATA = ' + JSON.stringify({
  anexo,
  catalogos: { TIPOS_ACTIVO: cat.TIPOS_ACTIVO, AMENAZAS: cat.CATALOGO_AMENAZAS, SALVAGUARDAS: cat.CATALOGO_SALVAGUARDAS,
    TIPOS_SALVAGUARDA: cat.TIPOS_SALVAGUARDA, FRECUENCIA: cat.FRECUENCIA_ANUAL },
  mapping: { salvaguarda_ens: mapping.salvaguarda_ens, amenaza_ens: mapping.amenaza_ens, hallazgo_categorias: mapping.hallazgo_categorias },
  seed, casos
}).replace(/<\//g, '<\\/') + ';';

fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'seed_techserv.json'), JSON.stringify(seed, null, 1));
fs.writeFileSync(path.join(ROOT, 'dist', 'ens_data.json'), DATA_JS.slice('window.ENS_DATA = '.length, -1));
if (process.argv.includes('--data-only')) process.exit(0);
const src = (f) => fs.readFileSync(path.join(ROOT, 'src', f), 'utf8');
const html = src('index.html')
  .replace('/*__STYLES__*/', () => src('styles.css'))
  .replace('/*__DATA__*/', () => DATA_JS)
  .replace('/*__ENGINE__*/', () => src('engine.js'))
  .replace('/*__APP__*/', () => '(function () {\n\'use strict\';\n' + fs.readdirSync(path.join(ROOT, 'src', 'ui')).filter((f) => f.endsWith('.js')).sort().map((f) => `/* ===== ${f} ===== */\n` + src('ui/' + f)).join('\n') + '\n})();');
// 1) Página para publicar como web alojada (el esqueleto <html><head> lo añade la plataforma; xlsx-js-style se carga bajo demanda desde jsDelivr)
fs.mkdirSync(path.join(ROOT, 'dist', 'artifact'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'artifact', 'ens-compliance-studio.html'), html.replace('<!--__XLSX__-->', ''));
// 2) Versión autónoma: un único .html que funciona sin conexión (librería de Excel embebida)
const xlsx = fs.readFileSync(path.join(ROOT, 'vendor', 'xlsx.bundle.js'), 'utf8').replace(/<\/script/gi, '<\\/script');
// CSP estricta: sin conexiones salientes (connect-src 'none'), sin plugins ni formularios; solo fuentes de Google y el CDN de la librería de Excel
const CSP = "default-src 'none'; script-src 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src data: blob:; connect-src 'none'; media-src 'none'; object-src 'none'; frame-src 'none'; worker-src 'none'; base-uri 'none'; form-action 'none'";
const standalone = '<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n<meta http-equiv="Content-Security-Policy" content="' + CSP + '">\n<meta name="referrer" content="no-referrer">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
  + html.replace('<!--__XLSX__-->', () => '<script>/*! xlsx-js-style 1.2.0 · Apache-2.0 · SheetJS CE */\n' + xlsx + '\n</script>')
    .replace('<div class="shell">', '</head>\n<body>\n<div class="shell">') + '\n</body>\n</html>\n';
fs.writeFileSync(path.join(ROOT, 'dist', 'ens-compliance-studio.html'), standalone);
console.log('OK dist/artifact/ens-compliance-studio.html', (html.length / 1024).toFixed(0) + ' KB · dist/ens-compliance-studio.html (autónomo)', (standalone.length / 1024).toFixed(0) + ' KB');
