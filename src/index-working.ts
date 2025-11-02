/**
 * Working AI Legal Assistant - Simplified for Railway
 */

import { App, ExpressReceiver } from '@slack/bolt';
import Anthropic from '@anthropic-ai/sdk';

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET || 'placeholder',
  processBeforeResponse: true,
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
  } catch (error) {
    console.error('Error processing legal query:', error);
    await respond('❌ Error processing your request. Please try again.');
  }
});

// Handle direct messages
app.message(async ({ message, say }) => {
  try {
    // Ignore bot messages and threaded replies
    if ('subtype' in message && message.subtype) return;
    if ('thread_ts' in message && message.thread_ts) return;
    if ('bot_id' in message) return;

    const text = 'text' in message ? message.text : '';
    if (!text) return;

    console.log(`[DM] Received: "${text}"`);

    if (!anthropic) {
      await say('👋 Hello! I\'m Winston, your AI legal assistant.\n\n⚠️ AI features are not configured. Please add ANTHROPIC_API_KEY.\n\nFor now, try: `/legal-help [your question]`');
      return;
    }

    await say('🤔 Let me analyze that...');

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

    await say(`⚖️ ${answer}`);
  } catch (error) {
    console.error('Error processing message:', error);
    try {
      await say('❌ Sorry, I encountered an error processing your request.');
    } catch (sayError) {
      console.error('Failed to send error message:', sayError);
    }
  }
});

// Handle @mentions
app.event('app_mention', async ({ event, say }) => {
  console.log(`[Mention] Bot mentioned: "${event.text}"`);

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
  } catch (error) {
    console.error('Error processing mention:', error);
    await say({
      text: '❌ Sorry, I encountered an error.',
      thread_ts: event.ts,
    });
  }
});

// Health check
receiver.router.get('/health', (_req, res) => {
  const status = {
    status: 'ok',
    message: 'Winston AI Legal Assistant',
    ai: anthropic ? 'enabled' : 'disabled',
    version: 'working',
  };
  res.json(status);
});

const port = parseInt(process.env.PORT || '3000', 10);

(async () => {
  await app.start(port);
  console.log('⚡️ Winston AI Legal Assistant is running!');
  console.log(`📡 Port: ${port}`);
  console.log(`🤖 AI: ${anthropic ? 'ENABLED ✅' : 'DISABLED ❌'}`);
  console.log('📬 Endpoints:');
  console.log('   - /slack/events (Slack events)');
  console.log('   - /slack/commands (Slash commands)');
  console.log('   - /health (Health check)');
})();
