#!/usr/bin/env bash
# Build uploadable skill zips into dist/ (one per skill, folder at zip root —
# the layout Claude Desktop's skill upload expects). Canonical top-level skills
# first; plugin-only skills (no canonical copy) are picked up from plugins/.
set -euo pipefail
cd "$(dirname "$0")"
root=$(pwd)
rm -rf dist && mkdir -p dist
for manifest in */*/SKILL.md plugins/*/skills/*/SKILL.md; do
  skill=$(dirname "$manifest")
  name=$(basename "$skill")
  [ -f "dist/$name.zip" ] && continue
  (cd "$(dirname "$skill")" && zip -rq "$root/dist/$name.zip" "$name" -x "*.DS_Store" -x "$name/evals/*")
  echo "built dist/$name.zip"
done
