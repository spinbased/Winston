/**
 * Parse Tax Law Data
 *
 * Parses downloaded tax law data from:
 * 1. Internal Revenue Code (HTML from Cornell LII)
 * 2. Treasury Regulations (JSON from eCFR)
 * 3. Tax Court Opinions (HTML from US Tax Court)
 *
 * Extracts structured legal content and metadata
 * Outputs to: data/processed/tax-law/
 */

import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';

const RAW_DIR = path.join(__dirname, '../../data/raw/tax-law');
const PROCESSED_DIR = path.join(__dirname, '../../data/processed/tax-law');

const IRC_RAW = path.join(RAW_DIR, 'irc');
const TREASURY_RAW = path.join(RAW_DIR, 'treasury-regulations');
const TAX_COURT_RAW = path.join(RAW_DIR, 'tax-court');

const IRC_PROCESSED = path.join(PROCESSED_DIR, 'irc');
const TREASURY_PROCESSED = path.join(PROCESSED_DIR, 'treasury-regulations');
const TAX_COURT_PROCESSED = path.join(PROCESSED_DIR, 'tax-court');

interface LegalDocument {
  id: string;
  title: string;
  content: string;
  metadata: {
    documentType: 'tax-law';
    legalContext: string;
    source: string;
    citation?: string;
    section?: string;
    subtitle?: string;
    chapter?: string;
    subchapter?: string;
    year?: string;
    caseNumber?: string;
    [key: string]: any;
  };
}

/**
 * Ensure all output directories exist
 */
function ensureDirectories() {
  [PROCESSED_DIR, IRC_PROCESSED, TREASURY_PROCESSED, TAX_COURT_PROCESSED].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });
}

/**
 * Parse IRC HTML files
 */
async function parseIRC() {
  console.log('\n💰 Parsing Internal Revenue Code...\n');

  if (!fs.existsSync(IRC_RAW)) {
    console.log('⚠️ IRC raw data not found.');
    return 0;
  }

  const files = fs.readdirSync(IRC_RAW).filter(f => f.endsWith('.html'));
  let totalDocuments = 0;

  for (const file of files) {
    const filePath = path.join(IRC_RAW, file);
    const subtitleMatch = file.match(/irc-subtitle-([A-Z])\.html/);

    if (file === 'irc-index.html') continue;

    try {
      const html = fs.readFileSync(filePath, 'utf-8');
      const $ = cheerio.load(html);
      const documents: LegalDocument[] = [];

      // Extract sections
      $('section, .section, div[id*="section"]').each((i, elem) => {
        const $section = $(elem);
        const heading = $section.find('h1, h2, h3, .heading').first().text().trim();
        const content = $section.text().trim();

        if (content.length > 100) {
          const sectionId = $section.attr('id') || `section-${i}`;

          documents.push({
            id: `irc-${subtitleMatch ? subtitleMatch[1] : 'unknown'}-${sectionId}`,
            title: heading || `IRC Section ${sectionId}`,
            content: content,
            metadata: {
              documentType: 'tax-law',
              legalContext: 'irc',
              source: 'Internal Revenue Code',
              subtitle: subtitleMatch ? subtitleMatch[1] : undefined,
              section: sectionId,
              citation: `26 U.S.C. § ${sectionId}`,
            },
          });
        }
      });

      // Fallback: extract by headings if sections not found
      if (documents.length === 0) {
        $('h2, h3').each((i, elem) => {
          const $heading = $(elem);
          const headingText = $heading.text().trim();
          let content = '';
          let $next = $heading.next();

          while ($next.length && !$next.is('h2, h3')) {
            content += $next.text() + '\n';
            $next = $next.next();
          }

          if (content.trim().length > 100) {
            documents.push({
              id: `irc-${subtitleMatch ? subtitleMatch[1] : 'unknown'}-part${i}`,
              title: headingText,
              content: content.trim(),
              metadata: {
                documentType: 'tax-law',
                legalContext: 'irc',
                source: 'Internal Revenue Code',
                subtitle: subtitleMatch ? subtitleMatch[1] : undefined,
              },
            });
          }
        });
      }

      if (documents.length > 0) {
        const outputPath = path.join(IRC_PROCESSED, file.replace('.html', '.json'));
        fs.writeFileSync(outputPath, JSON.stringify(documents, null, 2));
        totalDocuments += documents.length;
        console.log(`✅ ${file}: ${documents.length} sections extracted`);
      }
    } catch (error: any) {
      console.error(`❌ Error parsing ${file}: ${error.message}`);
    }
  }

  console.log(`\n📊 IRC Parsing Complete: ${totalDocuments} total documents\n`);
  return totalDocuments;
}

/**
 * Parse Treasury Regulations JSON
 */
async function parseTreasuryRegulations() {
  console.log('\n📋 Parsing Treasury Regulations...\n');

  const filePath = path.join(TREASURY_RAW, 'cfr-title-26.json');

  if (!fs.existsSync(filePath)) {
    console.log('⚠️ Treasury Regulations not found.');
    return 0;
  }

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const documents: LegalDocument[] = [];

    const extractSections = (node: any, parentPath: any = {}) => {
      if (node.type === 'section') {
        const sectionNum = node.identifier || node.label || '';
        const heading = node.title || node.label || '';
        const content = node.text || node.content || '';

        if (content && content.length > 50) {
          documents.push({
            id: `treas-reg-${sectionNum}`,
            title: heading || `26 CFR § ${sectionNum}`,
            content: content,
            metadata: {
              documentType: 'tax-law',
              legalContext: 'treasury-regulations',
              source: 'Treasury Regulations (26 CFR)',
              citation: `26 CFR § ${sectionNum}`,
              chapter: parentPath.chapter || '',
              part: parentPath.part || '',
              section: sectionNum,
            },
          });
        }
      }

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

    if (data.structure) {
      extractSections(data.structure);
    } else if (Array.isArray(data)) {
      data.forEach(node => extractSections(node));
    }

    const outputPath = path.join(TREASURY_PROCESSED, 'treasury-regulations.json');
    fs.writeFileSync(outputPath, JSON.stringify(documents, null, 2));

    console.log(`✅ Treasury Regulations: ${documents.length} sections extracted\n`);
    return documents.length;
  } catch (error: any) {
    console.error(`❌ Error parsing Treasury Regulations: ${error.message}`);
    return 0;
  }
}

/**
 * Parse Tax Court Opinions HTML
 */
async function parseTaxCourtOpinions() {
  console.log('\n⚖️ Parsing Tax Court Opinions...\n');

  if (!fs.existsSync(TAX_COURT_RAW)) {
    console.log('⚠️ Tax Court opinions not found.');
    return 0;
  }

  const files = fs.readdirSync(TAX_COURT_RAW).filter(f => f.endsWith('.html'));
  let totalDocuments = 0;

  for (const file of files) {
    const yearMatch = file.match(/tax-court-(\d{4})\.html/);
    if (!yearMatch) continue;

    const year = yearMatch[1];
    const filePath = path.join(TAX_COURT_RAW, file);

    try {
      const html = fs.readFileSync(filePath, 'utf-8');
      const $ = cheerio.load(html);
      const documents: LegalDocument[] = [];

      // Extract opinion links/summaries
      $('a[href*="opinion"], .opinion, .case').each((i, elem) => {
        const $elem = $(elem);
        const caseTitle = $elem.text().trim();
        const caseLink = $elem.attr('href') || '';

        // Extract case content (if available on page)
        let content = $elem.parent().text() || $elem.next().text() || caseTitle;

        if (content.length > 100) {
          documents.push({
            id: `tax-court-${year}-${i}`,
            title: caseTitle,
            content: content.trim(),
            metadata: {
              documentType: 'tax-law',
              legalContext: 'tax-court',
              source: 'US Tax Court',
              year: year,
              caseNumber: caseTitle.match(/No\.\s*\d+-\d+/)?.[0],
              url: caseLink,
            },
          });
        }
      });

      if (documents.length > 0) {
        const outputPath = path.join(TAX_COURT_PROCESSED, `tax-court-${year}.json`);
        fs.writeFileSync(outputPath, JSON.stringify(documents, null, 2));
        totalDocuments += documents.length;
        console.log(`✅ ${year}: ${documents.length} opinions extracted`);
      }
    } catch (error: any) {
      console.error(`❌ Error parsing ${year}: ${error.message}`);
    }
  }

  console.log(`\n📊 Tax Court Parsing Complete: ${totalDocuments} total documents\n`);
  return totalDocuments;
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Tax Law Data Parsing\n');
  console.log('='.repeat(60));
  console.log('Parsing downloaded tax law data...');
  console.log('='.repeat(60));
  console.log('');

  try {
    ensureDirectories();

    const ircDocs = await parseIRC();
    const treasuryDocs = await parseTreasuryRegulations();
    const taxCourtDocs = await parseTaxCourtOpinions();

    const totalDocs = ircDocs + treasuryDocs + taxCourtDocs;

    console.log('\n📊 PARSING SUMMARY\n');
    console.log('='.repeat(60));
    console.log(`IRC:                    ${ircDocs.toLocaleString()} documents`);
    console.log(`Treasury Regulations:   ${treasuryDocs.toLocaleString()} documents`);
    console.log(`Tax Court Opinions:     ${taxCourtDocs.toLocaleString()} documents`);
    console.log('-'.repeat(60));
    console.log(`Total Documents:        ${totalDocs.toLocaleString()} documents`);
    console.log('='.repeat(60));
    console.log('\n✅ Tax law parsing complete!\n');
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
