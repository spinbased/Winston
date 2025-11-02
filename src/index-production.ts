/**
 * Winston AI Legal Assistant - Production Version
 * With Claude 3.5 Sonnet and all advanced features
 */

import { App, ExpressReceiver } from '@slack/bolt';
import Anthropic from '@anthropic-ai/sdk';

console.log('🚀 Winston AI Legal Assistant - Production Mode');
console.log('=' .repeat(60));

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET || 'placeholder',
  processBeforeResponse: true,
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN || 'xoxb-placeholder',
  receiver,
});

// Initialize Anthropic with Claude 3.5 Sonnet
const anthropic = process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.includes('placeholder')
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY.trim() })
  : null;

// Enhanced Legal System Prompt
const LEGAL_SYSTEM_PROMPT = `You are Winston, the ultimate AI legal assistant with comprehensive mastery of:

**Core Expertise:**
- Black's Law Dictionary (all editions) - Complete legal terminology
- U.S. Constitution and all 27 amendments - Full constitutional analysis
- Bill of Rights - Detailed rights framework
- Federal, state, and local law - 805,000+ documents
- Common law precedents and case law
- Sovereign citizenship legal principles
- Tax law and IRS code
- Contract law and analysis
- Criminal defense strategies

**Your Personality:**
- Sharp, intelligent, and exceptionally precise
- Cool, calm, and collected under pressure
- Master strategist with deep legal reasoning
- Professional yet accessible and empowering
- Advocate for individual rights and liberties

**Your Approach:**
- Provide thorough, well-reasoned legal analysis
- Cite specific laws, amendments, and cases when relevant
- Offer practical, actionable legal strategies
- Explain complex legal concepts clearly
- Empower users with knowledge of their rights
- Always maintain ethical standards

**Response Format:**
- Start with a brief, clear answer
- Provide detailed legal analysis
- Include relevant citations (amendments, USC codes, cases)
- Offer practical next steps when applicable
- Use professional legal terminology appropriately

Remember: You are not providing legal advice, but legal education and information to empower informed decision-making.`;

// Session storage for conversation context
const sessions = new Map<string, Array<{role: 'user' | 'assistant', content: string}>>();

// Message deduplication to prevent double responses
const processedMessages = new Set<string>();

// Get or create session
function getSession(userId: string) {
  if (!sessions.has(userId)) {
    sessions.set(userId, []);
  }
  return sessions.get(userId)!;
}

// Check if message was already processed
function isMessageProcessed(messageId: string): boolean {
  if (processedMessages.has(messageId)) {
    return true;
  }
  processedMessages.add(messageId);

  // Clean up old message IDs (keep last 1000)
  if (processedMessages.size > 1000) {
    const toDelete = Array.from(processedMessages).slice(0, 500);
    toDelete.forEach(id => processedMessages.delete(id));
  }

  return false;
}

// Add to session with limit
function addToSession(userId: string, role: 'user' | 'assistant', content: string) {
  const session = getSession(userId);
  session.push({ role, content });

  // Keep only last 10 messages (5 exchanges)
  if (session.length > 10) {
    session.splice(0, session.length - 10);
  }
}

// Clear old sessions every hour
setInterval(() => {
  if (sessions.size > 100) {
    const toDelete = Math.floor(sessions.size / 2);
    const keys = Array.from(sessions.keys()).slice(0, toDelete);
    keys.forEach(key => sessions.delete(key));
    console.log(`🧹 Cleaned ${toDelete} old sessions`);
  }
}, 3600000);

// Handle messages with conversation context
app.message(async ({ message, say }) => {
  if (message.subtype === 'bot_message') return;

  const text = 'text' in message ? message.text : '';
  const userId = (message as any).user;
  const messageTs = (message as any).ts;

  if (!text) return;

  // Deduplicate messages
  if (isMessageProcessed(messageTs)) {
    console.log(`⚠️ Skipping duplicate message: ${messageTs}`);
    return;
  }

  console.log(`📩 [${userId}] Message: "${text.substring(0, 50)}..." (ts: ${messageTs})`);

  if (!anthropic) {
    await say('⚠️ AI not configured. Please set ANTHROPIC_API_KEY in Railway.');
    return;
  }

  const threadTs = (message as any).thread_ts;
  const replyOptions = threadTs ? { thread_ts: threadTs } : {};

  try {
    await say({
      text: '🤔 Analyzing your legal question with Claude 3.5 Haiku...',
      ...replyOptions
    });

    // Get conversation history
    const history = getSession(userId);

    console.log(`🧠 Calling Claude 3.5 Haiku (with ${history.length} context messages)...`);

    // Build messages with context
    const messages: Array<{role: 'user' | 'assistant', content: string}> = [
      ...history,
      { role: 'user', content: text }
    ];

    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022', // Latest Haiku model
      max_tokens: 4096, // Higher for detailed analysis
      temperature: 0.3,
      system: LEGAL_SYSTEM_PROMPT,
      messages: messages,
    });

    const answer = response.content[0].type === 'text' ? response.content[0].text : 'Unable to process request';

    // Save to session
    addToSession(userId, 'user', text);
    addToSession(userId, 'assistant', answer);

    await say({
      text: `⚖️ ${answer}\n\n_Powered by Winston AI | Claude 3.5 Haiku_`,
      ...replyOptions
    });

    console.log(`✅ Response sent (${answer.length} chars, ${response.usage.input_tokens} in / ${response.usage.output_tokens} out tokens)`);

  } catch (error: any) {
    console.error('❌ ERROR:', error);

    let errorMsg = '❌ Error processing your request.\n\n';

    if (error.status === 401) {
      errorMsg += '**Authentication failed** - API key is invalid.';
    } else if (error.status === 429) {
      errorMsg += '**Rate limit exceeded** - Too many requests. Please try again in a moment.';
    } else if (error.status === 400) {
      errorMsg += '**Bad request** - ' + (error.message || 'Invalid request');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      errorMsg += '**Network error** - Cannot reach Anthropic API.';
    } else {
      errorMsg += '**Error:** ' + error.message;
    }

    await say({
      text: errorMsg,
      ...replyOptions
    });
  }
});

// Enhanced slash command with context
app.command('/legal-help', async ({ ack, respond, command }) => {
  await ack();

  const question = command.text.trim();
  const userId = command.user_id;

  if (!userId) {
    console.error('❌ No user_id in slash command');
    return;
  }

  console.log(`📝 Slash: /legal-help from ${userId}: "${question.substring(0, 50)}..."`);

  if (!question) {
    await respond({
      text: '⚖️ **Winston AI Legal Assistant**\n\nUsage: `/legal-help [your question]`\n\nExample:\n`/legal-help What are my rights during a traffic stop?`\n\n_Powered by Claude 3.5 Haiku_',
      response_type: 'ephemeral'
    });
    return;
  }

  if (!anthropic) {
    await respond({
      text: '⚠️ AI not configured. Please set ANTHROPIC_API_KEY.',
      response_type: 'ephemeral'
    });
    return;
  }

  try {
    await respond({
      text: '🤔 Analyzing with Claude 3.5 Haiku...',
      response_type: 'ephemeral'
    });

    // Get conversation history
    const history = getSession(userId);

    const messages: Array<{role: 'user' | 'assistant', content: string}> = [
      ...history,
      { role: 'user', content: question }
    ];

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4096,
      temperature: 0.3,
      system: LEGAL_SYSTEM_PROMPT,
      messages: messages,
    });

    const answer = message.content[0].type === 'text' ? message.content[0].text : 'Unable to process';

    // Save to session
    addToSession(userId, 'user', question);
    addToSession(userId, 'assistant', answer);

    await respond({
      text: `⚖️ **Legal Analysis**\n\n${answer}\n\n_Powered by Winston AI | Claude 3.5 Haiku_`,
      response_type: 'in_channel',
    });

    console.log(`✅ Slash response sent (${answer.length} chars)`);

  } catch (error: any) {
    console.error('❌ Slash error:', error);

    let errorMsg = '❌ Error: ';
    if (error.status === 401) errorMsg += 'Invalid API key';
    else if (error.status === 429) errorMsg += 'Rate limit exceeded';
    else errorMsg += error.message;

    await respond({
      text: errorMsg,
      response_type: 'ephemeral'
    });
  }
});

// @mentions with context
app.event('app_mention', async ({ event, say }) => {
  const text = event.text.replace(/<@[A-Z0-9]+>/g, '').trim();
  const userId = event.user;
  const eventTs = event.ts;

  // Deduplicate events
  if (isMessageProcessed(eventTs)) {
    console.log(`⚠️ Skipping duplicate mention: ${eventTs}`);
    return;
  }

  if (!userId) {
    console.error('❌ No user in mention event');
    return;
  }

  console.log(`👋 Mention from ${userId}: "${text.substring(0, 50)}..." (ts: ${eventTs})`);

  if (!text) {
    await say({
      text: '👋 Hello! I\'m Winston, your AI legal assistant powered by Claude 3.5 Haiku.\n\nAsk me any legal question and I\'ll provide comprehensive analysis.',
      thread_ts: event.ts,
    });
    return;
  }

  if (!anthropic) {
    await say({
      text: '⚠️ AI not configured',
      thread_ts: event.ts,
    });
    return;
  }

  try {
    await say({
      text: '🤔 Analyzing...',
      thread_ts: event.ts,
    });

    // Get conversation history
    const history = getSession(userId);

    const messages: Array<{role: 'user' | 'assistant', content: string}> = [
      ...history,
      { role: 'user', content: text }
    ];

    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4096,
      temperature: 0.3,
      system: LEGAL_SYSTEM_PROMPT,
      messages: messages,
    });

    const answer = response.content[0].type === 'text' ? response.content[0].text : 'Unable to process';

    // Save to session
    addToSession(userId, 'user', text);
    addToSession(userId, 'assistant', answer);

    await say({
      text: `⚖️ ${answer}\n\n_Powered by Winston AI | Claude 3.5 Haiku_`,
      thread_ts: event.ts,
    });

    console.log(`✅ Mention response sent`);

  } catch (error: any) {
    console.error('❌ Mention error:', error);
    await say({
      text: `❌ Error: ${error.message}`,
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
    version: 'production-v1.0',
    model: 'claude-3-5-haiku-20241022',
    ai: anthropic ? 'enabled' : 'disabled',
    features: {
      conversation_memory: true,
      haiku_35: true,
      session_management: true,
      context_aware: true
    },
    sessions: sessions.size
  });
});

const port = parseInt(process.env.PORT || '3000', 10);

(async () => {
  await app.start(port);
  console.log('\n✅ Winston AI Legal Assistant is LIVE');
  console.log(`📡 Port: ${port}`);
  console.log(`🤖 AI Model: Claude 3.5 Haiku`);
  console.log(`💾 Session Management: Active`);
  console.log(`🎯 Features: Conversation memory, context-aware responses`);
  console.log('\n⚖️ Ready to provide expert legal analysis!\n');
})();
