'use client';

import { usePortfolioSocket } from '@/hooks/useSocket';
import { PortfolioTable } from '@/components/PortfolioTable';
import { SectorChart } from '@/components/SectorChart';
import { getSectorSummaries, getPortfolioTotals } from '@/lib/portfolioUtils';

function StatCard({ label, value, tone }: { label: string; value: string; tone?: 'gain' | 'loss' }) {
  const color = tone === 'gain' ? 'text-green-600' : tone === 'loss' ? 'text-red-600' : 'text-gray-900';
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-medium ${color}`}>{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { portfolio, connected, flashMap } = usePortfolioSocket();
  const sectorSummaries = getSectorSummaries(portfolio);
  const totals = getPortfolioTotals(portfolio);

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  return (
    <main className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <h1 className="text-xl sm:text-2xl font-medium text-gray-900">Portfolio dashboard</h1>
        <span className={`flex items-center gap-1.5 text-sm ${connected ? 'text-green-600' : 'text-red-600'}`}>
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          {connected ? 'Live' : 'Disconnected'}
        </span>
      </div>

      {portfolio.length === 0 ? (
        <p className="text-gray-500">Loading portfolio...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard label="Total investment" value={fmt(totals.totalInvestment)} />
            <StatCard label="Present value" value={fmt(totals.totalPresentValue)} />
            <StatCard
              label="Gain / Loss"
              value={`${totals.totalGainLoss >= 0 ? '+' : ''}${fmt(totals.totalGainLoss)}`}
              tone={totals.totalGainLoss >= 0 ? 'gain' : 'loss'}
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8">
            <h2 className="text-base font-medium text-gray-900 mb-4">Sector allocation</h2>
            <SectorChart data={sectorSummaries} />
          </div>

          <PortfolioTable portfolio={portfolio} flashMap={flashMap} />
        </>
      )}
    </main>
  );
}