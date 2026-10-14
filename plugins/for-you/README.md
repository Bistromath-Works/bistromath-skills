# for-you: what Claude needs you to do, in one list

Claude often needs you to do something before it can go on: add a secret, click something in a dashboard, sign in, run a migration, approve a design. Those asks end up in the middle of long output and get lost. **for-you** is a Claude Code mod that gives Claude a place to put them: a **For you** list beside the chat.

```
done  x   1. [blocking] Add STRIPE_KEY to Vercel
          Project settings → Environment Variables → add STRIPE_KEY (test key).
          It worked if `vercel env ls` lists it.
done  x   2. [later] Rotate the old API key next month
```

| Level | Color | What it means |
|---|---|---|
| **blocking** | red | Claude can't go on without it. Its edits and commands are **refused** until you tick the task off; it can still read files. |
| **waiting** | yellow | Claude stops and waits for you, but nothing enforces it. |
| **later** | blue | Future work. Claude carries on. |

- **Claude adds tasks** through its own tool, with a short title and the exact steps (commands, values, how to tell it worked).
- **You tick them off.** Press **done** in the pane, or type `/foryou done 2`. Claude then gets "Done from my For-you queue: …" and carries on. **x** removes a task without telling Claude.
- **Tasks stay with the project folder**, across chats and restarts, so later work is still there next time.
- **Where you see it:**
  - The pane opens beside the chat when a session starts (next to the idea queue, if you use it), or run `/foryou`.
  - The status line shows `📋 2 for you · 1 blocking`.
  - You get a desktop/terminal notification when Claude adds a blocking or waiting task.

## Install

In a terminal Claude Code session:

```
/plugin install for-you --marketplace Bistromath-Works/bistromath-skills
```

Answer `y` to add the marketplace, then pick a scope (user scope loads it in every session).

Needs a Claude Code version with mod (hooks module) support. Built and tested on Claude Code 2.1.296; the mod API is early access and may change between releases.

## Good to know

- A blocking task allows these tools: Read, Grep, Glob, WebFetch, WebSearch, ToolSearch and AskUserQuestion, plus the mod's own two tools. Everything else is refused with a message telling Claude to say what it's waiting for and end its turn. This includes Bash, edits, MCP tools and subagents.
- Claude decides when to use the list. If it still writes an ask only in its reply, tell it "put that in my for-you queue".
- Chats open in the same folder share one list. Changes made in two chats at the exact same moment can overwrite each other.
- Claude Code only. Other agents, like Codex, don't see the list.

## herdr (optional)

Run Claude Code inside [herdr](https://herdr.dev)? The separate [for-you-herdr](../../herdr/for-you-herdr/) add-on puts a `📋 2 for you · 1 blocking` pill in herdr's tab bar.

## Develop

```sh
claude plugin validate plugins/for-you
claude plugin test plugins/for-you
```

To work on a copy and have it load in every session, point `CLAUDE_CODE_PLUGIN_DIRS` (in the `env` block of `~/.claude/settings.json`) at your folder; edits reload live.

MIT — BistroMathWorks.
