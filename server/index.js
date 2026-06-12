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

const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

function corsOrigin(origin, callback) {
  // Allow requests with no origin (server-to-server, curl, etc.)
  if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
  callback(new Error(`CORS: origin ${origin} not allowed`));
}

const io = new Server(httpServer, {
  cors: { origin: corsOrigin, credentials: true }
});

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/world', worldRoutes);

app.get('/health', (_req, res) => res.json({ status: 'online', game: 'Promtix' }));


initPvP(io);
initCoop(io);

const PORT = process.env.PORT || 3001;

initDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Promtix running on port ${PORT}`);
  });
});
