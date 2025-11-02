# Winston Slack Bot Setup - Complete Step-by-Step Guide

## 🤖 Setup Question: Manifest vs From Scratch?

You're being asked to choose between two setup methods:

### Option 1: From Manifest (⭐ RECOMMENDED)

**Choose this if:** You want the fastest, easiest setup.

**What it does:** Automatically configures all 31 slash commands, OAuth scopes, and event subscriptions from a JSON file.

**Pros:**
- ✅ Sets up all 31 commands instantly
- ✅ Configures all permissions correctly
- ✅ Takes 2 minutes instead of 30 minutes
- ✅ Zero chance of missing a permission

**How to do it:**
1. Click **"From an app manifest"**
2. Choose your workspace
3. Copy the contents from `slack-app-manifest.json` (I just created this file)
4. Paste into the text box
5. Click **Review**
6. Click **Create**
7. Done! ✅

### Option 2: From Scratch

**Choose this if:** You want manual control over every setting.

**What it does:** You manually configure each slash command, permission, and event subscription.

**Cons:**
- ⏰ Takes 30+ minutes
- 🔧 Manual entry of 31 commands
- ⚠️ Easy to miss permissions
- 🐛 Higher chance of configuration errors

**When to use:** Only if you want to customize specific settings or learn the full process.

---

## 🚀 Recommended: Manifest Setup (2 Minutes)

### Step 1: Start App Creation

1. Go to https://api.slack.com/apps
2. Click **"Create New App"**
3. Select **"From an app manifest"** ⭐
4. Choose your workspace
5. Click **Next**

### Step 2: Paste Manifest

1. Copy the entire contents of `slack-app-manifest.json`
2. Paste into the JSON tab
3. **Important:** Replace `your-winston.vercel.app` with your actual Vercel URL in these fields:
   ```json
   "url": "https://your-winston.vercel.app/slack/events"
   "request_url": "https://your-winston.vercel.app/slack/events"
   ```

### Step 3: Review and Create

1. Click **Review** → Check the summary
2. Click **Create** → App is created!
3. Your app now has:
   - ✅ 31 slash commands configured
   - ✅ All OAuth scopes set
   - ✅ Event subscriptions enabled
   - ✅ Message handlers ready

### Step 4: Get Your Credentials

**Bot Token:**
1. Go to **OAuth & Permissions**
2. Click **Install to Workspace**
3. Click **Allow**
4. Copy **Bot User OAuth Token** (starts with `xoxb-`)
5. Save as `SLACK_BOT_TOKEN` in Vercel

**Signing Secret:**
1. Go to **Basic Information**
2. Scroll to **App Credentials**
3. Copy **Signing Secret**
4. Save as `SLACK_SIGNING_SECRET` in Vercel

**App Token (for Socket Mode - optional):**
1. Go to **Basic Information**
2. Scroll to **App-Level Tokens**
3. Click **Generate Token and Scopes**
4. Name: "Winston Socket"
5. Add scope: `connections:write`
6. Click **Generate**
7. Copy token (starts with `xapp-`)
8. Save as `SLACK_APP_TOKEN` in Vercel

### Step 5: Update Vercel Deployment URL

After you get your Vercel deployment URL:

1. Go to **Slash Commands** in Slack app settings
2. Each command should point to: `https://your-actual-deployment.vercel.app/slack/events`
3. Go to **Event Subscriptions**
4. Update Request URL: `https://your-actual-deployment.vercel.app/slack/events`
5. Click **Save Changes**
6. Vercel should verify the endpoint automatically

---

## 🛠️ Alternative: From Scratch Setup (30 Minutes)

If you chose "From scratch", follow these detailed steps:

### Step 1: Basic Information

1. **App Name:** Winston Legal AI
2. **Short Description:** AI Legal Defense System
3. **Choose workspace:** Select your workspace
4. Click **Create App**

### Step 2: OAuth & Permissions

Go to **OAuth & Permissions** → Scroll to **Scopes** → Add these **Bot Token Scopes**:

**Required scopes:**
- `app_mentions:read` - Read messages that mention Winston
- `channels:history` - View messages in channels
- `channels:read` - View basic channel info
- `chat:write` - Send messages as Winston
- `chat:write.public` - Send messages to channels Winston isn't in
- `commands` - Add slash commands
- `files:read` - Access files shared in messages
- `groups:history` - View messages in private channels
- `groups:read` - View basic private channel info
- `im:history` - View messages in DMs
- `im:read` - View basic DM info
- `im:write` - Send DMs
- `mpim:history` - View messages in group DMs
- `mpim:read` - View basic group DM info
- `users:read` - View user info

### Step 3: Install App

1. Click **Install to Workspace**
2. Review permissions
3. Click **Allow**
4. Copy the **Bot User OAuth Token** (starts with `xoxb-`)

### Step 4: Enable Event Subscriptions

1. Go to **Event Subscriptions**
2. Toggle **Enable Events** to ON
3. **Request URL:** `https://your-winston.vercel.app/slack/events`
4. Wait for Verified ✅
5. **Subscribe to bot events:**
   - `app_mention` - Mentions of Winston
   - `message.channels` - Messages in channels
   - `message.groups` - Messages in private channels
   - `message.im` - Direct messages
   - `message.mpim` - Group DMs
6. Click **Save Changes**

### Step 5: Create Slash Commands

Go to **Slash Commands** → Click **Create New Command**

Create each of these 31 commands (all with Request URL: `https://your-winston.vercel.app/slack/events`):

#### General Legal Commands
1. `/legal-help` - Get help with any legal question
2. `/define` - Define legal terms and concepts
3. `/legal-research` - Comprehensive legal research

#### Constitutional Law
4. `/constitutional` - Ask about constitutional law
5. `/defend-rights` - Know your rights
6. `/sovereign-rights` - Individual sovereignty

#### Law Enforcement Interactions
7. `/traffic-stop` - Traffic stop rights
8. `/warrant-check` - Warrant requirements
9. `/miranda-rights` - Miranda rights
10. `/search-seizure` - 4th Amendment law
11. `/remain-silent` - 5th Amendment rights
12. `/right-to-counsel` - 6th Amendment rights
13. `/police-misconduct` - Address misconduct
14. `/arrest-rights` - Rights when arrested
15. `/evidence-suppression` - Suppress illegal evidence
16. `/qualified-immunity` - Qualified immunity doctrine

#### Tax Law
17. `/tax-strategy` - Tax reduction strategies
18. `/irs-audit` - Handle IRS audits
19. `/tax-deductions` - Eligible deductions
20. `/tax-credits` - Available tax credits
21. `/offshore-tax` - International tax law
22. `/tax-court` - Tax Court procedures
23. `/innocent-spouse` - Innocent spouse relief
24. `/tax-liens` - Tax liens and levies
25. `/estimated-tax` - Estimated tax payments
26. `/constitutional-tax` - Constitutional basis of taxation

#### Civil Law
27. `/contract-review` - Review contracts
28. `/file-lawsuit` - Filing lawsuits
29. `/appeal-case` - Appeal procedures
30. `/pro-se` - Self-representation

#### Utility
31. `/new-session` - Start new session

**For each command:**
- Command: (e.g., `/legal-help`)
- Request URL: `https://your-winston.vercel.app/slack/events`
- Short Description: (see above)
- Usage Hint: (example query)
- Click **Save**

### Step 6: Enable Interactivity

1. Go to **Interactivity & Shortcuts**
2. Toggle **Interactivity** to ON
3. **Request URL:** `https://your-winston.vercel.app/slack/events`
4. Click **Save Changes**

### Step 7: Get Signing Secret

1. Go to **Basic Information**
2. Scroll to **App Credentials**
3. Copy **Signing Secret**
4. Save this for Vercel environment variables

---

## 🔑 Environment Variables Setup

Add these to Vercel (see VERCEL-ENV-GUIDE.md):

```bash
# From Slack app settings
SLACK_BOT_TOKEN=xoxb-xxxxxxxxxxxx-xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx
SLACK_SIGNING_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SLACK_APP_TOKEN=xapp-x-xxxxxxxxxxx-xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## ✅ Verification Checklist

Before testing, verify:

- [ ] App installed to workspace
- [ ] Bot token copied to Vercel
- [ ] Signing secret copied to Vercel
- [ ] All 31 slash commands created
- [ ] All commands point to correct Vercel URL
- [ ] Event subscriptions enabled
- [ ] Event URL verified (green checkmark)
- [ ] Interactivity enabled
- [ ] Bot is online in workspace

---

## 🧪 Testing Your Bot

### Test 1: Direct Message

1. Open Slack
2. Find **Winston Legal AI** in Apps
3. Send a direct message: "Hello"
4. Winston should respond within 3-5 seconds

### Test 2: Slash Commands

In any channel:
```
/legal-help What is habeas corpus?
```

Expected response: Detailed explanation of habeas corpus with legal citations.

### Test 3: Voice Message (if supported)

1. Send voice message in DM
2. Winston transcribes and responds

### Test 4: Session Memory

```
/legal-help Tell me about the 4th amendment
(wait for response)
/legal-help What exceptions exist to this?
```

Winston should remember context from previous message.

---

## 🐛 Troubleshooting

### Commands Not Appearing

**Problem:** Slash commands don't show up in Slack

**Solutions:**
1. Make sure app is installed to workspace
2. Check all commands are saved in Slack settings
3. Try `/legal-help` manually (type it out)
4. Reinstall app if needed

### "Dispatch Failed" Error

**Problem:** Commands return "dispatch_failed"

**Solutions:**
1. Check Vercel URL is correct in all command settings
2. Verify Vercel deployment is live: `curl https://your-url.vercel.app/health`
3. Check Vercel logs for errors
4. Verify `SLACK_SIGNING_SECRET` matches in both places

### "Verification Failed" Error

**Problem:** Slack can't verify event subscription URL

**Solutions:**
1. Make sure Vercel deployment is complete
2. Check `/slack/events` endpoint exists
3. Verify signing secret in Vercel matches Slack
4. Check Vercel function logs for errors
5. Test endpoint manually: `curl https://your-url.vercel.app/health`

### Bot Not Responding

**Problem:** Commands execute but no response

**Solutions:**
1. Check Vercel logs for errors
2. Verify all API keys set in Vercel (Anthropic, OpenAI, Pinecone, Redis)
3. Test health endpoint: `curl https://your-url.vercel.app/health`
4. Check Redis connection (Upstash dashboard)
5. Verify Pinecone index exists

---

## 📚 Additional Resources

- **Slack API Docs:** https://api.slack.com/docs
- **Slack Bolt Framework:** https://slack.dev/bolt-js
- **Winston Deployment Guide:** See DEPLOYMENT-GUIDE.md
- **Winston README:** See README.md

---

## 🎉 You're Done!

Winston is now fully configured and ready to assist with legal queries!

**What you can do now:**
1. ✅ Use all 31 slash commands
2. ✅ Send voice messages (transcription + response)
3. ✅ Have multi-turn conversations (session memory)
4. ✅ Access 805,000+ legal documents
5. ✅ Get responses in 3-5 seconds (with caching)

**Next steps:**
1. Share Winston with your team
2. Process full legal dataset: `npm run data:all-law`
3. Set up N8N workflows (optional)
4. Monitor usage via `/metrics` endpoint

---

**Built with Agent OS + Claude-Flow + Claude Code**

The Ultimate Coding Agent System 🚀⚖️
