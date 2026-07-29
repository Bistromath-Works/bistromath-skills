# Crexi — URL grammar and extraction

Base: `https://www.crexi.com/search?searchType=Sales`

Verified working example (2026-07, anonymous session):

```
https://www.crexi.com/search?searchType=Sales&address_value=Madison%252C%2520WI&PropertyPrice_block=Total&propertyPrice.total_min=500000&propertyPrice.total_max=2000000&financials.capRatePercent_min=6&propertyAttributes.type_tree_Retail=
```

## Parameters (all verified unless noted)

| Criterion | Parameter | Notes |
|---|---|---|
| Sale vs lease | `searchType=Sales` (or `Lease`) | |
| Location | `address_value={city}%252C%2520{ST}` | The location string is URL-encoded TWICE: `Madison, WI` → `Madison%2C%20WI` → `Madison%252C%2520WI` |
| Price min/max | `PropertyPrice_block=Total&propertyPrice.total_min=N&propertyPrice.total_max=N` | Plain integers, no commas |
| Cap rate | `financials.capRatePercent_min=N` (`_max` presumed symmetric, unverified) | Excludes listings with undisclosed cap — see SKILL.md warning |
| Property type | `propertyAttributes.type_tree_{Type}=` | Type name lives in the KEY, value stays empty. Verified: `type_tree_Retail`. Multi-word types (Mixed Use, Self Storage) presumably `%20`-encoded in the key — unverified; fall back to UI if it doesn't stick |
| Lease type | `leaseDetails.leaseType_value={type}` (double-encoded) | Exists but DO NOT USE in the URL — drops undisclosed listings to zero. Post-filter instead |

Property types available (dropdown, verified): Retail, Multifamily, Office, Industrial, Hospitality, Mixed Use, Land, Self Storage, Mobile Home Park, Senior Living, Special Purpose, Note/Loan, Business for Sale. Retail has subtypes (Bank, Convenience Store, Day Care/Nursery, QSR/Fast Food, Gas Station, Grocery, Pharmacy/Drug, Restaurant, Bar, Storefront, Shopping Center, Auto Shop).

Lease types on the site (for post-filtering vocabulary): Net, Absolute Net, Absolute NNN, Full Service, Gross, Modified, Modified Gross, NN, NN+.

## Extraction

Result cards render in the left pane; `get_page_text` returns them. Each card carries: price, headline, blurb (often includes SF, % leased, yield), street address, city/state/zip, brokerage. Cap rate and lease type usually live on the DETAIL page, not the card — the card blurb sometimes mentions yield ("~8.2% yield on in-place rents").

Filter chips at the top of results ("$500,000 - $2,000,000 ⊗", "6%+ CAP rate ⊗") confirm what actually applied — check them if a result count looks wrong.

The result count ("N properties") sits directly above the cards. Detail page URL shape: `crexi.com/properties/{id}/{slug}` — capture the link from the card.

Anonymous sessions see full search results; "Sign in" button top-right indicates anonymous. Logged-in (Crexi Intelligence) adds comps/contact data on detail pages, not extra search results.

## Known failure mode — skeleton cards

Crexi's SPA sometimes wedges: result cards render as gray skeletons forever and the search API never fires (observed twice, including with a valid pre-filtered URL; a front-end Google Maps error can trigger it). The URL grammar is not the problem. Recovery that worked: load plain `crexi.com/properties`, let it render, then apply the identical filters through the UI (location box → type dropdown → slider-icon modal for price/cap). If even the unfiltered page stays skeletal, report Crexi as unavailable this session and continue with the other sites.
