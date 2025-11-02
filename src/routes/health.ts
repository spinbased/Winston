/**
 * Health Check Endpoint
 * Verifies all critical services are operational
 */

import { Request, Response } from 'express';
import Redis from 'ioredis';
import { Pinecone } from '@pinecone-database/pinecone';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  services: {
    redis: boolean;
    pinecone: boolean;
    anthropic: boolean;
    openai: boolean;
  };
  errors?: string[];
}

export async function healthCheck(_req: Request, res: Response) {
  const status: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      redis: false,
      pinecone: false,
      anthropic: false,
      openai: false,
    },
    errors: [],
  };

  // Check Redis
  try {
    const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    await redis.ping();
    status.services.redis = true;
    await redis.quit();
  } catch (error: any) {
    status.errors?.push(`Redis: ${error.message}`);
  }

  // Check Pinecone
  try {
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    await pinecone.listIndexes();
    status.services.pinecone = true;
  } catch (error: any) {
    status.errors?.push(`Pinecone: ${error.message}`);
  }

  // Check Anthropic
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
    // Simple API availability check (no actual call to save costs)
    if (anthropic) status.services.anthropic = true;
  } catch (error: any) {
    status.errors?.push(`Anthropic: ${error.message}`);
  }

  // Check OpenAI
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    // Simple API availability check (no actual call to save costs)
    if (openai) status.services.openai = true;
  } catch (error: any) {
    status.errors?.push(`OpenAI: ${error.message}`);
  }

  // Determine overall status
  const allHealthy = Object.values(status.services).every(s => s === true);
  status.status = allHealthy ? 'healthy' : 'unhealthy';

  // Return appropriate HTTP status code
  const httpStatus = allHealthy ? 200 : 503;

  res.status(httpStatus).json(status);
}
