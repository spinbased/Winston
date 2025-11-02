/**
 * Winston AI Legal Assistant - FINAL WORKING VERSION
 * Fixed: Responds to ALL messages, including in threads
 */

import { App, ExpressReceiver } from '@slack/bolt';
import Anthropic from '@anthropic-ai/sdk';

console.log('🔍 Starting Winston...');
console.log('Environment check:');
console.log(`- SLACK_BOT_TOKEN: ${process.env.SLACK_BOT_TOKEN ? 'SET ✅' : 'NOT SET ❌'}`);
console.log(`- SLACK_SIGNING_SECRET: ${process.env.SLACK_SIGNING_SECRET ? 'SET ✅' : 'NOT SET ❌'}`);
console.log(`- ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? 'SET ✅' : 'NOT SET ❌'}`);

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET || 'placeholder',
  processBeforeResponse: true,
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN || 'xoxb-placeholder',
  receiver,
});

// Initialize Anthropic
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
  console.log('📝 Slash command received:', command.command, 'from user:', command.user_id);

  try {
    await ack();
    console.log('✅ Slash command acknowledged');

    const question = command.text.trim();

    if (!question) {
      await respond('Please provide a legal question. Example: `/legal-help What is due process?`');
      return;
    }

    if (!anthropic) {
      await respond('⚠️ AI features not configured. Please add ANTHROPIC_API_KEY to enable legal analysis.');
      return;
    }

    console.log('🧠 Processing question:', question);
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

    console.log('✅ Slash command response sent');
  } catch (error) {
    console.error('❌ Error processing slash command:', error);
    try {
      await respond('❌ Error processing your request. Please try again.');
    } catch (e) {
      console.error('❌ Failed to send error response:', e);
    }
  }
});

// Handle ALL messages (including threads, DMs, everything)
app.message(async ({ message, say }) => {
  console.log('💬 Message received:', JSON.stringify(message, null, 2));

  // Only ignore bot's OWN messages
  if (message.subtype === 'bot_message') {
    console.log('⏭️ Skipping: bot message (from another bot)');
    return;
  }

  const text = 'text' in message ? message.text : '';
  if (!text) {
    console.log('⏭️ Skipping: no text content');
    return;
  }

  console.log(`📩 Processing message: "${text}"`);

  if (!anthropic) {
    console.log('⚠️ No AI key configured');
    await say('👋 Hello! I\'m Winston, your AI legal assistant.\n\n⚠️ AI features are not configured. Please add ANTHROPIC_API_KEY.\n\nFor now, try: `/legal-help [your question]`');
    return;
  }

  try {
    console.log('🤖 Sending thinking message...');

    // If it's a thread, reply in thread. Otherwise reply normally.
    const replyOptions = (message as any).thread_ts ? { thread_ts: (message as any).thread_ts } : {};

    await say({
      text: '🤔 Let me analyze that...',
      ...replyOptions
    });

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
    await say({
      text: `⚖️ ${answer}`,
      ...replyOptions
    });

    console.log('✅ Message processed successfully');
  } catch (error) {
    console.error('❌ Error processing message:', error);
    const replyOptions = (message as any).thread_ts ? { thread_ts: (message as any).thread_ts } : {};
    await say({
      text: '❌ Sorry, I encountered an error processing your request.',
      ...replyOptions
    });
  }
});

// Handle @mentions
app.event('app_mention', async ({ event, say }) => {
  console.log('👋 Mention received:', JSON.stringify(event, null, 2));

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

// Error handler
app.error(async (error) => {
  console.error('🚨 APP ERROR:', error);
});

// Health check
receiver.router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Winston AI Legal Assistant',
    ai: anthropic ? 'enabled' : 'disabled',
    version: 'final',
    ready: true
  });
});

const port = parseInt(process.env.PORT || '3000', 10);

(async () => {
  await app.start(port);
  console.log('\n⚡️ Winston AI Legal Assistant is READY!');
  console.log(`📡 Port: ${port}`);
  console.log(`🤖 AI: ${anthropic ? 'ENABLED ✅' : 'DISABLED ❌'}`);
  console.log('📬 Listening for:');
  console.log('   ✅ Direct messages (all messages, including threads)');
  console.log('   ✅ @mentions in channels');
  console.log('   ✅ /legal-help slash command');
  console.log('\n🎯 Bot will respond to EVERYTHING now!\n');
})();
