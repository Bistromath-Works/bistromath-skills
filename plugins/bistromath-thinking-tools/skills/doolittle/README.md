# Doolittle

> "The difference between a lady and a flower girl is not how she behaves, but how she's treated." — Eliza Doolittle, *Pygmalion*

**Doolittle keeps your deals alive.** A deal-side copilot for real estate agents: it preps you before hard conversations, walks you through live deal moments, debriefs you afterward against a veteran lender's standard, and quietly compounds everything you learn in a personal curriculum file.

Most deals don't die over the house. They die over the money: hearsay repeated as fact, promises made on someone else's capacity, panic met with panic, the question nobody asked. Every one of those is preventable judgment — and judgment can be coached.

## What's in here

| File | What it is |
|------|------------|
| `SKILL.md` | The copilot — four modes, tone system, disclaimer, curriculum protocol. |
| `standards-packs/financing-literacy.md` | The v1 standard: 7 doctrines, 8 drills, and a 5-axis grading rubric, extracted from 16 years of lending. |
| `templates/curriculum-template.md` | The per-agent curriculum file Doolittle creates and maintains. |

## The four modes

| Mode | When | What you get |
|------|------|--------------|
| **Prep me** | Before a client or agent conversation | A one-page brief: triggers to listen for, questions to ask, what to verify first, the one promise not to make |
| **Help me now** | Live deal moment — scared buyer, surprise at underwriting, offer decision | Known-vs-heard triage, what must be verified before anyone acts, the conversation frame, when to stop and call your lender |
| **Debrief** | After the fact | Your real rep graded pass / partial / fail against the standard, with the one-sentence correction — logged |
| **Drill** | Between deals | Scenario reps that withhold a critical fact you only find by asking. Failed lessons repeat until passed |

## How it grades

Not on your answers — on **the questions you asked before answering**. The bar throughout: *the connector operating at full power — fluent enough to re-explain, humble enough not to originate.* The first commandment: better no advice than bad advice.

Every consult — prep, live, debrief, drill — logs to your `doolittle-curriculum.md`, so corrections compound instead of evaporating. Coaching is the exhaust of the help, not a toll at the door.

## Tone

Everyone starts in **Coach**: demanding but warm. **Higgins mode** (blunt, no cushioning) is strictly opt-in — earn five reps or ask for it. Even Higgins punches the rep, never the person.

## The name

Weizenbaum named ELIZA — the first chatbot, 1966 — after Eliza Doolittle, because it could be taught to speak better. Sixty years later, her namesake teaches back: polish doesn't come from exposure, it comes from lessons graded against a standard. Higgins lives inside as the blunt tone. The flower shop you actually came for is the deal that closes.

## Disclaimer

Doolittle is a training and preparation tool, not financial, legal, tax, or lending advice, and nothing in it is a commitment to lend. Agents remain solely responsible for their professional advice, actions, and license compliance. Deal-specific facts always get verified with the licensed professionals on the transaction. The skill shows this disclaimer at first run and requires acknowledgment.

## Install

**Claude.ai / Claude Desktop (Cowork):** zip this folder and upload it under Settings → Capabilities (or install a released `.skill` file directly).

**Claude Code:**

```bash
cp -r bistromath-skills/real-estate/doolittle ~/.claude/skills/doolittle
```

Cowork is the intended home — Doolittle needs file access to maintain your curriculum across sessions. In claude.ai it runs as a single-session copilot and hands you the curriculum to carry forward yourself.
