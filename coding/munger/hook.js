#!/usr/bin/env node
// Munger Stop hook — auto-fire the inversion review when a build turn completes.
//
// Fail-open everywhere: any uncertainty (no transcript, not a git repo, parse
// error) → allow the stop (exit 0). A hook bug must never trap the user.
//
// Loop prevention: Claude Code sets stop_hook_active=true on a stop that is
// itself a continuation triggered by a stop hook, so we bail on that. Belt-and-
// suspenders: if the last assistant message already mentions Munger, bail too.
// (stop_hook_active confirmed real in CC 2.1.195 — it's in cli.js's Zod schema.)
//
// Trigger: fires on EVIDENCE OF A BUILD ACTION this turn — a Bash tool_use
// running `git commit` / `git push` / `gh pr create` — not on prose like the
// word "done". Scoped to the current turn (everything since the last real user
// prompt) so a recap turn that merely mentions a past commit won't re-fire.
// Repo-gated: only inside a git repo.

const fs = require('fs')
const { execFileSync } = require('child_process')

const allow = () => process.exit(0) // let the stop proceed

let data
try {
  data = JSON.parse(fs.readFileSync(0, 'utf8'))
} catch {
  allow()
}

if (data.stop_hook_active) allow() // already a hook-induced continuation

const cwd = data.cwd || process.cwd()
try {
  execFileSync('git', ['rev-parse', '--is-inside-work-tree'], { cwd, stdio: 'ignore' })
} catch {
  allow() // Munger is for code/builds only
}

const tpath = data.transcript_path
if (!tpath || !fs.existsSync(tpath)) allow()

// A build action = a git-write SUBCOMMAND (git commit/push, gh pr create). Match
// the parsed subcommand, not the word anywhere — else `git log --grep=commit` and
// `git config push.default` false-fire. The binary must be the first token so
// `echo "git commit"` and `git status && echo commit` stay silent.
// ponytail: heuristic — misses (all rare + fail-safe, i.e. under-fire on a real
// commit, never over-fire): `sudo`/`FOO=bar` prefixes (binary isn't `git`); and
// space-separated arg-taking global opts like `git --git-dir /x commit` (the `=`
// form and `-C`/`-c` are handled). Upgrade path if it bites: enumerate the
// arg-taking globals or strip prefixes.
function isGitWrite(cmd) {
  if (!cmd) return false
  for (const seg of String(cmd).split(/\s*(?:&&|\|\||;|\||\n)\s*/)) {
    const toks = seg.trim().split(/\s+/)
    const bin = toks[0]
    if (bin !== 'git' && bin !== 'gh') continue
    // first 1-2 non-option tokens = subcommand; skip global opts (-C/-c take an arg)
    const sub = []
    for (let i = 1; i < toks.length && sub.length < 2; i++) {
      const t = toks[i]
      if (t === '-C' || t === '-c') i++ // consumes its argument
      else if (!t.startsWith('-')) sub.push(t)
    }
    if (bin === 'git' && (sub[0] === 'commit' || sub[0] === 'push')) return true
    if (bin === 'gh' && sub[0] === 'pr' && sub[1] === 'create') return true
  }
  return false
}

// Walk the transcript backwards: capture the most recent assistant text (loop
// guard) and detect a git-write in the current turn. Stop at the turn boundary
// — the last genuine user prompt (string content, or text blocks with no
// tool_result; tool_result entries are mid-turn, not a boundary).
let last = ''
let gitWrite = false
try {
  const lines = fs.readFileSync(tpath, 'utf8').trim().split('\n')
  for (let i = lines.length - 1; i >= 0; i--) {
    let o
    try {
      o = JSON.parse(lines[i])
    } catch {
      continue
    }
    if (o.type === 'user') {
      const c = o.message && o.message.content
      const isPrompt =
        typeof c === 'string' ||
        (Array.isArray(c) && c.some((b) => b && b.type === 'text') && !c.some((b) => b && b.type === 'tool_result'))
      if (isPrompt) break // reached the start of the current turn
      continue
    }
    if (o.type !== 'assistant') continue
    const c = o.message && o.message.content
    if (Array.isArray(c)) {
      if (!last) {
        const t = c.filter((b) => b.type === 'text').map((b) => b.text).join(' ')
        if (t) last = t
      }
      for (const b of c) if (b.type === 'tool_use' && b.name === 'Bash' && isGitWrite(b.input && b.input.command)) gitWrite = true
    } else if (typeof c === 'string' && !last) {
      last = c
    }
  }
} catch {
  allow()
}

if (/munger/i.test(last)) allow() // already ran, or we're discussing it
if (!gitWrite) allow() // no build action this turn

const reason =
  'MUNGER AUTO-REVIEW: this turn committed/pushed/opened a PR — a completed build. ' +
  'Before finishing, run the Munger inversion review. Invoke the `munger` skill if ' +
  'available, otherwise read and follow ~/.claude/skills/munger/SKILL.md. Invert the ' +
  'work you just completed: how could it fail, and how could it break the rest of the ' +
  'system? Verify at least one checkable claim empirically (run the command, do not ' +
  'assume). Fix CRITICAL/HIGH findings, then re-invert until a clean pass. Do not ' +
  'simply re-declare done.'

process.stdout.write(JSON.stringify({ decision: 'block', reason }))
process.exit(0)
