# BistroMathWorks Thinking Tools

Six skills for stress-testing plans, decisions, code, and deals. Install the plugin and they all load — no downloading individual skills.

## Skills

| Skill | Invoke with | What it does |
|-------|-------------|--------------|
| **grill-me** | "grill me", "poke holes in this" | Relentless adversarial interview to stress-test a plan or design |
| **grill-with-docs** | "grill me with docs" | Grill-me plus domain awareness — challenges plans against CONTEXT.md, ADRs, glossary |
| **ideation-partner** | "help me ideate", "explore this idea" | Interview-based ideation for business and creative problems |
| **never-lose** | "invert this", "never lose", "run the Munger lens" | Adversarial inversion interview for business decisions — what would GUARANTEE failure |
| **munger** | "/munger", or auto-fires after a build turn | Post-build inversion review: invert → verify → fix → re-invert until clean |
| **doolittle** | "doolittle", "prep me for", "my deal is wobbling" | Deal-side copilot for real estate agents: prep, live triage, debrief |

## The munger Stop hook

This plugin wires munger's auto-fire Stop hook (Claude Code): after a turn that commits, pushes, or opens a PR, the inversion review fires automatically. It is repo-gated, loop-safe, and fail-open — it never traps a session. Harmless outside Claude Code.


## Credits

**grill-me** and **grill-with-docs** were written by [Matt Pocock](https://github.com/mattpocock). Bundled here with attribution; all credit for those two skills goes to him.

## Install

From the marketplace:

```
/plugin marketplace add Bistromath-Works/bistromath-skills
/plugin install bistromath-thinking-tools@bistromath-skills
```

Or install the `.plugin` file directly in Cowork.
