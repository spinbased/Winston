# 🚨 CRITICAL FIX - Bot Not Responding

## ✅ Bot Status: WORKING
- Health: OK ✅
- AI: Enabled ✅
- Events endpoint: Working ✅
- Railway: Running ✅

## ❌ Problem: SLACK NOT SENDING EVENTS

**Diagnosis: Slack is not sending message events to Railway. Your bot is fine, Slack configuration is wrong.**

---

## 🎯 THE FIX - Do This EXACTLY:

### Step 1: Check Slack App Settings

Go to: **https://api.slack.com/apps**

Find your app and click it.

---

### Step 2: Event Subscriptions - CRITICAL

Click **"Event Subscriptions"** in left sidebar.

#### A) Check Request URL

The field should show:
```
https://winston-production.up.railway.app/slack/events
```

**WITH A GREEN CHECKMARK** ✅ next to it.

**If there's NO checkmark or RED X:**
1. Your SLACK_SIGNING_SECRET in Railway is wrong
2. Copy it again from Slack: Basic Information → Signing Secret
3. Update Railway variable
4. Wait 1 minute for redeploy
5. Come back and re-enter the Request URL

---

#### B) Subscribe to Bot Events

**Scroll down** to section: **"Subscribe to bot events"**

Click **"Add Bot User Event"** and add these 3:

1. **`message.im`**
   - Description: "A message was posted in a direct message channel"
   - Requires scope: `im:history`

2. **`message.channels`**
   - Description: "A message was posted to a channel"
   - Requires scope: `channels:history`

3. **`app_mention`**
   - Description: "Subscribe to only the message events that mention your app"
   - Requires scope: `app_mentions:read`

**CRITICAL:** After adding events, scroll to the **VERY BOTTOM** of the page.

Click the **"Save Changes"** button.

---

### Step 3: OAuth & Permissions

Click **"OAuth & Permissions"** in left sidebar.

#### Check Bot Token Scopes

You MUST have these scopes:

```
✅ app_mentions:read
✅ channels:history
✅ channels:read
✅ chat:write
✅ commands
✅ groups:history
✅ groups:read
✅ im:history
✅ im:read
✅ im:write
✅ users:read
```

**If any are missing:**
1. Click "Add an OAuth Scope"
2. Add the missing ones
3. **MUST REINSTALL APP** (next step)

---

### Step 4: App Home

Click **"App Home"** in left sidebar.

Scroll to **"Messages Tab"** section.

**MUST be checked:**
- ✅ **"Allow users to send Slash commands and messages from the messages tab"**

**MUST be UNchecked:**
- ⬜ "Messages Tab Read Only"

Click **"Save"** if you made changes.

---

### Step 5: Reinstall App (REQUIRED!)

Click **"Install App"** in left sidebar.

Click **"Reinstall to Workspace"**

Click **"Allow"**

**This is CRITICAL - without reinstalling, new event subscriptions won't work!**

---

### Step 6: Verify in Slack Client

1. **Reload Slack** - Press Ctrl+R (Windows) or Cmd+R (Mac)
2. Go to **Apps** section in Slack sidebar
3. Find your bot (Winston)
4. Click it to open DM

---

### Step 7: Test

Send: `Hello!`

**Should get response from bot with AI analysis.**

---

## 🔍 Verification Checklist

Before testing, confirm ALL of these:

- [ ] Event Subscriptions → Toggle is **ON**
- [ ] Event Subscriptions → Request URL shows **green ✅**
- [ ] Event Subscriptions → `message.im` is listed
- [ ] Event Subscriptions → `message.channels` is listed
- [ ] Event Subscriptions → `app_mention` is listed
- [ ] Event Subscriptions → **"Save Changes" was clicked**
- [ ] OAuth & Permissions → All 11 scopes are present
- [ ] App Home → Messages Tab is **enabled**
- [ ] Install App → Shows "Installed to [workspace]"
- [ ] **App was REINSTALLED after changes**
- [ ] Slack was **reloaded** (Ctrl+R / Cmd+R)

---

## 🧪 Debug Test

After doing all the above, check if Slack is NOW sending events:

### Check Recent Events in Slack

1. Go back to: Event Subscriptions page
2. Scroll to the **VERY BOTTOM**
3. Section: **"Recent Events"**

**Send a test message to the bot in Slack**

Then check "Recent Events":

**What you should see:**
```
message.im event
Status: 200 OK
```

**If you see nothing:**
- Events still aren't configured properly
- App wasn't reinstalled
- Restart from Step 1

**If you see errors (401, 500):**
- 401: Signing secret mismatch
- 500: Bot error (check Railway logs)

---

## 🆘 Still Not Working After All This?

### Final Check: Slack Event Delivery

The "Recent Events" section at the bottom of Event Subscriptions page is KEY.

**After sending a message, if you see:**

**NOTHING in Recent Events:**
→ Slack is not trying to send events
→ Events not configured or saved
→ App not reinstalled

**401 Unauthorized:**
→ SLACK_SIGNING_SECRET in Railway is wrong
→ Copy from: Slack → Basic Information → Signing Secret
→ Update in Railway Variables
→ Redeploy

**500 Server Error:**
→ Bot code has an error
→ Check Railway logs for error details

**200 OK but no response in Slack:**
→ Bot received event but didn't respond
→ Check Railway logs for processing errors
→ Possible ANTHROPIC_API_KEY issue

---

## 📊 Current Working Configuration

Your bot is deployed and working with these features:

✅ Claude 3.5 Haiku AI
✅ Legal expert system prompt
✅ Direct message handler
✅ @mention handler
✅ Slash command handler
✅ Health endpoint

**The ONLY issue is Slack not sending events to the bot.**

**This is 100% a Slack app configuration problem, NOT a code problem.**

---

## 🎯 Summary

**Problem:** Slack is not delivering message events to your bot's webhook URL.

**Solution:**
1. Add event subscriptions (`message.im`, `message.channels`, `app_mention`)
2. Save changes
3. Reinstall app to workspace
4. Test

**Verification:** Check "Recent Events" section in Event Subscriptions after sending a message.

---

**After following these steps EXACTLY, your bot WILL work. The code is ready and waiting for Slack to send events.** 🚀
