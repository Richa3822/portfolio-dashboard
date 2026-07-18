import holdings from '../data/holdings.json';
import { getCachedQuote } from '../services/yahooFinance';
import { EnrichedStock } from '../types/portfolio';

export async function buildEnrichedPortfolio(): Promise<EnrichedStock[]> {
  const totalInvestment = holdings.reduce(
    (sum, s) => sum + s.purchasePrice * s.qty, 0
  );

  const enriched: EnrichedStock[] = [];

  for (const stock of holdings) {
    const quote = await getCachedQuote(stock.nseSymbol);
    const investment = stock.purchasePrice * stock.qty;

    enriched.push({
      id: stock.id,
      name: stock.name,
      sector: stock.sector,
      purchasePrice: stock.purchasePrice,
      qty: stock.qty,
      nseSymbol: stock.nseSymbol,
      investment,
      portfolioPercent: (investment / totalInvestment) * 100,
      cmp: quote.cmp,
      presentValue: quote.cmp !== null ? quote.cmp * stock.qty : null,
      gainLoss: quote.cmp !== null ? (quote.cmp * stock.qty) - investment : null,
      peRatio: quote.peRatio,
      eps: quote.eps,
      status: quote.status,
    });
  }

  return enriched;
}