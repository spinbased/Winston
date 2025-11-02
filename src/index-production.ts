/**
 * Winston AI Legal Assistant - Production Version
 * With Claude 3.5 Sonnet and all advanced features
 */

import { App, ExpressReceiver } from '@slack/bolt';
import Anthropic from '@anthropic-ai/sdk';
import { analyzeDocument, summarizeDocument, extractKeyClauses, assessRisks } from './lib/document-analysis';

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
      text: '🤔 Analyzing your legal question...',
      ...replyOptions
    });

    // Get conversation history
    const history = getSession(userId);

    console.log(`🧠 Calling Claude AI (with ${history.length} context messages)...`);

    // Build messages with context
    const messages: Array<{role: 'user' | 'assistant', content: string}> = [
      ...history,
      { role: 'user', content: text }
    ];

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514', // Claude Sonnet 4 - Better for specialized roles
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
      text: `⚖️ ${answer}\n\n_Winston AI | Powered by LEVEL 7 LABS_`,
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
      text: '⚖️ **Winston AI Legal Assistant**\n\nUsage: `/legal-help [your question]`\n\nExample:\n`/legal-help What are my rights during a traffic stop?`\n\n_Winston AI | Powered by LEVEL 7 LABS_',
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
      text: '🤔 Analyzing...',
      response_type: 'ephemeral'
    });

    // Get conversation history
    const history = getSession(userId);

    const messages: Array<{role: 'user' | 'assistant', content: string}> = [
      ...history,
      { role: 'user', content: question }
    ];

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
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
      text: `⚖️ **Legal Analysis**\n\n${answer}\n\n_Winston AI | Powered by LEVEL 7 LABS_`,
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

// Helper function for slash commands
async function handleSlashCommand(
  command: any,
  respond: any,
  commandName: string,
  contextPrompt: string
) {
  const userId = command.user_id;
  const text = command.text.trim();

  if (!userId) {
    console.error(`❌ No user_id in ${commandName}`);
    return;
  }

  if (!anthropic) {
    await respond({
      text: '⚠️ AI not configured.',
      response_type: 'ephemeral'
    });
    return;
  }

  try {
    await respond({
      text: '🤔 Analyzing...',
      response_type: 'ephemeral'
    });

    const history = getSession(userId);
    const fullPrompt = text ? `${contextPrompt}\n\nUser question: ${text}` : contextPrompt;

    const messages: Array<{role: 'user' | 'assistant', content: string}> = [
      ...history,
      { role: 'user', content: fullPrompt }
    ];

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      temperature: 0.3,
      system: LEGAL_SYSTEM_PROMPT,
      messages: messages,
    });

    const answer = message.content[0].type === 'text' ? message.content[0].text : 'Unable to process';

    addToSession(userId, 'user', fullPrompt);
    addToSession(userId, 'assistant', answer);

    await respond({
      text: `⚖️ **${commandName} Analysis**\n\n${answer}\n\n_Winston AI | Powered by LEVEL 7 LABS_`,
      response_type: 'in_channel',
    });

    console.log(`✅ ${commandName} response sent`);
  } catch (error: any) {
    console.error(`❌ ${commandName} error:`, error);
    await respond({
      text: `❌ Error processing ${commandName}`,
      response_type: 'ephemeral'
    });
  }
}

// Constitutional Law Commands
app.command('/constitutional', async ({ ack, respond, command }) => {
  await ack();
  await handleSlashCommand(
    command,
    respond,
    'Constitutional',
    'Provide detailed constitutional law analysis and interpretation. Focus on U.S. Constitution, amendments, and Supreme Court precedents.'
  );
});

app.command('/amendment', async ({ ack, respond, command }) => {
  await ack();
  await handleSlashCommand(
    command,
    respond,
    'Amendment',
    'Explain the specific constitutional amendment, its history, interpretation, and relevant case law.'
  );
});

app.command('/bill-of-rights', async ({ ack, respond, command }) => {
  await ack();
  await handleSlashCommand(
    command,
    respond,
    'Bill of Rights',
    'Analyze the Bill of Rights (first 10 amendments) and explain their protections and limitations.'
  );
});

// Rights & Protections Commands
app.command('/rights', async ({ ack, respond, command }) => {
  await ack();
  await handleSlashCommand(
    command,
    respond,
    'Rights',
    'Explain the user\'s legal rights in specific situations, including constitutional and statutory protections.'
  );
});

app.command('/miranda', async ({ ack, respond, command }) => {
  await ack();
  await handleSlashCommand(
    command,
    respond,
    'Miranda Rights',
    'Explain Miranda rights, when they apply, and what happens if they are violated.'
  );
});

app.command('/due-process', async ({ ack, respond, command }) => {
  await ack();
  await handleSlashCommand(
    command,
    respond,
    'Due Process',
    'Explain due process rights under the 5th and 14th amendments, both procedural and substantive.'
  );
});

// Criminal Law Commands
app.command('/criminal-defense', async ({ ack, respond, command }) => {
  await ack();
  await handleSlashCommand(
    command,
    respond,
    'Criminal Defense',
    'Provide criminal defense information, strategies, and relevant legal precedents.'
  );
});

app.command('/search-seizure', async ({ ack, respond, command }) => {
  await ack();
  await handleSlashCommand(
    command,
    respond,
    'Search & Seizure',
    'Explain 4th Amendment search and seizure law, warrant requirements, and exceptions.'
  );
});

app.command('/arrest-rights', async ({ ack, respond, command }) => {
  await ack();
  await handleSlashCommand(
    command,
    respond,
    'Arrest Rights',
    'Explain rights during arrest, booking, interrogation, and detention.'
  );
});

// Civil Law Commands
app.command('/contract-law', async ({ ack, respond, command }) => {
  await ack();
  await handleSlashCommand(
    command,
    respond,
    'Contract Law',
    'Analyze contract law principles, formation, breach, remedies, and defenses.'
  );
});

app.command('/tort-law', async ({ ack, respond, command }) => {
  await ack();
  await handleSlashCommand(
    command,
    respond,
    'Tort Law',
    'Explain tort law including negligence, intentional torts, strict liability, and damages.'
  );
});

app.command('/property-law', async ({ ack, respond, command }) => {
  await ack();
  await handleSlashCommand(
    command,
    respond,
    'Property Law',
    'Analyze property law including ownership, easements, zoning, and real estate issues.'
  );
});

// Legal Definitions & Research
app.command('/define', async ({ ack, respond, command }) => {
  await ack();
  await handleSlashCommand(
    command,
    respond,
    'Legal Definition',
    'Provide the legal definition from Black\'s Law Dictionary and explain its usage in legal contexts.'
  );
});

app.command('/case-law', async ({ ack, respond, command }) => {
  await ack();
  await handleSlashCommand(
    command,
    respond,
    'Case Law',
    'Research and explain relevant case law, precedents, and judicial interpretations.'
  );
});

app.command('/statute', async ({ ack, respond, command }) => {
  await ack();
  await handleSlashCommand(
    command,
    respond,
    'Statute',
    'Explain federal or state statutes, their interpretation, and application.'
  );
});

// Court & Procedure Commands
app.command('/court-procedure', async ({ ack, respond, command }) => {
  await ack();
  await handleSlashCommand(
    command,
    respond,
    'Court Procedure',
    'Explain court procedures, filing requirements, and litigation process.'
  );
});

app.command('/evidence', async ({ ack, respond, command }) => {
  await ack();
  await handleSlashCommand(
    command,
    respond,
    'Evidence Law',
    'Explain rules of evidence, admissibility, hearsay, and evidentiary standards.'
  );
});

app.command('/appeals', async ({ ack, respond, command }) => {
  await ack();
  await handleSlashCommand(
    command,
    respond,
    'Appeals',
    'Explain the appeals process, standards of review, and appellate procedures.'
  );
});

// Family & Estate Law
app.command('/family-law', async ({ ack, respond, command }) => {
  await ack();
  await handleSlashCommand(
    command,
    respond,
    'Family Law',
    'Analyze family law issues including divorce, custody, support, and adoption.'
  );
});

app.command('/estate-law', async ({ ack, respond, command }) => {
  await ack();
  await handleSlashCommand(
    command,
    respond,
    'Estate Law',
    'Explain estate planning, wills, trusts, probate, and inheritance law.'
  );
});

// Business & Employment Law
app.command('/business-law', async ({ ack, respond, command }) => {
  await ack();
  await handleSlashCommand(
    command,
    respond,
    'Business Law',
    'Analyze business law including formation, contracts, liability, and corporate governance.'
  );
});

app.command('/employment-law', async ({ ack, respond, command }) => {
  await ack();
  await handleSlashCommand(
    command,
    respond,
    'Employment Law',
    'Explain employment law including discrimination, wages, benefits, and workplace rights.'
  );
});

// Specialized Areas
app.command('/intellectual-property', async ({ ack, respond, command }) => {
  await ack();
  await handleSlashCommand(
    command,
    respond,
    'Intellectual Property',
    'Analyze IP law including patents, trademarks, copyrights, and trade secrets.'
  );
});

app.command('/immigration', async ({ ack, respond, command }) => {
  await ack();
  await handleSlashCommand(
    command,
    respond,
    'Immigration Law',
    'Explain immigration law, visas, citizenship, deportation, and asylum.'
  );
});

app.command('/tax-law', async ({ ack, respond, command }) => {
  await ack();
  await handleSlashCommand(
    command,
    respond,
    'Tax Law',
    'Analyze tax law including IRS code, deductions, audits, and tax disputes.'
  );
});

app.command('/bankruptcy', async ({ ack, respond, command }) => {
  await ack();
  await handleSlashCommand(
    command,
    respond,
    'Bankruptcy',
    'Explain bankruptcy law, chapters 7/11/13, discharge, and creditor rights.'
  );
});

// Consumer & Housing
app.command('/consumer-rights', async ({ ack, respond, command }) => {
  await ack();
  await handleSlashCommand(
    command,
    respond,
    'Consumer Rights',
    'Explain consumer protection laws, warranties, fraud, and dispute resolution.'
  );
});

app.command('/landlord-tenant', async ({ ack, respond, command }) => {
  await ack();
  await handleSlashCommand(
    command,
    respond,
    'Landlord-Tenant',
    'Analyze landlord-tenant law including leases, evictions, security deposits, and repairs.'
  );
});

// Traffic & Motor Vehicle
app.command('/traffic-law', async ({ ack, respond, command }) => {
  await ack();
  await handleSlashCommand(
    command,
    respond,
    'Traffic Law',
    'Explain traffic laws, violations, DUI/DWI, license suspension, and traffic court.'
  );
});

app.command('/traffic-stop', async ({ ack, respond, command }) => {
  await ack();
  await handleSlashCommand(
    command,
    respond,
    'Traffic Stop Rights',
    'Explain your rights during a traffic stop, including search, questioning, and detention.'
  );
});

// Legal Process & Help
app.command('/legal-process', async ({ ack, respond, command }) => {
  await ack();
  await handleSlashCommand(
    command,
    respond,
    'Legal Process',
    'Explain legal processes, timelines, and what to expect in various legal situations.'
  );
});

app.command('/find-lawyer', async ({ ack, respond }) => {
  await ack();
  await respond({
    text: `⚖️ **Finding Legal Representation**

**State Bar Associations:**
• Search your state bar's lawyer referral service
• Most states: [State Name] State Bar Association

**Free/Low-Cost Legal Aid:**
• Legal Services Corporation: lsc.gov
• American Bar Association: findlegalhelp.org
• Local law schools may have clinics

**Specialized Referrals:**
• ACLU (civil rights): aclu.org
• NAACP Legal Defense Fund
• Immigration: AILA (aila.org)
• Criminal: National Association of Criminal Defense Lawyers

**What to Look For:**
✓ Licensed in your state
✓ Experience in your type of case
✓ Clear fee structure
✓ Good communication
✓ Check disciplinary records

_Winston AI | Powered by LEVEL 7 LABS_`,
    response_type: 'ephemeral'
  });
});

app.command('/legal-emergency', async ({ ack, respond }) => {
  await ack();
  await respond({
    text: `🚨 **Legal Emergency Resources**

**Immediate Threats:**
• Call 911 for emergencies
• Domestic violence: 1-800-799-7233
• Suicide prevention: 988

**Arrest/Detention:**
• Remain silent - don't talk to police
• Request a lawyer immediately
• Don't sign anything without counsel
• Don't consent to searches

**Eviction/Housing:**
• Most states require 30+ day notice
• Don't leave voluntarily
• Contact legal aid immediately
• Document everything

**Court Orders:**
• Restraining orders: Contact local court
• Emergency custody: Family court
• Protective orders: Police + court

**Next Steps:**
1. Document everything
2. Contact lawyer/legal aid ASAP
3. Don't make statements
4. Follow all court orders
5. Keep all paperwork

_This is educational information. Call 911 for emergencies._

_Winston AI | Powered by LEVEL 7 LABS_`,
    response_type: 'ephemeral'
  });
});

// Document Analysis Commands
app.command('/analyze-contract', async ({ ack, respond, command }) => {
  await ack();

  const userId = command.user_id;
  const documentText = command.text.trim();

  if (!userId || !documentText) {
    await respond({
      text: `⚖️ **Contract Analysis**

Usage: \`/analyze-contract [paste contract text]\`

Analyzes contracts and provides:
• Summary of key terms
• Obligations and rights
• Risk assessment
• Red flags and recommendations

_Winston AI | Powered by LEVEL 7 LABS_`,
      response_type: 'ephemeral'
    });
    return;
  }

  if (!anthropic) {
    await respond({ text: '⚠️ AI not configured.', response_type: 'ephemeral' });
    return;
  }

  try {
    await respond({ text: '📄 Analyzing contract...', response_type: 'ephemeral' });

    const analysis = await analyzeDocument(documentText, 'contract', anthropic);

    await respond({
      text: `⚖️ **Contract Analysis**\n\n${analysis}\n\n_Winston AI | Powered by LEVEL 7 LABS_`,
      response_type: 'in_channel',
    });

    console.log(`✅ Contract analysis completed for user ${userId}`);
  } catch (error: any) {
    console.error('❌ Contract analysis error:', error);
    await respond({ text: `❌ Error: ${error.message}`, response_type: 'ephemeral' });
  }
});

app.command('/analyze-document', async ({ ack, respond, command }) => {
  await ack();

  const userId = command.user_id;
  const documentText = command.text.trim();

  if (!userId || !documentText) {
    await respond({
      text: `⚖️ **Document Analysis**

Usage: \`/analyze-document [paste document text]\`

Analyzes legal documents and provides:
• Document type identification
• Purpose and key provisions
• Legal implications
• Action items

_Winston AI | Powered by LEVEL 7 LABS_`,
      response_type: 'ephemeral'
    });
    return;
  }

  if (!anthropic) {
    await respond({ text: '⚠️ AI not configured.', response_type: 'ephemeral' });
    return;
  }

  try {
    await respond({ text: '📄 Analyzing document...', response_type: 'ephemeral' });

    const analysis = await analyzeDocument(documentText, 'legal', anthropic);

    await respond({
      text: `⚖️ **Document Analysis**\n\n${analysis}\n\n_Winston AI | Powered by LEVEL 7 LABS_`,
      response_type: 'in_channel',
    });

    console.log(`✅ Document analysis completed for user ${userId}`);
  } catch (error: any) {
    console.error('❌ Document analysis error:', error);
    await respond({ text: `❌ Error: ${error.message}`, response_type: 'ephemeral' });
  }
});

app.command('/summarize-document', async ({ ack, respond, command }) => {
  await ack();

  const userId = command.user_id;
  const documentText = command.text.trim();

  if (!userId || !documentText) {
    await respond({
      text: `⚖️ **Document Summarization**

Usage: \`/summarize-document [paste document text]\`

Creates a comprehensive summary of legal documents.

_Winston AI | Powered by LEVEL 7 LABS_`,
      response_type: 'ephemeral'
    });
    return;
  }

  if (!anthropic) {
    await respond({ text: '⚠️ AI not configured.', response_type: 'ephemeral' });
    return;
  }

  try {
    await respond({ text: '📄 Summarizing document...', response_type: 'ephemeral' });

    const summary = await summarizeDocument(documentText, 'detailed', anthropic);

    await respond({
      text: `⚖️ **Document Summary**\n\n${summary}\n\n_Winston AI | Powered by LEVEL 7 LABS_`,
      response_type: 'in_channel',
    });

    console.log(`✅ Document summarized for user ${userId}`);
  } catch (error: any) {
    console.error('❌ Summarization error:', error);
    await respond({ text: `❌ Error: ${error.message}`, response_type: 'ephemeral' });
  }
});

app.command('/extract-clauses', async ({ ack, respond, command }) => {
  await ack();

  const userId = command.user_id;
  const contractText = command.text.trim();

  if (!userId || !contractText) {
    await respond({
      text: `⚖️ **Clause Extraction**

Usage: \`/extract-clauses [paste contract text]\`

Extracts and categorizes:
• Payment terms
• Termination conditions
• Liability provisions
• Confidentiality clauses
• IP rights

_Winston AI | Powered by LEVEL 7 LABS_`,
      response_type: 'ephemeral'
    });
    return;
  }

  if (!anthropic) {
    await respond({ text: '⚠️ AI not configured.', response_type: 'ephemeral' });
    return;
  }

  try {
    await respond({ text: '📄 Extracting clauses...', response_type: 'ephemeral' });

    const clauses = await extractKeyClauses(contractText, anthropic);

    let result = '⚖️ **Key Clauses Extracted**\n\n';

    if (clauses.payment.length > 0) {
      result += `**💰 Payment Terms:**\n${clauses.payment.map(c => `• ${c.substring(0, 200)}...`).join('\n')}\n\n`;
    }

    if (clauses.termination.length > 0) {
      result += `**🚪 Termination:**\n${clauses.termination.map(c => `• ${c.substring(0, 200)}...`).join('\n')}\n\n`;
    }

    if (clauses.liability.length > 0) {
      result += `**⚠️ Liability:**\n${clauses.liability.map(c => `• ${c.substring(0, 200)}...`).join('\n')}\n\n`;
    }

    if (clauses.confidentiality.length > 0) {
      result += `**🔒 Confidentiality:**\n${clauses.confidentiality.map(c => `• ${c.substring(0, 200)}...`).join('\n')}\n\n`;
    }

    if (clauses.intellectual_property.length > 0) {
      result += `**💡 Intellectual Property:**\n${clauses.intellectual_property.map(c => `• ${c.substring(0, 200)}...`).join('\n')}\n\n`;
    }

    result += '\n_Winston AI | Powered by LEVEL 7 LABS_';

    await respond({
      text: result,
      response_type: 'in_channel',
    });

    console.log(`✅ Clauses extracted for user ${userId}`);
  } catch (error: any) {
    console.error('❌ Clause extraction error:', error);
    await respond({ text: `❌ Error: ${error.message}`, response_type: 'ephemeral' });
  }
});

app.command('/assess-risks', async ({ ack, respond, command }) => {
  await ack();

  const userId = command.user_id;
  const documentText = command.text.trim();

  if (!userId || !documentText) {
    await respond({
      text: `⚖️ **Risk Assessment**

Usage: \`/assess-risks [paste document text]\`

Provides comprehensive risk analysis:
• High-risk items (immediate attention)
• Medium-risk items (should address)
• Low-risk items (monitor)
• Recommendations

_Winston AI | Powered by LEVEL 7 LABS_`,
      response_type: 'ephemeral'
    });
    return;
  }

  if (!anthropic) {
    await respond({ text: '⚠️ AI not configured.', response_type: 'ephemeral' });
    return;
  }

  try {
    await respond({ text: '📄 Assessing risks...', response_type: 'ephemeral' });

    const risks = await assessRisks(documentText, 'legal document', anthropic);

    let result = '⚖️ **Risk Assessment**\n\n';

    if (risks.high_risk.length > 0) {
      result += `**🚨 HIGH RISK (Immediate Attention):**\n${risks.high_risk.map(r => `• ${r}`).join('\n')}\n\n`;
    }

    if (risks.medium_risk.length > 0) {
      result += `**⚠️ MEDIUM RISK (Should Address):**\n${risks.medium_risk.map(r => `• ${r}`).join('\n')}\n\n`;
    }

    if (risks.low_risk.length > 0) {
      result += `**ℹ️ LOW RISK (Monitor):**\n${risks.low_risk.map(r => `• ${r}`).join('\n')}\n\n`;
    }

    if (risks.recommendations.length > 0) {
      result += `**✅ Recommendations:**\n${risks.recommendations.map(r => `• ${r}`).join('\n')}\n\n`;
    }

    result += '\n_Winston AI | Powered by LEVEL 7 LABS_';

    await respond({
      text: result,
      response_type: 'in_channel',
    });

    console.log(`✅ Risk assessment completed for user ${userId}`);
  } catch (error: any) {
    console.error('❌ Risk assessment error:', error);
    await respond({ text: `❌ Error: ${error.message}`, response_type: 'ephemeral' });
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
      text: '👋 Hello! I\'m Winston, your AI legal assistant.\n\nAsk me any legal question and I\'ll provide comprehensive analysis.\n\n_Winston AI | Powered by LEVEL 7 LABS_',
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
      model: 'claude-sonnet-4-20250514',
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
      text: `⚖️ ${answer}\n\n_Winston AI | Powered by LEVEL 7 LABS_`,
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
    version: 'production-v3.0',
    model: 'claude-sonnet-4-20250514',
    ai: anthropic ? 'enabled' : 'disabled',
    features: {
      conversation_memory: true,
      sonnet_4: true,
      session_management: true,
      context_aware: true,
      deduplication: true,
      rag_capable: true,
      document_analysis: true,
      slash_commands: 37
    },
    sessions: sessions.size
  });
});

const port = parseInt(process.env.PORT || '3000', 10);

(async () => {
  await app.start(port);
  console.log('\n✅ Winston AI Legal Assistant is LIVE');
  console.log(`📡 Port: ${port}`);
  console.log(`🤖 AI Model: Claude Sonnet 4 (claude-sonnet-4-20250514)`);
  console.log(`💾 Session Management: Active`);
  console.log(`🎯 Features: Conversation memory, context-aware responses, deduplication`);
  console.log(`🏢 Powered by LEVEL 7 LABS`);
  console.log('\n⚖️ Ready to provide expert legal analysis!\n');
})();
