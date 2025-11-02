# Winston + n8n Integration - AI Legal Automation

## Overview

Connect Winston (your Slack legal bot) to n8n for powerful automations:
- Trigger n8n workflows from Slack messages
- Use Claude AI in n8n workflows
- Automate legal document processing
- Connect to external tools (databases, APIs, etc.)
- Build complex multi-step legal workflows

---

## Architecture

```
User → Slack → Winston Bot → n8n Workflow → Claude AI → Tools → Response
```

**Flow:**
1. User sends message to Winston in Slack
2. Winston triggers n8n webhook
3. n8n workflow processes with AI
4. Tools are executed (database, API calls, etc.)
5. Response sent back to Slack

---

## Part 1: Setup n8n Credentials

### Step 1: Get n8n API Key

1. Open: https://n8n.level7labs.ai
2. Login to your n8n instance
3. Click **Settings** (gear icon, bottom left)
4. Go to **"API"** tab
5. Click **"Create API Key"**
6. Copy the API key (starts with `n8n_api_...`)

### Step 2: Add to Railway Environment

1. Go to Railway → Winston bot service → **Variables** tab
2. Add new variable:
   ```
   N8N_API_KEY=n8n_api_xxxxxxxxxxxxx
   N8N_API_URL=https://n8n.level7labs.ai
   ```
3. Click **Redeploy**

---

## Part 2: Create n8n Workflow for Winston

### Step 1: Create Webhook Workflow

1. In n8n, click **"+ Create Workflow"**
2. Name it: **"Winston Legal Assistant"**
3. Add **Webhook** node:
   - Click **+** → **"Trigger"** → **"Webhook"**
   - Set **HTTP Method**: POST
   - Set **Path**: `/winston/legal`
   - Copy the webhook URL (looks like: `https://n8n.level7labs.ai/webhook/winston/legal`)

### Step 2: Add HTTP Request Node for Claude

Since n8n doesn't have native Claude node yet, we'll use HTTP Request:

1. Add **HTTP Request** node
2. Configure:
   - **Method**: POST
   - **URL**: `https://api.anthropic.com/v1/messages`
   - **Authentication**: None (we'll use headers)
   - **Headers**:
     ```json
     {
       "x-api-key": "YOUR_ANTHROPIC_API_KEY",
       "anthropic-version": "2023-06-01",
       "content-type": "application/json"
     }
     ```
   - **Body** (JSON):
     ```json
     {
       "model": "claude-3-5-haiku-20241022",
       "max_tokens": 2048,
       "temperature": 0.3,
       "system": "You are Winston, a master AI legal assistant...",
       "messages": [
         {
           "role": "user",
           "content": "{{ $json.body.text }}"
         }
       ]
     }
     ```

### Step 3: Add Response Node

1. Add **Respond to Webhook** node
2. Configure:
   - **Response Code**: 200
   - **Response Body**:
     ```json
     {
       "text": "{{ $json.content[0].text }}",
       "status": "success"
     }
     ```

### Step 4: Save and Activate

1. Click **Save** (top right)
2. Toggle **Active** (switch to ON)
3. Copy the webhook URL

---

## Part 3: Connect Winston to n8n

### Option 1: Modify Winston to Call n8n (Recommended)

Update `index-working.ts` to trigger n8n workflows:

```typescript
// Add at top
const N8N_API_KEY = process.env.N8N_API_KEY;
const N8N_API_URL = process.env.N8N_API_URL || 'https://n8n.level7labs.ai';

// Helper function to trigger n8n workflow
async function triggerN8nWorkflow(workflowId: string, data: any) {
  if (!N8N_API_KEY) return null;

  try {
    const response = await fetch(`${N8N_API_URL}/api/v1/workflows/${workflowId}/execute`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data })
    });

    return await response.json();
  } catch (error) {
    console.error('n8n workflow error:', error);
    return null;
  }
}

// Update message handler to use n8n
app.message(async ({ message, say }) => {
  try {
    if ('subtype' in message && message.subtype) return;
    if ('thread_ts' in message && message.thread_ts) return;
    if ('bot_id' in message) return;

    const text = 'text' in message ? message.text : '';
    if (!text) return;

    console.log(`[DM] Received: "${text}"`);

    // Trigger n8n workflow
    const result = await triggerN8nWorkflow('WORKFLOW_ID', {
      text,
      user: message.user,
      channel: message.channel
    });

    if (result && result.text) {
      await say(`⚖️ ${result.text}`);
    } else {
      // Fallback to direct Anthropic if n8n fails
      await say('🤔 Let me analyze that...');
      // ... existing Anthropic code
    }
  } catch (error) {
    console.error('Error processing message:', error);
    await say('❌ Sorry, I encountered an error.');
  }
});
```

### Option 2: Use n8n MCP Server (Advanced)

Install n8n MCP for Claude Code integration:

```bash
# Add n8n MCP to Claude config
claude mcp add n8n npx n8n-mcp
```

Then set environment variables:
```bash
export N8N_API_KEY="your_api_key"
export N8N_API_URL="https://n8n.level7labs.ai"
```

---

## Part 4: Advanced Workflows

### Workflow 1: Legal Document Analysis

**Nodes:**
1. **Webhook** - Receive document
2. **HTTP Request** - Download document from URL
3. **Extract Text** - Parse PDF/DOCX
4. **Claude AI** - Analyze legal content
5. **Store in Database** - Save analysis
6. **Slack** - Send summary to user

### Workflow 2: Case Research Automation

**Nodes:**
1. **Webhook** - Receive case query
2. **Web Scraper** - Search legal databases
3. **Claude AI** - Summarize findings
4. **Pinecone** - Store in vector DB
5. **Slack** - Send results

### Workflow 3: Contract Review Pipeline

**Nodes:**
1. **Webhook** - Receive contract
2. **Split into Sections** - Parse contract
3. **Loop** - For each section:
   - Claude AI analysis
   - Risk scoring
   - Recommendation generation
4. **Aggregate Results** - Combine analysis
5. **Generate Report** - PDF output
6. **Slack** - Share with user

---

## Part 5: Tool Integrations

### Connect to External Tools

**Available n8n Integrations:**
- **Google Drive** - Store legal documents
- **PostgreSQL** - Case database
- **Airtable** - Client management
- **Gmail** - Email automation
- **Calendly** - Meeting scheduling
- **Stripe** - Billing
- **Zapier** - 5000+ app integrations
- **OpenAI/Anthropic** - AI analysis
- **Pinecone** - Vector search
- **Slack** - Notifications

### Example: Store Case in Database

Add **PostgreSQL** node to workflow:
```sql
INSERT INTO cases (
  client_id,
  case_type,
  description,
  ai_analysis,
  created_at
) VALUES (
  {{ $json.client_id }},
  {{ $json.case_type }},
  {{ $json.description }},
  {{ $json.ai_analysis }},
  NOW()
);
```

---

## Part 6: Setup Commands

### Create Slash Commands for n8n

In Winston bot, add commands to trigger workflows:

```typescript
// /analyze-contract
app.command('/analyze-contract', async ({ ack, respond, command }) => {
  await ack();

  const result = await triggerN8nWorkflow('contract-review-workflow', {
    contract_url: command.text,
    user: command.user_id
  });

  await respond(`⚖️ Contract analysis started! Results in 2-3 minutes.`);
});

// /search-cases
app.command('/search-cases', async ({ ack, respond, command }) => {
  await ack();

  const result = await triggerN8nWorkflow('case-search-workflow', {
    query: command.text,
    user: command.user_id
  });

  await respond(`🔍 Searching cases: "${command.text}"`);
});
```

---

## Part 7: Testing

### Test Webhook Locally

```bash
curl -X POST https://n8n.level7labs.ai/webhook/winston/legal \
  -H "Content-Type: application/json" \
  -d '{
    "text": "What is habeas corpus?",
    "user": "U12345"
  }'
```

Expected response:
```json
{
  "text": "⚖️ Habeas corpus is a legal principle...",
  "status": "success"
}
```

---

## Next Steps

1. **Create your first workflow** in n8n
2. **Test the webhook** with curl
3. **Update Winston bot** to call n8n
4. **Deploy to Railway**
5. **Test in Slack**
6. **Build advanced workflows** (document analysis, case research)
7. **Add more tools** (database, APIs, etc.)

---

## Cost Estimate

- **n8n on Railway**: $3-4/month (covered by $5 free credit)
- **Claude API**: ~$0.25 per 1000 messages
- **Pinecone**: Free tier (100k vectors)
- **Total**: ~$0-5/month

---

## Example Full Workflow

```
User: "Analyze this contract: [URL]"
  ↓
Winston Bot receives message
  ↓
Triggers n8n webhook: /webhook/contract-analysis
  ↓
n8n downloads contract from URL
  ↓
Extracts text from PDF
  ↓
Sends to Claude for analysis
  ↓
Stores analysis in PostgreSQL
  ↓
Generates summary report
  ↓
Sends back to Slack with findings
  ↓
User: "⚖️ Contract Analysis Complete:
      - Risk Level: Medium
      - Key Issues: 3 found
      - Recommendations: View full report"
```

Ready to build this? Let me know which workflow you want to start with!
