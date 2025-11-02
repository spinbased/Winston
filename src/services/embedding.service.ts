/**
 * Embedding Service
 * Generates embeddings for text using OpenAI
 */

import OpenAI from 'openai';
import Redis from 'ioredis';

export class EmbeddingService {
  private openai: OpenAI;
  private redis: Redis;
  private model = 'text-embedding-3-large';
  private dimensions = 1536;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey.includes('placeholder')) {
      console.warn('⚠️  OPENAI_API_KEY not configured - embeddings will be limited');
      this.openai = new OpenAI({ apiKey: 'sk-placeholder' });
    } else {
      this.openai = new OpenAI({ apiKey });
    }

    // Initialize Redis for caching
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  /**
   * Generate embedding for text with caching
   */
  async embed(text: string): Promise<number[]> {
    // Check cache first
    const cacheKey = `embedding:${this.hashText(text)}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    // Generate embedding
    const response = await this.openai.embeddings.create({
      model: this.model,
      input: text,
      dimensions: this.dimensions,
    });

    const embedding = response.data[0].embedding;

    // Cache for 7 days
    await this.redis.setex(cacheKey, 7 * 24 * 60 * 60, JSON.stringify(embedding));

    return embedding;
  }

  /**
   * Generate embeddings for multiple texts
   */
  async embedBatch(texts: string[]): Promise<number[][]> {
    const response = await this.openai.embeddings.create({
      model: this.model,
      input: texts,
      dimensions: this.dimensions,
    });

    return response.data.map(item => item.embedding);
  }

  /**
   * Simple hash function for cache keys
   */
  private hashText(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  /**
   * Close connections
   */
  async close() {
    await this.redis.quit();
  }
}
