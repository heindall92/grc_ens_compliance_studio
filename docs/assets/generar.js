#!/usr/bin/env node
/* Genera los gráficos del README con el estilo de Apple: colores del sistema, fuente del sistema
 * (SF Pro en Apple), superficies planas y sin degradados. Los glifos son de la propia app (Lucide).
 * Uso: node docs/assets/generar.js */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..', '..');
const OUT = __dirname;
const ICONS = vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'app/src/ui/02-icons.js'), 'utf8') + '\n;ICONS');
const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI Variable Display', 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif";

/* Colores del sistema de Apple (modo claro) */
const C = { blue: '#007AFF', green: '#34C759', indigo: '#5856D6', orange: '#FF9500', pink: '#FF2D55', purple: '#AF52DE',
  red: '#FF3B30', teal: '#30B0C7', cyan: '#32ADE6', mint: '#00C7BE', yellow: '#FFCC00', gray: '#8E8E93', graphite: '#1D1D1F' };

/* Iconos que no usa la app y sí el README (Lucide, ISC) */
const EXTRA = {
  image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  layoutGrid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
  network: '<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/>',
  terminal: '<path d="M12 19h8"/><path d="m4 17 6-6-6-6"/>',
  bug: '<path d="M12 20v-9"/><path d="M14 7a4 4 0 0 1 4 4v3a6 6 0 0 1-12 0v-3a4 4 0 0 1 4-4z"/><path d="M14.12 3.88 16 2"/><path d="M21 21a4 4 0 0 0-3.81-4"/><path d="M21 5a4 4 0 0 1-3.55 3.97"/><path d="M22 13h-4"/><path d="M3 21a4 4 0 0 1 3.81-4"/><path d="M3 5a4 4 0 0 0 3.55 3.97"/><path d="M6 13H2"/><path d="m8 2 1.88 1.88"/><path d="M9 7.13V6a3 3 0 1 1 6 0v1.13"/>',
  gitBranch: '<line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
  workflow: '<rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  accessibility: '<circle cx="16" cy="4" r="1"/><path d="m18 19 1-7-6 1"/><path d="m5 8 3-3 5.5 3-2.36 3.5"/><path d="M4.24 14.5a5 5 0 0 0 6.88 6"/><path d="M13.76 17.5a5 5 0 0 0-6.88-6"/>',
  wifiOff: '<path d="M12 20h.01"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/><path d="M5 12.859a10 10 0 0 1 5.17-2.69"/><path d="M19 12.859a10 10 0 0 0-2.007-1.523"/><path d="M2 8.82a15 15 0 0 1 4.177-2.643"/><path d="M22 8.82a15 15 0 0 0-11.288-3.764"/><path d="m2 2 20 20"/>',
  fingerprint: '<path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M2 12a10 10 0 0 1 18-6"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M9 6.8a6 6 0 0 1 9 5.2v2"/>'
};
const glyph = (name) => ICONS[name] || EXTRA[name];

/* ---------- Iconos de sección: azul del sistema, legible en el tema claro y oscuro de GitHub ---------- */
const SECTION = { route: 'arrowRight', 'list-checks': 'listChecks', rocket: 'arrowRight', bug: 'bug', 'shield-check': 'shieldCheck',
  terminal: 'terminal', 'folder-tree': 'folder', 'triangle-alert': 'alert', scale: 'scale', 'user-round': 'user',
  image: 'image', 'layout-grid': 'layoutGrid', network: 'network', accessibility: 'accessibility', 'file-check': 'fileCheck', target: 'target' };
fs.mkdirSync(path.join(OUT, 'icons'), { recursive: true });
for (const [file, name] of Object.entries(SECTION)) {
  const p = path.join(OUT, 'icons', file + '.svg');
  // Si el icono ya existe (Lucide original), solo se recolorea; si no, se crea con el glifo de la app
  const inner = fs.existsSync(p) ? fs.readFileSync(p, 'utf8').replace(/^[\s\S]*?>\s*/, '').replace(/<\/svg>\s*$/, '').trim() : glyph(name);
  fs.writeFileSync(p, `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${C.blue}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>\n`);
}

/* ---------- Mosaicos tipo icono de app: superficie plana con radio del 22 % ---------- */
const tile = (id, color, label, { g, text, ink = '#FFFFFF' }) => {
  const body = g
    ? `<g transform="translate(80 46) scale(4)" fill="none" stroke="${ink}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${glyph(g)}</g>
  <text x="128" y="206" text-anchor="middle" font-family="${FONT}" font-weight="600" font-size="${label.length > 9 ? 27 : 32}" letter-spacing="-0.4" fill="${ink}">${label}</text>`
    : `<text x="128" y="${text.sub ? 132 : 152}" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="${text.size || 76}" letter-spacing="-2" fill="${ink}">${text.main}</text>${text.sub ? `
  <text x="128" y="190" text-anchor="middle" font-family="${FONT}" font-weight="600" font-size="30" letter-spacing="-0.3" fill="${ink}" fill-opacity="0.86">${text.sub}</text>` : ''}`;
  return [id, `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256" role="img" aria-label="${label}">
  <title>${label}</title>
  <rect width="256" height="256" rx="57" fill="${color}"/>
  ${body}
</svg>
`];
};
const TILES = [
  // Normativa
  tile('ens', C.blue, 'ENS', { text: { main: 'ENS', sub: 'RD 311/2022', size: 84 } }),
  tile('magerit', C.orange, 'MAGERIT', { text: { main: 'MAGERIT', sub: 'v3', size: 50 } }),
  tile('iso27001', C.indigo, 'ISO/IEC 27001', { text: { main: '27001', sub: 'ISO/IEC · 2022', size: 72 } }),
  tile('ccn-stic', C.red, 'CCN-STIC', { text: { main: 'CCN', sub: 'STIC 804 · 825', size: 84 } }),
  // Motor
  tile('categorizacion', C.green, 'Categoría', { g: 'layers' }),
  tile('riesgos', C.orange, 'Riesgos', { g: 'activity' }),
  tile('soa', C.blue, 'SoA', { g: 'fileCheck' }),
  tile('preauditoria', C.purple, '27 reglas', { g: 'listChecks' }),
  tile('plan', C.teal, 'Plan', { g: 'calendar' }),
  // Código
  tile('javascript', C.yellow, 'JavaScript', { text: { main: 'JS', sub: 'ES2022', size: 96 }, ink: '#1D1D1F' }),
  tile('html', C.orange, 'HTML', { text: { main: 'HTML', size: 72 } }),
  tile('css', C.blue, 'CSS', { text: { main: 'CSS', size: 84 } }),
  tile('python', C.indigo, 'Python', { text: { main: 'Py', sub: 'auditor CLI', size: 96 } }),
  tile('nodejs', C.green, 'Node.js', { text: { main: 'Node', sub: 'build', size: 72 } }),
  // Calidad
  tile('pruebas', C.green, 'node:test', { g: 'check' }),
  tile('playwright', C.teal, 'Playwright', { g: 'monitor' }),
  tile('pytest', C.indigo, 'pytest', { g: 'terminal' }),
  tile('axe', C.purple, 'axe-core', { g: 'accessibility' }),
  // Seguridad
  tile('csp', C.red, 'CSP', { g: 'lock' }),
  tile('sri', C.orange, 'SRI', { g: 'fingerprint' }),
  tile('sheetjs', C.green, 'SheetJS', { g: 'sheet' }),
  tile('sin-red', C.graphite, 'Sin red', { g: 'wifiOff' }),
  // Publicación
  tile('git', C.red, 'Git', { g: 'gitBranch' }),
  tile('actions', C.blue, 'Actions', { g: 'workflow' }),
  tile('pages', C.graphite, 'Pages', { g: 'globe' })
];
fs.mkdirSync(path.join(OUT, 'stack'), { recursive: true });
for (const [id, svg] of TILES) fs.writeFileSync(path.join(OUT, 'stack', id + '.svg'), svg);

/* ---------- Cabecera y pie con ola flotante (claro y oscuro) ----------
   Colores planos del sistema, sin degradados: dos capas de ola del mismo azul, la trasera con opacidad.
   Las olas se desplazan despacio en bucle; con «reducir movimiento» del sistema se quedan quietas. */
const wavePath = (w, base, amp, len, up) => {
  // Onda periódica de longitud «len» desde x=0 hasta x=w; «up»: relleno hacia arriba (cabecera) o hacia abajo (pie)
  let d = `M0 ${base}`;
  for (let x = 0; x < w; x += len) d += ` C${x + len * 0.25} ${base - amp},${x + len * 0.25} ${base - amp},${x + len * 0.5} ${base} S${x + len * 0.75} ${base + amp},${x + len} ${base}`;
  return d + (up ? ` V0 H0 Z` : ` V400 H0 Z`);
};
const WAVE_CSS = `<style>
    .w1 { animation: flota 22s linear infinite; } .w2 { animation: flota 15s linear infinite reverse; }
    .t { animation: sube 1.2s cubic-bezier(.32,.72,0,1) both; }
    @keyframes flota { from { transform: translateX(0); } to { transform: translateX(-640px); } }
    @keyframes sube { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
    @media (prefers-reduced-motion: reduce) { .w1, .w2, .t { animation: none; } }
  </style>`;
const header = (dark) => {
  const blue = dark ? '#0A84FF' : '#007AFF';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="300" viewBox="0 0 1280 300" role="img" aria-label="ENS Compliance Studio">
  <title>ENS Compliance Studio</title>
  ${WAVE_CSS}
  <g class="w1"><path d="${wavePath(1920, 268, 16, 640, true)}" fill="${blue}" fill-opacity="0.35"/></g>
  <g class="w2"><path d="${wavePath(1920, 246, 14, 640, true)}" fill="${blue}"/></g>
  <g class="t">
    <g transform="translate(608 34)">
      <rect width="64" height="64" rx="15" fill="#FFFFFF"/>
      <g transform="translate(12 12) scale(1.6667)" fill="none" stroke="${blue}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${glyph('shieldCheck')}</g>
    </g>
    <text x="640" y="152" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="56" letter-spacing="-1.6" fill="#FFFFFF">ENS Compliance Studio</text>
    <text x="640" y="194" text-anchor="middle" font-family="${FONT}" font-weight="500" font-size="22" letter-spacing="-0.2" fill="#FFFFFF" fill-opacity="0.9">Categorización · Riesgos MAGERIT · Declaración de Aplicabilidad · Preauditoría</text>
  </g>
</svg>
`;
};
const footer = (dark) => {
  const blue = dark ? '#0A84FF' : '#007AFF';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="130" viewBox="0 0 1280 130" role="img" aria-label="Fin">
  ${WAVE_CSS}
  <g class="w1"><path d="${wavePath(1920, 42, 16, 640, false)}" fill="${blue}" fill-opacity="0.35"/></g>
  <g class="w2"><path d="${wavePath(1920, 58, 12, 640, false)}" fill="${blue}"/></g>
</svg>
`;
};
/* Cifras bajo la cabecera */
const stats = (dark) => {
  const k = dark ? { bg: '#1C1C1E', ink: '#F5F5F7', faint: '#98989D' } : { bg: '#F5F5F7', ink: '#1D1D1F', faint: '#6E6E73' };
  const items = [['73', 'medidas del Anexo II'], ['27', 'reglas de preauditoría'], ['5', 'casos de ejemplo'], ['0', 'peticiones de red']];
  const colW = 300; const x0 = 640 - (colW * items.length) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="150" viewBox="0 0 1280 150" role="img" aria-label="73 medidas del Anexo II, 27 reglas de preauditoría, 5 casos de ejemplo, 0 peticiones de red">
  <rect width="1280" height="150" rx="28" fill="${k.bg}"/>
  ${items.map(([n, l], i) => `<text x="${x0 + colW * i + colW / 2}" y="74" text-anchor="middle" font-family="${FONT}" font-weight="600" font-size="48" letter-spacing="-1.4" fill="${k.ink}">${n}</text>
  <text x="${x0 + colW * i + colW / 2}" y="110" text-anchor="middle" font-family="${FONT}" font-weight="400" font-size="19" fill="${k.faint}">${l}</text>`).join('\n  ')}
</svg>
`;
};
fs.mkdirSync(path.join(OUT, 'readme'), { recursive: true });
for (const f of ['hero-light.svg', 'hero-dark.svg']) fs.rmSync(path.join(OUT, 'readme', f), { force: true });
for (const [name, fn] of [['cabecera', header], ['pie', footer], ['cifras', stats]]) {
  fs.writeFileSync(path.join(OUT, 'readme', `${name}-light.svg`), fn(false));
  fs.writeFileSync(path.join(OUT, 'readme', `${name}-dark.svg`), fn(true));
}
console.log(`OK · ${Object.keys(SECTION).length} iconos de sección · ${TILES.length} mosaicos · cabecera, cifras y pie en claro y oscuro`);
