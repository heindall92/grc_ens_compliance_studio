/* ENS Compliance Studio · motor de cálculo (sin DOM)
 * Categorización ENS (RD 311/2022, art. 40 y Anexo I) → nivel exigido por medida (Anexo II)
 * + análisis de riesgos MAGERIT v3 (fórmulas idénticas a MAGERIT Lab v1.0)
 * + trazabilidad riesgo ↔ medida ↔ hallazgo técnico + auditor de la SoA.
 * Funciona en navegador (window.ENSEngine) y en Node (module.exports) para los tests.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ENSEngine = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---------- Escalas ---------- */
  const DIMS = ['D', 'I', 'C', 'A', 'T'];
  const DIM_LABEL = { D: 'Disponibilidad', I: 'Integridad', C: 'Confidencialidad', A: 'Autenticidad', T: 'Trazabilidad' };
  const ENS_LEVELS = ['BAJO', 'MEDIO', 'ALTO'];
  const ENS_LV = { BAJO: 1, MEDIO: 2, ALTO: 3 };
  const CAT_TO_LEVEL = { 'ALTA': 'ALTO', 'MEDIA': 'MEDIO', 'BÁSICA': 'BAJO' };
  const LEVEL_KEY = { BAJO: 'bajo', MEDIO: 'medio', ALTO: 'alto' };

  const NIVELES = ['MB', 'B', 'M', 'A', 'MA'];
  const NN = { MB: 1, B: 2, M: 3, A: 4, MA: 5 };
  const NIVEL_LABEL = { MB: 'Muy bajo', B: 'Bajo', M: 'Medio', A: 'Alto', MA: 'Muy alto' };
  // Matriz de riesgo 5x5 [impacto][probabilidad] — idéntica a MAGERIT Lab v1.0
  const MATRIZ = [
    ['MB', 'MB', 'B', 'B', 'M'],
    ['MB', 'B', 'B', 'M', 'A'],
    ['B', 'B', 'M', 'A', 'A'],
    ['B', 'M', 'A', 'A', 'MA'],
    ['M', 'A', 'A', 'MA', 'MA']
  ];
  const MADUREZ = {
    L0: { label: 'Inexistente', eficacia: 0.0 },
    L1: { label: 'Inicial / ad hoc', eficacia: 0.1 },
    L2: { label: 'Reproducible pero intuitivo', eficacia: 0.3 },
    L3: { label: 'Proceso definido', eficacia: 0.5 },
    L4: { label: 'Gestionado y medible', eficacia: 0.7 },
    L5: { label: 'Optimizado', eficacia: 1.0 }
  };
  const SEV = { MAYOR: 'NC mayor', MENOR: 'NC menor', OBS: 'Observación' };
  const SEV_ORDER = { 'NC mayor': 0, 'NC menor': 1, 'Observación': 2 };

  /* ---------- Utilidades ---------- */
  const isBlank = (v) => v === null || v === undefined || String(v).trim() === '' || String(v).trim() === '—' || String(v).trim() === '-';
  function ensLevel(v) {
    if (isBlank(v)) return null;
    const s = String(v).trim().toUpperCase();
    return ENS_LV[s] ? s : undefined; // undefined = valor inválido
  }
  const maxEns = (a, b) => (!a ? b : !b ? a : (ENS_LV[a] >= ENS_LV[b] ? a : b));
  const maxNivel = (a, b) => (!a ? b : !b ? a : (NN[a] >= NN[b] ? a : b));
  const codeSort = (a, b) => {
    const order = ['org', 'op.pl', 'op.acc', 'op.ext', 'op.nub', 'op.exp', 'op.cont', 'op.mon', 'mp.if', 'mp.per', 'mp.eq', 'mp.com', 'mp.si', 'mp.sw', 'mp.info', 'mp.s'];
    const fam = (c) => c.replace(/\.\d+$/, '');
    const num = (c) => Number(c.match(/(\d+)$/)[1]);
    return order.indexOf(fam(a)) - order.indexOf(fam(b)) || num(a) - num(b);
  };
  const FAMILIAS = {
    'org': 'Marco organizativo', 'op.pl': 'Planificación', 'op.acc': 'Control de acceso', 'op.ext': 'Recursos externos',
    'op.nub': 'Servicios en la nube', 'op.exp': 'Explotación', 'op.cont': 'Continuidad del servicio', 'op.mon': 'Monitorización del sistema',
    'mp.if': 'Protección de las instalaciones e infraestructuras', 'mp.per': 'Gestión del personal', 'mp.eq': 'Protección de los equipos',
    'mp.com': 'Protección de las comunicaciones', 'mp.si': 'Protección de los soportes de información', 'mp.sw': 'Protección de las aplicaciones informáticas',
    'mp.info': 'Protección de la información', 'mp.s': 'Protección de los servicios'
  };
  const familiaDe = (code) => FAMILIAS[code.replace(/\.\d+$/, '')] || '';
  const marcoDe = (code) => code.startsWith('org') ? 'Marco organizativo' : code.startsWith('op') ? 'Marco operacional' : 'Medidas de protección';

  /* ---------- 1. Categorización (art. 40, Anexo I) ---------- */
  function nivelesSistema(activosEsenciales) {
    const niv = { D: null, I: null, C: null, A: null, T: null };
    const invalidos = [];
    for (const a of activosEsenciales || []) {
      for (const d of DIMS) {
        const l = ensLevel(a[d]);
        if (l === undefined) invalidos.push({ activo: a.id, nombre: a.nombre, dim: d, valor: a[d] });
        else if (l) niv[d] = maxEns(niv[d], l);
      }
    }
    return { niveles: niv, invalidos };
  }
  function categoria(niveles) {
    const vals = DIMS.map((d) => niveles[d]).filter(Boolean);
    if (vals.includes('ALTO')) return 'ALTA';
    if (vals.includes('MEDIO')) return 'MEDIA';
    return 'BÁSICA';
  }
  function dimsDe(dimsField) {
    if (!dimsField || dimsField === 'Categoría') return null;
    return String(dimsField).split('').filter((c) => DIMS.includes(c));
  }
  function nivelExigido(dimsField, niveles, cat) {
    const dl = dimsDe(dimsField);
    if (!dl) return { nivel: CAT_TO_LEVEL[cat], regla: `Categoría del sistema = ${cat}` };
    let n = null;
    const partes = dl.map((d) => { const v = niveles[d] || 'BAJO'; n = maxEns(n, v); return `${d}=${v}`; });
    return { nivel: n || 'BAJO', regla: `máx(${partes.join(', ')}) = ${n || 'BAJO'}` };
  }
  function parseExigencia(txt) {
    const s = String(txt || '').trim();
    if (!s || /^n\.?a\.?$/i.test(s)) return { aplica: false, obligatorios: [], grupos: [] };
    const grupos = [];
    const sinGrupos = s.replace(/\[([^\]]+)\]/g, (_, g) => { grupos.push(g.split(/\s+o\s+/).map((x) => x.trim()).filter(Boolean)); return ''; });
    const obligatorios = (sinGrupos.match(/R\d+/g) || []);
    return { aplica: true, obligatorios, grupos };
  }

  /* ---------- 2. MAGERIT (fórmulas de MAGERIT Lab v1.0) ---------- */
  const impacto = (valor, deg) => Math.round((Number(valor) || 0) * (Number(deg) || 0) / 100);
  function nivelDesdeImpacto(i) {
    if (i <= 0) return null;
    if (i <= 2) return 'B';
    if (i <= 5) return 'M';
    if (i <= 8) return 'A';
    return 'MA';
  }
  const celda = (nivImp, prob) => MATRIZ[NN[nivImp] - 1][NN[prob] - 1];
  function riesgoMax(obj) { let m = null; for (const d of DIMS) m = maxNivel(m, obj[d]); return m; }
  function riesgoInherente(activo, amenaza) {
    const out = {};
    for (const d of DIMS) {
      const ni = nivelDesdeImpacto(impacto(activo.valoracion?.[d], amenaza.deg?.[d]));
      out[d] = ni ? celda(ni, amenaza.prob) : null;
    }
    return out;
  }
  function eficaciaCombinada(salvs, campo) {
    let f = 1;
    for (const s of salvs) {
      const eMad = (MADUREZ[s.madurez] || MADUREZ.L0).eficacia;
      f *= 1 - ((Number(s[campo]) || 0) / 100) * eMad;
    }
    return 1 - f;
  }
  function riesgoResidual(activo, amenaza, salvs) {
    const redProb = eficaciaCombinada(salvs, 'reduceProb');
    const redImp = eficaciaCombinada(salvs, 'reduceImp');
    const pNum = Math.max(1, NN[amenaza.prob] * (1 - redProb));
    const probRes = NIVELES[Math.max(0, Math.round(pNum) - 1)];
    const out = {};
    for (const d of DIMS) {
      const inh = impacto(activo.valoracion?.[d], amenaza.deg?.[d]);
      const ni = nivelDesdeImpacto(Math.round(inh * (1 - redImp)));
      out[d] = ni ? celda(ni, probRes) : null;
    }
    return { riesgo: out, probRes, redProb, redImp };
  }
  const CVSS_DEF = { ma: 9, a: 7, m: 4 };
  const probDesdeCvss = (c, th = CVSS_DEF) => (c >= th.ma ? 'MA' : c >= th.a ? 'A' : c >= th.m ? 'M' : 'B');
  const sevCvss = (c) => (c >= 9 ? 'Crítica' : c >= 7 ? 'Alta' : c >= 4 ? 'Media' : c > 0 ? 'Baja' : 'Info');

  /* Amenazas efectivas: las declaradas en el AR + la evidencia de hallazgos técnicos abiertos. */
  function amenazasEfectivas(state, ctx, conHallazgos, cfg = {}) {
    const base = (state.amenazas || []).map((a) => ({ ...a, deg: { ...a.deg }, hallazgos: [] }));
    if (!conHallazgos) return base;
    for (const h of state.hallazgos || []) {
      if (h.estado !== 'abierto') continue;
      const cat = ctx.mapping.hallazgo_categorias[h.categoria];
      if (!cat) continue;
      const p = probDesdeCvss(Number(h.cvss) || 0, cfg.cvss || CVSS_DEF);
      const ex = base.find((a) => a.activoId === h.activoId && a.codigo === cat.amenaza);
      if (ex) {
        ex.prob = maxNivel(ex.prob, p);
        for (const d of DIMS) ex.deg[d] = Math.max(ex.deg[d] || 0, cat.deg[d] || 0);
        ex.hallazgos.push(h.id);
      } else {
        const cata = (ctx.amenazasCatalogo || []).find((x) => x.code === cat.amenaza);
        base.push({ id: 'R-' + h.id, activoId: h.activoId, codigo: cat.amenaza, nombre: cata ? cata.nombre : cat.label,
          prob: p, deg: { ...cat.deg }, origen: 'hallazgo', salvCodigo: cat.salvaguarda, hallazgos: [h.id] });
      }
    }
    return base;
  }
  function salvaguardasDe(state, amenaza) {
    return (state.salvaguardas || []).filter((s) => (s.cubre || []).includes(amenaza.id) ||
      (amenaza.origen === 'hallazgo' && s.codigo === amenaza.salvCodigo));
  }

  function registroRiesgos(state, ctx, conHallazgos = true, cfg = {}) {
    const ap = NN[state.apetito || 'M'];
    return amenazasEfectivas(state, ctx, conHallazgos, cfg).map((am) => {
      const act = (state.activos || []).find((a) => a.id === am.activoId) || { valoracion: {} };
      const salvs = salvaguardasDe(state, am);
      const inh = riesgoInherente(act, am);
      const res = riesgoResidual(act, am, salvs);
      const inhMax = riesgoMax(inh), resMax = riesgoMax(res.riesgo);
      let impInh = null, impRes = null; // nivel de impacto máximo (eje Y del mapa de calor)
      for (const d of DIMS) {
        const i0 = impacto(act.valoracion?.[d], am.deg?.[d]);
        impInh = maxNivel(impInh, nivelDesdeImpacto(i0));
        impRes = maxNivel(impRes, nivelDesdeImpacto(Math.round(i0 * (1 - res.redImp))));
      }
      const ens = ctx.mapping.amenaza_ens[am.codigo] || [];
      return { amenaza: am, activo: act, salvs, inh, inhMax, res: res.riesgo, resMax, probIn: am.prob, probRes: res.probRes, impInh, impRes,
        redProb: res.redProb, redImp: res.redImp, ens, fueraApetito: !!resMax && NN[resMax] > ap,
        tratamiento: (state.tratamiento || {})[am.id] || null };
    });
  }
  function tratamientoSugerido(fila, apetito) {
    return fila.resMax && NN[fila.resMax] > NN[apetito]
      ? { opcion: 'mitigar', responsable: 'Responsable de Seguridad', plazo: '', notas: 'Reforzar salvaguardas hasta situar el riesgo dentro del apetito.' }
      : { opcion: 'aceptar', responsable: 'Responsable de la Información', plazo: '', notas: 'Riesgo residual dentro del apetito declarado.' };
  }

  /* ---------- 3. SoA dinámica ---------- */
  const ESTADOS_PARCIALES = /parcial|planificad|en curso/i;
  const esPendiente = (d) => !d || /^pendiente$/i.test(String(d.estado || '').trim()) || (isBlank(d.aplica) && isBlank(d.estado));
  function pctDe(d) {
    if (typeof d.pct === 'number') return d.pct;
    if (d.pct !== null && d.pct !== undefined && d.pct !== '' && !isNaN(Number(d.pct))) return Number(d.pct);
    if (/^implantada$/i.test(d.estado || '')) return 1;
    return 0;
  }
  function aplicaDeclarada(d) { return /^s[ií]/i.test(String(d?.aplica || '').trim()); }

  function calcular(state, ctx, opts = {}) {
    const conHallazgos = opts.conHallazgos !== false;
    const { niveles, invalidos } = nivelesSistema(state.categorizacion);
    const cat = categoria(niveles);
    const cfg = opts.cfg || {};
    const riesgos = registroRiesgos(state, ctx, conHallazgos, cfg);
    const riesgosDeclarados = conHallazgos ? registroRiesgos(state, ctx, false, cfg) : riesgos;
    const codes = Object.keys(ctx.anexo).sort(codeSort);
    const arCode = state.proyecto?.codigoAR || 'AR';
    const filas = codes.map((code) => {
      const ax = ctx.anexo[code];
      const { nivel, regla } = nivelExigido(ax.dims, niveles, cat);
      const exig = ax[LEVEL_KEY[nivel]];
      const pe = parseExigencia(exig);
      const decl = (state.soa || {})[code] || null;
      const rs = riesgos.filter((r) => r.ens.includes(code));
      const salvCodes = Object.entries(ctx.mapping.salvaguarda_ens).filter(([, v]) => v.includes(code)).map(([k]) => k);
      const salvs = (state.salvaguardas || []).filter((s) => salvCodes.includes(s.codigo));
      let minMad = null;
      for (const s of salvs) if (!minMad || s.madurez < minMad) minMad = s.madurez;
      const hall = (state.hallazgos || []).filter((h) => h.estado === 'abierto' && (ctx.mapping.hallazgo_categorias[h.categoria]?.ens || []).includes(code));
      let resMax = null; for (const r of rs) resMax = maxNivel(resMax, r.resMax);
      const dimTxt = ax.dims === 'Categoría' ? `medida exigida para la categoría ${cat} del sistema (afecta a todas las dimensiones)` : `medida vinculada a la(s) dimensión(es) ${ax.dims}; nivel exigido ${nivel} (${regla})`;
      const justAuto = pe.aplica
        ? `APLICA: ${dimTxt}. Exigencia Anexo II: '${exig}'. ` + (rs.length
          ? `Trata ${rs.length} riesgo(s) del ${arCode}: ${rs.map((r) => r.amenaza.id).join(', ')} (residual máx. ${resMax || '—'}).`
          : `Sin riesgo específico vinculado en el ${arCode}: exigencia normativa de base.`)
        : `NO APLICA: la medida no se exige en nivel ${nivel} para la(s) dimensión(es) ${ax.dims} (${regla}); exigencia Anexo II: 'n.a.'.`;
      return { codigo: code, nombre: ax.nombre, familia: familiaDe(code), marco: marcoDe(code), dims: ax.dims, nivel, regla, exigencia: exig,
        aplicaNorma: pe.aplica, refuerzos: pe, decl, riesgos: rs, resMax, salvs, minMad, hallazgos: hall, justAuto };
    });
    const aplicables = filas.filter((f) => f.aplicaNorma);
    const pcts = aplicables.map((f) => (f.decl ? pctDe(f.decl) : 0));
    const kpi = {
      medidas: filas.length,
      aplicables: aplicables.length,
      noAplicables: filas.length - aplicables.length,
      implantadas: aplicables.filter((f) => f.decl && /^implantada$/i.test(f.decl.estado || '') && pctDe(f.decl) >= 1).length,
      parciales: aplicables.filter((f) => f.decl && ESTADOS_PARCIALES.test(f.decl.estado || '')).length,
      compensadas: aplicables.filter((f) => /compensada/i.test(f.decl?.aplica || '')).length,
      grado: pcts.length ? pcts.reduce((a, b) => a + b, 0) / pcts.length : 0,
      riesgos: riesgos.length,
      fueraApetito: riesgos.filter((r) => r.fueraApetito).length,
      fueraApetitoDeclarado: riesgosDeclarados.filter((r) => r.fueraApetito).length,
      hallazgosAbiertos: (state.hallazgos || []).filter((h) => h.estado === 'abierto').length,
      pendientes: aplicables.filter((f) => !f.decl || esPendiente(f.decl)).length
    };
    const porFamilia = {};
    for (const f of aplicables) {
      const k = f.familia; porFamilia[k] = porFamilia[k] || { familia: k, n: 0, suma: 0, prefijo: f.codigo.replace(/\.\d+$/, '') };
      porFamilia[k].n++; porFamilia[k].suma += f.decl ? pctDe(f.decl) : 0;
    }
    return { niveles, invalidos, categoria: cat, riesgos, riesgosDeclarados, filas, kpi,
      familias: Object.values(porFamilia).map((x) => ({ ...x, grado: x.suma / x.n })) };
  }

  /* ---------- 4. Auditor ---------- */
  function auditar(state, ctx, calc, opts = {}) {
    const out = [];
    const off = new Set(opts.reglasOff || []);
    const umbralMad = (MADUREZ[opts.madurezMin || 'L2'] || MADUREZ.L2).eficacia;
    const add = (id, sev, ambito, titulo, detalle, recomendacion, ref) => { if (!off.has(id)) out.push({ id, sev, ambito, titulo, detalle, recomendacion, ref }); };
    const pendientes = [];
    const hoy = opts.hoy ? new Date(opts.hoy) : new Date();

    // Categorización
    for (const inv of calc.invalidos) {
      const otrosAlto = (state.categorizacion || []).filter((a) => a.id !== inv.activo && ensLevel(a[inv.dim]) === 'ALTO').map((a) => a.id);
      const impactoTxt = otrosAlto.length
        ? `No altera el resultado: ${DIM_LABEL[inv.dim]} ya es ALTO por ${otrosAlto.join(', ')}.`
        : `Puede alterar el resultado: si el valor correcto fuera ALTO, ${DIM_LABEL[inv.dim]} pasaría de ${calc.niveles[inv.dim] || 'sin valorar'} a ALTO.`;
      add('CAT-01', SEV.MENOR, `${inv.activo} · ${inv.dim}`, 'Valor de categorización no válido',
        `El activo esencial ${inv.activo} (${inv.nombre}) tiene '${inv.valor}' en la dimensión ${DIM_LABEL[inv.dim]}. Solo se admiten BAJO, MEDIO o ALTO; la celda se ignora en el cálculo. ${impactoTxt}`,
        'Corregir la valoración con criterio del Responsable de la Información (CCN-STIC 803) y volver a aprobar la categorización en el CSI.', 'RD 311/2022, Anexo I');
    }
    for (const a of state.categorizacion || []) {
      if (DIMS.every((d) => isBlank(a[d]))) add('CAT-02', SEV.MAYOR, a.id, 'Activo esencial sin valorar', `${a.id} no tiene valoración en ninguna dimensión.`, 'Valorar las cinco dimensiones del activo esencial.', 'RD 311/2022, art. 40');
    }
    // SoA
    const mcs = state.compensatorias || [];
    const codigosEn = (txt) => String(txt || '').match(/\b(?:org\.\d+|(?:op|mp)\.[a-z]+\.\d+)\b/g) || [];
    const mcRefiere = (mc, code) => codigosEn(mc.medida).includes(code);
    for (const f of calc.filas) {
      const d = f.decl;
      if (!d) { add('SOA-03', SEV.MAYOR, f.codigo, 'Medida del Anexo II ausente en la SoA', `${f.codigo} ${f.nombre} no figura en la Declaración de Aplicabilidad.`, 'La SoA debe pronunciarse sobre las 73 medidas del Anexo II.', 'RD 311/2022, art. 28.2'); continue; }
      if (esPendiente(d)) { pendientes.push(f.codigo); continue; }
      const declAplica = aplicaDeclarada(d);
      if (f.aplicaNorma && !declAplica) add('SOA-01', SEV.MAYOR, f.codigo, 'Exclusión indebida',
        `${f.codigo} se declara NO aplicable, pero con nivel ${f.nivel} (${f.regla}) el Anexo II exige '${f.exigencia}'.`, 'Declarar la medida como aplicable e implantarla, o justificar una medida compensatoria (art. 28.3).', 'RD 311/2022, art. 28');
      if (!f.aplicaNorma && declAplica) add('SOA-02', SEV.OBS, f.codigo, 'Medida declarada aplicable sin exigencia normativa',
        `${f.codigo} no se exige en nivel ${f.nivel} ('n.a.'), pero la SoA la declara aplicable.`, 'Es admisible si responde al análisis de riesgos; dejarlo justificado.', 'RD 311/2022, art. 28.1');
      if (!f.aplicaNorma && !declAplica && isBlank(d.justificacion)) add('SOA-08', SEV.MENOR, f.codigo, 'Exclusión sin justificar', `${f.codigo} se excluye sin justificación documentada.`, 'Documentar el motivo de la exclusión.', 'RD 311/2022, art. 28.2');
      if (declAplica) {
        if (isBlank(d.evidencias)) add('SOA-04', SEV.MENOR, f.codigo, 'Medida aplicable sin evidencias', `${f.codigo} no referencia evidencias documentales.`, 'Enlazar procedimientos, registros o capturas que el auditor pueda verificar (CCN-STIC 808).', 'CCN-STIC 802/808');
        if (isBlank(d.responsable)) add('SOA-05', SEV.MENOR, f.codigo, 'Medida aplicable sin responsable', `${f.codigo} no tiene responsable asignado.`, 'Asignar un rol del art. 11 o del esquema de roles de la organización.', 'RD 311/2022, art. 11–13');
        const pct = pctDe(d);
        if (ESTADOS_PARCIALES.test(d.estado || '')) {
          const txt = [d.observaciones, d.evidencias, d.refuerzos_elegidos, d.mc_ref].join(' ');
          if (!/PTR|MC-\d+/i.test(txt)) add('SOA-06', SEV.MENOR, f.codigo, 'Implantación parcial sin plan de tratamiento', `${f.codigo} figura como '${d.estado}' sin acción PTR ni medida compensatoria referenciada.`, 'Registrar la acción pendiente en el Plan de Tratamiento de Riesgos con responsable y plazo.', 'RD 311/2022, art. 14');
          if (pct >= 1) add('SOA-07', SEV.MENOR, f.codigo, 'Porcentaje incoherente con el estado', `${f.codigo} está '${d.estado}' pero declara ${Math.round(pct * 100)} %.`, 'Alinear estado y porcentaje de implantación.', 'Buenas prácticas SoA');
        } else if (/^implantada$/i.test(d.estado || '') && pct < 1) add('SOA-07', SEV.MENOR, f.codigo, 'Porcentaje incoherente con el estado', `${f.codigo} está 'Implantada' pero declara ${Math.round(pct * 100)} %.`, 'Alinear estado y porcentaje de implantación.', 'Buenas prácticas SoA');
        if (/compensada/i.test(d.aplica || '') && !mcs.some((mc) => mcRefiere(mc, f.codigo))) add('MC-01', SEV.MAYOR, f.codigo, 'Medida compensada sin registro de medida compensatoria', `${f.codigo} se declara compensada pero ninguna MC del registro la sustituye.`, 'Registrar la medida compensatoria: ámbito, restricción, riesgo, medida, validación, mantenimiento y aprobación.', 'RD 311/2022, art. 28.3');
        // Refuerzos
        if (f.aplicaNorma) {
          const tabla = (state.refuerzos || []).filter((r) => r.codigo === f.codigo);
          for (const rn of f.refuerzos.obligatorios) {
            const row = tabla.find((r) => r.refuerzo === rn);
            if (!row || !/^s[ií]/i.test(String(row.exigible || ''))) add('REF-01', SEV.MAYOR, `${f.codigo} ${rn}`, 'Refuerzo exigido no contemplado',
              `Con nivel ${f.nivel}, ${f.codigo} exige ${rn}, pero la tabla de refuerzos ${row ? `lo marca como '${row.exigible}'` : 'no lo recoge'}.`, 'Incorporar el refuerzo a la implantación o justificar una medida compensatoria.', 'RD 311/2022, Anexo II');
          }
          for (const g of f.refuerzos.grupos) {
            const elegido = tabla.some((r) => g.includes(r.refuerzo) && /alternativa|s[ií]/i.test(String(r.exigible || '')) && !isBlank(r.implementacion));
            if (!elegido) add('REF-02', SEV.MENOR, `${f.codigo} [${g.join(' o ')}]`, 'Grupo de refuerzos alternativos sin opción elegida', `${f.codigo} exige al menos uno de ${g.join(', ')} y no consta cuál se ha implantado.`, 'Indicar la alternativa elegida y su implementación.', 'RD 311/2022, Anexo II');
          }
          const requeridos = new Set([...f.refuerzos.obligatorios, ...f.refuerzos.grupos.flat()]);
          for (const r of tabla) if (/^s[ií]/i.test(String(r.exigible || '')) && !requeridos.has(r.refuerzo)) add('REF-03', SEV.OBS, `${f.codigo} ${r.refuerzo}`, 'Refuerzo marcado exigible que ya no lo es',
            `Con nivel ${f.nivel}, ${f.codigo} no exige ${r.refuerzo}; la tabla lo sigue marcando como exigible.`, 'Actualizar la tabla de refuerzos tras la (re)categorización; mantenerlo es sobrecumplimiento admisible.', 'RD 311/2022, Anexo II');
        }
        // Coherencia con el análisis de riesgos
        if (/^implantada$/i.test(d.estado || '') && pct >= 1) {
          const debiles = f.salvs.filter((s) => (MADUREZ[s.madurez]?.eficacia ?? 0) <= umbralMad);
          if (debiles.length) add('AR-01', SEV.MAYOR, f.codigo, 'La SoA declara implantada una medida que el análisis de riesgos valora inmadura',
            `${f.codigo} figura 'Implantada' al 100 %, pero en el ${state.proyecto?.codigoAR || 'AR'} ${debiles.map((s) => `${s.codigo} (${s.nombre}) está en ${s.madurez} · ${MADUREZ[s.madurez].label}`).join('; ')}.`,
            'Revisar una de las dos fuentes: o se rebaja el estado en la SoA con acción PTR, o se actualiza la madurez de la salvaguarda con evidencias.', 'RD 311/2022, art. 28.1.c');
          for (const h of f.hallazgos) {
            const c = Number(h.cvss) || 0;
            if (c >= 4) add(c >= 7 ? 'PT-01' : 'PT-02', c >= 7 ? SEV.MAYOR : SEV.MENOR, f.codigo, 'Evidencia técnica contradice la SoA',
              `${f.codigo} figura 'Implantada' al 100 %, pero el hallazgo ${h.id} (${sevCvss(c)}, CVSS ${c}) sigue abierto: ${h.titulo}.`,
              'Corregir la vulnerabilidad y aportar evidencia del retest, o reflejar la implantación parcial en la SoA.', 'RD 311/2022, art. 8 y 31');
          }
        }
      }
    }
    // Registro de medidas compensatorias
    const idsRiesgo = new Set((state.amenazas || []).map((a) => a.id));
    for (const mc of mcs) {
      const faltan = ['validacion', 'mantenimiento', 'aprobacion', 'riesgo'].filter((k) => isBlank(mc[k]));
      if (faltan.length) add('MC-02', SEV.MENOR, mc.id, 'Medida compensatoria incompleta', `${mc.id} no documenta: ${faltan.join(', ')}.`, 'Completar la ficha de la medida compensatoria.', 'RD 311/2022, art. 28.3');
      const codesMc = codigosEn(mc.medida).filter((c) => ctx.anexo[c]);
      for (const c of codesMc) {
        const d = (state.soa || {})[c];
        if (d && !/compensada/i.test(d.aplica || '') && !/compensada/i.test(d.estado || '')) add('MC-03', SEV.OBS, mc.id, 'Medida compensatoria no reflejada en la SoA', `${mc.id} sustituye a ${c}, pero la SoA no la marca como compensada.`, 'Marcar la medida como SÍ (compensada) y referenciar la MC.', 'RD 311/2022, art. 28.3');
      }
      const rids = String(mc.riesgo || '').match(/\bR-\d{3}\b/g) || [];
      for (const rid of rids) if (!idsRiesgo.has(rid)) add('MC-04', SEV.MENOR, mc.id, 'Riesgo citado en la MC no existe en el análisis de riesgos', `${mc.id} cita ${rid}, que no figura en el ${state.proyecto?.codigoAR || 'AR'}.`, 'Dar de alta el riesgo en el AR o corregir la referencia.', 'RD 311/2022, art. 28.3');
    }
    // Análisis de riesgos
    for (const r of calc.riesgos) {
      if (!r.fueraApetito) continue;
      const t = r.tratamiento;
      if (!t) add('AR-02', SEV.MENOR, r.amenaza.id, 'Riesgo fuera de apetito sin tratamiento', `${r.amenaza.id} ${r.amenaza.nombre} sobre ${r.activo.nombre}: residual ${r.resMax}, apetito ${state.apetito}${r.amenaza.hallazgos?.length ? ` (riesgo nuevo aflorado por ${r.amenaza.hallazgos.join(', ')})` : ''}.`, 'Decidir tratamiento (mitigar, transferir, evitar o aceptar formalmente).', 'RD 311/2022, art. 14');
      else if (t.opcion === 'aceptar') add('AR-02', SEV.MENOR, r.amenaza.id, 'Riesgo por encima del apetito aceptado', `${r.amenaza.id} ${r.amenaza.nombre} se acepta con residual ${r.resMax} (apetito ${state.apetito})${r.amenaza.hallazgos?.length ? `; el hallazgo ${r.amenaza.hallazgos.join(', ')} lo ha elevado desde la aceptación original` : ''}.`, 'Requiere aprobación formal del Responsable de la Información y constancia en acta del CSI.', 'RD 311/2022, art. 14');
      else if (isBlank(t.plazo) || isBlank(t.responsable)) add('AR-03', SEV.OBS, r.amenaza.id, 'Tratamiento sin plazo o responsable', `${r.amenaza.id}: '${t.opcion}' sin ${isBlank(t.plazo) ? 'plazo' : 'responsable'}.`, 'Completar el Plan de Tratamiento de Riesgos.', 'RD 311/2022, art. 14');
    }
    if (pendientes.length) add('SOA-10', SEV.OBS, `${pendientes.length} medidas`, 'Medidas pendientes de declarar',
      `La SoA aún no se pronuncia sobre: ${pendientes.join(', ')}.`, 'Completar aplicabilidad, estado, evidencias y responsable de cada medida.', 'RD 311/2022, art. 28.2');
    const sinRiesgo = calc.filas.filter((f) => f.aplicaNorma && !f.riesgos.length && !pendientes.includes(f.codigo)).map((f) => f.codigo);
    if (sinRiesgo.length) add('AR-04', SEV.OBS, `${sinRiesgo.length} medidas`, 'Medidas aplicables sin riesgo vinculado en el AR',
      `No hay ningún riesgo del análisis que se trate con: ${sinRiesgo.join(', ')}.`, 'Ampliar el inventario de activos y amenazas del AR o documentar que son exigencias de base.', 'RD 311/2022, art. 28.1.c');
    for (const a of state.activos || []) if (!a.soporta || !a.soporta.length) add('AR-05', SEV.OBS, a.id, 'Activo del AR sin vínculo a activos esenciales', `${a.id} ${a.nombre} no indica qué servicios o información esencial soporta.`, 'Relacionar el activo con los activos esenciales valorados en la categorización.', 'MAGERIT v3, Libro I §3.1');
    // Documento
    const p = state.portada || {};
    if (isBlank(p['Firma (art. 28.2 RD 311/2022)'])) add('DOC-01', SEV.MENOR, 'Portada', 'SoA sin firma', 'La Declaración de Aplicabilidad no consta firmada por la Responsable de Seguridad.', 'Firmar electrónicamente la SoA.', 'RD 311/2022, art. 28.2');
    const fe = String(p['Fecha de emisión'] || '').match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (fe) { const dte = new Date(+fe[3], +fe[2] - 1, +fe[1]); if ((hoy - dte) / 864e5 > 365) add('DOC-02', SEV.MENOR, 'Portada', 'SoA sin revisar en los últimos 12 meses', `Fecha de emisión ${fe[0]}.`, 'Revisar la SoA al menos anualmente.', 'RD 311/2022, art. 28.2'); }
    return out.sort((a, b) => SEV_ORDER[a.sev] - SEV_ORDER[b.sev] || a.id.localeCompare(b.id) || String(a.ambito).localeCompare(String(b.ambito), 'es', { numeric: true }));
  }

  /* ---------- 5. Plan de acción (derivado + estado del usuario) ---------- */
  function planAccion(state, calc, audit) {
    const acc = state.acciones || {};
    const pri = { 'NC mayor': 'Alta', 'NC menor': 'Media' };
    const out = [];
    const push = (a) => { const u = acc[a.key] || {}; out.push({ ...a, estado: u.estado || 'Pendiente', responsable: u.responsable ?? a.responsable ?? '', fecha: u.fecha ?? a.fecha ?? '', nota: u.nota || '' }); };
    for (const h of state.hallazgos || []) {
      if (h.estado !== 'abierto' || (Number(h.cvss) || 0) < 4) continue;
      push({ key: 'H|' + h.id, origen: 'Evidencia técnica', ref: h.id, prioridad: Number(h.cvss) >= 7 ? 'Alta' : 'Media', titulo: `Corregir ${h.id}: ${h.titulo}`, detalle: 'Corregir la vulnerabilidad y aportar evidencia del retest para cerrar las no conformidades asociadas.', responsable: 'Responsable del Sistema' });
    }
    for (const r of calc.riesgos) {
      if (!r.fueraApetito) continue;
      const t = r.tratamiento || {};
      push({ key: 'R|' + r.amenaza.id, origen: 'Análisis de riesgos', ref: r.amenaza.id, prioridad: NN[r.resMax] >= 5 ? 'Alta' : 'Media',
        titulo: `${t.opcion ? t.opcion[0].toUpperCase() + t.opcion.slice(1) : 'Tratar'} ${r.amenaza.id}: ${r.amenaza.nombre} (${r.activo.nombre || r.amenaza.activoId})`,
        detalle: `Residual ${r.resMax} frente a un apetito ${state.apetito}.`, responsable: t.responsable || '', fecha: t.plazo || '' });
    }
    for (const f of audit) {
      if (!pri[f.sev] || /^PT-|^AR-02$/.test(f.id)) continue;
      push({ key: `NC|${f.id}|${f.ambito}`, origen: 'Auditoría', ref: `${f.id} · ${f.ambito}`, prioridad: pri[f.sev], titulo: f.titulo + ' · ' + f.ambito, detalle: f.recomendacion, responsable: '' });
    }
    const vivas = new Set(out.map((a) => a.key));
    for (const [key, u] of Object.entries(acc)) if (!vivas.has(key) && u.titulo) out.push({ key, origen: u.origen || '', ref: u.ref || '', prioridad: '—', titulo: u.titulo, detalle: 'El origen ya no aparece: la herramienta lo da por verificado.', estado: 'Verificada', responsable: u.responsable || '', fecha: u.fecha || '', nota: u.nota || '', verificada: true });
    const ord = { Alta: 0, Media: 1, '—': 2 };
    return out.sort((a, b) => (a.estado === 'Hecha' || a.verificada) - (b.estado === 'Hecha' || b.verificada) || ord[a.prioridad] - ord[b.prioridad] || String(a.fecha || '9').localeCompare(String(b.fecha || '9')));
  }
  function instantanea(calc, audit) {
    return { grado: calc.kpi.grado, ncMayor: audit.filter((f) => f.sev === SEV.MAYOR).length, ncMenor: audit.filter((f) => f.sev === SEV.MENOR).length, fuera: calc.kpi.fueraApetito };
  }

  return { CVSS_DEF, esPendiente, planAccion, instantanea, DIMS, DIM_LABEL, ENS_LEVELS, NIVELES, NN, NIVEL_LABEL, MATRIZ, MADUREZ, SEV, FAMILIAS,
    isBlank, ensLevel, codeSort, familiaDe, marcoDe, nivelesSistema, categoria, nivelExigido, parseExigencia,
    impacto, nivelDesdeImpacto, riesgoInherente, riesgoResidual, riesgoMax, eficaciaCombinada, probDesdeCvss, sevCvss,
    amenazasEfectivas, registroRiesgos, tratamientoSugerido, pctDe, aplicaDeclarada, calcular, auditar };
});
