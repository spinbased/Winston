# 🔧 Step-by-Step Fix Guide - Winston Bot Not Responding

**The endpoint is NOW FIXED on Railway (returning 401 instead of 404).**
**Now you MUST configure Slack to send events to that endpoint.**

---

## 🎯 The Issue

Winston bot is not responding because **Slack is not sending message events to Railway**.

### Why?
Even though the Railway deployment is working perfectly, Slack doesn't know to send events unless you:
1. Enable Event Subscriptions
2. Add the 3 required bot events
3. Reinstall the app to activate the new events

---

## ✅ Step-by-Step Solution (Follow EXACTLY)

### STEP 1: Open Slack App Settings

1. Open your web browser
2. Go to: **https://api.slack.com/apps/A09QL5XGC6M**
3. You should see "Winston AI" app dashboard

**Screenshot checkpoint:**
- You should see "Winston AI" at the top
- Left sidebar with options like "Basic Information", "Event Subscriptions", etc.

---

### STEP 2: Event Subscriptions Configuration

1. Click **"Event Subscriptions"** in the left sidebar

2. Check the toggle at the top:
   - **If it's OFF (gray):** Click it to turn it ON (green)
   - **If it's already ON:** Good, continue

3. Look for **"Request URL"** field

4. In the Request URL field, enter EXACTLY:
   ```
   https://winston-production.up.railway.app/slack/events
   ```

5. **WAIT** - Slack will send a verification request

6. After a few seconds, you should see:
   - **Green ✅ checkmark** next to the URL
   - Text: "Verified"

**If you see RED X instead:**
- Screenshot the error message
- Go to Railway dashboard and check if deployment is running
- Verify health endpoint works: https://winston-production.up.railway.app/health
- The signing secret might be wrong (see troubleshooting below)

---

### STEP 3: Subscribe to Bot Events

Still on the Event Subscriptions page:

1. Scroll down to the section: **"Subscribe to bot events"**

2. Click the button: **"Add Bot User Event"**

3. A dropdown will appear. Type: **message.im**
   - Select "message.im" from the dropdown
   - Description: "A message was posted in a direct message channel"

4. Click **"Add Bot User Event"** again

5. Type: **message.channels**
   - Select "message.channels" from the dropdown
   - Description: "A message was posted to a channel"

6. Click **"Add Bot User Event"** one more time

7. Type: **app_mention**
   - Select "app_mention" from the dropdown
   - Description: "Subscribe to only the message events that mention your app"

**You should now see 3 events listed:**
- ✅ message.im
- ✅ message.channels
- ✅ app_mention

---

### STEP 4: SAVE CHANGES (CRITICAL!)

1. **Scroll all the way to the BOTTOM** of the Event Subscriptions page

2. You should see a green button: **"Save Changes"**

3. Click **"Save Changes"**

4. Wait for the page to reload/confirm

**If you don't see "Save Changes" button:**
- It means no changes were made
- Go back and verify the 3 events are actually added
- Make sure you clicked "Add" for each event

---

### STEP 5: Reinstall App to Workspace

**This step is REQUIRED! Events don't work without reinstalling.**

1. Click **"Install App"** in the left sidebar

2. You should see a button: **"Reinstall to Workspace"**
   - If you see "Install to Workspace" instead, click that

3. Click the reinstall/install button

4. Slack will show you a permission screen

5. Click **"Allow"**

6. You'll be redirected back to the app settings

**Checkpoint:**
- The "Install App" page should now show:
  - "Installed to: [Your Workspace Name]"
  - Green checkmark
  - Timestamp of when it was installed

---

### STEP 6: Test in Slack

1. **Open Slack desktop app or web app**

2. **Reload Slack:**
   - Windows: Press `Ctrl + R`
   - Mac: Press `Cmd + R`

3. Go to **Apps** section in the left sidebar

4. Find and click **"Winston AI"** (or whatever your bot is named)

5. This opens a direct message with Winston

6. Type a test message:
   ```
   Hello!
   ```

7. Press Enter

8. **WAIT 2-4 seconds**

9. **Expected Result:**
   Winston should respond with something like:
   ```
   🤔 Let me analyze that...

   ⚖️ Hello! I'm Winston, your AI legal assistant with comprehensive
   expertise in Black's Law Dictionary, the U.S. Constitution...
   ```

---

## 🔍 If Bot Still Doesn't Respond

### Check #1: Recent Events in Slack

1. Go back to: https://api.slack.com/apps/A09QL5XGC6M/event-subscriptions

2. Scroll to the **VERY BOTTOM** of the page

3. Look for section: **"Recent Events"**

4. Send another test message to Winston in Slack

5. Refresh the Event Subscriptions page

6. Check "Recent Events" section again

**What you should see:**
```
message.im
Status: 200 OK
Timestamp: Just now
```

**What it means if you see:**

| Status | Meaning | Solution |
|--------|---------|----------|
| **Nothing appears** | Slack is not sending events | Events not configured properly. Go back to Step 3 and verify all 3 events are added. App not reinstalled - go back to Step 5. |
| **401 Unauthorized** | Signing secret mismatch | Go to troubleshooting section below |
| **404 Not Found** | URL wrong or deployment down | Verify URL is exactly: `https://winston-production.up.railway.app/slack/events` |
| **500 Server Error** | Bot code error | Check Railway logs (see Check #2 below) |
| **200 OK** | Event delivered successfully! | If you see this but no bot response, check Railway logs for processing errors |

---

### Check #2: Railway Logs

1. Go to: https://railway.app/dashboard

2. Find and click your **Winston** service

3. Click **"Deployments"** tab

4. Click the **latest deployment** (top of the list)

5. You should see logs scrolling

6. Send a test message to Winston in Slack

7. **Look for these logs in Railway:**

**Good logs (what you want to see):**
```
POST /slack/events - 200
[DM] Received: "Hello!"
```

**Bad logs (problems):**
```
POST /slack/events - 401
Error: Invalid signature
```
This means signing secret is wrong.

```
POST /slack/events - 500
Error: ...
```
This means code error. Screenshot the error and share it.

**No logs at all:**
This means Slack is not sending events. Go back to Step 3 and verify events are configured.

---

### Check #3: Railway Environment Variables

1. In Railway dashboard, click your Winston service

2. Click **"Variables"** tab

3. Verify these variables exist:

**Required:**
```
SLACK_BOT_TOKEN=xoxb-9338169253798-9807844116359-...
SLACK_SIGNING_SECRET=0cbfe1c0a6c5009f3d3add42334f4a5c
ANTHROPIC_API_KEY=sk-ant-...
PORT=3000
```

**Get the correct values:**

- **SLACK_BOT_TOKEN:**
  1. Go to: https://api.slack.com/apps/A09QL5XGC6M/oauth
  2. Copy "Bot User OAuth Token" (starts with `xoxb-`)

- **SLACK_SIGNING_SECRET:**
  1. Go to: https://api.slack.com/apps/A09QL5XGC6M/general
  2. Scroll to "App Credentials"
  3. Copy "Signing Secret"

If you update any variables:
1. Railway will automatically redeploy (wait 1-2 minutes)
2. Go back to Event Subscriptions and click "Retry" on the Request URL

---

## 📋 Complete Verification Checklist

Go through this checklist one by one:

### In Slack App Settings (https://api.slack.com/apps/A09QL5XGC6M):

**Event Subscriptions Page:**
- [ ] Toggle is ON (green)
- [ ] Request URL is: `https://winston-production.up.railway.app/slack/events`
- [ ] Green ✅ checkmark next to Request URL
- [ ] Event `message.im` is listed under "Subscribe to bot events"
- [ ] Event `message.channels` is listed under "Subscribe to bot events"
- [ ] Event `app_mention` is listed under "Subscribe to bot events"
- [ ] "Save Changes" button was clicked (or not visible because changes were saved)

**Install App Page:**
- [ ] Shows "Installed to: [Your Workspace]"
- [ ] Recent timestamp (should be within last 10 minutes if you just reinstalled)

**OAuth & Permissions Page:**
- [ ] Bot User OAuth Token starts with `xoxb-`
- [ ] Has scopes: `app_mentions:read`, `channels:history`, `chat:write`, `im:history`, `im:read`

### In Railway (https://railway.app/dashboard):

- [ ] Winston service is deployed and running
- [ ] Health check: https://winston-production.up.railway.app/health returns OK
- [ ] Environment variable `SLACK_BOT_TOKEN` matches the one in Slack
- [ ] Environment variable `SLACK_SIGNING_SECRET` matches the one in Slack
- [ ] Environment variable `ANTHROPIC_API_KEY` is set and starts with `sk-ant-`
- [ ] Logs show: "Winston AI Legal Assistant is running!"

### In Slack Workspace:

- [ ] Slack was reloaded (Ctrl+R / Cmd+R) after reinstalling app
- [ ] Can find Winston AI in Apps section
- [ ] Test message was sent
- [ ] Waited at least 5 seconds for response

### Event Delivery Check:

- [ ] After sending test message, checked Recent Events in Slack
- [ ] Recent Events shows `message.im` event
- [ ] Status is `200 OK`
- [ ] Railway logs show `POST /slack/events - 200`
- [ ] Railway logs show `[DM] Received: "..."`

---

## 🆘 Quick Troubleshooting

### "Request URL shows RED X, says 'invalid_url' or 'challenge_failed'"

**Causes:**
1. URL typo - verify it's exactly: `https://winston-production.up.railway.app/slack/events`
2. Railway deployment is down - check health endpoint
3. Signing secret mismatch - see "Signing Secret Mismatch" below

**Solution:**
```bash
# Test the endpoint yourself:
curl https://winston-production.up.railway.app/health

# Should return:
{"status":"ok","message":"Winston AI Legal Assistant","ai":"enabled","version":"working"}

# If that works, test events endpoint:
curl -X POST https://winston-production.up.railway.app/slack/events \
  -H "Content-Type: application/json" \
  -d '{"type":"url_verification","challenge":"test"}'

# Should return HTTP 401 (good!) or the challenge response
```

---

### "Recent Events shows 401 Unauthorized"

This means signing secret doesn't match.

**Solution:**

1. Go to: https://api.slack.com/apps/A09QL5XGC6M/general

2. Scroll to "App Credentials"

3. Click "Show" next to "Signing Secret"

4. Copy the value (should be: `0cbfe1c0a6c5009f3d3add42334f4a5c`)

5. Go to Railway dashboard → Winston service → Variables

6. Update `SLACK_SIGNING_SECRET` to match exactly

7. Wait 1-2 minutes for Railway to redeploy

8. Go back to Event Subscriptions page

9. Click "Retry" button next to Request URL

10. Should now show green ✅

---

### "Bot responds but says 'AI features not configured'"

This means `ANTHROPIC_API_KEY` is missing or invalid.

**Solution:**

1. Get your Claude API key from: https://console.anthropic.com/settings/keys

2. Go to Railway dashboard → Winston service → Variables

3. Add or update `ANTHROPIC_API_KEY` with your key

4. Should start with: `sk-ant-`

5. Wait 1-2 minutes for Railway to redeploy

6. Test again

---

### "Followed all steps, checkmarks are green, but no response"

**Debug steps:**

1. **Send a test message in Slack**

2. **Check Railway logs immediately:**
   - Go to Railway dashboard → Winston service → Deployments → Latest
   - Do you see `POST /slack/events - 200`?

3. **If YES (you see the POST request):**
   - Check for error messages after the POST line
   - Look for: `[DM] Received: "your message"`
   - If you see the message received, but no response, check for errors in processing
   - Likely issue: ANTHROPIC_API_KEY problem

4. **If NO (you don't see POST request):**
   - Slack is not sending events
   - Go to Event Subscriptions → Recent Events
   - Do you see the event there with 200 OK?
   - If yes in Recent Events but no in Railway logs, wait a few more seconds and refresh
   - If no in Recent Events, events are not configured properly

5. **Check each event was added:**
   - Go to Event Subscriptions page
   - Scroll to "Subscribe to bot events"
   - Count the events listed
   - Should be exactly 3: message.im, message.channels, app_mention

6. **Verify app was reinstalled:**
   - Go to Install App page
   - Check the timestamp
   - Should be AFTER you added the events
   - If timestamp is old (hours ago), you didn't reinstall
   - Go back to Step 5 and reinstall

---

## 🎯 What Should Happen When Everything Works

### User Experience:

1. User opens Slack
2. Goes to Apps → Winston AI
3. Types: "What is habeas corpus?"
4. Presses Enter
5. **Within 2-4 seconds:**
   - Winston sends: "🤔 Let me analyze that..."
   - Followed by a detailed legal explanation with proper citations

### Behind the Scenes:

1. **Slack → Railway:**
   - Slack sends POST request to `/slack/events`
   - Includes message content and signature
   - Railway logs: `POST /slack/events - 200`

2. **Bot Processing:**
   - Bot validates Slack signature
   - Bot logs: `[DM] Received: "What is habeas corpus?"`
   - Bot sends "thinking" message
   - Bot calls Claude API

3. **Claude API:**
   - Receives legal question
   - Generates comprehensive legal response
   - Returns within 1-3 seconds

4. **Bot → Slack:**
   - Bot sends response to user
   - User sees AI-generated legal analysis

### Railway Logs (What You Should See):

```
⚡️ Winston AI Legal Assistant is running!
📡 Port: 3000
🤖 AI: ENABLED ✅
📬 Endpoints:
   - /slack/events (Slack events)
   - /slack/commands (Slash commands)
   - /health (Health check)

POST /slack/events - 200
[DM] Received: "What is habeas corpus?"
```

---

## ✅ Summary

**The Railway deployment is FIXED and WORKING.**

**YOU need to:**
1. ✅ Enable Event Subscriptions in Slack
2. ✅ Add 3 bot events (message.im, message.channels, app_mention)
3. ✅ Save changes
4. ✅ Reinstall app to workspace
5. ✅ Test in Slack

**Time required:** 5 minutes

**Difficulty:** Easy (just clicking through Slack settings)

**Success indicator:** Winston responds to your messages with AI-powered legal analysis

---

## 📞 Still Need Help?

If you followed ALL steps exactly and it still doesn't work:

1. **Take screenshots of:**
   - Event Subscriptions page (showing the 3 events and green checkmark)
   - Recent Events section (showing 200 OK or error)
   - Railway logs (showing POST requests or errors)

2. **Answer these questions:**
   - Did you see green ✅ on Request URL? (Yes/No)
   - Did you click "Save Changes"? (Yes/No)
   - Did you reinstall the app? (Yes/No)
   - Did you reload Slack? (Yes/No)
   - What do you see in Recent Events? (Copy/paste the status)
   - What do you see in Railway logs? (Copy/paste the lines)

3. **Share the information** and I can help debug further.

---

**The fix is deployed. Now go configure those Slack Event Subscriptions!** 🚀

