// src/services/yahooFinance.ts
import YahooFinance from 'yahoo-finance2';
import { redis } from '../cache/redisClient';
import { StockQuote } from '../types/portfolio';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

export async function safeFetchQuote(nseSymbol: string): Promise<StockQuote> {
  try {
    const quote = await yahooFinance.quote(`${nseSymbol}.NS`);
    return {
      cmp: quote.regularMarketPrice ?? null,
      peRatio: quote.trailingPE ?? null,       // null naturally covers Easemytrip's case
      eps: quote.epsTrailingTwelveMonths ?? null,
      status: 'ok',
    };
  } catch (err) {
    console.error(`Quote fetch failed for ${nseSymbol}:`, (err as Error).message);
    return { cmp: null, peRatio: null, eps: null, status: 'unavailable' };
  }
}

const CACHE_TTL_SECONDS = 15; // matches your 15-sec refresh requirement

export async function getCachedQuote(nseSymbol: string): Promise<StockQuote> {
  const cacheKey = `quote:${nseSymbol}`;

  // 1. Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached) as StockQuote;
  }

  // 2. Cache miss -> fetch fresh from Yahoo
  const freshQuote = await safeFetchQuote(nseSymbol);

  // 3. Store in cache with TTL (even failures, briefly, to avoid hammering a dead ticker)
  await redis.set(cacheKey, JSON.stringify(freshQuote), 'EX', CACHE_TTL_SECONDS);

  return freshQuote;
}