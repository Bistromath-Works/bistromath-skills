# PropertyDrive — URL grammar and extraction

Wisconsin's regional CRE listing service (propertydrive.com). **Wisconsin + border areas only** — skip for other markets. Often lists properties the national sites miss (verified: 6 Madison retail results where LoopNet had 1).

Verified working example (2026-07, anonymous — no login required):

```
https://www.propertydrive.com/search-listings/?sale=1&ptype%5B%5D=2&bld_min_price=500000&bld_max_price=2000000&spage=1&map_lat=43.0769432&map_lng=-89.3810175&map_zoom=13
```

## Parameters

| Criterion | Parameter | Notes |
|---|---|---|
| For sale / lease | `sale=1` / `lease=1` (lease unverified) | |
| Property type | `ptype[]=N` (encode as `ptype%5B%5D=N`) | Numeric ids. Verified: 2 = Retail, 3 = Industrial. UI order suggests 1 Office, 4 Multi-Family, 5 Special Purpose, 6 Land, 7 Business, 8 Co-Working — unverified; confirm via the FILTERS panel if a type matters |
| Price | `bld_min_price=N&bld_max_price=N` | "bld" = building sale price; land and business prices have their own fields in the UI |
| Market | `map_lat=<lat>&map_lng=<lng>&map_zoom=13` | RESULTS ARE MAP-VIEWPORT-SCOPED — there is no city parameter. Center on the market (zoom 12–13 ≈ one metro; 10–11 for a wider region). Madison: 43.0769, -89.3810. Milwaukee: 43.0389, -87.9065. Green Bay: 44.5133, -88.0133 |
| Cap rate / lease type | none | Post-filter from detail pages |

`spage=1` is pagination; max 200 results per page.

## Extraction — the map toggle

The page loads in MAP view; `get_page_text` on map view returns almost nothing. Untick the **SHOW MAP** checkbox (top right of the results header) to switch to the card list, then `get_page_text`. The toggle is not URL-controlled — `find` "SHOW MAP checkbox" and click it each visit.

Card text shape (verified):

```
Retail, Special Purpose for sale
2250 Pennsylvania Ave, Madison, WI
PRICE: $1,350,000
SIZE: 10,475 sf
```

Result count renders as "N Results" above the cards. No cap rate on cards or reliably anywhere — mark "n/a" unless the detail page discloses it.

Self-check (the `ptype` ids are reverse-engineered, not official): if the returned cards' type badges don't match the requested type, the id guess was wrong — open the FILTERS panel, tick the type there, and note the corrected id.
