# Technical Write-up: Portfolio Dashboard

## Overview

This document covers the key technical challenges faced while building this dashboard and the reasoning behind the solutions chosen, as required by the assignment.

## 1. No Official API for Yahoo/Google Finance

Neither Yahoo Finance nor Google Finance provides an official public API. I used **`yahoo-finance2`**, an unofficial Node.js client that wraps Yahoo's internal endpoints, rather than scraping raw HTML — it's more stable than DOM scraping and returns structured JSON directly.

For "Latest Earnings" specifically, I chose to use Yahoo's `epsTrailingTwelveMonths` (trailing EPS) rather than attempting to scrape Google Finance separately. Google Finance has no reliable public data access path, and Yahoo already provides the closest equivalent metric (EPS) in the same API call used for CMP and P/E — reducing the number of external dependencies and points of failure.

## 2. Library Version Breaking Changes

While integrating `yahoo-finance2`, I hit a runtime error:
`Call const yahooFinance = new YahooFinance() first. Upgrading from v2?`

The version installed (v3+) had changed its API from a ready-to-use default export to a class that must be instantiated. This is a direct, real example of the risk the assignment specifically warns about — unofficial libraries changing without notice. Fix was straightforward once diagnosed (`new YahooFinance()`), but it reinforced the need to pin dependency versions in production and to always verify library behavior with a quick standalone test script before integrating into the larger app.

I hit a related environment issue during setup: `ts-node` failed with a config-parsing error unrelated to the project itself (a known compatibility issue with newer TypeScript/Node versions). I switched to `tsx`, a simpler TypeScript runner, rather than spending time debugging `ts-node`'s internals — a reasonable tooling substitution when a dev-dependency itself is the source of friction.

## 3. Ticker Mapping Is Not Reliable Long-Term

While testing all 29 holdings, `LTIMindtree` (ticker `LTIM`) failed to fetch. Investigation showed the company had renamed itself to **LTM Limited** in February 2026, and its Yahoo Finance ticker changed to `LTM` as a result of the corporate action.

This demonstrates that static ticker mappings can silently break due to real-world events (mergers, renames, delistings) — not just API instability. A production version of this dashboard would benefit from a periodic ticker-validation job, or a fallback lookup by company name/ISIN rather than a hardcoded symbol.

## 4. Handling Missing or Partial Data Gracefully

Testing surfaced three distinct data states that needed different handling:

- **Full success** — all fields available (majority of holdings)
- **Partial data** — fetch succeeds, but a specific field is legitimately undefined (e.g. Easemytrip's P/E ratio is undefined due to negative earnings — a real business condition, not a fetch error)
- **Total failure** — fetch throws entirely (e.g. Savani Financials, a micro-cap not covered by Yahoo Finance on either NSE or BSE suffixes)

Rather than wrapping every call site in try/catch, I built a `safeFetchQuote()` function that never throws — it always resolves to a typed `StockQuote` object with either real values or `null`s plus a `status` flag. This meant one failing stock could never crash the batch loop or interrupt the Socket.IO broadcast to other clients.

## 5. Avoiding Redundant API Calls

Fetching all 29 stocks from Yahoo Finance on every 15-second refresh — and for every connected client — would multiply API calls unnecessarily and risk rate-limiting. I added a **Redis caching layer** with a 15-second TTL matching the refresh interval: the first request within a window hits Yahoo Finance, subsequent requests (or additional connected clients) within that window are served from cache.

Measured impact: a live Yahoo Finance call took ~1.4 seconds; the cached response for the same ticker took ~1.4 milliseconds — roughly a 1000x speedup. Failures are cached too (briefly), so a permanently-unavailable ticker like Savani Financials doesn't get re-attempted on every single cycle, while still retrying periodically in case it becomes available.

For local development, the Redis container is configured with a `restart: unless-stopped` policy so it comes back up automatically with Docker rather than requiring a manual restart each session — a small operational detail, but one that matters for anyone else setting this project up.

## 6. Real-Time Updates: Backend-Driven, Not Client-Polled

I used **Socket.IO** with a single `setInterval` on the backend that fetches, enriches, and broadcasts the full portfolio to all connected clients every 15 seconds — rather than having each client independently poll on its own timer. This keeps a single source of truth for "when did we last refresh," and is what makes the Redis caching strategy effective (multiple clients share one cache window instead of each maintaining separate fetch schedules).

## 7. Derived Values and Null Safety

Present Value and Gain/Loss are computed from CMP, not fetched directly. For stocks with no available CMP (e.g. Savani Financials), these derived fields are explicitly set to `null` rather than `NaN` — this required guarding every calculation (`quote.cmp !== null ? ... : null`) and matching that logic in the sector-level subtotal calculations, so one missing stock doesn't silently corrupt an entire sector's total.

## 8. Making Live Updates Visible, Not Just Functional

Socket.IO was broadcasting updates correctly, but silently — a value changing in place gives no visual signal that "live" data is actually live. I addressed this by tracking the previous portfolio snapshot on the frontend (via a `ref`, not state, to avoid triggering an extra re-render purely for bookkeeping) and diffing it against each incoming update. Any field that changed (CMP, Present Value, Gain/Loss) gets a brief highlight that fades via a CSS transition, then clears itself after a short delay.

This turned out to be a genuinely important UX detail for a real-time dashboard: functionally correct updates aren't the same as *perceptible* ones.

## 9. Shared Calculation Logic, Not Duplicated

Sector-level totals (Investment, Present Value, Gain/Loss per sector) are needed in two places: the chart and the table. Initially these were calculated separately in each component. I refactored this into a single `getSectorSummaries()` function in a shared `lib/portfolioUtils.ts` module, so both consumers derive from one calculation rather than maintaining the same formula twice. The same file also holds the sorting logic (`sortStocks()`), keeping components focused on rendering rather than data logic — sort-by-column needed to correctly handle `null` values (e.g. a stock with no CMP) by always pushing them to the end regardless of sort direction, rather than relying on JavaScript's inconsistent default handling of `null` in comparisons.

## 10. Responsive Design for Dense Tabular Data

An 11-column financial table cannot realistically be made to "fit" a mobile screen without either hiding data or making it illegible — both are worse than the alternative. I used horizontal scroll within each sector's card (`overflow-x-auto` with a `min-width` on the table) so columns retain readable widths and the table scrolls smoothly, rather than attempting to compress or selectively hide columns across breakpoints. The page header, summary stat cards, and chart use standard responsive stacking (`flex-col` → `flex-row`, grid column count changes) since those layouts genuinely can adapt without losing information.

## 11. Project Structure and Separation of Concerns

The backend is organized so that `server.ts` only bootstraps the HTTP/Socket.IO server; connection handling and the broadcast interval live in `sockets/portfolioSocket.ts`; data enrichment logic lives in `jobs/priceRefreshJob.ts`; and shared types live in `types/portfolio.ts` rather than being duplicated across files. On the frontend, calculation/sorting logic lives in `lib/`, while `components/` only handles rendering — for example, `SortableHeader.tsx` is a standalone reusable component rather than inline JSX repeated per column. This separation made it straightforward to add new columns (Portfolio %, NSE/BSE) and features (sorting, flash-on-update) without needing to touch unrelated parts of the codebase.

## Summary

The core engineering challenge in this assignment isn't the UI — it's building a data layer that assumes external sources (unofficial finance APIs) *will* fail, change, or return incomplete data, and designing every downstream calculation and rendering step to degrade gracefully rather than crash. On top of that foundation, the frontend work focused on making a technically correct real-time system also feel legible and alive to the person using it.