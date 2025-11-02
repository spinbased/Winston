/**
 * Complete diagnostic script
 * Checks EVERYTHING about the Slack bot setup
 */

const https = require('https');

// You need to provide these
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN || '';
const SLACK_APP_ID = 'A09QL5XGC6M';

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    }).on('error', reject);
  });
}

function slackAPI(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'slack.com',
      port: 443,
      path: `/api/${endpoint}`,
      method: method,
      headers: {
        'Authorization': `Bearer ${SLACK_BOT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(responseData));
        } catch (e) {
          resolve(responseData);
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function diagnose() {
  console.log('🔍 COMPLETE DIAGNOSTIC REPORT\n');
  console.log('=' .repeat(60));

  // Check 1: Railway Health
  console.log('\n1️⃣ RAILWAY DEPLOYMENT');
  console.log('-'.repeat(60));

  try {
    const health = await httpsGet('https://winston-production.up.railway.app/health');
    console.log(`✅ Status: ${health.status}`);
    console.log(`Response:`, JSON.stringify(health.body, null, 2));
  } catch (err) {
    console.log(`❌ Railway Error: ${err.message}`);
  }

  // Check 2: Slack Events Endpoint
  console.log('\n2️⃣ SLACK EVENTS ENDPOINT');
  console.log('-'.repeat(60));

  try {
    const https = require('https');
    const postData = JSON.stringify({ type: 'url_verification', challenge: 'test' });

    const options = {
      hostname: 'winston-production.up.railway.app',
      port: 443,
      path: '/slack/events',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };

    await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        console.log(`Status Code: ${res.statusCode}`);
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log(`Response: ${data || '(empty)'}`);
          resolve();
        });
      });
      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  } catch (err) {
    console.log(`❌ Events endpoint error: ${err.message}`);
  }

  if (!SLACK_BOT_TOKEN || SLACK_BOT_TOKEN.includes('placeholder')) {
    console.log('\n❌ SLACK_BOT_TOKEN not provided');
    console.log('Set environment variable to continue Slack API checks\n');
    return;
  }

  // Check 3: Bot Authentication
  console.log('\n3️⃣ SLACK BOT AUTHENTICATION');
  console.log('-'.repeat(60));

  try {
    const auth = await slackAPI('auth.test', 'POST');

    if (auth.ok) {
      console.log('✅ Bot authenticated successfully');
      console.log(`   Team: ${auth.team}`);
      console.log(`   User: ${auth.user}`);
      console.log(`   Bot ID: ${auth.bot_id}`);
      console.log(`   User ID: ${auth.user_id}`);
    } else {
      console.log(`❌ Auth failed: ${auth.error}`);
    }
  } catch (err) {
    console.log(`❌ Auth error: ${err.message}`);
  }

  // Check 4: Bot Info
  console.log('\n4️⃣ BOT INFORMATION');
  console.log('-'.repeat(60));

  try {
    const auth = await slackAPI('auth.test', 'POST');
    if (auth.ok && auth.bot_id) {
      const botInfo = await slackAPI(`bots.info?bot=${auth.bot_id}`);

      if (botInfo.ok) {
        console.log('✅ Bot details:');
        console.log(`   Name: ${botInfo.bot.name}`);
        console.log(`   App ID: ${botInfo.bot.app_id}`);
        console.log(`   Deleted: ${botInfo.bot.deleted}`);
      }
    }
  } catch (err) {
    console.log(`⚠️  Could not fetch bot info: ${err.message}`);
  }

  // Check 5: Conversations
  console.log('\n5️⃣ BOT CONVERSATIONS');
  console.log('-'.repeat(60));

  try {
    const convos = await slackAPI('conversations.list?types=im&limit=5');

    if (convos.ok) {
      console.log(`✅ Bot has access to ${convos.channels.length} DM channels`);
      convos.channels.slice(0, 3).forEach((ch, i) => {
        console.log(`   ${i + 1}. Channel ID: ${ch.id}`);
      });
    } else {
      console.log(`❌ Failed to list conversations: ${convos.error}`);
    }
  } catch (err) {
    console.log(`❌ Conversations error: ${err.message}`);
  }

  // Check 6: Team Info
  console.log('\n6️⃣ WORKSPACE INFORMATION');
  console.log('-'.repeat(60));

  try {
    const team = await slackAPI('team.info');

    if (team.ok) {
      console.log('✅ Workspace:');
      console.log(`   Name: ${team.team.name}`);
      console.log(`   Domain: ${team.team.domain}.slack.com`);
      console.log(`   ID: ${team.team.id}`);
    }
  } catch (err) {
    console.log(`⚠️  Team info unavailable: ${err.message}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('📋 DIAGNOSTIC SUMMARY');
  console.log('='.repeat(60));
  console.log('\nWhat to check next:');
  console.log('1. Go to: https://api.slack.com/apps/' + SLACK_APP_ID + '/event-subscriptions');
  console.log('   - Verify Request URL shows green ✅');
  console.log('   - Check "Recent Events" at bottom of page');
  console.log('   - Verify 3 bot events are subscribed');
  console.log('');
  console.log('2. Go to: https://api.slack.com/apps/' + SLACK_APP_ID + '/slash-commands');
  console.log('   - Verify /legal-help command exists');
  console.log('   - Check Request URL is correct');
  console.log('');
  console.log('3. Go to: https://api.slack.com/apps/' + SLACK_APP_ID + '/install-on-team');
  console.log('   - Verify app is installed');
  console.log('   - Check installation timestamp');
  console.log('');
  console.log('4. In Slack workspace:');
  console.log('   - Type / and look for /legal-help in autocomplete');
  console.log('   - Find Winston in Apps section');
  console.log('   - Send a message NOT in a thread');
  console.log('\n');
}

diagnose().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
