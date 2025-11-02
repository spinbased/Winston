#!/usr/bin/env ts-node
/**
 * Legal Definitions Parser
 * Parses all Black's Law Dictionary definitions from markdown files (2nd edition)
 * and extracted PDFs (4th and 9th editions)
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

interface LegalDefinition {
  term: string;
  edition: string;
  definition: string;
  source: string;
  publishedAt?: string;
  letter?: string;
  relatedTerms?: string[];
}

interface UnifiedDefinition {
  term: string;
  normalizedTerm: string;
  definitions: Array<{
    edition: string;
    text: string;
    source: string;
    publishedAt?: string;
  }>;
  allEditions: string[];
}

const DATA_DIR = path.resolve(__dirname, '../../../data');
const RAW_2ND_DIR = path.join(DATA_DIR, 'raw/blacks-law/blacks-law-2nd-edition/_definitions');
const PROCESSED_DIR = path.join(DATA_DIR, 'processed/blacks-law');

function normalizeTerm(term: string): string {
  return term
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

async function parse2ndEditionDefinitions(): Promise<LegalDefinition[]> {
  console.log('\n📚 Parsing Black\'s Law 2nd Edition definitions...');

  if (!fs.existsSync(RAW_2ND_DIR)) {
    console.warn('⚠️  2nd edition directory not found');
    return [];
  }

  const files = fs.readdirSync(RAW_2ND_DIR).filter(f => f.endsWith('.md'));
  console.log(`📄 Found ${files.length} definition files`);

  const definitions: LegalDefinition[] = [];

  for (const file of files) {
    try {
      const filePath = path.join(RAW_2ND_DIR, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = matter(content);

      if (parsed.data.title) {
        definitions.push({
          term: parsed.data.title,
          edition: '2nd',
          definition: parsed.data.body || parsed.content.trim(),
          source: parsed.data.source || 'Black\'s Law Dictionary 2nd Ed (1910)',
          publishedAt: parsed.data.published_at,
          letter: parsed.data.letter,
        });
      }
    } catch (error) {
      console.warn(`⚠️  Error parsing ${file}:`, error);
    }
  }

  console.log(`✅ Parsed ${definitions.length} definitions from 2nd edition`);
  return definitions;
}

async function parse4thEditionText(): Promise<LegalDefinition[]> {
  console.log('\n📚 Parsing Black\'s Law 4th Edition text...');

  const textPath = path.join(PROCESSED_DIR, '4th-edition-text.txt');

  if (!fs.existsSync(textPath)) {
    console.warn('⚠️  4th edition extracted text not found. Run extract-pdf-text.ts first.');
    return [];
  }

  const text = fs.readFileSync(textPath, 'utf-8');
  const definitions: LegalDefinition[] = [];

  // Simple pattern matching for definitions
  // Format: TERM. Definition text.
  const definitionPattern = /^([A-Z][A-Z\s\-']+)\.\s+(.+?)(?=\n[A-Z][A-Z\s\-']+\.|$)/gms;
  const matches = [...text.matchAll(definitionPattern)];

  console.log(`📄 Found ${matches.length} potential definitions`);

  for (const match of matches) {
    const term = match[1].trim();
    const definition = match[2].trim();

    if (term.length > 2 && term.length < 100 && definition.length > 10) {
      definitions.push({
        term,
        edition: '4th',
        definition,
        source: 'Black\'s Law Dictionary 4th Ed (1951)',
      });
    }
  }

  console.log(`✅ Parsed ${definitions.length} definitions from 4th edition`);
  return definitions;
}

async function parse9thEditionText(): Promise<LegalDefinition[]> {
  console.log('\n📚 Parsing Black\'s Law 9th Edition text...');

  const textPath = path.join(PROCESSED_DIR, '9th-edition-text.txt');

  if (!fs.existsSync(textPath)) {
    console.warn('⚠️  9th edition extracted text not found. Run extract-pdf-text.ts first.');
    return [];
  }

  const text = fs.readFileSync(textPath, 'utf-8');
  const definitions: LegalDefinition[] = [];

  // Similar pattern matching for 9th edition
  const definitionPattern = /^([A-Z][A-Z\s\-']+)\.\s+(.+?)(?=\n[A-Z][A-Z\s\-']+\.|$)/gms;
  const matches = [...text.matchAll(definitionPattern)];

  console.log(`📄 Found ${matches.length} potential definitions`);

  for (const match of matches) {
    const term = match[1].trim();
    const definition = match[2].trim();

    if (term.length > 2 && term.length < 100 && definition.length > 10) {
      definitions.push({
        term,
        edition: '9th',
        definition,
        source: 'Black\'s Law Dictionary 9th Ed (2009)',
      });
    }
  }

  console.log(`✅ Parsed ${definitions.length} definitions from 9th edition`);
  return definitions;
}

function unifyDefinitions(allDefinitions: LegalDefinition[]): UnifiedDefinition[] {
  const termMap = new Map<string, UnifiedDefinition>();

  for (const def of allDefinitions) {
    const normalized = normalizeTerm(def.term);

    if (!termMap.has(normalized)) {
      termMap.set(normalized, {
        term: def.term,
        normalizedTerm: normalized,
        definitions: [],
        allEditions: [],
      });
    }

    const unified = termMap.get(normalized)!;
    unified.definitions.push({
      edition: def.edition,
      text: def.definition,
      source: def.source,
      publishedAt: def.publishedAt,
    });

    if (!unified.allEditions.includes(def.edition)) {
      unified.allEditions.push(def.edition);
    }
  }

  return Array.from(termMap.values());
}

async function main() {
  console.log('🚀 Starting Legal Definitions Parsing\n');
  console.log('='.repeat(60));

  // Parse all editions
  const definitions2nd = await parse2ndEditionDefinitions();
  const definitions4th = await parse4thEditionText();
  const definitions9th = await parse9thEditionText();

  const allDefinitions = [...definitions2nd, ...definitions4th, ...definitions9th];
  console.log(`\n📊 Total definitions across all editions: ${allDefinitions.length}`);

  // Unify definitions by term
  const unified = unifyDefinitions(allDefinitions);
  console.log(`📊 Unique terms: ${unified.length}`);

  // Save results
  const outputPath = path.join(PROCESSED_DIR, 'unified-definitions.json');

  if (!fs.existsSync(PROCESSED_DIR)) {
    fs.mkdirSync(PROCESSED_DIR, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(unified, null, 2));
  console.log(`\n✅ Unified definitions saved to: ${outputPath}`);

  // Save statistics
  const stats = {
    totalDefinitions: allDefinitions.length,
    uniqueTerms: unified.length,
    by Edition: {
      '2nd': definitions2nd.length,
      '4th': definitions4th.length,
      '9th': definitions9th.length,
    },
    multiEditionTerms: unified.filter(u => u.allEditions.length > 1).length,
    processedAt: new Date().toISOString(),
  };

  const statsPath = path.join(PROCESSED_DIR, 'definitions-stats.json');
  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
  console.log(`✅ Statistics saved to: ${statsPath}`);

  console.log('\n' + '='.repeat(60));
  console.log('✅ Legal definitions parsing complete!');
  console.log(`\n📊 Statistics:`);
  console.log(`   - Total definitions: ${stats.totalDefinitions}`);
  console.log(`   - Unique terms: ${stats.uniqueTerms}`);
  console.log(`   - Multi-edition terms: ${stats.multiEditionTerms}`);
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { parse2ndEditionDefinitions, parse4thEditionText, parse9thEditionText, unifyDefinitions };
