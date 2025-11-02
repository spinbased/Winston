# Winston Railway Deployment - Quick Guide

Railway is perfect for Winston because:
- ✅ No serverless complexity (runs Express as-is)
- ✅ Built-in Redis addon (free)
- ✅ Automatic HTTPS
- ✅ Easy environment variables
- ✅ $5 free credit per month
- ✅ Deploy in 2 minutes

---

## 🚀 Option 1: Deploy via Web (Easiest - 2 Minutes)

### Step 1: Sign Up for Railway

1. Go to https://railway.app
2. Click **Login** → Sign in with GitHub
3. Authorize Railway to access your GitHub

### Step 2: Deploy from GitHub

1. Click **New Project**
2. Select **Deploy from GitHub repo**
3. Choose your **Winston** repository (spinbased/Winston)
4. Railway automatically detects Node.js and starts deploying

### Step 3: Add Environment Variables

1. Click on your project
2. Go to **Variables** tab
3. Click **+ New Variable** and add these:

```bash
SLACK_BOT_TOKEN=xoxb-... (you have this)
SLACK_SIGNING_SECRET=... (you have this)
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=us-east-1-aws
PINECONE_INDEX_NAME=legal-knowledge
NODE_ENV=production
LOG_LEVEL=info
PORT=3000
```

### Step 4: Add Redis

1. In your Railway project dashboard
2. Click **+ New**
3. Select **Database** → **Add Redis**
4. Railway automatically creates `REDIS_URL` variable

### Step 5: Get Your URL

1. Click **Settings** tab
2. Scroll to **Domains**
3. Click **Generate Domain**
4. Copy your URL: `https://your-app.up.railway.app`

**Done!** Winston is live at that URL 🎉

---

## 🚀 Option 2: Deploy via CLI (3 Minutes)

### Step 1: Login to Railway

```bash
npx @railway/cli login
```

This opens your browser to authenticate with GitHub.

### Step 2: Initialize Project

```bash
cd /mnt/c/Users/qntm5/legal-slack-bot/app
npx @railway/cli init
```

Follow prompts:
- Create new project: **Yes**
- Project name: **Winston Legal AI**

### Step 3: Link to GitHub (Optional)

```bash
npx @railway/cli link
```

### Step 4: Add Redis

```bash
npx @railway/cli add
```

Select: **Redis**

### Step 5: Set Environment Variables

You have two options:

**Option A: One by one**
```bash
npx @railway/cli variables set SLACK_BOT_TOKEN="xoxb-your-token"
npx @railway/cli variables set SLACK_SIGNING_SECRET="your-secret"
npx @railway/cli variables set ANTHROPIC_API_KEY="sk-ant-..."
npx @railway/cli variables set OPENAI_API_KEY="sk-..."
npx @railway/cli variables set PINECONE_API_KEY="your-key"
npx @railway/cli variables set PINECONE_ENVIRONMENT="us-east-1-aws"
npx @railway/cli variables set PINECONE_INDEX_NAME="legal-knowledge"
npx @railway/cli variables set NODE_ENV="production"
npx @railway/cli variables set LOG_LEVEL="info"
```

**Option B: From file**
```bash
# Create .env file first with your values
npx @railway/cli variables set --from-file .env
```

### Step 6: Deploy

```bash
npx @railway/cli up
```

Railway builds and deploys Winston automatically.

### Step 7: Get Your URL

```bash
npx @railway/cli domain
```

Or go to https://railway.app/project to see your deployment URL.

---

## ✅ After Deployment

### 1. Test Health Endpoint

```bash
curl https://your-app.up.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "services": {
    "redis": true,
    "pinecone": true,
    "anthropic": true,
    "openai": true
  }
}
```

### 2. Update Slack App

Now go back to https://api.slack.com/apps and update:

**Slash Commands:**
- Request URL: `https://your-app.up.railway.app/slack/events`

**Event Subscriptions:**
- Request URL: `https://your-app.up.railway.app/slack/events`
- Click **Save Changes**
- Slack verifies the URL (should show green checkmark ✅)

### 3. Test in Slack

```
/legal-help What is habeas corpus?
```

Should get a detailed legal response! 🎉

---

## 📋 Environment Variables You Need

| Variable | Status | Where to Get |
|----------|--------|--------------|
| `SLACK_BOT_TOKEN` | ✅ You have | Already obtained |
| `SLACK_SIGNING_SECRET` | ✅ You have | Already obtained |
| `ANTHROPIC_API_KEY` | ❓ Need | https://console.anthropic.com |
| `OPENAI_API_KEY` | ❓ Need | https://platform.openai.com |
| `PINECONE_API_KEY` | ❓ Need | https://www.pinecone.io |
| `REDIS_URL` | ✅ Auto | Railway creates automatically |

---

## 💰 Railway Pricing

- **Free tier**: $5 credit/month (enough for testing)
- **Hobby**: $5/month (500 hours of usage)
- **Pro**: $20/month (unlimited)

Winston's estimated usage: ~$5-10/month

---

## 🐛 Troubleshooting

### Build Fails

**Check logs:**
```bash
npx @railway/cli logs
```

**Common issues:**
- TypeScript errors: Run `npm run build` locally first
- Missing dependencies: Check package.json

### Deployment Shows Error

**Check status:**
```bash
npx @railway/cli status
```

**Redeploy:**
```bash
npx @railway/cli up --force
```

### Slack URL Verification Fails

**Issues:**
1. Winston not fully started (check logs)
2. Missing `SLACK_SIGNING_SECRET` variable
3. Health endpoint not responding

**Test health endpoint first:**
```bash
curl https://your-app.up.railway.app/health
```

---

## 🎯 Quick Start Commands

```bash
# Login
npx @railway/cli login

# Initialize
cd /mnt/c/Users/qntm5/legal-slack-bot/app
npx @railway/cli init

# Add Redis
npx @railway/cli add

# Set variables (example)
npx @railway/cli variables set SLACK_BOT_TOKEN="xoxb-..."
npx @railway/cli variables set SLACK_SIGNING_SECRET="..."

# Deploy
npx @railway/cli up

# Get URL
npx @railway/cli domain

# View logs
npx @railway/cli logs
```

---

## 🔗 Useful Links

- **Railway Dashboard**: https://railway.app/dashboard
- **Railway Docs**: https://docs.railway.app
- **Winston GitHub**: https://github.com/spinbased/Winston
- **Slack Apps**: https://api.slack.com/apps

---

## ⚡ Fastest Path (Under 3 Minutes)

1. Go to https://railway.app → Login with GitHub
2. New Project → Deploy from GitHub → Select Winston repo
3. Add Redis addon
4. Add environment variables (you have 2, need 3 more API keys)
5. Wait 2 minutes for deployment
6. Copy deployment URL
7. Update Slack app URLs
8. Test with `/legal-help`

**Done!** 🚀

---

**Built with Agent OS + Claude-Flow + Claude Code**

The Ultimate Coding Agent System 🚀⚖️
