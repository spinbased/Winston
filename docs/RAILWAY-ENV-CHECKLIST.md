# Railway Environment Variables Checklist

## Overview
This checklist helps you configure environment variables for Railway deployment at different feature levels.

---

## Configuration Levels

### Level 1: Minimal Mode (Current) ✅
**What You Get**: Basic Slack bot with `/legal-help` command
**What You Need**: Only Slack credentials

### Level 2: Full Mode with Redis
**What You Get**: Sessions, caching, better performance
**What You Need**: Slack credentials + Redis service

### Level 3: AI-Enabled
**What You Get**: Claude AI legal assistant
**What You Need**: Slack + Redis + Anthropic API

### Level 4: Complete (All Features)
**What You Get**: Full AI + legal knowledge base (RAG)
**What You Need**: Everything above + Pinecone

---

## Environment Variables by Level

### Level 1: Minimal Mode (No Redis)

#### Required Variables
```
SLACK_BOT_TOKEN=xoxb-your-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here
```

**Where to Get These:**

1. **SLACK_BOT_TOKEN**
   - Go to https://api.slack.com/apps
   - Select your app
   - Navigate to: **OAuth & Permissions** → **Bot User OAuth Token**
   - Copy token starting with `xoxb-`

2. **SLACK_SIGNING_SECRET**
   - Same Slack app dashboard
   - Navigate to: **Basic Information** → **App Credentials**
   - Copy **Signing Secret**

**How to Add to Railway:**
```bash
# Via Railway Dashboard:
1. Open project → Your service
2. Click "Variables" tab
3. Click "+ New Variable"
4. Paste name and value
5. Click "Add"

# Via Railway CLI:
railway variables set SLACK_BOT_TOKEN=xoxb-...
railway variables set SLACK_SIGNING_SECRET=...
```

**Verification:**
- [ ] SLACK_BOT_TOKEN starts with `xoxb-`
- [ ] SLACK_SIGNING_SECRET is 32 characters
- [ ] Bot responds to `/legal-help` in Slack

---

### Level 2: Full Mode with Redis

#### Additional Required Variables
```
REDIS_URL=redis://default:password@host:port
```

**How to Get REDIS_URL:**

**Option A: Railway Redis Service**
1. Railway dashboard → Click "+ New"
2. Select "Database" → "Add Redis"
3. Click the Redis service → "Variables" tab
4. Copy `REDIS_URL` value
5. Add it to your app service variables

**Option B: Upstash Redis**
1. Sign up at https://upstash.com
2. Create new database
3. Copy **Redis URL** from dashboard
4. Add to Railway variables

**How to Add to Railway:**
```bash
# Via Dashboard:
1. Go to app service (not Redis service)
2. Variables → "+ New Variable"
3. Name: REDIS_URL
4. Value: redis://default:password@host:port
5. Click "Add"

# Via CLI:
railway variables set REDIS_URL=redis://default:password@host:port
```

**Update Configuration:**
After adding Redis, update these files:

`railway.json`:
```json
{
  "deploy": {
    "startCommand": "node dist/index.js"
  }
}
```

`Procfile`:
```
web: node dist/index.js
```

**Verification:**
- [ ] REDIS_URL is set in app service variables
- [ ] Format: `redis://[user]:[password]@[host]:[port]`
- [ ] Railway logs show: "✅ Redis connected successfully"

---

### Level 3: AI-Enabled

#### Additional Required Variables
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**How to Get ANTHROPIC_API_KEY:**
1. Go to https://console.anthropic.com
2. Sign up or log in
3. Navigate to **API Keys**
4. Click **"Create Key"**
5. Copy the key (starts with `sk-ant-`)

**How to Add to Railway:**
```bash
# Via Dashboard:
Variables → "+ New Variable"
Name: ANTHROPIC_API_KEY
Value: sk-ant-...

# Via CLI:
railway variables set ANTHROPIC_API_KEY=sk-ant-...
```

**Optional (Fallback AI):**
```
OPENAI_API_KEY=sk-your-openai-key
```

**Verification:**
- [ ] ANTHROPIC_API_KEY starts with `sk-ant-`
- [ ] Bot gives AI responses to legal questions
- [ ] Railway logs show: "✅ Anthropic client initialized"

---

### Level 4: Complete with RAG (Legal Knowledge Base)

#### Additional Required Variables
```
PINECONE_API_KEY=your-pinecone-key
PINECONE_ENVIRONMENT=us-east1-gcp
PINECONE_INDEX_NAME=legal-knowledge
```

**How to Get Pinecone Credentials:**
1. Go to https://www.pinecone.io
2. Sign up or log in
3. Create new project
4. **API Key**: Dashboard → API Keys → Create Key
5. **Environment**: Dashboard → Region (e.g., `us-east1-gcp`)
6. **Index Name**: Create index → Name it `legal-knowledge`

**How to Add to Railway:**
```bash
# Via Dashboard:
Add three variables:
1. PINECONE_API_KEY = your-key
2. PINECONE_ENVIRONMENT = us-east1-gcp
3. PINECONE_INDEX_NAME = legal-knowledge

# Via CLI:
railway variables set PINECONE_API_KEY=your-key
railway variables set PINECONE_ENVIRONMENT=us-east1-gcp
railway variables set PINECONE_INDEX_NAME=legal-knowledge
```

**Verification:**
- [ ] All three Pinecone variables are set
- [ ] Index exists in Pinecone dashboard
- [ ] Railway logs show: "✅ Pinecone initialized"
- [ ] Bot can answer questions using legal knowledge base

---

## Complete Environment Variables List

### Required (All Levels)
- [ ] `SLACK_BOT_TOKEN` - Slack bot authentication
- [ ] `SLACK_SIGNING_SECRET` - Slack request verification

### Required (Full Mode)
- [ ] `REDIS_URL` - Session storage and caching

### Required (AI Features)
- [ ] `ANTHROPIC_API_KEY` - Claude AI responses

### Optional (Enhanced Features)
- [ ] `OPENAI_API_KEY` - GPT-4 fallback
- [ ] `PINECONE_API_KEY` - Vector database for RAG
- [ ] `PINECONE_ENVIRONMENT` - Pinecone region
- [ ] `PINECONE_INDEX_NAME` - Pinecone index name

### Auto-Set by Railway
- [ ] `PORT` - Automatically set (default: 3000)
- [ ] `NODE_ENV` - Set to `production` by default

---

## Step-by-Step Setup Guide

### Scenario 1: Quick Start (Minimal Mode)
**Goal**: Get bot running ASAP

1. Set Slack variables:
   ```
   SLACK_BOT_TOKEN=xoxb-...
   SLACK_SIGNING_SECRET=...
   ```

2. Push code to GitHub (Railway auto-deploys)

3. Test `/legal-help` in Slack

**Time**: 5-10 minutes

---

### Scenario 2: Production Ready (Full Mode)
**Goal**: Add Redis for sessions and caching

1. Complete Scenario 1

2. Add Redis service:
   - Railway → "+ New" → "Add Redis"

3. Add Redis URL to app:
   ```
   REDIS_URL=redis://...
   ```

4. Update `railway.json` and `Procfile` to use `index.js`

5. Git commit and push

**Time**: 10-15 minutes

---

### Scenario 3: AI-Powered (Full AI)
**Goal**: Enable Claude AI legal assistant

1. Complete Scenario 2

2. Get Anthropic API key from console.anthropic.com

3. Add to Railway:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

4. Railway auto-redeploys with AI enabled

**Time**: 5 minutes (after Scenario 2)

---

### Scenario 4: Enterprise (Complete)
**Goal**: Full legal knowledge base with RAG

1. Complete Scenario 3

2. Set up Pinecone:
   - Create account at pinecone.io
   - Create index named `legal-knowledge`
   - Get API key and environment

3. Add to Railway:
   ```
   PINECONE_API_KEY=...
   PINECONE_ENVIRONMENT=us-east1-gcp
   PINECONE_INDEX_NAME=legal-knowledge
   ```

4. Populate Pinecone index with legal documents (separate process)

**Time**: 20-30 minutes (excluding document ingestion)

---

## Validation Scripts

### Check Required Variables
```bash
# Run locally to verify all required vars are set
node -e "
const required = ['SLACK_BOT_TOKEN', 'SLACK_SIGNING_SECRET'];
const missing = required.filter(v => !process.env[v]);
if (missing.length) {
  console.error('❌ Missing:', missing.join(', '));
  process.exit(1);
}
console.log('✅ All required variables set');
"
```

### Check Redis Connection
```bash
# Test Redis connection
node -e "
const redis = require('ioredis');
const client = new redis(process.env.REDIS_URL);
client.ping().then(() => {
  console.log('✅ Redis connected');
  process.exit(0);
}).catch(err => {
  console.error('❌ Redis error:', err.message);
  process.exit(1);
});
"
```

### Check Anthropic API
```bash
# Test Anthropic API key
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 10,
    "messages": [{"role": "user", "content": "Hi"}]
  }'
```

---

## Common Issues and Solutions

### Issue: "Slack verification failed"
**Cause**: Incorrect SLACK_SIGNING_SECRET
**Fix**:
1. Get new secret from Slack dashboard
2. Update Railway variable
3. Redeploy

### Issue: "Redis connection refused"
**Cause**: REDIS_URL not set or incorrect
**Fix**:
1. Verify Redis service is running
2. Check REDIS_URL format
3. Ensure app and Redis are in same Railway project

### Issue: "Anthropic API error"
**Cause**: Invalid or missing API key
**Fix**:
1. Verify key at console.anthropic.com
2. Check key hasn't expired
3. Ensure key starts with `sk-ant-`

### Issue: "Pinecone index not found"
**Cause**: Index name mismatch
**Fix**:
1. Verify index exists in Pinecone dashboard
2. Match PINECONE_INDEX_NAME exactly
3. Check PINECONE_ENVIRONMENT is correct

---

## Security Best Practices

### DO:
- [ ] Use Railway's Variables feature (encrypted)
- [ ] Rotate API keys regularly
- [ ] Use different keys for dev/staging/prod
- [ ] Monitor API usage for anomalies
- [ ] Set spending limits on API keys

### DON'T:
- [ ] Commit API keys to git
- [ ] Share API keys in Slack/email
- [ ] Use same keys across projects
- [ ] Hardcode secrets in code
- [ ] Log API keys in console

---

## Quick Reference

### View All Variables (Railway CLI)
```bash
railway variables
```

### Set Variable (Railway CLI)
```bash
railway variables set KEY=value
```

### Delete Variable (Railway CLI)
```bash
railway variables delete KEY
```

### Export Variables Locally
```bash
# Create .env file from Railway
railway variables > .env
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] All required variables added to Railway
- [ ] Variables tested locally with `.env` file
- [ ] Code builds successfully (`npm run build`)
- [ ] Railway service configured correctly

### Post-Deployment
- [ ] Check Railway logs for errors
- [ ] Test `/health` endpoint
- [ ] Test `/legal-help` command in Slack
- [ ] Verify Redis connection (if applicable)
- [ ] Test AI responses (if applicable)

### Monitoring
- [ ] Set up Railway log alerts
- [ ] Monitor API usage in Anthropic/OpenAI dashboards
- [ ] Check Redis memory usage
- [ ] Review Slack API logs

---

**Last Updated**: 2025-11-02
**Version**: 1.0
**Related Docs**:
- RAILWAY-QUICK-FIX.md
- VERCEL-DEPLOYMENT-SUMMARY.md
