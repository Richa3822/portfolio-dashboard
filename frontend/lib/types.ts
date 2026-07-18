export interface EnrichedStock {
    id: number;
    name: string;
    sector: string;
    purchasePrice: number;
    qty: number;
    nseSymbol: string;
    investment: number;
    portfolioPercent: number;
    cmp: number | null;
    presentValue: number | null;
    gainLoss: number | null;
    peRatio: number | null;
    eps: number | null;
    status: 'ok' | 'unavailable';
  }