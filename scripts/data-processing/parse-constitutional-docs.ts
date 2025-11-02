#!/usr/bin/env ts-node
/**
 * Constitutional Documents Parser
 * Parses US Constitution, Bill of Rights, Declaration of Independence, and amendments
 */

import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

interface ConstitutionalDocument {
  type: 'constitution' | 'amendment' | 'declaration' | 'founding-doc';
  title: string;
  text: string;
  sections?: Section[];
  metadata: {
    date?: string;
    source: string;
    context?: string;
  };
}

interface Section {
  article?: string;
  section?: string;
  clause?: string;
  text: string;
}

const DATA_DIR = path.resolve(__dirname, '../../../data');
const RAW_DIR = path.join(DATA_DIR, 'raw/constitutional-docs');
const PROCESSED_DIR = path.join(DATA_DIR, 'processed/constitutional');

function parseHTMLDocument(filePath: string): string {
  const html = fs.readFileSync(filePath, 'utf-8');
  const $ = cheerio.load(html);

  // Remove scripts, styles, and navigation
  $('script, style, nav, header, footer').remove();

  // Get main content
  const text = $('body').text();

  // Clean up whitespace
  return text.replace(/\s+/g, ' ').trim();
}

function parseConstitution(text: string): ConstitutionalDocument {
  console.log('📜 Parsing US Constitution...');

  const sections: Section[] = [];

  // Parse articles (simplified - real parsing would be more complex)
  const articlePattern = /Article\s+([IVX]+)[\s\S]*?(?=Article\s+[IVX]+|$)/gi;
  const articles = text.match(articlePattern) || [];

  for (const article of articles) {
    const articleMatch = article.match(/Article\s+([IVX]+)/i);
    if (articleMatch) {
      sections.push({
        article: articleMatch[1],
        text: article.trim(),
      });
    }
  }

  return {
    type: 'constitution',
    title: 'United States Constitution',
    text,
    sections,
    metadata: {
      date: '1787-09-17',
      source: 'National Archives',
      context: 'Original Constitution with all amendments',
    },
  };
}

function parseAmendments(text: string): ConstitutionalDocument[] {
  console.log('📜 Parsing Constitutional Amendments...');

  const amendments: ConstitutionalDocument[] = [];

  // Parse each amendment
  const amendmentPattern = /Amendment\s+([IVX]+|[0-9]+)[\s\S]*?(?=Amendment\s+|$)/gi;
  const matches = text.match(amendmentPattern) || [];

  for (const match of matches) {
    const numMatch = match.match(/Amendment\s+([IVX]+|[0-9]+)/i);
    if (numMatch) {
      amendments.push({
        type: 'amendment',
        title: `Amendment ${numMatch[1]}`,
        text: match.trim(),
        metadata: {
          source: 'National Archives',
        },
      });
    }
  }

  return amendments;
}

function parseDeclaration(text: string): ConstitutionalDocument {
  console.log('📜 Parsing Declaration of Independence...');

  // Split into paragraphs
  const paragraphs = text
    .split(/\n\n+/)
    .filter(p => p.trim().length > 50)
    .map(p => p.trim());

  return {
    type: 'declaration',
    title: 'Declaration of Independence',
    text,
    sections: paragraphs.map((p, i) => ({
      clause: `Paragraph ${i + 1}`,
      text: p,
    })),
    metadata: {
      date: '1776-07-04',
      source: 'National Archives',
      context: 'Founding document declaring independence from Great Britain',
    },
  };
}

async function main() {
  console.log('🚀 Starting Constitutional Documents Parsing\n');
  console.log('='.repeat(60));

  const documents: ConstitutionalDocument[] = [];

  // Parse Constitution
  const constitutionPath = path.join(RAW_DIR, 'constitution.html');
  if (fs.existsSync(constitutionPath)) {
    const text = parseHTMLDocument(constitutionPath);
    const constitution = parseConstitution(text);
    documents.push(constitution);
    console.log(`✅ Constitution parsed: ${constitution.sections?.length || 0} articles`);
  }

  // Parse Bill of Rights
  const billOfRightsPath = path.join(RAW_DIR, 'bill-of-rights.html');
  if (fs.existsSync(billOfRightsPath)) {
    const text = parseHTMLDocument(billOfRightsPath);
    const amendments = parseAmendments(text);
    documents.push(...amendments);
    console.log(`✅ Bill of Rights parsed: ${amendments.length} amendments`);
  }

  // Parse additional amendments
  const amendmentsPath = path.join(RAW_DIR, '../founding-documents/amendments-11-27.html');
  if (fs.existsSync(amendmentsPath)) {
    const text = parseHTMLDocument(amendmentsPath);
    const amendments = parseAmendments(text);
    documents.push(...amendments);
    console.log(`✅ Amendments 11-27 parsed: ${amendments.length} amendments`);
  }

  // Parse Declaration of Independence
  const declarationPath = path.join(RAW_DIR, 'declaration.html');
  if (fs.existsSync(declarationPath)) {
    const text = parseHTMLDocument(declarationPath);
    const declaration = parseDeclaration(text);
    documents.push(declaration);
    console.log(`✅ Declaration parsed: ${declaration.sections?.length || 0} paragraphs`);
  }

  // Save results
  if (!fs.existsSync(PROCESSED_DIR)) {
    fs.mkdirSync(PROCESSED_DIR, { recursive: true });
  }

  const outputPath = path.join(PROCESSED_DIR, 'constitutional-documents.json');
  fs.writeFileSync(outputPath, JSON.stringify(documents, null, 2));
  console.log(`\n✅ Saved ${documents.length} documents to: ${outputPath}`);

  // Statistics
  const stats = {
    totalDocuments: documents.length,
    byType: {
      constitution: documents.filter(d => d.type === 'constitution').length,
      amendment: documents.filter(d => d.type === 'amendment').length,
      declaration: documents.filter(d => d.type === 'declaration').length,
    },
    totalSections: documents.reduce((sum, d) => sum + (d.sections?.length || 0), 0),
    processedAt: new Date().toISOString(),
  };

  const statsPath = path.join(PROCESSED_DIR, 'stats.json');
  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log('✅ Constitutional documents parsing complete!');
  console.log(`\n📊 Statistics:`);
  console.log(`   - Total documents: ${stats.totalDocuments}`);
  console.log(`   - Constitution: ${stats.byType.constitution}`);
  console.log(`   - Amendments: ${stats.byType.amendment}`);
  console.log(`   - Declaration: ${stats.byType.declaration}`);
}

if (require.main === module) {
  main().catch(console.error);
}

export { parseConstitution, parseAmendments, parseDeclaration };
