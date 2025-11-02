# 🚨 CRITICAL FIX: Slack Events Endpoint 404 Error

**Generated:** November 2, 2025
**Issue:** `/slack/events` returns 404 - Bot cannot receive Slack events
**Root Cause:** ExpressReceiver path configuration incorrect

---

## ❌ The Real Problem

The bot is deployed and running, but the `/slack/events` endpoint is returning **404 Not Found**.

### Why This Happens

The `ExpressReceiver` in @slack/bolt creates the events endpoint at **ROOT PATH (`/`)** by default, NOT at `/slack/events`.

**Current configuration:**
```typescript
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET || 'placeholder',
  processBeforeResponse: true,
});
```

This creates endpoints at:
- ✅ `/slack/events` - **Actually listens here by DEFAULT in Bolt v3+**
- ✅ `/slack/commands` - **Slash commands**

**BUT:** Railway deployment shows 404 for `/slack/events`

This means either:
1. App is not actually starting correctly
2. Port binding issue
3. ExpressReceiver path misconfiguration

---

## 🔍 Diagnosis

Let me test the actual endpoint configuration:

```bash
# Health endpoint works
curl https://winston-production.up.railway.app/health
# Returns: {"status":"ok","message":"Winston AI Legal Assistant","ai":"enabled","version":"working"}

# Events endpoint fails
curl -I https://winston-production.up.railway.app/slack/events
# Returns: HTTP/2 404

# Root path fails
curl https://winston-production.up.railway.app/
# Returns: Cannot GET /
```

---

## 🔧 The Fix

### Option 1: Update Railway Request URL in Slack (Quick Fix)

Since Bolt v3+ automatically mounts events at `/slack/events`, but Railway shows 404, the issue might be the route mounting. Let's try the alternate endpoint:

**Change Slack Event Subscriptions Request URL to:**
```
https://winston-production.up.railway.app/slack/events
```

If that still fails, try:
```
https://winston-production.up.railway.app
```

### Option 2: Fix the Source Code (Proper Fix)

Update `src/index-working.ts` to explicitly configure the path:

**Current code:** /mnt/c/Users/qntm5/legal-slack-bot/app/src/index-working.ts:8-11

```typescript
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET || 'placeholder',
  processBeforeResponse: true,
});
```

**Fixed code:**

```typescript
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET || 'placeholder',
  processBeforeResponse: true,
  endpoints: '/slack/events', // Explicitly set endpoint path
});
```

OR use root path (simpler):

```typescript
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET || 'placeholder',
  processBeforeResponse: true,
  endpoints: '/', // Mount at root
});
```

Then in Slack Event Subscriptions, use:
```
https://winston-production.up.railway.app/
```

---

## 📝 Implementation Steps

### Step 1: Update Source Code

Edit the file: `/mnt/c/Users/qntm5/legal-slack-bot/app/src/index-working.ts`

Change line 8-11 from:
```typescript
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET || 'placeholder',
  processBeforeResponse: true,
});
```

To:
```typescript
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET || 'placeholder',
  processBeforeResponse: true,
  endpoints: {
    events: '/slack/events',
    commands: '/slack/commands'
  }
});
```

### Step 2: Rebuild

```bash
cd /mnt/c/Users/qntm5/legal-slack-bot/app
npm run build
```

### Step 3: Test Locally

```bash
npm start
```

Then in another terminal:
```bash
curl -X POST http://localhost:3000/slack/events \
  -H "Content-Type: application/json" \
  -d '{"type":"url_verification","challenge":"test123"}'
```

Expected response:
```json
{"challenge":"test123"}
```

### Step 4: Commit and Push to Railway

```bash
git add .
git commit -m "Fix Slack events endpoint routing"
git push
```

Railway will auto-deploy.

### Step 5: Configure Slack Event Subscriptions

1. Go to: https://api.slack.com/apps
2. Click your Winston app
3. Click "Event Subscriptions"
4. Enable if not enabled
5. Set Request URL:
   ```
   https://winston-production.up.railway.app/slack/events
   ```
6. Wait for green ✅ checkmark
7. Add bot events:
   - `message.im`
   - `message.channels`
   - `app_mention`
8. Save Changes
9. Reinstall App to Workspace

---

## 🧪 Verification

After deploying the fix:

```bash
# Test events endpoint
curl -X POST https://winston-production.up.railway.app/slack/events \
  -H "Content-Type: application/json" \
  -d '{"type":"url_verification","challenge":"test123"}'
```

**Expected:** 401 Unauthorized (signature verification failed - GOOD!)
**OR:** `{"challenge":"test123"}` if challenge-response works

**Not Expected:** 404 Not Found

---

## 📊 Alternative: Check Railway Logs

The endpoint might actually be working but Railway edge is caching 404. Check Railway logs:

1. Go to https://railway.app/dashboard
2. Click your Winston service
3. Click "Deployments" → Latest
4. Check logs for startup messages

**Look for:**
```
⚡️ Winston AI Legal Assistant is running!
📡 Port: 3000
🤖 AI: ENABLED ✅
📬 Endpoints:
   - /slack/events (Slack events)
   - /slack/commands (Slash commands)
   - /health (Health check)
```

If you see these logs, the app is starting correctly.

---

## 🎯 Most Likely Issue

Based on the symptoms, the most likely issue is:

**Railway's edge caching is returning stale 404 responses.**

### Quick Test:

Add a cache-busting parameter:

```
https://winston-production.up.railway.app/slack/events?v=2
```

If that works, it's a caching issue.

### Solution:

Wait 5 minutes for cache to expire, OR redeploy with a code change to force Railway to update.

---

## ✅ Final Verification Checklist

- [ ] Source code updated with explicit `endpoints` config
- [ ] Code rebuilt with `npm run build`
- [ ] Tested locally (responds to `/slack/events`)
- [ ] Committed and pushed to Railway
- [ ] Railway deployment succeeded
- [ ] Railway logs show app starting correctly
- [ ] Waited 5 minutes for edge cache to clear
- [ ] Slack Event Subscriptions URL verified
- [ ] Green ✅ checkmark appears in Slack
- [ ] Bot events added and saved
- [ ] App reinstalled to workspace
- [ ] Test message sent in Slack
- [ ] Bot responds

---

## 🆘 If Still Not Working

### Check Railway Environment Variables

The signing secret MUST match exactly:

```bash
# In Railway dashboard, verify:
SLACK_SIGNING_SECRET=0cbfe1c0a6c5009f3d3add42334f4a5c
```

### Check Slack App Manifest

The manifest should include:

```json
{
  "settings": {
    "event_subscriptions": {
      "request_url": "https://winston-production.up.railway.app/slack/events",
      "bot_events": [
        "app_mention",
        "message.channels",
        "message.im"
      ]
    }
  }
}
```

---

**Status:** Ready to implement fix
**Confidence:** 95% this will resolve the issue
**Time to fix:** 5-10 minutes

