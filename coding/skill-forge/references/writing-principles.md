# Ten Principles for Writing Great Skills

Distilled from the highest-performing skill repos on GitHub (superpowers, anthropics/skills, mattpocock/skills, gstack, humanizer, last30days) and their authors' stated methods. Read this before drafting any SKILL.md body. Each principle is a test to run against your draft, not a section to add.

## 1. The description is a trigger, not a summary

Say when to use the skill; say little about what it does. When the model thinks it knows what a skill does from the description, it skips reading the body and wings it. Agents also undertrigger, so be pushy: list the concrete phrases, file types, and situations that should fire it, plus an explicit "Do NOT use for..." boundary.

- Weak: `Helps write good commit messages.`
- Strong: `Use when committing, writing commit messages, or the user says "commit this", "clean up my commits", or finishes a change. Do NOT use for PR descriptions or changelogs.`

## 2. Baseline before writing

Run the task without the skill first and watch what actually goes wrong. Write the skill to fix those observed failures, and only those. A skill written from imagination documents problems that don't exist and misses the ones that do. If you didn't watch an agent fail without the skill, you don't know if the skill teaches the right thing. Full method: `pressure-testing.md`.

## 3. Every sentence must change behavior

"Be thorough", "make it detailed", "use best practices" are no-ops: the model already tries to do these. For each line ask: does this change what the agent does versus its default? Settle disputes by running the skill, not by debate. Prefer one bolded pretrained concept over a paragraph: "fast, deterministic, low-overhead" compresses to *tight*; "a loop you believe in" compresses to *red*. The model already knows these words deeply; lean on them.

## 4. Pair every rule with one excellent example

One before/after pair per rule; a great example beats five mediocre ones, and don't dilute by re-implementing in multiple languages. For rules with false-positive risk, add a negative example ("what NOT to flag") so the agent learns the boundary, not just the direction.

```markdown
**Rule:** Cite file and line, not vibes.
- Bad: "There may be an issue in the auth flow."
- Good: "auth.ts:47 returns undefined when the token header is missing."
```

## 5. Close the loopholes you observed

Agents negotiate with rules under pressure (time, sunk cost, "just this once"). For rules that testing showed the agent rationalizing around, name the excuse and answer it:

```markdown
| Excuse | Reality |
|---|---|
| "The change is trivial, no test needed" | Trivial changes break builds too. Write the test. |
```

Only add these for rationalizations you actually observed. Anticipating hypothetical excuses bloats the skill (see #3).

## 6. Match freedom to fragility

Judgment-heavy work gets short prose heuristics and trust. Fragile, exact-sequence work gets scripts and checklists. Think of the agent walking a path: an open field needs a compass heading; a narrow bridge with cliffs needs guardrails and exact steps. Signal for a script: if test runs show the agent writing the same helper from scratch each time, write it once, put it in `scripts/`, and say whether to run it or read it.

## 7. Prefer positive instruction over prohibition

Wording tests have shown prohibition-framed guidance performing worse than no guidance, while a positive recipe of the same rule performed best: a recipe leaves nothing to negotiate, and "don't think of an elephant" names the elephant. Reserve hard NO/STOP language for the few rules where testing proved the model will rationalize, and give each hard rule its reason so it survives the model's judgment instead of fighting it.

- Weak: "Don't write vague summaries."
- Strong: "State the finding as `file:line` plus the failing input."

## 8. Build in escape hatches

State when NOT to use the skill, when to break its own rules (safety, irreversible actions), and when to stop and ask the human. A skill without an off-ramp gets uninstalled the first time it misfires. Route true exceptions to the user: "No exceptions without asking first" beats silently bending the rule.

## 9. End with verification the agent must perform

Close with a self-check, not a hope: a short checklist the agent converts to todos, a scan of its own output before emitting ("check the last 15 lines for X; if found, delete"), or rendered-output inspection for visual deliverables. Claims of completion require fresh evidence.

## 10. Budget tokens like a public good

SKILL.md body under 500 lines; the frequently-loaded parts as short as possible. Split heavy material into `references/` loaded on demand, one level deep, with a clear pointer for when to read each. Scripts execute without loading. Rules the agent must never miss go near the top: in long files, agents demonstrably fail to reach rules buried past ~1000 lines.

---

## Quick self-review before shipping a draft

- [ ] Description lists trigger phrases and a "not for" boundary (#1)
- [ ] Every rule traces to an observed failure, not imagination (#2, #5)
- [ ] No no-op sentences survive (#3)
- [ ] Each rule has one strong example; risky rules have a negative example (#4)
- [ ] Freedom matches fragility; repeated helper work became a script (#6)
- [ ] Rules are recipes, not prohibitions, except proven-necessary gates (#7)
- [ ] "When not to use" and human-escalation paths exist (#8)
- [ ] The skill ends with a self-check the agent performs (#9)
- [ ] Body <500 lines; heavy material in references/ with pointers (#10)
