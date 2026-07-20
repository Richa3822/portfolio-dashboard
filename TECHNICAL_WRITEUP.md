# Technical Write-up: Portfolio Dashboard

## Key Challenges & Solutions

**1. No official API for Yahoo/Google Finance**
Used `yahoo-finance2` (unofficial client) for CMP and P/E ratio. Skipped a separate Google Finance scraper — Yahoo already returns EPS in the same call, used as the "Latest Earnings" field, avoiding a second fragile data source.

**2. Ticker mappings break over time**
`LTIMindtree` failed to fetch — turned out the company renamed to LTM Limited, changing its ticker. Real example of why static ticker lists need periodic validation, not just a one-time mapping.

**3. Three data states to handle, not just success/failure**
- Full success
- Partial (e.g. Easemytrip has no valid P/E — negative earnings, not an error)
- Total failure (e.g. Savani Financials — not covered by Yahoo at all)

Built `safeFetchQuote()` to never throw — always returns a typed result with a `status` flag, so one bad stock can't crash the batch or the socket broadcast.

**4. Avoiding repeated calls to Yahoo Finance**
Added Redis caching (15s TTL, matching the refresh interval). Measured: live call ~1.4s, cached call ~1.4ms. Failures are cached too, so a permanently-broken ticker doesn't get hit every cycle.

**5. Real-time updates**
Socket.IO, backend-driven — one `setInterval` on the server broadcasts to all clients every 15s, rather than each client polling independently. Keeps caching effective and updates in sync across clients.

**6. Null-safe calculations**
Present Value / Gain-Loss are computed from CMP, so a missing CMP (Savani Financials) needed explicit `null` handling — including in sector-level subtotals — to avoid `NaN` propagating through totals.

**7. Making updates visible, not just correct**
Added a brief highlight/flash on cells when their value changes between updates, so the "live" data actually reads as live rather than silently changing in place.

## Architecture Notes

- Backend: `sockets/` (connection + broadcast), `services/` (Yahoo fetch + cache), `jobs/` (enrichment logic), `types/` (shared interfaces) — kept separate so `server.ts` only bootstraps
- Frontend: calculation/sorting logic in `lib/`, components handle only rendering
- Library version mismatch (`yahoo-finance2` v3 API change) and a `ts-node` config bug were both hit and resolved early — noted here since they're common friction points with this stack