/**
 * Tax Law Slash Commands
 * Master tax lawyer capabilities with aggressive legal strategies
 */

import { App } from '@slack/bolt';
import { LegalAssistantService } from '../../services/legal-assistant.service';
import { SessionManager } from '../../services/session.service';
import { ResponseCache } from '../../services/response-cache.service';
import { EmbeddingService } from '../../services/embedding.service';

export function registerTaxLawCommands(
  app: App,
  legalAssistant: LegalAssistantService,
  sessionManager: SessionManager,
  responseCache: ResponseCache,
  embeddingService: EmbeddingService
) {
  // /tax-strategy - Aggressive tax minimization
  app.command('/tax-strategy', async ({ command, ack, say }) => {
    await ack();

    const situation = command.text || 'general tax optimization';
    const query = `Provide aggressive but legal tax minimization strategies for: ${situation}. Include: 1) Specific IRC sections to leverage, 2) Tax credits and deductions, 3) Entity structure optimization, 4) Timing strategies, 5) Grey areas and risk levels, 6) Documentation requirements, 7) Audit red flags to avoid.`;

    try {
      const { sessionId, history } = await getSessionData(command.user_id, sessionManager);
      const cachedResponse = await checkCache(query, responseCache, embeddingService);

      if (cachedResponse) {
        await sendResponse(say, cachedResponse, '💰 TAX MINIMIZATION STRATEGY', true);
        return;
      }

      const response = await legalAssistant.ask({
        question: query,
        context: { legalContext: 'tax-law' },
        conversationHistory: history,
      });

      await updateSession(sessionId, sessionManager, query, response.answer);
      await cacheResponse(query, response, responseCache, embeddingService);
      await sendResponse(say, response, '💰 TAX MINIMIZATION STRATEGY', true);
    } catch (error: any) {
      await say(`❌ Error: ${error.message}`);
    }
  });

  // /irs-audit - IRS audit defense
  app.command('/irs-audit', async ({ command, ack, say }) => {
    await ack();

    const details = command.text || 'received IRS audit notice';
    const query = `IRS audit situation: ${details}. Provide complete audit defense: 1) Types of audits (correspondence, office, field), 2) Your rights during audit (Taxpayer Bill of Rights), 3) What to provide vs withhold, 4) Representation options, 5) Appeal process if auditor disagrees, 6) Statute of limitations, 7) How to minimize assessment.`;

    try {
      const { sessionId, history } = await getSessionData(command.user_id, sessionManager);
      const cachedResponse = await checkCache(query, responseCache, embeddingService);

      if (cachedResponse) {
        await sendResponse(say, cachedResponse, '🔍 IRS AUDIT DEFENSE');
        return;
      }

      const response = await legalAssistant.ask({
        question: query,
        context: { legalContext: 'tax-law' },
        conversationHistory: history,
      });

      await updateSession(sessionId, sessionManager, query, response.answer);
      await cacheResponse(query, response, responseCache, embeddingService);
      await sendResponse(say, response, '🔍 IRS AUDIT DEFENSE');
    } catch (error: any) {
      await say(`❌ Error: ${error.message}`);
    }
  });

  // /tax-deductions - Maximize deductions
  app.command('/tax-deductions', async ({ command, ack, say }) => {
    await ack();

    const context_info = command.text || 'general deductions';
    const query = `Maximize tax deductions for: ${context_info}. Provide: 1) All available deductions by category, 2) Standard vs itemized analysis, 3) Business deductions (home office, vehicle, equipment), 4) Above-the-line deductions, 5) Documentation requirements, 6) Grey area deductions with risk analysis, 7) Timing strategies for maximum benefit.`;

    try {
      const { sessionId, history } = await getSessionData(command.user_id, sessionManager);
      const cachedResponse = await checkCache(query, responseCache, embeddingService);

      if (cachedResponse) {
        await sendResponse(say, cachedResponse, '📝 TAX DEDUCTION MAXIMIZATION');
        return;
      }

      const response = await legalAssistant.ask({
        question: query,
        context: { legalContext: 'tax-law' },
        conversationHistory: history,
      });

      await updateSession(sessionId, sessionManager, query, response.answer);
      await cacheResponse(query, response, responseCache, embeddingService);
      await sendResponse(say, response, '📝 TAX DEDUCTION MAXIMIZATION');
    } catch (error: any) {
      await say(`❌ Error: ${error.message}`);
    }
  });

  // /tax-credits - All available credits
  app.command('/tax-credits', async ({ command, ack, say }) => {
    await ack();

    const situation = command.text || 'all available tax credits';
    const query = `Identify all tax credits for: ${situation}. Cover: 1) Refundable vs non-refundable credits, 2) Business credits (R&D, work opportunity, energy), 3) Personal credits (EITC, child, education, retirement), 4) State credits, 5) Carryforward/carryback rules, 6) Phase-out thresholds, 7) How to claim each credit.`;

    try {
      const { sessionId, history } = await getSessionData(command.user_id, sessionManager);
      const cachedResponse = await checkCache(query, responseCache, embeddingService);

      if (cachedResponse) {
        await sendResponse(say, cachedResponse, '💳 TAX CREDITS ANALYSIS');
        return;
      }

      const response = await legalAssistant.ask({
        question: query,
        context: { legalContext: 'tax-law' },
        conversationHistory: history,
      });

      await updateSession(sessionId, sessionManager, query, response.answer);
      await cacheResponse(query, response, responseCache, embeddingService);
      await sendResponse(say, response, '💳 TAX CREDITS ANALYSIS');
    } catch (error: any) {
      await say(`❌ Error: ${error.message}`);
    }
  });

  // /offshore-tax - International tax strategies
  app.command('/offshore-tax', async ({ command, ack, say }) => {
    await ack();

    const details = command.text || 'international tax planning';
    const query = `International tax strategies for: ${details}. Provide: 1) Foreign Earned Income Exclusion, 2) Foreign Tax Credit, 3) FBAR and FATCA reporting requirements, 4) Tax treaties, 5) Controlled Foreign Corporation rules, 6) Transfer pricing, 7) LEGAL offshore structures (with prominent warnings about illegal tax evasion).`;

    try {
      const { sessionId, history } = await getSessionData(command.user_id, sessionManager);
      const cachedResponse = await checkCache(query, responseCache, embeddingService);

      if (cachedResponse) {
        await sendResponse(say, cachedResponse, '🌍 INTERNATIONAL TAX PLANNING', true);
        return;
      }

      const response = await legalAssistant.ask({
        question: query,
        context: { legalContext: 'tax-law' },
        conversationHistory: history,
      });

      await updateSession(sessionId, sessionManager, query, response.answer);
      await cacheResponse(query, response, responseCache, embeddingService);
      await sendResponse(say, response, '🌍 INTERNATIONAL TAX PLANNING', true);
    } catch (error: any) {
      await say(`❌ Error: ${error.message}`);
    }
  });

  // /tax-court - Tax Court litigation
  app.command('/tax-court', async ({ command, ack, say }) => {
    await ack();

    const issue = command.text || 'tax dispute with IRS';
    const query = `Tax Court litigation for: ${issue}. Explain: 1) When to petition Tax Court, 2) Small case vs regular procedure, 3) Filing deadlines (90 days from notice), 4) Burden of proof, 5) Discovery process, 6) Settlement options, 7) Appeals from Tax Court, 8) Pro se representation vs attorney.`;

    try {
      const { sessionId, history } = await getSessionData(command.user_id, sessionManager);
      const cachedResponse = await checkCache(query, responseCache, embeddingService);

      if (cachedResponse) {
        await sendResponse(say, cachedResponse, '⚖️ TAX COURT LITIGATION');
        return;
      }

      const response = await legalAssistant.ask({
        question: query,
        context: { legalContext: 'tax-law' },
        conversationHistory: history,
      });

      await updateSession(sessionId, sessionManager, query, response.answer);
      await cacheResponse(query, response, responseCache, embeddingService);
      await sendResponse(say, response, '⚖️ TAX COURT LITIGATION');
    } catch (error: any) {
      await say(`❌ Error: ${error.message}`);
    }
  });

  // /innocent-spouse - Innocent spouse relief
  app.command('/innocent-spouse', async ({ command, ack, say }) => {
    await ack();

    const details = command.text || 'need innocent spouse relief';
    const query = `Innocent spouse relief for: ${details}. Explain: 1) Three types of relief (innocent spouse, separation of liability, equitable), 2) Eligibility requirements for each, 3) Two-year filing deadline, 4) Burden of proof, 5) Form 8857 instructions, 6) Appeal rights, 7) Community property considerations.`;

    try {
      const { sessionId, history } = await getSessionData(command.user_id, sessionManager);
      const cachedResponse = await checkCache(query, responseCache, embeddingService);

      if (cachedResponse) {
        await sendResponse(say, cachedResponse, '💍 INNOCENT SPOUSE RELIEF');
        return;
      }

      const response = await legalAssistant.ask({
        question: query,
        context: { legalContext: 'tax-law' },
        conversationHistory: history,
      });

      await updateSession(sessionId, sessionManager, query, response.answer);
      await cacheResponse(query, response, responseCache, embeddingService);
      await sendResponse(say, response, '💍 INNOCENT SPOUSE RELIEF');
    } catch (error: any) {
      await say(`❌ Error: ${error.message}`);
    }
  });

  // /tax-liens - Handle IRS liens/levies
  app.command('/tax-liens', async ({ command, ack, say }) => {
    await ack();

    const situation = command.text || 'IRS lien or levy';
    const query = `Handle IRS liens/levies: ${situation}. Provide: 1) Difference between lien and levy, 2) Notice requirements before lien/levy, 3) Property that can be seized, 4) How to get lien released, 5) How to stop a levy, 6) Offer in Compromise, 7) Currently Not Collectible status, 8) Installment agreements, 9) Appeals and Collection Due Process.`;

    try {
      const { sessionId, history } = await getSessionData(command.user_id, sessionManager);
      const cachedResponse = await checkCache(query, responseCache, embeddingService);

      if (cachedResponse) {
        await sendResponse(say, cachedResponse, '🔗 IRS LIENS & LEVIES');
        return;
      }

      const response = await legalAssistant.ask({
        question: query,
        context: { legalContext: 'tax-law' },
        conversationHistory: history,
      });

      await updateSession(sessionId, sessionManager, query, response.answer);
      await cacheResponse(query, response, responseCache, embeddingService);
      await sendResponse(say, response, '🔗 IRS LIENS & LEVIES');
    } catch (error: any) {
      await say(`❌ Error: ${error.message}`);
    }
  });

  // /estimated-tax - Quarterly payment strategy
  app.command('/estimated-tax', async ({ command, ack, say }) => {
    await ack();

    const income_info = command.text || 'need estimated tax strategy';
    const query = `Estimated tax payment strategy for: ${income_info}. Cover: 1) Who must pay estimated taxes, 2) Safe harbor rules (100%/110% of prior year), 3) Annualized income method, 4) Quarterly payment deadlines, 5) Underpayment penalties and how to avoid, 6) Form 2210 and penalty waivers, 7) Adjusting estimates throughout year.`;

    try {
      const { sessionId, history } = await getSessionData(command.user_id, sessionManager);
      const cachedResponse = await checkCache(query, responseCache, embeddingService);

      if (cachedResponse) {
        await sendResponse(say, cachedResponse, '📅 ESTIMATED TAX STRATEGY');
        return;
      }

      const response = await legalAssistant.ask({
        question: query,
        context: { legalContext: 'tax-law' },
        conversationHistory: history,
      });

      await updateSession(sessionId, sessionManager, query, response.answer);
      await cacheResponse(query, response, responseCache, embeddingService);
      await sendResponse(say, response, '📅 ESTIMATED TAX STRATEGY');
    } catch (error: any) {
      await say(`❌ Error: ${error.message}`);
    }
  });

  // /constitutional-tax - Constitutional tax challenges
  app.command('/constitutional-tax', async ({ command, ack, say }) => {
    await ack();

    const query = `Constitutional challenges to federal income tax. Explain: 1) 16th Amendment ratification, 2) "Wages are not income" argument (why it fails), 3) "Voluntary compliance" misinterpretation, 4) Section 861 argument (why it fails), 5) Actual constitutional constraints on taxation, 6) Supreme Court precedents (Brushaber, Pollock), 7) IRS frivolous position penalties, 8) Criminal tax evasion vs civil noncompliance. CRITICAL: Emphasize these arguments have 0% success rate and lead to penalties, fines, and prison.`;

    try {
      const { sessionId, history } = await getSessionData(command.user_id, sessionManager);
      const cachedResponse = await checkCache(query, responseCache, embeddingService);

      if (cachedResponse) {
        await sendResponse(say, cachedResponse, '⚠️ CONSTITUTIONAL TAX ARGUMENTS', true);
        return;
      }

      const response = await legalAssistant.ask({
        question: query,
        context: { documentType: 'constitutional', legalContext: 'tax-law' },
        conversationHistory: history,
      });

      await updateSession(sessionId, sessionManager, query, response.answer);
      await cacheResponse(query, response, responseCache, embeddingService, 30 * 24 * 60 * 60);
      await sendResponse(say, response, '⚠️ CONSTITUTIONAL TAX ARGUMENTS', true);
    } catch (error: any) {
      await say(`❌ Error: ${error.message}`);
    }
  });
}

// Helper functions
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

async function sendResponse(say: any, response: any, header: string, showWarning: boolean = false) {
  const blocks: any[] = [
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
  ];

  if (showWarning) {
    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: '⚠️ *IMPORTANT*: This is legal information for educational purposes, not legal advice. Tax law is complex - consult a licensed tax attorney or CPA. Aggressive strategies carry audit risk.',
        },
      ],
    });
  }

  await say({
    text: response.answer,
    blocks,
  });
}
