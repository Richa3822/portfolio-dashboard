# Octa Byte Portfolio Dashboard

A real-time portfolio tracking dashboard built for the Octa Byte AI case study assignment. Displays live stock holdings grouped by sector, with automatic price updates via Socket.IO.

## Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Recharts
- **Backend:** Node.js, Express, Socket.IO
- **Data:** yahoo-finance2 (unofficial Yahoo Finance client)
- **Caching:** Redis

## Features

- Live portfolio table grouped by sector with sector-wise subtotals
- Auto-refreshing CMP, Present Value, and Gain/Loss every 15 seconds via WebSockets
- Color-coded Gain/Loss (green/red)
- Sortable columns
- Flash animation highlighting cells when their value updates
- Sector allocation bar chart (Investment vs Present Value)
- Graceful handling of unavailable stock data (e.g. illiquid/unlisted tickers)
- Redis-backed caching to avoid redundant external API calls
- Responsive layout

## Prerequisites

- Node.js 18+
- Docker (for running Redis locally)

## Setup

### 1. Start Redis

First time only:
```bash
docker run -d --name redis-portfolio -p 6379:6379 redis
docker update --restart unless-stopped redis-portfolio
```

After the first time, Redis starts automatically whenever Docker Desktop is running. The backend's `npm run dev` also runs a `predev` hook that ensures the container is started before the server boots — see `backend/package.json`.

### 2. Environment Variables

Copy the example file and adjust if needed:
```bash
cd backend
cp .env.example .env
```

`backend/.env`:
```
PORT=4000
FRONTEND_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379
```

`frontend/.env.local` (create this file manually, no example file needed for local dev):
```
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

### 3. Backend
```bash
cd backend
npm install
npm run dev
```
Runs on `http://localhost:4000`

### 4. Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:3000`

## Project Structure

```
octabyte-portfolio-dashboard/
├── backend/
│   ├── .env.example
│   └── src/
│       ├── server.ts           # server bootstrap
│       ├── sockets/            # Socket.IO connection & broadcast logic
│       ├── services/           # Yahoo Finance fetching + caching
│       ├── jobs/                # portfolio enrichment logic
│       ├── data/                # static holdings data
│       ├── cache/               # Redis client
│       └── types/               # shared TypeScript interfaces
└── frontend/
    ├── app/                     # Next.js pages
    ├── components/              # table, chart, cell components
    ├── hooks/                   # Socket.IO client hook
    └── lib/                     # types, utility functions
```

## Notes

- Live prices reflect Yahoo Finance's last traded price. On weekends/after NSE market hours (Mon–Fri, 9:15 AM–3:30 PM IST), values will not fluctuate since markets are closed.
- Some illiquid stocks (e.g. Savani Financials) may not have Yahoo Finance coverage and will display as "N/A" rather than causing an error.

See `TECHNICAL_WRITEUP.md` for details on challenges faced and design decisions.