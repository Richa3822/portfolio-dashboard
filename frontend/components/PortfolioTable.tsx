'use client';

import { useState } from 'react';
import { EnrichedStock } from '@/lib/types';
import { groupBySector, sortStocks, SortKey, SortDirection } from '@/lib/portfolioUtils';
import { GainLossCell } from './GainLossCell';
import { SortableHeader } from './SortableHeader';
import { FlashMap } from '@/hooks/useSocket';

function formatNum(value: number | null, decimals = 2) {
  return value !== null ? value.toFixed(decimals) : 'N/A';
}

export function PortfolioTable({ portfolio, flashMap }: { portfolio: EnrichedStock[]; flashMap: FlashMap }) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  }

  function flashClass(stockId: number, field: 'cmp' | 'presentValue' | 'gainLoss') {
    const changed = flashMap[stockId]?.has(field);
    return changed ? 'transition-colors duration-700 bg-blue-50' : 'transition-colors duration-700';
  }

  const sectors = groupBySector(portfolio);

  return (
    <div className="space-y-6">
      {Object.entries(sectors).map(([sectorName, stocks]) => {
        const sectorInvestment = stocks.reduce((sum, s) => sum + s.investment, 0);
        const sectorPresentValue = stocks.reduce((sum, s) => sum + (s.presentValue ?? 0), 0);
        const sectorGainLoss = sectorPresentValue - sectorInvestment;
        const displayStocks = sortKey ? sortStocks(stocks, sortKey, sortDirection) : stocks;

        return (
          <div key={sectorName} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-900">{sectorName}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                    <SortableHeader label="Stock" sortKey="name" activeSortKey={sortKey} direction={sortDirection} onSort={handleSort} />
                    <th className="px-5 py-2 font-medium">Purchase price</th>
                    <th className="px-5 py-2 font-medium">Qty</th>
                    <SortableHeader label="Investment" sortKey="investment" activeSortKey={sortKey} direction={sortDirection} onSort={handleSort} />
                    <SortableHeader label="Portfolio %" sortKey="portfolioPercent" activeSortKey={sortKey} direction={sortDirection} onSort={handleSort} />
                    <th className="px-5 py-2 font-medium">NSE/BSE</th>
                    <SortableHeader label="CMP" sortKey="cmp" activeSortKey={sortKey} direction={sortDirection} onSort={handleSort} />
                    <SortableHeader label="Present value" sortKey="presentValue" activeSortKey={sortKey} direction={sortDirection} onSort={handleSort} />
                    <SortableHeader label="Gain/Loss" sortKey="gainLoss" activeSortKey={sortKey} direction={sortDirection} onSort={handleSort} />
                    <SortableHeader label="P/E ratio" sortKey="peRatio" activeSortKey={sortKey} direction={sortDirection} onSort={handleSort} />
                    <SortableHeader label="EPS" sortKey="eps" activeSortKey={sortKey} direction={sortDirection} onSort={handleSort} />
                  </tr>
                </thead>
                <tbody>
                  {displayStocks.map((stock) => (
                    <tr key={stock.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                      <td className="px-5 py-2.5 font-medium text-gray-900">{stock.name}</td>
                      <td className="px-5 py-2.5 text-gray-600">{stock.purchasePrice}</td>
                      <td className="px-5 py-2.5 text-gray-600">{stock.qty}</td>
                      <td className="px-5 py-2.5 text-gray-600">{stock.investment.toFixed(2)}</td>
                      <td className="px-5 py-2.5 text-gray-600">{stock.portfolioPercent.toFixed(2)}%</td>
                      <td className="px-5 py-2.5 text-gray-600">{stock.nseSymbol}</td>

                      {/* these three are the only lines that changed */}
                      <td className={`px-5 py-2.5 text-gray-600 ${flashClass(stock.id, 'cmp')}`}>{formatNum(stock.cmp)}</td>
                      <td className={`px-5 py-2.5 text-gray-600 ${flashClass(stock.id, 'presentValue')}`}>{formatNum(stock.presentValue)}</td>
                      <td className={`px-5 py-2.5 ${flashClass(stock.id, 'gainLoss')}`}><GainLossCell value={stock.gainLoss} /></td>

                      <td className="px-5 py-2.5 text-gray-600">{formatNum(stock.peRatio)}</td>
                      <td className="px-5 py-2.5 text-gray-600">{formatNum(stock.eps)}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-medium">
                    <td className="px-5 py-2.5" colSpan={3}>Sector total</td>
                    <td className="px-5 py-2.5">{sectorInvestment.toFixed(2)}</td>
                    <td className="px-5 py-2.5" colSpan={2}></td>
                    <td className="px-5 py-2.5">{sectorPresentValue.toFixed(2)}</td>
                    <td className="px-5 py-2.5"><GainLossCell value={sectorGainLoss} /></td>
                    <td className="px-5 py-2.5" colSpan={2}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}