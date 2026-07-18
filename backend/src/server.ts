import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { initPortfolioSocket } from './sockets/portfolioSocket';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: 'http://localhost:3000' },
});

initPortfolioSocket(io);

const PORT = 4000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));