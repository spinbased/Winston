# ⚡ Quick Slack Bot Setup - 5 Minutes

## 🎯 You Are Here
- ✅ Railway deployment is live
- ✅ Environment variables configured
- ⏳ Need to configure Slack bot settings

---

## 📋 What You Need

1. **Your Railway URL** - Get this from Railway Dashboard
   - Go to: https://railway.app/dashboard
   - Click your service → **Settings** tab → Copy **Public Domain**
   - Example: `https://winston-production.up.railway.app`

2. **Slack App Dashboard** - Configure bot here
   - Go to: https://api.slack.com/apps
   - Click on your app (Winston or Legal Bot)

---

## 🚀 5-Step Setup Process

### Step 1: Configure OAuth & Permissions (2 minutes)

1. In Slack App Dashboard, click **"OAuth & Permissions"** (left sidebar)
2. Scroll to **"Scopes"** → **"Bot Token Scopes"**
3. Click **"Add an OAuth Scope"** and add these **11 scopes**:

**Required Scopes:**
```
✅ app_mentions:read      - Respond when @mentioned
✅ channels:history       - Read channel messages
✅ channels:read          - View channel info
✅ chat:write             - Send messages
✅ commands               - Use slash commands
✅ groups:history         - Read private channel messages
✅ groups:read            - View private channels
✅ im:history             - Read DM history
✅ im:read                - View DMs
✅ im:write               - Send DMs
✅ users:read             - View user info
```

4. **Don't install yet** - Configure other settings first

---

### Step 2: Enable Event Subscriptions (2 minutes)

1. Click **"Event Subscriptions"** (left sidebar)
2. Toggle **"Enable Events"** to **ON**
3. Set **"Request URL"** to:
   ```
   https://YOUR-RAILWAY-URL.up.railway.app/slack/events
   ```
   Replace `YOUR-RAILWAY-URL` with your actual Railway domain

4. **Wait for verification** - You should see:
   ```
   ✅ Verified
   ```

   **If verification fails:**
   - Check Railway deployment is running (no crashes in logs)
   - Verify `SLACK_SIGNING_SECRET` is correct in Railway
   - Try the health check: `curl https://your-railway-url.up.railway.app/health`

5. Scroll to **"Subscribe to bot events"** and add these **3 events**:
   ```
   ✅ app_mention          - When someone @mentions the bot
   ✅ message.channels     - Messages in public channels
   ✅ message.im           - Direct messages to bot
   ```

6. Click **"Save Changes"** (bottom right)

---

### Step 3: Add Slash Commands (2 minutes)

1. Click **"Slash Commands"** (left sidebar)
2. Click **"Create New Command"**

**Command 1: /legal-help**
```
Command: /legal-help
Request URL: https://YOUR-RAILWAY-URL.up.railway.app/slack/commands
Short Description: Ask the AI legal assistant any legal question
Usage Hint: [your legal question]
```
Click **"Save"**

**Optional: Add more commands later**
- `/constitutional [topic]` - US Constitution search
- `/define [term]` - Black's Law Dictionary
- `/defend-rights` - Legal defense guidance
- `/sovereign-rights` - Sovereign citizenship info

---

### Step 4: Enable Interactivity (30 seconds)

1. Click **"Interactivity & Shortcuts"** (left sidebar)
2. Toggle **"Interactivity"** to **ON**
3. Set **"Request URL"** to:
   ```
   https://YOUR-RAILWAY-URL.up.railway.app/slack/interactions
   ```
4. Click **"Save Changes"**

---

### Step 5: Install to Workspace (30 seconds)

1. Click **"Install App"** (left sidebar)
2. Click **"Install to Workspace"** (or "Reinstall to Workspace")
3. Review permissions and click **"Allow"**
4. ✅ Your bot is now installed!

**Copy the Bot User OAuth Token:**
- Should start with `xoxb-...`
- **Verify** this matches the token in your Railway variables
- If different, update Railway with the new token

---

## 🧪 Test Your Bot (1 minute)

### Test 1: Slash Command
In any Slack channel:
```
/legal-help what is due process?
```

**Expected Response:**
```
✅ Winston is running! Add API keys to enable full features.
```
(Or a legal response if you have ANTHROPIC_API_KEY configured)

### Test 2: Direct Message
1. Go to Slack → **Apps** section (left sidebar)
2. Find your bot (Winston)
3. Send a DM:
   ```
   Hello Winston!
   ```

**Expected Response:**
Bot should acknowledge or respond

### Test 3: @Mention
In a channel where bot is present:
```
@Winston what can you help me with?
```

**Expected Response:**
Bot should respond with capabilities

---

## ✅ Setup Complete Checklist

Verify all these are done:

- [ ] **OAuth Scopes**: 11 scopes added
- [ ] **Event Subscriptions**: Enabled with Railway URL
- [ ] **Event Subscriptions**: Shows "✅ Verified" checkmark
- [ ] **Bot Events**: 3 events subscribed (`app_mention`, `message.channels`, `message.im`)
- [ ] **Slash Command**: `/legal-help` created with Railway URL
- [ ] **Interactivity**: Enabled with Railway URL
- [ ] **App Installed**: Installed to workspace
- [ ] **Token Verified**: Bot token in Railway matches Slack
- [ ] **Test Passed**: `/legal-help` responds in Slack
- [ ] **DM Test Passed**: Bot responds to direct messages
- [ ] **Mention Test Passed**: Bot responds to @mentions

---

## 🔍 Verification Commands

### Check Railway Deployment
```bash
curl https://your-railway-url.up.railway.app/health
```
Should return:
```json
{"status":"ok","message":"Winston minimal mode"}
```

### Check Railway Logs
1. Railway Dashboard → Your Service
2. **Deployments** tab → Latest deployment
3. Look for:
   ```
   ⚡️ Winston minimal mode running on port 3000
   📡 Slack events at /slack/events
   ```

### Test Slack Webhook
From terminal:
```bash
curl -X POST https://your-railway-url.up.railway.app/slack/events \
  -H "Content-Type: application/json" \
  -d '{"type":"url_verification","challenge":"test123"}'
```
Should echo back the challenge.

---

## 🆘 Troubleshooting

### Issue: URL Verification Fails

**Symptoms:**
- Red X or "Cannot verify" error
- Request URL won't save

**Solutions:**
1. **Check Railway is running**
   ```bash
   curl https://your-railway-url.up.railway.app/health
   ```
   Should return 200 OK

2. **Verify SLACK_SIGNING_SECRET**
   - Go to Slack App → Basic Information
   - Copy Signing Secret (click "Show")
   - Compare with Railway variable
   - Update Railway if different

3. **Check Railway logs for errors**
   - Look for "signature verification failed"
   - Look for crashed processes

4. **Try reinstalling app**
   - Slack App → Install App → Reinstall

---

### Issue: Commands Don't Respond

**Symptoms:**
- `/legal-help` does nothing
- "Command failed" error

**Solutions:**
1. **Verify slash command exists**
   - Slack App → Slash Commands
   - Should see `/legal-help` listed
   - Request URL should point to Railway

2. **Check command Request URL**
   - Should be: `https://your-railway-url.up.railway.app/slack/commands`
   - Note: `/slack/commands` not `/slack/events`

3. **Reinstall app to workspace**
   - Updates command configuration

4. **Check Railway logs**
   - Look for incoming POST requests
   - Check for errors in command handler

---

### Issue: Bot Doesn't Respond to Messages

**Symptoms:**
- DMs ignored
- @mentions ignored

**Solutions:**
1. **Verify bot events are subscribed**
   - Slack App → Event Subscriptions → Bot Events
   - Should have: `message.im`, `app_mention`, `message.channels`

2. **Check OAuth scopes**
   - Need: `im:history`, `im:read`, `channels:history`, `app_mentions:read`

3. **Invite bot to channel** (for channel messages)
   - Type: `/invite @Winston` in channel

4. **Check Railway logs**
   - Should see incoming webhook events
   - Look for message processing

---

## 🎉 Success!

When everything works, you should see:

**In Slack:**
- ✅ `/legal-help` responds
- ✅ Bot responds to DMs
- ✅ Bot responds to @mentions
- ✅ No error messages

**In Railway Logs:**
- ✅ No crash errors
- ✅ Incoming webhook events logged
- ✅ "Winston minimal mode running"

---

## 🚀 Next Steps

### Current: Minimal Mode
- ✅ Basic Slack connectivity
- ✅ Simple responses
- ❌ No session memory
- ❌ No AI legal analysis

### Upgrade: Add AI (Recommended)

**Add to Railway Variables:**
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Get key from: https://console.anthropic.com

**Result:** Winston will provide intelligent legal analysis!

### Upgrade: Add Redis (For Sessions)

Follow: `docs/RAILWAY-QUICK-FIX.md` → "Add Redis Service"

**Result:** Winston remembers conversation context!

### Full Setup: Add All Features

See: `docs/SLACK-BOT-SETUP-COMPLETE.md` for comprehensive configuration

---

## 📚 Additional Documentation

- **Complete Setup**: `docs/SLACK-BOT-SETUP-COMPLETE.md` (23KB, 772 lines)
- **Railway Config**: `docs/RAILWAY-QUICK-FIX.md`
- **Environment Vars**: `docs/RAILWAY-ENV-CHECKLIST.md`
- **Troubleshooting**: `docs/DEPLOYMENT-CHECKLIST.md`

---

## 🔗 Quick Links

- **Slack App Dashboard**: https://api.slack.com/apps
- **Railway Dashboard**: https://railway.app/dashboard
- **Anthropic API Keys**: https://console.anthropic.com
- **Slack API Docs**: https://api.slack.com/docs

---

**Setup Time:** ~5 minutes
**Difficulty:** Easy
**Status:** Ready to configure ✅
