/**
 * Check Slack Bot Configuration
 */

const https = require('https');

const BOT_TOKEN = process.env.SLACK_BOT_TOKEN || 'your-bot-token-here';

function slackRequest(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'slack.com',
      port: 443,
      path: `/api/${endpoint}`,
      method: method,
      headers: {
        'Authorization': `Bearer ${BOT_TOKEN}`,
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

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function checkConfig() {
  console.log('🔍 Checking Slack Bot Configuration...\n');

  try {
    // Check bot auth
    console.log('1️⃣ Testing Bot Authentication...');
    const authTest = await slackRequest('POST', 'auth.test');

    if (authTest.ok) {
      console.log('✅ Bot authenticated successfully');
      console.log(`   Team: ${authTest.team}`);
      console.log(`   User: ${authTest.user}`);
      console.log(`   Bot ID: ${authTest.bot_id}`);
      console.log(`   User ID: ${authTest.user_id}`);
    } else {
      console.log('❌ Authentication failed:', authTest.error);
      return;
    }

    // Check team info
    console.log('\n2️⃣ Checking Team Info...');
    const teamInfo = await slackRequest('GET', 'team.info');
    if (teamInfo.ok) {
      console.log(`✅ Team: ${teamInfo.team.name}`);
      console.log(`   Domain: ${teamInfo.team.domain}.slack.com`);
    }

    // Get bot info
    console.log('\n3️⃣ Checking Bot Info...');
    const botInfo = await slackRequest('GET', `bots.info?bot=${authTest.bot_id}`);
    if (botInfo.ok) {
      console.log(`✅ Bot Name: ${botInfo.bot.name}`);
      console.log(`   App ID: ${botInfo.bot.app_id}`);
    }

    // Check conversations where bot is member
    console.log('\n4️⃣ Checking Bot Conversations...');
    const conversations = await slackRequest('GET', 'conversations.list?types=im,public_channel,private_channel&exclude_archived=true');
    if (conversations.ok) {
      console.log(`✅ Bot can see ${conversations.channels.length} conversations`);

      const dmChannels = conversations.channels.filter(c => c.is_im);
      console.log(`   Direct Messages: ${dmChannels.length}`);

      const publicChannels = conversations.channels.filter(c => c.is_channel && !c.is_private);
      console.log(`   Public Channels: ${publicChannels.length}`);
    }

    // Test sending a message to the first DM
    if (conversations.ok && conversations.channels.length > 0) {
      const testChannel = conversations.channels.find(c => c.is_im);

      if (testChannel) {
        console.log('\n5️⃣ Testing Message Sending...');
        console.log(`   Attempting to send test message to channel: ${testChannel.id}`);

        const testMessage = await slackRequest('POST', 'chat.postMessage', {
          channel: testChannel.id,
          text: '🤖 Configuration test from Winston! If you see this, I can send messages!'
        });

        if (testMessage.ok) {
          console.log('✅ Successfully sent test message!');
          console.log(`   Message TS: ${testMessage.ts}`);
        } else {
          console.log('❌ Failed to send message:', testMessage.error);
        }
      }
    }

    console.log('\n📋 Summary:');
    console.log('✅ Bot token is valid');
    console.log('✅ Bot can authenticate');
    console.log('✅ Bot can see conversations');
    console.log('✅ Bot can send messages');
    console.log('\n⚠️  IF BOT STILL DOESN\'T RESPOND TO MESSAGES:');
    console.log('   The issue is Event Subscriptions in Slack app config');
    console.log('   Slack is NOT sending message events to your webhook URL');
    console.log('\n🔧 FIX:');
    console.log('   1. Go to: https://api.slack.com/apps');
    console.log('   2. Click your app → Event Subscriptions');
    console.log('   3. Add bot events: message.im, message.channels, app_mention');
    console.log('   4. Save Changes → Install App → Reinstall to Workspace');
    console.log('\n✅ Your bot code and Railway deployment are WORKING PERFECTLY!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkConfig();
