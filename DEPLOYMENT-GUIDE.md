# Winston Deployment Guide 🚀

Complete guide for deploying Winston to Vercel with n8n integration.

## 📋 Prerequisites

- GitHub account
- Vercel account (free tier works)
- n8n instance (cloud or self-hosted)
- API keys: Slack, Anthropic, OpenAI, Pinecone
- Redis instance (Upstash free tier recommended for Vercel)

---

## 🔧 Step 1: GitHub Repository Setup

### Option A: Using GitHub CLI (Recommended)

```bash
# Login to GitHub
gh auth login

# Create repository
gh repo create Winston --public --source=. --remote=origin --push

# Repository created at: https://github.com/YOUR_USERNAME/Winston
```

### Option B: Manual GitHub Setup

1. Go to https://github.com/new
2. Create repository named "Winston"
3. Don't initialize with README (we already have one)
4. Copy the repository URL
5. Add remote and push:

```bash
git remote add origin https://github.com/YOUR_USERNAME/Winston.git
git push -u origin main
```

---

## 🚀 Step 2: Vercel Deployment

### 2.1 Connect Repository

1. Go to https://vercel.com/new
2. Import your Winston repository
3. Configure project:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 2.2 Environment Variables

Add these in Vercel dashboard (Settings → Environment Variables):

#### Required Variables

```env
# Slack
SLACK_BOT_TOKEN=xoxb-your-token
SLACK_SIGNING_SECRET=your-secret
SLACK_APP_TOKEN=xapp-your-token

# AI APIs
ANTHROPIC_API_KEY=sk-ant-your-key
OPENAI_API_KEY=sk-your-key

# Vector Database
PINECONE_API_KEY=your-pinecone-key
PINECONE_INDEX_NAME=legal-knowledge

# Redis (Upstash recommended)
REDIS_URL=redis://your-upstash-url:port

# Application
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
```

#### Optional Variables

```env
# N8N Integration
N8N_WEBHOOK_URL=https://your-n8n.com/webhook/winston
N8N_API_KEY=your-n8n-key

# Performance
TOP_K_RETRIEVAL=15
SIMILARITY_THRESHOLD=0.7
```

### 2.3 Deploy

Click **Deploy** button and wait ~2-3 minutes.

Your Winston instance will be live at:
`https://winston-xxx.vercel.app`

---

## 🗄️ Step 3: Database Setup

### Option A: Upstash Redis (Recommended for Vercel)

1. Go to https://upstash.com
2. Create free account
3. Create Redis database
4. Copy `REDIS_URL`
5. Add to Vercel environment variables

### Option B: Redis Cloud

1. Go to https://redis.com/try-free
2. Create free database
3. Copy connection string
4. Add to Vercel environment variables

---

## 📊 Step 4: Vector Database (Pinecone)

### 4.1 Create Pinecone Index

```bash
# Install Pinecone CLI (or use web dashboard)
pip install pinecone-client

# Create index
pinecone create-index \
  --name legal-knowledge \
  --dimension 1536 \
  --metric cosine \
  --pods 1 \
  --replicas 1 \
  --pod-type p1.x1
```

### 4.2 Load Data

Run data pipelines locally (one-time):

```bash
# Install dependencies
npm install

# Process base legal data (~15-20 min)
npm run data:process-all

# OR process ALL law data (~3-5 hours)
npm run data:all-law
```

Embeddings are uploaded to Pinecone and persist there.

---

## 🤖 Step 5: Slack App Configuration

### 5.1 Create Slack App

1. Go to https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. Name: "Winston Legal AI"
4. Choose workspace

### 5.2 OAuth & Permissions

Add these scopes:
- `app_mentions:read`
- `chat:write`
- `commands`
- `files:read`
- `im:history`
- `im:read`
- `im:write`

### 5.3 Slash Commands

Create 31 commands (all pointing to your Vercel URL):

**Request URL**: `https://your-winston.vercel.app/slack/events`

Commands to create:
- `/legal-help`
- `/constitutional`
- `/define`
- `/defend-rights`
- `/sovereign-rights`
- `/traffic-stop`
- `/warrant-check`
- `/miranda-rights`
- `/search-seizure`
- `/remain-silent`
- `/right-to-counsel`
- `/police-misconduct`
- `/arrest-rights`
- `/evidence-suppression`
- `/qualified-immunity`
- `/tax-strategy`
- `/irs-audit`
- `/tax-deductions`
- `/tax-credits`
- `/offshore-tax`
- `/tax-court`
- `/innocent-spouse`
- `/tax-liens`
- `/estimated-tax`
- `/constitutional-tax`
- `/contract-review`
- `/legal-research`
- `/file-lawsuit`
- `/appeal-case`
- `/pro-se`
- `/new-session`

### 5.4 Event Subscriptions

**Request URL**: `https://your-winston.vercel.app/slack/events`

Subscribe to:
- `message.im`
- `message.channels`
- `app_mention`

### 5.5 Install to Workspace

Click "Install to Workspace" and authorize.

Copy these values to Vercel:
- **Bot Token** (`SLACK_BOT_TOKEN`)
- **Signing Secret** (`SLACK_SIGNING_SECRET`)
- **App Token** (`SLACK_APP_TOKEN`)

---

## 🔄 Step 6: N8N Integration

### 6.1 Import Workflow

1. Open n8n editor
2. Click "Import from File"
3. Select `n8n-workflows/winston-legal-assistant.json`

### 6.2 Configure Credentials

Add credentials for:
- **HTTP Header Auth** → Winston API key
- **Slack OAuth2** → Your Slack workspace
- **Redis** → Connection string
- **PostgreSQL** (optional) → For query logging

### 6.3 Set Environment Variables

In n8n Settings → Variables:

```
WINSTON_API_URL=https://your-winston.vercel.app
SLACK_CHANNEL=#legal-queries
```

### 6.4 Activate Workflow

Click "Activate" button in top right.

Webhook URL will be:
`https://your-n8n.com/webhook/winston-query`

### 6.5 Test Integration

```bash
curl -X POST https://your-n8n.com/webhook/winston-query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What are my Miranda rights?",
    "userId": "test-user"
  }'
```

---

## ✅ Step 7: Verification

### 7.1 Health Check

```bash
curl https://your-winston.vercel.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-02T...",
  "services": {
    "redis": true,
    "pinecone": true,
    "anthropic": true,
    "openai": true
  }
}
```

### 7.2 Metrics

```bash
curl https://your-winston.vercel.app/metrics
```

### 7.3 Test in Slack

In your Slack workspace:
```
/legal-help What is habeas corpus?
```

Should receive detailed legal explanation within ~3-5 seconds.

### 7.4 Test Voice Message

Send audio message to Winston bot → should transcribe and respond.

---

## 📈 Step 8: Monitoring

### Vercel Analytics

Enable in Vercel dashboard:
- **Analytics** → See request metrics
- **Logs** → Real-time function logs
- **Speed Insights** → Performance data

### Custom Metrics

Winston exposes `/metrics` endpoint with:
- Total queries
- Cache hit rate
- Average response time
- Active users

### N8N Workflow Monitoring

In n8n:
- View **Executions** tab
- Check success/failure rates
- Monitor response times

---

## 🔧 Troubleshooting

### Issue: Slack commands timeout

**Solution**: Increase Vercel function timeout:
```json
// vercel.json
{
  "functions": {
    "dist/index.js": {
      "maxDuration": 60
    }
  }
}
```

### Issue: Redis connection errors

**Solution**: Verify Redis URL and whitelist Vercel IPs in Upstash.

### Issue: Pinecone rate limits

**Solution**: Upgrade Pinecone plan or reduce `TOP_K_RETRIEVAL` value.

### Issue: High costs

**Solutions**:
- Enable caching (already implemented)
- Use Haiku instead of Sonnet (already using Haiku)
- Reduce `TOP_K_RETRIEVAL` from 15 to 10
- Implement request throttling

---

## 💰 Cost Optimization

### Free Tier Options

- **Vercel**: Free (hobby plan, 100GB bandwidth)
- **Upstash Redis**: Free (10k commands/day)
- **Pinecone**: $70/month (p1 pod)
- **Anthropic**: Pay as you go
- **OpenAI**: Pay as you go

### Monthly Cost Estimate

| Service | Cost |
|---------|------|
| Vercel Hosting | $0 (free) |
| Upstash Redis | $0 (free tier) |
| Pinecone Vector DB | $70-200 |
| Claude API (Haiku) | $20-50 |
| OpenAI (embeddings) | $5-10 |
| **Total** | **$95-260/month** |

### Cost per Query

~$0.0001 per query (with caching: ~$0.00006)

At 10,000 queries/month: ~$1 in API costs

---

## 🔐 Security Best Practices

1. **Never commit `.env`** - Already in `.gitignore`
2. **Use environment variables** - All secrets in Vercel
3. **Enable rate limiting** - Already implemented
4. **Verify Slack signatures** - Built into Bolt
5. **HTTPS only** - Enforced by Vercel
6. **Monitor logs** - Check Vercel logs regularly

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Slack API Documentation](https://api.slack.com)
- [n8n Documentation](https://docs.n8n.io)
- [Pinecone Documentation](https://docs.pinecone.io)
- [Winston GitHub Repository](https://github.com/YOUR_USERNAME/Winston)

---

## 🎉 You're Done!

Winston is now deployed and ready to assist with legal queries!

**Next Steps**:
1. Test all 31 commands in Slack
2. Monitor performance via `/metrics`
3. Set up n8n workflows for automation
4. Share with your team
5. Gather feedback and iterate

---

**Built with Agent OS + Claude-Flow + Claude Code**

Need help? Check the main [README.md](README.md) or open an issue on GitHub.
