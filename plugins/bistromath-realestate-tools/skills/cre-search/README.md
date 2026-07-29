# cre-search

Search **Crexi, LoopNet, and PropertyDrive** in one shot from Claude Code or Cowork. Give it criteria — price range, property type, market, cap rate, NNN vs gross — and it drives your own Chrome through all three sites, merges the results, dedupes cross-listed properties, and hands back one table with source links.

Built for commercial brokers and investors who are tired of running the same search on three websites.

## Requirements

- **Claude in Chrome** browser extension, connected to the Claude Code or Cowork session
- Site permissions granted in the extension for `crexi.com`, `loopnet.com`, and `propertydrive.com`
- No credentials needed — the skill uses whatever sessions your Chrome already has. Logged into a paid tier? Those fields show up automatically. Logged out? Anonymous search still works everywhere.

## What it does

1. Translates your criteria into each site's own filtered-search URL (grammars live-verified per site in `references/`)
2. Visits each site sequentially in one tab, reads the result cards, opens detail pages only for finalists
3. Dedupes by address + city across sites, flags cross-site price mismatches (usually a stale listing)
4. Returns: Top matches → full inventory → adjacent results (near-misses with reasons) → notes

PropertyDrive covers Wisconsin and border areas only; the skill notes when it skips it.

## Conduct

Runs at interactive pace in your own browser on your own accounts. It refuses bulk-scrape patterns (harvesting every listing in a state, broker contact lists) — that's the usage these sites ban accounts for.

## Benchmark

Skill-forge evaled (3 tasks × with/without): 100% vs 60% assertion pass rate, 43% faster, 33% fewer tokens than baseline. Trigger accuracy 20/20 on a 10-positive / 10-near-miss query set. Eval prompts in `evals/`.
