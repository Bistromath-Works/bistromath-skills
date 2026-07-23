---
name: munger
description: Post-build inversion review (Charlie Munger "invert, always invert"). Use after completing or shipping any build/code task — when declaring done, finished, committed, or a PR opened — to find how the work could fail and how it could break the rest of the system before yielding. Loop-capable: invert, fix CRITICAL/HIGH, re-invert until a clean pass.
---

# Munger — invert the build before you trust it

> "All I want to know is where I'm going to die, so I'll never go there." — Charlie Munger

You just declared something done. Done is a claim, not a fact. This skill turns
the claim upside down: instead of "is it right?", ask **"how would I guarantee
this fails, and how does it poison the rest of the system?"** Failure modes you
name now are the ones you don't get paged for later.

## When to run
After any build/code task you'd call finished: a feature, a fix, a refactor, a
migration, a PR. Auto-fired by the Stop hook on build-completion turns; also fine
to invoke manually as `/munger`.

Skip for: pure questions, throwaway one-liners, non-code chat. If nothing was
built, there's nothing to invert.

## The loop
Run up to **3 rounds**. Each round: invert → verify → fix CRITICAL/HIGH →
re-invert. **Stop when a round surfaces no CRITICAL or HIGH finding** (clean
pass), or after 3 rounds (report what remains). Never loop forever; never
rubber-stamp.

---

## Step 1 — State the claim
One or two lines: what was built, and what "done" is actually asserting.
Make the implicit guarantees explicit — "tests pass", "it builds", "the schema
migrated", "the endpoint is wired". Those assertions are what you'll attack.

## Step 2 — Invert
For the work just completed, force answers to: **how could this fail, and how
could it break the rest of the system?** Sweep these lenses (skip ones that
don't apply, add ones that do):

- **The claim is false.** Does "done" actually hold? Did the test/build/command
  you cited really pass, or did you assume it? (Step 3 settles this.)
- **Downstream contamination.** How does this change break the *next* piece, or
  something elsewhere that depends on it? New enum value, changed signature,
  shifted ID/label, altered shared constant.
- **Silent-failure channels.** Defaults, `catch`-and-swallow, empty-state
  fallbacks, `default:` switch arms — anything that turns a wrong input into a
  plausible-looking output with no error. New cases added later route here
  silently.
- **False confidence.** Green tests that *structurally cannot* catch the live
  failure class (e.g. a runtime test suite that never type-checks; a fake whose
  output you hand-wrote). Self-referential verification — you testing the thing
  you also wrote, against the prompt you also wrote.
- **Lifecycle, not demo path.** Does it hold under the full lifecycle — retries,
  re-runs, deletes, concurrent writers, a record withdrawn mid-flow — or only on
  the happy path you exercised?
- **Obligations with no enforcement.** Did you create a "keep these two in sync"
  / "remember to also update X" duty that nothing checks? It will drift.
- **Reversibility / blast radius.** If this is wrong in production, what's the
  damage and can it be undone? Weight findings on hard-to-reverse paths
  (money, data, auth, certified/published artifacts) harder.

## Step 3 — Verify one checkable claim empirically (the teeth)
Inversion that stays theoretical is weak. Each round, take at least one finding
or one "done" assertion and **run the command** — the test, the build, the
typecheck, the query, the grep. Prefer to attack your own most confident claim.
If the evidence contradicts what you said, that's the highest-value finding in
the round. Report the command and its real output.

## Step 4 — Rate and fix
For each finding:

```
[SEVERITY] <one-line failure mode> → <concrete fix>
```

- **CRITICAL** — data loss, security hole, wrong result on a certified/published
  path, or breaks the next build step.
- **HIGH** — silent-wrong-output channel, false-confidence gap, lifecycle break.
- **MED** — degraded quality, drift obligation, fragile coupling.
- **LOW** — cosmetic, easily caught later.

Fix CRITICAL and HIGH now (or, if out of scope, log them loudly as follow-ups —
never let "merged + green" imply "handled"). MED/LOW: list them, fix if cheap.

## Step 5 — Re-invert or finish
If you fixed anything CRITICAL/HIGH, run another round (the fix is new work — it
can fail too). If the round was clean, stop.

## Step 6 — Report
End with:

```
MUNGER — round N of ≤3
Verified: <command run → result>
Findings: <count by severity>
  [CRITICAL] ... → fixed / follow-up
  [HIGH] ... → fixed / follow-up
STATUS: CLEAN | CONCERNS-REMAIN
```

- **CLEAN** — a round found no CRITICAL/HIGH. Safe to yield.
- **CONCERNS-REMAIN** — 3 rounds hit, or findings deferred. List them; don't
  bury them.

---

## Anti-patterns (Munger on Munger)
- **Theater.** Listing generic risks ("might have edge cases") without naming a
  specific one in *this* diff. Every finding cites a file/line/command.
- **No teeth.** A round with zero empirical verification is not a round.
- **Rubber-stamp.** "Looks good, STATUS: CLEAN" on round 1 with no real attack.
  If you didn't try to break it, you didn't run Munger.
- **Infinite loop / scope creep.** Hard cap 3 rounds; fix what you found, don't
  gold-plate.
- **Self-deception via your own tests.** A passing test you wrote against a fake
  you wrote is not independent evidence. Say so when that's all you have.
