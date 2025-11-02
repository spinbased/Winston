/**
 * Legal Assistant Service
 * Main orchestration service combining RAG + Claude
 */

import { RAGService } from './rag.service';
import { AnthropicService, ClaudeMessage } from './anthropic.service';

export interface LegalQuery {
  question: string;
  context?: {
    documentType?: string;
    legalContext?: string;
  };
  conversationHistory?: ClaudeMessage[];
}

export interface LegalResponse {
  answer: string;
  citations: string[];
  legalContext: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  retrievedChunks: number;
}

export class LegalAssistantService {
  private rag: RAGService;
  private claude: AnthropicService;

  constructor() {
    this.rag = new RAGService();
    this.claude = new AnthropicService();
  }

  /**
   * Answer a legal question
   */
  async ask(query: LegalQuery): Promise<LegalResponse> {
    console.log(`[LegalAssistant] Processing query: ${query.question.substring(0, 100)}...`);

    // Step 1: Retrieve relevant context via RAG
    const ragContext = await this.rag.retrieve(query.question, {
      topK: 15,
      documentType: query.context?.documentType,
      legalContext: query.context?.legalContext,
    });

    console.log(
      `[LegalAssistant] Retrieved ${ragContext.retrievedChunks.length} chunks, context: ${ragContext.legalContext}`
    );

    // Step 2: Generate response using Claude
    const claudeResponse = await this.claude.generate(
      query.question,
      ragContext.assembledContext,
      query.conversationHistory
    );

    console.log(
      `[LegalAssistant] Generated response (${claudeResponse.usage.inputTokens} input, ${claudeResponse.usage.outputTokens} output tokens)`
    );

    return {
      answer: claudeResponse.content,
      citations: ragContext.citations,
      legalContext: ragContext.legalContext,
      usage: claudeResponse.usage,
      retrievedChunks: ragContext.retrievedChunks.length,
    };
  }

  /**
   * Ask with streaming response
   */
  async askStream(
    query: LegalQuery,
    onChunk: (chunk: string) => void
  ): Promise<LegalResponse> {
    // Retrieve context
    const ragContext = await this.rag.retrieve(query.question, {
      topK: 15,
      documentType: query.context?.documentType,
      legalContext: query.context?.legalContext,
    });

    // Generate streaming response
    const claudeResponse = await this.claude.generateStream(
      query.question,
      ragContext.assembledContext,
      query.conversationHistory,
      onChunk
    );

    return {
      answer: claudeResponse.content,
      citations: ragContext.citations,
      legalContext: ragContext.legalContext,
      usage: claudeResponse.usage,
      retrievedChunks: ragContext.retrievedChunks.length,
    };
  }

  /**
   * Close all connections
   */
  async close() {
    await this.rag.close();
  }
}
