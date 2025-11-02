/**
 * Response Cache Service
 * Caches legal assistant responses based on semantic similarity
 */

import Redis from 'ioredis';
import { LegalResponse } from './legal-assistant.service';

export interface CachedResponse {
  embedding: number[];
  response: LegalResponse;
  timestamp: string;
  queryText: string;
}

export class ResponseCache {
  private redis: Redis;
  private readonly SIMILARITY_THRESHOLD = 0.98; // 98% similarity required for cache hit

  // TTL constants (in seconds)
  private readonly TTL_DEFINITION = 7 * 24 * 60 * 60; // 7 days for definitions
  private readonly TTL_CONSTITUTIONAL = 30 * 24 * 60 * 60; // 30 days for constitutional
  private readonly TTL_GENERAL = 24 * 60 * 60; // 1 day for general queries

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  /**
   * Get cached response if query is similar enough
   * @param queryEmbedding - Embedding vector for the query
   * @param queryText - Original query text (for logging)
   * @returns Cached response or null if no match
   */
  async get(
    queryEmbedding: number[],
    queryText: string
  ): Promise<LegalResponse | null> {
    // Get all cache keys
    const keys = await this.redis.keys('cache:query:*');

    if (keys.length === 0) {
      console.log('[ResponseCache] Cache empty, no hits possible');
      return null;
    }

    let bestMatch: CachedResponse | null = null;
    let bestSimilarity = 0;

    // Check each cached entry for similarity
    for (const key of keys) {
      const cached = await this.redis.get(key);
      if (!cached) continue;

      try {
        const cachedData: CachedResponse = JSON.parse(cached);
        const similarity = this.cosineSimilarity(queryEmbedding, cachedData.embedding);

        if (similarity > bestSimilarity) {
          bestSimilarity = similarity;
          bestMatch = cachedData;
        }
      } catch (error) {
        console.error(`[ResponseCache] Error parsing cached entry: ${key}`, error);
      }
    }

    // Check if best match exceeds threshold
    if (bestMatch && bestSimilarity >= this.SIMILARITY_THRESHOLD) {
      console.log(
        `[ResponseCache] ✅ Cache HIT (similarity: ${(bestSimilarity * 100).toFixed(2)}%) for query: "${queryText.substring(0, 50)}..."`
      );
      console.log(`[ResponseCache]    Matched with: "${bestMatch.queryText.substring(0, 50)}..."`);
      return bestMatch.response;
    }

    console.log(
      `[ResponseCache] ❌ Cache MISS (best: ${(bestSimilarity * 100).toFixed(2)}%) for query: "${queryText.substring(0, 50)}..."`
    );
    return null;
  }

  /**
   * Cache a response with appropriate TTL
   * @param queryEmbedding - Embedding vector for the query
   * @param queryText - Original query text
   * @param response - Legal response to cache
   * @param ttl - Optional TTL override (seconds)
   */
  async set(
    queryEmbedding: number[],
    queryText: string,
    response: LegalResponse,
    ttl?: number
  ): Promise<void> {
    // Determine TTL based on legal context if not provided
    const cacheTTL = ttl || this.determineTTL(response.legalContext, queryText);

    // Create cache key from query hash
    const hash = this.hashEmbedding(queryEmbedding);
    const key = `cache:query:${hash}`;

    // Create cached response object
    const cachedData: CachedResponse = {
      embedding: queryEmbedding,
      response,
      timestamp: new Date().toISOString(),
      queryText,
    };

    // Store in Redis with TTL
    await this.redis.setex(key, cacheTTL, JSON.stringify(cachedData));

    console.log(
      `[ResponseCache] Cached response for "${queryText.substring(0, 50)}..." (TTL: ${cacheTTL}s)`
    );
  }

  /**
   * Invalidate cache entries matching a pattern
   * @param pattern - Redis key pattern (e.g., "cache:query:*")
   */
  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);

    if (keys.length === 0) {
      console.log(`[ResponseCache] No keys matching pattern: ${pattern}`);
      return;
    }

    await this.redis.del(...keys);
    console.log(`[ResponseCache] Invalidated ${keys.length} cache entries matching: ${pattern}`);
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    totalEntries: number;
    oldestEntry: string | null;
    newestEntry: string | null;
  }> {
    const keys = await this.redis.keys('cache:query:*');

    if (keys.length === 0) {
      return { totalEntries: 0, oldestEntry: null, newestEntry: null };
    }

    let oldestTimestamp = new Date().toISOString();
    let newestTimestamp = '';

    for (const key of keys) {
      const cached = await this.redis.get(key);
      if (!cached) continue;

      try {
        const cachedData: CachedResponse = JSON.parse(cached);
        if (cachedData.timestamp < oldestTimestamp) {
          oldestTimestamp = cachedData.timestamp;
        }
        if (cachedData.timestamp > newestTimestamp) {
          newestTimestamp = cachedData.timestamp;
        }
      } catch (error) {
        // Skip invalid entries
      }
    }

    return {
      totalEntries: keys.length,
      oldestEntry: oldestTimestamp,
      newestEntry: newestTimestamp || null,
    };
  }

  /**
   * Calculate cosine similarity between two embedding vectors
   */
  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) {
      throw new Error('Vectors must have same length');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Determine appropriate TTL based on query type
   */
  private determineTTL(legalContext: string, queryText: string): number {
    const lowerQuery = queryText.toLowerCase();

    // Legal definitions get longer cache (stable over time)
    if (
      lowerQuery.includes('define') ||
      lowerQuery.includes('definition') ||
      lowerQuery.includes('what is') ||
      lowerQuery.includes('what does') ||
      lowerQuery.includes('meaning of')
    ) {
      return this.TTL_DEFINITION;
    }

    // Constitutional queries get longest cache (never changes)
    if (
      legalContext === 'constitutional' ||
      lowerQuery.includes('constitution') ||
      lowerQuery.includes('amendment') ||
      lowerQuery.includes('bill of rights')
    ) {
      return this.TTL_CONSTITUTIONAL;
    }

    // General queries get shorter cache
    return this.TTL_GENERAL;
  }

  /**
   * Hash an embedding vector for use as cache key
   */
  private hashEmbedding(embedding: number[]): string {
    // Use first 10 values to create a hash
    const sample = embedding.slice(0, 10).map(n => n.toFixed(6)).join(',');
    let hash = 0;
    for (let i = 0; i < sample.length; i++) {
      const char = sample.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    await this.redis.quit();
  }
}
