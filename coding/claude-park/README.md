# claude-park

Sleep idle [Claude Code](https://claude.com/claude-code) sessions in [herdr](https://herdr.dev) to free memory, **without losing the tab**.

If you keep every chat open as a herdr tab so you remember it exists, you pay for it in RAM: each idle Claude Code session holds 300–650 MB, and twenty of them is 10 GB doing nothing. Closing them means forgetting them. claude-park keeps the tabs and frees the memory.

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

Press **Enter** and the tab gets its old label back, and Claude resumes the conversation with a recap of where you left off.

## How it decides

Every hour it looks at each Claude tab in herdr and parks it only if **all** of these are true:

- herdr says the agent is idle (not working, not waiting on a permission prompt)
- Claude's own session record says idle, with no activity for `CLAUDE_PARK_IDLE_HOURS` (default **24**)
- the tab is not the one you're looking at

The tab label comes from the title Claude Code already gives each chat, so you see what the conversation was about rather than "1" or "Claude Code".

## Install

Requirements: herdr, Claude Code, python3. Linux (systemd user timer) or macOS (launchd agent).

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
| `claude-park` | Finds idle Claude tabs in herdr and parks them |
| `claude-wake` | Restores the tab label and `claude --resume`s the session in its original folder |
| `install.sh` | Installs both scripts plus an hourly systemd timer or launchd agent; `--uninstall` removes them |

## Caveats

- Anything typed into a parked tab's input box but not sent is lost.
- Only herdr tabs are touched. Sessions in plain terminals, tmux, or OpenRig seats are left alone.
- Built and run on Linux. The macOS path uses the same scripts with launchd; reports welcome.
