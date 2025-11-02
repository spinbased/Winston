#!/usr/bin/env ts-node
/**
 * Founding Documents Parser
 * Parses Federalist Papers, Common Sense, Washington's Farewell Address, etc.
 */

import fs from 'fs';
import path from 'path';

interface FoundingDocument {
  type: 'federalist' | 'writing' | 'speech';
  title: string;
  author: string;
  date?: string;
  text: string;
  sections?: string[];
  metadata: {
    source: string;
    context?: string;
    significance?: string;
  };
}

const DATA_DIR = path.resolve(__dirname, '../../../data');
const RAW_DIR = path.join(DATA_DIR, 'raw/founding-documents');
const PROCESSED_DIR = path.join(DATA_DIR, 'processed/founding-documents');

function parseFederalistPapers(text: string): FoundingDocument[] {
  console.log('📜 Parsing Federalist Papers...');

  const papers: FoundingDocument[] = [];

  // Split by FEDERALIST No.
  const paperPattern = /FEDERALIST\s+No\.\s+(\d+)[\s\S]*?(?=FEDERALIST\s+No\.|$)/gi;
  const matches = text.matchAll(paperPattern);

  for (const match of matches) {
    const paperNum = match[1];
    const content = match[0];

    // Extract author
    let author = 'Unknown';
    if (content.includes('HAMILTON')) author = 'Alexander Hamilton';
    else if (content.includes('MADISON')) author = 'James Madison';
    else if (content.includes('JAY')) author = 'John Jay';

    // Extract title/topic from first line after number
    const lines = content.split('\n').filter(l => l.trim());
    const title = lines[1]?.trim() || `Federalist No. ${paperNum}`;

    papers.push({
      type: 'federalist',
      title: `Federalist No. ${paperNum}: ${title}`,
      author,
      text: content.trim(),
      metadata: {
        source: 'Project Gutenberg',
        context: 'Essays supporting ratification of the US Constitution',
        significance: 'Explains founders\' intent and constitutional principles',
      },
    });
  }

  console.log(`✅ Parsed ${papers.length} Federalist Papers`);
  return papers;
}

function parseCommonSense(text: string): FoundingDocument {
  console.log('📜 Parsing Common Sense by Thomas Paine...');

  // Split into sections/chapters
  const sections = text
    .split(/\n\n+/)
    .filter(s => s.trim().length > 100)
    .map(s => s.trim());

  return {
    type: 'writing',
    title: 'Common Sense',
    author: 'Thomas Paine',
    date: '1776-01-10',
    text,
    sections,
    metadata: {
      source: 'Project Gutenberg',
      context: 'Revolutionary pamphlet advocating independence from Britain',
      significance: 'Influenced American Revolution and founding principles',
    },
  };
}

function parseWashingtonFarewell(text: string): FoundingDocument {
  console.log('📜 Parsing Washington\'s Farewell Address...');

  const sections = text
    .split(/\n\n+/)
    .filter(s => s.trim().length > 50)
    .map(s => s.trim());

  return {
    type: 'speech',
    title: 'Washington\'s Farewell Address',
    author: 'George Washington',
    date: '1796-09-19',
    text,
    sections,
    metadata: {
      source: 'Yale Avalon Project',
      context: 'Final public statement as President',
      significance: 'Warning against political parties and foreign entanglements',
    },
  };
}

function parseArticlesOfConfederation(text: string): FoundingDocument {
  console.log('📜 Parsing Articles of Confederation...');

  return {
    type: 'writing',
    title: 'Articles of Confederation',
    author: 'Continental Congress',
    date: '1777-11-15',
    text,
    metadata: {
      source: 'Project Gutenberg',
      context: 'First constitution of the United States',
      significance: 'Predecessor to US Constitution, shows evolution of government',
    },
  };
}

async function main() {
  console.log('🚀 Starting Founding Documents Parsing\n');
  console.log('='.repeat(60));

  const documents: FoundingDocument[] = [];

  // Parse Federalist Papers
  const federalistPath = path.join(RAW_DIR, 'federalist-papers-complete.txt');
  if (fs.existsSync(federalistPath)) {
    const text = fs.readFileSync(federalistPath, 'utf-8');
    const papers = parseFederalistPapers(text);
    documents.push(...papers);
  }

  // Parse Common Sense
  const commonSensePath = path.join(RAW_DIR, 'common-sense-thomas-paine.txt');
  if (fs.existsSync(commonSensePath)) {
    const text = fs.readFileSync(commonSensePath, 'utf-8');
    const doc = parseCommonSense(text);
    documents.push(doc);
    console.log(`✅ Common Sense parsed: ${doc.sections?.length || 0} sections`);
  }

  // Parse Washington's Farewell Address
  const washingtonPath = path.join(RAW_DIR, 'washington-farewell-address.txt');
  if (fs.existsSync(washingtonPath)) {
    const text = fs.readFileSync(washingtonPath, 'utf-8');
    const doc = parseWashingtonFarewell(text);
    documents.push(doc);
    console.log(`✅ Washington's Farewell parsed: ${doc.sections?.length || 0} sections`);
  }

  // Parse Articles of Confederation
  const articlesPath = path.join(RAW_DIR, 'articles-of-confederation.txt');
  if (fs.existsSync(articlesPath)) {
    const text = fs.readFileSync(articlesPath, 'utf-8');
    const doc = parseArticlesOfConfederation(text);
    documents.push(doc);
    console.log(`✅ Articles of Confederation parsed`);
  }

  // Save results
  if (!fs.existsSync(PROCESSED_DIR)) {
    fs.mkdirSync(PROCESSED_DIR, { recursive: true });
  }

  const outputPath = path.join(PROCESSED_DIR, 'founding-documents.json');
  fs.writeFileSync(outputPath, JSON.stringify(documents, null, 2));
  console.log(`\n✅ Saved ${documents.length} documents to: ${outputPath}`);

  // Statistics
  const stats = {
    totalDocuments: documents.length,
    byType: {
      federalist: documents.filter(d => d.type === 'federalist').length,
      writing: documents.filter(d => d.type === 'writing').length,
      speech: documents.filter(d => d.type === 'speech').length,
    },
    byAuthor: documents.reduce((acc, d) => {
      acc[d.author] = (acc[d.author] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    processedAt: new Date().toISOString(),
  };

  const statsPath = path.join(PROCESSED_DIR, 'stats.json');
  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log('✅ Founding documents parsing complete!');
  console.log(`\n📊 Statistics:`);
  console.log(`   - Total documents: ${stats.totalDocuments}`);
  console.log(`   - Federalist Papers: ${stats.byType.federalist}`);
  console.log(`   - Writings: ${stats.byType.writing}`);
  console.log(`   - Speeches: ${stats.byType.speech}`);
}

if (require.main === module) {
  main().catch(console.error);
}

export { parseFederalistPapers, parseCommonSense, parseWashingtonFarewell };
