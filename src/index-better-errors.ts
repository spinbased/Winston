/**
 * Version with better error handling and messages
 */

import { App, ExpressReceiver } from '@slack/bolt';
import Anthropic from '@anthropic-ai/sdk';

console.log('🚀 Starting Winston with better error handling...');
console.log('Environment check:');
console.log(`- ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? 'SET (length: ' + process.env.ANTHROPIC_API_KEY.length + ')' : 'NOT SET'}`);

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET || 'placeholder',
  processBeforeResponse: true,
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN || 'xoxb-placeholder',
  receiver,
});

const anthropic = process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.includes('placeholder')
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const LEGAL_SYSTEM_PROMPT = `You are Winston, a master AI legal assistant with comprehensive expertise in:
- Black's Law Dictionary (all editions)
- U.S. Constitution and all amendments
- Constitutional law and common law

Your personality:
- Sharp, intelligent, and to the point
- Cool, calm, and collected
- Professional yet accessible

Provide thorough legal explanations with proper citations when possible.`;

// Handle messages
app.message(async ({ message, say }) => {
  if (message.subtype === 'bot_message') return;

  const text = 'text' in message ? message.text : '';
  if (!text) return;

  console.log(`📩 Message: "${text}"`);

  if (!anthropic) {
    await say('⚠️ AI not configured. ANTHROPIC_API_KEY is missing in Railway environment variables.');
    return;
  }

  const threadTs = (message as any).thread_ts;
  const replyOptions = threadTs ? { thread_ts: threadTs } : {};

  try {
    await say({
      text: '🤔 Analyzing your question...',
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

    await say({
      text: `⚖️ ${answer}`,
      ...replyOptions
    });

    console.log('✅ Response sent');
  } catch (error: any) {
    console.error('❌ ERROR:', error);

    let errorMsg = '❌ Error processing your request.\n\n';

    if (error.status === 401) {
      errorMsg += '**Authentication failed** - ANTHROPIC_API_KEY is invalid.\n\nPlease check the API key in Railway environment variables.';
    } else if (error.status === 429) {
      errorMsg += '**Rate limit exceeded** - Too many requests or out of credits.\n\nCheck your Anthropic account: https://console.anthropic.com/';
    } else if (error.status === 400) {
      errorMsg += '**Bad request** - ' + (error.message || 'Invalid API request');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      errorMsg += '**Network error** - Cannot reach Anthropic API.\n\nCheck Railway network settings.';
    } else {
      errorMsg += '**Unknown error:**\n```\n' + error.message + '\n```';
    }

    await say({
      text: errorMsg,
      ...replyOptions
    });
  }
});

// Slash command
app.command('/legal-help', async ({ ack, respond, command }) => {
  await ack();

  const question = command.text.trim();

  if (!question) {
    await respond('Please provide a legal question. Example: `/legal-help What is due process?`');
    return;
  }

  if (!anthropic) {
    await respond('⚠️ AI not configured. ANTHROPIC_API_KEY is missing.');
    return;
  }

  try {
    await respond('🤔 Analyzing...');

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2048,
      temperature: 0.3,
      system: LEGAL_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: question }],
    });

    const answer = message.content[0].type === 'text' ? message.content[0].text : 'Unable to process';

    await respond({
      text: `⚖️ *Legal Analysis*\n\n${answer}\n\n_Powered by Winston AI_`,
      response_type: 'in_channel',
    });
  } catch (error: any) {
    console.error('❌ Slash command error:', error);

    let errorMsg = '❌ Error: ';
    if (error.status === 401) errorMsg += 'Invalid API key';
    else if (error.status === 429) errorMsg += 'Rate limit exceeded';
    else errorMsg += error.message;

    await respond(errorMsg);
  }
});

// @mentions
app.event('app_mention', async ({ event, say }) => {
  const text = event.text.replace(/<@[A-Z0-9]+>/g, '').trim();

  if (!text) {
    await say({ text: '👋 Hello! Ask me any legal question.', thread_ts: event.ts });
    return;
  }

  if (!anthropic) {
    await say({ text: '⚠️ AI not configured', thread_ts: event.ts });
    return;
  }

  try {
    await say({ text: '🤔 Analyzing...', thread_ts: event.ts });

    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2048,
      temperature: 0.3,
      system: LEGAL_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: text }],
    });

    const answer = response.content[0].type === 'text' ? response.content[0].text : 'Unable to process';

    await say({ text: `⚖️ ${answer}`, thread_ts: event.ts });
  } catch (error: any) {
    console.error('❌ Mention error:', error);
    await say({ text: `❌ Error: ${error.message}`, thread_ts: event.ts });
  }
});

app.error(async (error) => {
  console.error('🚨 APP ERROR:', error);
});

receiver.router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Winston with Better Errors',
    ai: anthropic ? 'enabled' : 'disabled',
    version: 'better-errors',
    anthropic_key_length: process.env.ANTHROPIC_API_KEY?.length || 0
  });
});

const port = parseInt(process.env.PORT || '3000', 10);

(async () => {
  await app.start(port);
  console.log('\n✅ Winston is running with improved error handling');
  console.log(`Port: ${port}`);
  console.log(`AI: ${anthropic ? 'ENABLED' : 'DISABLED'}`);
})();
