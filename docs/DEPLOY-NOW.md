# 🚀 Deploy NOW - Quick Action Guide

## ✅ Step 1: DONE - Code Pushed to GitHub

Your code is now on GitHub at: https://github.com/spinbased/Winston

```
✅ 4 commits pushed successfully
✅ Railway configuration updated (minimal mode)
✅ Comprehensive documentation added
```

---

## 🎯 Step 2: Configure Railway Environment Variables (DO THIS NOW)

### Open Railway Dashboard
1. Go to: **https://railway.app/dashboard**
2. Find your project (should be named "Winston" or similar)
3. Click on the **service** (not Redis if you have it)
4. Click the **"Variables"** tab

### Add These 2 Required Variables

Click **"+ New Variable"** and add:

#### Variable 1: SLACK_BOT_TOKEN
```
Name: SLACK_BOT_TOKEN
Value: xoxb-your-actual-token-here
```

**Where to get it:**
1. Go to: https://api.slack.com/apps
2. Click on your app (Winston or Legal Bot)
3. Go to: **"OAuth & Permissions"** (left sidebar)
4. Copy the **"Bot User OAuth Token"** (starts with `xoxb-`)

#### Variable 2: SLACK_SIGNING_SECRET
```
Name: SLACK_SIGNING_SECRET
Value: your-actual-secret-here
```

**Where to get it:**
1. Same Slack app page: https://api.slack.com/apps
2. Go to: **"Basic Information"** (left sidebar)
3. Scroll to **"App Credentials"** section
4. Copy the **"Signing Secret"** (click "Show" if hidden)

### Save Variables
- Railway will **automatically redeploy** when you add variables
- Wait 30-60 seconds for deployment to complete

---

## 🔍 Step 3: Monitor Deployment (CHECK LOGS)

### View Railway Logs
1. In your Railway project
2. Click **"Deployments"** tab
3. Click the latest deployment (top of list)
4. View the **"Deploy Logs"**

### Expected Success Messages
Look for these in the logs:
```
✅ npm install - completed
✅ npm run build - completed
✅ Build completed successfully
✅ Starting deployment...
⚡️ Winston minimal mode running on port 3000
📡 Slack events at /slack/events
🏥 Health check at /health
```

### If You See Errors
Look for:
- ❌ "Application failed to respond" → Check PORT variable
- ❌ "Redis connection error" → IGNORE (we're using minimal mode)
- ❌ "Missing environment variable" → Add SLACK_BOT_TOKEN and SLACK_SIGNING_SECRET

---

## 🔗 Step 4: Update Slack Request URL

### Get Your Railway URL
1. In Railway project, click on your service
2. Go to **"Settings"** tab
3. Copy the **"Public Domain"** URL (e.g., `https://your-app.up.railway.app`)

### Update Slack
1. Go to: https://api.slack.com/apps
2. Select your app
3. Go to: **"Event Subscriptions"** (left sidebar)
4. Turn **ON** the toggle if not already
5. Set **"Request URL"** to: `https://your-railway-url.up.railway.app/slack/events`
6. Wait for the green **"Verified ✓"** checkmark

### If Verification Fails
- Check Railway logs to see if requests are coming in
- Verify SLACK_SIGNING_SECRET is correct
- Make sure Railway deployment is running (check health endpoint)
- Try: `curl https://your-app.up.railway.app/health` (should return JSON)

---

## 🧪 Step 5: Test Your Bot

### In Slack
Type in any channel where the bot is installed:
```
/legal-help
```

### Expected Response
```
✅ Winston is running! Add API keys to enable full features.
```

### If Command Doesn't Work
1. **Check bot is installed in workspace:**
   - Go to Slack app settings
   - "Install App" → Click "Reinstall to Workspace"

2. **Check slash command is registered:**
   - In Slack app settings
   - "Slash Commands" → Should see `/legal-help`
   - If not, click "Create New Command":
     - Command: `/legal-help`
     - Request URL: `https://your-railway-url.up.railway.app/slack/commands`
     - Description: "Ask legal questions"
     - Save

3. **Check Railway logs** for incoming requests

---

## ✅ Deployment Verification Checklist

Complete these checks:

- [ ] **GitHub**: Code pushed successfully to main branch
- [ ] **Railway Variables**: SLACK_BOT_TOKEN added
- [ ] **Railway Variables**: SLACK_SIGNING_SECRET added
- [ ] **Railway Deployment**: Shows "Success" status
- [ ] **Railway Logs**: Shows "Winston minimal mode running"
- [ ] **Health Check**: `curl https://your-app.up.railway.app/health` returns 200 OK
- [ ] **Slack Request URL**: Shows green "Verified ✓" checkmark
- [ ] **Slack Command**: `/legal-help` responds in Slack
- [ ] **No Errors**: Check Railway logs for any errors

---

## 🎉 Success Criteria

Your deployment is successful when:
1. ✅ Railway shows "Deployed" with green status
2. ✅ Health endpoint returns: `{"status":"ok","message":"Winston minimal mode"}`
3. ✅ Slack verification shows green checkmark
4. ✅ `/legal-help` command works in Slack

---

## 🔧 Quick Troubleshooting

### Issue: Railway Build Fails
```bash
# Check the build logs in Railway
# Common fix: Ensure package.json has all dependencies
# Verify: npm run build works locally
```

### Issue: Health Check Fails
```bash
# Test manually:
curl https://your-railway-url.up.railway.app/health

# Should return:
{"status":"ok","message":"Winston minimal mode"}
```

### Issue: Slack Verification Fails
- **Verify SLACK_SIGNING_SECRET is correct** (no extra spaces)
- **Check Railway is running** (not crashed)
- **Try reinstalling the Slack app** to workspace

### Issue: Bot Doesn't Respond
- **Check bot is invited to channel**: Type `@Winston` (or your bot name)
- **Verify slash command exists** in Slack app settings
- **Check Railway logs** for incoming webhook events

---

## 📞 Support Resources

### Railway
- Dashboard: https://railway.app/dashboard
- Docs: https://docs.railway.com
- Logs: Click your service → Deployments → View logs

### Slack
- App Dashboard: https://api.slack.com/apps
- Bot manifest: Check "App Manifest" for configuration
- Test & troubleshoot: "Install App" → Reinstall

### Your Documentation
- Quick Fix: `docs/RAILWAY-QUICK-FIX.md`
- Environment Variables: `docs/RAILWAY-ENV-CHECKLIST.md`
- Full Deployment: `docs/DEPLOYMENT-CHECKLIST.md`

---

## 🚀 Next Steps After Successful Deployment

### Current Status: Minimal Mode
- ✅ Basic Slack bot working
- ✅ URL verification successful
- ✅ `/legal-help` command responds
- ❌ No session memory (no Redis)
- ❌ No AI responses (no Claude API)
- ❌ No legal knowledge (no RAG)

### Upgrade to Full Features

**Step 1: Add Redis (Session Management)**
- Follow: `docs/RAILWAY-QUICK-FIX.md` → "Option A: Add Redis Service"
- Cost: ~$5/month
- Enables: Session memory, conversation context

**Step 2: Add Claude AI (AI Responses)**
- Get API key: https://console.anthropic.com
- Add to Railway: `ANTHROPIC_API_KEY=sk-ant-...`
- Enables: Smart legal AI responses

**Step 3: Add Pinecone (Legal Knowledge Base)**
- Get API key: https://www.pinecone.io
- Add to Railway: `PINECONE_API_KEY=...`
- Enables: Legal definitions, constitutional knowledge

---

## 📊 Deployment Status

**Git Push:** ✅ COMPLETE
**Railway Config:** ✅ COMPLETE
**Documentation:** ✅ COMPLETE

**YOUR ACTION REQUIRED:**
1. ⏳ Add Railway environment variables (2 variables)
2. ⏳ Update Slack Request URL
3. ⏳ Test `/legal-help` command

**Time to Complete:** ~5 minutes

---

**Last Updated:** 2025-11-02
**Version:** Minimal Mode (No Redis)
**Status:** Ready for final configuration ✅
