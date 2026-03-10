#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
cd "$ROOT_DIR"

echo "[review-checklist] Analiso frontend pre-delivery checklist"

check_file() {
  local file="$1"
  if [[ -f "$file" ]]; then
    echo "[ok] $file"
  else
    echo "[missing] $file"
    return 1
  fi
}

check_file "AGENTS.md"
check_file ".codex/skills/analiso-frontend/SKILL.md"
check_file ".codex/skills/analiso-frontend/resources/00-product-promise.md"
check_file ".codex/skills/analiso-frontend/resources/10-ux-principles.md"
check_file ".codex/skills/analiso-frontend/resources/20-page-rubrics.md"
check_file ".codex/skills/analiso-frontend/resources/30-component-rubrics.md"
check_file ".codex/skills/analiso-frontend/resources/40-onboarding-playbook.md"
check_file ".codex/skills/analiso-frontend/resources/50-copy-system.md"

echo "[review-checklist] Manual gates"
echo "- A intenção primária da tela está explícita?"
echo "- O CTA principal está claro e único?"
echo "- Há conteúdo secundário que pode ser compactado?"
echo "- A copy parece Analiso e não template genérico?"
echo "- Existe fonte/data/evidência nos blocos críticos?"

echo "[review-checklist] Done"
