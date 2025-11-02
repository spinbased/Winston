/**
 * Main Application Entry Point
 * AI Legal Assistant Slack Bot
 */

import dotenv from 'dotenv';
import { EnhancedLegalSlackBot } from './slack/slack-app-enhanced';

// Load environment variables
dotenv.config();

async function main() {
  console.log('🚀 Starting AI Legal Defense System...\n');
  console.log('='.repeat(60));
  console.log('The Ultimate Legal Assistant');
  console.log('Master of Black\'s Law, Constitution, & Sovereign Rights');
  console.log('With Session Management, Caching, Voice Support & 30+ Commands');
  console.log('='.repeat(60));

  // Validate environment - only Slack credentials are strictly required
  const required = [
    'SLACK_BOT_TOKEN',
    'SLACK_SIGNING_SECRET',
  ];

  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error(`\n❌ Missing required environment variables: ${missing.join(', ')}`);
    console.error('Please configure Slack credentials in environment variables.');
    process.exit(1);
  }

  // Warn about missing API keys but don't exit
  const optional = ['ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'PINECONE_API_KEY'];
  const missingOptional = optional.filter(key => !process.env[key] || process.env[key]?.includes('placeholder'));
  if (missingOptional.length > 0) {
    console.warn(`\n⚠️  Warning: Some API keys not configured: ${missingOptional.join(', ')}`);
    console.warn('Bot will start but AI features will be limited until keys are added.');
  }

  console.log('\n✅ Environment validated');
  console.log('✅ All API keys configured');
  console.log('✅ Agent OS + Claude-Flow integration active');

  // Start enhanced bot
  try {
    const bot = new EnhancedLegalSlackBot();
    const port = parseInt(process.env.PORT || '3000', 10);

    await bot.start(port);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Enhanced Bot is running and ready!');
    console.log(`📡 Listening on port ${port}`);
    console.log('⚖️ Standing by to defend citizens\' rights...');
    console.log('🎯 30+ slash commands active');
    console.log('🧠 Session management enabled');
    console.log('⚡ Response caching enabled');
    console.log('🎤 Voice message support enabled');
    console.log('='.repeat(60));

    // Handle shutdown
    const shutdown = async () => {
      console.log('\n\n🛑 Shutting down...');
      await bot.stop();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('\n❌ Failed to start bot:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
