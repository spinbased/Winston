# Winston Super Agent - Ultimate n8n Integration

## Overview

Transform Winston into a super agent with:
- ✅ n8n workflow automation
- ✅ Email integration (Gmail)
- ✅ Internet research capabilities
- ✅ Database connections
- ✅ External tool integrations
- ✅ Multi-step AI reasoning

---

## Part 1: n8n MCP Server Configuration

### Already Configured! ✅

The n8n MCP server is configured in `.claude/settings.json`:

```json
{
  "mcpServers": {
    "n8n-winston": {
      "type": "stdio",
      "command": "npx",
      "args": ["n8n-mcp"],
      "env": {
        "N8N_API_KEY": "[YOUR_API_KEY]",
        "N8N_API_URL": "https://n8n.level7labs.ai"
      }
    }
  }
}
```

**Test it:**
```bash
claude mcp list
```

You should see `n8n-winston` in the list.

---

## Part 2: Create Ultimate Workflows in n8n

### Workflow 1: Winston Email Assistant

**Purpose:** Winston can send/receive emails and automate email responses

**Nodes:**
1. **Gmail Trigger** - Watch for new emails
2. **Filter** - Only legal-related emails
3. **Webhook** - Call Winston for AI analysis
4. **Claude AI** - Generate response
5. **Gmail** - Send reply

**Setup:**
1. Go to n8n: https://n8n.level7labs.ai
2. Create workflow: "Winston Email Assistant"
3. Add **Gmail Trigger** node:
   - Click **Credentials** → **Add new**
   - Authorize your Gmail account
   - Set trigger: "On new email"
   - Folder: "Inbox"
4. Add **IF** node (filter):
   - Condition: `{{ $json.subject }}` contains "legal" OR "contract" OR "Winston"
5. Add **HTTP Request** node (call Winston):
   - Method: POST
   - URL: `https://winston-production.up.railway.app/api/analyze`
   - Body:
     ```json
     {
       "from": "{{ $json.from.email }}",
       "subject": "{{ $json.subject }}",
       "body": "{{ $json.text }}"
     }
     ```
6. Add **Gmail** node (send reply):
   - Action: "Send Email"
   - To: `{{ $json.from.email }}`
   - Subject: `Re: {{ $json.subject }}`
   - Body: `{{ $json.ai_response }}`

**Activate** the workflow!

---

### Workflow 2: Winston Internet Research Agent

**Purpose:** Winston can search the web, scrape pages, and summarize findings

**Nodes:**
1. **Webhook** - Receive research query from Slack
2. **HTTP Request** (Search) - Google/Bing API
3. **Loop over URLs** - For each result:
   - **HTTP Request** - Fetch page content
   - **Extract Text** - Parse HTML
   - **Claude AI** - Summarize findings
4. **Aggregate** - Combine all summaries
5. **Claude AI** - Final analysis
6. **Slack** - Send results back

**Setup:**
1. Create workflow: "Winston Research Agent"
2. Add **Webhook** node:
   - Path: `/winston/research`
   - Method: POST
3. Add **HTTP Request** (Google Custom Search):
   - URL: `https://www.googleapis.com/customsearch/v1`
   - Query params:
     - key: [Your Google API Key]
     - cx: [Your Search Engine ID]
     - q: `{{ $json.query }}`
4. Add **Loop** node:
   - Loop over: `{{ $json.items }}`
5. Inside loop:
   - **HTTP Request**: Fetch URL
   - **HTML Extract**: Get text content
   - **HTTP Request** (Claude API): Summarize
6. After loop:
   - **Aggregate** results
   - **Claude AI**: Final synthesis
   - **Slack Webhook**: Send to Slack

---

### Workflow 3: Winston Contract Analyzer

**Purpose:** Automatically analyze uploaded contracts

**Nodes:**
1. **Slack Trigger** - File upload event
2. **Download File** - From Slack URL
3. **PDF Extract** - Parse PDF text
4. **Split Text** - Into sections
5. **Loop** - For each section:
   - **Claude AI** - Analyze legal risks
   - **Score Risk** - 1-10 scale
6. **Database** - Store analysis
7. **Generate Report** - PDF
8. **Slack** - Send report

---

### Workflow 4: Winston Case Database Manager

**Purpose:** Store and search legal cases

**Nodes:**
1. **Webhook** - Receive case data
2. **Pinecone** - Vectorize case description
3. **PostgreSQL** - Store case details
4. **Claude AI** - Generate summary
5. **Slack** - Confirmation message

**Database Schema:**
```sql
CREATE TABLE cases (
  id SERIAL PRIMARY KEY,
  case_number VARCHAR(50),
  client_name VARCHAR(255),
  case_type VARCHAR(100),
  description TEXT,
  ai_summary TEXT,
  risk_score INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### Workflow 5: Winston Meeting Scheduler

**Purpose:** Schedule consultations automatically

**Nodes:**
1. **Slack Command** - `/schedule-consultation`
2. **Calendly** - Check availability
3. **Gmail** - Send invite
4. **PostgreSQL** - Log meeting
5. **Slack** - Send confirmation

---

## Part 3: Connect Winston to n8n Workflows

### Update Winston Bot Code

Add n8n workflow triggering to `index-working.ts`:

```typescript
// At top of file
const N8N_API_URL = process.env.N8N_API_URL || 'https://n8n.level7labs.ai';
const N8N_API_KEY = process.env.N8N_API_KEY;

// Helper to trigger n8n workflows
async function triggerN8nWorkflow(workflowName: string, data: any) {
  if (!N8N_API_KEY) {
    console.log('N8N_API_KEY not configured');
    return null;
  }

  try {
    // Get workflow ID by name
    const workflowsResponse = await fetch(`${N8N_API_URL}/api/v1/workflows`, {
      headers: { 'X-N8N-API-KEY': N8N_API_KEY }
    });
    const workflows = await workflowsResponse.json();
    const workflow = workflows.data.find((w: any) => w.name === workflowName);

    if (!workflow) {
      console.log(`Workflow "${workflowName}" not found`);
      return null;
    }

    // Trigger workflow
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

    return await response.json();
  } catch (error) {
    console.error('n8n workflow error:', error);
    return null;
  }
}

// Add slash commands for workflows
app.command('/research', async ({ ack, respond, command }) => {
  await ack();

  const query = command.text.trim();
  if (!query) {
    await respond('Usage: `/research <your research question>`');
    return;
  }

  await respond('🔍 Starting internet research...');

  const result = await triggerN8nWorkflow('Winston Research Agent', {
    query,
    user: command.user_id,
    channel: command.channel_id
  });

  if (result) {
    await respond('✅ Research complete! Results incoming...');
  } else {
    await respond('❌ Research workflow failed');
  }
});

app.command('/analyze-contract', async ({ ack, respond, command }) => {
  await ack();

  const url = command.text.trim();
  if (!url) {
    await respond('Usage: `/analyze-contract <file URL>`');
    return;
  }

  await respond('⚖️ Analyzing contract... This may take a few minutes.');

  const result = await triggerN8nWorkflow('Winston Contract Analyzer', {
    file_url: url,
    user: command.user_id
  });

  if (result) {
    await respond('✅ Contract analysis complete!');
  }
});

app.command('/schedule', async ({ ack, respond, command }) => {
  await ack();

  const details = command.text.trim();

  await respond('📅 Checking availability...');

  const result = await triggerN8nWorkflow('Winston Meeting Scheduler', {
    details,
    user: command.user_id,
    email: 'USER_EMAIL' // Get from user profile
  });

  if (result) {
    await respond('✅ Meeting scheduled! Check your email.');
  }
});

// Enhanced message handler with workflow routing
app.message(async ({ message, say }) => {
  try {
    if ('subtype' in message && message.subtype) return;
    if ('thread_ts' in message && message.thread_ts) return;
    if ('bot_id' in message) return;

    const text = 'text' in message ? message.text : '';
    if (!text) return;

    console.log(`[DM] Received: "${text}"`);

    // Check for workflow keywords
    if (text.toLowerCase().includes('research') || text.toLowerCase().includes('search for')) {
      const result = await triggerN8nWorkflow('Winston Research Agent', {
        query: text,
        user: message.user,
        channel: message.channel
      });

      if (result) {
        await say('🔍 Research started! Results coming soon...');
        return;
      }
    }

    if (text.toLowerCase().includes('analyze this contract') || text.toLowerCase().includes('review this contract')) {
      await say('⚖️ Please upload the contract file or provide a URL with `/analyze-contract <url>`');
      return;
    }

    // Default AI response
    if (!anthropic) {
      await say('👋 Hello! I\'m Winston...');
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

    const answer = response.content[0].type === 'text'
      ? response.content[0].text
      : 'Unable to process request';

    await say(`⚖️ ${answer}`);
  } catch (error) {
    console.error('Error processing message:', error);
    await say('❌ Sorry, I encountered an error.');
  }
});
```

---

## Part 4: Add External Tool Integrations

### Gmail Integration

1. In n8n: **Credentials** → **Gmail OAuth2**
2. Authorize your Google account
3. Use in workflows:
   - Send emails
   - Read emails
   - Search emails
   - Add labels

### Database Integration (PostgreSQL)

1. Add Railway PostgreSQL service
2. In n8n: **Credentials** → **PostgreSQL**
3. Connect:
   ```
   Host: [Railway internal hostname]
   Port: 5432
   Database: winston_db
   User: postgres
   Password: [from Railway]
   ```

### Google Drive Integration

1. In n8n: **Credentials** → **Google Drive OAuth2**
2. Use for:
   - Store legal documents
   - Share contracts
   - Organize case files

### Calendly Integration

1. Get Calendly API key
2. In n8n: **Credentials** → **Calendly API**
3. Use for:
   - Schedule consultations
   - Check availability
   - Send meeting reminders

---

## Part 5: Deploy Winston with n8n Support

### Add Environment Variables to Railway

1. Go to Railway → Winston service → **Variables**
2. Add:
   ```
   N8N_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   N8N_API_URL=https://n8n.level7labs.ai
   ```
3. Redeploy

### Test the Integration

In Slack:
- `/research What are the implications of habeas corpus?`
- `/analyze-contract https://example.com/contract.pdf`
- `/schedule consultation tomorrow at 2pm`

---

## Part 6: Advanced Super Agent Features

### Feature 1: Multi-Agent Coordination

Use Claude-Flow for complex tasks:
```typescript
// Coordinate multiple agents
const agents = [
  { type: 'researcher', task: 'Research case law' },
  { type: 'analyst', task: 'Analyze findings' },
  { type: 'writer', task: 'Draft legal brief' }
];

for (const agent of agents) {
  await triggerN8nWorkflow(`Winston ${agent.type}`, {
    task: agent.task
  });
}
```

### Feature 2: RAG with Pinecone

Store legal knowledge in Pinecone:
```typescript
// Add to n8n workflow
const embeddings = await anthropic.embeddings({
  input: caseDescription
});

await pinecone.upsert({
  id: caseId,
  values: embeddings,
  metadata: { case_type, client }
});
```

### Feature 3: Automated Reporting

Generate weekly reports:
```typescript
// n8n Schedule Trigger (every Monday 9am)
-> Fetch cases from PostgreSQL
-> Analyze trends with Claude
-> Generate PDF report
-> Email to admin
```

---

## Part 7: Winston Slash Commands Reference

### Available Commands

- `/research <query>` - Internet research
- `/analyze-contract <url>` - Contract analysis
- `/schedule <details>` - Schedule meeting
- `/case-search <keywords>` - Search case database
- `/legal-help <question>` - Quick legal answer
- `/status` - Check Winston systems

---

## Part 8: Cost Optimization

### Estimated Monthly Costs

- **Railway**: $3-5 (n8n + Winston)
- **Claude API**: $5-20 (depends on usage)
- **Google APIs**: $0-5
- **Pinecone**: Free tier (100k vectors)
- **Total**: ~$10-30/month

### Tips to Reduce Costs

1. Use Haiku for simple tasks
2. Cache common queries
3. Batch API requests
4. Set usage limits in Railway

---

## Next Steps

1. ✅ n8n MCP configured
2. 📝 Create workflows in n8n
3. 🔗 Update Winston code with n8n integration
4. 🚀 Deploy to Railway
5. 🧪 Test slash commands in Slack
6. 📊 Monitor usage and costs
7. 🎉 You have a super agent!

---

**You now have Winston Super Agent configured and ready to build!**

Start by creating the first workflow in n8n, then update Winston's code to trigger it.
