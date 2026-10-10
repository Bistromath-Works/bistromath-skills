# context-meter — see what's filling your context window

Claude Code's `/context` tells you how full the context window is, but only when you ask. **context-meter** is a Claude Code mod that keeps it on screen all the time:

```
> _
  🟢 🧠 62k / 200k · 31%
  ≈ chat 34k · tools 12k · mcp 9.8k · sys 3.1k · memory 2.2k · skills 1k
```

- **Status line:** the token total against the window, refreshed after every Claude turn. The dot goes 🟢 → 🟡 at 50% → 🔴 at 80%.
- **The line under the prompt:** what's using the space, biggest first: the conversation (`chat`), built-in tools, MCP tools, the system prompt, memory files like CLAUDE.md, skills. The `≈` means it's a free local estimate; on a narrow terminal the smallest items are the ones cut off.
- **`/tokens`:** counts every category exactly, the way `/context` does, and opens a **Context** pane with a colored bar per category, its tokens, and its share of the window. Press **r** in the pane to recount.
- **A heads-up at 80%:** one notice suggesting `/compact`. It fires again only after the context has dropped back below 80%. Nothing is compacted automatically.

## Install

In a terminal Claude Code session:

```
/plugin install context-meter --marketplace Bistromath-Works/bistromath-skills
```

Answer `y` to add the marketplace, then pick a scope (user scope loads it in every session).

Needs a Claude Code version with mod (hooks module) support. Built and tested on Claude Code 2.1.296; the mod API is early access and may change between releases.

## Good to know

- The status-line total is exact and costs nothing: it's the same figure Claude Code's own status line reads.
- The always-on breakdown is an estimate so it never makes extra calls. `/tokens` makes the exact count, which runs token-count calls in the background like `/context`.
- Before Claude's first reply in a session there's no count yet, so the status line shows `🧠 — / 200k`.
- The breakdown is by category. It doesn't single out which MCP server or memory file is the biggest.
- The breakdown line is drawn on the terminal; other surfaces show the status line and `/tokens`.

## Develop

```sh
claude plugin validate plugins/context-meter
claude plugin test plugins/context-meter
```

To work on a copy and have it load in every session, point `CLAUDE_CODE_PLUGIN_DIRS` (in the `env` block of `~/.claude/settings.json`) at your folder; edits reload live.

MIT — BistroMathWorks.
