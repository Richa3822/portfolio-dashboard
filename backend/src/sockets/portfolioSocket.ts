import { Server } from 'socket.io';
import { buildEnrichedPortfolio } from '../jobs/priceRefreshJob';

const REFRESH_INTERVAL_MS = 15000;

export function initPortfolioSocket(io: Server) {
  io.on('connection', async (socket) => {
    console.log('Client connected:', socket.id);

    const portfolio = await buildEnrichedPortfolio();
    socket.emit('portfolio:update', portfolio);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  setInterval(async () => {
    const portfolio = await buildEnrichedPortfolio();
    io.emit('portfolio:update', portfolio);
    console.log('Broadcasted portfolio update to', io.engine.clientsCount, 'clients');
  }, REFRESH_INTERVAL_MS);
}