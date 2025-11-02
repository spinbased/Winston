/**
 * Parse State Law Data
 *
 * Parses downloaded state law data from all 50 states:
 * 1. State Constitutions (HTML from Cornell LII)
 * 2. State Codes (HTML from Justia)
 *
 * Extracts structured legal content and metadata
 * Outputs to: data/processed/state-law/{state}/
 */

import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';

const RAW_DIR = path.join(__dirname, '../../data/raw/state-law');
const PROCESSED_DIR = path.join(__dirname, '../../data/processed/state-law');

// All 50 US states (abbreviated list - same as download script)
const STATES = [
  { abbr: 'AL', name: 'Alabama' },
  { abbr: 'AK', name: 'Alaska' },
  { abbr: 'AZ', name: 'Arizona' },
  { abbr: 'AR', name: 'Arkansas' },
  { abbr: 'CA', name: 'California' },
  { abbr: 'CO', name: 'Colorado' },
  { abbr: 'CT', name: 'Connecticut' },
  { abbr: 'DE', name: 'Delaware' },
  { abbr: 'FL', name: 'Florida' },
  { abbr: 'GA', name: 'Georgia' },
  { abbr: 'HI', name: 'Hawaii' },
  { abbr: 'ID', name: 'Idaho' },
  { abbr: 'IL', name: 'Illinois' },
  { abbr: 'IN', name: 'Indiana' },
  { abbr: 'IA', name: 'Iowa' },
  { abbr: 'KS', name: 'Kansas' },
  { abbr: 'KY', name: 'Kentucky' },
  { abbr: 'LA', name: 'Louisiana' },
  { abbr: 'ME', name: 'Maine' },
  { abbr: 'MD', name: 'Maryland' },
  { abbr: 'MA', name: 'Massachusetts' },
  { abbr: 'MI', name: 'Michigan' },
  { abbr: 'MN', name: 'Minnesota' },
  { abbr: 'MS', name: 'Mississippi' },
  { abbr: 'MO', name: 'Missouri' },
  { abbr: 'MT', name: 'Montana' },
  { abbr: 'NE', name: 'Nebraska' },
  { abbr: 'NV', name: 'Nevada' },
  { abbr: 'NH', name: 'New Hampshire' },
  { abbr: 'NJ', name: 'New Jersey' },
  { abbr: 'NM', name: 'New Mexico' },
  { abbr: 'NY', name: 'New York' },
  { abbr: 'NC', name: 'North Carolina' },
  { abbr: 'ND', name: 'North Dakota' },
  { abbr: 'OH', name: 'Ohio' },
  { abbr: 'OK', name: 'Oklahoma' },
  { abbr: 'OR', name: 'Oregon' },
  { abbr: 'PA', name: 'Pennsylvania' },
  { abbr: 'RI', name: 'Rhode Island' },
  { abbr: 'SC', name: 'South Carolina' },
  { abbr: 'SD', name: 'South Dakota' },
  { abbr: 'TN', name: 'Tennessee' },
  { abbr: 'TX', name: 'Texas' },
  { abbr: 'UT', name: 'Utah' },
  { abbr: 'VT', name: 'Vermont' },
  { abbr: 'VA', name: 'Virginia' },
  { abbr: 'WA', name: 'Washington' },
  { abbr: 'WV', name: 'West Virginia' },
  { abbr: 'WI', name: 'Wisconsin' },
  { abbr: 'WY', name: 'Wyoming' },
];

interface LegalDocument {
  id: string;
  title: string;
  content: string;
  metadata: {
    documentType: 'state-law';
    legalContext: string;
    source: string;
    state: string;
    stateName: string;
    citation?: string;
    section?: string;
    article?: string;
    chapter?: string;
    title?: string;
    [key: string]: any;
  };
}

/**
 * Ensure all output directories exist
 */
function ensureDirectories() {
  if (!fs.existsSync(PROCESSED_DIR)) {
    fs.mkdirSync(PROCESSED_DIR, { recursive: true });
  }

  STATES.forEach(state => {
    const stateDir = path.join(PROCESSED_DIR, state.abbr.toLowerCase());
    if (!fs.existsSync(stateDir)) {
      fs.mkdirSync(stateDir, { recursive: true });
    }
  });

  console.log(`✅ Created processed directories for all 50 states`);
}

/**
 * Parse state constitution HTML
 */
function parseStateConstitution(state: { abbr: string; name: string }): LegalDocument[] {
  const rawPath = path.join(RAW_DIR, state.abbr.toLowerCase(), 'constitution.html');

  if (!fs.existsSync(rawPath)) {
    return [];
  }

  const documents: LegalDocument[] = [];

  try {
    const html = fs.readFileSync(rawPath, 'utf-8');
    const $ = cheerio.load(html);

    // Extract main content (varies by state/source)
    const mainContent = $('.main-content, .constitution, article, .content').first();

    if (mainContent.length === 0) {
      // Fallback: extract all paragraphs
      const allText = $('p').text();
      if (allText.length > 100) {
        documents.push({
          id: `${state.abbr.toLowerCase()}-const-full`,
          title: `${state.name} Constitution`,
          content: allText.trim(),
          metadata: {
            documentType: 'state-law',
            legalContext: 'state-constitution',
            source: `${state.name} State Constitution`,
            state: state.abbr,
            stateName: state.name,
          },
        });
      }
    } else {
      // Extract articles/sections
      let articleCount = 0;

      $('h2, h3, h4').each((i, elem) => {
        const $heading = $(elem);
        const headingText = $heading.text().trim();

        // Get content after heading until next heading
        let content = '';
        let $next = $heading.next();

        while ($next.length && !$next.is('h2, h3, h4')) {
          content += $next.text() + '\n';
          $next = $next.next();
        }

        if (content.trim().length > 50) {
          articleCount++;
          documents.push({
            id: `${state.abbr.toLowerCase()}-const-art${articleCount}`,
            title: `${state.name} Constitution - ${headingText}`,
            content: content.trim(),
            metadata: {
              documentType: 'state-law',
              legalContext: 'state-constitution',
              source: `${state.name} State Constitution`,
              state: state.abbr,
              stateName: state.name,
              article: headingText,
            },
          });
        }
      });
    }
  } catch (error: any) {
    console.error(`⚠️ Error parsing ${state.name} constitution: ${error.message}`);
  }

  return documents;
}

/**
 * Parse state code sections HTML
 */
function parseStateCode(state: { abbr: string; name: string }): LegalDocument[] {
  const rawDir = path.join(RAW_DIR, state.abbr.toLowerCase());
  const documents: LegalDocument[] = [];

  if (!fs.existsSync(rawDir)) {
    return [];
  }

  const files = fs.readdirSync(rawDir).filter(f => f.startsWith('section-') && f.endsWith('.html'));

  files.forEach(file => {
    try {
      const html = fs.readFileSync(path.join(rawDir, file), 'utf-8');
      const $ = cheerio.load(html);

      // Extract section number/title
      const sectionTitle = $('h1, .section-title, .statute-title').first().text().trim();
      const sectionText = $('.section-content, .statute-text, article p').text().trim();

      if (sectionText.length > 50) {
        const sectionId = file.replace('section-', '').replace('.html', '');

        documents.push({
          id: `${state.abbr.toLowerCase()}-code-${sectionId}`,
          title: sectionTitle || `${state.name} Code Section ${sectionId}`,
          content: sectionText,
          metadata: {
            documentType: 'state-law',
            legalContext: 'state-code',
            source: `${state.name} State Code`,
            state: state.abbr,
            stateName: state.name,
            section: sectionId,
          },
        });
      }
    } catch (error: any) {
      console.error(`⚠️ Error parsing ${state.name} ${file}: ${error.message}`);
    }
  });

  return documents;
}

/**
 * Parse all state law data
 */
async function parseAllStates() {
  console.log('\n🏛️ Parsing State Law Data (All 50 States)\n');

  let totalDocuments = 0;
  const stateCounts: { [key: string]: number } = {};

  for (const state of STATES) {
    console.log(`📥 Parsing ${state.name}...`);

    const constitutionDocs = parseStateConstitution(state);
    const codeDocs = parseStateCode(state);

    const allDocs = [...constitutionDocs, ...codeDocs];

    if (allDocs.length > 0) {
      const outputPath = path.join(PROCESSED_DIR, state.abbr.toLowerCase(), 'state-law.json');
      fs.writeFileSync(outputPath, JSON.stringify(allDocs, null, 2));

      stateCounts[state.abbr] = allDocs.length;
      totalDocuments += allDocs.length;

      console.log(`✅ ${state.name}: ${allDocs.length} documents (${constitutionDocs.length} constitution, ${codeDocs.length} code)`);
    } else {
      console.log(`⚠️ ${state.name}: No documents found`);
    }
  }

  console.log('\n📊 STATE LAW PARSING SUMMARY\n');
  console.log('='.repeat(60));
  console.log(`Total documents: ${totalDocuments.toLocaleString()}`);
  console.log(`States processed: ${Object.keys(stateCounts).length}/50`);
  console.log('='.repeat(60));
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 State Law Data Parsing\n');
  console.log('='.repeat(60));
  console.log('Parsing downloaded state law data...');
  console.log('='.repeat(60));
  console.log('');

  try {
    ensureDirectories();
    await parseAllStates();

    console.log('\n✅ State law parsing complete!\n');
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
