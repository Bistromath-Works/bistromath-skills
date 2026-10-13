# idea-queue-herdr — the idea queue, from anywhere in herdr

An add-on for people who run Claude Code inside [herdr](https://herdr.dev) and use the [idea-queue](../../plugins/idea-queue/) mod. Not on herdr? You don't need this; the mod works fully on its own.

It adds:

- **Ctrl+B, then i**: a small popup to add an idea to the Claude in the pane you're on, even while it's mid-build. Press 1–4 for the type, type the idea, Enter to queue. **Esc cancels at any point.**
- **Ctrl+B, then Shift+I**: opens the idea pane in that Claude.
- **A status pill** in herdr's tab bar whenever the focused pane runs Claude: `💡 idea: Ctrl+B i`, or `💡 3 ideas (auto) · Ctrl+B i` while ideas wait.

Both keys also show up in herdr's keybindings list (Ctrl+B, then ?), in the "custom" section at the bottom.

## Install

First install the mod in Claude Code, if you haven't:

```
/plugin install idea-queue --marketplace Bistromath-Works/bistromath-skills
```

Then, in a terminal:

```sh
curl -fsSL https://raw.githubusercontent.com/Bistromath-Works/bistromath-skills/main/herdr/idea-queue-herdr/install.sh | bash
```

The installer puts two small scripts in `~/.config/herdr/idea-queue/`, backs up your `~/.config/herdr/config.toml`, adds the two keys and the pill, checks the result with `herdr config check` (restoring the backup if herdr rejects it), and reloads herdr. Running it again updates without duplicating anything. It stops without changing anything if Ctrl+B i or Ctrl+B Shift+I is already bound to something else.

Needs herdr 0.8.2 or newer and `python3`.

## Uninstall

```sh
curl -fsSL https://raw.githubusercontent.com/Bistromath-Works/bistromath-skills/main/herdr/idea-queue-herdr/install.sh | bash -s -- --uninstall
```

Everything the installer adds to `config.toml` is marked `idea-queue-herdr`; uninstall removes exactly those lines and the scripts folder.

## How it connects

The popup drops a small JSON file in `~/.local/state/idea-queue/<pane>/`. The idea-queue mod, running in that pane, picks it up within a second, and writes the count the pill reads to `~/.local/state/idea-queue/<pane>.pill`. Nothing leaves your machine.

MIT — Bistromath Works.
