#!/usr/bin/env bash
# Build uploadable skill zips into dist/ (one per skill, folder at zip root —
# the layout Claude Desktop's skill upload expects).
set -euo pipefail
cd "$(dirname "$0")"
rm -rf dist && mkdir -p dist
for manifest in */*/SKILL.md; do
  skill=$(dirname "$manifest")
  name=$(basename "$skill")
  (cd "$(dirname "$skill")" && zip -rq "../dist/$name.zip" "$name" -x "*.DS_Store")
  echo "built dist/$name.zip"
done
