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
app.command('/legal-help', async ({ command, ack, respond }) => {
  await ack();
  await respond('Winston is running! Add API keys to enable full features.');
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
