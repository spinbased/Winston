/**
 * ULTRA SIMPLE VERSION - Just respond to EVERYTHING
 * No filters, no AI, just immediate responses
 */

import { App, ExpressReceiver } from '@slack/bolt';

console.log('🚀 Starting ULTRA SIMPLE Winston...');

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET || 'placeholder',
  processBeforeResponse: true,
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN || 'xoxb-placeholder',
  receiver,
});

// Respond to EVERY message, no exceptions
app.message(async ({ message, say }) => {
  console.log('📩 GOT MESSAGE:', JSON.stringify(message, null, 2));

  try {
    // Get text
    const text = 'text' in message ? message.text : '';
    console.log('📝 Message text:', text);

    // Determine if thread
    const threadTs = (message as any).thread_ts;
    const replyOptions = threadTs ? { thread_ts: threadTs } : {};

    console.log('💬 Sending response...');

    // Send simple response
    await say({
      text: `✅ I received your message: "${text}"\n\n🤖 Winston is working! (Ultra Simple Mode)\n\nThis proves:\n- ✅ Slack is sending events\n- ✅ Bot is receiving them\n- ✅ Bot can respond\n\nBot token: ${process.env.SLACK_BOT_TOKEN ? 'SET' : 'NOT SET'}\nAI key: ${process.env.ANTHROPIC_API_KEY ? 'SET' : 'NOT SET'}`,
      ...replyOptions
    });

    console.log('✅ Response sent successfully!');
  } catch (error) {
    console.error('❌ ERROR:', error);
    await say('❌ Error: ' + (error as Error).message);
  }
});

// Slash command - ultra simple
app.command('/legal-help', async ({ ack, respond, command }) => {
  console.log('📝 SLASH COMMAND:', command.command, command.text);

  try {
    await ack();
    console.log('✅ Command acknowledged');

    await respond({
      text: `✅ Slash command working!\n\nYou asked: "${command.text}"\n\n🤖 Winston is receiving slash commands correctly!\n\nThis proves the /legal-help command is configured and working.`,
      response_type: 'in_channel'
    });

    console.log('✅ Slash command response sent');
  } catch (error) {
    console.error('❌ SLASH ERROR:', error);
  }
});

// @mention
app.event('app_mention', async ({ event, say }) => {
  console.log('👋 MENTION:', event.text);

  try {
    await say({
      text: `✅ Mention received!\n\nYou said: "${event.text}"\n\n🤖 Winston can see @mentions!`,
      thread_ts: event.ts
    });
    console.log('✅ Mention response sent');
  } catch (error) {
    console.error('❌ MENTION ERROR:', error);
  }
});

// Error handler
app.error(async (error) => {
  console.error('🚨🚨🚨 APP ERROR:', error);
});

// Health
receiver.router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Winston Ultra Simple',
    version: 'ultra-simple',
    ready: true
  });
});

// Log ALL requests
receiver.router.use((req, _res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

const port = parseInt(process.env.PORT || '3000', 10);

(async () => {
  await app.start(port);
  console.log('\n✅✅✅ WINSTON ULTRA SIMPLE IS RUNNING ✅✅✅');
  console.log(`Port: ${port}`);
  console.log('Bot will respond to EVERY message with confirmation');
  console.log('This is for debugging only\n');
})();
