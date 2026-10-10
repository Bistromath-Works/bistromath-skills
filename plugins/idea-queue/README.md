# idea-queue — jot ideas while Claude works

You're watching Claude build something and an idea hits. Typing it now interrupts; waiting means forgetting it. **idea-queue** is a Claude Code mod that holds your ideas and hands each one to Claude at the right moment, based on what kind of idea it is.

| Type | Color | When it goes to Claude |
|---|---|---|
| **build** | blue | Right after Claude finishes its current turn. For follow-ups on what it's doing now. |
| **busy** | green | When Claude has sat idle for 2 minutes, one at a time. Keeps it working while you're away. |
| **broad** | yellow | Like busy, but Claude proposes a short plan first and waits for your OK. |
| **new** | purple | Only when you press Send. For whole new concepts you want to talk through. |

A main **Auto / Paused** switch sits on top: paused, nothing sends by itself. Busy work also holds off while you're typing in the prompt box, and nothing auto-sends after you interrupt Claude with Esc.

## Install

In a terminal Claude Code session:

```
/plugin install idea-queue --marketplace Bistromath-Works/bistromath-skills
```

Answer `y` to add the marketplace, then pick a scope (user scope loads it in every session).

Needs a Claude Code version with mod (hooks module) support. Built and tested on Claude Code 2.1.296; the mod API is early access and may change between releases.

## Use it

- **The pane** opens beside the chat when your terminal is wide enough, or run `/ideas`. Pick a type, type the idea, press Enter. Each waiting idea has **send** and **x** buttons.
- **`/idea <text>`** queues from the normal prompt. Prefix the type: `/idea busy: add tests`, `/idea broad: tidy settings`, `/idea build: also mobile`, `/idea new: billing`. No prefix uses the type picked in the pane.
- **`/ideas send`** sends everything waiting · **`/ideas auto`** / **`/ideas pause`** flip the switch.
- The status line shows `💡 3 ideas (auto)` while ideas wait.

Pane keys (click the pane, or `ctrl+x tab`, then highlight a button): **h** keys menu · **s** send all · **p** pause/auto · **t** next type. Letter keys work when a button is highlighted, not while typing in the Idea box.

Note: Claude Code runs a typed `/idea` after the current turn ends, so for ideas *during* a build use the pane's Idea box, which queues instantly.

## herdr (optional)

Run Claude Code inside [herdr](https://herdr.dev)? The separate [idea-queue-herdr](../../herdr/idea-queue-herdr/) add-on gives you a **Ctrl+B, then i** popup to add ideas from anywhere, even mid-build, and a status pill in herdr's tab bar. The mod works fully without it.

## Good to know

- Waiting ideas live in the session: they survive the mod reloading, not closing the session.
- Ideas are sent as your own words, so Claude treats them like something you typed.
- On the Claude mobile app the pane lists and sends ideas; add them with `/idea` (the app draws no text fields yet).

## Develop

```sh
claude plugin validate plugins/idea-queue
claude plugin test plugins/idea-queue
```

To work on a copy and have it load in every session, point `CLAUDE_CODE_PLUGIN_DIRS` (in the `env` block of `~/.claude/settings.json`) at your folder; edits reload live.

MIT — BistroMathWorks.
