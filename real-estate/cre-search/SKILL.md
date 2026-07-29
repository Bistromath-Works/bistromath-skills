---
name: cre-search
description: Search Crexi, LoopNet, and PropertyDrive simultaneously for commercial properties matching the user's criteria (price range, property type, market, cap rate, NNN vs gross lease), using the user's own logged-in Chrome via claude-in-chrome. Produces one deduplicated comparison table instead of three browser sessions. Use whenever the user wants to find commercial real estate for sale — "find me NNN retail in Madison under $2M", "search for industrial properties", "what's for sale in {market}", "screen for cap rate above X" — or names Crexi, LoopNet, or PropertyDrive, even if they only mention one site. Do NOT use for residential property searches, property valuation/comps, lease-space searches for a tenant, or mortgage/financing questions.
---

# CRE Search

Search up to three listing sites in the user's real Chrome and merge results into one table. The user's own browser session means their free or paid logins apply automatically — never ask for credentials, never store any.

## Step 0 — Browser and criteria

This skill's results come from live pages in the user's Chrome — never from anywhere else. If the `mcp__claude-in-chrome__*` tools are unavailable in this environment, say so and stop; a listings table built from web search or memory looks identical to a real one and is worthless to a buyer.

Call `tabs_context_mcp` (createIfEmpty: true) and reuse ONE tab for all sites, sequentially. If more than one Chrome is connected, use the one on this machine without asking. If a navigation fails with a permission error, tell the user exactly which domain to grant in the Claude extension (crexi.com, loopnet.com, propertydrive.com) and continue with the sites that work.

Collect criteria before searching. Missing criteria are not blockers — search broad and say so in the output.

| Criterion | Crexi | LoopNet | PropertyDrive |
|---|---|---|---|
| Market (city, state) | URL param | URL path | map coords in URL |
| Price min/max | URL param | URL param | URL param |
| Property type | URL param | URL path | URL param (numeric id) |
| Cap rate min | URL param | URL param | — post-filter |
| NNN / gross | post-filter (see below) | URL path (`nnn-properties`) | — post-filter |

PropertyDrive covers **Wisconsin and border areas only**. For markets outside Wisconsin, skip it and note that in the output.

## Step 1 — Build one URL per site

Read the reference file for each site you will search — each contains the verified URL grammar and extraction notes:

- `references/crexi.md`
- `references/loopnet.md`
- `references/propertydrive.md`

Build the fully filtered URL up front. One navigate + one read per site beats driving dropdowns: it is faster, and filter widgets move while URLs do not. Only fall back to clicking filter UI when a URL parameter is unknown (each reference file says which ones are verified).

**Do not put a lease-type filter in the Crexi URL.** Verified failure: Madison retail $500K–$2M cap ≥6% returned 4 listings; adding `leaseDetails.leaseType_value=Absolute%2520NNN` returned 0, because the filter drops every listing that didn't disclose a lease type. Same logic applies to cap-rate filters when results look thin: rerun without the filter and post-filter from listing text, marking undisclosed values as "n/a" rather than silently excluding them.

## Step 2 — Visit and extract

For each site: `navigate` → wait 4–5s → `get_page_text`. If the text is sparse (map-heavy view), take a screenshot and read the result cards visually; PropertyDrive needs its SHOW MAP checkbox unticked to render the list (see its reference file).

Record for each listing: street address, city/state, price, cap rate (if shown), building SF, property type, lease type (if shown), listing URL, source site.

Note each site's login state while there: a "Sign In" link visible means anonymous. Anonymous results are still complete for search purposes — logged-in sessions add detail fields, not extra listings.

Result counts differ per site by design — verified example: the same Madison retail screen returned 2 on Crexi, 1 on LoopNet, 6 on PropertyDrive. A site returning few results is normal; a site returning zero deserves one retry with the price band widened or cap-rate filter dropped before you report it as empty.

If criteria include cap rate or NNN and a listing's card doesn't show it, open the listing's detail page for your top candidates (up to ~5) and pull cap rate, NOI, and lease type from there. Don't open every detail page — cards first, details for finalists.

## Step 3 — Merge and dedupe

Same property appears on multiple sites (verified: 2250 Pennsylvania Ave, Madison appeared on all three). Dedupe on normalized street address PLUS city (a "100 Main St" exists in every market): uppercase, strip punctuation, collapse "Avenue/Ave", "Street/St", "Road/Rd", "Drive/Dr". Keep one row per property, list every source, and if prices disagree across sites show the range and flag it — a price mismatch usually means one site is stale, which the user wants to know.

Site type filters are loose — a Milwaukee "industrial" search returned rows labeled Office on their own cards (verified). The user asked for a type; honor their words over the site's filter: rows whose own label matches the request go in the main table, rows the filter returned but whose label says otherwise go under "Adjacent results" with their label shown. When duplicate listings disagree on type across sites, keep the row in the main table and show both labels.

## Output

The reader is a broker scanning for a client between calls — they need the short answer before the inventory. ALWAYS this shape:

```
## CRE Search: {criteria one-liner}

Sites searched: Crexi (anonymous), LoopNet (logged in), PropertyDrive (anonymous) — N unique properties

### Top matches
{the 3-8 listings that best satisfy EVERY stated criterion — one line of "why it leads" each}

| Address | Price | Cap | SF | Type | Lease | Sources |
|---|---|---|---|---|---|---|
| 2250 Pennsylvania Ave, Madison WI | $1,350,000 | 8.23% | 10,475 | Retail | NNN | [Crexi](url) · [LoopNet](url) · [PropertyDrive](url) |

### Full inventory        <- only when results exceed the top-matches table
{remaining rows, same columns — grouped by city/submarket when a metro search spans suburbs}

### Adjacent results      <- only when present
{rows the site filters returned but that miss a stated criterion: wrong type label, slightly over budget, undisclosed cap on a cap-rate screen — each with the reason shown}

Notes: {filters post-applied, sites skipped and why, price mismatches, thin-result retries}
```

A 30-row wall of identical columns is unreadable (verified user complaint); the tiering exists so scale never costs scannability. Under ~10 results, skip the tiers — one table plus Notes. Sort by cap rate descending when cap rate was a criterion, otherwise by price ascending. Every listing links to its source page — the user's next step is always opening the listing.

## Conduct

This runs in the user's own browser on their own account at interactive pace — that is the boundary. Search when asked, don't loop searches on a timer, don't harvest broker contact lists, and present results to the user rather than republishing data elsewhere. If asked to bulk-scrape (every listing in a state, all broker phone numbers), decline and say why: that's the usage pattern these sites ban accounts for.

## Before reporting results

- Every site from the plan was either searched or explicitly listed as skipped with a reason.
- Zero-result sites got one widened retry.
- Duplicate addresses are merged with all source links preserved.
- Post-filtered criteria (NNN, cap rate) are labeled in Notes, and listings with undisclosed values say "n/a" instead of being dropped.
- More than ~10 results → tiered output (Top matches first); main table holds only rows matching the requested type, the rest moved to Adjacent results with reasons.
