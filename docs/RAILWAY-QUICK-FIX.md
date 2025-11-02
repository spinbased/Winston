# Railway Deployment - Quick Fix Guide

## Problem Summary
The app was crashing on Railway with Redis connection errors:
```
[ioredis] Unhandled error event: Error: connect ECONNREFUSED ::1:6379
```

## Solution Implemented ✅

We switched Railway to use the **minimal version** (`index-minimal.js`) which runs without Redis dependency.

### Changes Made:

1. **railway.json** - Changed start command:
   ```json
   "startCommand": "node dist/index-minimal.js"
   ```

2. **Procfile** - Updated:
   ```
   web: node dist/index-minimal.js
   ```

## Deployment Steps

### Step 1: Push to GitHub
```bash
cd /mnt/c/Users/qntm5/legal-slack-bot/app
git add .
git commit -m "fix: Use minimal version for Railway deployment (no Redis)"
git push origin main
```

### Step 2: Configure Railway Environment Variables
Go to your Railway project and add these TWO required variables:

```
SLACK_BOT_TOKEN=xoxb-your-token-here
SLACK_SIGNING_SECRET=your-secret-here
```

**Optional** (add later when you have them):
```
ANTHROPIC_API_KEY=sk-ant-your-key
OPENAI_API_KEY=sk-your-key
PINECONE_API_KEY=your-key
```

### Step 3: Railway Will Auto-Deploy
- Railway detects the git push
- Runs: `npm install && npm run build`
- Starts: `node dist/index-minimal.js`
- Health check: `/health` endpoint

### Step 4: Verify Deployment
Check Railway logs for:
```
⚡️ Winston minimal mode running on port 3000
📡 Slack events at /slack/events
🏥 Health check at /health
```

### Step 5: Test Slack Command
In Slack, type:
```
/legal-help
```

Expected response:
```
✅ Winston is running! Add API keys to enable full features.
```

## What's Running in Minimal Mode?

The minimal version (`index-minimal.ts`):
- ✅ Slack bot authentication
- ✅ URL verification for Slack
- ✅ Basic `/legal-help` command
- ✅ Health check endpoint
- ❌ No Redis (sessions/caching)
- ❌ No AI features (needs API keys)
- ❌ No RAG/legal knowledge base

## Upgrading to Full Version with Redis

### Option A: Add Redis Service to Railway

When you're ready for full features, follow these steps:

#### 1. Create Redis Service
1. Open your Railway project dashboard
2. Click **"+ New"** in the top right
3. Select **"Database"** → **"Add Redis"**
4. Railway will provision a Redis instance

#### 2. Get Redis Connection URL
1. Click on the Redis service in your Railway project
2. Go to **"Variables"** tab
3. Copy the **REDIS_URL** value (format: `redis://default:password@host:port`)
4. Alternatively, copy individual values:
   - REDIS_HOST
   - REDIS_PORT
   - REDIS_PASSWORD

#### 3. Add Redis URL to App Service
1. Go back to your app service (not the Redis service)
2. Click **"Variables"** tab
3. Click **"+ New Variable"**
4. Add: `REDIS_URL` = the URL you copied
5. OR add individual variables:
   ```
   REDIS_HOST=your-host.railway.internal
   REDIS_PORT=6379
   REDIS_PASSWORD=your-password
   ```

#### 4. Update Configuration Files
Update `railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "node dist/index.js",  // Changed from index-minimal.js
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

Update `Procfile`:
```
web: node dist/index.js
```

#### 5. Commit and Deploy
```bash
git add railway.json Procfile
git commit -m "feat: Enable full version with Redis support"
git push origin main
```

#### 6. Verify Redis Connection
Check Railway logs for:
```
✅ Redis connected successfully
🔧 Winston initializing with full features...
⚡️ Winston is running with AI capabilities
```

### Option B: Use External Redis (Upstash)

If you prefer a managed Redis solution:

#### 1. Create Upstash Redis Database
1. Go to https://upstash.com
2. Create free account
3. Click **"Create Database"**
4. Choose region closest to Railway deployment
5. Copy the **Redis URL**

#### 2. Add to Railway
1. In Railway Variables tab, add:
   ```
   REDIS_URL=redis://default:password@host:port
   ```

#### 3. Follow steps 4-6 from Option A above

### Option C: Use Vercel (Recommended for Full Features)

For the most robust deployment with Redis and all AI features:
Follow `VERCEL-DEPLOYMENT-SUMMARY.md` for comprehensive setup.

## Environment Variables Checklist

### Required for Minimal Mode ✅
- [ ] `SLACK_BOT_TOKEN` - Get from Slack API dashboard
- [ ] `SLACK_SIGNING_SECRET` - Get from Slack API dashboard

### Required for Full Mode
- [ ] `SLACK_BOT_TOKEN` - Get from Slack API dashboard
- [ ] `SLACK_SIGNING_SECRET` - Get from Slack API dashboard
- [ ] `REDIS_URL` - From Railway Redis service OR Upstash
- [ ] `ANTHROPIC_API_KEY` - For Claude AI responses

### Optional (Enhanced Features)
- [ ] `OPENAI_API_KEY` - For GPT-4 responses (fallback)
- [ ] `PINECONE_API_KEY` - For legal knowledge base (RAG)
- [ ] `PINECONE_ENVIRONMENT` - Pinecone environment region
- [ ] `PINECONE_INDEX_NAME` - Name of your Pinecone index
- [ ] `NODE_ENV` - Set to `production` for Railway
- [ ] `PORT` - Auto-set by Railway (default: 3000)

## Current File Structure
```
app/
├── src/
│   ├── index-minimal.ts    ← Railway uses this (no Redis)
│   ├── index.ts            ← Full version (needs Redis + APIs)
│   └── ...
├── dist/                   ← Built output
│   ├── index-minimal.js    ← Railway runs this (current)
│   └── index.js            ← Full version (with Redis)
├── railway.json            ← Updated to use minimal
├── Procfile                ← Updated to use minimal
└── package.json
```

## Troubleshooting

### Build Fails
```bash
# Check TypeScript compilation locally
npm run build
```

### App Crashes on Railway
1. Check Railway logs
2. Verify environment variables are set
3. Ensure `SLACK_BOT_TOKEN` and `SLACK_SIGNING_SECRET` are correct

### Redis Connection Fails
1. Verify Redis service is running in Railway
2. Check `REDIS_URL` is correctly formatted
3. Ensure Redis and app are in same Railway project
4. Check Railway logs for connection errors

### Slack Not Responding
1. Verify Slack Request URL is set to: `https://your-railway-app.up.railway.app/slack/events`
2. Check Slack app has correct OAuth scopes
3. Reinstall Slack app if needed

### Health Check Failing
Railway health check endpoint: `GET /health`

Should return:
```json
{"status": "ok", "message": "Winston minimal mode"}
```

Or with Redis:
```json
{"status": "ok", "message": "Winston is running", "redis": "connected"}
```

## Migration Path: Minimal → Full Version

### Current State: Minimal Mode (No Redis)
```
✅ Basic Slack bot running
✅ /legal-help command works
❌ No sessions or memory
❌ No AI features
❌ No legal knowledge base
```

### Next Step: Add Redis
```
✅ Follow "Option A: Add Redis Service to Railway" above
✅ Session management enabled
✅ Caching for better performance
⚠️ Still needs API keys for AI
```

### Final Step: Full AI Features
```
✅ Add ANTHROPIC_API_KEY
✅ Add OPENAI_API_KEY (optional)
✅ Add PINECONE_API_KEY (optional)
✅ Full Winston capabilities unlocked
```

## Next Steps

1. **Immediate**: Test `/legal-help` command in Slack
2. **Short-term**: Add Redis service following Option A above
3. **Medium-term**: Add ANTHROPIC_API_KEY for AI responses
4. **Long-term**: Add Pinecone for legal knowledge base

## Support

- Railway logs: `railway logs` (CLI) or check dashboard
- Check Railway dashboard for build status
- Review Slack API logs at api.slack.com/apps
- Redis connection testing: Use Railway's Redis CLI

## Quick Reference Commands

### Railway CLI
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# View logs
railway logs

# Check status
railway status

# Add variable
railway variables set REDIS_URL=redis://...

# Open dashboard
railway open
```

### Testing Locally with Redis
```bash
# Run Redis locally (Docker)
docker run -d -p 6379:6379 redis:alpine

# Set environment variable
export REDIS_URL=redis://localhost:6379

# Run full version
npm run build
node dist/index.js
```

---

**Status**: ✅ Ready for Railway deployment
**Current Version**: Minimal (no Redis/AI)
**Upgrade Path**: Add Redis service → Add API keys → Full features
**Documentation**: This guide + VERCEL-DEPLOYMENT-SUMMARY.md
