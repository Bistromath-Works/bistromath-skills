# CLAUDE.md Philosophy

Core principles from the people who build Claude Code, synthesized for writing excellent CLAUDE.md
files.

---

## The minimalism principle (Pedram Navid)

> "The only lines that matter are the ones where your project is weird and you know it."
> "Brother, Claude can see the tsconfig.json. You wrote 200 lines describing your file tree to
> an agent that can do `ls`."

Claude Code can read your code, run commands, and inspect your config files. Don't tell it things
it can discover. The CLAUDE.md is for the delta between "what a skilled developer would assume"
and "what is actually true about this specific project."

**The only question that matters for each line:**
"Would Claude make a mistake without this?"
If no — if it's just good practice, a language convention, or something visible in the code — cut
it. If yes — if this is genuinely non-obvious or project-specific — keep it.

**Start with nothing.** Don't try to write a comprehensive CLAUDE.md upfront. Start minimal.
Watch what Claude gets wrong. Add those corrections. That's your CLAUDE.md. (Pedram's actual
advice: "start with nothing. wait for claude to do something wrong. tell claude to remember to not
do that. that's your CLAUDE.md.")

---

## The institutional memory model (Boris Cherny)

Claude Code is powerful but amnesiac by default. CLAUDE.md is its external memory. Boris Cherny's
team treats it as compound knowledge:

1. Claude makes a mistake
2. The team adds a rule to CLAUDE.md
3. Every future session — for the whole team — gets that rule for free

This only works if CLAUDE.md lives in git. Check it in. Update it every time Claude makes a
mistake. Code reviews at Anthropic include: "Update CLAUDE.md so Claude doesn't make that mistake
again." Over weeks, the file gets smarter. Over months, it's institutional memory.

Boris's personal setup: "surprisingly vanilla." He doesn't over-engineer. Start simple; add only
what breaks.

---

## What to include (and what to skip)

**Include:**
- Exact commands Claude can't guess (build, test, lint, type-check, deploy)
- Folder structure that's non-obvious or non-standard
- Conventions that deviate from language/framework defaults
- Things Claude has gotten wrong in this project or similar ones
- Known footguns and landmines

**Skip:**
- Standard language best practices Claude already knows
- Things visible in config files (tsconfig, eslint, package.json scripts)
- Anything Claude could discover by reading the code
- Long explanations or tutorials
- File-by-file descriptions of the codebase
- Generic reminders ("write clean code", "add tests")

---

## The routing pattern for scale

**Hard limit: 100 lines.** Beyond that, critical rules get buried and Claude starts ignoring the
file. Monolithic CLAUDE.md files grow. What starts at 30 lines hits 400 as you add a rule for
every mistake. At that size, Claude starts ignoring the file because important rules get buried.

The fix: keep CLAUDE.md short and delegate to `.claude/rules/`:

```
.claude/
  rules/
    architecture.md     ← system design patterns
    conventions.md      ← coding standards
    api.md              ← external service contracts
    testing.md          ← test patterns
```

Each file covers one topic. Rules in `.claude/rules/` can be path-scoped with YAML frontmatter:

```yaml
---
paths:
  - "src/api/**/*.ts"
---
```

This loads backend rules only when Claude is working in `src/api/`. The main CLAUDE.md stays
short; the detailed knowledge loads only when relevant.

---

## Hooks vs. CLAUDE.md (Dickson Tsai)

Not everything belongs in CLAUDE.md. Some behaviors should be hooks instead:

- **CLAUDE.md** → context and conventions (things Claude should know)
- **Hooks** → deterministic behaviors that must always happen (pre-commit checks, linting runs,
  format-on-save, guardrails)

If a rule in your CLAUDE.md is really "always run X before committing" — that's a hook, not
a note. Move it. Hooks fire reliably; CLAUDE.md instructions can get lost in long sessions.

---

## What a great CLAUDE.md actually looks like

Short. Concrete. Project-specific. Reads like someone handing off institutional knowledge before
going on vacation, not like documentation written to impress.

**Good example:**
```markdown
# Acme API

Internal service — processes webhook events from Stripe and syncs to our Postgres DB.

## Commands
- Dev: `make dev` (not `npm run dev` — the Makefile sets required env vars)
- Test: `make test` — uses a test DB, never the prod connection string
- Migrations: `make migrate` before running tests after schema changes

## Architecture
- All business logic lives in `src/services/`, not in route handlers
- Route handlers are thin: validate input, call service, return response
- `src/jobs/` contains background job handlers — these run on a separate process

## Conventions
- No ORMs. Raw SQL via `src/db/query.ts` helpers
- All timestamps are Unix epoch integers, not ISO strings
- Service functions return `Result<T, AppError>` — never throw

## Gotchas
- The `userId` in webhooks is Stripe's ID, not ours. Map via `src/db/customers.ts`
- Integration tests use `TEST_DB_URL` — make sure it's set before running
```

**Bad example (bloated):**
```markdown
# Acme API

This is the backend API for Acme. It is built with Node.js and TypeScript and uses Express
for routing. The project follows MVC architecture. We use Postgres for our database.

## Code Style
- Use TypeScript
- Use async/await instead of callbacks
- Write tests for your code
- Use meaningful variable names
- Follow the SOLID principles
- Don't use `any` types
- Add comments to complex functions

## Folder Structure
- `src/` - Source code
  - `routes/` - Route handlers
  - `services/` - Business logic
  - `models/` - Data models
  - `utils/` - Utility functions
- `tests/` - Test files
- `migrations/` - Database migrations
...
```

The second version has 200+ lines of things Claude either already knows or can read from the
code. The first version has only what Claude wouldn't know — and it fits on one screen.
