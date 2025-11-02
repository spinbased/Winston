/**
 * Minimal Winston - Just for Slack URL Verification
 */

import { App, ExpressReceiver } from '@slack/bolt';

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET || 'placeholder',
  processBeforeResponse: true,
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN || 'xoxb-placeholder',
  receiver,
});

// Simple test command
app.command('/legal-help', async ({ ack, respond }) => {
  await ack();
  await respond('✅ Winston is running! Add API keys to enable full features.');
});

// Handle direct messages
app.message(async ({ message, say }) => {
  // Only respond to regular messages (not bot messages)
  if (message.subtype === undefined || message.subtype === 'file_share') {
    const text = 'text' in message ? message.text : '';
    console.log(`[Message] Received DM: "${text}"`);
    await say('👋 Hello! I\'m Winston, your AI legal assistant.\n\n✅ I\'m running in minimal mode. Add ANTHROPIC_API_KEY to enable full AI legal analysis.\n\nFor now, try: `/legal-help [your question]`');
  }
});

// Handle @mentions
app.event('app_mention', async ({ event, say }) => {
  console.log(`[Mention] Bot mentioned: "${event.text}"`);
  await say({
    text: '👋 Hello! I\'m Winston, your AI legal assistant.\n\n✅ I\'m running in minimal mode. Add ANTHROPIC_API_KEY to enable full AI legal analysis.\n\nFor now, try: `/legal-help [your question]`',
    thread_ts: event.ts, // Reply in thread
  });
});

// Health check
receiver.router.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Winston minimal mode' });
});

const port = parseInt(process.env.PORT || '3000', 10);

(async () => {
  await app.start(port);
  console.log(`⚡️ Winston minimal mode running on port ${port}`);
  console.log(`📡 Slack events at /slack/events`);
  console.log(`🏥 Health check at /health`);
})();
