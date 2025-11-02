# Winston Vercel Deployment - Quick Setup Guide

## ✅ Prerequisites Complete

- ✅ Vercel CLI installed
- ✅ Authenticated with Vercel account
- ✅ Winston code ready for deployment

## 🚀 Deployment Options

### Option 1: Quick Deploy (Recommended)

Deploy Winston to Vercel with a simple command:

```bash
npx vercel deploy --prod
```

**What happens:**
1. Vercel analyzes your project
2. Builds the TypeScript code
3. Deploys to production
4. Gives you a live URL

⚠️ **Important:** Environment variables must be set separately (see Option 2)

---

### Option 2: Complete Setup with Environment Variables

#### Step 1: Prepare Your API Keys

You'll need:
- **Slack**: Bot Token, Signing Secret, App Token
- **Anthropic**: Claude API key
- **OpenAI**: API key (for embeddings and Whisper)
- **Pinecone**: API key, Environment, Index name
- **Redis**: Connection URL (Upstash recommended for Vercel)

#### Step 2: Set Environment Variables

**Option A: Use the automated script**

```bash
./setup-vercel-env.sh
```

Follow the prompts to enter your API keys.

**Option B: Set variables manually via CLI**

```bash
# Slack
npx vercel env add SLACK_BOT_TOKEN production
npx vercel env add SLACK_SIGNING_SECRET production
npx vercel env add SLACK_APP_TOKEN production

# AI APIs
npx vercel env add ANTHROPIC_API_KEY production
npx vercel env add OPENAI_API_KEY production

# Vector Database
npx vercel env add PINECONE_API_KEY production
npx vercel env add PINECONE_ENVIRONMENT production
npx vercel env add PINECONE_INDEX_NAME production

# Redis (Upstash)
npx vercel env add REDIS_URL production

# Optional
npx vercel env add NODE_ENV production
npx vercel env add LOG_LEVEL production
npx vercel env add N8N_WEBHOOK_URL production
```

**Option C: Use Vercel Web Dashboard**

1. Go to https://vercel.com/dashboard
2. Select your Winston project
3. Go to Settings → Environment Variables
4. Add each variable from `.env.template`

#### Step 3: Deploy to Production

```bash
npx vercel deploy --prod
```

---

### Option 3: Link to GitHub and Auto-Deploy

1. **Push Winston to GitHub** (if not already done):
   ```bash
   ./setup-github.sh
   ```

2. **Import from GitHub in Vercel**:
   - Go to https://vercel.com/new
   - Click "Import Git Repository"
   - Select your Winston repository
   - Add environment variables in the dashboard
   - Click "Deploy"

3. **Enable Auto-Deploy**:
   - Every push to `main` branch auto-deploys
   - Pull request previews automatically created

---

## 🔧 Vercel Configuration

Your `vercel.json` is already configured with:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    { "src": "/health", "dest": "dist/routes/health.js" },
    { "src": "/metrics", "dest": "dist/routes/metrics.js" },
    { "src": "/(.*)", "dest": "dist/index.js" }
  ],
  "functions": {
    "dist/index.js": {
      "memory": 3008,
      "maxDuration": 60
    }
  }
}
```

**Features:**
- 3GB memory allocation (for vector embeddings)
- 60-second timeout (for complex queries)
- Health and metrics endpoints
- Optimized for serverless

---

## ✅ Post-Deployment Checklist

### 1. Verify Deployment

```bash
# Check health endpoint
curl https://your-winston.vercel.app/health

# Expected response:
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

### 2. Check Metrics

```bash
curl https://your-winston.vercel.app/metrics
```

### 3. Configure Slack App

Update your Slack app with the Vercel URL:

1. Go to https://api.slack.com/apps
2. Select your Winston app
3. Update slash command URLs:
   - Request URL: `https://your-winston.vercel.app/slack/events`
4. Update event subscriptions:
   - Request URL: `https://your-winston.vercel.app/slack/events`
5. Save changes

### 4. Test in Slack

```
/legal-help What is habeas corpus?
```

Should receive a detailed legal response within 3-5 seconds.

---

## 🗄️ Redis Setup (Upstash - Free Tier)

Vercel works best with Upstash Redis:

1. **Sign up**: https://upstash.com
2. **Create database**:
   - Click "Create Database"
   - Choose "Global" for best performance
   - Free tier: 10,000 commands/day
3. **Copy credentials**:
   - Get `REDIS_URL` from dashboard
   - Add to Vercel environment variables

---

## 📊 Process Legal Data (One-Time)

After deployment, process legal data **locally** (not on Vercel):

```bash
# Install dependencies
npm install

# Option A: Base data only (~15-20 min)
npm run data:process-all

# Option B: ALL legal data (~3-5 hours)
npm run data:all-law
```

This uploads embeddings to Pinecone. Winston can then access all 805,000 documents.

---

## 🎯 Performance Optimization

### Vercel Function Settings

Your deployment is configured for optimal performance:

- **Memory**: 3GB (handles large vector operations)
- **Timeout**: 60s (allows complex legal queries)
- **Region**: Auto (deployed globally via Vercel Edge Network)

### Cost Estimates

| Tier | Price | Includes |
|------|-------|----------|
| Hobby (Free) | $0/month | 100GB bandwidth, serverless functions |
| Pro | $20/month | 1TB bandwidth, advanced analytics |

**Expected usage:**
- ~10,000 queries/month: Free tier sufficient
- ~100,000 queries/month: Pro tier recommended

---

## 🔐 Security Checklist

✅ All secrets in environment variables (not committed to Git)
✅ Rate limiting enabled (20 req/min per user)
✅ Slack signature verification enabled
✅ HTTPS enforced by Vercel
✅ Health checks don't expose sensitive data

---

## 🐛 Troubleshooting

### Build Fails

**Error**: TypeScript compilation errors

**Solution**:
```bash
# Test build locally first
npm run build

# Fix any TypeScript errors
# Then deploy again
npx vercel deploy --prod
```

### Function Timeout

**Error**: Function exceeded timeout (60s)

**Solutions**:
1. Reduce `TOP_K_RETRIEVAL` (15 → 10)
2. Increase cache hit rate
3. Optimize Pinecone index

### Redis Connection Errors

**Error**: `ECONNREFUSED` or timeout

**Solutions**:
1. Verify `REDIS_URL` is correct
2. Whitelist Vercel IPs in Upstash
3. Check Upstash dashboard for connection limits

### Slack Events Not Received

**Error**: Slack commands not working

**Solutions**:
1. Verify Slack app URLs point to Vercel deployment
2. Check Slack signing secret is correct
3. Review Vercel function logs

---

## 📚 Additional Resources

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Vercel Docs**: https://vercel.com/docs
- **Winston GitHub**: https://github.com/YOUR_USERNAME/Winston
- **Deployment Guide**: See DEPLOYMENT-GUIDE.md
- **Slack Configuration**: See README.md

---

## 🎉 You're All Set!

Winston is now deployed and ready to assist with legal queries!

**Your deployment URL**: `https://winston-xxx.vercel.app`

**Next steps**:
1. ✅ Configure Slack app with Vercel URL
2. ✅ Process legal data: `npm run data:all-law`
3. ✅ Test all 31 commands in Slack
4. ✅ Monitor via `/metrics` endpoint
5. ✅ Set up N8N workflows (optional)

---

**Built with Agent OS + Claude-Flow + Claude Code**

The Ultimate Coding Agent System 🚀⚖️
