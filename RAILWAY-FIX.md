# Railway Build Fix - Complete Instructions

## 🔴 Why Railway is Crashing

Railway crashes when:
1. Missing required environment variables
2. App tries to connect to services (Redis, Pinecone, etc.) that don't exist yet
3. Build configuration issues

## ✅ The Fix - Do This EXACTLY

### Step 1: Add MINIMUM Environment Variables (Required BEFORE Deploy)

In Railway, your Winston service → **Variables** tab → Add these 2:

```bash
SLACK_BOT_TOKEN=xoxb-your-token-here
SLACK_SIGNING_SECRET=your-secret-here
```

**Also add these placeholder values** (Winston needs them to start):

```bash
ANTHROPIC_API_KEY=sk-ant-placeholder
OPENAI_API_KEY=sk-placeholder
PINECONE_API_KEY=placeholder
PINECONE_ENVIRONMENT=us-east-1-aws
PINECONE_INDEX_NAME=legal-knowledge
NODE_ENV=production
LOG_LEVEL=info
PORT=3000
```

### Step 2: Add Redis Database

1. In your Railway project, click **+ New**
2. Select **Database** → **Redis**
3. Railway auto-creates `REDIS_URL` variable

### Step 3: Redeploy

Railway should auto-redeploy. If not:
1. Go to **Deployments** tab
2. Click the three dots on latest deployment
3. Click **Redeploy**

### Step 4: Check Logs

Go to **Deployments** → Click on the deployment → View logs

**If you see:** "Listening on port 3000" → ✅ Success!
**If crashes:** Copy error message and I'll help fix it

### Step 5: Get Real API Keys (After It's Running)

Once Winston is deployed with placeholders, replace them with real keys:

1. **Anthropic**: https://console.anthropic.com/settings/keys
2. **OpenAI**: https://platform.openai.com/api-keys
3. **Pinecone**: https://app.pinecone.io (create index first)

Update the variables in Railway, it will auto-redeploy.

---

## 🚨 Emergency: Can't Get Railway to Work?

Use **Render** instead - it's even easier:

### Deploy to Render (5 Minutes)

1. Go to https://render.com
2. Sign up with GitHub
3. **New** → **Web Service**
4. Connect your **Winston** repository
5. Configure:
   - **Name**: winston-legal-ai
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/index.js`
   - **Plan**: Free
6. Add environment variables (same as above)
7. Click **Create Web Service**

Render gives you: `https://winston-legal-ai.onrender.com`

---

## 🎯 Simplest Solution: Just Tell Me Your Status

Tell me which of these applies:

**A)** "I'm on Railway dashboard but don't know what to do"
   → I'll give you exact click-by-click instructions

**B)** "I don't have API keys yet"
   → I'll guide you to get them (takes 5 minutes total)

**C)** "I want to use Render instead"
   → I'll set up Render deployment files

**D)** "I want to skip hosting and just test Winston locally first"
   → I'll help you run Winston on your machine

Which one?

---

## 📋 What I've Already Done For You

✅ Fixed package.json engines
✅ Created Procfile for Railway
✅ Created .railwayignore
✅ Committed all files
✅ Ready to deploy

**Next:** You just need to:
1. Add environment variables to Railway (2 minutes)
2. Wait for deploy (2 minutes)
3. Get URL
4. Update Slack

That's it!
