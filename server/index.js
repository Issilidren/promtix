import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import authRoutes from './routes/auth.js';
import gameRoutes from './routes/game.js';
import playerRoutes from './routes/players.js';
import worldRoutes from './routes/world.js';
import { initDB } from './db/index.js';
import { initPvP } from './socket/pvpHandler.js';
import { initCoop } from './socket/coopHandler.js';

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../.env') });

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }
});

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/world', worldRoutes);

app.get('/health', (_req, res) => res.json({ status: 'online', game: 'Promtix' }));

if (process.env.NODE_ENV === 'production') {
  const clientDist = join(dirname(fileURLToPath(import.meta.url)), '../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => res.sendFile(join(clientDist, 'index.html')));
}

initPvP(io);
initCoop(io);

const PORT = process.env.PORT || 3001;

initDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Promtix running on port ${PORT}`);
  });
});
