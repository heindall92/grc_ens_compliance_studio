// Auxiliar de test_auditor.py: ejecuta el auditor JS sobre el caso semilla y devuelve "ID|ámbito" en JSON.
const path = require('path');
const root = process.argv[2];
const E = require(path.join(root, 'app/src/engine.js'));
const D = require(path.join(root, 'app/dist/ens_data.json'));
const ctx = { anexo: D.anexo, mapping: D.mapping, amenazasCatalogo: D.catalogos.AMENAZAS };
const st = JSON.parse(JSON.stringify(D.seed));
const f = E.auditar(st, ctx, E.calcular(st, ctx), { hoy: '2026-09-22' });
process.stdout.write(JSON.stringify(f.map((x) => `${x.id}|${x.ambito}`)));
