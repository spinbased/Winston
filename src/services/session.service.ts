/**
 * Session Management Service
 * Handles conversation history and session tracking for users
 */

import Redis from 'ioredis';
import { ClaudeMessage } from './anthropic.service';

export interface SessionMetadata {
  userId: string;
  createdAt: string;
  lastActivity: string;
}

export class SessionManager {
  private redis: Redis;
  private readonly SESSION_TTL = 24 * 60 * 60; // 24 hours
  private readonly MAX_MESSAGES = 50; // Maximum messages per session

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  /**
   * Create a new session for a user
   * @param userId - Slack user ID
   * @returns Session ID
   */
  async createSession(userId: string): Promise<string> {
    const sessionId = `session_${userId}_${Date.now()}`;

    // Set current session for user
    await this.redis.setex(
      `session:${userId}:current`,
      this.SESSION_TTL,
      sessionId
    );

    // Initialize session metadata
    const metadata: SessionMetadata = {
      userId,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    };

    await this.redis.setex(
      `session:${sessionId}:metadata`,
      this.SESSION_TTL,
      JSON.stringify(metadata)
    );

    // Initialize empty messages array
    await this.redis.setex(
      `session:${sessionId}:messages`,
      this.SESSION_TTL,
      JSON.stringify([])
    );

    console.log(`[SessionManager] Created new session: ${sessionId} for user: ${userId}`);
    return sessionId;
  }

  /**
   * Add a message to the session
   * @param sessionId - Session ID
   * @param message - Claude message to add
   */
  async addMessage(sessionId: string, message: ClaudeMessage): Promise<void> {
    const messagesKey = `session:${sessionId}:messages`;
    const metadataKey = `session:${sessionId}:metadata`;

    // Get current messages
    const messagesJson = await this.redis.get(messagesKey);
    if (!messagesJson) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const messages: ClaudeMessage[] = JSON.parse(messagesJson);

    // Add new message
    messages.push(message);

    // Keep only last MAX_MESSAGES (rolling window)
    if (messages.length > this.MAX_MESSAGES) {
      messages.splice(0, messages.length - this.MAX_MESSAGES);
    }

    // Update messages with refreshed TTL
    await this.redis.setex(
      messagesKey,
      this.SESSION_TTL,
      JSON.stringify(messages)
    );

    // Update last activity timestamp
    const metadataJson = await this.redis.get(metadataKey);
    if (metadataJson) {
      const metadata: SessionMetadata = JSON.parse(metadataJson);
      metadata.lastActivity = new Date().toISOString();
      await this.redis.setex(
        metadataKey,
        this.SESSION_TTL,
        JSON.stringify(metadata)
      );
    }

    console.log(
      `[SessionManager] Added ${message.role} message to session: ${sessionId} (${messages.length}/${this.MAX_MESSAGES})`
    );
  }

  /**
   * Get conversation history for a session
   * @param sessionId - Session ID
   * @returns Array of messages
   */
  async getHistory(sessionId: string): Promise<ClaudeMessage[]> {
    const messagesKey = `session:${sessionId}:messages`;
    const messagesJson = await this.redis.get(messagesKey);

    if (!messagesJson) {
      console.log(`[SessionManager] No history found for session: ${sessionId}`);
      return [];
    }

    const messages: ClaudeMessage[] = JSON.parse(messagesJson);
    console.log(`[SessionManager] Retrieved ${messages.length} messages for session: ${sessionId}`);
    return messages;
  }

  /**
   * Clear a session (remove all messages and metadata)
   * @param sessionId - Session ID
   */
  async clearSession(sessionId: string): Promise<void> {
    const messagesKey = `session:${sessionId}:messages`;
    const metadataKey = `session:${sessionId}:metadata`;

    await this.redis.del(messagesKey);
    await this.redis.del(metadataKey);

    console.log(`[SessionManager] Cleared session: ${sessionId}`);
  }

  /**
   * Get current session ID for a user
   * @param userId - Slack user ID
   * @returns Session ID or null if no active session
   */
  async getUserSession(userId: string): Promise<string | null> {
    const sessionId = await this.redis.get(`session:${userId}:current`);

    if (!sessionId) {
      console.log(`[SessionManager] No active session for user: ${userId}`);
      return null;
    }

    // Verify session still exists
    const exists = await this.redis.exists(`session:${sessionId}:messages`);
    if (!exists) {
      console.log(`[SessionManager] Session expired for user: ${userId}`);
      await this.redis.del(`session:${userId}:current`);
      return null;
    }

    console.log(`[SessionManager] Active session for user ${userId}: ${sessionId}`);
    return sessionId;
  }

  /**
   * Get session metadata
   * @param sessionId - Session ID
   * @returns Session metadata or null
   */
  async getMetadata(sessionId: string): Promise<SessionMetadata | null> {
    const metadataJson = await this.redis.get(`session:${sessionId}:metadata`);
    if (!metadataJson) {
      return null;
    }
    return JSON.parse(metadataJson);
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    await this.redis.quit();
  }
}
