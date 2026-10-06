import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import journalRoutes from './routes/journalRoutes.js';
import habitsRoutes from './routes/habitsRoutes.js';
import remindersRoutes from './routes/remindersRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import syncRoutes from './routes/syncRoutes.js';

const app: Express = express();

// Middlewares
app.use(
  cors({
    origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(','),
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'DayScribe Backend API',
    time: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/habits', habitsRoutes);
app.use('/api/reminders', remindersRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/sync', syncRoutes);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: config.nodeEnv === 'development' ? err.message : undefined,
  });
});

// Start Server
app.listen(config.port, () => {
  console.log(`🕯️ DayScribe server running on port ${config.port} (${config.nodeEnv})`);
  console.log(`🚀 API endpoint: http://localhost:${config.port}/api`);
});

export default app;
