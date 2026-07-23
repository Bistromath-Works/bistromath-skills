#!/usr/bin/env bash
# Sync canonical top-level skills into the plugin bundles that re-ship them.
# Canonical copies live in coding/, general/, real-estate/; run this after
# editing any shared skill. The release workflow fails if this produces a diff.
set -euo pipefail
cd "$(dirname "$0")"
for src in coding/*/ general/*/ real-estate/*/; do
  name=$(basename "$src")
  for dst in plugins/*/skills/"$name"; do
    if [ -d "$dst" ]; then
      rsync -a --delete "$src" "$dst/"
      echo "synced $name -> $dst"
    fi
  done
done
