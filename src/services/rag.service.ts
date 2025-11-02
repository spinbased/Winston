/**
 * RAG (Retrieval-Augmented Generation) Service
 * Orchestrates semantic search and context assembly
 */

import { VectorDBService, SearchResult } from './vector-db.service';
import { EmbeddingService } from './embedding.service';

export interface RAGContext {
  retrievedChunks: SearchResult[];
  assembledContext: string;
  citations: string[];
  legalContext: 'constitutional' | 'common' | 'sovereign' | 'mixed';
}

export interface RAGOptions {
  topK?: number;
  documentType?: string;
  legalContext?: string;
}

export class RAGService {
  private vectorDB: VectorDBService;
  private embedding: EmbeddingService;

  constructor() {
    this.vectorDB = new VectorDBService();
    this.embedding = new EmbeddingService();
  }

  /**
   * Retrieve relevant context for a query
   */
  async retrieve(query: string, options: RAGOptions = {}): Promise<RAGContext> {
    const { topK = 15, documentType, legalContext } = options;

    // Generate query embedding
    const queryEmbedding = await this.embedding.embed(query);

    // Search vector database
    const results = await this.vectorDB.search(queryEmbedding, {
      topK,
      filter: {
        documentType,
        legalContext,
      },
    });

    // Assemble context
    const assembledContext = this.assembleContext(results);

    // Extract citations
    const citations = this.extractCitations(results);

    // Determine legal context
    const determinedContext = this.determineLegalContext(results);

    return {
      retrievedChunks: results,
      assembledContext,
      citations,
      legalContext: determinedContext,
    };
  }

  /**
   * Assemble retrieved chunks into coherent context
   */
  private assembleContext(results: SearchResult[]): string {
    if (results.length === 0) {
      return 'No relevant legal information found.';
    }

    const contextParts: string[] = [];

    // Group by document type
    const byType = results.reduce((acc, result) => {
      const type = result.metadata.documentType;
      if (!acc[type]) acc[type] = [];
      acc[type].push(result);
      return acc;
    }, {} as Record<string, SearchResult[]>);

    // Add definitions first
    if (byType.definition) {
      contextParts.push('LEGAL DEFINITIONS:');
      byType.definition.forEach((result, i) => {
        contextParts.push(`${i + 1}. ${result.text}`);
      });
      contextParts.push('');
    }

    // Add constitutional references
    if (byType.constitutional) {
      contextParts.push('CONSTITUTIONAL PROVISIONS:');
      byType.constitutional.forEach((result, i) => {
        contextParts.push(`${i + 1}. ${result.text}`);
      });
      contextParts.push('');
    }

    // Add founding documents
    if (byType.founding) {
      contextParts.push('FOUNDING PRINCIPLES:');
      byType.founding.forEach((result, i) => {
        contextParts.push(`${i + 1}. ${result.text}`);
      });
      contextParts.push('');
    }

    // Add other types
    for (const [type, chunks] of Object.entries(byType)) {
      if (type !== 'definition' && type !== 'constitutional' && type !== 'founding') {
        contextParts.push(`${type.toUpperCase()}:`);
        chunks.forEach((result, i) => {
          contextParts.push(`${i + 1}. ${result.text}`);
        });
        contextParts.push('');
      }
    }

    return contextParts.join('\n');
  }

  /**
   * Extract citations from results
   */
  private extractCitations(results: SearchResult[]): string[] {
    const citations = new Set<string>();

    results.forEach(result => {
      if (result.metadata.source) {
        citations.add(result.metadata.source);
      }

      // Add specific citations based on metadata
      if (result.metadata.term && result.metadata.edition) {
        citations.add(`Black's Law Dictionary (${result.metadata.edition})`);
      }

      if (result.metadata.amendment) {
        citations.add(`US Constitution, ${result.metadata.amendment}`);
      }

      if (result.metadata.article) {
        citations.add(`US Constitution, Article ${result.metadata.article}`);
      }

      if (result.metadata.author) {
        citations.add(`${result.metadata.author}`);
      }
    });

    return Array.from(citations);
  }

  /**
   * Determine primary legal context from results
   */
  private determineLegalContext(
    results: SearchResult[]
  ): 'constitutional' | 'common' | 'sovereign' | 'mixed' {
    if (results.length === 0) return 'mixed';

    const contexts = results.map(r => r.metadata.legalContext);
    const contextCounts = contexts.reduce((acc, context) => {
      acc[context] = (acc[context] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const primaryContext = Object.entries(contextCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

    // If multiple contexts are well-represented, mark as mixed
    const uniqueContexts = Object.keys(contextCounts).length;
    if (uniqueContexts > 1) {
      return 'mixed';
    }

    return (primaryContext as any) || 'mixed';
  }

  /**
   * Close connections
   */
  async close() {
    await this.embedding.close();
  }
}
