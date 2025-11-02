/**
 * Parse Federal Law Data
 *
 * Parses downloaded federal law data from:
 * 1. US Code XML files (54 titles)
 * 2. Supreme Court JSON opinions
 * 3. CFR JSON files (50 titles)
 *
 * Extracts structured legal content and metadata
 * Outputs to: data/processed/federal-law/
 */

import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';

const RAW_DIR = path.join(__dirname, '../../data/raw/federal-law');
const PROCESSED_DIR = path.join(__dirname, '../../data/processed/federal-law');

const US_CODE_RAW = path.join(RAW_DIR, 'us-code');
const SCOTUS_RAW = path.join(RAW_DIR, 'supreme-court');
const CFR_RAW = path.join(RAW_DIR, 'cfr');

const US_CODE_PROCESSED = path.join(PROCESSED_DIR, 'us-code');
const SCOTUS_PROCESSED = path.join(PROCESSED_DIR, 'supreme-court');
const CFR_PROCESSED = path.join(PROCESSED_DIR, 'cfr');

interface LegalDocument {
  id: string;
  title: string;
  content: string;
  metadata: {
    documentType: 'federal-law';
    legalContext: string;
    source: string;
    citation?: string;
    date?: string;
    section?: string;
    chapter?: string;
    subtitle?: string;
    [key: string]: any;
  };
}

/**
 * Ensure all output directories exist
 */
function ensureDirectories() {
  [PROCESSED_DIR, US_CODE_PROCESSED, SCOTUS_PROCESSED, CFR_PROCESSED].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });
}

/**
 * Parse US Code XML files
 * Extracts Title/Subtitle/Chapter/Section structure
 */
async function parseUSCode() {
  console.log('\n📖 Parsing US Code XML files...\n');

  if (!fs.existsSync(US_CODE_RAW)) {
    console.log('⚠️ US Code raw data not found. Run download-federal-law.ts first.');
    return 0;
  }

  const files = fs.readdirSync(US_CODE_RAW).filter(f => f.endsWith('.xml'));
  let totalDocuments = 0;

  for (const file of files) {
    const filePath = path.join(US_CODE_RAW, file);
    const titleMatch = file.match(/usc(\d+)\.xml/);
    if (!titleMatch) continue;

    const titleNum = titleMatch[1];
    console.log(`📥 Parsing Title ${parseInt(titleNum)}...`);

    try {
      const xml = fs.readFileSync(filePath, 'utf-8');
      const $ = cheerio.load(xml, { xmlMode: true });

      const documents: LegalDocument[] = [];

      // Extract sections from XML structure
      // US Code XML has structure: <title> -> <subtitle> -> <chapter> -> <section>
      $('section').each((i, elem) => {
        const $section = $(elem);
        const sectionNum = $section.attr('identifier') || $section.attr('num') || `section-${i}`;
        const heading = $section.find('heading').first().text().trim();
        const content = $section.find('content, text').text().trim();

        // Get parent structure
        const $chapter = $section.closest('chapter');
        const $subtitle = $section.closest('subtitle');

        const chapterNum = $chapter.attr('identifier') || $chapter.attr('num') || '';
        const subtitleNum = $subtitle.attr('identifier') || $subtitle.attr('num') || '';

        if (content && content.length > 50) {
          const doc: LegalDocument = {
            id: `usc-${titleNum}-${sectionNum}`,
            title: heading || `Title ${parseInt(titleNum)}, Section ${sectionNum}`,
            content: content,
            metadata: {
              documentType: 'federal-law',
              legalContext: 'us-code',
              source: 'United States Code',
              citation: `${parseInt(titleNum)} U.S.C. § ${sectionNum}`,
              section: sectionNum,
              chapter: chapterNum,
              subtitle: subtitleNum,
              title: titleNum,
            },
          };

          documents.push(doc);
        }
      });

      // Save to JSON file
      const outputPath = path.join(US_CODE_PROCESSED, `title-${titleNum}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(documents, null, 2));

      totalDocuments += documents.length;
      console.log(`✅ Title ${parseInt(titleNum)}: ${documents.length} sections extracted`);
    } catch (error: any) {
      console.error(`❌ Error parsing Title ${titleNum}: ${error.message}`);
    }
  }

  console.log(`\n📊 US Code Parsing Complete: ${totalDocuments} total documents\n`);
  return totalDocuments;
}

/**
 * Parse Supreme Court JSON opinions
 * Extracts case name, citation, date, and opinion text
 */
async function parseSupremeCourtOpinions() {
  console.log('\n⚖️ Parsing Supreme Court Opinions...\n');

  if (!fs.existsSync(SCOTUS_RAW)) {
    console.log('⚠️ Supreme Court raw data not found. Run download-federal-law.ts first.');
    return 0;
  }

  const files = fs.readdirSync(SCOTUS_RAW).filter(f => f.endsWith('.json'));
  let totalDocuments = 0;

  for (const file of files) {
    const filePath = path.join(SCOTUS_RAW, file);

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const documents: LegalDocument[] = [];

      if (data.results && Array.isArray(data.results)) {
        data.results.forEach((opinion: any, i: number) => {
          const caseName = opinion.case_name || opinion.cluster?.case_name || 'Unknown Case';
          const citation = opinion.cluster?.citation || opinion.citations?.[0] || '';
          const dateFiled = opinion.cluster?.date_filed || opinion.date_filed || '';
          const opinionText = opinion.plain_text || opinion.html || '';

          if (opinionText && opinionText.length > 100) {
            const doc: LegalDocument = {
              id: `scotus-${opinion.id || `${file}-${i}`}`,
              title: caseName,
              content: opinionText,
              metadata: {
                documentType: 'federal-law',
                legalContext: 'supreme-court',
                source: 'Supreme Court of the United States',
                citation: citation,
                date: dateFiled,
                caseName: caseName,
                opinionType: opinion.type || 'majority',
                author: opinion.author?.name || '',
              },
            };

            documents.push(doc);
          }
        });
      }

      if (documents.length > 0) {
        const outputPath = path.join(SCOTUS_PROCESSED, file);
        fs.writeFileSync(outputPath, JSON.stringify(documents, null, 2));
        totalDocuments += documents.length;
        console.log(`✅ ${file}: ${documents.length} opinions extracted`);
      }
    } catch (error: any) {
      console.error(`❌ Error parsing ${file}: ${error.message}`);
    }
  }

  console.log(`\n📊 Supreme Court Parsing Complete: ${totalDocuments} total documents\n`);
  return totalDocuments;
}

/**
 * Parse CFR JSON files
 * Extracts Title/Chapter/Part/Section structure
 */
async function parseCFR() {
  console.log('\n📋 Parsing Code of Federal Regulations...\n');

  if (!fs.existsSync(CFR_RAW)) {
    console.log('⚠️ CFR raw data not found. Run download-federal-law.ts first.');
    return 0;
  }

  const files = fs.readdirSync(CFR_RAW).filter(f => f.endsWith('.json'));
  let totalDocuments = 0;

  for (const file of files) {
    const filePath = path.join(CFR_RAW, file);
    const titleMatch = file.match(/cfr-title-(\d+)\.json/);
    if (!titleMatch) continue;

    const titleNum = titleMatch[1];
    console.log(`📥 Parsing CFR Title ${titleNum}...`);

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const documents: LegalDocument[] = [];

      // CFR structure: title -> chapters -> parts -> sections
      const extractSections = (node: any, parentPath: any = {}) => {
        if (node.type === 'section') {
          const sectionNum = node.identifier || node.label || '';
          const heading = node.title || node.label || '';
          const content = node.text || node.content || '';

          if (content && content.length > 50) {
            const doc: LegalDocument = {
              id: `cfr-${titleNum}-${sectionNum}`,
              title: heading || `${titleNum} CFR § ${sectionNum}`,
              content: content,
              metadata: {
                documentType: 'federal-law',
                legalContext: 'cfr',
                source: 'Code of Federal Regulations',
                citation: `${titleNum} CFR § ${sectionNum}`,
                title: titleNum,
                chapter: parentPath.chapter || '',
                part: parentPath.part || '',
                section: sectionNum,
              },
            };

            documents.push(doc);
          }
        }

        // Recursively process children
        if (node.children && Array.isArray(node.children)) {
          const newPath = { ...parentPath };

          if (node.type === 'chapter') {
            newPath.chapter = node.identifier || node.label;
          } else if (node.type === 'part') {
            newPath.part = node.identifier || node.label;
          }

          node.children.forEach((child: any) => extractSections(child, newPath));
        }
      };

      // Start extraction from root
      if (data.structure) {
        extractSections(data.structure);
      } else if (Array.isArray(data)) {
        data.forEach(node => extractSections(node));
      }

      // Save to JSON file
      const outputPath = path.join(CFR_PROCESSED, `title-${titleNum}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(documents, null, 2));

      totalDocuments += documents.length;
      console.log(`✅ CFR Title ${titleNum}: ${documents.length} sections extracted`);
    } catch (error: any) {
      console.error(`❌ Error parsing CFR Title ${titleNum}: ${error.message}`);
    }
  }

  console.log(`\n📊 CFR Parsing Complete: ${totalDocuments} total documents\n`);
  return totalDocuments;
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Federal Law Data Parsing\n');
  console.log('='.repeat(60));
  console.log('Parsing downloaded federal law data...');
  console.log('='.repeat(60));
  console.log('');

  try {
    ensureDirectories();

    // Parse all three sources
    const usCodeDocs = await parseUSCode();
    const scotusDocs = await parseSupremeCourtOpinions();
    const cfrDocs = await parseCFR();

    const totalDocs = usCodeDocs + scotusDocs + cfrDocs;

    console.log('\n📊 PARSING SUMMARY\n');
    console.log('='.repeat(60));
    console.log(`US Code:           ${usCodeDocs.toLocaleString()} documents`);
    console.log(`Supreme Court:     ${scotusDocs.toLocaleString()} documents`);
    console.log(`CFR:               ${cfrDocs.toLocaleString()} documents`);
    console.log('-'.repeat(60));
    console.log(`Total Documents:   ${totalDocs.toLocaleString()} documents`);
    console.log('='.repeat(60));
    console.log('\n✅ Federal law parsing complete!\n');
    console.log(`📁 Processed data saved to: ${PROCESSED_DIR}`);
    console.log('\nNext steps:');
    console.log('  1. Run: npm run data:chunk (chunk all documents)');
    console.log('  2. Run: npm run data:embed (generate embeddings)');
    console.log('  3. Run: npm run data:load (load to Pinecone)\n');
  } catch (error) {
    console.error('\n❌ Fatal error during parsing:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
