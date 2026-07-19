import { EnrichedStock } from "./types";

export interface SectorSummary {
  sector: string;
  investment: number;
  presentValue: number;
  gainLoss: number;
}
export function groupBySector(portfolio: EnrichedStock[]): Record<string, EnrichedStock[]> {
  return portfolio.reduce<Record<string, EnrichedStock[]>>((acc, stock) => {
    (acc[stock.sector] ??= []).push(stock);
    return acc;
  }, {});
}

export function getSectorSummaries(portfolio: EnrichedStock[]): SectorSummary[] {
  const grouped = groupBySector(portfolio);

  return Object.entries(grouped).map(([sector, stocks]) => {
    const investment = stocks.reduce((sum, s) => sum + s.investment, 0);
    const presentValue = stocks.reduce((sum, s) => sum + (s.presentValue ?? 0), 0);
    return { sector, investment, presentValue, gainLoss: presentValue - investment };
  });
}

export function getPortfolioTotals(portfolio: EnrichedStock[]) {
  const totalInvestment = portfolio.reduce((sum, s) => sum + s.investment, 0);
  const totalPresentValue = portfolio.reduce((sum, s) => sum + (s.presentValue ?? 0), 0);
  const totalGainLoss = totalPresentValue - totalInvestment;
  return { totalInvestment, totalPresentValue, totalGainLoss };
}