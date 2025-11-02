/**
 * Anthropic Service
 * Handles all interactions with Claude Haiku 4.5
 */

import Anthropic from '@anthropic-ai/sdk';
import { LEGAL_EXPERT_PROMPT } from '../prompts/legal-expert';

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

export class AnthropicService {
  private client: Anthropic;
  private model = 'claude-haiku-4-20250514'; // Claude Haiku 4.5

  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Generate legal response using Claude
   */
  async generate(
    userMessage: string,
    ragContext: string,
    conversationHistory: ClaudeMessage[] = []
  ): Promise<ClaudeResponse> {
    // Assemble messages
    const messages: ClaudeMessage[] = [
      ...conversationHistory,
      {
        role: 'user',
        content: this.assemblePrompt(userMessage, ragContext),
      },
    ];

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 4096,
        temperature: 0.3, // Lower for precise legal reasoning
        system: LEGAL_EXPERT_PROMPT,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      return {
        content: content.text,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
      };
    } catch (error: any) {
      console.error('Error calling Claude API:', error);
      throw new Error(`Claude API error: ${error.message}`);
    }
  }

  /**
   * Assemble prompt with RAG context
   */
  private assemblePrompt(userMessage: string, ragContext: string): string {
    return `RETRIEVED LEGAL CONTEXT:
${ragContext}

---

USER QUESTION:
${userMessage}

---

Analyze this legal question using the retrieved context above. Provide a comprehensive legal response following the format specified in your system prompt. Include legal analysis, plain English explanation, specific citations, practical strategy, and any necessary warnings.`;
  }

  /**
   * Generate streaming response (for real-time updates)
   */
  async generateStream(
    userMessage: string,
    ragContext: string,
    conversationHistory: ClaudeMessage[] = [],
    onChunk: (chunk: string) => void
  ): Promise<ClaudeResponse> {
    const messages: ClaudeMessage[] = [
      ...conversationHistory,
      {
        role: 'user',
        content: this.assemblePrompt(userMessage, ragContext),
      },
    ];

    let fullContent = '';
    let inputTokens = 0;
    let outputTokens = 0;

    const stream = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      temperature: 0.3,
      system: LEGAL_EXPERT_PROMPT,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      stream: true,
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        const chunk = event.delta.text;
        fullContent += chunk;
        onChunk(chunk);
      } else if (event.type === 'message_start') {
        inputTokens = event.message.usage.input_tokens;
      } else if (event.type === 'message_delta') {
        outputTokens = event.usage.output_tokens;
      }
    }

    return {
      content: fullContent,
      usage: {
        inputTokens,
        outputTokens,
      },
    };
  }
}
