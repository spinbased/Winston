/**
 * RAG (Retrieval-Augmented Generation) Module
 * Integrates Pinecone vector database for legal knowledge retrieval
 */

import { Pinecone } from '@pinecone-database/pinecone';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Pinecone (only if API key is set)
let pinecone: Pinecone | null = null;
let pineconeIndex: any = null;

if (process.env.PINECONE_API_KEY && !process.env.PINECONE_API_KEY.includes('placeholder')) {
  try {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    // Connect to index (create if doesn't exist)
    const indexName = process.env.PINECONE_INDEX || 'winston-legal-kb';
    pineconeIndex = pinecone.index(indexName);

    console.log(`✅ Pinecone connected: ${indexName}`);
  } catch (error) {
    console.error('❌ Pinecone initialization failed:', error);
  }
}

// Generate embeddings using Claude (alternative: use a dedicated embedding model)
export async function generateEmbedding(text: string, _anthropic: Anthropic): Promise<number[]> {
  // For now, use a simple text-to-vector approach
  // In production, you'd use a dedicated embedding model like text-embedding-ada-002
  // or Claude's embedding capabilities

  // Placeholder: Convert text to simple vector (this should be replaced with proper embeddings)
  // This is a dummy implementation - replace with actual embedding API
  const words = text.toLowerCase().split(/\s+/);
  const vector = new Array(1536).fill(0); // Standard embedding dimension

  // Simple hash-based embedding (NOT for production - use proper embedding model)
  words.forEach((word) => {
    const hash = word.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    vector[hash % 1536] += 1;
  });

  // Normalize
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map(v => v / (magnitude || 1));
}

// Query Pinecone for relevant context
export async function queryKnowledgeBase(
  query: string,
  anthropic: Anthropic,
  topK: number = 3
): Promise<string[]> {
  if (!pineconeIndex) {
    console.log('⚠️ Pinecone not configured, skipping RAG');
    return [];
  }

  try {
    // Generate query embedding
    const queryEmbedding = await generateEmbedding(query, anthropic);

    // Query Pinecone
    const results = await pineconeIndex.query({
      vector: queryEmbedding,
      topK: topK,
      includeMetadata: true,
    });

    // Extract and return relevant text chunks
    const contexts = results.matches
      .filter((match: any) => match.score > 0.7) // Only high-confidence matches
      .map((match: any) => match.metadata?.text || '')
      .filter((text: string) => text.length > 0);

    console.log(`📚 Retrieved ${contexts.length} relevant contexts from knowledge base`);
    return contexts;
  } catch (error) {
    console.error('❌ Knowledge base query failed:', error);
    return [];
  }
}

// Store document in knowledge base
export async function storeDocument(
  text: string,
  metadata: { title?: string; source?: string; category?: string },
  anthropic: Anthropic
): Promise<boolean> {
  if (!pineconeIndex) {
    console.log('⚠️ Pinecone not configured, cannot store document');
    return false;
  }

  try {
    // Split text into chunks (for long documents)
    const chunks = splitIntoChunks(text, 500); // 500 words per chunk

    // Generate embeddings and store
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await generateEmbedding(chunk, anthropic);

      const id = `${metadata.title || 'doc'}-chunk-${i}-${Date.now()}`;

      await pineconeIndex.upsert([{
        id: id,
        values: embedding,
        metadata: {
          ...metadata,
          text: chunk,
          chunkIndex: i,
          totalChunks: chunks.length,
        }
      }]);
    }

    console.log(`✅ Stored ${chunks.length} chunks from document: ${metadata.title}`);
    return true;
  } catch (error) {
    console.error('❌ Document storage failed:', error);
    return false;
  }
}

// Split text into chunks
function splitIntoChunks(text: string, wordsPerChunk: number): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += wordsPerChunk) {
    const chunk = words.slice(i, i + wordsPerChunk).join(' ');
    chunks.push(chunk);
  }

  return chunks;
}

// Enhanced query with RAG
export async function queryWithRAG(
  userQuery: string,
  anthropic: Anthropic,
  systemPrompt: string
): Promise<string> {
  // Get relevant context from knowledge base
  const contexts = await queryKnowledgeBase(userQuery, anthropic);

  // Build enhanced prompt with context
  let enhancedPrompt = userQuery;

  if (contexts.length > 0) {
    enhancedPrompt = `Context from legal knowledge base:\n\n${contexts.join('\n\n---\n\n')}\n\nUser question: ${userQuery}`;
  }

  // Call Claude with enhanced prompt
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    temperature: 0.3,
    system: systemPrompt,
    messages: [{ role: 'user', content: enhancedPrompt }],
  });

  return response.content[0].type === 'text' ? response.content[0].text : 'Unable to process';
}

export { pinecone, pineconeIndex };
