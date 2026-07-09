# Munger

> "All I want to know is where I'm going to die, so I'll never go there." — Charlie Munger

![Charlie Munger](munger.png)

A post-build **inversion-review** skill for [Claude Code](https://claude.com/claude-code), plus an auto-firing Stop hook that summons it when a build actually completes.

You just declared something done. Done is a claim, not a fact. Munger turns the claim upside down: instead of *"is it right?"*, it asks **"how would I guarantee this fails, and how does it poison t[...]

## What's in here

| File | What it is |
|------|------------|
| `SKILL.md` | The skill itself — the inversion procedure (`/munger`). |
| `hook.js` | A Stop hook (Node, zero deps) that auto-fires the review on build-completion turns. |
| `test.sh` | Hermetic self-check for the hook — no frameworks. `bash test.sh` → `pass=16 fail=0`. |

## The review loop

Up to **3 rounds**. Each round: **invert → verify → fix CRITICAL/HIGH → re-invert.** Stop the moment a round surfaces no CRITICAL or HIGH finding (clean pass), or after 3 rounds (report what[...]

The teeth: every round must **verify at least one checkable claim empirically** — run the test, the build, the query, the grep. Inversion that stays theoretical is rubber-stamping. The lenses it[...]

## The auto-fire hook

`hook.js` is a Claude Code **Stop hook**. It fires the review only when the current turn shows **evidence of a build action** — a Bash `tool_use` running `git commit`, `git push`, or `gh pr crea[...]

- **Subcommand-aware** — keys on the parsed git subcommand, so `git log --grep=commit` and `git config push.default` don't false-fire.
- **Turn-scoped** — only inspects the current turn, so a recap that mentions a past commit won't re-trigger.
- **Repo-gated** — silent outside a git repository.
- **Fail-open** — any error (no transcript, parse failure, not a repo) lets the stop proceed. A hook bug never traps the session.
- **Loop-safe** — bails on `stop_hook_active` (set by Claude Code on a hook-induced continuation), with the word "munger" in the last message as a backup guard.

## Install

1. Copy this directory to `~/.claude/skills/munger/`.
2. Wire the Stop hook in `~/.claude/settings.json`:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          { "type": "command", "command": "node \"/absolute/path/to/.claude/skills/munger/hook.js\"", "timeout": 15 }
        ]
      }
    ]
  }
}
```

Settings load at session start, so the hook goes live on the next Claude Code session. You can also invoke the review manually any time with `/munger`.

## Test

```bash
bash test.sh        # pass=16 fail=0
```

## Verification

The Stop-hook output contract was confirmed empirically against the installed Claude Code (2.1.195), not docs: `{"decision":"block","reason":…}` is the honored shape, and `stop_hook_active` is r[...]

## Contributors

- [@ArthurDentsTowel](https://github.com/ArthurDentsTowel)
