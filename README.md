# BistroMathWorks Skills

Agent skills for Claude, built by [BistroMathWorks](https://github.com/Bistromath-Works). Each skill is a self-contained folder with a `SKILL.md` (instructions + trigger description) and optional `references/` files the agent loads on demand.

## Skills

| Skill | What it does |
|---|---|
| [never-lose](never-lose/) | Adversarial inversion interview for business decisions, modeled on Charlie Munger's "invert, always invert" |

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

Say any of these to Claude once the skill is installed:

- "Grill me on this decision"
- "Invert this" / "Run the Munger lens"
- "What would guarantee this fails?"
- "Poke holes in this business plan / hire / deal"
- "Make sure this never happens again" (post-mortems)

### Installation

**Claude Code:** copy the skill folder into your skills directory:

```bash
git clone https://github.com/Bistromath-Works/bistromath-skills.git
cp -r bistromath-skills/never-lose ~/.claude/skills/never-lose
```

Or for a single project, place it in `.claude/skills/never-lose/` inside the repo.

**Claude.ai / Claude Desktop (Cowork):** zip the `never-lose` folder and upload it as a skill under Settings → Capabilities, or use the skill-creator flow to import it.

### Structure

```
never-lose/
  SKILL.md              ← trigger description + interview ground rules, core moves, session shape
  references/
    moves.md            ← full move library with worked examples, loaded on demand
```

### Design notes

- The skill interviews; it doesn't lecture. Turns end on one or two pointed questions, never a barrage.
- It grounds in your actual history when a knowledge base is available (Obsidian vault, CRM data, decision logs) rather than generic business wisdom.
- Inversion isn't only defense — "what kills this?" routinely surfaces unexploited structural advantages (move 7, "find the hidden bridge").
- Voice: blunt, concrete, witty, declarative. Never coddles, never humiliates.

## License

MIT
