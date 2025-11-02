/**
 * Real test of Slack connectivity
 * Tests if bot can actually post messages
 */

const https = require('https');

// Get from Railway or .env
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN || '';
const USER_ID = 'U099Y4Z8DNJ'; // From the logs you shared

if (!SLACK_BOT_TOKEN || SLACK_BOT_TOKEN.includes('placeholder')) {
  console.error('❌ SLACK_BOT_TOKEN not set or is placeholder');
  console.log('Please set SLACK_BOT_TOKEN environment variable');
  process.exit(1);
}

function slackAPI(endpoint, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);

    const options = {
      hostname: 'slack.com',
      port: 443,
      path: `/api/${endpoint}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SLACK_BOT_TOKEN}`,
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(postData)
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
    req.write(postData);
    req.end();
  });
}

async function test() {
  console.log('🔍 Testing Slack Bot Connection...\n');

  // Test 1: Auth
  console.log('1️⃣ Testing authentication...');
  const auth = await slackAPI('auth.test', {});

  if (!auth.ok) {
    console.error('❌ Auth failed:', auth.error);
    return;
  }

  console.log('✅ Authenticated as:', auth.user);
  console.log('   Team:', auth.team);
  console.log('   Bot ID:', auth.bot_id);
  console.log('   User ID:', auth.user_id);

  // Test 2: Open DM
  console.log('\n2️⃣ Opening DM channel with user...');
  const dmOpen = await slackAPI('conversations.open', {
    users: USER_ID
  });

  if (!dmOpen.ok) {
    console.error('❌ Failed to open DM:', dmOpen.error);
    return;
  }

  const channelId = dmOpen.channel.id;
  console.log('✅ DM Channel ID:', channelId);

  // Test 3: Send message
  console.log('\n3️⃣ Sending test message...');
  const msg = await slackAPI('chat.postMessage', {
    channel: channelId,
    text: '🤖 TEST MESSAGE FROM WINSTON\n\nIf you see this, my bot token is working and I can send messages!\n\nThe issue must be with event handling, not with the token.',
    mrkdwn: true
  });

  if (!msg.ok) {
    console.error('❌ Failed to send message:', msg.error);
    return;
  }

  console.log('✅ Message sent successfully!');
  console.log('   Message TS:', msg.ts);
  console.log('   Channel:', msg.channel);

  console.log('\n📊 Summary:');
  console.log('✅ Bot token is VALID');
  console.log('✅ Bot CAN send messages');
  console.log('✅ Bot CAN open DMs');
  console.log('\n💡 If Winston still doesn\'t respond to your messages:');
  console.log('   1. Check Event Subscriptions in Slack app settings');
  console.log('   2. Verify the 3 bot events are subscribed');
  console.log('   3. Check "Recent Events" section shows 200 OK');
  console.log('   4. Make sure app was reinstalled after adding events');
}

test().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
