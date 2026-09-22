/* Tests del motor · node --test tests/
 * 1) Paridad con el Excel del profesor (nivel exigido y exigencia de las 73 medidas).
 * 2) Paridad con MAGERIT Lab v1.0 (se ejecuta el JS original del profesor y se comparan resultados).
 * 3) Reglas del auditor en escenarios de recategorización y evidencias técnicas.
 */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const E = require('../app/src/engine.js');

const ROOT = path.join(__dirname, '..');
const D = JSON.parse(fs.readFileSync(path.join(ROOT, 'app/dist/ens_data.json'), 'utf8'));
const EXCEL = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ens_techserv.json'), 'utf8'));
const ctx = { anexo: D.anexo, mapping: D.mapping, amenazasCatalogo: D.catalogos.AMENAZAS };
const seed = () => JSON.parse(JSON.stringify(D.seed));
const ids = (fs) => fs.map((f) => f.id);

test('categorización TechServ: ALTA con T=MEDIO y dos celdas inválidas', () => {
  const c = E.calcular(seed(), ctx);
  assert.deepEqual(c.niveles, { D: 'ALTO', I: 'ALTO', C: 'ALTO', A: 'ALTO', T: 'MEDIO' });
  assert.equal(c.categoria, 'ALTA');
  assert.deepEqual(c.invalidos.map((i) => `${i.activo}.${i.dim}=${i.valor}`), ['S-01.D=m', 'S-04.D=m']);
});

test('paridad con el Excel: nivel exigido y exigencia de las 73 medidas', () => {
  const c = E.calcular(seed(), ctx);
  assert.equal(c.filas.length, 73);
  for (const m of EXCEL.medidas) {
    const f = c.filas.find((x) => x.codigo === m.codigo);
    assert.equal(f.nivel, m.nivel_exigido, `${m.codigo} nivel`);
    assert.equal(f.exigencia, m.exigencia, `${m.codigo} exigencia`);
    assert.equal(f.aplicaNorma, m.aplica !== 'NO', `${m.codigo} aplica`);
  }
});

test('paridad con el Excel: indicadores de la hoja Resumen', () => {
  const k = E.calcular(seed(), ctx).kpi;
  assert.equal(k.aplicables, 72);
  assert.equal(k.noAplicables, 1);
  assert.equal(k.implantadas, 66);
  assert.equal(k.parciales, 6);
  assert.equal(k.compensadas, 4);
  assert.ok(Math.abs(k.grado - 0.9888888889) < 1e-9);
});

test('parseExigencia: obligatorios y grupos alternativos', () => {
  assert.deepEqual(E.parseExigencia('+ [R1 o R2 o R3 o R4] + R5 + R8'), { aplica: true, obligatorios: ['R5', 'R8'], grupos: [['R1', 'R2', 'R3', 'R4']] });
  assert.deepEqual(E.parseExigencia('n.a.'), { aplica: false, obligatorios: [], grupos: [] });
  assert.deepEqual(E.parseExigencia('aplica'), { aplica: true, obligatorios: [], grupos: [] });
});

test('paridad con MAGERIT Lab v1.0: riesgo inherente y residual del caso TechServ', () => {
  const html = fs.readFileSync(path.join(ROOT, 'data/magerit-lab-original.html'), 'utf8');
  const js = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).pop();
  const noop = () => null;
  const sandbox = { console, Date, Math, JSON, Object, Array, Number, String, confirm: () => true, alert: noop,
    document: { addEventListener: noop, getElementById: () => ({ classList: { toggle: noop, add: noop, remove: noop }, innerHTML: '', style: {} }), querySelector: () => null, querySelectorAll: () => [] },
    localStorage: { getItem: noop, setItem: noop, removeItem: noop } };
  vm.createContext(sandbox);
  vm.runInContext(js + `;
    renderAll = function(){}; showTab = function(){}; save = function(){};
    loadTechServ();
    globalThis.__out = state.amenazas.map(am => { const act = state.activos.find(a => a.id === am.activoId);
      return { codigo: am.codigo, activo: am.activoId, inh: riesgoInherente(act, am), res: riesgoResidual(act, am).riesgo }; });`, sandbox);
  const lab = JSON.parse(JSON.stringify(sandbox.__out)); // objetos de otro realm → planos
  assert.equal(lab.length, 14);
  const mio = E.registroRiesgos(seed(), ctx, false);
  for (const l of lab) {
    const r = mio.find((x) => x.amenaza.activoId === l.activo && x.amenaza.codigo === l.codigo);
    assert.ok(r, `falta ${l.activo} ${l.codigo}`);
    assert.deepEqual(r.inh, l.inh, `inherente ${l.activo} ${l.codigo}`);
    assert.deepEqual(r.res, l.res, `residual ${l.activo} ${l.codigo}`);
  }
});

test('auditor sobre el caso tal cual: detecta las celdas "m", la incoherencia SoA↔AR y la evidencia técnica', () => {
  const st = seed();
  const f = E.auditar(st, ctx, E.calcular(st, ctx), { hoy: '2026-09-22' });
  const cat = f.filter((x) => x.id === 'CAT-01');
  assert.equal(cat.length, 2);
  assert.match(cat[0].detalle, /No altera el resultado/);
  assert.deepEqual(f.filter((x) => x.id === 'AR-01').map((x) => x.ambito).sort(), ['mp.com.2', 'mp.per.3', 'mp.per.4', 'op.acc.3']);
  assert.ok(f.some((x) => x.id === 'PT-01' && x.ambito === 'op.acc.6'));
  // La SoA del profesor es coherente con su propia tabla de refuerzos y con su registro de MC
  for (const id of ['SOA-01', 'SOA-03', 'SOA-04', 'SOA-05', 'SOA-06', 'SOA-07', 'REF-01', 'REF-02', 'REF-03', 'MC-01', 'MC-02', 'MC-03', 'MC-04', 'DOC-01', 'DOC-02'])
    assert.ok(!ids(f).includes(id), `no debería aparecer ${id}`);
});

test('sin hallazgos técnicos, desaparecen las PT-xx y baja el riesgo fuera de apetito', () => {
  const st = seed(); st.hallazgos.forEach((h) => { h.estado = 'cerrado'; });
  const c = E.calcular(st, ctx);
  const f = E.auditar(st, ctx, c, { hoy: '2026-09-22' });
  assert.ok(!ids(f).some((i) => i.startsWith('PT-')));
  assert.equal(c.kpi.fueraApetito, c.kpi.fueraApetitoDeclarado);
  const c2 = E.calcular(seed(), ctx);
  assert.ok(c2.kpi.fueraApetito > c2.kpi.fueraApetitoDeclarado);
});

test('recategorización al alza: T=ALTO hace exigible mp.info.4 y R5 de op.exp.8', () => {
  const st = seed(); st.categorizacion.find((a) => a.id === 'I-02').T = 'ALTO';
  const c = E.calcular(st, ctx);
  assert.equal(c.niveles.T, 'ALTO');
  assert.equal(c.filas.find((x) => x.codigo === 'mp.info.4').aplicaNorma, true);
  const f = E.auditar(st, ctx, c, { hoy: '2026-09-22' });
  assert.ok(f.some((x) => x.id === 'SOA-01' && x.ambito === 'mp.info.4'));
  assert.ok(f.some((x) => x.id === 'REF-01' && x.ambito === 'op.exp.8 R5'));
});

test('recategorización a la baja: categoría MEDIA deja refuerzos sobrantes como observación', () => {
  const st = seed();
  for (const a of st.categorizacion) for (const d of E.DIMS) if (a[d] === 'ALTO') a[d] = 'MEDIO';
  const c = E.calcular(st, ctx);
  assert.equal(c.categoria, 'MEDIA');
  const f = E.auditar(st, ctx, c, { hoy: '2026-09-22' });
  assert.ok(f.filter((x) => x.id === 'REF-03').length > 10);
  // op.pl.1 en MEDIO exige R1 (semiformal) y la tabla solo recoge R2 (formal): el auditor no infiere equivalencias
  assert.deepEqual(f.filter((x) => x.id === 'REF-01').map((x) => x.ambito), ['op.pl.1 R1']);
});

test('medida compensada sin MC y SoA caducada se detectan', () => {
  const st = seed();
  st.compensatorias = st.compensatorias.filter((m) => m.id !== 'MC-02');
  const f = E.auditar(st, ctx, E.calcular(st, ctx), { hoy: '2027-12-01' });
  assert.ok(f.some((x) => x.id === 'MC-01' && x.ambito === 'mp.if.6'));
  assert.ok(f.some((x) => x.id === 'DOC-02'));
});

test('hallazgo sobre amenaza existente eleva su probabilidad; sobre amenaza nueva crea un riesgo derivado', () => {
  const st = seed();
  const am = E.amenazasEfectivas(st, ctx, true);
  const r002 = am.find((a) => a.id === 'R-002');
  assert.equal(r002.prob, 'MA'); // H-01 SQLi, CVSS 9.1 sobre [A.15] de ACT-001 (antes B)
  assert.deepEqual(r002.hallazgos, ['H-01']);
  assert.ok(am.some((a) => a.id === 'R-H-03' && a.codigo === '[A.14]' && a.origen === 'hallazgo'));
  assert.ok(!am.some((a) => a.id === 'R-H-07')); // H-07 está cerrado
});

/* ---------- v2: casos de ejemplo, ajustes, pendientes y plan de acción ---------- */
test('los 5 casos de ejemplo cuentan historias distintas (reglas esperadas por caso)', () => {
  const esperado = {
    techserv: ['AR-01', 'PT-01', 'CAT-01'], ayuntamiento: ['SOA-01', 'REF-01', 'SOA-04', 'SOA-05', 'SOA-06'],
    universidad: ['MC-02', 'SOA-06', 'SOA-07'], hospital: ['MC-01', 'REF-01', 'PT-01'], saas: ['DOC-01', 'DOC-02', 'SOA-02', 'SOA-05']
  };
  const cats = { techserv: 'ALTA', ayuntamiento: 'MEDIA', universidad: 'MEDIA', hospital: 'ALTA', saas: 'BÁSICA' };
  assert.equal(D.casos.length, 5);
  for (const c of D.casos) {
    const st = JSON.parse(JSON.stringify(c.state));
    const k = E.calcular(st, ctx);
    assert.equal(k.categoria, cats[c.id], c.id);
    const got = new Set(E.auditar(st, ctx, k, { hoy: '2026-09-22' }).map((f) => f.id));
    for (const id of esperado[c.id]) assert.ok(got.has(id), `${c.id} debería producir ${id}`);
    assert.equal(Object.keys(st.soa).length, 73, `${c.id}: SoA completa`);
  }
});

test('ajustes: umbrales CVSS, madurez mínima y reglas desactivadas', () => {
  const st = seed();
  const alto = E.amenazasEfectivas(st, ctx, true, { cvss: { ma: 9.5, a: 9.5, m: 9.5 } }).find((a) => a.id === 'R-002');
  assert.equal(alto.prob, 'B'); // con umbrales altísimos, el SQLi (9,1) ya no eleva la probabilidad
  const c = E.calcular(st, ctx);
  assert.equal(E.auditar(st, ctx, c, { madurezMin: 'L1', hoy: '2026-09-22' }).filter((f) => f.id === 'AR-01').length, 0);
  assert.equal(E.auditar(st, ctx, c, { madurezMin: 'L3', hoy: '2026-09-22' }).filter((f) => f.id === 'AR-01').length > 4, true);
  assert.equal(E.auditar(st, ctx, c, { reglasOff: ['CAT-01', 'PT-01'], hoy: '2026-09-22' }).some((f) => f.id === 'CAT-01' || f.id === 'PT-01'), false);
});

test('medidas pendientes: una sola observación SOA-10 en lugar de ruido por medida', () => {
  const st = seed();
  for (const code of ['org.1', 'org.2', 'op.acc.6']) st.soa[code] = { aplica: '', estado: 'Pendiente' };
  const c = E.calcular(st, ctx);
  const f = E.auditar(st, ctx, c, { hoy: '2026-09-22' });
  assert.equal(c.kpi.pendientes, 3);
  assert.deepEqual(f.filter((x) => x.id === 'SOA-10').map((x) => x.ambito), ['3 medidas']);
  assert.ok(!f.some((x) => x.id === 'SOA-01' && ['org.1', 'org.2', 'op.acc.6'].includes(x.ambito)));
});

test('plan de acción: agrega hallazgos, riesgos y NC; conserva el estado del usuario y verifica lo resuelto', () => {
  const st = seed();
  let c = E.calcular(st, ctx); let a = E.auditar(st, ctx, c, { hoy: '2026-09-22' });
  let plan = E.planAccion(st, c, a);
  assert.ok(plan.some((x) => x.key === 'H|H-01' && x.prioridad === 'Alta'));
  assert.ok(plan.some((x) => x.key === 'R|R-005'));
  assert.ok(plan.some((x) => x.key.startsWith('NC|AR-01|')));
  assert.ok(!plan.some((x) => x.key.startsWith('NC|PT-'))); // los PT-xx se resuelven con la acción del hallazgo
  const h01 = plan.find((x) => x.key === 'H|H-01');
  st.acciones = { 'H|H-01': { estado: 'En curso', responsable: 'Equipo web', fecha: '2026-10-15', titulo: h01.titulo, origen: h01.origen, ref: h01.ref } };
  plan = E.planAccion(st, c, a);
  assert.equal(plan.find((x) => x.key === 'H|H-01').estado, 'En curso');
  st.hallazgos.find((h) => h.id === 'H-01').estado = 'cerrado'; // retest correcto
  c = E.calcular(st, ctx); a = E.auditar(st, ctx, c, { hoy: '2026-09-22' });
  plan = E.planAccion(st, c, a);
  const v = plan.find((x) => x.key === 'H|H-01');
  assert.equal(v.verificada, true);
  assert.equal(v.estado, 'Verificada');
});
