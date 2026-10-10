# claude-park

Sleep idle [Claude Code](https://claude.com/claude-code) sessions in [herdr](https://herdr.dev) or [tmux](https://github.com/tmux/tmux) to free memory, **without losing the tab**.

If you keep every chat open as a herdr tab or tmux window so you remember it exists, you pay for it in RAM: each idle Claude Code session holds 300–650 MB, and twenty of them is 10 GB doing nothing. Closing them means forgetting them. claude-park keeps the tabs and frees the memory.

## What it looks like

Before, a tab idle for 3 days:

```
api-work             ← claude running, ~500 MB
```

After claude-park runs:

```
💤 Fix flaky checkout webhook tests
$ claude-wake 3f2a9c1e-7b4d-4e8a-9c2f-1d5e6a7b8c90█     ← pre-typed, just press Enter
```

Press **Enter** and the tab (or tmux window) gets its old label back, and Claude resumes the conversation with a recap of where you left off.

## How it decides

Every hour it looks at each Claude session in herdr tabs and tmux panes, and parks it only if **all** of these are true:

- Claude's own session record says idle, with no activity for `CLAUDE_PARK_IDLE_HOURS` (default **24**)
- it isn't waiting on a permission prompt (herdr's agent status; in tmux, the pane screen is checked for one)
- it isn't the tab/pane you're looking at (in tmux: the active pane of an attached session)
- for tmux, the session name doesn't match `CLAUDE_PARK_TMUX_SKIP` (default `@`, which leaves OpenRig agent seats like `crew-lead@my-rig` alone; set it to any regex)

In tmux the 💤 label goes on the window (`rename-window`).

The tab label comes from the title Claude Code already gives each chat, so you see what the conversation was about rather than "1" or "Claude Code".

## Install

Requirements: herdr and/or tmux, Claude Code, python3. Linux (systemd user timer) or macOS (launchd agent).

```bash
git clone https://github.com/Bistromath-Works/bistromath-skills
cd bistromath-skills/coding/claude-park
./install.sh                              # 24h cutoff
CLAUDE_PARK_IDLE_HOURS=12 ./install.sh    # or pick your own
```

This puts `claude-park` and `claude-wake` in `~/.local/bin` and schedules `claude-park` hourly. To let Claude handle "park this" for you, also copy the folder to `~/.claude/skills/claude-park`.

```bash
claude-park --dry-run    # see what it would park right now
claude-park              # park now instead of waiting for the hour
./install.sh --uninstall # remove scripts and schedule
```

Logs: `journalctl --user -u claude-park` (Linux) or `~/Library/Logs/claude-park.log` (macOS).

## Files

| File | What it is |
|------|------------|
| `SKILL.md` | Lets Claude run it when you say "park this" / "what's parked" |
| `claude-park` | Finds idle Claude sessions in herdr tabs and tmux panes and parks them |
| `claude-wake` | Restores the tab/window label and `claude --resume`s the session in its original folder |
| `install.sh` | Installs both scripts plus an hourly systemd timer or launchd agent; `--uninstall` removes them |

## Caveats

- Anything typed into a parked tab's input box but not sent is lost.
- Only herdr tabs and tmux panes are touched. Plain terminal windows (and tmux sessions matching `CLAUDE_PARK_TMUX_SKIP`) are left alone.
- Renaming a tmux window turns off tmux's automatic-rename for that window.
- cmux isn't supported yet: its socket only accepts connections from inside cmux by default, and it doesn't document a way to map a surface to its `claude` process.
- Built and run on Linux. The macOS path uses the same scripts with launchd; reports welcome.
