/**
 * Metrics Endpoint
 * Provides system metrics and statistics
 */

import { Request, Response } from 'express';
import Redis from 'ioredis';

interface SystemMetrics {
  timestamp: string;
  uptime: number;
  queries: {
    total: number;
    last24Hours: number;
  };
  cache: {
    hitRate: number;
    totalHits: number;
    totalMisses: number;
  };
  performance: {
    averageResponseTime: number;
    p95ResponseTime: number;
  };
  users: {
    activeToday: number;
    activeLast7Days: number;
  };
}

const startTime = Date.now();

export async function getMetrics(_req: Request, res: Response) {
  try {
    const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

    // Get metrics from Redis
    const totalQueries = await redis.get('metrics:queries:total') || '0';
    const queriesLast24h = await redis.get('metrics:queries:24h') || '0';
    const cacheHits = await redis.get('metrics:cache:hits') || '0';
    const cacheMisses = await redis.get('metrics:cache:misses') || '0';
    const totalResponseTime = await redis.get('metrics:response:total') || '0';
    const responseCount = await redis.get('metrics:response:count') || '0';

    // Calculate cache hit rate
    const hits = parseInt(cacheHits);
    const misses = parseInt(cacheMisses);
    const hitRate = hits + misses > 0 ? (hits / (hits + misses)) * 100 : 0;

    // Calculate average response time
    const avgResponseTime = parseInt(responseCount) > 0
      ? parseInt(totalResponseTime) / parseInt(responseCount)
      : 0;

    // Get active users
    const usersToday = await redis.scard('metrics:users:today') || 0;
    const usersWeek = await redis.scard('metrics:users:week') || 0;

    const metrics: SystemMetrics = {
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - startTime) / 1000),
      queries: {
        total: parseInt(totalQueries),
        last24Hours: parseInt(queriesLast24h),
      },
      cache: {
        hitRate: Math.round(hitRate * 100) / 100,
        totalHits: hits,
        totalMisses: misses,
      },
      performance: {
        averageResponseTime: Math.round(avgResponseTime),
        p95ResponseTime: 0, // TODO: Implement percentile calculation
      },
      users: {
        activeToday: usersToday,
        activeLast7Days: usersWeek,
      },
    };

    await redis.quit();

    res.json(metrics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
