/**
 * Download Tax Law Data
 *
 * Downloads three primary tax law sources:
 * 1. Internal Revenue Code (Title 26 USC) - Cornell LII
 * 2. Treasury Regulations (26 CFR) - eCFR
 * 3. Tax Court Opinions (last 20 years) - US Tax Court
 *
 * Total expected size: ~1.3 GB
 * Total expected documents: ~225,000
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';
import { setTimeout } from 'timers/promises';

const DATA_DIR = path.join(__dirname, '../../data/raw/tax-law');
const IRC_DIR = path.join(DATA_DIR, 'irc');
const TREASURY_REG_DIR = path.join(DATA_DIR, 'treasury-regulations');
const TAX_COURT_DIR = path.join(DATA_DIR, 'tax-court');

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;
const REQUEST_DELAY = 1500;

/**
 * Ensure all data directories exist
 */
function ensureDirectories() {
  [DATA_DIR, IRC_DIR, TREASURY_REG_DIR, TAX_COURT_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });
}

/**
 * Download with retry logic
 */
async function downloadWithRetry(
  url: string,
  options: any = {},
  retries = MAX_RETRIES
): Promise<any> {
  try {
    const response = await axios({
      url,
      timeout: 60000,
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
 * Download Internal Revenue Code (Title 26)
 * Source: Cornell LII
 */
async function downloadIRC() {
  console.log('\n💰 Downloading Internal Revenue Code (Title 26)...\n');

  // IRC has multiple subtitles (A, B, C, D, E, F, etc.)
  const subtitles = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
  let totalDownloaded = 0;

  for (const subtitle of subtitles) {
    const fileName = `irc-subtitle-${subtitle}.html`;
    const filePath = path.join(IRC_DIR, fileName);

    if (fs.existsSync(filePath)) {
      console.log(`⏭️ Skipping Subtitle ${subtitle} (already exists)`);
      continue;
    }

    try {
      // Cornell LII structure for IRC
      const url = `https://www.law.cornell.edu/uscode/text/26/subtitle-${subtitle}`;

      console.log(`📥 Downloading IRC Subtitle ${subtitle}...`);
      const html = await downloadWithRetry(url);

      fs.writeFileSync(filePath, html);
      totalDownloaded++;
      console.log(`✅ Downloaded IRC Subtitle ${subtitle} (${(html.length / 1024).toFixed(2)} KB)`);

      await setTimeout(REQUEST_DELAY);
    } catch (error: any) {
      console.error(`❌ Failed to download IRC Subtitle ${subtitle}: ${error.message}`);
    }
  }

  // Download main IRC index for chapter/section navigation
  const indexFile = path.join(IRC_DIR, 'irc-index.html');
  if (!fs.existsSync(indexFile)) {
    try {
      const indexUrl = 'https://www.law.cornell.edu/uscode/text/26';
      const indexHtml = await downloadWithRetry(indexUrl);
      fs.writeFileSync(indexFile, indexHtml);
      console.log(`✅ Downloaded IRC index`);
    } catch (error: any) {
      console.error(`❌ Failed to download IRC index: ${error.message}`);
    }
  }

  console.log(`\n📊 IRC Download Complete: ${totalDownloaded} subtitles downloaded\n`);
}

/**
 * Download Treasury Regulations (26 CFR)
 * Source: eCFR API
 */
async function downloadTreasuryRegulations() {
  console.log('\n📋 Downloading Treasury Regulations (26 CFR)...\n');

  // Treasury Regulations are in Title 26 of CFR
  const fileName = 'cfr-title-26.json';
  const filePath = path.join(TREASURY_REG_DIR, fileName);

  if (fs.existsSync(filePath)) {
    console.log('⏭️ Skipping Treasury Regulations (already exists)');
    return;
  }

  try {
    // eCFR API endpoint for Title 26
    const url = `https://www.ecfr.gov/api/versioner/v1/full/${new Date().toISOString().split('T')[0]}/title-26.json`;

    console.log('📥 Downloading Treasury Regulations (Title 26 CFR)...');
    const data = await downloadWithRetry(url);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    const sizeInMB = (JSON.stringify(data).length / 1024 / 1024).toFixed(2);
    console.log(`✅ Downloaded Treasury Regulations (${sizeInMB} MB)`);
  } catch (error: any) {
    console.error(`❌ Failed to download Treasury Regulations: ${error.message}`);
  }

  console.log('\n📊 Treasury Regulations Download Complete\n');
}

/**
 * Download Tax Court Opinions (last 20 years)
 * Source: US Tax Court (ustaxcourt.gov)
 */
async function downloadTaxCourtOpinions() {
  console.log('\n⚖️ Downloading Tax Court Opinions (last 20 years)...\n');

  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 20;
  let totalDownloaded = 0;

  // Note: US Tax Court has opinions available by year
  // We'll download opinion lists/summaries for each year
  for (let year = startYear; year <= currentYear; year++) {
    const fileName = `tax-court-${year}.html`;
    const filePath = path.join(TAX_COURT_DIR, fileName);

    if (fs.existsSync(filePath)) {
      console.log(`⏭️ Skipping ${year} (already exists)`);
      continue;
    }

    try {
      // US Tax Court opinions URL structure (may need adjustment based on actual site)
      // Alternative: Use Public.Resource.Org or other legal databases
      const url = `https://www.ustaxcourt.gov/ustcweb/OpinionSearch.aspx?year=${year}`;

      console.log(`📥 Downloading Tax Court opinions for ${year}...`);
      const html = await downloadWithRetry(url);

      if (html && html.length > 1000) {
        fs.writeFileSync(filePath, html);
        totalDownloaded++;
        console.log(`✅ Downloaded ${year} opinions (${(html.length / 1024).toFixed(2)} KB)`);
      } else {
        console.log(`⚠️ Skipping ${year} (no data or small response)`);
      }

      await setTimeout(REQUEST_DELAY * 2); // Be extra respectful to government sites
    } catch (error: any) {
      console.error(`❌ Failed to download ${year}: ${error.message}`);
    }
  }

  console.log(`\n📊 Tax Court Download Complete: ${totalDownloaded} years downloaded\n`);
}

/**
 * Calculate total size of downloaded files
 */
function calculateTotalSize(): void {
  let totalBytes = 0;

  const countFilesInDir = (dir: string): number => {
    if (!fs.existsSync(dir)) return 0;

    const files = fs.readdirSync(dir);
    let dirSize = 0;

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      if (stats.isFile()) {
        dirSize += stats.size;
      }
    });

    return dirSize;
  };

  const ircSize = countFilesInDir(IRC_DIR);
  const treasurySize = countFilesInDir(TREASURY_REG_DIR);
  const taxCourtSize = countFilesInDir(TAX_COURT_DIR);

  totalBytes = ircSize + treasurySize + taxCourtSize;

  console.log('\n📊 DOWNLOAD SUMMARY\n');
  console.log('='.repeat(60));
  console.log(`IRC (Title 26):           ${(ircSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Treasury Regulations:     ${(treasurySize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Tax Court Opinions:       ${(taxCourtSize / 1024 / 1024).toFixed(2)} MB`);
  console.log('-'.repeat(60));
  console.log(`Total Downloaded:         ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log('='.repeat(60));
  console.log('\n✅ Tax law data download complete!\n');
  console.log(`📁 Data saved to: ${DATA_DIR}`);
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Tax Law Data Download\n');
  console.log('='.repeat(60));
  console.log('This script will download:');
  console.log('  1. Internal Revenue Code (Title 26 USC) - ~400 MB');
  console.log('  2. Treasury Regulations (26 CFR) - ~600 MB');
  console.log('  3. Tax Court Opinions (20 years) - ~300 MB');
  console.log('  Total: ~1.3 GB');
  console.log('='.repeat(60));
  console.log('');

  try {
    ensureDirectories();

    // Download all three sources
    await downloadIRC();
    await downloadTreasuryRegulations();
    await downloadTaxCourtOpinions();

    // Calculate and display total size
    calculateTotalSize();

    console.log('\n🎉 All downloads complete!');
    console.log('\nNext steps:');
    console.log('  1. Run: npm run data:parse-tax (parse downloaded files)');
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
