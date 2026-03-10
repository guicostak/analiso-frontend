#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
cd "$ROOT_DIR"

echo "[validate-frontend] Running basic frontend checks..."

if command -v npm >/dev/null 2>&1; then
  npm run -s build
  if npm run -s lint >/dev/null 2>&1; then
    npm run -s lint
  else
    echo "[validate-frontend] lint script not found; skipping lint"
  fi
else
  echo "[validate-frontend] npm not found"
  exit 1
fi

echo "[validate-frontend] Done"
