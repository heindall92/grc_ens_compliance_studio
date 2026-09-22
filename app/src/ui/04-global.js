/* ---------- Vistas globales: inicio, nuevo proyecto, perfil, ajustes, ayuda ---------- */
const ROLES = ['Responsable de Seguridad (CISO)', 'Responsable del Sistema', 'Responsable de la Información', 'Auditor/a de seguridad', 'Consultor/a GRC', 'Delegado/a de Protección de Datos', 'Estudiante', 'Otro'];
const SECTORES = ['Administración General del Estado', 'Administración autonómica', 'Administración local', 'Universidad', 'Sanidad', 'Proveedor TIC del sector público', 'Proveedor SaaS / nube', 'Otro'];
const COLORS = ['teal', 'blue', 'green', 'amber', 'rose', 'slate'];

function vInicio() {
  const own = ws.projects.filter((p) => p.kind === 'own');
  const demos = ws.projects.filter((p) => p.kind === 'demo');
  const hola = ws.profile.nombre ? `Hola, ${esc(ws.profile.nombre.split(' ')[0])}` : 'Bienvenido a ENS Compliance Studio';
  const projRow = (p) => {
    const del = ui.confirm === 'del:' + p.id;
    return `<div class="proj-row">
      <span class="proj-ic lg ${p.kind === 'demo' ? 'demo' : ''}">${icon(p.kind === 'demo' ? caseIcon(p.caseId) : 'building', 18)}</span>
      <div class="pr-main"><b>${esc(p.nombre)}</b><small>${esc(p.organizacion || '')}${p.kind === 'demo' ? ' · caso de ejemplo' : ''}</small></div>
      <div class="pr-meta">${catPill(p.categoria)}${p.grado !== undefined && p.grado !== null ? `<span class="muted small num">${pct(p.grado, 0)} implantado</span>` : ''}${p.ncMayor ? `<span class="badge crit">${plural(p.ncMayor, 'NC mayor', 'NC mayores')}</span>` : ''}</div>
      <span class="muted small pr-date">${icon('clock', 14)} ${fmtDate(p.updated)}</span>
      <div class="row">${del ? `<span class="small">¿Eliminar?</span><button type="button" class="btn sm danger-solid" data-act="del-project" data-id="${esc(p.id)}">Eliminar</button><button type="button" class="btn sm" data-act="confirm-no">Cancelar</button>`
        : `<button type="button" class="btn sm" data-act="open-project" data-id="${esc(p.id)}">Abrir</button><button type="button" class="icon-btn sm" data-act="ask" data-what="del:${esc(p.id)}" aria-label="Eliminar ${esc(p.nombre)}">${icon('trash', 16)}</button>`}</div></div>`;
  };
  return `
  <section class="hero">
    <div><div class="eyebrow">RD 311/2022 · MAGERIT v3 · ISO/IEC 27001:2022</div>
      <h1>${hola}</h1>
      <p class="lead">Categoriza tu sistema, analiza sus riesgos, declara la aplicabilidad de las 73 medidas del Esquema Nacional de Seguridad y comprueba que todo cuadra, incluida la evidencia de tus pruebas de intrusión.</p></div>
  </section>
  ${!ws.onboarded && !ws.profileDone ? `<div class="card onboard">
      <div class="ob-text"><h3>Antes de empezar, ¿quién eres?</h3><p class="muted small">Tu nombre y tu rol aparecen como autor en los informes y en la SoA exportada. Todo se guarda solo en este navegador.</p></div>
      <div class="ob-form"><label class="fld">Nombre<input type="text" id="ob-nombre" data-ws="profile.nombre" value="${esc(ws.profile.nombre)}" placeholder="Nombre y apellidos"></label>
      <label class="fld">Rol<select id="ob-rol" data-ws="profile.rol">${opt('', 'Elige tu rol', ws.profile.rol)}${ROLES.map((r) => opt(r, r, ws.profile.rol)).join('')}</select></label>
      <div class="row span2"><button type="button" class="btn primary sm" data-act="ob-save">${icon('check', 15)}Guardar</button><button type="button" class="btn ghost sm" data-act="ob-skip">Ahora no</button></div></div></div>` : ''}
  <div class="start-grid">
    <button type="button" class="start-card primary" data-act="nav" data-view="nuevo"><span class="sc-ic">${icon('plus', 22)}</span><b>Empezar con mis datos</b><span>Asistente en tres pasos: organización, activos esenciales y punto de partida. Sale con la categoría y las medidas exigidas calculadas.</span><em>Crear proyecto ${icon('arrowRight', 16)}</em></button>
    <button type="button" class="start-card" data-act="import-xlsx"><span class="sc-ic">${icon('sheet', 22)}</span><b>Importar mi SoA</b><span>Trae tu Declaración de Aplicabilidad en Excel (plantilla de 73 medidas) y audítala al momento.</span><em>Elegir fichero .xlsx ${icon('arrowRight', 16)}</em></button>
    <a class="start-card" href="#casos"><span class="sc-ic">${icon('book', 22)}</span><b>Explorar un caso</b><span>Cinco organizaciones ficticias, de categoría básica a alta, cada una con problemas distintos que descubrir.</span><em>Ver casos ${icon('arrowRight', 16)}</em></a>
  </div>
  ${own.length || demos.length ? `<section class="block"><div class="block-head"><h2>Tus proyectos</h2><span class="muted small">${plural(own.length, 'proyecto propio', 'proyectos propios')} · ${plural(demos.length, 'caso abierto', 'casos abiertos')}</span></div>
    <div class="card flush">${[...own, ...demos].map(projRow).join('')}</div></section>` : ''}
  ${ws.settings.mostrarCasos ? `<section class="block" id="casos"><div class="block-head"><h2>Casos de ejemplo</h2><span class="muted small">Datos ficticios con fines formativos</span></div>
    <div class="case-grid">${D.casos.map((c) => `<article class="case-card">
      <div class="cc-top"><span class="case-ic c-${esc(c.id)}">${icon(caseIcon(c.id), 22)}</span>${catPill(c.meta.categoria)}</div>
      <h3>${esc(c.titulo)}</h3><span class="muted small">${esc(c.sector)}</span>
      <p>${esc(c.resumen)}</p>
      <ul class="retos">${c.retos.map((r) => `<li>${icon('flag', 14)}${esc(r)}</li>`).join('')}</ul>
      <div class="cc-stats"><span><b class="num">${c.meta.aplicables}</b> medidas</span><span><b class="num">${c.meta.riesgos}</b> riesgos</span><span><b class="num crit-t">${c.meta.ncMayor}</b> NC mayores</span></div>
      <button type="button" class="btn ${ws.activeId === 'demo-' + c.id ? '' : 'primary'} w-full" data-act="open-case" data-case="${esc(c.id)}">${ws.projects.some((p) => p.id === 'demo-' + c.id) ? 'Continuar' : 'Abrir caso'}${icon('arrowRight', 16)}</button>
    </article>`).join('')}</div></section>` : ''}`;
}

/* --- Asistente de nuevo proyecto --- */
function wzInit() {
  ui.wizard = { step: 1, organizacion: '', sistema: '', sector: '', codigoSoA: 'SOA-' + new Date().getFullYear(), codigoAR: 'AR-' + new Date().getFullYear(),
    responsable: ws.profile.nombre ? `${ws.profile.nombre}${ws.profile.rol ? ' – ' + ws.profile.rol : ''}` : '', plantilla: 'pendiente', apetito: ws.settings.apetito,
    activos: [{ tipo: 'Servicio', id: 'S-01', nombre: '', responsable: '', D: 'BAJO', I: 'BAJO', C: 'BAJO', A: 'BAJO', T: 'BAJO' }, { tipo: 'Información', id: 'I-01', nombre: '', responsable: '', D: 'BAJO', I: 'BAJO', C: 'BAJO', A: 'BAJO', T: 'BAJO' }], error: '' };
}
const CRITERIOS = {
  BAJO: 'Perjuicio limitado: reducción apreciable de la capacidad, daño menor a activos, incumplimiento formal leve.',
  MEDIO: 'Perjuicio grave: reducción significativa de la capacidad, daño significativo, incumplimiento material de la ley.',
  ALTO: 'Perjuicio muy grave: anulación de la capacidad, daño muy grave o irreparable, incumplimiento grave de la ley.'
};
function vNuevo() {
  if (!ui.wizard) wzInit();
  const w = ui.wizard;
  const { niveles } = E.nivelesSistema(w.activos); const cat = E.categoria(niveles);
  const steps = ['Organización', 'Activos esenciales', 'Punto de partida'];
  const stepper = `<ol class="stepper">${steps.map((s, i) => `<li class="${w.step === i + 1 ? 'on' : w.step > i + 1 ? 'done' : ''}"><span>${w.step > i + 1 ? icon('check', 14) : i + 1}</span>${s}</li>`).join('')}</ol>`;
  let body = '';
  if (w.step === 1) {
    body = `<div class="form-grid">
      <label class="fld span2">Organización *<input type="text" id="wz-org" data-wz="organizacion" value="${esc(w.organizacion)}" placeholder="p. ej. Ayuntamiento de …, Consejería de …, Mi Empresa, S.L."></label>
      <label class="fld span2">Sistema de información *<input type="text" id="wz-sis" data-wz="sistema" value="${esc(w.sistema)}" placeholder="p. ej. Sede electrónica y gestión de expedientes"></label>
      <label class="fld">Sector<select id="wz-sector" data-wz="sector">${opt('', 'Selecciona', w.sector)}${SECTORES.map((s) => opt(s, s, w.sector)).join('')}</select></label>
      <label class="fld">Elaborada por<input type="text" id="wz-resp" data-wz="responsable" value="${esc(w.responsable)}" placeholder="Nombre – Responsable de Seguridad"></label>
      <label class="fld">Código de la SoA<input type="text" id="wz-soa" data-wz="codigoSoA" value="${esc(w.codigoSoA)}"></label>
      <label class="fld">Código del análisis de riesgos<input type="text" id="wz-ar" data-wz="codigoAR" value="${esc(w.codigoAR)}"></label></div>`;
  } else if (w.step === 2) {
    body = `<p class="muted">Los activos esenciales son la información y los servicios que el sistema maneja. Valora el perjuicio que causaría un incidente en cada dimensión (Anexo I).</p>
      <div class="table-wrap"><table class="tbl"><thead><tr><th>Tipo</th><th>ID</th><th>Activo esencial</th><th>Responsable</th>${E.DIMS.map((d) => `<th class="c"><span class="dim ${d}" title="${E.DIM_LABEL[d]}">${d}</span></th>`).join('')}<th></th></tr></thead><tbody>
      ${w.activos.map((a, i) => `<tr><td><select id="wz-a${i}-t" data-wz="activos.${i}.tipo">${['Servicio', 'Información'].map((t) => opt(t, t, a.tipo)).join('')}</select></td>
        <td><input type="text" id="wz-a${i}-id" data-wz="activos.${i}.id" value="${esc(a.id)}" class="w-sm mono"></td>
        <td><input type="text" id="wz-a${i}-n" data-wz="activos.${i}.nombre" value="${esc(a.nombre)}" placeholder="${a.tipo === 'Servicio' ? 'p. ej. Registro electrónico' : 'p. ej. Datos de expedientes'}" class="w-full"></td>
        <td><input type="text" id="wz-a${i}-r" data-wz="activos.${i}.responsable" value="${esc(a.responsable)}" class="w-full"></td>
        ${E.DIMS.map((d) => `<td class="c"><select id="wz-a${i}-${d}" class="lvl l-${a[d]}" data-wz="activos.${i}.${d}" aria-label="${E.DIM_LABEL[d]}">${E.ENS_LEVELS.map((x) => opt(x, x[0] + x.slice(1).toLowerCase(), a[d])).join('')}</select></td>`).join('')}
        <td><button type="button" class="icon-btn sm" data-act="wz-del" data-i="${i}" aria-label="Quitar"${w.activos.length < 2 ? ' disabled' : ''}>${icon('x', 16)}</button></td></tr>`).join('')}
      </tbody></table></div>
      <div class="row spread"><button type="button" class="btn sm" data-act="wz-add">${icon('plus', 16)}Añadir activo esencial</button>
        <div class="row">${E.DIMS.map((d) => `<span class="lvl-sum"><span class="dim ${d}">${d}</span>${niveles[d] || '—'}</span>`).join('')}${catPill(cat)}</div></div>
      <div class="criteria">${E.ENS_LEVELS.map((l) => `<div><span class="lvl-tag l-${l}">${l[0] + l.slice(1).toLowerCase()}</span><p>${CRITERIOS[l]}</p></div>`).join('')}</div>`;
  } else {
    const req = calc0Preview(w);
    body = `<div class="grid g2">
      <div class="stack">
        <label class="choice${w.plantilla === 'pendiente' ? ' on' : ''}"><input type="radio" name="wz-pl" data-wz="plantilla" value="pendiente"${w.plantilla === 'pendiente' ? ' checked' : ''}><span><b>Todas las medidas pendientes</b><small>Declararás una a una la aplicabilidad, el estado y las evidencias. Lo más riguroso.</small></span></label>
        <label class="choice${w.plantilla === 'sugerida' ? ' on' : ''}"><input type="radio" name="wz-pl" data-wz="plantilla" value="sugerida"${w.plantilla === 'sugerida' ? ' checked' : ''}><span><b>Aplicabilidad sugerida</b><small>La herramienta marca como aplicables las medidas que exige tu categoría; tú completas estado y evidencias.</small></span></label>
        <label class="fld">Apetito de riesgo<select id="wz-ap" data-wz="apetito">${E.NIVELES.map((n) => opt(n, `${n} · ${E.NIVEL_LABEL[n]}`, w.apetito)).join('')}</select></label>
      </div>
      <div class="card soft summary">
        <div class="row">${catPill(cat)}<b>${esc(w.organizacion || 'Tu organización')}</b></div>
        <dl class="kv"><dt>Sistema</dt><dd>${esc(w.sistema || '—')}</dd><dt>Activos esenciales</dt><dd>${w.activos.length}</dd>
          <dt>Nivel por dimensión</dt><dd>${E.DIMS.map((d) => `<span class="lvl-sum"><span class="dim ${d}">${d}</span>${niveles[d] || '—'}</span>`).join(' ')}</dd>
          <dt>Medidas exigidas</dt><dd class="num"><b>${req.aplicables}</b> de 73</dd><dt>Refuerzos</dt><dd class="num">${req.oblig} obligatorios · ${req.alt} alternativos</dd>
          <dt>Conformidad</dt><dd>${cat === 'BÁSICA' ? 'Autoevaluación y Declaración de Conformidad' : 'Auditoría formal y Certificación de Conformidad'}</dd></dl>
      </div></div>`;
  }
  return `${pageHead('Nuevo proyecto', 'Empieza con tus datos', 'Tres pasos y tendrás tu categoría, las medidas que te exige el Anexo II y un auditor revisando tu declaración desde el primer momento.')}
  <div class="card wizard">${stepper}${w.error ? `<div class="alert crit">${icon('alert', 16)}${esc(w.error)}</div>` : ''}${body}
    <div class="wz-foot">${w.step > 1 ? `<button type="button" class="btn" data-act="wz-back">${icon('arrowLeft', 16)}Atrás</button>` : `<button type="button" class="btn ghost" data-act="nav" data-view="inicio">Cancelar</button>`}
      ${w.step < 3 ? `<button type="button" class="btn primary" data-act="wz-next">Continuar${icon('arrowRight', 16)}</button>` : `<button type="button" class="btn primary" data-act="wz-create">${icon('check', 16)}Crear proyecto</button>`}</div></div>`;
}
function calc0Preview(w) {
  const { niveles } = E.nivelesSistema(w.activos); const cat = E.categoria(niveles); let aplicables = 0, oblig = 0, alt = 0;
  for (const code of Object.keys(D.anexo)) { const ax = D.anexo[code]; const { nivel } = E.nivelExigido(ax.dims, niveles, cat); const pe = E.parseExigencia(ax[nivel.toLowerCase()]); if (pe.aplica) { aplicables++; oblig += pe.obligatorios.length; alt += pe.grupos.flat().length; } }
  return { aplicables, oblig, alt };
}

/* --- Perfil --- */
function vPerfil() {
  const p = ws.profile;
  return `${pageHead('Cuenta', 'Tu perfil', 'Se usa como autor en los informes, en la portada de la SoA exportada y en el plan de acción. Se guarda solo en este navegador.')}
  <div class="grid g-side">
    <div class="card profile-card">${avatar(88)}<h2>${esc(p.nombre || 'Sin nombre')}</h2><p class="muted">${esc(p.rol || 'Sin rol')}</p>${p.organizacion ? `<p class="small">${esc(p.organizacion)}</p>` : ''}
      <div class="swatches" role="group" aria-label="Color del avatar">${COLORS.map((c) => `<button type="button" class="swatch c-${c}${p.color === c ? ' on' : ''}" data-act="set-color" data-c="${c}" aria-label="Color ${c}"></button>`).join('')}</div>
      <div class="pf-stats"><div><b class="num">${ws.projects.filter((x) => x.kind === 'own').length}</b><span>proyectos</span></div><div><b class="num">${ws.projects.filter((x) => x.kind === 'demo').length}</b><span>casos abiertos</span></div></div></div>
    <div class="card"><h3>Datos</h3><div class="form-grid" style="margin-top:14px">
      <label class="fld span2">Nombre y apellidos<input type="text" id="pf-n" data-ws="profile.nombre" value="${esc(p.nombre)}"></label>
      <label class="fld">Rol<select id="pf-r" data-ws="profile.rol">${opt('', 'Elige tu rol', p.rol)}${ROLES.map((r) => opt(r, r, p.rol)).join('')}</select></label>
      <label class="fld">Organización<input type="text" id="pf-o" data-ws="profile.organizacion" value="${esc(p.organizacion)}"></label>
      <label class="fld span2">Correo electrónico<input type="text" id="pf-e" data-ws="profile.email" value="${esc(p.email)}" placeholder="nombre@organizacion.es"></label>
    </div><p class="muted small" style="margin-top:14px">En los informes aparecerá: <b>${esc(firma())}</b></p></div>
  </div>`;
}
const firma = () => ws.profile.nombre ? `${ws.profile.nombre}${ws.profile.rol ? ' – ' + ws.profile.rol : ''}` : 'Sin autor (completa tu perfil)';

/* --- Ajustes --- */
function setRow(title, desc, control) { return `<div class="set-row"><div><b>${title}</b>${desc ? `<p>${desc}</p>` : ''}</div><div class="set-ctl">${control}</div></div>`; }
function vAjustes() {
  const s = ws.settings;
  const seg = (key, opts) => `<div class="seg" role="group">${opts.map(([v, l, ic]) => `<button type="button" data-act="set" data-k="${key}" data-v="${v}" aria-pressed="${s[key] === v}">${ic ? icon(ic, 15) : ''}${l}</button>`).join('')}</div>`;
  const sw = (key, id) => `<label class="switch"><input type="checkbox" id="${id}" data-ws="settings.${key}" data-type="bool"${s[key] ? ' checked' : ''}><span></span></label>`;
  const conf = ui.confirm === 'wipe';
  return `${pageHead('Preferencias', 'Ajustes', 'Personaliza la apariencia y los criterios de análisis y auditoría. Los cambios se aplican al instante a todos los proyectos.')}
  <div class="settings">
    <section class="card"><h3>Apariencia</h3>
      ${setRow('Tema', 'Sistema sigue la configuración de tu equipo.', seg('tema', [['sistema', 'Sistema', 'monitor'], ['claro', 'Claro', 'sun'], ['oscuro', 'Oscuro', 'moon']]))}
      ${setRow('Color de acento', '', `<div class="swatches">${['teal', 'blue', 'green', 'graphite'].map((c) => `<button type="button" class="swatch a-${c}${s.acento === c ? ' on' : ''}" data-act="set" data-k="acento" data-v="${c}" aria-label="Acento ${c}"></button>`).join('')}</div>`)}
      ${setRow('Densidad', 'Compacta muestra más filas en tablas y listas.', seg('densidad', [['comoda', 'Cómoda'], ['compacta', 'Compacta']]))}
    </section>
    <section class="card"><h3>Análisis de riesgos</h3>
      ${setRow('Apetito de riesgo por defecto', 'Se aplica a los proyectos nuevos.', `<select id="st-ap" data-ws="settings.apetito">${E.NIVELES.map((n) => opt(n, `${n} · ${E.NIVEL_LABEL[n]}`, s.apetito)).join('')}</select>`)}
      ${setRow('Del CVSS a la probabilidad', 'Umbrales a partir de los cuales un hallazgo abierto se considera de probabilidad Muy alta, Alta o Media.', `<div class="row cvss">${[['ma', 'MA'], ['a', 'A'], ['m', 'M']].map(([k, l]) => `<label class="mini">${l} ≥<input type="number" min="0" max="10" step="0.1" id="st-cv-${k}" data-ws="settings.cvss.${k}" data-type="num" value="${s.cvss[k]}"></label>`).join('')}</div>`)}
      ${setRow('Incluir la evidencia técnica por defecto', 'El registro de riesgos se abre con los hallazgos abiertos aplicados.', sw('conHallazgos', 'st-ch'))}
    </section>
    <section class="card"><h3>Auditoría</h3>
      ${setRow('Madurez mínima coherente con «Implantada»', 'Una medida declarada implantada al 100 % cuya salvaguarda esté en este nivel o por debajo genera la no conformidad AR-01.', `<select id="st-mad" data-ws="settings.madurezMin">${['L1', 'L2', 'L3'].map((l) => opt(l, `${l} · ${E.MADUREZ[l].label}`, s.madurezMin)).join('')}</select>`)}
      <details class="rules-box" data-keep="rulesOpen"${ui.rulesOpen ? ' open' : ''}><summary>Reglas activas <span class="muted small">${RULES.length - s.reglasOff.length} de ${RULES.length}</span></summary>
        <div class="rules-list">${RULES.map(([id, sev, t]) => `<label class="rule-row"><span class="switch"><input type="checkbox" data-rule="${id}"${s.reglasOff.includes(id) ? '' : ' checked'}><span></span></span><code>${id}</code>${sevBadge(sev)}<span>${esc(t)}</span></label>`).join('')}</div></details>
    </section>
    <section class="card"><h3>Asistente de análisis</h3>
      ${setRow('Sugerencias en el análisis y en la SoA', 'Propone amenazas del catálogo MAGERIT para un activo y borradores de justificación de aplicabilidad. Siempre requieren tu revisión. Solo disponible en la versión publicada en línea.', sw('asistente', 'st-as'))}
    </section>
    <section class="card"><h3>Casos de ejemplo</h3>
      ${setRow('Mostrar los casos en Inicio', 'Desactívalo cuando trabajes solo con tus proyectos.', sw('mostrarCasos', 'st-mc'))}
      ${setRow('Cerrar los casos abiertos', 'Elimina las copias de los casos de ejemplo; tus proyectos no se tocan.', `<button type="button" class="btn sm" data-act="close-demos">${icon('x', 15)}Cerrar ${plural(ws.projects.filter((p) => p.kind === 'demo').length, 'caso', 'casos')}</button>`)}
    </section>
    <section class="card"><h3>Datos y privacidad</h3>
      <p class="muted small" style="margin:4px 0 8px">Todo se guarda en este navegador. Nada se envía a ningún servidor. Haz copias de seguridad con regularidad.</p>
      ${setRow('Copia de seguridad', 'Perfil, ajustes y todos los proyectos en un único fichero JSON.', `<div class="row"><button type="button" class="btn sm" data-act="backup">${icon('download', 15)}Descargar</button><button type="button" class="btn sm" data-act="restore">${icon('upload', 15)}Restaurar</button></div>`)}
      ${setRow('Borrar todos los datos', 'Elimina perfil, ajustes y proyectos de este navegador.', conf ? `<div class="row"><button type="button" class="btn sm danger-solid" data-act="wipe">Sí, borrar todo</button><button type="button" class="btn sm" data-act="confirm-no">Cancelar</button></div>` : `<button type="button" class="btn sm danger" data-act="ask" data-what="wipe">${icon('trash', 15)}Borrar…</button>`)}
    </section>
  </div>`;
}

/* --- Ayuda --- */
const RULES = [
  ['CAT-01', 'NC menor', 'Valor de categorización no válido (solo BAJO/MEDIO/ALTO).'], ['CAT-02', 'NC mayor', 'Activo esencial sin valorar.'],
  ['SOA-01', 'NC mayor', 'Exclusión indebida: medida exigida declarada NO aplicable.'], ['SOA-02', 'Observación', 'Medida no exigida declarada aplicable.'],
  ['SOA-03', 'NC mayor', 'Medida del Anexo II ausente de la SoA.'], ['SOA-04', 'NC menor', 'Medida aplicable sin evidencias.'],
  ['SOA-05', 'NC menor', 'Medida aplicable sin responsable.'], ['SOA-06', 'NC menor', 'Implantación parcial sin acción PTR ni MC.'],
  ['SOA-07', 'NC menor', '% de implantación incoherente con el estado.'], ['SOA-08', 'NC menor', 'Exclusión sin justificar.'],
  ['SOA-10', 'Observación', 'Medidas pendientes de declarar.'],
  ['REF-01', 'NC mayor', 'Refuerzo exigido por el nivel no contemplado.'], ['REF-02', 'NC menor', 'Grupo de refuerzos alternativos sin opción elegida.'],
  ['REF-03', 'Observación', 'Refuerzo marcado exigible que ya no lo es.'], ['MC-01', 'NC mayor', 'Medida compensada sin registro de MC.'],
  ['MC-02', 'NC menor', 'Ficha de MC incompleta (riesgo, validación, mantenimiento, aprobación).'], ['MC-03', 'Observación', 'MC no reflejada en la SoA.'],
  ['MC-04', 'NC menor', 'Riesgo citado en la MC inexistente en el AR.'], ['AR-01', 'NC mayor', 'SoA «Implantada 100 %» con salvaguarda del AR inmadura.'],
  ['AR-02', 'NC menor', 'Riesgo fuera de apetito sin tratamiento o aceptado sin aprobación formal.'], ['AR-03', 'Observación', 'Tratamiento sin plazo o responsable.'],
  ['AR-04', 'Observación', 'Medidas exigidas sin riesgo vinculado en el AR.'], ['AR-05', 'Observación', 'Activo del AR sin vínculo a activos esenciales.'],
  ['PT-01', 'NC mayor', 'Hallazgo abierto CVSS ≥ 7 contra medida «Implantada 100 %».'], ['PT-02', 'NC menor', 'Hallazgo abierto CVSS 4–6,9 contra medida «Implantada 100 %».'],
  ['DOC-01', 'NC menor', 'SoA sin firma (art. 28.2).'], ['DOC-02', 'NC menor', 'SoA sin revisar en los últimos 12 meses.']
];
const GLOSARIO = [
  ['ENS', 'Esquema Nacional de Seguridad, regulado por el Real Decreto 311/2022. Establece los principios, requisitos y medidas de seguridad que deben cumplir el sector público y sus proveedores.'],
  ['SoA · Declaración de Aplicabilidad', 'Documento firmado por el Responsable de Seguridad que relaciona las 73 medidas del Anexo II con su aplicabilidad, justificación, estado y evidencias (art. 28).'],
  ['Categoría del sistema', 'BÁSICA, MEDIA o ALTA. La determina el nivel más alto alcanzado en cualquiera de las cinco dimensiones de seguridad (art. 40 y Anexo I).'],
  ['Dimensiones de seguridad', 'Disponibilidad (D), Integridad (I), Confidencialidad (C), Autenticidad (A) y Trazabilidad (T).'],
  ['Activo esencial', 'Información o servicio que da razón de ser al sistema. Es lo que se valora para categorizar.'],
  ['Nivel exigido', 'Nivel (BAJO, MEDIO o ALTO) en que se exige una medida: el de la categoría si afecta a «Categoría», o el más alto de sus dimensiones.'],
  ['Refuerzo (Rn)', 'Requisito adicional de una medida que se exige a partir de cierto nivel. «[R1 o R2]» indica que basta con uno del grupo.'],
  ['Medida compensatoria', 'Medida que sustituye a otra del Anexo II cuando no puede implantarse tal cual, siempre que proteja igual o mejor el riesgo y se justifique documentalmente (art. 28.3).'],
  ['MAGERIT', 'Metodología de análisis y gestión de riesgos de las Administraciones públicas españolas (versión 3). PILAR es su herramienta de referencia.'],
  ['Riesgo inherente', 'Riesgo antes de aplicar salvaguardas: combina el impacto (valor del activo × degradación) y la probabilidad de la amenaza.'],
  ['Riesgo residual', 'Riesgo que queda tras aplicar las salvaguardas según su eficacia y madurez.'],
  ['Madurez (L0–L5)', 'Grado de desarrollo de una salvaguarda, de inexistente (L0) a optimizada (L5). Modula su eficacia.'],
  ['Apetito de riesgo', 'Nivel de riesgo residual que la organización está dispuesta a aceptar. Lo que lo supera requiere tratamiento.'],
  ['PTR', 'Plan de Tratamiento de Riesgos: acciones, responsables y plazos para reducir los riesgos por encima del apetito.'],
  ['NC mayor / NC menor', 'No conformidades de auditoría. La mayor compromete el cumplimiento de un requisito; la menor es un incumplimiento puntual. La observación es una oportunidad de mejora.'],
  ['CVSS', 'Common Vulnerability Scoring System: puntuación de 0 a 10 de la gravedad de una vulnerabilidad. Aquí se traduce a probabilidad MAGERIT.'],
  ['CCN-STIC', 'Guías del Centro Criptológico Nacional para la implantación y verificación del ENS (800, 803, 804, 808, 825…).'],
  ['CPSTIC', 'Catálogo de Productos y Servicios de Seguridad TIC cualificados por el CCN.']
];
const FAQ = [
  ['¿Sustituye a PILAR?', 'No. PILAR es la herramienta oficial de análisis de riesgos. Esta herramienta concilia ese análisis con la SoA y con la evidencia técnica, y revisa la coherencia documental antes de una auditoría.'],
  ['¿Dónde se guardan mis datos?', 'Solo en este navegador. No hay servidor ni cuentas. Usa Ajustes → Copia de seguridad para llevarte tus proyectos a otro equipo.'],
  ['¿Puedo trabajar con mi SoA actual?', 'Sí: Inicio → Importar mi SoA. Se admite la plantilla de 73 medidas con hojas de categorización, SoA, refuerzos y medidas compensatorias.'],
  ['¿Cómo convierte un hallazgo de pentest en riesgo?', 'Cada categoría de hallazgo apunta a una amenaza MAGERIT. El CVSS fija la probabilidad y la categoría, la degradación. Si la amenaza ya existía en el activo, se endurece; si no, aparece un riesgo nuevo.'],
  ['¿Las correspondencias amenaza → medida son oficiales?', 'Son criterio del autor, razonado a partir de MAGERIT v3 y de la guía CCN-STIC 804. Para un sistema real, revísalas con tu analista.'],
  ['¿Qué pasa si recategorizo?', 'La herramienta recalcula al momento el nivel, la exigencia y los refuerzos de las 73 medidas, y el auditor señala qué declaraciones han quedado desalineadas.']
];
function vAyuda() {
  const tabs = [['inicio', 'Primeros pasos', 'flag'], ['flujo', 'Cómo funciona', 'layers'], ['glosario', 'Glosario', 'book'], ['reglas', 'Reglas del auditor', 'shieldCheck'], ['atajos', 'Atajos de teclado', 'keyboard'], ['faq', 'Preguntas frecuentes', 'help'], ['acerca', 'Acerca de', 'info']];
  let body = '';
  const t = ui.helpTab;
  if (t === 'inicio') {
    const pasos = [['Crea o abre un proyecto', 'Empieza con tus datos, importa tu SoA en Excel o abre uno de los cinco casos de ejemplo.', 'inicio'], ['Categoriza el sistema', 'Valora los activos esenciales en las cinco dimensiones. La categoría y el nivel exigido a cada medida se calculan solos.', 'categorizacion'], ['Analiza los riesgos', 'Activos, amenazas y salvaguardas con el método MAGERIT. Cada amenaza se enlaza con las medidas del ENS que la tratan.', 'riesgos'], ['Declara la aplicabilidad', 'Para cada medida: aplica o no, estado, porcentaje, evidencias y responsable. La justificación se puede calcular.', 'soa'], ['Incorpora la evidencia técnica', 'Carga los hallazgos de tus pentest o escaneos: se convierten en riesgo y se cruzan con lo declarado.', 'hallazgos'], ['Revisa y actúa', 'El auditor señala lo que no cuadra y el plan de acción lo convierte en tareas con responsable y fecha.', 'auditoria']];
    body = `<ol class="steps">${pasos.map(([h, p, v], i) => `<li><span class="step-n">${i + 1}</span><div><b>${h}</b><p>${p}</p></div>${state || v === 'inicio' ? `<button type="button" class="btn sm ghost" data-act="nav" data-view="${v}">Ir${icon('arrowRight', 15)}</button>` : ''}</li>`).join('')}</ol>`;
  } else if (t === 'flujo') {
    body = `<div class="flow" role="img" aria-label="Flujo de información de la herramienta">
      <div class="flow-col"><div class="fnode">${icon('layers', 18)}<b>Categorización</b><small>Anexo I · art. 40</small></div><div class="fnode">${icon('activity', 18)}<b>Análisis de riesgos</b><small>MAGERIT v3</small></div><div class="fnode">${icon('target', 18)}<b>Evidencia técnica</b><small>Pentest · escaneos</small></div></div>
      <div class="flow-arrow">${icon('arrowRight', 22)}</div>
      <div class="flow-col mid"><div class="fnode big">${icon('fileCheck', 22)}<b>Declaración de Aplicabilidad</b><small>73 medidas · nivel, exigencia y refuerzos calculados · trazabilidad con riesgos y hallazgos</small></div></div>
      <div class="flow-arrow">${icon('arrowRight', 22)}</div>
      <div class="flow-col"><div class="fnode">${icon('shieldCheck', 18)}<b>Auditor</b><small>${RULES.length} reglas</small></div><div class="fnode">${icon('listChecks', 18)}<b>Plan de acción</b><small>Responsable y fecha</small></div><div class="fnode">${icon('sheet', 18)}<b>Exportación</b><small>Excel · informe</small></div></div></div>
      <div class="grid g3" style="margin-top:18px">
      <div class="card soft"><h4>Nivel exigido</h4><p class="small">Si la medida afecta a «Categoría», se exige en el nivel de la categoría; si afecta a dimensiones concretas, en el nivel más alto de esas dimensiones.</p></div>
      <div class="card soft"><h4>Riesgo</h4><p class="small">Impacto = valor × degradación. Riesgo = matriz 5×5 impacto × probabilidad. Las salvaguardas reducen ambos según su eficacia y su madurez.</p></div>
      <div class="card soft"><h4>Hallazgo técnico</h4><p class="small">CVSS ≥ ${ws.settings.cvss.ma} → MA, ≥ ${ws.settings.cvss.a} → A, ≥ ${ws.settings.cvss.m} → M. Un hallazgo abierto contra una medida «Implantada 100 %» es una no conformidad.</p></div></div>`;
  } else if (t === 'glosario') {
    const q = ui.glosarioQ.toLowerCase();
    const items = GLOSARIO.filter(([a, b]) => !q || (a + b).toLowerCase().includes(q));
    body = `<input type="search" id="glo-q" data-ui="glosarioQ" value="${esc(ui.glosarioQ)}" placeholder="Buscar un término…" class="w-full" style="margin-bottom:14px"><dl class="glossary">${items.map(([a, b]) => `<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join('') || '<p class="muted">Sin resultados.</p>'}</dl>`;
  } else if (t === 'reglas') {
    body = `<div class="table-wrap"><table class="tbl"><thead><tr><th>Regla</th><th>Severidad</th><th>Qué comprueba</th>${state ? '<th class="c">En este proyecto</th>' : ''}</tr></thead><tbody>${RULES.map(([id, s, d]) => `<tr><td><code>${id}</code></td><td>${sevBadge(s)}</td><td>${esc(d)}</td>${state ? `<td class="c num">${audit.filter((f) => f.id === id).length}</td>` : ''}</tr>`).join('')}</tbody></table></div>`;
  } else if (t === 'atajos') {
    const k = [['Ctrl / ⌘ + K', 'Buscar y ejecutar comandos'], ['/', 'Buscar en la vista actual'], ['↑ ↓ · Enter', 'Moverse y abrir en el buscador'], ['Esc', 'Cerrar buscador, menús y diálogos'], ['?', 'Abrir la ayuda'], ['G y luego P', 'Ir al panel'], ['G y luego S', 'Ir a la SoA'], ['G y luego A', 'Ir a la auditoría']];
    body = `<div class="kbd-list">${k.map(([a, b]) => `<div><span>${a.split(' ').map((x) => /^[+·yluego]+$/.test(x) ? `<em>${x}</em>` : `<kbd>${esc(x)}</kbd>`).join(' ')}</span><p>${b}</p></div>`).join('')}</div>`;
  } else if (t === 'faq') {
    body = `<div class="faq">${FAQ.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>`;
  } else {
    body = `<div class="about"><p><b>ENS Compliance Studio ${VERSION}</b> · Proyecto de fin de máster en Ciberseguridad &amp; IA (Evolve Academy), módulo de Gobierno, Riesgo y Cumplimiento.</p>
      <p>Autor: Yoandy Ramírez Delgado.</p>
      <p>Normativa de referencia: Real Decreto 311/2022 (BOE-A-2022-7191), MAGERIT v3, guías CCN-STIC 802, 803, 804, 808 y 825, ISO/IEC 27001:2022.</p>
      <p>Herramienta de apoyo y preauditoría: no sustituye a PILAR ni a la auditoría formal del art. 31. Los casos de ejemplo son ficticios.</p>
      <p class="muted small">Exportación a Excel con xlsx-js-style (Apache-2.0). Código bajo licencia MIT.</p></div>`;
  }
  return `${pageHead('Centro de ayuda', 'Ayuda', 'Todo lo que necesitas para sacar partido a la herramienta, desde el primer proyecto hasta la auditoría.')}
  <div class="help-layout"><nav class="help-nav">${tabs.map(([id, l, ic]) => `<button type="button" data-act="help-tab" data-tab="${id}"${t === id ? ' aria-current="page"' : ''}>${icon(ic, 16)}${l}</button>`).join('')}</nav>
  <div class="card help-body"><h2>${tabs.find((x) => x[0] === t)[1]}</h2>${body}</div></div>`;
}
