/**
 * General Legal Slash Commands
 * General legal assistance for common legal needs
 */

import { App } from '@slack/bolt';
import { LegalAssistantService } from '../../services/legal-assistant.service';
import { SessionManager } from '../../services/session.service';
import { ResponseCache } from '../../services/response-cache.service';
import { EmbeddingService } from '../../services/embedding.service';

export function registerGeneralLegalCommands(
  app: App,
  legalAssistant: LegalAssistantService,
  sessionManager: SessionManager,
  responseCache: ResponseCache,
  embeddingService: EmbeddingService
) {
  // /contract-review - Contract analysis
  app.command('/contract-review', async ({ command, ack, say }) => {
    await ack();

    const contract_info = command.text || 'general contract';
    const query = `Review and analyze this contract: ${contract_info}. Provide: 1) Key terms and obligations, 2) Red flags and unfavorable clauses, 3) Missing provisions, 4) Ambiguous language that could cause disputes, 5) Negotiation points, 6) Termination and renewal terms, 7) Liability and indemnification issues, 8) Governing law and jurisdiction.`;

    try {
      const { sessionId, history } = await getSessionData(command.user_id, sessionManager);
      const cachedResponse = await checkCache(query, responseCache, embeddingService);

      if (cachedResponse) {
        await sendResponse(say, cachedResponse, '📄 CONTRACT ANALYSIS');
        return;
      }

      const response = await legalAssistant.ask({
        question: query,
        conversationHistory: history,
      });

      await updateSession(sessionId, sessionManager, query, response.answer);
      await cacheResponse(query, response, responseCache, embeddingService);
      await sendResponse(say, response, '📄 CONTRACT ANALYSIS');
    } catch (error: any) {
      await say(`❌ Error: ${error.message}`);
    }
  });

  // /legal-research - Case law research
  app.command('/legal-research', async ({ command, ack, say }) => {
    await ack();

    const research_topic = command.text;
    if (!research_topic) {
      await say('Please provide a legal topic to research. Usage: `/legal-research [topic or case name]`');
      return;
    }

    const query = `Conduct legal research on: ${research_topic}. Provide: 1) Relevant constitutional provisions, 2) Key Supreme Court precedents, 3) Circuit court splits if any, 4) Statutory law (federal and state), 5) Legal standards and tests used, 6) Recent developments and trends, 7) Practical application, 8) Citations in Bluebook format.`;

    try {
      const { sessionId, history } = await getSessionData(command.user_id, sessionManager);
      const cachedResponse = await checkCache(query, responseCache, embeddingService);

      if (cachedResponse) {
        await sendResponse(say, cachedResponse, '📚 LEGAL RESEARCH');
        return;
      }

      const response = await legalAssistant.ask({
        question: query,
        conversationHistory: history,
      });

      await updateSession(sessionId, sessionManager, query, response.answer);
      await cacheResponse(query, response, responseCache, embeddingService, 7 * 24 * 60 * 60); // 7 days
      await sendResponse(say, response, '📚 LEGAL RESEARCH');
    } catch (error: any) {
      await say(`❌ Error: ${error.message}`);
    }
  });

  // /file-lawsuit - Civil lawsuit guidance
  app.command('/file-lawsuit', async ({ command, ack, say }) => {
    await ack();

    const case_details = command.text || 'need to file lawsuit';
    const query = `Filing civil lawsuit for: ${case_details}. Explain: 1) Causes of action available, 2) Jurisdiction (federal vs state court), 3) Venue requirements, 4) Statute of limitations, 5) Standing to sue, 6) Complaint drafting essentials, 7) Filing fees and service of process, 8) Pre-filing demand letters, 9) Preliminary injunctions, 10) Pro se vs attorney representation.`;

    try {
      const { sessionId, history } = await getSessionData(command.user_id, sessionManager);
      const cachedResponse = await checkCache(query, responseCache, embeddingService);

      if (cachedResponse) {
        await sendResponse(say, cachedResponse, '⚖️ FILING CIVIL LAWSUIT');
        return;
      }

      const response = await legalAssistant.ask({
        question: query,
        conversationHistory: history,
      });

      await updateSession(sessionId, sessionManager, query, response.answer);
      await cacheResponse(query, response, responseCache, embeddingService);
      await sendResponse(say, response, '⚖️ FILING CIVIL LAWSUIT');
    } catch (error: any) {
      await say(`❌ Error: ${error.message}`);
    }
  });

  // /appeal-case - Appellate procedure
  app.command('/appeal-case', async ({ command, ack, say }) => {
    await ack();

    const appeal_info = command.text || 'need to appeal decision';
    const query = `Appellate procedure for: ${appeal_info}. Cover: 1) Notice of appeal deadlines (critical!), 2) Appellate jurisdiction and reviewability, 3) Standard of review (de novo, clear error, abuse of discretion), 4) Record on appeal, 5) Brief writing (statement of facts, issues, argument), 6) Oral argument, 7) Harmless error vs reversible error, 8) Mootness and standing on appeal, 9) Appeals vs writs (mandamus, certiorari).`;

    try {
      const { sessionId, history } = await getSessionData(command.user_id, sessionManager);
      const cachedResponse = await checkCache(query, responseCache, embeddingService);

      if (cachedResponse) {
        await sendResponse(say, cachedResponse, '📑 APPELLATE PROCEDURE');
        return;
      }

      const response = await legalAssistant.ask({
        question: query,
        conversationHistory: history,
      });

      await updateSession(sessionId, sessionManager, query, response.answer);
      await cacheResponse(query, response, responseCache, embeddingService);
      await sendResponse(say, response, '📑 APPELLATE PROCEDURE');
    } catch (error: any) {
      await say(`❌ Error: ${error.message}`);
    }
  });

  // /pro-se - Self-representation guide
  app.command('/pro-se', async ({ command, ack, say }) => {
    await ack();

    const case_type = command.text || 'general pro se representation';
    const query = `Pro se self-representation for: ${case_type}. Provide comprehensive guide: 1) Pros and cons of pro se representation, 2) "A person who represents himself has a fool for a client" (when this applies), 3) Court rules and procedures (Federal Rules of Civil Procedure, local rules), 4) Legal research resources (free and paid), 5) Document filing requirements, 6) Service of process, 7) Discovery obligations, 8) Motion practice, 9) Trial preparation, 10) Common pro se mistakes to avoid, 11) When to get attorney consult even if pro se.`;

    try {
      const { sessionId, history } = await getSessionData(command.user_id, sessionManager);
      const cachedResponse = await checkCache(query, responseCache, embeddingService);

      if (cachedResponse) {
        await sendResponse(say, cachedResponse, '👤 PRO SE SELF-REPRESENTATION');
        return;
      }

      const response = await legalAssistant.ask({
        question: query,
        conversationHistory: history,
      });

      await updateSession(sessionId, sessionManager, query, response.answer);
      await cacheResponse(query, response, responseCache, embeddingService, 7 * 24 * 60 * 60);
      await sendResponse(say, response, '👤 PRO SE SELF-REPRESENTATION');
    } catch (error: any) {
      await say(`❌ Error: ${error.message}`);
    }
  });
}

// Helper functions (same as other command modules)
async function getSessionData(userId: string, sessionManager: SessionManager) {
  let sessionId = await sessionManager.getUserSession(userId);
  if (!sessionId) {
    sessionId = await sessionManager.createSession(userId);
  }
  const history = await sessionManager.getHistory(sessionId);
  return { sessionId, history };
}

async function checkCache(
  query: string,
  responseCache: ResponseCache,
  embeddingService: EmbeddingService
) {
  const embedding = await embeddingService.embed(query);
  return await responseCache.get(embedding, query);
}

async function cacheResponse(
  query: string,
  response: any,
  responseCache: ResponseCache,
  embeddingService: EmbeddingService,
  ttl?: number
) {
  const embedding = await embeddingService.embed(query);
  await responseCache.set(embedding, query, response, ttl);
}

async function updateSession(
  sessionId: string,
  sessionManager: SessionManager,
  question: string,
  answer: string
) {
  await sessionManager.addMessage(sessionId, { role: 'user', content: question });
  await sessionManager.addMessage(sessionId, { role: 'assistant', content: answer });
}

async function sendResponse(say: any, response: any, header: string) {
  await say({
    text: response.answer,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: header,
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
}
