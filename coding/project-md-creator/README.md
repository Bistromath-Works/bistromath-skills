# project-md-creator

> "Would Claude make a mistake without this?" If no, the line goes.

Writes and edits **CLAUDE.md** files that stay thin. CLAUDE.md loads into every Claude Code session, and every line spends attention. Past roughly 100 lines, the rules that matter get buried and Claude starts missing them. This skill keeps only what Claude would get wrong without being told: the places where your project is weird.

Works in Claude Code, Cowork, and chat.

## Two modes

**Edit mode** (default whenever a CLAUDE.md exists, even if you ask it to "make one"):

1. Reads the whole file, counts lines, and glances at config files to see what's already discoverable.
2. Sorts every line into keep, cut, or tighten:
   - **Cut** what Claude can see (tech stack, folder trees, package.json scripts, lint config).
   - **Cut** generic advice ("write tests", "use meaningful names") and vague advice ("follow best practices").
   - **Cut** duplicates.
   - **Tighten** wordy lines to one, keeping the *why* when the why prevents the mistake.
   - **Flag** "always run X before commit" rules as hook candidates.
3. Enforces a hard cap of 100 lines (most good files land at 30 to 60). Overflow that is still real moves to `.claude/rules/<topic>.md` with a one-line pointer.
4. Shows before → after line count, what was cut and why, and the full new file. Waits for approval before overwriting.
5. Offers at most 3 suggestions for missing content, as questions. Never adds them unasked.

It is an editor, not an author: every line in the output traces back to a line in the original.

**Create mode** (no CLAUDE.md yet): scans the repo (or asks, in chat) for the non-discoverable facts, then writes only the sections that have something true to say: Commands, Architecture, Conventions, Gotchas. It runs the Edit mode cuts on its own draft before showing it.

## Triggers

- "Clean up my CLAUDE.md" / "My CLAUDE.md is too long"
- "Claude keeps ignoring my CLAUDE.md"
- "Make a CLAUDE.md" / "Set up Claude Code for this repo"
- "Claude keeps making the same mistake"
- Pasting a CLAUDE.md and asking for feedback

Not for READMEs, general docs, docstrings, or SKILL.md files.

## Structure

```
coding/project-md-creator/
  SKILL.md              ← trigger description, Edit and Create modes, finish checklist
  references/
    philosophy.md       ← the reasoning (minimalism, institutional memory, rules routing,
                          hooks vs. CLAUDE.md) and a full good/bad example, loaded only when
                          the user asks why or a cut is genuinely unclear
```

## Install

**Claude Code:**

```bash
cp -r bistromath-skills/coding/project-md-creator ~/.claude/skills/project-md-creator
```

**Claude Desktop / Cowork:** download `project-md-creator.zip` from the [latest release](https://github.com/Bistromath-Works/bistromath-skills/releases/latest) and upload it under **Settings → Capabilities → Skills**.
