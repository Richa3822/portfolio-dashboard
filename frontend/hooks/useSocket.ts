'use client';

import { EnrichedStock } from '@/lib/types';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function usePortfolioSocket() {
  const [portfolio, setPortfolio] = useState<EnrichedStock[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket: Socket = io('http://localhost:4000');

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('portfolio:update', (data: EnrichedStock[]) => {
      setPortfolio(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return { portfolio, connected };
}