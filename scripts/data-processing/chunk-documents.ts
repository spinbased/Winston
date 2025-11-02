#!/usr/bin/env ts-node
/**
 * Document Chunking for RAG
 * Chunks all legal documents into 500-1000 token segments with metadata
 */

import fs from 'fs';
import path from 'path';
import { encoding_for_model } from 'tiktoken';

interface Chunk {
  id: string;
  text: string;
  tokens: number;
  metadata: {
    source: string;
    documentType: 'definition' | 'constitutional' | 'founding' | 'statute' | 'case' | 'federal-law' | 'state-law' | 'tax-law';
    legalContext: 'constitutional' | 'common' | 'sovereign' | 'mixed' | 'us-code' | 'supreme-court' | 'cfr' | 'state-constitution' | 'state-code' | 'irc' | 'treasury-regulations' | 'tax-court';
    term?: string;
    edition?: string;
    author?: string;
    date?: string;
    article?: string;
    amendment?: string;
    citations?: string[];
    citation?: string;
    section?: string;
    chapter?: string;
    subtitle?: string;
    title?: string;
    part?: string;
    caseName?: string;
    state?: string;
    stateName?: string;
  };
}

const DATA_DIR = path.resolve(__dirname, '../../../data');
const PROCESSED_DIR = path.join(DATA_DIR, 'processed');
const CHUNKS_DIR = path.join(DATA_DIR, 'processed/chunks');

const CHUNK_SIZE = 800; // tokens
const CHUNK_OVERLAP = 100; // tokens

// Initialize tokenizer
const encoding = encoding_for_model('gpt-3.5-turbo');

function countTokens(text: string): number {
  return encoding.encode(text).length;
}

function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const tokens = encoding.encode(text);
  const chunks: string[] = [];

  let start = 0;
  while (start < tokens.length) {
    const end = Math.min(start + chunkSize, tokens.length);
    const chunkTokens = tokens.slice(start, end);
    const chunkText = new TextDecoder().decode(encoding.decode(chunkTokens));
    chunks.push(chunkText);

    start += chunkSize - overlap;
  }

  return chunks;
}

function chunkDefinitions(): Chunk[] {
  console.log('\n📚 Chunking legal definitions...');

  const chunks: Chunk[] = [];
  const definitionsPath = path.join(PROCESSED_DIR, 'blacks-law/unified-definitions.json');

  if (!fs.existsSync(definitionsPath)) {
    console.warn('⚠️  Definitions file not found');
    return chunks;
  }

  const definitions = JSON.parse(fs.readFileSync(definitionsPath, 'utf-8'));

  for (const def of definitions) {
    for (const definition of def.definitions) {
      const text = `TERM: ${def.term}\n\nDEFINITION: ${definition.text}\n\nSOURCE: ${definition.source}`;
      const tokens = countTokens(text);

      chunks.push({
        id: `def-${def.normalizedTerm}-${definition.edition}`,
        text,
        tokens,
        metadata: {
          source: definition.source,
          documentType: 'definition',
          legalContext: 'mixed',
          term: def.term,
          edition: definition.edition,
          citations: [],
        },
      });
    }
  }

  console.log(`✅ Created ${chunks.length} definition chunks`);
  return chunks;
}

function chunkConstitutionalDocs(): Chunk[] {
  console.log('\n📜 Chunking constitutional documents...');

  const chunks: Chunk[] = [];
  const docsPath = path.join(PROCESSED_DIR, 'constitutional/constitutional-documents.json');

  if (!fs.existsSync(docsPath)) {
    console.warn('⚠️  Constitutional documents not found');
    return chunks;
  }

  const documents = JSON.parse(fs.readFileSync(docsPath, 'utf-8'));

  for (const doc of documents) {
    if (doc.sections && doc.sections.length > 0) {
      // Chunk by section
      for (let i = 0; i < doc.sections.length; i++) {
        const section = doc.sections[i];
        const text = `${doc.title}\n${section.article ? `Article ${section.article}` : ''}\n${section.section ? `Section ${section.section}` : ''}\n\n${section.text}`;
        const tokens = countTokens(text);

        // If section is too large, chunk it
        if (tokens > CHUNK_SIZE) {
          const textChunks = chunkText(section.text, CHUNK_SIZE, CHUNK_OVERLAP);
          textChunks.forEach((chunk, j) => {
            chunks.push({
              id: `const-${doc.type}-${i}-${j}`,
              text: `${doc.title}\n\n${chunk}`,
              tokens: countTokens(chunk),
              metadata: {
                source: doc.metadata.source,
                documentType: 'constitutional',
                legalContext: 'constitutional',
                article: section.article,
                amendment: doc.type === 'amendment' ? doc.title : undefined,
                date: doc.metadata.date,
              },
            });
          });
        } else {
          chunks.push({
            id: `const-${doc.type}-${i}`,
            text,
            tokens,
            metadata: {
              source: doc.metadata.source,
              documentType: 'constitutional',
              legalContext: 'constitutional',
              article: section.article,
              amendment: doc.type === 'amendment' ? doc.title : undefined,
              date: doc.metadata.date,
            },
          });
        }
      }
    } else {
      // Chunk entire document
      const textChunks = chunkText(doc.text, CHUNK_SIZE, CHUNK_OVERLAP);
      textChunks.forEach((chunk, i) => {
        chunks.push({
          id: `const-${doc.type}-${i}`,
          text: `${doc.title}\n\n${chunk}`,
          tokens: countTokens(chunk),
          metadata: {
            source: doc.metadata.source,
            documentType: 'constitutional',
            legalContext: 'constitutional',
            date: doc.metadata.date,
          },
        });
      });
    }
  }

  console.log(`✅ Created ${chunks.length} constitutional chunks`);
  return chunks;
}

function chunkFoundingDocs(): Chunk[] {
  console.log('\n📖 Chunking founding documents...');

  const chunks: Chunk[] = [];
  const docsPath = path.join(PROCESSED_DIR, 'founding-documents/founding-documents.json');

  if (!fs.existsSync(docsPath)) {
    console.warn('⚠️  Founding documents not found');
    return chunks;
  }

  const documents = JSON.parse(fs.readFileSync(docsPath, 'utf-8'));

  for (const doc of documents) {
    if (doc.sections && doc.sections.length > 0) {
      // Chunk by section
      for (let i = 0; i < doc.sections.length; i++) {
        const section = doc.sections[i];
        const text = `${doc.title} by ${doc.author}\n\n${section}`;
        const tokens = countTokens(text);

        if (tokens > CHUNK_SIZE) {
          const textChunks = chunkText(section, CHUNK_SIZE, CHUNK_OVERLAP);
          textChunks.forEach((chunk, j) => {
            chunks.push({
              id: `founding-${doc.type}-${i}-${j}`,
              text: `${doc.title} by ${doc.author}\n\n${chunk}`,
              tokens: countTokens(chunk),
              metadata: {
                source: doc.metadata.source,
                documentType: 'founding',
                legalContext: 'constitutional',
                author: doc.author,
                date: doc.date,
              },
            });
          });
        } else {
          chunks.push({
            id: `founding-${doc.type}-${i}`,
            text,
            tokens,
            metadata: {
              source: doc.metadata.source,
              documentType: 'founding',
              legalContext: 'constitutional',
              author: doc.author,
              date: doc.date,
            },
          });
        }
      }
    } else {
      // Chunk entire document
      const textChunks = chunkText(doc.text, CHUNK_SIZE, CHUNK_OVERLAP);
      textChunks.forEach((chunk, i) => {
        chunks.push({
          id: `founding-${doc.type}-${i}`,
          text: `${doc.title} by ${doc.author}\n\n${chunk}`,
          tokens: countTokens(chunk),
          metadata: {
            source: doc.metadata.source,
            documentType: 'founding',
            legalContext: 'constitutional',
            author: doc.author,
            date: doc.date,
          },
        });
      });
    }
  }

  console.log(`✅ Created ${chunks.length} founding document chunks`);
  return chunks;
}

function chunkFederalLaw(): Chunk[] {
  console.log('\n⚖️ Chunking federal law documents...');

  const chunks: Chunk[] = [];
  const federalLawPath = path.join(PROCESSED_DIR, 'federal-law');

  if (!fs.existsSync(federalLawPath)) {
    console.warn('⚠️  Federal law documents not found');
    return chunks;
  }

  // Chunk US Code
  const usCodePath = path.join(federalLawPath, 'us-code');
  if (fs.existsSync(usCodePath)) {
    const files = fs.readdirSync(usCodePath).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const docs = JSON.parse(fs.readFileSync(path.join(usCodePath, file), 'utf-8'));
      for (const doc of docs) {
        const text = `${doc.title}\n\n${doc.content}`;
        const tokens = countTokens(text);

        if (tokens > CHUNK_SIZE) {
          const textChunks = chunkText(doc.content, CHUNK_SIZE, CHUNK_OVERLAP);
          textChunks.forEach((chunk, i) => {
            chunks.push({
              id: `${doc.id}-${i}`,
              text: `${doc.title}\n\n${chunk}`,
              tokens: countTokens(chunk),
              metadata: {
                ...doc.metadata,
                source: doc.metadata.source,
                documentType: 'federal-law',
                legalContext: doc.metadata.legalContext,
              },
            });
          });
        } else {
          chunks.push({
            id: doc.id,
            text,
            tokens,
            metadata: {
              ...doc.metadata,
              source: doc.metadata.source,
              documentType: 'federal-law',
              legalContext: doc.metadata.legalContext,
            },
          });
        }
      }
    }
  }

  // Chunk Supreme Court opinions
  const scotusPath = path.join(federalLawPath, 'supreme-court');
  if (fs.existsSync(scotusPath)) {
    const files = fs.readdirSync(scotusPath).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const docs = JSON.parse(fs.readFileSync(path.join(scotusPath, file), 'utf-8'));
      for (const doc of docs) {
        const text = `${doc.title}\n\n${doc.content}`;
        const tokens = countTokens(text);

        if (tokens > CHUNK_SIZE) {
          const textChunks = chunkText(doc.content, CHUNK_SIZE, CHUNK_OVERLAP);
          textChunks.forEach((chunk, i) => {
            chunks.push({
              id: `${doc.id}-${i}`,
              text: `${doc.title}\n\n${chunk}`,
              tokens: countTokens(chunk),
              metadata: {
                ...doc.metadata,
                source: doc.metadata.source,
                documentType: 'federal-law',
                legalContext: doc.metadata.legalContext,
              },
            });
          });
        } else {
          chunks.push({
            id: doc.id,
            text,
            tokens,
            metadata: {
              ...doc.metadata,
              source: doc.metadata.source,
              documentType: 'federal-law',
              legalContext: doc.metadata.legalContext,
            },
          });
        }
      }
    }
  }

  // Chunk CFR
  const cfrPath = path.join(federalLawPath, 'cfr');
  if (fs.existsSync(cfrPath)) {
    const files = fs.readdirSync(cfrPath).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const docs = JSON.parse(fs.readFileSync(path.join(cfrPath, file), 'utf-8'));
      for (const doc of docs) {
        const text = `${doc.title}\n\n${doc.content}`;
        const tokens = countTokens(text);

        if (tokens > CHUNK_SIZE) {
          const textChunks = chunkText(doc.content, CHUNK_SIZE, CHUNK_OVERLAP);
          textChunks.forEach((chunk, i) => {
            chunks.push({
              id: `${doc.id}-${i}`,
              text: `${doc.title}\n\n${chunk}`,
              tokens: countTokens(chunk),
              metadata: {
                ...doc.metadata,
                source: doc.metadata.source,
                documentType: 'federal-law',
                legalContext: doc.metadata.legalContext,
              },
            });
          });
        } else {
          chunks.push({
            id: doc.id,
            text,
            tokens,
            metadata: {
              ...doc.metadata,
              source: doc.metadata.source,
              documentType: 'federal-law',
              legalContext: doc.metadata.legalContext,
            },
          });
        }
      }
    }
  }

  console.log(`✅ Created ${chunks.length} federal law chunks`);
  return chunks;
}

function chunkStateLaw(): Chunk[] {
  console.log('\n🏛️ Chunking state law documents...');

  const chunks: Chunk[] = [];
  const stateLawPath = path.join(PROCESSED_DIR, 'state-law');

  if (!fs.existsSync(stateLawPath)) {
    console.warn('⚠️  State law documents not found');
    return chunks;
  }

  // Get all state directories
  const stateDirs = fs.readdirSync(stateLawPath).filter(item => {
    return fs.statSync(path.join(stateLawPath, item)).isDirectory();
  });

  for (const stateDir of stateDirs) {
    const stateFilePath = path.join(stateLawPath, stateDir, 'state-law.json');

    if (fs.existsSync(stateFilePath)) {
      const docs = JSON.parse(fs.readFileSync(stateFilePath, 'utf-8'));

      for (const doc of docs) {
        const text = `${doc.title}\n\n${doc.content}`;
        const tokens = countTokens(text);

        if (tokens > CHUNK_SIZE) {
          const textChunks = chunkText(doc.content, CHUNK_SIZE, CHUNK_OVERLAP);
          textChunks.forEach((chunk, i) => {
            chunks.push({
              id: `${doc.id}-${i}`,
              text: `${doc.title}\n\n${chunk}`,
              tokens: countTokens(chunk),
              metadata: {
                ...doc.metadata,
                source: doc.metadata.source,
                documentType: 'state-law',
                legalContext: doc.metadata.legalContext,
              },
            });
          });
        } else {
          chunks.push({
            id: doc.id,
            text,
            tokens,
            metadata: {
              ...doc.metadata,
              source: doc.metadata.source,
              documentType: 'state-law',
              legalContext: doc.metadata.legalContext,
            },
          });
        }
      }
    }
  }

  console.log(`✅ Created ${chunks.length} state law chunks`);
  return chunks;
}

function chunkTaxLaw(): Chunk[] {
  console.log('\n💰 Chunking tax law documents...');

  const chunks: Chunk[] = [];
  const taxLawPath = path.join(PROCESSED_DIR, 'tax-law');

  if (!fs.existsSync(taxLawPath)) {
    console.warn('⚠️  Tax law documents not found');
    return chunks;
  }

  // Process all subdirectories (irc, treasury-regulations, tax-court)
  const processDir = (subDir: string) => {
    const dirPath = path.join(taxLawPath, subDir);
    if (!fs.existsSync(dirPath)) return;

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const docs = JSON.parse(fs.readFileSync(path.join(dirPath, file), 'utf-8'));

      for (const doc of docs) {
        const text = `${doc.title}\n\n${doc.content}`;
        const tokens = countTokens(text);

        if (tokens > CHUNK_SIZE) {
          const textChunks = chunkText(doc.content, CHUNK_SIZE, CHUNK_OVERLAP);
          textChunks.forEach((chunk, i) => {
            chunks.push({
              id: `${doc.id}-${i}`,
              text: `${doc.title}\n\n${chunk}`,
              tokens: countTokens(chunk),
              metadata: {
                ...doc.metadata,
                source: doc.metadata.source,
                documentType: 'tax-law',
                legalContext: doc.metadata.legalContext,
              },
            });
          });
        } else {
          chunks.push({
            id: doc.id,
            text,
            tokens,
            metadata: {
              ...doc.metadata,
              source: doc.metadata.source,
              documentType: 'tax-law',
              legalContext: doc.metadata.legalContext,
            },
          });
        }
      }
    }
  };

  processDir('irc');
  processDir('treasury-regulations');
  processDir('tax-court');

  console.log(`✅ Created ${chunks.length} tax law chunks`);
  return chunks;
}

async function main() {
  console.log('🚀 Starting Document Chunking for RAG\n');
  console.log('='.repeat(60));
  console.log(`Configuration:`);
  console.log(`  - Chunk size: ${CHUNK_SIZE} tokens`);
  console.log(`  - Overlap: ${CHUNK_OVERLAP} tokens`);
  console.log('='.repeat(60));

  const allChunks: Chunk[] = [];

  // Chunk all document types
  allChunks.push(...chunkDefinitions());
  allChunks.push(...chunkConstitutionalDocs());
  allChunks.push(...chunkFoundingDocs());
  allChunks.push(...chunkFederalLaw());
  allChunks.push(...chunkStateLaw());
  allChunks.push(...chunkTaxLaw());

  // Save chunks
  if (!fs.existsSync(CHUNKS_DIR)) {
    fs.mkdirSync(CHUNKS_DIR, { recursive: true });
  }

  const outputPath = path.join(CHUNKS_DIR, 'all-chunks.json');
  fs.writeFileSync(outputPath, JSON.stringify(allChunks, null, 2));
  console.log(`\n✅ Saved ${allChunks.length} chunks to: ${outputPath}`);

  // Statistics
  const stats = {
    totalChunks: allChunks.length,
    byType: {
      definition: allChunks.filter(c => c.metadata.documentType === 'definition').length,
      constitutional: allChunks.filter(c => c.metadata.documentType === 'constitutional').length,
      founding: allChunks.filter(c => c.metadata.documentType === 'founding').length,
      federalLaw: allChunks.filter(c => c.metadata.documentType === 'federal-law').length,
      stateLaw: allChunks.filter(c => c.metadata.documentType === 'state-law').length,
      taxLaw: allChunks.filter(c => c.metadata.documentType === 'tax-law').length,
    },
    averageTokens: Math.round(allChunks.reduce((sum, c) => sum + c.tokens, 0) / allChunks.length),
    totalTokens: allChunks.reduce((sum, c) => sum + c.tokens, 0),
    processedAt: new Date().toISOString(),
  };

  const statsPath = path.join(CHUNKS_DIR, 'stats.json');
  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log('✅ Document chunking complete!');
  console.log(`\n📊 Statistics:`);
  console.log(`   - Total chunks: ${stats.totalChunks.toLocaleString()}`);
  console.log(`   - Definitions: ${stats.byType.definition.toLocaleString()}`);
  console.log(`   - Constitutional: ${stats.byType.constitutional.toLocaleString()}`);
  console.log(`   - Founding docs: ${stats.byType.founding.toLocaleString()}`);
  console.log(`   - Federal law: ${stats.byType.federalLaw.toLocaleString()}`);
  console.log(`   - State law: ${stats.byType.stateLaw.toLocaleString()}`);
  console.log(`   - Tax law: ${stats.byType.taxLaw.toLocaleString()}`);
  console.log(`   - Average tokens/chunk: ${stats.averageTokens}`);
  console.log(`   - Total tokens: ${stats.totalTokens.toLocaleString()}`);

  // Clean up
  encoding.free();
}

if (require.main === module) {
  main().catch(console.error);
}

export { chunkText, countTokens };
