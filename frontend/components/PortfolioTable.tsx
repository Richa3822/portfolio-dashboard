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
    <div className="overflow-x-auto">
      {Object.entries(sectors).map(([sectorName, stocks]) => {
        const sectorInvestment = stocks.reduce((sum, s) => sum + s.investment, 0);
        const sectorPresentValue = stocks.reduce(
          (sum, s) => sum + (s.presentValue ?? 0), 0
        );
        const sectorGainLoss = sectorPresentValue - sectorInvestment;

        return (
          <div key={sectorName} className="mb-8">
            <h2 className="text-lg font-semibold mb-2">{sectorName}</h2>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-300 text-left">
                  <th className="p-2">Stock</th>
                  <th className="p-2">Purchase Price</th>
                  <th className="p-2">Qty</th>
                  <th className="p-2">Investment</th>
                  <th className="p-2">CMP</th>
                  <th className="p-2">Present Value</th>
                  <th className="p-2">Gain/Loss</th>
                  <th className="p-2">P/E Ratio</th>
                  <th className="p-2">EPS</th>
                  <th className="p-2">NSE/BSE</th>
                  <th className="p-2">Portfolio %</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock) => (
                  <tr key={stock.id} className="border-b border-gray-100">
                    <td className="p-2">{stock.name}</td>
                    <td className="p-2">{stock.purchasePrice}</td>
                    <td className="p-2">{stock.qty}</td>
                    <td className="p-2">{stock.investment.toFixed(2)}</td>
                    <td className="p-2">{formatNum(stock.cmp)}</td>
                    <td className="p-2">{formatNum(stock.presentValue)}</td>
                    <td className="p-2"><GainLossCell value={stock.gainLoss} /></td>
                    <td className="p-2">{formatNum(stock.peRatio)}</td>
                    <td className="p-2">{formatNum(stock.eps)}</td>
                    <td className="p-2">{stock.nseSymbol}</td>
                    <td className="p-2">{formatNum(stock.portfolioPercent)}%</td>
                  </tr>
                ))}
                {/* sector summary row */}
                <tr className="font-semibold bg-gray-50">
                  <td className="p-2" colSpan={3}>Sector Total</td>
                  <td className="p-2">{sectorInvestment.toFixed(2)}</td>
                  <td className="p-2"></td>
                  <td className="p-2">{sectorPresentValue.toFixed(2)}</td>
                  <td className="p-2"><GainLossCell value={sectorGainLoss} /></td>
                  <td className="p-2" colSpan={2}></td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}