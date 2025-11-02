/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting requests per user
 */

import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60000, // 1 minute
  maxRequests: 20,
  message: 'Too many requests, please try again later.',
};

/**
 * Create rate limiter middleware
 */
export function createRateLimiter(config: Partial<RateLimitConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract user identifier (Slack user_id or IP address)
      const userId =
        (req.body as any)?.user_id ||
        (req.body as any)?.event?.user ||
        req.ip ||
        'unknown';

      const key = `rate_limit:${userId}`;
      const now = Date.now();
      const windowStart = now - finalConfig.windowMs;

      // Remove old entries
      await redis.zremrangebyscore(key, 0, windowStart);

      // Count requests in current window
      const requestCount = await redis.zcard(key);

      if (requestCount >= finalConfig.maxRequests) {
        res.status(429).json({
          error: 'rate_limit_exceeded',
          message: finalConfig.message,
          retryAfter: Math.ceil(finalConfig.windowMs / 1000),
        });
        return;
      }

      // Add current request
      await redis.zadd(key, now, `${now}-${Math.random()}`);
      await redis.expire(key, Math.ceil(finalConfig.windowMs / 1000));

      next();
    } catch (error) {
      // On error, allow request but log
      console.error('Rate limiter error:', error);
      next();
    }
  };
}

/**
 * Rate limiter for Slack commands
 */
export const slackRateLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 20,
  message: 'You are sending commands too quickly. Please wait a moment.',
});

/**
 * Rate limiter for API endpoints
 */
export const apiRateLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 100,
  message: 'API rate limit exceeded. Please try again later.',
});

/**
 * Strict rate limiter for expensive operations
 */
export const strictRateLimiter = createRateLimiter({
  windowMs: 300000, // 5 minutes
  maxRequests: 10,
  message: 'You have exceeded the rate limit for this operation.',
});
