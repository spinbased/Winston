# 🔧 Troubleshooting: Bot Not Receiving Messages

## 🎯 Issue
Your bot is deployed and URL verification passed, but the bot doesn't respond to messages in Slack.

---

## ✅ Quick Diagnostic Checklist

Run through these checks in order:

### 1️⃣ Check Event Subscriptions (Most Common Issue)

Go to: https://api.slack.com/apps → Your App → **"Event Subscriptions"**

**Verify:**
- [ ] Toggle is **ON** (enabled)
- [ ] Request URL shows **✅ Verified** (green checkmark)
- [ ] Request URL is: `https://winston-production.up.railway.app/slack/events`

**Check Bot Events (scroll down):**
- [ ] `app_mention` - When @mentioned
- [ ] `message.channels` - Messages in public channels
- [ ] `message.im` - Direct messages

**If events are missing:**
1. Click **"Add Bot User Event"**
2. Search and add each event
3. Click **"Save Changes"** at bottom
4. **Reinstall app to workspace** (Install App → Reinstall)

---

### 2️⃣ Check OAuth Scopes

Go to: https://api.slack.com/apps → Your App → **"OAuth & Permissions"**

**Required Bot Token Scopes:**
- [ ] `app_mentions:read` - Read mentions
- [ ] `channels:history` - Read channel messages
- [ ] `channels:read` - View channel info
- [ ] `chat:write` - Send messages
- [ ] `im:history` - Read DM history
- [ ] `im:read` - View DMs
- [ ] `im:write` - Send DMs
- [ ] `commands` - Slash commands

**If scopes are missing:**
1. Scroll to **"Bot Token Scopes"**
2. Click **"Add an OAuth Scope"**
3. Add missing scopes
4. **Must reinstall app** (Install App → Reinstall to Workspace)

---

### 3️⃣ Invite Bot to Channel

**For channel messages to work:**

1. Go to the Slack channel where you want to test
2. Type: `/invite @Winston` (or your bot name)
3. Or click channel name → Integrations → Add apps → Add your bot

**Verify bot is in channel:**
- You should see: "Winston joined #channel"
- Bot should appear in channel member list

---

### 4️⃣ Test Different Message Types

Try these **in order** to isolate the issue:

#### Test A: Slash Command
```
/legal-help test
```
**Expected:** Bot responds (this works via commands endpoint, not events)

#### Test B: Direct Message
1. Go to Slack → **Apps** section (left sidebar)
2. Click your bot (Winston)
3. Send: `Hello Winston!`

**Expected:** Bot should respond

**If this fails:**
- Check `message.im` event is subscribed
- Check `im:history` and `im:read` scopes exist
- Check Railway logs for incoming events

#### Test C: @Mention in Channel
In a channel where bot is invited:
```
@Winston hello!
```

**Expected:** Bot should respond

**If this fails:**
- Check `app_mention` event is subscribed
- Check `app_mentions:read` scope exists
- Verify bot was invited to channel

#### Test D: Channel Message (Without @)
In a channel where bot is invited:
```
Can someone help me with legal stuff?
```

**Expected:** Bot should respond (if configured to)

**If this fails:**
- Check `message.channels` event is subscribed
- Check `channels:history` scope exists
- **Note:** Bolt requires explicit message handler for this

---

### 5️⃣ Check Railway Logs

**View logs:**
1. Railway Dashboard → Your Service
2. **Deployments** tab → Latest deployment
3. Click **"View Logs"**

**Look for:**

**✅ Good signs:**
```
⚡️ Winston minimal mode running on port 3000
📡 Slack events at /slack/events
POST /slack/events - 200
```

**❌ Bad signs:**
```
POST /slack/events - 401  ← Wrong signing secret
POST /slack/events - 404  ← Endpoint not found
POST /slack/events - 500  ← Server error
No POST requests at all   ← Events not reaching server
```

**If no POST requests appear:**
- Events aren't being sent from Slack
- Check Event Subscriptions are saved
- Reinstall app to workspace

---

### 6️⃣ Verify App Installation

Go to: https://api.slack.com/apps → Your App → **"Install App"**

**Check:**
- [ ] Shows "Installed to [Your Workspace]"
- [ ] Bot User OAuth Token exists (starts with `xoxb-`)
- [ ] Token matches what's in Railway variables

**If not installed or token differs:**
1. Click **"Reinstall to Workspace"**
2. Approve permissions
3. Copy new Bot User OAuth Token
4. Update Railway variable: `SLACK_BOT_TOKEN`

---

## 🔍 Advanced Diagnostics

### Check if Events Are Reaching Railway

**Test from terminal:**
```bash
# This should work (health check)
curl https://winston-production.up.railway.app/health

# This will fail with 401 (expected - no signature)
curl -X POST https://winston-production.up.railway.app/slack/events \
  -H "Content-Type: application/json" \
  -d '{"type":"url_verification","challenge":"test123"}'
```

**Expected Results:**
- Health check: `200 OK` with JSON response
- Events POST: `401 Unauthorized` (because no Slack signature)

**If you get different results:**
- `404 Not Found` → App not deployed correctly
- `502 Bad Gateway` → App crashed, check Railway logs
- Timeout → App not responding, check Railway deployment

---

### Check Slack's Event Delivery

Go to: https://api.slack.com/apps → Your App → **"Event Subscriptions"**

Scroll to bottom: **"Recent Events"** section

**What you should see:**
- Recent events with delivery status
- `200 OK` responses
- Event types being sent

**If you see errors:**
- `401` → Signing secret mismatch (update Railway variable)
- `500` → Server error (check Railway logs)
- No events → Events not configured or bot not invited

---

## 🐛 Common Issues & Solutions

### Issue #1: Bot Only Responds to Slash Commands

**Symptoms:**
- `/legal-help` works ✅
- Direct messages ignored ❌
- @mentions ignored ❌

**Solution:**
1. Check Event Subscriptions are configured
2. Add bot events: `message.im`, `app_mention`
3. Reinstall app to workspace
4. Check Railway logs for incoming events

---

### Issue #2: Bot Works in DMs But Not Channels

**Symptoms:**
- Direct messages work ✅
- Channel messages ignored ❌

**Solution:**
1. **Invite bot to channel**: `/invite @Winston`
2. Add event: `message.channels`
3. Add scope: `channels:history`
4. Reinstall app
5. Try @mention first, then regular message

---

### Issue #3: Bot Worked, Then Stopped

**Symptoms:**
- Bot worked initially
- Now not responding

**Possible causes:**
1. **App was uninstalled/reinstalled** → Check token in Railway
2. **Railway crashed** → Check Railway logs and deployment status
3. **Scopes changed** → Reinstall app
4. **Slack token revoked** → Get new token from Slack

**Solution:**
```bash
# Check Railway is running
curl https://winston-production.up.railway.app/health

# Check Railway logs
# Railway Dashboard → Service → Deployments → View Logs

# Verify tokens match
# Slack: OAuth & Permissions → Bot User OAuth Token
# Railway: Variables → SLACK_BOT_TOKEN
```

---

### Issue #4: 401 Errors in Railway Logs

**Symptoms:**
- Railway logs show: `POST /slack/events - 401`

**Solution:**
Wrong `SLACK_SIGNING_SECRET` in Railway

1. Get correct secret:
   - Slack App → Basic Information → App Credentials
   - Click "Show" next to Signing Secret
   - **Copy carefully** (no spaces)

2. Update Railway:
   - Variables tab → Edit `SLACK_SIGNING_SECRET`
   - Paste new value
   - Railway auto-redeploys

---

### Issue #5: Bot Responds Randomly

**Symptoms:**
- Sometimes works, sometimes doesn't
- Inconsistent behavior

**Possible causes:**
1. **Railway sleeping/cold starts** (unlikely on paid plan)
2. **Multiple app installations** (check only one workspace)
3. **Network timeouts** (Slack expects response in 3 seconds)

**Solution:**
- Check Railway plan (ensure not sleeping)
- Check only one installation exists
- Review Railway logs for timeout errors

---

## 📋 Complete Setup Verification Checklist

Go through this **COMPLETE** checklist:

### Slack Configuration
- [ ] Event Subscriptions: **ON**
- [ ] Request URL: `https://winston-production.up.railway.app/slack/events`
- [ ] Request URL: Shows **✅ Verified**
- [ ] Bot Events Added:
  - [ ] `app_mention`
  - [ ] `message.channels`
  - [ ] `message.im`
- [ ] OAuth Scopes (11 total):
  - [ ] `app_mentions:read`
  - [ ] `channels:history`
  - [ ] `channels:read`
  - [ ] `chat:write`
  - [ ] `commands`
  - [ ] `groups:history`
  - [ ] `groups:read`
  - [ ] `im:history`
  - [ ] `im:read`
  - [ ] `im:write`
  - [ ] `users:read`
- [ ] Slash Command: `/legal-help` configured
- [ ] Interactivity: **ON** with Railway URL
- [ ] App Installed to workspace

### Railway Configuration
- [ ] Deployment status: **Success** (green)
- [ ] Logs show: "Winston minimal mode running"
- [ ] Variables set:
  - [ ] `SLACK_BOT_TOKEN` (starts with `xoxb-`)
  - [ ] `SLACK_SIGNING_SECRET`
- [ ] Health check works: `curl https://winston-production.up.railway.app/health`
- [ ] No errors in logs

### Channel Setup
- [ ] Bot invited to test channel: `/invite @Winston`
- [ ] Bot appears in channel member list
- [ ] Channel is public or bot has private channel access

### Testing
- [ ] `/legal-help` responds ✅
- [ ] Direct message responds ✅
- [ ] @mention in channel responds ✅

---

## 🆘 Still Not Working?

### Next Steps:

1. **Share Railway logs with me:**
   ```bash
   # Copy last 50 lines of logs
   # Railway Dashboard → Service → Deployments → View Logs
   ```

2. **Check current minimal implementation:**
   The minimal version (`index-minimal.ts`) only has:
   - Slash command handler for `/legal-help`
   - No explicit message event handlers

   **To handle messages, you need the full version with AI!**

3. **Upgrade to Full Version:**
   - Add Redis service to Railway
   - Add `ANTHROPIC_API_KEY` to Railway
   - Update railway.json: `"startCommand": "node dist/index.js"`
   - The full version has message handlers

---

## 💡 Important: Minimal vs Full Version

**Current (Minimal Mode):**
```typescript
// Only handles slash commands
app.command('/legal-help', async ({ ack, respond }) => {
  await ack();
  await respond('✅ Winston is running!');
});
```

**Full Version (Handles Messages):**
- Listens to `message` events
- Responds to DMs
- Responds to @mentions
- Has AI-powered responses
- Requires Redis + Claude API

**To get message handling working:**
See: `docs/RAILWAY-QUICK-FIX.md` → Upgrade to Full Version

---

## 📞 Quick Support Commands

### Test Railway:
```bash
curl https://winston-production.up.railway.app/health
```

### Check Slack Events:
Slack App → Event Subscriptions → Recent Events (bottom of page)

### Check Railway Logs:
Railway Dashboard → Service → Deployments → View Logs

### Reinstall Slack App:
Slack App → Install App → Reinstall to Workspace

---

**Most Common Fix:** Add bot events + Reinstall app to workspace! 🎯
