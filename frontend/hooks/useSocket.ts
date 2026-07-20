'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { EnrichedStock } from '@/lib/types';

const FLASH_FIELDS = ['cmp', 'presentValue', 'gainLoss'] as const;
type FlashField = typeof FLASH_FIELDS[number];

// e.g. { 3: Set(['cmp', 'gainLoss']), 7: Set(['presentValue']) }
export type FlashMap = Record<number, Set<FlashField>>;

function diffPortfolios(prev: EnrichedStock[], next: EnrichedStock[]): FlashMap {
  const prevById = new Map(prev.map((s) => [s.id, s]));
  const flashes: FlashMap = {};

  for (const stock of next) {
    const prevStock = prevById.get(stock.id);
    if (!prevStock) continue; // first load, nothing to compare against

    const changed = new Set<FlashField>();
    for (const field of FLASH_FIELDS) {
      if (stock[field] !== prevStock[field]) {
        changed.add(field);
      }
    }
    if (changed.size > 0) {
      flashes[stock.id] = changed;
    }
  }

  return flashes;
}

export function usePortfolioSocket() {
  const [portfolio, setPortfolio] = useState<EnrichedStock[]>([]);
  const [connected, setConnected] = useState(false);
  const [flashMap, setFlashMap] = useState<FlashMap>({});
  const previousPortfolioRef = useRef<EnrichedStock[]>([]);

  useEffect(() => {
    const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000');
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('portfolio:update', (data: EnrichedStock[]) => {
      const flashes = diffPortfolios(previousPortfolioRef.current, data);

      setPortfolio(data);
      setFlashMap(flashes);
      previousPortfolioRef.current = data;

      // clear the flash after animation duration so it doesn't stay highlighted forever
      if (Object.keys(flashes).length > 0) {
        setTimeout(() => setFlashMap({}), 1000);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return { portfolio, connected, flashMap };
}