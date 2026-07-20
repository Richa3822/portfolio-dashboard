import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { initPortfolioSocket } from './sockets/portfolioSocket';

const app = express();
app.use(cors());

const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: FRONTEND_URL },
});

initPortfolioSocket(io);

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));