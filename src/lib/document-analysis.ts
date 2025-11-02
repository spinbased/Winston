/**
 * Document Analysis Module
 * Analyze legal documents, contracts, and uploaded files
 */

import Anthropic from '@anthropic-ai/sdk';
import { storeDocument } from './rag';

// Analyze document text
export async function analyzeDocument(
  documentText: string,
  analysisType: 'contract' | 'legal' | 'general',
  anthropic: Anthropic
): Promise<string> {

  const prompts = {
    contract: `You are analyzing a legal contract. Provide a comprehensive analysis including:

1. **Summary**: Brief overview of the contract's purpose
2. **Key Terms**: Important clauses and provisions
3. **Obligations**: What each party must do
4. **Rights**: What each party is entitled to
5. **Risks**: Potential issues or unfavorable terms
6. **Red Flags**: Concerning clauses that need attention
7. **Recommendations**: Suggested actions or clarifications needed

Document:
${documentText}`,

    legal: `You are analyzing a legal document. Provide detailed analysis including:

1. **Document Type**: What kind of legal document this is
2. **Purpose**: What this document accomplishes
3. **Key Provisions**: Important sections and their meanings
4. **Legal Implications**: What this means legally
5. **Rights & Obligations**: What parties must do or are entitled to
6. **Important Dates**: Any deadlines or time-sensitive provisions
7. **Action Items**: What needs to be done next

Document:
${documentText}`,

    general: `Analyze this document and provide:

1. **Overview**: What this document is about
2. **Key Points**: Main ideas and important information
3. **Legal Relevance**: Any legal implications or concerns
4. **Recommendations**: Suggested next steps

Document:
${documentText}`
  };

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      temperature: 0.3,
      system: 'You are Winston, an expert legal document analyst with deep knowledge of contracts, legal documents, and document review.',
      messages: [{ role: 'user', content: prompts[analysisType] }],
    });

    return response.content[0].type === 'text' ? response.content[0].text : 'Unable to analyze document';
  } catch (error: any) {
    console.error('❌ Document analysis error:', error);
    return `Error analyzing document: ${error.message}`;
  }
}

// Compare two documents
export async function compareDocuments(
  document1: string,
  document2: string,
  anthropic: Anthropic
): Promise<string> {
  const prompt = `Compare these two legal documents and identify:

1. **Key Differences**: Major variations between the documents
2. **Additions**: What's in Document 2 that's not in Document 1
3. **Removals**: What's in Document 1 that's not in Document 2
4. **Changes**: Modified clauses or terms
5. **Implications**: What these changes mean legally
6. **Concerns**: Any problematic differences

**Document 1:**
${document1}

**Document 2:**
${document2}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      temperature: 0.3,
      system: 'You are Winston, an expert at comparing legal documents and identifying critical differences.',
      messages: [{ role: 'user', content: prompt }],
    });

    return response.content[0].type === 'text' ? response.content[0].text : 'Unable to compare documents';
  } catch (error: any) {
    console.error('❌ Document comparison error:', error);
    return `Error comparing documents: ${error.message}`;
  }
}

// Extract key clauses from contract
export async function extractKeyClauses(
  contractText: string,
  anthropic: Anthropic
): Promise<{
  payment: string[];
  termination: string[];
  liability: string[];
  confidentiality: string[];
  intellectual_property: string[];
  other: string[];
}> {
  const prompt = `Extract and categorize key clauses from this contract. Return as JSON.

Categories:
- payment: Payment terms, pricing, fees
- termination: Termination conditions, notice periods
- liability: Liability limitations, indemnification
- confidentiality: Confidentiality and NDA provisions
- intellectual_property: IP ownership and licensing
- other: Other important clauses

Contract:
${contractText}

Return format:
{
  "payment": ["clause text..."],
  "termination": ["clause text..."],
  "liability": ["clause text..."],
  "confidentiality": ["clause text..."],
  "intellectual_property": ["clause text..."],
  "other": ["clause text..."]
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      temperature: 0.3,
      system: 'You are Winston, an expert at extracting and categorizing contract clauses. Return valid JSON only.',
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}';

    // Try to parse JSON response
    try {
      return JSON.parse(text);
    } catch {
      // If not valid JSON, return empty structure
      return {
        payment: [],
        termination: [],
        liability: [],
        confidentiality: [],
        intellectual_property: [],
        other: []
      };
    }
  } catch (error: any) {
    console.error('❌ Clause extraction error:', error);
    return {
      payment: [],
      termination: [],
      liability: [],
      confidentiality: [],
      intellectual_property: [],
      other: []
    };
  }
}

// Summarize long document
export async function summarizeDocument(
  documentText: string,
  length: 'brief' | 'detailed',
  anthropic: Anthropic
): Promise<string> {
  const lengthInstructions = {
    brief: 'Provide a brief 2-3 paragraph summary',
    detailed: 'Provide a comprehensive multi-section summary with key details'
  };

  const prompt = `${lengthInstructions[length]} of this legal document:

${documentText}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: length === 'brief' ? 1024 : 4096,
      temperature: 0.3,
      system: 'You are Winston, an expert at summarizing legal documents clearly and concisely.',
      messages: [{ role: 'user', content: prompt }],
    });

    return response.content[0].type === 'text' ? response.content[0].text : 'Unable to summarize';
  } catch (error: any) {
    console.error('❌ Summarization error:', error);
    return `Error summarizing document: ${error.message}`;
  }
}

// Risk assessment for document
export async function assessRisks(
  documentText: string,
  documentType: string,
  anthropic: Anthropic
): Promise<{
  high_risk: string[];
  medium_risk: string[];
  low_risk: string[];
  recommendations: string[];
}> {
  const prompt = `Assess the legal risks in this ${documentType}. Categorize by severity and provide recommendations. Return as JSON.

Document:
${documentText}

Return format:
{
  "high_risk": ["risk description..."],
  "medium_risk": ["risk description..."],
  "low_risk": ["risk description..."],
  "recommendations": ["recommendation..."]
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      temperature: 0.3,
      system: 'You are Winston, an expert at identifying legal risks and providing risk mitigation strategies. Return valid JSON only.',
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}';

    try {
      return JSON.parse(text);
    } catch {
      return {
        high_risk: [],
        medium_risk: [],
        low_risk: [],
        recommendations: []
      };
    }
  } catch (error: any) {
    console.error('❌ Risk assessment error:', error);
    return {
      high_risk: [],
      medium_risk: [],
      low_risk: [],
      recommendations: []
    };
  }
}

// Store analyzed document in knowledge base
export async function storeAnalyzedDocument(
  documentText: string,
  metadata: {
    title: string;
    type: string;
    category: string;
  },
  anthropic: Anthropic
): Promise<boolean> {
  return await storeDocument(documentText, {
    title: metadata.title,
    source: 'user-upload',
    category: metadata.category,
  }, anthropic);
}
