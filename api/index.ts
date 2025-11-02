import type { VercelRequest, VercelResponse } from '@vercel/node';
import { App, ExpressReceiver } from '@slack/bolt';
import express, { Express } from 'express';
import cors from 'cors';
import Redis from 'ioredis';
import logger from '../src/utils/logger';
import { createRateLimiter } from '../src/middleware/rate-limit';
import { healthCheck } from '../src/routes/health';
import { getMetrics } from '../src/routes/metrics';
import { registerSlackCommands } from '../src/slack/commands';

// Initialize Redis
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  enableOfflineQueue: false,
});

// Initialize Slack receiver
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET!,
  processBeforeResponse: true,
});

// Initialize Slack app
const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN!,
  receiver,
});

// Register all Slack commands
registerSlackCommands(slackApp, redis);

// Get Express app from receiver
const app: Express = receiver.app;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(createRateLimiter({ maxRequests: 20, windowMs: 60000 }));

// Routes
app.get('/health', healthCheck);
app.get('/metrics', getMetrics);

// Root route
app.get('/', (_req, res) => {
  res.json({
    name: 'Winston Legal AI',
    version: '1.0.0',
    description: 'AI Legal Defense System with 805,000+ legal documents',
    endpoints: {
      health: '/health',
      metrics: '/metrics',
      slack: '/slack/events',
    },
  });
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Export as Vercel serverless function
export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    await app(req as any, res as any);
  } catch (error) {
    logger.error('Serverless function error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
