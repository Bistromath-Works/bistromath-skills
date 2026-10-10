#!/usr/bin/env bash
# herdr popup for the idea-queue Claude Code mod (part of idea-queue-herdr).
#   idea-popup.sh        ask for a type and an idea, queue it in the pane's Claude
#   idea-popup.sh open   open the idea pane in that Claude
# Drops one JSON file in ~/.local/state/idea-queue/<pane>/, which the mod
# running in that pane takes within a second (inboxDir in the mod's hooks/register.tsx).
set -euo pipefail

pane="${HERDR_ACTIVE_PANE_ID:-}"
if [[ -z "$pane" ]]; then
  echo "No active herdr pane found."; read -rsn1 -p "Press any key to close."; exit 1
fi
dir="$HOME/.local/state/idea-queue/${pane//[^A-Za-z0-9_-]/_}"
mkdir -p "$dir"
find "$dir" -maxdepth 1 -type f -empty -delete # ideas the mod already took

drop() { # writes beside, then renames, so the mod never reads half a file
  local name; name="$(date +%s%N)-$$.json"
  printf '%s' "$1" > "$dir/.$name" && mv "$dir/.$name" "$dir/$name"
}

info="$("${HERDR_BIN_PATH:-herdr}" pane get "$pane" 2>/dev/null || true)"
agent="$(python3 -c 'import json,sys; print(json.load(sys.stdin)["result"]["pane"].get("agent") or "")' <<<"$info" 2>/dev/null || true)"
title="$(python3 -c 'import json,sys; print(json.load(sys.stdin)["result"]["pane"].get("terminal_title_stripped") or "")' <<<"$info" 2>/dev/null || true)"

if [[ "${1:-}" == "open" ]]; then
  drop '{"action":"open"}'
  exit 0
fi

trap 'echo; exit 0' INT # Ctrl+C cancels too, never strands you

# Reads one key: Esc alone comes back as "esc"; arrow keys and other
# Esc-led sequences are swallowed and come back empty.
key() {
  local k rest
  IFS= read -rsn1 -d '' k || { REPLY=esc; return; }
  if [[ "$k" == $'\e' ]]; then
    if IFS= read -rsn1 -t 0.05 -d '' rest; then
      # ESC [ … or ESC O … runs to a final byte in @..~; Alt+key is one byte.
      if [[ "$rest" == "[" || "$rest" == "O" ]]; then
        while IFS= read -rsn1 -t 0.05 -d '' rest && [[ "$rest" != [@-~] ]]; do :; done
      fi
      REPLY=""
    else
      REPLY=esc
    fi
  else
    REPLY="$k"
  fi
}

bold=$'\e[1m'; dim=$'\e[2m'; off=$'\e[0m'
blue=$'\e[34m'; green=$'\e[32m'; yellow=$'\e[33m'; purple=$'\e[35m'

echo "${bold}Add idea → ${title:-pane $pane}${off}"
if [[ "$agent" != "claude" ]]; then
  echo "${yellow}This pane isn't running Claude right now. The idea waits until it does.${off}"
fi
echo
echo "  ${blue}1 build${off}  ${dim}next turn${off}      ${green}2 busy${off}  ${dim}when idle${off}"
echo "  ${yellow}3 broad${off}  ${dim}idle, plans first${off}   ${purple}4 new${off}   ${dim}waits for you${off}"
echo
echo "${dim}Press 1-4 to pick a type · Esc = cancel${off}"
while true; do
  key
  case "$REPLY" in
    1) kind=build ;; 2) kind=busy ;; 3) kind=broader ;; 4) kind=manual ;;
    esc|q) exit 0 ;;
    *) continue ;;
  esac
  break
done
echo "Type: $kind"
echo "${dim}Enter = queue · Esc = cancel${off}"

# A plain one-line editor: letters type, Backspace deletes, Enter queues, Esc
# cancels. Nothing else does anything, so there's no mode to get lost in.
text=""
printf 'Idea: '
while true; do
  key
  case "$REPLY" in
    esc) echo; exit 0 ;;
    $'\r'|$'\n') echo; break ;;
    $'\x7f'|$'\b') [[ -n "$text" ]] && { text="${text%?}"; printf '\b \b'; } ;;
    ''|$'\t') ;;
    *) [[ "$REPLY" == [[:cntrl:]] ]] || { text+="$REPLY"; printf '%s' "$REPLY"; } ;;
  esac
done
[[ -z "${text// }" ]] && exit 0

drop "$(python3 -c 'import json,sys; print(json.dumps({"kind": sys.argv[1], "text": sys.argv[2]}))' "$kind" "$text")"
echo "${green}Queued.${off}"
sleep 0.6
