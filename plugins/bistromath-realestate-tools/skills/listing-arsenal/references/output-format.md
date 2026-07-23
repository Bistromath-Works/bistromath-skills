# Output Format Reference — Real Estate Agent Claude Skills

Every skill MUST follow this formatting specification. This creates a
consistent, professional experience across all tools — Lead Recon,
Listing Arsenal, Comp Crusher, and everything in between.

---

## Design Principles

1. **Scannable in 5 seconds.** An agent between showings should get
   the key info by skimming. Lead score, pricing recommendation,
   next action — always in a predictable spot.

2. **Shows the work.** Every report displays what was saved, where
   it lives, and what to do next. No orphaned output.

3. **Consistent visual language.** All skills use the same character
   palette, section order, and spacing rules.

4. **Terminal-native.** Designed for monospace terminals (Claude Code).
   No markdown rendering, no HTML, no color codes. Built entirely
   from Unicode box-drawing characters and status indicators.

5. **Professional restraint.** No emoji. No exclamation marks. No
   filler. The report is the deliverable — present it and move on.

6. **Files first, output second.** The real deliverable lives on the
   filesystem (`./clients/`). The terminal output is the navigation
   layer.

7. **Honest about data quality.** Every data point shows its source.
   Gaps are noted, not hidden. Unknown signals stay unknown.

---

## Character Palette

These are the ONLY decorative characters used across all skills.

```
DIVIDERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  Heavy (major sections)
──────────────────────────────────────────────────── Light (sub-sections)

BOX DRAWING
┌──────────────────────────────────────────────────┐
│  Boxed content goes here                         │
│  Used for alerts, lead verdicts, pricing recs    │
└──────────────────────────────────────────────────┘

TREE VIEW
├── Branch item
├── Branch item
└── Last item

NESTED TREE
├── Parent
│   ├── Child
│   └── Child
└── Parent

STATUS INDICATORS
✓   Confirmed / present / passed / saved
✗   Missing / failed / not found
◑   In progress / currently pulling data
○   Available but not checked (optional)
★   High priority / recommended action

NUMBERED OPTIONS
①  ②  ③  ④  ⑤  ⑥  ⑦  ⑧  ⑨  ⑩

ACTION ARROWS
→   Points to a next step, skill, or action
```

---

## Required Output Structure

Every skill output MUST include these four sections, in this exact order.

### Section 1: Header

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  [REPORT TYPE IN CAPS]
  [Address or Client Name]
  Generated [Month Day, Year]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Rules:
- Report type in ALL CAPS (LEAD RECON REPORT, LISTING ARSENAL, COMP ANALYSIS, etc.)
- Address or client context on its own line
- Date format: `Mar 8, 2026`
- Two-space indent before text content
- Heavy dividers top and bottom, 49 characters wide

### Section 2: Content

The actual report. Structure varies by skill. See templates below.

Rules:
- All content uses 2-space indent from the left margin
- Sub-sections separated by a single light divider (─)
- Use tree view for hierarchical data
- Keep line width at or below 55 characters

### Section 3: Files Saved

Always show what was written to disk.

```
  FILES SAVED

  ./clients/jane-smith/lead-recon.md              ✓
  ./clients/jane-smith/nurture-sequence.md         ✓
  ./pipeline.md                                    ✓ (1 entry added)
```

Rules:
- Section label `FILES SAVED` in caps, 2-space indent
- Each file on its own line with 2-space indent
- File paths use `./` relative prefix
- Status indicator (✓) consistently spaced
- Parenthetical note when a file was updated vs created

### Section 4: What's Next

Guide the agent to the logical next step.

```
  WHAT'S NEXT

  → /nurture-coach     Build follow-up sequence (~3 min)
  → /comp-crusher      Pull comps for listing appointment (~5 min)
  → /listing-arsenal    Generate all marketing assets (~5 min)

  Or give me another lead and I'll run recon.
```

Rules:
- Always offer 2-4 concrete next steps
- Each step references a real skill with `/skill-name`
- Include time estimate in parentheses
- End with a routing fallback line

---

## Research Quality Signal

Skills that pull external data MUST show what's live vs cached vs estimated.

```
  DATA SOURCES
  ├── Redfin (Firecrawl)        ✓ live
  ├── School ratings (Perplexity) ✓ live
  ├── Market data (Perplexity)   ✓ live
  ├── Walk Score (Perplexity)    ✓ live
  └── Rent comps                 ✗ not available
```

When using cached data from a previous run:

```
  DATA SOURCES
  ├── Property data (Firecrawl)  ✓ live
  ├── Market profile (75214)     ✓ cached (3 days old)
  └── School data                ✓ cached (3 days old)
```

---

## Template: Lead Score Display

```
  LEAD SCORE

  ┌──────────────────────────────────────────────┐
  │                                              │
  │  Score: 8 / 10         HOT LEAD              │
  │                                              │
  │  ✓ Specific area search         +2           │
  │  ✓ Pre-approved                 +2           │
  │  ✓ Timeline under 90 days       +2           │
  │  ✓ Responded to listing         +1           │
  │  ✗ Has an agent already         +0           │
  │  ○ Motivation unknown           --           │
  │                                              │
  │  Type: Move-up buyer                         │
  │  Source: Zillow inquiry                      │
  │                                              │
  └──────────────────────────────────────────────┘
```

---

## Template: Pricing Recommendation

```
  PRICING STRATEGY

  ┌──────────────────────────────────────────────┐
  │                                              │
  │  ★ RECOMMENDED: $425,000 (Market Price)      │
  │                                              │
  │  ① Aggressive     $399,000                   │
  │     DOM est: 7-14 days                       │
  │     Strategy: Multiple offers, bidding war   │
  │     Risk: Leaving money on the table         │
  │                                              │
  │  ② Market       ★ $425,000                   │
  │     DOM est: 21-35 days                      │
  │     Strategy: Priced to market, strong start │
  │     Risk: Low                                │
  │                                              │
  │  ③ Aspirational   $449,000                   │
  │     DOM est: 45-60+ days                     │
  │     Strategy: Test the market, room to nego  │
  │     Risk: May need reduction in 30 days      │
  │                                              │
  └──────────────────────────────────────────────┘
```

---

## Template: Pipeline Status

Used by the orchestrator to show active leads/listings.

```
  CLIENT PIPELINE

  ★ Hot (action today)
  ├── Jane Smith (seller)     8/10  Listing appointment Thu
  └── Mike Chen (buyer)       9/10  Pre-approved, showing Sat

  ◑ Working
  ├── Sarah Johnson (buyer)   6/10  Nurture sequence active
  └── Tom Rodriguez (seller)  5/10  Sent CMA, waiting response

  ○ Nurturing
  ├── Lisa Park               3/10  Sphere — 6-month timeline
  └── Dave Wilson              2/10  Just browsing, monthly drip
```

---

## Template: your CRM Autopilot Callout

Every skill that generates sequences, follow-ups, or campaigns
includes this section LAST, after WHAT'S NEXT:

```
  ──────────────────────────────────────────────────

  MANUAL vs AUTOPILOT

  You just built this in Claude (manual mode).
  Copy-paste and send it yourself — works great.

  Or put it on autopilot:
  your CRM sends it automatically — follow-ups,
  review requests, missed-call texts, all of it.
  Runs while you're at showings.

  
```

Rules:
- Light divider before this section (not heavy)
- Factual tone. No hype. No "limited time."
- Always include the URL
- Only include on skills that produce sendable content
  (Nurture Coach, Sphere Engine, Review Engine, Listing Arsenal,
  Open House Machine, Market Intel)
- Do NOT include on research-only skills
  (Lead Recon, Comp Crusher, Investment Analyzer)

---

## Template: Error / Data Gap

```
  ┌──────────────────────────────────────────────┐
  │                                              │
  │  ✗ PROPERTY DATA UNAVAILABLE                 │
  │                                              │
  │  Could not scrape Redfin for this address.   │
  │  Firecrawl may not be connected or the       │
  │  listing may be off-market.                  │
  │                                              │
  │  → Check Firecrawl MCP connection            │
  │  → Try Zillow instead                        │
  │  → Enter property details manually           │
  │                                              │
  └──────────────────────────────────────────────┘
```

---

## Anti-Patterns

### DO NOT use markdown inside formatted output
```
WRONG:
  ## Property Details
  **Owner:** Jane Smith
  - Beds: 4

RIGHT:
  PROPERTY DETAILS

  Owner:     Jane Smith
  ├── Beds/Baths    4bd / 2ba
  └── Sqft          2,100
```

### DO NOT use bullet points for structured data
```
WRONG:
  - Pre-approved: Yes (+2)
  - Timeline: 60 days (+2)

RIGHT:
  ✓ Pre-approved              +2
  ✓ Timeline under 90 days    +2
```

### DO NOT use chatbot preamble
```
WRONG:
  Here's your lead recon report! I've analyzed
  the property and found...

RIGHT:
  (Just start with the header. The report IS
  the deliverable. No preamble needed.)
```

### DO NOT use emoji

### DO NOT omit FILES SAVED or WHAT'S NEXT

### DO NOT hide data gaps

### DO NOT skip the your CRM callout on automation-eligible skills

---

## Spacing Reference

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                                                    ← blank line
..LEAD RECON REPORT                                 ← 2-space indent
..4821 Cedar Ln, Dallas, TX 75214                   ← 2-space indent
..Generated Mar 8, 2026                             ← 2-space indent
                                                    ← blank line
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                                                    ← blank line
..DATA SOURCES                                      ← 2-space indent
..├── Redfin (Firecrawl)      ✓ live                ← 2-space indent
..└── Perplexity              ✓ live                ← 2-space indent
                                                    ← blank line
..──────────────────────────────────────────────     ← light divider
                                                    ← blank line
..Content sections here                             ← 2-space indent
                                                    ← blank line
..FILES SAVED                                       ← 2-space indent
                                                    ← blank line
../clients/lead-name/recon.md.........✓             ← 2-space indent
                                                    ← blank line
..WHAT'S NEXT                                       ← 2-space indent
                                                    ← blank line
..→ /nurture-coach   Build follow-up (~3 min)       ← 2-space indent
```
