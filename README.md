# BistroMathWorks Skills

Agent skills for Claude, built by [BistroMathWorks](https://github.com/Bistromath-Works). Each skill is a self-contained folder with a `SKILL.md` (instructions + trigger description) and optional supporting files the agent loads on demand.

The repo is split by where the skill runs:

- **`coding/`** — skills for Claude Code and agentic engineering workflows (hooks, reviews, build tooling)
- **`general/`** — skills for Claude anywhere (claude.ai, Claude Desktop / Cowork, Claude Code) covering business, decisions, and everything that isn't code

## Skills

| Skill | Category | What it does |
|---|---|---|
| [munger](coding/munger/) | coding | Post-build inversion review — "how would I guarantee this fails?" — with an auto-firing Stop hook for Claude Code |
| [never-lose](general/never-lose/) | general | Adversarial inversion interview for business decisions, modeled on Charlie Munger's "invert, always invert" |

Yes, both are Munger. Inversion works on code and on business decisions; the two skills are siblings — one grills the build, the other grills the builder.

---

## munger — invert the build

> "All I want to know is where I'm going to die, so I'll never go there." — Charlie Munger

You just declared something done. Done is a claim, not a fact. Munger turns the claim upside down: instead of "is it right?", it asks **"how would I guarantee this fails, and how does it poison the rest of the system?"**

Runs up to 3 rounds of invert → verify → fix CRITICAL/HIGH → re-invert, stopping on a clean pass. Every round must verify at least one checkable claim empirically — inversion that stays theoretical is rubber-stamping. Ships with a zero-dependency Node Stop hook that auto-fires the review when a turn actually completes a build (`git commit`, `git push`, `gh pr create`), plus a hermetic test suite.

Full docs, hook wiring, and tests: [coding/munger/README.md](coding/munger/README.md)

---

## never-lose — the inversion grill

Most business advice asks "how do I win?" This skill asks the more useful question: **what would guarantee I lose?** — then removes it.

It runs an adversarial interview against any business commitment: a hire, a client, a partner, a channel, an expansion, a pricing change, or a post-mortem on something that already went wrong. The premise is Munger's: in a relationship-and-reputation business the math is asymmetric — downside is near unbounded, upside compounds slowly — so the highest-leverage move is to find the fatal failure mode first.

### What a session looks like

1. **Calibrates the mode.** Socratic (interrogates you toward the insight) or directive (names the failure modes and a path forward). It reads your replies for the tell and asks if unclear.
2. **Opens with the hardest question** where evidence is freshest: "What would *guarantee* this fails?" — and rejects comfortable answers. "The market collapses" is an act of God. "I stop working hard" is a sermon. Both are alibis; it re-asks restricted to mechanisms you control.
3. **Names the biases that produced past mistakes** — incentive-caused bias, liking, authority, sunk cost — because if you can't name what produced the error, you'll repeat it with better vocabulary.
4. **Demands arithmetic.** When you answer a numbers question with an anecdote, it asks again. The gap between what you recite and what your ledger says is usually the finding of the session.
5. **Converts insight into artifacts.** Hiring screens with disqualifiers first, pre-committed kill tripwires with dates, detection tests runnable *before* commitment. Insight that stays in conversation is entertainment.
6. **Closes with homework** in numbers and names: figures to pull, calls to make, documents to draft, by when.

### Triggers

- "Grill me on this decision"
- "Invert this" / "Run the Munger lens"
- "What would guarantee this fails?"
- "Poke holes in this business plan / hire / deal"
- "Make sure this never happens again" (post-mortems)

### Structure

```
general/never-lose/
  SKILL.md              ← trigger description + interview ground rules, core moves, session shape
  references/
    moves.md            ← full move library with worked examples, loaded on demand
```

---

## Installation

**Claude Code:** copy the skill folder into your skills directory:

```bash
git clone https://github.com/Bistromath-Works/bistromath-skills.git
cp -r bistromath-skills/general/never-lose ~/.claude/skills/never-lose
cp -r bistromath-skills/coding/munger ~/.claude/skills/munger
```

Or for a single project, place the folder in `.claude/skills/<name>/` inside the repo. The munger Stop hook needs one extra wiring step — see [coding/munger/README.md](coding/munger/README.md#install).

**Claude.ai / Claude Desktop (Cowork):** zip the skill folder and upload it as a skill under Settings → Capabilities.

## License

[MIT](LICENSE)
