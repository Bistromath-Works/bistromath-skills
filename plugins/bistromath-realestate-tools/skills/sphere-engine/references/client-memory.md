# Client Memory Protocol — Realtor Claude Skills

Every skill references this file to understand how to read and write
persistent client data. This is how the system remembers leads, tracks
listings, caches market data, and gets smarter with every closed deal.

---

## Overview

Client memory lets every realtor skill remember buyers and sellers
you're working with, listings you're marketing, neighborhoods you've
analyzed, and sphere contacts you're nurturing. It lives in a
`./clients/` directory at the project root and accumulates as you work.

Skills reference this file with:
```
Read ./clients/ per references/client-memory.md
```

---

## The ./clients/ Directory

```
./clients/
  pipeline.md               <- Active leads + listings registry (append-only)
  learnings.md              <- Deal outcomes, what worked, calibration (append-only)
  content-calendar.md       <- Upcoming content tracked here
  market-profiles/
    {zip}.md                <- Cached neighborhood data by ZIP code
  sphere/
    contacts.md             <- Sphere of influence master list
  {client-slug}/
    lead-recon.md           <- Lead Recon output
    nurture-sequence.md     <- Nurture Coach output
    comp-analysis.md        <- Comp Crusher output
    listing-presentation.md <- Listing Presentation output
    listing-assets/         <- Generated marketing assets
    notes.md                <- Agent notes, showing feedback, follow-up log
```

### File Categories

**Per-client files** (one directory per lead):
Each buyer or seller gets their own folder named with a slug of their
name and property address (e.g., `johnson-4215-oak-hollow-dr-frisco-tx-75034/`).
Skills write their output here.

**Market cache files** (reusable across clients):
`market-profiles/{zip}.md` — neighborhood data cached by ZIP code.
When Lead Recon pulls market intel for 75034, it saves the data here.
Next time any client in 75034 is researched, the skill checks for
cached data first.

**Sphere files** (long-term relationship tracking):
`sphere/contacts.md` — master list of sphere of influence contacts.
Past clients, referral partners, friends/family who might refer.
Updated when deals close and contacts are added.

**Content calendar** (marketing coordination):
`content-calendar.md` — upcoming market updates, listing promotions,
neighborhood content, and social posts. Skills like Market Intel and
Neighborhood Dominator read and write here.

**Append-only files** (never overwrite):
`pipeline.md` and `learnings.md` accumulate entries over time.
Every skill may append. No skill should ever truncate these.

---

## How Skills READ Client Memory

### 1. Check for the directory

On every skill invocation, check whether `./clients/` exists.

- **If it exists**: proceed to step 2.
- **If it does not exist**: skip client memory loading. Proceed as if
  first-time user. Note: "No client history found. I'll create the
  clients directory as I work."

### 2. Load only what you need

Each skill declares what it reads from client memory:

| Skill | Reads |
|-------|-------|
| /lead-recon | market-profiles/{zip}.md, pipeline.md (check if lead exists) |
| /nurture-coach | {client}/lead-recon.md, pipeline.md, learnings.md (what follow-up worked before) |
| /comp-crusher | {client}/lead-recon.md, market-profiles/{zip}.md |
| /listing-presentation | {client}/lead-recon.md, {client}/comp-analysis.md, market-profiles/{zip}.md |
| /listing-arsenal | {client}/lead-recon.md, {client}/listing-presentation.md |
| /open-house-machine | {client}/listing-assets/, {client}/lead-recon.md |
| /market-intel | market-profiles/{zip}.md, content-calendar.md |
| /neighborhood-dominator | market-profiles/{zip}.md, content-calendar.md |
| /prospector | market-profiles/{zip}.md, pipeline.md, learnings.md |
| /sphere-engine | sphere/contacts.md, pipeline.md (closed deals), learnings.md |
| /review-engine | {client}/notes.md, pipeline.md (recently closed) |
| /investment-analyzer | {client}/lead-recon.md, market-profiles/{zip}.md |
| /start-here | ALL files (orchestrator needs full picture) |

### 3. Handle missing files gracefully

If a file your skill wants does not exist, do not error. Instead:
- Note what is missing in a single status line
- Ask the user for the data, OR proceed with defaults
- Suggest which skill would create the missing data

### 4. Check for existing client data

Before running a full recon on a client, check if `./clients/{client-slug}/`
already exists. If it does:

```
  EXISTING DATA FOUND

  Client: Sarah Johnson — 4215 Oak Hollow Dr, Frisco TX

  |- Lead Recon          ran Mar 3 (4 days ago)
  |- Comp Analysis       ran Mar 5 (2 days ago)
  |- Listing Presentation  not yet run
  |- Nurture Sequence      not yet run

  > "Update recon"     Re-pull with fresh data
  > "Continue"         Use existing data, run next skill
  > "Start fresh"      Delete and re-run from scratch
```

### 5. Use cached market data

Before calling Perplexity for neighborhood data, check
`./clients/market-profiles/{zip}.md`. If it exists, apply freshness
rules:

```
IF market profile exists AND age < 7 days ->
  Use as-is. Note: "Using cached market data for {zip} (X days old)"

IF market profile exists AND age 7-30 days ->
  Use with flag: "Market data for {zip} is X days old — numbers may have shifted"

IF market profile exists AND age > 30 days ->
  Re-pull from Perplexity. Overwrite the cache file.

IF no market profile ->
  Pull from Perplexity. Create the cache file.
```

---

## How Skills WRITE to Client Memory

### Per-Client Files

1. Create the client directory: `./clients/{client-slug}/`
2. Write the skill output (lead-recon.md, comp-analysis.md, etc.)
3. Append an entry to `./clients/pipeline.md`
4. Confirm: "Saved recon to ./clients/{client-slug}/lead-recon.md"

### Market Profile Cache

After pulling neighborhood data for a ZIP code:
1. Write to `./clients/market-profiles/{zip}.md`
2. Include a `Last Updated: YYYY-MM-DD` header
3. Include the source (Perplexity, Redfin, MLS, etc.)

### Sphere Contacts

After a deal closes or a new referral source is identified:
1. Append to `./clients/sphere/contacts.md`
2. Include contact name, relationship type, and date added

### Content Calendar

After generating market updates or listing content:
1. Append to `./clients/content-calendar.md`
2. Include date, content type, target platform, and status

---

## Pipeline Registry Format

File: `./clients/pipeline.md`

The pipeline tracks three categories: Buyer Leads, Seller Leads,
and Listings. Each has its own stage progression.

**Buyer stages:** Lead -> Showing -> Offer -> Under Contract -> Closed -> Sphere
**Seller stages:** Lead -> CMA Sent -> Listing Appointment -> Listed -> Under Contract -> Closed -> Sphere
**Listing stages:** Pre-market -> Active -> Showing -> Under Contract -> Closed

```markdown
# Client Pipeline

> Auto-maintained by Realtor Claude Skills.
> New entries appended at bottom of each section. Status updated by skills.

## Buyer Leads

| Client | Property/Area | Stage | Source | Last Updated | Notes |
|--------|--------------|-------|--------|-------------|-------|
| Mike Torres | Frisco TX 75034, 4bd+ | Showing | Zillow lead | 2026-03-05 | Showed 3 homes, budget $450-500K |
| David Park | Plano TX 75024, townhome | Lead | Sphere referral | 2026-03-07 | First-time buyer, pre-approved $380K |

## Seller Leads

| Client | Address | ZIP | Stage | Source | Last Updated | Notes |
|--------|---------|-----|-------|--------|-------------|-------|
| Sarah Johnson | 4215 Oak Hollow Dr, Frisco TX | 75034 | CMA Sent | Facebook ad | 2026-03-03 | Relocating to Austin, wants to list by April |
| Jim & Karen Lee | 892 Pecan Creek Ln, McKinney TX | 75070 | Listed | Past client | 2026-03-06 | Listed at $425K, 3 showings so far |

## Listings

| Address | ZIP | List Price | Stage | DOM | Last Updated | Notes |
|---------|-----|-----------|-------|-----|-------------|-------|
| 892 Pecan Creek Ln, McKinney TX | 75070 | $425,000 | Active | 12 | 2026-03-06 | Open house scheduled 3/9 |
| 1440 Elm Ridge Dr, Allen TX | 75002 | $389,900 | Under Contract | 8 | 2026-03-04 | Closing 3/28, inspection passed |

## Closed Deals

| Client | Address | Side | Close Price | Close Date | Commission | Notes |
|--------|---------|------|------------|------------|-----------|-------|
| Angela Rivera | 7301 Stonebrook, Plano TX | Buyer | $412,000 | 2026-02-15 | $9,888 | Sphere referral — added to sphere list |
```

### Appending Rules

- New rows go at the bottom of the relevant section
- Buyer stages: `Lead`, `Showing`, `Offer`, `Under Contract`, `Closed`, `Sphere`
- Seller stages: `Lead`, `CMA Sent`, `Listing Appointment`, `Listed`, `Under Contract`, `Closed`, `Sphere`
- Listing stages: `Pre-market`, `Active`, `Showing`, `Under Contract`, `Closed`
- When a deal closes, move the row to Closed Deals with outcome
- When a closed client enters the sphere, note it in both Closed Deals and sphere/contacts.md
- Always include the date in Last Updated

---

## Learnings Journal Format

File: `./clients/learnings.md`

```markdown
# Deal Learnings

> Auto-maintained by Realtor Claude Skills.
> Log deal outcomes here to calibrate future strategies.
> Newest entries at the bottom of each section.

## Pricing Accuracy
- [YYYY-MM-DD] [address] Listed at $425K based on comps, sold at $418K after 22 DOM. Slight overprice for the condition — adjusting: deduct $3-5K for dated kitchens in this ZIP.
- [YYYY-MM-DD] [address] Listed at $389K, got multiple offers day 2, sold at $401K. Under-listed by $10K+. Update: homes with new roof + HVAC in 75002 command premium.

## Lead Conversion Patterns
- [YYYY-MM-DD] [client] Facebook lead, responded in 4 minutes, converted to showing in 48 hours. Speed matters on paid leads.
- [YYYY-MM-DD] [client] Zillow lead, 3 calls over 2 weeks, never responded. Mark Zillow leads as lower priority if no response after 2 touches.

## Market Patterns
- [YYYY-MM-DD] [75034] Frisco 75034 — inventory up 15% vs last month. Pricing softening on homes over $500K. Under $450K still competitive.
- [YYYY-MM-DD] [75070] McKinney 75070 — new builds pulling buyers. Resales need to be priced 3-5% under new construction to compete.

## Marketing Results
- [YYYY-MM-DD] [address] Just-listed post on Facebook got 47 shares, generated 3 showing requests. Carousel format outperforms single image.
- [YYYY-MM-DD] [address] Open house pulled 12 groups. Sign + Nextdoor post was the combo. Zillow open house feature added 4 of those.

## What Worked
- [YYYY-MM-DD] [client] Seller was on the fence. Sent comp analysis same day as listing appointment — signed that evening. Speed + data closes listing appointments.
- [YYYY-MM-DD] [client] Buyer lost first offer. Sent "what we learned" breakdown within 1 hour. Won the next one. Post-loss follow-up builds trust.

## What Didn't Work
- [YYYY-MM-DD] [client] Overpriced listing by $20K at seller's request. Sat 45 days, price reduced twice, sold $10K under where we should have listed originally. Stand firm on pricing.
- [YYYY-MM-DD] [client] Sent generic drip emails to sphere. Zero responses. Switched to personal check-in texts — 3 referrals in 2 weeks.
```

### Appending Rules

- Always include date in `[YYYY-MM-DD]` format
- Always include client name or address for context
- Write specific, actionable observations
- Append to the correct section

---

## Sphere of Influence Format

File: `./clients/sphere/contacts.md`

```markdown
# Sphere of Influence

> Auto-maintained by Realtor Claude Skills.
> Past clients, referral partners, and key contacts.
> Append new contacts at bottom. Never delete entries.

## Past Clients

| Name | Address | Close Date | Side | Last Contact | Referrals Given | Notes |
|------|---------|------------|------|-------------|----------------|-------|
| Angela Rivera | 7301 Stonebrook, Plano TX | 2026-02-15 | Buyer | 2026-03-01 | 1 | Loves the neighborhood. Connected us with coworker David Park. |
| Tom & Lisa Chen | 1122 Willow Bend, Frisco TX | 2025-11-20 | Seller | 2026-01-15 | 0 | Moved to Denver. Still responsive to texts. |

## Referral Partners

| Name | Business | Type | Last Contact | Referrals Given | Notes |
|------|----------|------|-------------|----------------|-------|
| Maria Santos | Santos Home Inspections | Inspector | 2026-03-02 | 3 | Fast turnaround, buyers love her reports |
| Jake Ritter | First National Mortgage | Lender | 2026-02-28 | 5 | Best for first-time buyers, responsive |

## Other Contacts

| Name | Relationship | Last Contact | Notes |
|------|-------------|-------------|-------|
| Brandon Wells | Neighbor (personal) | 2026-02-20 | Mentioned parents might sell in McKinney |
```

### Sphere Rules

- Every closed deal should result in a new entry in Past Clients
- Track last contact date — flag anyone not contacted in 90+ days
- Track referrals given — high referrers get priority follow-up
- Referral partners: anyone who sends you business (lenders, inspectors, attorneys, contractors)
- Other contacts: anyone in your network who might refer or transact

---

## Content Calendar Format

File: `./clients/content-calendar.md`

```markdown
# Content Calendar

> Auto-maintained by Realtor Claude Skills.
> Upcoming and recent content across all platforms.
> Newest entries appended at bottom.

## Upcoming

| Date | Type | Topic/Property | Platform | Status | Skill |
|------|------|---------------|----------|--------|-------|
| 2026-03-10 | Market Update | Frisco 75034 March stats | Facebook, IG | Drafted | /market-intel |
| 2026-03-12 | Just Listed | 892 Pecan Creek, McKinney | Facebook, Zillow, MLS | Scheduled | /listing-arsenal |
| 2026-03-15 | Neighborhood Guide | McKinney 75070 schools + parks | Blog, Facebook | Not started | /neighborhood-dominator |

## Published

| Date | Type | Topic/Property | Platform | Engagement | Notes |
|------|------|---------------|----------|-----------|-------|
| 2026-03-03 | Just Listed | 1440 Elm Ridge, Allen | Facebook | 23 likes, 4 shares | Generated 2 showing requests |
| 2026-03-01 | Market Update | Collin County Feb recap | Facebook, IG | 31 likes, 8 shares | Best-performing market update yet |
```

---

## Feedback Collection

After a deal closes, skills should prompt for outcome data:

```
  DEAL OUTCOME

  How did this one close?

  a) Closed — buyer side
  b) Closed — seller/listing side
  c) Closed — both sides
  d) Dead — client ghosted
  e) Dead — lost listing to another agent
  f) Dead — buyer chose another home (not yours)
  g) Dead — deal fell through (inspection, financing, etc.)
  h) Still working it

  (Tell me the outcome anytime — I'll log it
  and use it to improve future strategies.)
```

### Processing Feedback

**If (a-c) "Closed":**
- Ask: "What was the close price? What was your commission? Any lessons?"
- Log to learnings.md under Pricing Accuracy and What Worked
- Move deal to Closed Deals in pipeline.md with close price and commission
- Add client to sphere/contacts.md under Past Clients
- Prompt: "Want me to draft a review request for this client?" (-> /review-engine)

**If (d-g) "Dead":**
- Log the reason to learnings.md under What Didn't Work
- Move deal to Closed Deals in pipeline.md with reason
- If lost to another agent, log what they did differently
- If deal fell through, log the failure point for future risk assessment

**If (h) "Still working":**
- Note it. Update pipeline status and Last Updated date.

---

## Client Slug Convention

Client folders use a combination of client last name and property
address (or target area for buyers without a specific property).

Convert to URL-safe folder names:
- Lowercase everything
- Replace spaces with hyphens
- Remove commas, periods, # signs, apostrophes
- Format: `{lastname}-{address-or-area}`

Examples:
- Seller: Sarah Johnson at 4215 Oak Hollow Dr, Frisco TX 75034
  -> `johnson-4215-oak-hollow-dr-frisco-tx-75034`
- Buyer: Mike Torres looking in Frisco TX 75034
  -> `torres-frisco-tx-75034`
- Buyer who gets specific: Mike Torres, offer on 8822 Maple Run
  -> rename folder to `torres-8822-maple-run-frisco-tx-75034`

When a buyer narrows to a specific property, rename the folder to
include the address. Note the rename in pipeline.md.

---

## Cache Freshness Rules

All cached data follows the same freshness protocol:

| Age | Status | Action |
|-----|--------|--------|
| < 7 days | Fresh | Use as-is |
| 7-30 days | Stale | Use but flag: "Data is X days old — may have shifted" |
| > 30 days | Expired | Re-pull from source. Overwrite the cache file. |

These rules apply to:
- Market profiles (market-profiles/{zip}.md)
- Comp analyses ({client}/comp-analysis.md)
- Lead recon data ({client}/lead-recon.md)

**Data granularity matters.** Market profiles can cover different scopes —
"Lakewood neighborhood in 75214" vs "all of 75214" — and produce very
different numbers. Every market-profiles/{zip}.md file MUST include a
`Scope:` line (e.g., `Scope: Lakewood neighborhood within 75214`).
When a skill needs data for a specific neighborhood but the cache covers
the full ZIP (or vice versa), treat it as a partial match: use it but
note the scope difference. If /market-intel has run for that ZIP, its
output is the authoritative cache — other skills should defer to it
rather than pulling their own Perplexity data independently.

Listing data is more time-sensitive. For active listings:
- DOM and showing count should be updated every time the listing
  skill is invoked
- Price changes should be logged immediately in notes.md

---

## Principles

1. **Cache aggressively.** Neighborhood data does not change daily.
   Cache it and reuse across every client in the same ZIP.

2. **Graceful degradation.** No skill breaks because client memory is
   missing. The system works on day one with zero history.

3. **Append, don't destroy.** Pipeline and learnings accumulate.
   Client files are preserved even after deals close.

4. **Honest about freshness.** Always show how old cached data is.
   Stale data is still useful — just flag it.

5. **The system gets smarter.** Every closed deal with outcome data
   calibrates future pricing, lead scoring, and follow-up strategies.
   The more you use it, the more accurate it gets for your markets.

6. **Sphere is the long game.** Every closed deal feeds the sphere.
   Every sphere contact is a future referral. The pipeline is
   circular, not linear.
