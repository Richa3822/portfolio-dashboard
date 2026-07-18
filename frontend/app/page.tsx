'use client';

import { usePortfolioSocket } from '@/hooks/useSocket';
import { PortfolioTable } from '@/components/PortfolioTable';
import { SectorChart } from '@/components/SectorChart';
import { getSectorSummaries } from '@/lib/portfolioUtils';

export default function DashboardPage() {
  const { portfolio, connected } = usePortfolioSocket();
  const sectorSummaries = getSectorSummaries(portfolio);

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Portfolio Dashboard</h1>
        <span className={connected ? 'text-green-600' : 'text-red-600'}>
          {connected ? '● Live' : '● Disconnected'}
        </span>
      </div>

      {portfolio.length === 0 ? (
        <p className="text-gray-500">Loading portfolio...</p>
      ) : (
        <>
          <SectorChart data={sectorSummaries} />
          <PortfolioTable portfolio={portfolio} />
        </>
      )}
    </main>
  );
}