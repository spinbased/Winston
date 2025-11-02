#!/usr/bin/env ts-node
/**
 * Generate Embeddings
 * Creates OpenAI embeddings for all document chunks
 */

import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

interface Chunk {
  id: string;
  text: string;
  tokens: number;
  metadata: any;
}

interface EmbeddedChunk extends Chunk {
  embedding: number[];
}

const DATA_DIR = path.resolve(__dirname, '../../../data');
const CHUNKS_DIR = path.join(DATA_DIR, 'processed/chunks');
const EMBEDDINGS_DIR = path.join(DATA_DIR, 'embeddings');

const BATCH_SIZE = 100; // Process 100 chunks at a time
const EMBEDDING_MODEL = 'text-embedding-3-large';
const EMBEDDING_DIMENSIONS = 1536;

async function generateEmbeddings(): Promise<void> {
  console.log('🚀 Starting Embeddings Generation\n');
  console.log('='.repeat(60));

  // Initialize OpenAI
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not found in environment variables');
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // Load chunks
  const chunksPath = path.join(CHUNKS_DIR, 'all-chunks.json');
  if (!fs.existsSync(chunksPath)) {
    throw new Error('Chunks file not found. Run chunk-documents.ts first.');
  }

  const chunks: Chunk[] = JSON.parse(fs.readFileSync(chunksPath, 'utf-8'));
  console.log(`📊 Loaded ${chunks.length.toLocaleString()} chunks`);
  console.log(`⚙️  Model: ${EMBEDDING_MODEL} (${EMBEDDING_DIMENSIONS} dimensions)`);
  console.log(`📦 Batch size: ${BATCH_SIZE}`);
  console.log('='.repeat(60));

  const embeddedChunks: EmbeddedChunk[] = [];
  const totalBatches = Math.ceil(chunks.length / BATCH_SIZE);

  // Process in batches
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;

    console.log(`\n📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} chunks)...`);

    try {
      const texts = batch.map(c => c.text);

      // Call OpenAI API
      const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: texts,
        dimensions: EMBEDDING_DIMENSIONS,
      });

      // Add embeddings to chunks
      for (let j = 0; j < batch.length; j++) {
        embeddedChunks.push({
          ...batch[j],
          embedding: response.data[j].embedding,
        });
      }

      console.log(`✅ Batch ${batchNum} complete`);

      // Rate limiting - wait 1 second between batches
      if (i + BATCH_SIZE < chunks.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error: any) {
      console.error(`❌ Error in batch ${batchNum}:`, error.message);
      throw error;
    }
  }

  // Save embeddings
  if (!fs.existsSync(EMBEDDINGS_DIR)) {
    fs.mkdirSync(EMBEDDINGS_DIR, { recursive: true });
  }

  const outputPath = path.join(EMBEDDINGS_DIR, 'embedded-chunks.json');
  fs.writeFileSync(outputPath, JSON.stringify(embeddedChunks, null, 2));
  console.log(`\n✅ Saved ${embeddedChunks.length.toLocaleString()} embedded chunks to: ${outputPath}`);

  // Save statistics
  const stats = {
    totalChunks: embeddedChunks.length,
    embeddingModel: EMBEDDING_MODEL,
    dimensions: EMBEDDING_DIMENSIONS,
    byType: embeddedChunks.reduce((acc, c) => {
      const type = c.metadata.documentType;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    totalTokens: embeddedChunks.reduce((sum, c) => sum + c.tokens, 0),
    estimatedCost: (embeddedChunks.reduce((sum, c) => sum + c.tokens, 0) / 1000) * 0.00013, // $0.13 per 1M tokens
    processedAt: new Date().toISOString(),
  };

  const statsPath = path.join(EMBEDDINGS_DIR, 'stats.json');
  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log('✅ Embeddings generation complete!');
  console.log(`\n📊 Statistics:`);
  console.log(`   - Total embedded: ${stats.totalChunks.toLocaleString()}`);
  console.log(`   - Model: ${stats.embeddingModel}`);
  console.log(`   - Dimensions: ${stats.dimensions}`);
  console.log(`   - Total tokens: ${stats.totalTokens.toLocaleString()}`);
  console.log(`   - Estimated cost: $${stats.estimatedCost.toFixed(2)}`);
}

if (require.main === module) {
  generateEmbeddings().catch(console.error);
}

export { generateEmbeddings };
