#!/bin/sh
# Install claude-park + claude-wake and an hourly scheduler (systemd on Linux, launchd on macOS).
#   ./install.sh                              install with a 24h idle cutoff
#   CLAUDE_PARK_IDLE_HOURS=12 ./install.sh    install with a custom cutoff
#   ./install.sh --uninstall                  remove everything
set -eu

BIN="$HOME/.local/bin"
SRC="$(cd "$(dirname "$0")" && pwd)"
HOURS="${CLAUDE_PARK_IDLE_HOURS:-24}"
PATH_FOR_JOB="$BIN:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"
OS="$(uname -s)"

UNIT_DIR="$HOME/.config/systemd/user"
PLIST="$HOME/Library/LaunchAgents/works.bistromath.claude-park.plist"

if [ "${1:-}" = "--uninstall" ]; then
  if [ "$OS" = Darwin ]; then
    launchctl bootout "gui/$(id -u)" "$PLIST" 2>/dev/null || true
    rm -f "$PLIST"
  else
    systemctl --user disable --now claude-park.timer 2>/dev/null || true
    rm -f "$UNIT_DIR/claude-park.service" "$UNIT_DIR/claude-park.timer"
    systemctl --user daemon-reload
  fi
  rm -f "$BIN/claude-park" "$BIN/claude-wake"
  echo "claude-park removed. Parked tabs still wake with Enter until you close them."
  exit 0
fi

for cmd in herdr claude python3; do
  command -v "$cmd" >/dev/null || { echo "missing required command: $cmd" >&2; exit 1; }
done

mkdir -p "$BIN"
install -m 755 "$SRC/claude-park" "$SRC/claude-wake" "$BIN/"

if [ "$OS" = Darwin ]; then
  mkdir -p "$(dirname "$PLIST")"
  cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>works.bistromath.claude-park</string>
  <key>ProgramArguments</key><array><string>$BIN/claude-park</string></array>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key><string>$PATH_FOR_JOB</string>
    <key>CLAUDE_PARK_IDLE_HOURS</key><string>$HOURS</string>
  </dict>
  <key>StartInterval</key><integer>3600</integer>
  <key>StandardOutPath</key><string>$HOME/Library/Logs/claude-park.log</string>
  <key>StandardErrorPath</key><string>$HOME/Library/Logs/claude-park.log</string>
</dict>
</plist>
EOF
  launchctl bootout "gui/$(id -u)" "$PLIST" 2>/dev/null || true
  launchctl bootstrap "gui/$(id -u)" "$PLIST"
  echo "Installed. Runs hourly via launchd; log: ~/Library/Logs/claude-park.log"
else
  mkdir -p "$UNIT_DIR"
  cat > "$UNIT_DIR/claude-park.service" <<EOF
[Unit]
Description=Park herdr Claude Code tabs idle for ${HOURS}h+ (frees memory, keeps the tab)

[Service]
Type=oneshot
Environment=PATH=$PATH_FOR_JOB
Environment=CLAUDE_PARK_IDLE_HOURS=$HOURS
ExecStart=$BIN/claude-park
EOF
  cat > "$UNIT_DIR/claude-park.timer" <<EOF
[Unit]
Description=Run claude-park hourly

[Timer]
OnCalendar=hourly
Persistent=true

[Install]
WantedBy=timers.target
EOF
  systemctl --user daemon-reload
  systemctl --user enable --now claude-park.timer
  echo "Installed. Runs hourly via systemd; log: journalctl --user -u claude-park"
fi

echo "Preview what it would park now: claude-park --dry-run"
