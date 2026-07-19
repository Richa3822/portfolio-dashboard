import { EnrichedStock } from '@/lib/types';
import { GainLossCell } from './GainLossCell';

function formatNum(value: number | null, decimals = 2) {
  return value !== null ? value.toFixed(decimals) : 'N/A';
}

export function PortfolioTable({ portfolio }: { portfolio: EnrichedStock[] }) {
  // group stocks by sector
  const sectors = portfolio.reduce<Record<string, EnrichedStock[]>>((acc, stock) => {
    (acc[stock.sector] ??= []).push(stock);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(sectors).map(([sectorName, stocks]) => {
        const sectorInvestment = stocks.reduce((sum, s) => sum + s.investment, 0);
        const sectorPresentValue = stocks.reduce(
          (sum, s) => sum + (s.presentValue ?? 0), 0
        );
        const sectorGainLoss = sectorPresentValue - sectorInvestment;

        return (
          <div key={sectorName} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-900">{sectorName}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                    <th className="px-5 py-2 font-medium">Stock</th>
                    <th className="px-5 py-2 font-medium">Purchase price</th>
                    <th className="px-5 py-2 font-medium">Qty</th>
                    <th className="px-5 py-2 font-medium">Investment</th>
                    <th className="px-5 py-2 font-medium">Portfolio %</th>
                    <th className="px-5 py-2 font-medium">NSE/BSE</th>
                    <th className="px-5 py-2 font-medium">CMP</th>
                    <th className="px-5 py-2 font-medium">Present value</th>
                    <th className="px-5 py-2 font-medium">Gain/Loss</th>
                    <th className="px-5 py-2 font-medium">P/E ratio</th>
                    <th className="px-5 py-2 font-medium">EPS</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((stock) => (
                    <tr key={stock.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                      <td className="px-5 py-2.5 font-medium text-gray-900">{stock.name}</td>
                      <td className="px-5 py-2.5 text-gray-600">{stock.purchasePrice}</td>
                      <td className="px-5 py-2.5 text-gray-600">{stock.qty}</td>
                      <td className="px-5 py-2.5 text-gray-600">{stock.investment.toFixed(2)}</td>
                      <td className="px-5 py-2.5 text-gray-600">{stock.portfolioPercent.toFixed(2)}%</td>
                      <td className="px-5 py-2.5 text-gray-600">{stock.nseSymbol}</td>
                      <td className="px-5 py-2.5 text-gray-600">{formatNum(stock.cmp)}</td>
                      <td className="px-5 py-2.5 text-gray-600">{formatNum(stock.presentValue)}</td>
                      <td className="px-5 py-2.5"><GainLossCell value={stock.gainLoss} /></td>
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