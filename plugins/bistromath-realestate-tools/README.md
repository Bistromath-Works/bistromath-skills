# BistroMath Real Estate Tools

Eight skills for working real estate agents — pricing, marketing, prospecting, client communication, and mortgage literacy. Install once, everything loads.

## Skills

| Skill | What it does | Origin |
|-------|--------------|--------|
| **comp-crusher** | Live comps, transparent adjustments, 3-tier pricing strategy, seller net sheet | CyclSales |
| **listing-arsenal** | One address → 25+ marketing assets (MLS, social, email, open house promos) | CyclSales |
| **open-house-machine** | Full open house campaign: pre-event promos, day-of scripts, follow-up | CyclSales |
| **sphere-engine** | 12-month touch calendar for past clients and sphere of influence | CyclSales |
| **prospector** | Expired listing, FSBO, and circle prospecting — research + scripts | CyclSales |
| **newsletter-analyzer** | Grades agent newsletters on the four elements that drive engagement | BistroMathWorks |
| **presentation-strategist** | Narrative structure and content strategy for presentations | BistroMathWorks |
| **offer-extractor** | Turns accepted offers into professional client emails with timelines and doc checklists | BistroMathWorks |

## Setup notes

- **offer-extractor**: replace the bracketed `[YOUR TEAM NAME]`-style placeholders in its SKILL.md and `references/email_templates.md` with your team's details before first use.
- The CyclSales skills work best with Perplexity and Firecrawl MCP servers connected for live property/market data; without them, they fall back to manual input.
- Some skills reference companions (/market-intel, /nurture-coach, /lead-recon) from the original CyclSales repo that aren't bundled here — grab them from the source if you want the full set.

## Credits

**comp-crusher, listing-arsenal, open-house-machine, sphere-engine, and prospector** were written by [Miron Briley at CyclSales](https://github.com/miron-tech/realtor-claude-skills) and released under MIT. Repackaged here with full credit and light edits (CRM-specific promotions removed, file paths adapted). Great work worth bundling — check out their full 13-skill repo.

## Install

```
/plugin marketplace add Bistromath-Works/bistromath-skills
/plugin install bistromath-realestate-tools@bistromath-skills
```
