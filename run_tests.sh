#!/usr/bin/env bash
# Ejecuta todas las pruebas: motor (Node), app en navegador (Playwright) y auditor CLI (pytest).
set -euo pipefail
cd "$(dirname "$0")"
echo "== Construcción de la app"; node app/build.js
echo "== Motor · node --test"; node --test tests/engine.test.js
echo "== App en navegador · Playwright"; python3 tests/e2e_app.py
echo "== Auditor CLI · pytest"; python3 -m pytest -q tests/test_auditor.py
echo "== Todo en verde"
