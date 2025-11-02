/**
 * Working AI Legal Assistant - Simplified for Railway
 */

import { App, ExpressReceiver } from '@slack/bolt';
import Anthropic from '@anthropic-ai/sdk';

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET || 'placeholder',
  processBeforeResponse: true,
  endpoints: '/slack/events',
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN || 'xoxb-placeholder',
  receiver,
});

// Initialize Anthropic if key is available
const anthropic = process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.includes('placeholder')
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// n8n Configuration
const N8N_API_URL = process.env.N8N_API_URL || 'https://n8n.level7labs.ai';
const N8N_API_KEY = process.env.N8N_API_KEY;

// Helper function to trigger n8n workflows
async function triggerN8nWorkflow(workflowName: string, data: any): Promise<any> {
  if (!N8N_API_KEY) {
    console.log('N8N_API_KEY not configured');
    return null;
  }

  try {
    // Get workflow ID by name
    const workflowsResponse = await fetch(`${N8N_API_URL}/api/v1/workflows`, {
      headers: { 'X-N8N-API-KEY': N8N_API_KEY }
    });

    if (!workflowsResponse.ok) {
      console.error('Failed to fetch workflows:', workflowsResponse.statusText);
      return null;
    }

    const workflows: any = await workflowsResponse.json();
    const workflow = workflows.data?.find((w: any) => w.name === workflowName);

    if (!workflow) {
      console.log(`Workflow "${workflowName}" not found`);
      return null;
    }

    console.log(`Triggering n8n workflow: ${workflowName} (ID: ${workflow.id})`);

    // Execute workflow
    const response = await fetch(
      `${N8N_API_URL}/api/v1/workflows/${workflow.id}/execute`,
      {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data })
      }
    );

    if (!response.ok) {
      console.error('Failed to execute workflow:', response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('n8n workflow error:', error);
    return null;
  }
}

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

    // Try n8n workflow first if configured
    if (N8N_API_KEY) {
      console.log('Attempting n8n workflow...');

      await say('🤔 Processing with Winston workflow...');

      const n8nResult = await triggerN8nWorkflow('Winston', {
        text,
        user: 'user' in message ? message.user : 'unknown',
        channel: 'channel' in message ? message.channel : 'unknown',
        timestamp: Date.now()
      });

      if (n8nResult) {
        console.log('n8n workflow executed successfully');
        // n8n workflow will handle the response
        return;
      }

      console.log('n8n workflow failed, falling back to direct AI');
    }

    // Fallback to direct Anthropic API
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
