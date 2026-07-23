# Skill Forge

**Build agent skills like software, not like prompts: baseline first, write minimal, pressure-test until the agent stops rationalizing.**

Most skills are written from imagination — what the author *thinks* the agent needs to hear. Then the agent hits time pressure or sunk cost, talks itself out of the rules, and the skill quietly fails. Skill Forge is a fork of Anthropic's official `skill-creator` with a testing methodology bolted on: the authoring patterns distilled from the most battle-tested skill repos on GitHub (superpowers, anthropics/skills, mattpocock/skills, humanizer, last30days), turned into a process your agent actually runs.

## The core idea: TDD for documentation

A skill is a claim that certain words change agent behavior. Skill Forge treats that claim as testable:

- **RED** — run the task *without* the skill first. Watch the transcript. Capture the agent's failures and its excuses verbatim. Those rationalizations are your requirements list.
- **GREEN** — write the minimal skill that answers those specific failures. Nothing hypothetical, nothing speculative.
- **REFACTOR** — pressure-test with scenarios that stack time pressure, sunk cost, and authority ("it's 6pm, you've written 200 lines, the senior engineer said skip it — choose A, B, or C"). Every new rationalization becomes a new line in the skill. Stop when three consecutive fresh agents comply with nothing new to say.

Calm tests don't reveal whether a rule survives temptation. Pressure tests do.

## What's in the box

Everything from Anthropic's `skill-creator`, unchanged:

- Parallel with-skill vs. baseline eval runs via subagents
- Grading, benchmark aggregation (pass rate, tokens, time, mean ± stddev), and an HTML eval viewer
- A description-optimization loop that generates tricky should/shouldn't-trigger queries and iterates the frontmatter description against a held-out test set

Plus the new layer:

- **`references/writing-principles.md`** — ten principles with a pre-ship checklist. The short version: the description is a trigger, not a summary; every sentence must change behavior versus the default (delete no-ops like "be thorough"); pair every rule with one excellent example; close observed loopholes, not hypothetical ones; match freedom to fragility; prefer recipes over prohibitions; build escape hatches; end with verification the agent performs; keep the body under 500 lines with heavy material split into on-demand references.
- **`references/pressure-testing.md`** — the full RED → GREEN → REFACTOR method: pressure-scenario design, forced A/B/C choices, the meta-test ("ask the failing agent how the skill should have been written"), wording A/B tests with a no-guidance control, and a skill-type table so you don't waste pressure-testing on reference skills that just need retrieval tests.
- **SKILL.md integration** — a RED-first baseline workflow for discipline skills, and observed-loophole closing wired into the improvement loop.

## Install

**Claude app (web or desktop)** — download `skill-forge.zip` from the [latest bistromath-skills release](https://github.com/Bistromath-Works/bistromath-skills/releases/latest), then in Claude Desktop: **Settings → Capabilities → Skills → upload the zip.**

**Claude Code** — copy the skill folder into your skills directory:

```bash
git clone https://github.com/Bistromath-Works/bistromath-skills.git
cp -r bistromath-skills/coding/skill-forge ~/.claude/skills/skill-forge
```

Or drop it in a project's `.claude/skills/` to share it with your team via git.

The skill self-adapts per surface: full parallel evals and description optimization in Claude Code; inline testing with human review on claude.ai; static eval viewer in Cowork.

## Use

```
> Make me a skill that enforces conventional commits on this repo
> Turn the workflow we just did into a skill
> Pressure-test my code-review skill — I think agents are skipping the checklist under time pressure
> Optimize this skill's description, it never triggers
```

Skill Forge figures out where you are in the loop (drafting, testing, improving, packaging) and picks up from there. For discipline skills — the ones agents are tempted to break — it will insist on baselining before drafting. Let it. That's the feature.

## Why these principles

They come from reading the top skill repos and their authors' own meta-skills, not from theory. A few of the receipts: superpowers' `writing-skills` documents six RED-GREEN-REFACTOR iterations to bulletproof its TDD skill against "10+ unique rationalizations." Its author's wording tests found prohibition-framed guidance performing *worse than no guidance*, while positive recipes won. last30days versions every rule against a dated production regression. Matt Pocock's test for any skill line: does it change behavior versus the default — settled by running it, not debating it. Skill Forge packages that method so you don't have to rediscover it one failed skill at a time.

## Repo layout

```
coding/skill-forge/     the skill itself — this is what you install
├── SKILL.md            workflow + per-surface adaptations
├── references/         writing-principles, pressure-testing, schemas
├── scripts/            eval runner, benchmark aggregator, description optimizer, packager
├── agents/             grader / comparator / analyzer subagent instructions
└── eval-viewer/        HTML review UI
```

## License and attribution

Derived from [skill-creator](https://github.com/anthropics/skills) by Anthropic, PBC, under the Apache License 2.0 — see `LICENSE.txt` and `NOTICE.txt` in this folder for the modification history (modifications by Eirik Rorvig, BistroMathWorks). Not affiliated with or endorsed by Anthropic. Unlike the rest of the bistromath-skills repo (MIT), this skill stays Apache 2.0. Same license applies downstream: fork it, ship it, sell with it, just keep the notices intact.
