# LoopNet — URL grammar and extraction

Filters ride in the PATH, numeric bounds in the query. Verified working example (2026-07, anonymous session):

```
https://www.loopnet.com/search/retail-properties/madison-wi/for-sale/nnn-properties/?min-price=500000&max-price=2000000&min-cap-rate=6
```

## URL structure

```
loopnet.com/search/<type-slug>/<city>-<st>/for-sale/[nnn-properties/]?<bounds>
```

| Segment/param | Values | Notes |
|---|---|---|
| type-slug | `retail-properties` (verified), `commercial-real-estate` (verified, = all types) | Other type slugs unverified. WRONG slugs redirect silently and DROP the type filter — my `retail-space` guess redirected to all-types. After navigating, confirm the page title mentions your type; if not, open the Filters panel and set type there |
| location | `madison-wi` | lowercase, hyphenated |
| listing kind | `for-sale` | |
| NNN | `nnn-properties/` extra path segment | Native NNN filter — USE this for NNN screens instead of post-filtering |
| Price | `?min-price=N&max-price=N` | |
| Cap rate | `min-cap-rate=N` (`max-cap-rate` presumed, unverified) | |

The Filters panel (fallback when a slug guess fails) also offers: Triple Net (NNN) checkbox, Distressed, price basis (Total $, $/SF, $/Acre, $/Unit), building size, land size, cap rate min/max, tenancy single/multiple, keyword. Property types in the panel: Office, Industrial, Retail, Restaurant, Shopping Center, Multifamily, Specialty, Health Care, Hospitality (+ more below the fold).

## Extraction

Results render as cards in the right pane next to the map; `get_page_text` returns them. Card fields (verified): street address, city/state/zip, price, cap rate ("8.23% Cap Rate"), SF + building type ("10,475 SF Retail Building"). LoopNet cards show cap rate directly — richer than Crexi cards.

Result count appears as a headline above the cards ("1 Madison NNN Retail Space for Sale"). Detail URL: capture the card link.

LoopNet is CoStar-owned and aggressively bot-defended — this skill works because it runs in the user's real Chrome. If a page loads as a block/captcha page anyway, stop retrying that site, report it, and continue with the others. "Sign In" in the nav = anonymous; anonymous search results are complete.
