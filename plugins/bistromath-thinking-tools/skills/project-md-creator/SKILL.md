---
name: project-md-creator
description: >
  Use whenever a CLAUDE.md (or project.md) is involved: editing, trimming, auditing, or fixing
  an existing one, or writing one for a new or existing project. Triggers include "clean up my
  CLAUDE.md", "my CLAUDE.md is too long", "Claude keeps ignoring my CLAUDE.md", "streamline
  this", "make a CLAUDE.md", "set up Claude Code for this repo", "Claude keeps making the same
  mistake", or pasting a CLAUDE.md and asking for feedback. Works in Claude Code, Cowork, and
  chat. Do NOT use for README files, general docs, docstrings, or Claude skills (SKILL.md).
---

# CLAUDE.md Editor

CLAUDE.md loads into every session. Each line costs attention, and past ~100 lines Claude starts
missing the lines that matter. Your job is to make the file **thin**: only what Claude would get
wrong without it.

**The test for every line:** "Would Claude make a mistake without this?" If no, it goes.

## Pick the mode

- **A CLAUDE.md already exists** (in the repo, pasted, or attached) → Edit mode. This is the
  default whenever a file exists, even if the user says "make me a CLAUDE.md."
- **No CLAUDE.md yet** → Create mode.

## Edit mode

You are an editor, not an author. The output contains only content from the original, cut or
tightened. New ideas go in a suggestion list after the file, never into it.

1. **Read the whole file and count lines.** If the project is accessible, glance at config files
   (package.json, pyproject.toml, tsconfig, Makefile) so you can tell what is discoverable.
2. **Sort every line into keep, cut, or tighten:**
   - Cut if Claude can see it: tech stack, folder trees, scripts already in package.json, lint
     rules already in config.
   - Cut if it's generic: "write tests", "use meaningful names", "avoid `any`", "follow PEP 8".
     Keep only rules a new developer on *this* project would find surprising.
   - Cut if it's vague: "write clean code", "follow best practices".
   - Cut duplicates. Merge lines that say the same thing twice.
   - Tighten wordy lines to one line. Keep the reasoning when it's what prevents the mistake
     ("`make dev`, not `npm run dev`: the Makefile sets env vars").
   - Flag, don't keep, "always run X before commit" rules: those belong in a hook.
3. **Hit the limit.** Hard cap 100 lines; most good files land at 30 to 60. If real, specific
   rules still push past 100, move a whole topic to `.claude/rules/<topic>.md` and leave a
   one-line pointer. Moving is for keepers that crowd the file, not a place to park cuts.
4. **Show before writing.** Present: line count before → after, a short list of what was cut
   grouped by reason, then the full new file. In Claude Code or Cowork, wait for approval
   before overwriting.
5. **Suggestions (optional, max 3).** Things that seem missing, as questions. Never added to
   the file unless the user says yes.

Example of tightening:
- Before: "When you are writing database code, please remember that we do not use an ORM in
  this project and instead all queries should be written using raw SQL through our helpers."
- After: "No ORM. Raw SQL via `src/db/query.ts` helpers."

## Create mode

1. **Gather the non-discoverable facts.** With file access, scan configs and top-level folders,
   then confirm findings in one short message. Without access, ask in one message: what it is,
   exact run/build/test/lint commands, conventions that break the norm, and mistakes that would
   be expensive. In Claude Code on a large repo, `/init` is a fine starting draft to then trim
   with Edit mode.
2. **Write only these sections, and only when they have something true to say:**

```markdown
# Project Name
One sentence: what it is and who it's for.

## Commands
Only commands Claude can't guess.

## Architecture
Only non-obvious structure and how pieces connect.

## Conventions
Only rules that deviate from language or framework defaults.

## Gotchas
Only real landmines.
```

3. Run the Edit mode cuts on your own draft before showing it. Show only the final version.

## Saving

With file access, write `CLAUDE.md` to the project root (plus any `.claude/rules/` files).
In chat, give the file in one code block to save as `CLAUDE.md` and commit.

## Before you finish, check

- [ ] Line count is under 100, and you stated before → after.
- [ ] Edit mode: every line in the output traces to a line in the original.
- [ ] No section exists just to exist (no empty or padded Gotchas).
- [ ] Nothing left that Claude could learn from `ls` or a config file.

For the reasoning behind these rules and a full good/bad example, read
`references/philosophy.md` only if the user asks why, or a cut decision is genuinely unclear.
