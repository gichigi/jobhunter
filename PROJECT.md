# Job Finder: V2 rebuild and UX improvements

> Notion source: https://www.notion.so/30179168a0c54fd19761cb3d016c8eb0

## Overview and positioning

Rebuild the UXR Job Finder as a simple single-page app. Replace the broken Perplexity implementation with Firecrawl web search to reliably scrape job boards. Return a unified, de-duped listing directly on the app page so users never have to visit individual boards. Users can filter and sort results client-side after the listing is generated.

- **One-liner:** a single-page job finder that scrapes and aggregates UX research roles from curated and discovered sources, de-dupes server-side, and presents a filterable listing
- **Target user:** UX researchers actively job hunting (starting with fully remote roles)
- **Core value prop:** one search, multiple boards, no duplicates, no stale listings
- **Why now:** current Perplexity-based implementation is broken (stale dates, phantom results, failed filters). Unusable in its current state.
- **Stage:** Prototype → V0.1
- **Business model:** Free

## Audience

- **Primary:** UX researchers looking for fully remote roles (V1 is built for a Lisbon-based researcher who needs remote work)
- **Who this is NOT for:** recruiters, hiring managers, or anyone looking for UX design, product design, UX writing, or other non-research roles

## Success metrics

- **Unified results:** all results render on the app page; user never needs to visit a board directly
- **Deduplication:** zero duplicate listings in the final output
- **Recency:** no stale listings. Only jobs posted within the recency window (default: 14 days) are shown
- **Accurate results:** zero phantom listings; count matches displayed results
- **Broad keyword matching:** searches for "UX research" and related research-only terms return results from every supported board, without UX designer or UX writer roles

## Constraints

- Must remain a simple single-page app
- Replace Perplexity entirely with Firecrawl web search
- **UX research roles only** for V1. No product design, no UX design, no adjacent roles.
- **Recency is mandatory.** If a listing doesn't have a parseable date or is older than the threshold (default: 14 days), it gets dropped. No stale jobs in the output, ever.
- Budget and scope stay lean: utility, not platform
- De-dupe server-side via LLM before generating the listing; filter/sort client-side

## Architecture

### How it works

```
User hits search
  → API route receives request
  → Layer 1: Scrape curated boards in parallel (Firecrawl site: queries)
  → Layer 2: Firecrawl discovery search (broad, no site: scoping)
  → Normalise all results into common schema
  → Drop listings older than recency threshold
  → LLM de-duplication pass (gpt-4o-mini)
  → Return unified JSON to client
  → Client renders results
  → User filters and sorts
```

### Firecrawl API

**Endpoint:** `POST https://api.firecrawl.dev/v2/search`

Key params:
- `query` (required) - supports `site:`, `intitle:`, `""`, `-` operators
- `limit` - max results, 1-100, default 5
- `tbs` - time filter: `qdr:d` (day), `qdr:w` (week), `qdr:m` (month)
- `timeout` - ms, default 60000
- `sources` - `["web"]`
- `scrapeOptions: { formats: ["markdown"] }` - include for full page content

**Useful query patterns:**
- `site:userinterviews.com/ux-job-board` - scope to specific board
- `"UX research" OR "user research" OR "user researcher" OR "UX researcher"` - broad matching
- `-"product designer" -"product design" -"UX designer" -"UX design" -"UX writer" -"content designer"` - exclude unrelated roles

**Layer 1 example (curated board):**
```json
{
  "query": "site:userinterviews.com/ux-job-board (\"UX research\" OR \"user research\" OR \"user researcher\" OR \"UX researcher\") remote -\"UX designer\" -\"product designer\" -\"UX writer\"",
  "limit": 20,
  "tbs": "qdr:w",
  "timeout": 60000,
  "sources": ["web"],
  "scrapeOptions": { "formats": ["markdown"] }
}
```

**Layer 2 example (discovery):**
```
query: ("remote UX researcher" OR "remote UX research" OR "remote user researcher" OR "remote user research") jobs -"UX designer" -"product designer" -"UX writer" -"content designer"
tbs: "qdr:w", limit: 20
```

**Response shape:**
```json
{
  "success": true,
  "data": {
    "web": [
      {
        "url": "https://example.com/jobs/ux-researcher",
        "title": "UX Researcher - Remote",
        "description": "...",
        "markdown": "# UX Researcher\n\nFull page content...",
        "metadata": { "title": "...", "sourceURL": "...", "statusCode": 200 }
      }
    ]
  }
}
```

**Error responses:**
- `408` - timeout
- `429` - rate limit (retry once after 2s)
- `402` - credits exhausted
- `5xx` - server error (skip board, include in partial failure)

**Credit costs:**
- Search only: 2 credits per 10 results
- Search + scrape: 2 credits per 10 results + 1 per page scraped
- ~12 credits per full run (no scraping), ~72 with scraping
- Recommended plan: Hobby ($16/mo, 3,000 credits)

### Two-layer scraping strategy

**Layer 1 - curated boards (reliable baseline)**

| Board | URL | Why |
|-------|-----|-----|
| User Interviews UX Job Board | `userinterviews.com/ux-job-board` | UX research-specific, high relevance |
| Lisbon UX Jobs | `jobs.lisboaux.com` | Local to user, includes remote roles |
| Remotive | `remotive.com` | Remote-only, good signal density |
| We Work Remotely | `weworkremotely.com` | Remote-only, large design section |
| Dribbble Jobs | `dribbble.com/jobs` | Design-focused with remote filter |

Excluded from V1: LinkedIn, Indeed (block scrapers), Wellfound, Glassdoor (test later).

**Layer 2 - discovery search (wider net)**

Broad search without `site:` scoping to catch boards not on the curated list. Results from both layers are normalised and de-duped together.

### Remote scope

Default: **fully remote globally**. Some boards say "remote" but mean US-only or country-restricted.

Two-pass classification:
1. **Heuristic:** flag `country_restricted` if title/location/description contains "US only", "United States only", "must be based in", etc.
2. **LLM fallback:** classify as `global`, `country_restricted`, or `unknown`. Extract `allowedCountries` when stated.

Default UI: show `global` only. Let user toggle to include restricted/unknown.

### Recency enforcement

1. **Query-level:** `tbs: "qdr:w"` filters at source (past week)
2. **Server-side:** drop any listing with no parseable date or older than 14 days (adjustable)

### Eligibility filtering (server-side)

Hard rules before returning results:
- UX research roles only
- Within recency window
- `remoteScope = global` by default

### De-duplication strategy

**Step 1 - exact URL match:** cheap pre-check before LLM call.

**Step 2 - LLM dedup + remote scope classification (same pass):**
- Model: `gpt-4o-mini` (fast, cheap, <$0.01 per batch)
- Prompt: identify groups of listings that are the same role at the same company across boards
- Returns: `{ groups: [{ keep: index, discard: [indices] }] }`
- Fallback: URL-only dedup if model call fails

**Step 3 - merge:** keep listing with most complete fields (salary, description, date).

### API response contract

**Success:**
```json
{
  "success": true,
  "results": [
    {
      "id": "a1b2c3",
      "title": "UX Researcher",
      "company": "Stripe",
      "location": "Remote",
      "salary": "$120k-$150k",
      "datePosted": "2026-02-11",
      "sourceBoard": "Remotive",
      "sourceUrl": "https://remotive.com/jobs/...",
      "description": "...",
      "isRemote": true,
      "remoteScope": "global",
      "layer": "curated"
    }
  ],
  "meta": {
    "totalResults": 47,
    "boardsSearched": 6,
    "boardsSucceeded": ["User Interviews", "Lisbon UX", "Remotive", "We Work Remotely", "Dribbble"],
    "boardsFailed": [],
    "discoveryIncluded": true,
    "duplicatesRemoved": 4,
    "dedupMethod": "llm"
  }
}
```

**Partial failure:** `success: true`, results from working boards, `boardsFailed` lists errors.

**Total failure:** `success: false`, `error.code: "ALL_BOARDS_FAILED"`.

**Credits exhausted:** `success: false`, `error.code: "CREDITS_EXHAUSTED"`.

Notes:
- `success: true` even on partial failure (results were returned)
- `dedupMethod`: `"llm"` or `"url_only"` (fallback)
- `results` array always present, even if empty

### Client-side filter and sort

- **Filter by:** remote scope, location, salary range, experience level, date posted, source board
- **Sort by:** date posted (default: newest first), salary (high to low), company (A-Z)
- **Persist filters** in URL params (shareable/bookmarkable)

### Error handling

- Each board scrape runs in its own try/catch - one failure doesn't stop the rest
- **429:** retry once after 2s, then skip
- **408:** skip, flag for review, no retry
- **5xx:** skip, add to partial failure warning
- **402:** show "Search limit reached" to user
- **LLM dedup failure:** fall back to URL-only dedup
- **Client >30s:** show "Still searching. This is taking longer than usual."

## Features

### V1 (must ship)

- [ ] Two-layer Firecrawl scraping: curated boards + discovery, replacing Perplexity entirely
- [ ] Unified listing on app page: results render directly, no per-board navigation
- [ ] Recency enforcement: `tbs` at query level + server-side 14-day drop
- [ ] LLM de-duplication via `gpt-4o-mini`, URL-only fallback
- [ ] Client-side filter and sort: location, salary, experience, date, source board
- [ ] Keyword matching: broad Firecrawl queries covering all UX research variants
- [ ] Accurate date parsing from scraped data
- [ ] Result count/display parity: count = what's rendered
- [ ] Graceful error handling: per-board isolation, partial results + warnings

### Later

- Saved searches
- Email alerts for new matches
- More boards (LinkedIn, Indeed, Wellfound, Glassdoor - once Firecrawl handles them)

## Data model

| Entity | Key fields |
|--------|-----------|
| `JobListing` | id (hash of sourceUrl), title, company, location, salary, datePosted, sourceBoard, sourceUrl, description, isRemote, remoteScope (global/country_restricted/unknown), allowedCountries, layer (curated/discovery) |
| `SearchRequest` | keywords, location, salaryRange, experienceLevel, dateRange - not persisted in V1 |
| `BoardConfig` | name, baseUrl, searchUrlTemplate, parser - one entry per curated board |

## Screen specs

Single screen. All of: search, results, filter, sort.

**Sections:**
- Search button: single prominent CTA, no pre-filters required
- Results area: card list - title, company, location, salary (if available), date, source board badge. Click opens original listing in new tab.
- Filter/sort controls: appear after results load
- Result count: "47 jobs found" - updates live as filters applied

**States:**
| State | Message |
|-------|---------|
| Empty (landing) | "Find remote UX research roles across multiple job boards in one click." |
| Loading | "Searching job boards..." / after 30s: "Still searching. This is taking longer than usual." |
| Success | "47 jobs found across 5 boards." |
| No results | "No UX research roles found in the last 14 days. Try checking back in a few days." |
| No results after filtering | "No jobs match your current filters." + "Clear filters" link |
| Partial failure | "Showing results from 3 of 5 boards. Couldn't reach [Board A], [Board B]." |
| Total failure | "Couldn't reach any job boards right now. Please try again in a minute." + retry button |
| Credits exhausted | "Search limit reached for this month. Try again after [renewal date]." |

## Known bugs (from current build)

These triggered this rebuild - each is solved by a V1 feature above.

- [ ] Filters not applied globally across boards
- [ ] Filters not picking up "UX research" or "UX" on some boards
- [ ] All dates display as Jan 21st 2026 despite re-searching
- [ ] "60 remote positions found" with zero results rendered
- [ ] Showing jobs from 4+ years ago

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js + TypeScript |
| Hosting | Vercel |
| Scraping | Firecrawl `/v2/search` (Hobby plan, $16/mo, 3,000 credits) |
| LLM | OpenAI `gpt-4o-mini` (dedup + remote scope classification) |
| Database | None in V1 (stateless). Supabase if saved searches added later. |
| Auth | None |
| Styles | Tailwind, Inter, minimal colour palette, source board badge pills |
