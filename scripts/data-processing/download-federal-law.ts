/**
 * Download Federal Law Data
 *
 * Downloads three primary federal law sources:
 * 1. US Code (54 titles) - https://uscode.house.gov
 * 2. Supreme Court Opinions (last 50 years) - CourtListener API
 * 3. Code of Federal Regulations (50 titles) - eCFR API
 *
 * Total expected size: ~1.2 GB
 * Total expected documents: ~55,000
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';
import { setTimeout } from 'timers/promises';

const DATA_DIR = path.join(__dirname, '../../data/raw/federal-law');
const US_CODE_DIR = path.join(DATA_DIR, 'us-code');
const SUPREME_COURT_DIR = path.join(DATA_DIR, 'supreme-court');
const CFR_DIR = path.join(DATA_DIR, 'cfr');

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds
const REQUEST_DELAY = 1000; // 1 second between requests

/**
 * Ensure all data directories exist
 */
function ensureDirectories() {
  [DATA_DIR, US_CODE_DIR, SUPREME_COURT_DIR, CFR_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });
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
      timeout: 30000,
      ...options,
    });
    return response.data;
  } catch (error: any) {
    if (retries > 0) {
      const delay = RETRY_DELAY * (MAX_RETRIES - retries + 1);
      console.log(`⚠️ Request failed, retrying in ${delay}ms... (${retries} retries left)`);
      await setTimeout(delay);
      return downloadWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

/**
 * Download US Code (54 titles)
 * Source: https://uscode.house.gov/download/download.shtml
 */
async function downloadUSCode() {
  console.log('\n📖 Downloading US Code (54 titles)...\n');

  // US Code is available as XML downloads from uscode.house.gov
  // For each of the 54 titles
  const titles = Array.from({ length: 54 }, (_, i) => i + 1);
  let downloaded = 0;
  let skipped = 0;

  for (const titleNum of titles) {
    const paddedTitle = String(titleNum).padStart(2, '0');
    const fileName = `usc${paddedTitle}.xml`;
    const filePath = path.join(US_CODE_DIR, fileName);

    // Skip if already downloaded
    if (fs.existsSync(filePath)) {
      skipped++;
      console.log(`⏭️ Skipping Title ${titleNum} (already exists)`);
      continue;
    }

    try {
      // Note: The actual URL structure for downloading USC XML files
      // Using the official uscode.house.gov download endpoint
      const url = `https://uscode.house.gov/download/releasepoints/us/pl/117/usc-prelim@title${paddedTitle}.xml`;

      console.log(`📥 Downloading Title ${titleNum}...`);
      const data = await downloadWithRetry(url, { responseType: 'arraybuffer' });

      fs.writeFileSync(filePath, data);
      downloaded++;
      console.log(`✅ Downloaded Title ${titleNum} (${(data.length / 1024 / 1024).toFixed(2)} MB)`);

      // Rate limiting
      await setTimeout(REQUEST_DELAY);
    } catch (error: any) {
      console.error(`❌ Failed to download Title ${titleNum}: ${error.message}`);
      // Continue with other titles even if one fails
    }
  }

  console.log(`\n📊 US Code Download Complete: ${downloaded} downloaded, ${skipped} skipped\n`);
}

/**
 * Download Supreme Court Opinions (last 50 years)
 * Source: CourtListener API (https://www.courtlistener.com/api/)
 */
async function downloadSupremeCourtOpinions() {
  console.log('\n⚖️ Downloading Supreme Court Opinions (last 50 years)...\n');

  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 50;
  const pageSize = 100;
  let totalDownloaded = 0;

  // CourtListener API endpoint for Supreme Court opinions
  // Note: You may need to register for a free API key at https://www.courtlistener.com/api/
  const baseUrl = 'https://www.courtlistener.com/api/rest/v3/opinions/';

  // Download opinions year by year
  for (let year = startYear; year <= currentYear; year++) {
    let page = 1;
    let hasMore = true;
    let yearTotal = 0;

    while (hasMore) {
      const fileName = `scotus-${year}-page${page}.json`;
      const filePath = path.join(SUPREME_COURT_DIR, fileName);

      // Skip if already downloaded
      if (fs.existsSync(filePath)) {
        console.log(`⏭️ Skipping ${year} page ${page} (already exists)`);
        page++;
        const nextFile = path.join(SUPREME_COURT_DIR, `scotus-${year}-page${page}.json`);
        if (!fs.existsSync(nextFile)) {
          hasMore = false;
        }
        continue;
      }

      try {
        const params = {
          court: 'scotus', // Supreme Court of the United States
          filed_after: `${year}-01-01`,
          filed_before: `${year}-12-31`,
          page,
          page_size: pageSize,
        };

        console.log(`📥 Downloading Supreme Court ${year} page ${page}...`);
        const data = await downloadWithRetry(baseUrl, { params });

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

        const count = data.results?.length || 0;
        yearTotal += count;
        totalDownloaded += count;

        console.log(`✅ Downloaded ${count} opinions from ${year} page ${page}`);

        // Check if there are more pages
        hasMore = data.next !== null;
        page++;

        // Rate limiting
        await setTimeout(REQUEST_DELAY);
      } catch (error: any) {
        console.error(`❌ Failed to download ${year} page ${page}: ${error.message}`);
        hasMore = false;
      }
    }

    console.log(`📊 Year ${year}: ${yearTotal} opinions downloaded`);
  }

  console.log(`\n📊 Supreme Court Download Complete: ${totalDownloaded} total opinions\n`);
}

/**
 * Download Code of Federal Regulations (50 titles)
 * Source: eCFR API (https://www.ecfr.gov/api/versioner/v1/)
 */
async function downloadCFR() {
  console.log('\n📋 Downloading Code of Federal Regulations (50 titles)...\n');

  // CFR has 50 titles
  const titles = Array.from({ length: 50 }, (_, i) => i + 1);
  let downloaded = 0;
  let skipped = 0;

  for (const titleNum of titles) {
    const fileName = `cfr-title-${titleNum}.json`;
    const filePath = path.join(CFR_DIR, fileName);

    // Skip if already downloaded
    if (fs.existsSync(filePath)) {
      skipped++;
      console.log(`⏭️ Skipping CFR Title ${titleNum} (already exists)`);
      continue;
    }

    try {
      // eCFR API endpoint for full title content
      const url = `https://www.ecfr.gov/api/versioner/v1/full/${new Date().toISOString().split('T')[0]}/title-${titleNum}.json`;

      console.log(`📥 Downloading CFR Title ${titleNum}...`);
      const data = await downloadWithRetry(url);

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      downloaded++;

      const sizeInMB = (JSON.stringify(data).length / 1024 / 1024).toFixed(2);
      console.log(`✅ Downloaded CFR Title ${titleNum} (${sizeInMB} MB)`);

      // Rate limiting
      await setTimeout(REQUEST_DELAY);
    } catch (error: any) {
      console.error(`❌ Failed to download CFR Title ${titleNum}: ${error.message}`);
      // Continue with other titles even if one fails
    }
  }

  console.log(`\n📊 CFR Download Complete: ${downloaded} downloaded, ${skipped} skipped\n`);
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

  const usCodeSize = countFilesInDir(US_CODE_DIR);
  const scotusSize = countFilesInDir(SUPREME_COURT_DIR);
  const cfrSize = countFilesInDir(CFR_DIR);

  totalBytes = usCodeSize + scotusSize + cfrSize;

  console.log('\n📊 DOWNLOAD SUMMARY\n');
  console.log('='.repeat(60));
  console.log(`US Code:           ${(usCodeSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Supreme Court:     ${(scotusSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`CFR:               ${(cfrSize / 1024 / 1024).toFixed(2)} MB`);
  console.log('-'.repeat(60));
  console.log(`Total Downloaded:  ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log('='.repeat(60));
  console.log('\n✅ Federal law data download complete!\n');
  console.log(`📁 Data saved to: ${DATA_DIR}`);
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Federal Law Data Download\n');
  console.log('='.repeat(60));
  console.log('This script will download:');
  console.log('  1. US Code (54 titles) - ~800 MB');
  console.log('  2. Supreme Court Opinions (50 years) - ~300 MB');
  console.log('  3. Code of Federal Regulations (50 titles) - ~400 MB');
  console.log('='.repeat(60));
  console.log('');

  try {
    ensureDirectories();

    // Download all three sources
    await downloadUSCode();
    await downloadSupremeCourtOpinions();
    await downloadCFR();

    // Calculate and display total size
    calculateTotalSize();

    console.log('\n🎉 All downloads complete!');
    console.log('\nNext steps:');
    console.log('  1. Run: npm run data:parse-federal (parse downloaded files)');
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
