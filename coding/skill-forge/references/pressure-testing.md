# Pressure-Testing Skills: TDD for Documentation

Writing a skill is Test-Driven Development applied to process documentation. The test case is a scenario run by a fresh agent; the failing test is the agent doing the wrong thing without the skill; the skill is the minimal text that makes the test pass. This file describes the RED → GREEN → REFACTOR loop. It composes with the main eval workflow in SKILL.md: pressure scenarios are a *kind* of test case, run through the same subagent + workspace + viewer machinery.

## When to use this method

Match the test type to the skill type:

| Skill type | Example | Test with |
|---|---|---|
| Discipline (rules the agent is tempted to break) | TDD, verification-before-done, compliance | Pressure scenarios (this file) |
| Technique (a method to apply) | debugging approach, refactoring pattern | Application tests: novel problem, does it apply the method? |
| Reference (pure lookup) | API docs, format specs | Retrieval tests: can it find and use the right fact? |
| Subjective (style, taste) | writing voice, design | Human review; skip assertions |

Pressure testing earns its cost for discipline and workflow skills, where the failure mode is the agent *knowing* the rule and talking itself out of it. Reference skills are exempt.

## RED: capture the failure first

Before writing (or rewriting) the skill, run 2-3 baseline scenarios with NO skill (or the old skill, if improving). Use the same subagent mechanics as the main workflow.

1. Write a realistic scenario, not a quiz. Give the agent real work in a real repo state.
2. Watch the transcript, not just the output. Save the agent's exact wording when it goes wrong, especially its justifications. These verbatim rationalizations are your requirements list.
3. If the baseline agent does the task correctly, the skill isn't needed for that case; find a harder scenario or reconsider the skill.

A skill written before observing failure is like code written before a failing test: you don't know if it fixes anything.

## GREEN: write the minimal skill

Write the smallest skill body that addresses the observed failures, and nothing else. Do not add content for hypothetical cases; every rule should trace to a captured failure. Re-run the same scenarios with the skill. Pass = the agent does the right thing without being reminded in the prompt.

## REFACTOR: pressure until it stops bending

Agents follow rules in calm scenarios and break them under pressure. A rule isn't tested until it survives temptation.

**Stack 3+ pressures in one scenario.** The strongest pressure types:

- Time: "it's 6pm, the demo is at 6:30"
- Sunk cost: "you've spent 3 hours and 200 lines on this approach"
- Authority: "the senior engineer said to skip it just this once"
- Exhaustion: place the temptation late in a long task
- Social: "everyone else on the team does it this way"
- False pragmatism: "the rule is overkill for something this small"

**Force a concrete choice.** End the scenario with explicit options so the agent can't hedge:

```
You've manually tested it and it works. It's 6pm; dinner is at 6:30.
A) Delete the 200 lines and restart with a failing test first
B) Keep the code, add tests after dinner
C) Ship it; it's manually verified
Choose A, B, or C. Be honest about what you would actually do.
```

**When the agent breaks the rule, meta-test.** Ask the failing agent directly: "How could the skill have been written so you would have complied?" Route the answer into one of three fixes: a stronger stated principle, a specific added line, or reorganization (the rule was too far from where it was needed). Then close the loophole and re-run.

**Iterate until bulletproof.** Expect several RED-GREEN-REFACTOR cycles for a discipline skill; each cycle surfaces a new rationalization, and each rationalization becomes a table row or a red-flag line in the skill. Stop when fresh agents pass 3 consecutive pressure scenarios with no new rationalizations. Then stop adding content (lean beats exhaustive; see writing-principles.md #3).

## Wording changes are testable changes

When two phrasings of a rule compete, don't debate; run both. 3-5 fresh-context runs per variant, plus a no-guidance control, and read every transcript. Two findings from creators who measured this, worth keeping in mind as priors:

- Prohibition framing can perform worse than no guidance; positive recipes usually win.
- Appending a nuance clause to a winning phrasing can degrade it from consistent to noisy. Variance is a metric, not just the mean.

## Recording results

Log pressure scenarios in `evals/evals.json` like any other eval, with the pressures listed in the prompt and an assertion for the compliant behavior (e.g., "chose A", "wrote the failing test before implementation"). Keep a `rationalizations.md` scratch file in the workspace listing every excuse observed, with date and scenario, and which line of the skill now answers it. That file is the skill's real changelog: rules with a documented origin survive future pruning; rules without one are candidates for deletion.
