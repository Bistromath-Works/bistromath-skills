---
name: claude-park
description: Park idle Claude Code sessions in herdr or tmux to free memory without losing the tab. Use when the user says "park this", "park my idle sessions", "free up memory from Claude sessions", "what's parked", or asks to install/uninstall claude-park or change its idle cutoff.
---

# claude-park: sleep idle Claude tabs and tmux windows, keep the tab

Every open Claude Code session holds 300–650 MB even when idle. People who use
herdr workspaces or tmux windows as their map of ongoing work don't want to close tabs, since a
closed tab is a forgotten chat. claude-park keeps the map and frees the memory:

- An idle session gets `/exit`. Its herdr tab or tmux window stays where it was, relabelled
  `💤 <the chat's title>`, with `claude-wake <session-id>` pre-typed at the prompt.
- To resume, the user clicks the tab and presses **Enter**. `claude-wake`
  restores the original tab label and runs `claude --resume` in the session's folder.
- An hourly job (systemd on Linux, launchd on macOS) parks tabs idle longer than
  `CLAUDE_PARK_IDLE_HOURS` (default 24). It never parks a tab that is focused,
  working, or waiting on the user.

## Commands

| Ask | Run |
|-----|-----|
| Not installed yet | `./install.sh` from this skill's folder (`CLAUDE_PARK_IDLE_HOURS=12 ./install.sh` for a different cutoff) |
| "What would you park?" | `claude-park --dry-run` |
| "Park my idle sessions" | `claude-park` |
| "Park everything idle more than N hours" | `CLAUDE_PARK_IDLE_HOURS=N claude-park` |
| "Change the cutoff" | re-run `CLAUDE_PARK_IDLE_HOURS=N ./install.sh` |
| "Remove it" | `./install.sh --uninstall` |
| Logs | Linux `journalctl --user -u claude-park`; macOS `~/Library/Logs/claude-park.log` |

## Rules

- Parking ends a live Claude process. Unless the user asked for parking in this
  conversation, show `claude-park --dry-run` output and get a yes first.
- Never park the session you are running in. It is focused, so claude-park skips
  it anyway; don't work around that.
- Text typed into a parked tab's input box but never sent is lost. Mention this
  the first time you park for someone.
- tmux sessions whose name matches `CLAUDE_PARK_TMUX_SKIP` (default `@`, i.e.
  OpenRig agent seats) are never parked. Don't override that to park rig seats;
  stop the rig through OpenRig instead.
- Requires herdr and/or tmux, Claude Code (a version that writes
  `~/.claude/sessions/<pid>.json`), and python3. Plain terminal windows and cmux
  are not supported.
