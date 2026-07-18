export interface StockQuote {
    cmp: number | null;
    peRatio: number | null;
    eps: number | null;
    status: 'ok' | 'unavailable';
  }
  
  export interface Holding {
    id: number;
    name: string;
    sector: string;
    purchasePrice: number;
    qty: number;
    nseSymbol: string;
  }
  
  export interface EnrichedStock extends Holding {
    investment: number;
    portfolioPercent: number;
    cmp: number | null;
    presentValue: number | null;
    gainLoss: number | null;
    peRatio: number | null;
    eps: number | null;
    status: 'ok' | 'unavailable';
  }