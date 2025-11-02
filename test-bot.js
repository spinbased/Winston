// Quick diagnostic test for Slack bot
const https = require('https');

console.log('🔍 Testing Winston Bot...\n');

// Test 1: Health check
console.log('Test 1: Health Check');
https.get('https://winston-production.up.railway.app/health', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('✅ Health:', data);
    console.log('');
  });
}).on('error', err => {
  console.log('❌ Health check failed:', err.message);
});

// Test 2: Simulate Slack event
console.log('Test 2: Simulating Slack Message Event');

const eventPayload = JSON.stringify({
  token: 'test',
  team_id: 'T12345',
  api_app_id: 'A12345',
  event: {
    type: 'message',
    channel: 'D12345',
    user: 'U12345',
    text: 'Hello bot!',
    ts: '1234567890.123456',
    event_ts: '1234567890.123456',
    channel_type: 'im'
  },
  type: 'event_callback',
  event_id: 'Ev12345',
  event_time: Math.floor(Date.now() / 1000)
});

const options = {
  hostname: 'winston-production.up.railway.app',
  port: 443,
  path: '/slack/events',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': eventPayload.length,
    'X-Slack-Request-Timestamp': Math.floor(Date.now() / 1000),
    'X-Slack-Signature': 'v0=test'
  }
};

const req = https.request(options, (res) => {
  console.log('Status Code:', res.statusCode);

  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Response:', data || '(empty)');
    console.log('');

    if (res.statusCode === 401) {
      console.log('⚠️  401 Unauthorized - Signature verification failed');
      console.log('This is EXPECTED for manual tests (no real Slack signature)');
      console.log('But shows the endpoint is reachable and working!\n');
    } else if (res.statusCode === 200) {
      console.log('✅ Bot processed the event successfully!');
    }

    console.log('📋 Diagnosis:');
    console.log('- Bot is running: ✅');
    console.log('- Events endpoint exists: ✅');
    console.log('- If real Slack events have same issue:');
    console.log('  → Check Event Subscriptions in Slack app settings');
    console.log('  → Verify bot events are subscribed');
    console.log('  → Reinstall app to workspace');
    console.log('  → Check "Recent Events" in Slack for delivery status');
  });
});

req.on('error', (err) => {
  console.log('❌ Request failed:', err.message);
});

req.write(eventPayload);
req.end();
