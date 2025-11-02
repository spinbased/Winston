/**
 * Slack Bot Application
 * Main Slack integration using Bolt framework
 */

import { App } from '@slack/bolt';
import { LegalAssistantService } from '../services/legal-assistant.service';

export class LegalSlackBot {
  private app: App;
  private legalAssistant: LegalAssistantService;

  constructor() {
    if (!process.env.SLACK_BOT_TOKEN || !process.env.SLACK_SIGNING_SECRET) {
      throw new Error('Slack credentials not configured');
    }

    this.app = new App({
      token: process.env.SLACK_BOT_TOKEN,
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      socketMode: process.env.SLACK_APP_TOKEN ? true : false,
      appToken: process.env.SLACK_APP_TOKEN,
    });

    this.legalAssistant = new LegalAssistantService();

    this.registerHandlers();
  }

  /**
   * Register all event and command handlers
   */
  private registerHandlers() {
    // Handle direct messages
    this.app.message(async ({ message, say }) => {
      if (message.subtype) return; // Ignore bot messages, etc.

      const text = (message as any).text;
      if (!text) return;

      try {
        await say({ text: '🤔 Analyzing your legal question...' });

        const response = await this.legalAssistant.ask({
          question: text,
        });

        await say({
          text: response.answer,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: response.answer,
              },
            },
            {
              type: 'context',
              elements: [
                {
                  type: 'mrkdwn',
                  text: `📚 *Citations:* ${response.citations.join(', ')}`,
                },
              ],
            },
          ],
        });
      } catch (error: any) {
        console.error('Error processing message:', error);
        await say(`❌ Error: ${error.message}`);
      }
    });

    // /legal-help command
    this.app.command('/legal-help', async ({ command, ack, say }) => {
      await ack();

      try {
        const response = await this.legalAssistant.ask({
          question: command.text || 'Provide general legal help',
        });

        await say({
          text: response.answer,
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: '⚖️ Legal Analysis',
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: response.answer,
              },
            },
            {
              type: 'context',
              elements: [
                {
                  type: 'mrkdwn',
                  text: `📚 Sources: ${response.citations.join(' • ')}`,
                },
              ],
            },
          ],
        });
      } catch (error: any) {
        await say(`❌ Error: ${error.message}`);
      }
    });

    // /constitutional command
    this.app.command('/constitutional', async ({ command, ack, say }) => {
      await ack();

      const query = command.text || 'US Constitution overview';

      try {
        const response = await this.legalAssistant.ask({
          question: `Provide the constitutional text and analysis for: ${query}`,
          context: {
            documentType: 'constitutional',
            legalContext: 'constitutional',
          },
        });

        await say({
          text: response.answer,
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: '🇺🇸 Constitutional Analysis',
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: response.answer,
              },
            },
          ],
        });
      } catch (error: any) {
        await say(`❌ Error: ${error.message}`);
      }
    });

    // /define command (Black's Law Dictionary)
    this.app.command('/define', async ({ command, ack, say }) => {
      await ack();

      const term = command.text;
      if (!term) {
        await say('Please provide a legal term to define. Usage: `/define [term]`');
        return;
      }

      try {
        const response = await this.legalAssistant.ask({
          question: `Define the legal term: ${term}`,
          context: {
            documentType: 'definition',
          },
        });

        await say({
          text: response.answer,
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: `📖 Definition: ${term}`,
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: response.answer,
              },
            },
          ],
        });
      } catch (error: any) {
        await say(`❌ Error: ${error.message}`);
      }
    });

    // /defend-rights command (Law enforcement defense)
    this.app.command('/defend-rights', async ({ command, ack, say }) => {
      await ack();

      const situation = command.text || 'general rights assertion';

      try {
        const response = await this.legalAssistant.ask({
          question: `Provide real-time legal defense guidance for this situation: ${situation}. Include exact scripts to say, legal basis, violations to watch for, and post-encounter steps.`,
        });

        await say({
          text: response.answer,
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: '🛡️ LEGAL DEFENSE PROTOCOL',
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: response.answer,
              },
            },
            {
              type: 'context',
              elements: [
                {
                  type: 'mrkdwn',
                  text: '⚠️ This is legal information, not legal advice. Consult an attorney for your specific situation.',
                },
              ],
            },
          ],
        });
      } catch (error: any) {
        await say(`❌ Error: ${error.message}`);
      }
    });

    // /sovereign-rights command
    this.app.command('/sovereign-rights', async ({ ack, say }) => {
      await ack();

      try {
        const response = await this.legalAssistant.ask({
          question: 'Explain sovereign citizenship legal framework, natural rights, and jurisdictional principles for American citizens.',
          context: {
            legalContext: 'sovereign',
          },
        });

        await say({
          text: response.answer,
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: '🛡️ Sovereign Rights Framework',
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: response.answer,
              },
            },
            {
              type: 'context',
              elements: [
                {
                  type: 'mrkdwn',
                  text: '⚠️ Note: Many sovereign citizenship arguments have low success rates in court. This is educational information.',
                },
              ],
            },
          ],
        });
      } catch (error: any) {
        await say(`❌ Error: ${error.message}`);
      }
    });
  }

  /**
   * Start the bot
   */
  async start(port: number = 3000) {
    await this.app.start(port);
    console.log(`⚖️ Legal Slack Bot is running on port ${port}!`);
  }

  /**
   * Stop the bot
   */
  async stop() {
    await this.app.stop();
    await this.legalAssistant.close();
    console.log('Bot stopped');
  }
}
