#!/usr/bin/env bash
# herdr status pill for the for-you Claude Code mod: how many tasks wait on
# you, and how many block Claude, while the pane you're on runs Claude. Prints
# nothing otherwise, or when nothing waits (herdr hides an empty pill). Reads
# the file the mod writes (pillPath in register.tsx).
pane="${HERDR_ACTIVE_PANE_ID:-}"
[[ -n "$pane" ]] || exit 0
"${HERDR_BIN_PATH:-herdr}" pane get "$pane" 2>/dev/null | grep -q '"agent":"claude"' || exit 0

read -r open blocking 2>/dev/null < "$HOME/.local/state/for-you/${pane//[^A-Za-z0-9_-]/_}.pill"
[[ "${open:-0}" -gt 0 ]] || exit 0
if [[ "${blocking:-0}" -gt 0 ]]; then
  echo "📋 $open for you · $blocking blocking"
else
  echo "📋 $open for you"
fi
