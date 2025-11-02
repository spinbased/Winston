/**
 * Winston AI Legal Assistant - DEBUG VERSION
 * Added extensive logging to diagnose header issues
 */

import { App, ExpressReceiver } from '@slack/bolt';
import Anthropic from '@anthropic-ai/sdk';
import { Request, Response, NextFunction } from 'express';

console.log('🔍 Starting Winston with DEBUG logging...');
console.log('Environment check:');
console.log(`- SLACK_BOT_TOKEN: ${process.env.SLACK_BOT_TOKEN ? 'SET (length: ' + process.env.SLACK_BOT_TOKEN.length + ')' : 'NOT SET'}`);
console.log(`- SLACK_SIGNING_SECRET: ${process.env.SLACK_SIGNING_SECRET ? 'SET (length: ' + process.env.SLACK_SIGNING_SECRET.length + ')' : 'NOT SET'}`);
console.log(`- ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? 'SET' : 'NOT SET'}`);

// Create receiver with debug logging
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET || 'placeholder',
  processBeforeResponse: true,
});

// Add request logger BEFORE Slack handles it
receiver.router.use('/slack/events', (req: Request, _res: Response, next: NextFunction) => {
  console.log('\n🔍 === INCOMING REQUEST TO /slack/events ===');
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body preview:', JSON.stringify(req.body, null, 2).substring(0, 200));
  console.log('==============================================\n');
  next();
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN || 'xoxb-placeholder',
  receiver,
});

// Initialize Anthropic if key is available
const anthropic = process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.includes('placeholder')
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// Legal expert system prompt
const LEGAL_SYSTEM_PROMPT = `You are Winston, a master AI legal assistant with comprehensive expertise in:
- Black's Law Dictionary (all editions)
- U.S. Constitution and all amendments
- Constitutional law and common law
- Sovereign citizenship legal framework
- American founding fathers' vision and intent

Your personality:
- Sharp, intelligent, and to the point
- Cool, calm, and collected
- Well-informed with precise legal reasoning
- Professional yet accessible

Provide thorough legal explanations with proper citations when possible.`;

// Handle slash commands
app.command('/legal-help', async ({ ack, respond, command }) => {
  console.log('📝 Slash command received:', command.command);
  await ack();

  const question = command.text.trim();

  if (!question) {
    await respond('Please provide a legal question. Example: `/legal-help What is due process?`');
    return;
  }

  if (!anthropic) {
    await respond('⚠️ AI features not configured. Please add ANTHROPIC_API_KEY to enable legal analysis.');
    return;
  }

  try {
    await respond('🤔 Analyzing your legal question...');

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2048,
      temperature: 0.3,
      system: LEGAL_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: question,
      }],
    });

    const answer = message.content[0].type === 'text' ? message.content[0].text : 'Unable to process request';

    await respond({
      text: `⚖️ *Legal Analysis*\n\n${answer}\n\n_Powered by Winston AI Legal Assistant_`,
      response_type: 'in_channel',
    });

    console.log('✅ Slash command processed successfully');
  } catch (error) {
    console.error('❌ Error processing legal query:', error);
    await respond('❌ Error processing your request. Please try again.');
  }
});

// Handle direct messages
app.message(async ({ message, say }) => {
  console.log('💬 Message event received:', JSON.stringify(message, null, 2));

  // Ignore bot messages and threaded replies
  if (message.subtype || (message as any).thread_ts) {
    console.log('⏭️ Skipping: bot message or threaded reply');
    return;
  }

  const text = 'text' in message ? message.text : '';
  if (!text) {
    console.log('⏭️ Skipping: no text content');
    return;
  }

  console.log(`📩 [DM] Received: "${text}"`);

  if (!anthropic) {
    console.log('⚠️ No AI key, sending default response');
    await say('👋 Hello! I\'m Winston, your AI legal assistant.\n\n⚠️ AI features are not configured. Please add ANTHROPIC_API_KEY.\n\nFor now, try: `/legal-help [your question]`');
    return;
  }

  try {
    console.log('🤖 Sending thinking message...');
    await say('🤔 Let me analyze that...');

    console.log('🧠 Calling Claude API...');
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2048,
      temperature: 0.3,
      system: LEGAL_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: text,
      }],
    });

    const answer = response.content[0].type === 'text' ? response.content[0].text : 'Unable to process request';

    console.log('📤 Sending AI response...');
    await say(`⚖️ ${answer}`);
    console.log('✅ Message processed successfully');
  } catch (error) {
    console.error('❌ Error processing message:', error);
    await say('❌ Sorry, I encountered an error processing your request.');
  }
});

// Handle @mentions
app.event('app_mention', async ({ event, say }) => {
  console.log('👋 Mention event received:', JSON.stringify(event, null, 2));
  console.log(`[@] Bot mentioned: "${event.text}"`);

  // Remove the bot mention from text
  const text = event.text.replace(/<@[A-Z0-9]+>/g, '').trim();

  if (!text) {
    await say({
      text: '👋 Hello! Ask me any legal question and I\'ll provide analysis.',
      thread_ts: event.ts,
    });
    return;
  }

  if (!anthropic) {
    await say({
      text: '⚠️ AI features not configured. Use `/legal-help [question]` or configure ANTHROPIC_API_KEY.',
      thread_ts: event.ts,
    });
    return;
  }

  try {
    await say({
      text: '🤔 Analyzing...',
      thread_ts: event.ts,
    });

    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2048,
      temperature: 0.3,
      system: LEGAL_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: text,
      }],
    });

    const answer = response.content[0].type === 'text' ? response.content[0].text : 'Unable to process request';

    await say({
      text: `⚖️ ${answer}`,
      thread_ts: event.ts,
    });

    console.log('✅ Mention processed successfully');
  } catch (error) {
    console.error('❌ Error processing mention:', error);
    await say({
      text: '❌ Sorry, I encountered an error.',
      thread_ts: event.ts,
    });
  }
});

// Add error handler
app.error(async (error) => {
  console.error('🚨 APP ERROR:', error);
});

// Health check
receiver.router.get('/health', (_req, res) => {
  const status = {
    status: 'ok',
    message: 'Winston AI Legal Assistant',
    ai: anthropic ? 'enabled' : 'disabled',
    version: 'debug',
    env_check: {
      bot_token: !!process.env.SLACK_BOT_TOKEN,
      signing_secret: !!process.env.SLACK_SIGNING_SECRET,
      anthropic_key: !!process.env.ANTHROPIC_API_KEY,
    },
    endpoints: {
      events: '/slack/events',
      commands: '/slack/commands',
      health: '/health'
    }
  };
  res.json(status);
});

const port = parseInt(process.env.PORT || '3000', 10);

(async () => {
  await app.start(port);
  console.log('\n⚡️ Winston AI Legal Assistant is running!');
  console.log(`📡 Port: ${port}`);
  console.log(`🤖 AI: ${anthropic ? 'ENABLED ✅' : 'DISABLED ❌'}`);
  console.log('📬 Endpoints:');
  console.log('   - /slack/events (Slack events)');
  console.log('   - /slack/commands (Slash commands)');
  console.log('   - /health (Health check)');
  console.log('\n🔍 DEBUG MODE ACTIVE - Detailed logging enabled');
  console.log('   Watch for incoming request logs above');
  console.log('   Slack Event Subscriptions URL:');
  console.log('   https://winston-production.up.railway.app/slack/events\n');
})();
