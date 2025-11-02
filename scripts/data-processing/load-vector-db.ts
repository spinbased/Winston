#!/usr/bin/env ts-node
/**
 * Load Vector Database
 * Loads embedded chunks into Pinecone or Qdrant
 */

import fs from 'fs';
import path from 'path';
import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

dotenv.config();

interface EmbeddedChunk {
  id: string;
  text: string;
  tokens: number;
  metadata: any;
  embedding: number[];
}

const DATA_DIR = path.resolve(__dirname, '../../../data');
const EMBEDDINGS_DIR = path.join(DATA_DIR, 'embeddings');

const BATCH_SIZE = 100; // Upsert 100 vectors at a time

async function loadToPinecone(): Promise<void> {
  console.log('🚀 Loading Vectors to Pinecone\n');
  console.log('='.repeat(60));

  // Initialize Pinecone
  if (!process.env.PINECONE_API_KEY) {
    throw new Error('PINECONE_API_KEY not found in environment variables');
  }

  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });

  const indexName = process.env.PINECONE_INDEX_NAME || 'legal-knowledge';
  console.log(`📌 Connecting to index: ${indexName}`);

  // Get or create index
  const index = pinecone.index(indexName);

  // Load embedded chunks
  const chunksPath = path.join(EMBEDDINGS_DIR, 'embedded-chunks.json');
  if (!fs.existsSync(chunksPath)) {
    throw new Error('Embedded chunks not found. Run generate-embeddings.ts first.');
  }

  const chunks: EmbeddedChunk[] = JSON.parse(fs.readFileSync(chunksPath, 'utf-8'));
  console.log(`📊 Loaded ${chunks.length.toLocaleString()} embedded chunks`);
  console.log('='.repeat(60));

  const totalBatches = Math.ceil(chunks.length / BATCH_SIZE);
  let upsertedCount = 0;

  // Upsert in batches
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;

    console.log(`\n📦 Upserting batch ${batchNum}/${totalBatches} (${batch.length} vectors)...`);

    try {
      const vectors = batch.map(chunk => ({
        id: chunk.id,
        values: chunk.embedding,
        metadata: {
          text: chunk.text,
          tokens: chunk.tokens,
          source: chunk.metadata.source,
          documentType: chunk.metadata.documentType,
          legalContext: chunk.metadata.legalContext,
          term: chunk.metadata.term,
          edition: chunk.metadata.edition,
          author: chunk.metadata.author,
          date: chunk.metadata.date,
          article: chunk.metadata.article,
          amendment: chunk.metadata.amendment,
        },
      }));

      await index.upsert(vectors);
      upsertedCount += vectors.length;

      console.log(`✅ Batch ${batchNum} upserted (${upsertedCount.toLocaleString()}/${chunks.length.toLocaleString()})`);

      // Small delay between batches
      if (i + BATCH_SIZE < chunks.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error: any) {
      console.error(`❌ Error in batch ${batchNum}:`, error.message);
      throw error;
    }
  }

  // Verify index stats
  console.log('\n📊 Fetching index statistics...');
  const stats = await index.describeIndexStats();
  console.log(`   - Total vectors: ${stats.totalRecordCount?.toLocaleString()}`);
  console.log(`   - Dimensions: ${stats.dimension}`);

  console.log('\n' + '='.repeat(60));
  console.log('✅ Vector database loading complete!');
  console.log(`\n🎯 Index: ${indexName}`);
  console.log(`   - Upserted: ${upsertedCount.toLocaleString()} vectors`);
  console.log(`   - Total in index: ${stats.totalRecordCount?.toLocaleString()}`);
}

async function main() {
  await loadToPinecone();
}

if (require.main === module) {
  main().catch(console.error);
}

export { loadToPinecone };
