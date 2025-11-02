const https = require('https');
const crypto = require('crypto');

const SIGNING_SECRET = '0cbfe1c0a6c5009f3d3add42334f4a5c';

// Create a proper Slack signature
function createSlackSignature(timestamp, body) {
  const sigBasestring = `v0:${timestamp}:${body}`;
  const signature = 'v0=' + crypto
    .createHmac('sha256', SIGNING_SECRET)
    .update(sigBasestring)
    .digest('hex');
  return signature;
}

const timestamp = Math.floor(Date.now() / 1000);
const payload = JSON.stringify({
  token: 'test',
  team_id: 'T12345',
  api_app_id: 'A09QL5XGC6M',
  event: {
    type: 'message',
    channel: 'D12345',
    user: 'U12345',
    text: 'Hello Winston!',
    ts: '1234567890.123456',
    event_ts: '1234567890.123456',
    channel_type: 'im'
  },
  type: 'event_callback',
  event_id: 'Ev12345',
  event_time: timestamp
});

const signature = createSlackSignature(timestamp, payload);

console.log('🧪 Testing webhook with proper Slack signature...\n');

const options = {
  hostname: 'winston-production.up.railway.app',
  port: 443,
  path: '/slack/events',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': payload.length,
    'X-Slack-Request-Timestamp': timestamp.toString(),
    'X-Slack-Signature': signature
  }
};

const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Response:', data || '(empty)');
    
    if (res.statusCode === 200) {
      console.log('\n✅ SUCCESS! Bot processed the event!');
      console.log('\nThis means:');
      console.log('- Railway is receiving webhooks ✅');
      console.log('- Signature verification works ✅');
      console.log('- Bot code is working ✅');
      console.log('\n🔍 If Slack STILL doesn\'t send real events:');
      console.log('1. Events were added but NOT SAVED');
      console.log('   → Click "Save Changes" at bottom of Event Subscriptions');
      console.log('2. App was NOT REINSTALLED after adding events');
      console.log('   → Install App → Reinstall to Workspace');
      console.log('3. Check "Recent Events" in Slack Event Subscriptions');
      console.log('   → Should show message events with 200 status');
    } else if (res.statusCode === 401) {
      console.log('\n❌ Signature verification failed');
      console.log('Signing secret might be wrong in Railway');
    } else {
      console.log(`\n⚠️  Unexpected status: ${res.statusCode}`);
    }
  });
});

req.on('error', (err) => {
  console.log('❌ Request failed:', err.message);
});

req.write(payload);
req.end();
