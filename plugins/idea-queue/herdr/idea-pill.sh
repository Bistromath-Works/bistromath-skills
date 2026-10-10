#!/usr/bin/env bash
# herdr status pill for the idea-queue Claude Code mod: shows the add-idea key,
# and how many ideas wait, while the pane you're on runs Claude. Prints nothing
# otherwise (herdr hides an empty pill). Reads the file the mod writes beside
# its inbox (pillPath in register.tsx).
pane="${HERDR_ACTIVE_PANE_ID:-}"
[[ -n "$pane" ]] || exit 0
"${HERDR_BIN_PATH:-herdr}" pane get "$pane" 2>/dev/null | grep -q '"agent":"claude"' || exit 0

read -r count mode 2>/dev/null < "$HOME/.local/state/idea-queue/${pane//[^A-Za-z0-9_-]/_}.pill"
if [[ "${count:-0}" -gt 0 ]]; then
  echo "💡 $count idea$([[ $count -eq 1 ]] || echo s) ($mode) · Ctrl+B i"
else
  echo "💡 idea: Ctrl+B i"
fi
