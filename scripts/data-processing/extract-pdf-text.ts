#!/usr/bin/env ts-node
/**
 * PDF Text Extraction Script
 * Extracts text from Black's Law Dictionary 4th and 9th edition PDFs
 */

import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';

interface ExtractionResult {
  edition: string;
  totalPages: number;
  extractedText: string;
  metadata: {
    title?: string;
    author?: string;
    creationDate?: Date;
  };
}

const DATA_DIR = path.resolve(__dirname, '../../../data');
const RAW_DIR = path.join(DATA_DIR, 'raw/blacks-law');
const PROCESSED_DIR = path.join(DATA_DIR, 'processed/blacks-law');

async function extractPDF(pdfPath: string, edition: string): Promise<ExtractionResult> {
  console.log(`\n📖 Extracting ${edition} from: ${pdfPath}`);

  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);

    console.log(`✅ Successfully extracted ${data.numpages} pages`);
    console.log(`📝 Text length: ${data.text.length} characters`);

    return {
      edition,
      totalPages: data.numpages,
      extractedText: data.text,
      metadata: {
        title: data.info?.Title,
        author: data.info?.Author,
        creationDate: data.info?.CreationDate,
      },
    };
  } catch (error) {
    console.error(`❌ Error extracting ${edition}:`, error);
    throw error;
  }
}

async function saveExtractedText(result: ExtractionResult): Promise<void> {
  const outputPath = path.join(PROCESSED_DIR, `${result.edition}-extracted.json`);

  // Create directory if it doesn't exist
  if (!fs.existsSync(PROCESSED_DIR)) {
    fs.mkdirSync(PROCESSED_DIR, { recursive: true });
  }

  const output = {
    edition: result.edition,
    totalPages: result.totalPages,
    metadata: result.metadata,
    extractedAt: new Date().toISOString(),
    textLength: result.extractedText.length,
  };

  // Save metadata
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`✅ Metadata saved to: ${outputPath}`);

  // Save full text separately (can be large)
  const textPath = path.join(PROCESSED_DIR, `${result.edition}-text.txt`);
  fs.writeFileSync(textPath, result.extractedText);
  console.log(`✅ Full text saved to: ${textPath}`);
}

async function main() {
  console.log('🚀 Starting PDF Text Extraction\n');
  console.log('=' .repeat(60));

  const editions = [
    { path: path.join(RAW_DIR, 'blacks-law-4th-edition.pdf'), name: '4th-edition' },
    { path: path.join(RAW_DIR, 'blacks-law-9th-edition.pdf'), name: '9th-edition' },
  ];

  for (const edition of editions) {
    if (!fs.existsSync(edition.path)) {
      console.warn(`⚠️  PDF not found: ${edition.path}`);
      continue;
    }

    try {
      const result = await extractPDF(edition.path, edition.name);
      await saveExtractedText(result);
      console.log(`\n✅ ${edition.name} extraction complete!`);
    } catch (error) {
      console.error(`❌ Failed to process ${edition.name}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ PDF extraction complete!');
  console.log(`📁 Output directory: ${PROCESSED_DIR}`);
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { extractPDF, saveExtractedText };
