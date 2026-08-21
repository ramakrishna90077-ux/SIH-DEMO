import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Server as SocketIOServer } from 'socket.io';
import { connectDB } from './config/database.js';
import { config } from './config/index.js';
import authRoutes from './routes/auth.routes.js';
import courseRoutes from './routes/course.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import noteRoutes from './routes/note.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();
const httpServer = http.createServer(app);

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));

app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, status: 'ok', environment: config.nodeEnv });
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/notes', noteRoutes);

const io = new SocketIOServer(httpServer, {
  cors: { origin: config.clientUrl, credentials: true },
});

io.on('connection', (socket) => {
  socket.on('attendance:join', (sessionId: string) => {
    if (typeof sessionId === 'string' && sessionId.length <= 100) {
      socket.join(`attendance:${sessionId}`);
    }
  });
  socket.on('attendance:leave', (sessionId: string) => {
    if (typeof sessionId === 'string' && sessionId.length <= 100) {
      socket.leave(`attendance:${sessionId}`);
    }
  });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});
app.use(errorHandler);

const start = async () => {
  await connectDB();
  httpServer.listen(config.port, () => {
    console.log(`API listening on port ${config.port}`);
  });
};

const shutdown = async (signal: string) => {
  console.log(`${signal} received, shutting down`);
  httpServer.close(async () => {
    const mongoose = await import('mongoose');
    await mongoose.default.connection.close();
    process.exit(0);
  });
};

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
