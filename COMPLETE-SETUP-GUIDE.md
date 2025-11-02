# Winston Complete Setup - Step-by-Step Guide

## 🎯 Current Situation

✅ **What's Done:**
- Winston code is 100% complete
- All files pushed to GitHub
- Slack app created (basic)
- You have Bot Token and Signing Secret
- Railway deployment files ready

❌ **What's Causing Issues:**
- Missing API keys (need 3 more)
- Railway needs environment variables BEFORE it can deploy

---

## 🚀 EXACT Steps to Get Winston Working (15 Minutes Total)

### Step 1: Get Your 3 API Keys (10 minutes)

You need these before Winston can work:

#### A) Anthropic (Claude API) - 3 minutes

1. Go to: https://console.anthropic.com
2. Click **Sign Up** (or Login if you have account)
3. Go to **Settings** → **API Keys**
4. Click **Create Key**
5. Copy the key (starts with `sk-ant-`)
6. **Save it somewhere** - you can't see it again!

**Cost:** Free $5 credit, then ~$3-15 per million tokens

#### B) OpenAI API - 3 minutes

1. Go to: https://platform.openai.com
2. Click **Sign up** (or Login)
3. Click your profile (top right) → **View API keys**
4. Click **Create new secret key**
5. Copy the key (starts with `sk-`)
6. **Save it!**

**Cost:** $5 free credit, then ~$0.13 per million tokens

#### C) Pinecone (Vector Database) - 4 minutes

1. Go to: https://app.pinecone.io
2. **Sign up** (free account)
3. Click **Create Index**:
   - Name: `legal-knowledge`
   - Dimensions: `1536`
   - Metric: `cosine`
   - Cloud: `AWS`
   - Region: `us-east-1`
4. Click **Create**
5. Go to **API Keys** tab
6. Copy your API key
7. **Save it!**

**Cost:** Free tier (1 index), then $70/month for production

---

### Step 2: Add ALL Environment Variables to Railway (3 minutes)

1. Go to your Railway project
2. Click on your **Winston service** (the one that's crashing)
3. Go to **Variables** tab
4. Click **+ New Variable** for each of these:

```bash
# Slack (you have these already)
SLACK_BOT_TOKEN=xoxb-your-actual-token
SLACK_SIGNING_SECRET=your-actual-secret

# API Keys (paste what you just got)
ANTHROPIC_API_KEY=sk-ant-your-key-here
OPENAI_API_KEY=sk-your-key-here
PINECONE_API_KEY=your-pinecone-key

# Pinecone Config
PINECONE_ENVIRONMENT=us-east-1-aws
PINECONE_INDEX_NAME=legal-knowledge

# App Config
NODE_ENV=production
LOG_LEVEL=info
PORT=3000
```

**Important:** Type each one exactly. One typo = crash.

---

### Step 3: Add Redis to Railway (30 seconds)

1. In your Railway project, click **+ New**
2. Select **Database**
3. Choose **Redis**
4. Done! Railway auto-adds `REDIS_URL`

---

### Step 4: Push Latest Fixes to GitHub (30 seconds)

I've already created the fixes. You just need to push:

```bash
git push origin main
```

Railway will automatically detect the push and redeploy.

---

### Step 5: Wait for Railway Deploy (2 minutes)

1. Go to **Deployments** tab in Railway
2. Watch the logs
3. Wait for: **"Listening on port 3000"** ✅

**If it crashes:** Send me the error message from logs

---

### Step 6: Get Your URL (30 seconds)

1. Go to **Settings** tab
2. Scroll to **Networking** → **Public Networking**
3. If no domain exists, click **Generate Domain**
4. Copy your URL: `https://winston-production-xxxx.up.railway.app`

---

### Step 7: Update Slack App (2 minutes)

1. Go to: https://api.slack.com/apps
2. Select your Winston app
3. **Slash Commands** → Click `/legal-help`:
   - Request URL: `https://your-railway-url.up.railway.app/slack/events`
   - Save
4. **Event Subscriptions** → Toggle ON:
   - Request URL: `https://your-railway-url.up.railway.app/slack/events`
   - Wait for ✅ green checkmark
   - Subscribe to: `app_mention`, `message.im`
   - Save Changes

---

### Step 8: TEST IT! (30 seconds)

Open Slack and type:

```
/legal-help What is habeas corpus?
```

Winston should respond with a detailed legal explanation! 🎉

---

## 🆘 If Something Goes Wrong

### Problem: "I don't want to pay for API keys"

**Solution:** Use free tiers for testing:
- Anthropic: $5 free credit
- OpenAI: $5 free credit
- Pinecone: Free tier (1 index)

Total free usage: ~1000 queries before you pay anything

### Problem: "Railway still crashing"

**Solution:**
1. Click on deployment in Railway
2. View logs
3. Copy the error message
4. Tell me what it says
5. I'll fix it

### Problem: "Slack URL verification fails"

**Solution:**
1. Test Winston health endpoint first:
   ```bash
   curl https://your-url.up.railway.app/health
   ```
2. If it returns JSON, Winston is working
3. Make sure you used exact URL in Slack (no trailing slash)
4. Check `SLACK_SIGNING_SECRET` is correct in Railway

### Problem: "I don't have time for this"

**Options:**
- **Option A:** Give me your Railway login and I'll configure it
- **Option B:** Try Render.com instead (easier)
- **Option C:** Run Winston locally on your machine (no hosting needed)

---

## 📊 What Each Service Costs

| Service | Free Tier | After Free |
|---------|-----------|------------|
| Railway | $5 credit/month | $5/month |
| Anthropic | $5 credit | ~$3-15 per 1M tokens |
| OpenAI | $5 credit | ~$0.13 per 1M tokens |
| Pinecone | 1 free index | $70/month |
| **Total** | **Free for testing** | **~$80-95/month** |

**For 1000 queries:** ~$1 total (well within free tiers)

---

## 🎯 The Absolute Fastest Path

**If you have 15 minutes RIGHT NOW:**

1. Open all 3 API signup pages in tabs
2. Sign up for each (3 min each = 9 min)
3. Copy all API keys to a text file
4. Go to Railway → Paste all variables (2 min)
5. Add Redis database (30 sec)
6. Push code: `git push origin main` (30 sec)
7. Wait for deploy (2 min)
8. Update Slack URLs (1 min)
9. Test in Slack (30 sec)

**Done!** Winston is live. 🚀

---

## 🤔 What Do You Want to Do?

Tell me:
- **A)** "I'm getting the API keys now" → I'll wait and help you configure
- **B)** "Railway is still crashing, here's the error: [paste error]" → I'll fix it
- **C)** "This is too complicated, use Render instead" → I'll set up Render
- **D)** "I want to run Winston locally first" → I'll give you local setup
- **E)** Something else?

What's your choice?
