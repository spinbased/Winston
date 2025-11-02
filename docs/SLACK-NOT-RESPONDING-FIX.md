# Bot Not Responding to Messages - Fix

## ✅ You Can Send Messages Now
Great! App Home Messages Tab is enabled.

## ❌ Bot Not Responding
The bot receives messages but doesn't respond.

---

## 🔍 Quick Diagnostic Checklist

### Step 1: Check Event Subscriptions Are SAVED

Go to: https://api.slack.com/apps → Your App → **Event Subscriptions**

**Verify ALL of these:**

1. **Toggle is ON** ✅
2. **Request URL shows "Verified ✓"** ✅
3. **Scroll down to "Subscribe to bot events"**
4. **These 3 events MUST be there:**
   - [ ] `message.im` - Direct messages
   - [ ] `message.channels` - Channel messages
   - [ ] `app_mention` - When @mentioned

5. **Click "Save Changes" at bottom** (CRITICAL - changes don't save automatically!)

---

### Step 2: Reinstall the App

**IMPORTANT:** After adding events, you MUST reinstall!

1. Go to: https://api.slack.com/apps → Your App
2. Click **"Install App"** (left sidebar)
3. Click **"Reinstall to Workspace"**
4. Click **"Allow"**

---

### Step 3: Check Railway Logs

This tells us if Slack is sending events:

1. Go to: https://railway.app/dashboard
2. Click your service
3. Click **"Deployments"** tab
4. Click latest deployment
5. **Look for logs** when you send a message

**What you should see:**
```
[DM] Received: "your message"
POST /slack/events - 200
```

**If you DON'T see POST requests:**
- Events aren't configured properly
- Events weren't saved
- App wasn't reinstalled

**If you see errors:**
- 401 = Wrong signing secret
- 500 = Server error (code issue)

---

### Step 4: Test Slash Command First

Does this work?
```
/legal-help test
```

**If YES:** Bot works, events are the issue
**If NO:** Bot has deeper problems

---

## 🔧 Common Fixes

### Fix #1: Events Not Saved
**Problem:** You added events but didn't click "Save Changes"

**Solution:**
1. Event Subscriptions → Add bot events
2. Scroll to BOTTOM of page
3. Click **"Save Changes"**
4. Reinstall app

---

### Fix #2: App Not Reinstalled
**Problem:** New events require reinstall

**Solution:**
1. Install App → Reinstall to Workspace
2. Click Allow
3. Try messaging again

---

### Fix #3: Wrong Event Types
**Problem:** Wrong events subscribed

**Required Events:**
- `message.im` (NOT `message` - must be `message.im`)
- `message.channels` (for public channels)
- `app_mention` (for @mentions)

---

### Fix #4: Bot Filtering Own Messages
**Problem:** Code filters subtypes

**Check code has:**
```typescript
app.message(async ({ message, say }) => {
  if (message.subtype) return; // Skip bot messages
  // ... handle message
});
```

---

### Fix #5: Railway Environment Issue
**Problem:** Missing ANTHROPIC_API_KEY

**Check Railway Variables:**
1. Railway → Service → Variables
2. Verify `ANTHROPIC_API_KEY` is set
3. Should start with `sk-ant-`

---

## 🧪 Debug Steps

### Test 1: Send Test Event

From terminal:
```bash
curl -X POST https://winston-production.up.railway.app/slack/events \
  -H "Content-Type: application/json" \
  -H "X-Slack-Signature: test" \
  -H "X-Slack-Request-Timestamp: $(date +%s)" \
  -d '{
    "type": "url_verification",
    "challenge": "test123"
  }'
```

**Should return:** `test123`

---

### Test 2: Check Health
```bash
curl https://winston-production.up.railway.app/health
```

**Should show:**
```json
{"status":"ok","message":"Winston AI Legal Assistant","ai":"enabled","version":"working"}
```

---

### Test 3: Check Recent Events in Slack

1. Slack App → Event Subscriptions
2. Scroll to bottom: **"Recent Events"**
3. Shows delivery status of recent events

**Look for:**
- Your test message events
- Status codes (200 = success, 401 = auth error, 500 = server error)

---

## 🎯 Most Likely Issue

**You added the events but didn't click "Save Changes" at the bottom of the Event Subscriptions page.**

### Fix Right Now:
1. Go to Event Subscriptions
2. Verify `message.im`, `message.channels`, `app_mention` are listed
3. **Scroll to bottom**
4. Click **"Save Changes"**
5. Go to Install App → **Reinstall to Workspace**
6. Test again in Slack

---

## 📊 Verification Checklist

Before testing again, confirm:

- [ ] Event Subscriptions toggle: **ON**
- [ ] Request URL: **✅ Verified**
- [ ] Bot events added: `message.im`, `message.channels`, `app_mention`
- [ ] **"Save Changes" clicked** at bottom
- [ ] App **reinstalled** to workspace
- [ ] Slack reloaded (Ctrl+R or Cmd+R)
- [ ] Railway logs show no errors
- [ ] Health check shows `"ai":"enabled"`

---

## 🆘 Still Not Working?

### Share These Details:

1. **Railway Logs** (when you send a message)
   - Do you see `POST /slack/events`?
   - What status code?

2. **Slack Event Subscriptions**
   - Screenshot of "Subscribe to bot events" section
   - Does it show the 3 events?

3. **Slack Recent Events**
   - Any events showing up?
   - What status codes?

4. **Does slash command work?**
   - `/legal-help test`
   - Does it respond?

---

**Most common fix: Add events → Save Changes → Reinstall app!** 🎯
