/**
 * Law Enforcement Slash Commands
 * Real-time legal defense guidance for law enforcement encounters
 */

import { App } from '@slack/bolt';
import { LegalAssistantService } from '../../services/legal-assistant.service';
import { SessionManager } from '../../services/session.service';
import { ResponseCache } from '../../services/response-cache.service';
import { EmbeddingService } from '../../services/embedding.service';

export function registerLawEnforcementCommands(
  app: App,
  legalAssistant: LegalAssistantService,
  sessionManager: SessionManager,
  responseCache: ResponseCache,
  embeddingService: EmbeddingService
) {
  // /traffic-stop - Real-time traffic stop defense
  app.command('/traffic-stop', async ({ command, ack, say }) => {
    await ack();

    const situation = command.text || 'general traffic stop';
    const query = `I am being pulled over in a traffic stop. Situation: ${situation}. Provide immediate, real-time legal defense guidance including: 1) Exact scripts to say word-for-word, 2) Constitutional rights being invoked, 3) What to refuse, 4) How to document, 5) Post-stop actions.`;

    try {
      const { sessionId, history } = await getSessionData(command.user_id, sessionManager);
      const cachedResponse = await checkCache(query, responseCache, embeddingService);

      if (cachedResponse) {
        await sendResponse(say, cachedResponse, '🚨 TRAFFIC STOP DEFENSE');
        return;
      }

      const response = await legalAssistant.ask({
        question: query,
        context: { legalContext: 'law-enforcement' },
        conversationHistory: history,
      });

      await updateSession(sessionId, sessionManager, query, response.answer);
      await cacheResponse(query, response, responseCache, embeddingService);
      await sendResponse(say, response, '🚨 TRAFFIC STOP DEFENSE');
    } catch (error: any) {
      await say(`❌ Error: ${error.message}`);
    }
  });

  // /warrant-check - Warrant validity verification
  app.command('/warrant-check', async ({ command, ack, say }) => {
    await ack();

    const details = command.text || 'general warrant';
    const query = `Law enforcement presented a warrant. Details: ${details}. Analyze warrant validity, check for: 1) Proper judge signature, 2) Specific description of place/items, 3) Oath or affirmation, 4) Nighttime execution authorization, 5) Staleness issues, 6) Overbreadth problems, 7) My rights and how to challenge.`;

    try {
      const { sessionId, history } = await getSessionData(command.user_id, sessionManager);
      const cachedResponse = await checkCache(query, responseCache, embeddingService);

      if (cachedResponse) {
        await sendResponse(say, cachedResponse, '📋 WARRANT ANALYSIS');
        return;
      }

      const response = await legalAssistant.ask({
        question: query,
        context: { legalContext: 'law-enforcement' },
        conversationHistory: history,
      });

      await updateSession(sessionId, sessionManager, query, response.answer);
      await cacheResponse(query, response, responseCache, embeddingService);
      await sendResponse(say, response, '📋 WARRANT ANALYSIS');
    } catch (error: any) {
      await say(`❌ Error: ${error.message}`);
    }
  });

  // /miranda-rights - Miranda rights explanation
  app.command('/miranda-rights', async ({ command, ack, say }) => {
    await ack();

    const query = `Explain Miranda rights in detail: 1) Full text of Miranda warning, 2) When police must give Miranda, 3) What happens if they don't, 4) How to invoke Miranda, 5) Can I invoke only some rights? 6) Consequences of waiving, 7) How to re-invoke after waiving.`;

    try {
      const { sessionId, history } = await getSessionData(command.user_id, sessionManager);
      const cachedResponse = await checkCache(query, responseCache, embeddingService);

      if (cachedResponse) {
        await sendResponse(say, cachedResponse, '⚖️ MIRANDA RIGHTS');
        return;
      }

      const response = await legalAssistant.ask({
        question: query,
        context: { documentType: 'constitutional', legalContext: 'law-enforcement' },
        conversationHistory: history,
      });

      await updateSession(sessionId, sessionManager, query, response.answer);
      await cacheResponse(query, response, responseCache, embeddingService, 30 * 24 * 60 * 60); // 30 days
      await sendResponse(say, response, '⚖️ MIRANDA RIGHTS');
    } catch (error: any) {
      await say(`❌ Error: ${error.message}`);
    }
  });

  // /search-seizure - 4th Amendment rights assertion
  app.command('/search-seizure', async ({ command, ack, say }) => {
    await ack();

    const situation = command.text || 'police want to search';
    const query = `Police want to search. Situation: ${situation}. Provide 4th Amendment defense: 1) Exact words to refuse consent, 2) What they can search without warrant, 3) Exceptions to warrant requirement, 4) How to document illegal search, 5) Exclusionary rule and fruit of poisonous tree, 6) How to suppress evidence.`;

    try {
      const { sessionId, history } = await getSessionData(command.user_id, sessionManager);
      const cachedResponse = await checkCache(query, responseCache, embeddingService);

      if (cachedResponse) {
        await sendResponse(say, cachedResponse, '🛡️ 4TH AMENDMENT PROTECTION');
        return;
      }

      const response = await legalAssistant.ask({
        question: query,
        context: { documentType: 'constitutional', legalContext: 'law-enforcement' },
        conversationHistory: history,
      });

      await updateSession(sessionId, sessionManager, query, response.answer);
      await cacheResponse(query, response, responseCache, embeddingService);
      await sendResponse(say, response, '🛡️ 4TH AMENDMENT PROTECTION');
    } catch (error: any) {
      await say(`❌ Error: ${error.message}`);
    }
  });

  // /remain-silent - 5th Amendment guidance
  app.command('/remain-silent', async ({ command, ack, say }) => {
    await ack();

    const query = `Provide complete 5th Amendment self-incrimination protection guidance: 1) Exact words to invoke right to silence, 2) When right applies, 3) Can police continue questioning after invocation? 4) Penalties for invoking (none, but explain), 5) What if I already started talking? 6) Exceptions and limitations, 7) How to document invocation.`;

    try {
      const { sessionId, history } = await getSessionData(command.user_id, sessionManager);
      const cachedResponse = await checkCache(query, responseCache, embeddingService);

      if (cachedResponse) {
        await sendResponse(say, cachedResponse, '🤐 5TH AMENDMENT - RIGHT TO SILENCE');
        return;
      }

      const response = await legalAssistant.ask({
        question: query,
        context: { documentType: 'constitutional', legalContext: 'law-enforcement' },
        conversationHistory: history,
      });

      await updateSession(sessionId, sessionManager, query, response.answer);
      await cacheResponse(query, response, responseCache, embeddingService, 30 * 24 * 60 * 60); // 30 days
      await sendResponse(say, response, '🤐 5TH AMENDMENT - RIGHT TO SILENCE');
    } catch (error: any) {
      await say(`❌ Error: ${error.message}`);
    }
  });

  // /right-to-counsel - 6th Amendment attorney rights
  app.command('/right-to-counsel', async ({ command, ack, say }) => {
    await ack();

    const query = `Explain 6th Amendment right to counsel: 1) Exact words to invoke, 2) When right attaches, 3) Can police question after invoking? 4) Public defender vs private attorney, 5) What if I can't afford one? 6) Ineffective assistance of counsel, 7) How to get attorney immediately during police encounter.`;

    try {
      const { sessionId, history } = await getSessionData(command.user_id, sessionManager);
      const cachedResponse = await checkCache(query, responseCache, embeddingService);

      if (cachedResponse) {
        await sendResponse(say, cachedResponse, '⚖️ 6TH AMENDMENT - RIGHT TO COUNSEL');
        return;
      }

      const response = await legalAssistant.ask({
        question: query,
        context: { documentType: 'constitutional', legalContext: 'law-enforcement' },
        conversationHistory: history,
      });

      await updateSession(sessionId, sessionManager, query, response.answer);
      await cacheResponse(query, response, responseCache, embeddingService, 30 * 24 * 60 * 60); // 30 days
      await sendResponse(say, response, '⚖️ 6TH AMENDMENT - RIGHT TO COUNSEL');
    } catch (error: any) {
      await say(`❌ Error: ${error.message}`);
    }
  });

  // /police-misconduct - File complaint guidance
  app.command('/police-misconduct', async ({ command, ack, say }) => {
    await ack();

    const incident = command.text || 'general misconduct';
    const query = `Police misconduct occurred: ${incident}. Provide guidance on: 1) How to file complaint with department, 2) How to file with civilian review board, 3) Federal civil rights complaint (42 USC 1983), 4) DOJ complaint process, 5) What evidence to gather, 6) How to document injuries/damages, 7) Statute of limitations, 8) Qualified immunity challenges.`;

    try {
      const { sessionId, history } = await getSessionData(command.user_id, sessionManager);
      const cachedResponse = await checkCache(query, responseCache, embeddingService);

      if (cachedResponse) {
        await sendResponse(say, cachedResponse, '📝 POLICE MISCONDUCT COMPLAINT');
        return;
      }

      const response = await legalAssistant.ask({
        question: query,
        context: { legalContext: 'law-enforcement' },
        conversationHistory: history,
      });

      await updateSession(sessionId, sessionManager, query, response.answer);
      await cacheResponse(query, response, responseCache, embeddingService);
      await sendResponse(say, response, '📝 POLICE MISCONDUCT COMPLAINT');
    } catch (error: any) {
      await say(`❌ Error: ${error.message}`);
    }
  });

  // /arrest-rights - What to do when arrested
  app.command('/arrest-rights', async ({ command, ack, say }) => {
    await ack();

    const query = `I am being arrested or might be arrested. Provide complete guidance: 1) How to verify it's a lawful arrest, 2) Exact words to say during arrest, 3) What to NEVER say or do, 4) Constitutional rights during arrest, 5) Booking process and rights, 6) Bail process, 7) First 72 hours strategy, 8) When to get attorney.`;

    try {
      const { sessionId, history} = await getSessionData(command.user_id, sessionManager);
      const cachedResponse = await checkCache(query, responseCache, embeddingService);

      if (cachedResponse) {
        await sendResponse(say, cachedResponse, '🚔 ARREST RIGHTS & PROCEDURE');
        return;
      }

      const response = await legalAssistant.ask({
        question: query,
        context: { documentType: 'constitutional', legalContext: 'law-enforcement' },
        conversationHistory: history,
      });

      await updateSession(sessionId, sessionManager, query, response.answer);
      await cacheResponse(query, response, responseCache, embeddingService);
      await sendResponse(say, response, '🚔 ARREST RIGHTS & PROCEDURE');
    } catch (error: any) {
      await say(`❌ Error: ${error.message}`);
    }
  });

  // /evidence-suppression - Motion to suppress evidence
  app.command('/evidence-suppression', async ({ command, ack, say }) => {
    await ack();

    const evidence = command.text || 'illegally obtained evidence';
    const query = `Evidence was obtained illegally: ${evidence}. Provide motion to suppress guidance: 1) Grounds for suppression (4th, 5th, 6th Amendment violations), 2) Exclusionary rule application, 3) Fruit of poisonous tree doctrine, 4) How to file motion to suppress, 5) Burden of proof, 6) Hearing process, 7) Good faith exception challenges.`;

    try {
      const { sessionId, history } = await getSessionData(command.user_id, sessionManager);
      const cachedResponse = await checkCache(query, responseCache, embeddingService);

      if (cachedResponse) {
        await sendResponse(say, cachedResponse, '⚖️ MOTION TO SUPPRESS EVIDENCE');
        return;
      }

      const response = await legalAssistant.ask({
        question: query,
        context: { legalContext: 'law-enforcement' },
        conversationHistory: history,
      });

      await updateSession(sessionId, sessionManager, query, response.answer);
      await cacheResponse(query, response, responseCache, embeddingService);
      await sendResponse(say, response, '⚖️ MOTION TO SUPPRESS EVIDENCE');
    } catch (error: any) {
      await say(`❌ Error: ${error.message}`);
    }
  });

  // /qualified-immunity - Challenge qualified immunity
  app.command('/qualified-immunity', async ({ command, ack, say }) => {
    await ack();

    const case_details = command.text || 'police violated rights';
    const query = `Police violated my rights: ${case_details}. How to challenge qualified immunity: 1) What is qualified immunity doctrine, 2) How it shields police from liability, 3) "Clearly established law" standard, 4) How to overcome qualified immunity defense, 5) Recent Supreme Court cases weakening immunity, 6) Strategies to establish clearly established rights, 7) Alternative claims that bypass immunity.`;

    try {
      const { sessionId, history } = await getSessionData(command.user_id, sessionManager);
      const cachedResponse = await checkCache(query, responseCache, embeddingService);

      if (cachedResponse) {
        await sendResponse(say, cachedResponse, '⚔️ CHALLENGING QUALIFIED IMMUNITY');
        return;
      }

      const response = await legalAssistant.ask({
        question: query,
        context: { legalContext: 'law-enforcement' },
        conversationHistory: history,
      });

      await updateSession(sessionId, sessionManager, query, response.answer);
      await cacheResponse(query, response, responseCache, embeddingService);
      await sendResponse(say, response, '⚔️ CHALLENGING QUALIFIED IMMUNITY');
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
