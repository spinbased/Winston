/**
 * Vector Database Service
 * Handles all interactions with Pinecone vector database
 */

import { Pinecone } from '@pinecone-database/pinecone';

export interface SearchResult {
  id: string;
  score: number;
  text: string;
  metadata: {
    source: string;
    documentType: string;
    legalContext: string;
    term?: string;
    edition?: string;
    author?: string;
    article?: string;
    amendment?: string;
  };
}

export interface SearchOptions {
  topK?: number;
  filter?: {
    documentType?: string;
    legalContext?: string;
    term?: string;
    author?: string;
  };
}

export class VectorDBService {
  private pinecone: Pinecone;
  private indexName: string;

  constructor() {
    const apiKey = process.env.PINECONE_API_KEY;

    if (!apiKey || apiKey.includes('placeholder')) {
      console.warn('⚠️  PINECONE_API_KEY not configured - vector search will be limited');
      this.pinecone = new Pinecone({ apiKey: 'placeholder' });
    } else {
      this.pinecone = new Pinecone({ apiKey });
    }

    this.indexName = process.env.PINECONE_INDEX_NAME || 'legal-knowledge';
  }

  /**
   * Search for similar vectors
   */
  async search(
    embedding: number[],
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    const { topK = 15, filter } = options;

    const index = this.pinecone.index(this.indexName);

    const queryOptions: any = {
      vector: embedding,
      topK,
      includeMetadata: true,
    };

    // Add filters if provided
    if (filter && Object.keys(filter).length > 0) {
      queryOptions.filter = {};
      if (filter.documentType) {
        queryOptions.filter.documentType = { $eq: filter.documentType };
      }
      if (filter.legalContext) {
        queryOptions.filter.legalContext = { $eq: filter.legalContext };
      }
      if (filter.term) {
        queryOptions.filter.term = { $eq: filter.term };
      }
      if (filter.author) {
        queryOptions.filter.author = { $eq: filter.author };
      }
    }

    const results = await index.query(queryOptions);

    return (results.matches || []).map(match => ({
      id: match.id,
      score: match.score || 0,
      text: match.metadata?.text as string || '',
      metadata: {
        source: match.metadata?.source as string || '',
        documentType: match.metadata?.documentType as string || '',
        legalContext: match.metadata?.legalContext as string || '',
        term: match.metadata?.term as string | undefined,
        edition: match.metadata?.edition as string | undefined,
        author: match.metadata?.author as string | undefined,
        article: match.metadata?.article as string | undefined,
        amendment: match.metadata?.amendment as string | undefined,
      },
    }));
  }

  /**
   * Get index statistics
   */
  async getStats() {
    const index = this.pinecone.index(this.indexName);
    return await index.describeIndexStats();
  }
}
