# for-you-herdr — see what Claude needs from you, in herdr's tab bar

An add-on for people who run Claude Code inside [herdr](https://herdr.dev) and use the [for-you](../../plugins/for-you/) mod. Not on herdr? You don't need this; the mod works fully on its own.

It adds **a status pill** to herdr's tab bar while the focused pane runs Claude and tasks are waiting on you: `📋 2 for you`, or `📋 2 for you · 1 blocking` when Claude is stopped until you act. Nothing shows when the list is empty.

## Install

First install the mod in Claude Code, if you haven't:

```
/plugin install for-you --marketplace Bistromath-Works/bistromath-skills
```

Then, in a terminal:

```sh
curl -fsSL https://raw.githubusercontent.com/Bistromath-Works/bistromath-skills/main/herdr/for-you-herdr/install.sh | bash
```

The installer puts one small script in `~/.config/herdr/for-you/` and backs up your `~/.config/herdr/config.toml`. It then adds the pill and checks the result with `herdr config check`. If herdr rejects it, the installer restores the backup; otherwise it reloads herdr. Running it again updates without duplicating anything.

Needs herdr 0.8.2 or newer.

## Uninstall

```sh
curl -fsSL https://raw.githubusercontent.com/Bistromath-Works/bistromath-skills/main/herdr/for-you-herdr/install.sh | bash -s -- --uninstall
```

Everything the installer adds to `config.toml` is marked `for-you-herdr`; uninstall removes exactly those lines and the script folder.

## How it connects

Inside herdr, the mod writes a one-line file, `~/.local/state/for-you/<pane id>.pill`, holding the open and blocking counts. herdr runs `for-you-pill.sh` every 2 seconds. The script checks with `herdr pane get` that the focused pane runs Claude, then prints the pill from that file.
