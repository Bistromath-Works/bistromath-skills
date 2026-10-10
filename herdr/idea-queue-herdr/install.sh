#!/usr/bin/env bash
# Installs the idea-queue herdr add-on: the Ctrl+B i popup, the Ctrl+B Shift+I
# "open pane" key, and the tab-bar status pill.
#   install.sh              install, or update the scripts
#   install.sh --uninstall  remove exactly what install added
# Every line it adds to config.toml carries "idea-queue-herdr", which is how
# --uninstall finds them. The config is backed up first and restored if herdr
# rejects the result.
set -euo pipefail

RAW="https://raw.githubusercontent.com/Bistromath-Works/bistromath-skills/main/herdr/idea-queue-herdr"
DIR="$HOME/.config/herdr/idea-queue"
CONFIG="$HOME/.config/herdr/config.toml"
MARK="idea-queue-herdr"

say() { printf '%s\n' "$*"; }
herdr_bin() { command -v herdr || echo "$HOME/.local/bin/herdr"; }

backup() {
  [[ -f "$CONFIG" ]] || return 0
  BACKUP="$CONFIG.bak-$MARK-$(date +%Y%m%d%H%M%S)"
  cp "$CONFIG" "$BACKUP"
  say "Backed up your herdr config to $BACKUP"
}

# Drops our marked lines and blocks (a block runs from "# idea-queue-herdr begin" to "end").
strip_ours() {
  awk -v m="$MARK" '
    $0 == "# " m " begin" { skip = 1; next }
    $0 == "# " m " end"   { skip = 0; next }
    skip { next }
    index($0, "# " m) { next }
    { print }
  ' "$CONFIG"
}

check_and_reload() {
  local herdr; herdr="$(herdr_bin)"
  if [[ -x "$herdr" ]] && ! "$herdr" config check >/dev/null 2>&1; then
    say "herdr rejected the new config, so nothing was changed:"
    "$herdr" config check || true
    [[ -n "${BACKUP:-}" ]] && cp "$BACKUP" "$CONFIG"
    exit 1
  fi
  if [[ -x "$herdr" ]] && "$herdr" server reload-config >/dev/null 2>&1; then
    say "herdr reloaded its config."
  else
    say "Restart herdr (or run: herdr server reload-config) to pick it up."
  fi
}

if [[ "${1:-}" == "--uninstall" ]]; then
  if [[ -f "$CONFIG" ]] && grep -q "$MARK" "$CONFIG"; then
    backup
    strip_ours > "$CONFIG.tmp" && mv "$CONFIG.tmp" "$CONFIG"
    say "Removed the idea-queue keys and pill from $CONFIG"
    check_and_reload
  else
    say "Nothing of idea-queue-herdr in $CONFIG."
  fi
  rm -rf "$DIR"
  say "Removed $DIR. Done."
  exit 0
fi

command -v python3 >/dev/null || { say "The popup needs python3. Install it, then run this again."; exit 1; }

# 1. The scripts: copied from beside this file, or downloaded when piped from curl.
mkdir -p "$DIR"
here=""
if [[ -n "${BASH_SOURCE[0]:-}" && -f "${BASH_SOURCE[0]}" ]]; then
  here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
fi
for f in idea-popup.sh idea-pill.sh; do
  if [[ -n "$here" && -f "$here/$f" ]]; then
    cp "$here/$f" "$DIR/$f"
  else
    curl -fsSL "$RAW/$f" -o "$DIR/$f"
  fi
  chmod +x "$DIR/$f"
done
say "Installed the scripts in $DIR"

# 2. The config: fresh each time, so a rerun updates instead of duplicating.
mkdir -p "$(dirname "$CONFIG")"
touch "$CONFIG"
backup
strip_ours > "$CONFIG.tmp"

if grep -Eq '^[[:space:]]*key[[:space:]]*=[[:space:]]*"prefix\+(i|shift\+i)"' "$CONFIG.tmp"; then
  rm -f "$CONFIG.tmp"
  say "Your herdr config already uses Ctrl+B i or Ctrl+B Shift+I for something else."
  say "Nothing was changed. Free those keys, or add the bindings by hand (see README)."
  exit 1
fi

PILL="  { type = \"command\", command = \"$DIR/idea-pill.sh\", interval_seconds = 2, timeout_seconds = 2 }, # $MARK"
if grep -q '^[[:space:]]*tab_bar_right[[:space:]]*=' "$CONFIG.tmp"; then
  if grep -q '^[[:space:]]*tab_bar_right[[:space:]]*=[[:space:]]*\[[[:space:]]*$' "$CONFIG.tmp"; then
    # A multi-line list: add the pill as its first entry.
    awk -v pill="$PILL" '{ print } /^[[:space:]]*tab_bar_right[[:space:]]*=[[:space:]]*\[[[:space:]]*$/ && !done { print pill; done = 1 }' \
      "$CONFIG.tmp" > "$CONFIG.tmp2" && mv "$CONFIG.tmp2" "$CONFIG.tmp"
  else
    PILL_MANUAL=1
  fi
elif grep -q '^\[ui\][[:space:]]*$' "$CONFIG.tmp"; then
  awk -v pill="$PILL" -v m="$MARK" '{ print } /^\[ui\][[:space:]]*$/ && !done { print "tab_bar_right = [ # " m; print pill; print "] # " m; done = 1 }' \
    "$CONFIG.tmp" > "$CONFIG.tmp2" && mv "$CONFIG.tmp2" "$CONFIG.tmp"
else
  # No [ui] table yet. Prepended, so the new table can't land inside another one.
  { echo "# $MARK begin"; echo "[ui]"; echo "tab_bar_right = ["; echo "${PILL% # *}"; echo "]"; echo "# $MARK end"; echo
    cat "$CONFIG.tmp"; } > "$CONFIG.tmp2" && mv "$CONFIG.tmp2" "$CONFIG.tmp"
fi

cat >> "$CONFIG.tmp" <<EOF

# $MARK begin
[[keys.command]]
key = "prefix+i"
type = "popup"
command = "$DIR/idea-popup.sh"
description = "add idea to Claude's idea queue (Ctrl+B, then i)"
width = 64
height = 12

[[keys.command]]
key = "prefix+shift+i"
type = "shell"
command = "$DIR/idea-popup.sh open"
description = "open Claude's idea queue pane (Ctrl+B, then Shift+I)"
# $MARK end
EOF
mv "$CONFIG.tmp" "$CONFIG"
say "Added the Ctrl+B i and Ctrl+B Shift+I keys to $CONFIG"
check_and_reload

if [[ -n "${PILL_MANUAL:-}" ]]; then
  say ""
  say "Your tab_bar_right is on one line, so add the pill to it yourself:"
  say "  { type = \"command\", command = \"$DIR/idea-pill.sh\", interval_seconds = 2, timeout_seconds = 2 }"
fi
say ""
say "Done. In a pane running Claude Code (with the idea-queue mod), press Ctrl+B, then i."
