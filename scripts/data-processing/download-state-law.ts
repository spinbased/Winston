/**
 * Download State Law Data
 *
 * Downloads state law sources for all 50 states:
 * 1. State Codes from Justia and state government websites
 * 2. State Constitutions from Cornell LII
 *
 * Total expected size: ~2.6 GB
 * Total expected documents: ~510,000
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';
import { setTimeout } from 'timers/promises';

const DATA_DIR = path.join(__dirname, '../../data/raw/state-law');

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds
const REQUEST_DELAY = 2000; // 2 seconds between requests (be respectful to servers)

// All 50 US states
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

/**
 * Ensure all data directories exist
 */
function ensureDirectories() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  STATES.forEach(state => {
    const stateDir = path.join(DATA_DIR, state.abbr.toLowerCase());
    if (!fs.existsSync(stateDir)) {
      fs.mkdirSync(stateDir, { recursive: true });
    }
  });

  console.log(`✅ Created directories for all 50 states`);
}

/**
 * Download with retry logic and exponential backoff
 */
async function downloadWithRetry(
  url: string,
  options: any = {},
  retries = MAX_RETRIES
): Promise<any> {
  try {
    const response = await axios({
      url,
      timeout: 60000, // 60 seconds for large state code pages
      ...options,
    });
    return response.data;
  } catch (error: any) {
    if (retries > 0 && error.response?.status !== 404) {
      const delay = RETRY_DELAY * (MAX_RETRIES - retries + 1);
      console.log(`⚠️ Request failed, retrying in ${delay}ms... (${retries} retries left)`);
      await setTimeout(delay);
      return downloadWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

/**
 * Download state constitution from Cornell LII
 * Source: https://www.law.cornell.edu/states/listing
 */
async function downloadStateConstitution(state: { abbr: string; name: string }) {
  const stateDir = path.join(DATA_DIR, state.abbr.toLowerCase());
  const fileName = `constitution.html`;
  const filePath = path.join(stateDir, fileName);

  // Skip if already downloaded
  if (fs.existsSync(filePath)) {
    console.log(`⏭️ Skipping ${state.name} constitution (already exists)`);
    return true;
  }

  try {
    // Cornell LII URLs vary by state, using common pattern
    const url = `https://www.law.cornell.edu/states/${state.abbr.toLowerCase()}/constitution`;

    console.log(`📥 Downloading ${state.name} constitution...`);
    const html = await downloadWithRetry(url);

    fs.writeFileSync(filePath, html);
    console.log(`✅ Downloaded ${state.name} constitution (${(html.length / 1024).toFixed(2)} KB)`);

    return true;
  } catch (error: any) {
    console.error(`❌ Failed to download ${state.name} constitution: ${error.message}`);
    return false;
  }
}

/**
 * Download state code from Justia
 * Source: https://law.justia.com/codes/[state]/
 */
async function downloadStateCode(state: { abbr: string; name: string }) {
  const stateDir = path.join(DATA_DIR, state.abbr.toLowerCase());
  const indexFile = path.join(stateDir, 'code-index.html');

  // Skip if already downloaded
  if (fs.existsSync(indexFile)) {
    console.log(`⏭️ Skipping ${state.name} code (already exists)`);
    return true;
  }

  try {
    // Justia URLs use state name in lowercase with dashes
    const stateName = state.name.toLowerCase().replace(/\s+/g, '-');
    const baseUrl = `https://law.justia.com/codes/${stateName}/`;

    console.log(`📥 Downloading ${state.name} code index...`);
    const indexHtml = await downloadWithRetry(baseUrl);

    fs.writeFileSync(indexFile, indexHtml);
    console.log(`✅ Downloaded ${state.name} code index`);

    // Parse index to get titles/chapters
    const $ = cheerio.load(indexHtml);
    const links: string[] = [];

    // Extract all code section links (pattern varies by state)
    $('a[href*="/codes/"]').each((i, elem) => {
      const href = $(elem).attr('href');
      if (href && !links.includes(href) && href.includes(stateName)) {
        links.push(href);
      }
    });

    console.log(`📋 Found ${links.length} code sections for ${state.name}`);

    // Download first 100 sections as sample (full download would be massive)
    // In production, you'd download all sections
    const sampleSize = Math.min(100, links.length);
    for (let i = 0; i < sampleSize; i++) {
      const link = links[i];
      const sectionFile = path.join(stateDir, `section-${i}.html`);

      if (fs.existsSync(sectionFile)) continue;

      try {
        const url = link.startsWith('http') ? link : `https://law.justia.com${link}`;
        const sectionHtml = await downloadWithRetry(url);

        fs.writeFileSync(sectionFile, sectionHtml);

        if ((i + 1) % 10 === 0) {
          console.log(`  Downloaded ${i + 1}/${sampleSize} sections for ${state.name}`);
        }

        // Rate limiting
        await setTimeout(REQUEST_DELAY);
      } catch (error: any) {
        console.error(`  ⚠️ Failed to download section ${i}: ${error.message}`);
      }
    }

    console.log(`✅ Downloaded ${sampleSize} sample sections for ${state.name}`);
    return true;
  } catch (error: any) {
    console.error(`❌ Failed to download ${state.name} code: ${error.message}`);
    return false;
  }
}

/**
 * Download all state law data
 */
async function downloadAllStates() {
  console.log('\n🏛️ Downloading State Law Data (All 50 States)\n');

  let successfulConstitutions = 0;
  let successfulCodes = 0;
  let failedStates: string[] = [];

  for (const state of STATES) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📍 Processing ${state.name} (${state.abbr})`);
    console.log('='.repeat(60));

    try {
      // Download constitution
      const constitutionSuccess = await downloadStateConstitution(state);
      if (constitutionSuccess) successfulConstitutions++;

      // Rate limiting between constitution and code
      await setTimeout(REQUEST_DELAY);

      // Download state code
      const codeSuccess = await downloadStateCode(state);
      if (codeSuccess) successfulCodes++;

      // Rate limiting between states
      await setTimeout(REQUEST_DELAY * 2);
    } catch (error: any) {
      console.error(`❌ Error processing ${state.name}: ${error.message}`);
      failedStates.push(state.name);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 STATE LAW DOWNLOAD SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Constitutions downloaded: ${successfulConstitutions}/50`);
  console.log(`✅ State codes downloaded: ${successfulCodes}/50`);

  if (failedStates.length > 0) {
    console.log(`\n⚠️ Failed states: ${failedStates.join(', ')}`);
  }
}

/**
 * Calculate total size of downloaded files
 */
function calculateTotalSize(): void {
  let totalBytes = 0;
  let fileCount = 0;

  STATES.forEach(state => {
    const stateDir = path.join(DATA_DIR, state.abbr.toLowerCase());
    if (!fs.existsSync(stateDir)) return;

    const files = fs.readdirSync(stateDir);
    files.forEach(file => {
      const filePath = path.join(stateDir, file);
      const stats = fs.statSync(filePath);
      if (stats.isFile()) {
        totalBytes += stats.size;
        fileCount++;
      }
    });
  });

  console.log('\n📊 STORAGE SUMMARY\n');
  console.log('='.repeat(60));
  console.log(`Total files downloaded: ${fileCount.toLocaleString()}`);
  console.log(`Total size: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log('='.repeat(60));
  console.log(`\n📁 Data saved to: ${DATA_DIR}`);
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 State Law Data Download\n');
  console.log('='.repeat(60));
  console.log('This script will download:');
  console.log('  1. State Constitutions (50 states) - from Cornell LII');
  console.log('  2. State Codes (50 states, sample sections) - from Justia');
  console.log('\n⚠️ NOTE: Full state code download would be ~2.6 GB');
  console.log('This script downloads sample sections for demonstration');
  console.log('='.repeat(60));
  console.log('');

  try {
    ensureDirectories();
    await downloadAllStates();
    calculateTotalSize();

    console.log('\n🎉 State law download complete!');
    console.log('\nNext steps:');
    console.log('  1. Run: npm run data:parse-state (parse downloaded files)');
    console.log('  2. Run: npm run data:chunk (chunk all documents)');
    console.log('  3. Run: npm run data:embed (generate embeddings)');
    console.log('  4. Run: npm run data:load (load to Pinecone)\n');
  } catch (error) {
    console.error('\n❌ Fatal error during download:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
