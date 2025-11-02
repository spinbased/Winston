# Complete Slack Bot Setup Guide
## Winston Legal Assistant Bot Configuration

This comprehensive guide walks you through setting up the Winston Legal Assistant Slack bot from start to finish, including Event Subscriptions, Slash Commands, OAuth permissions, and deployment verification.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Create Your Slack App](#create-your-slack-app)
3. [OAuth & Permissions Setup](#oauth--permissions-setup)
4. [Event Subscriptions Configuration](#event-subscriptions-configuration)
5. [Slash Commands Setup](#slash-commands-setup)
6. [Interactivity & Shortcuts](#interactivity--shortcuts)
7. [Install to Workspace](#install-to-workspace)
8. [Testing & Verification](#testing--verification)
9. [Troubleshooting](#troubleshooting)
10. [App Manifest (Quick Setup)](#app-manifest-quick-setup)

---

## Prerequisites

Before you begin, ensure you have:

- **Slack Workspace**: Admin access to a Slack workspace
- **Railway Deployment**: Your bot is deployed and running (with a public URL)
- **Environment Variables**: `SLACK_BOT_TOKEN` and `SLACK_SIGNING_SECRET` ready to configure
- **Endpoints Available**:
  - `https://your-railway-url.railway.app/slack/events` - Event subscriptions
  - `https://your-railway-url.railway.app/slack/commands` - Slash commands
  - `https://your-railway-url.railway.app/health` - Health check

**Note**: Replace `your-railway-url` with your actual Railway deployment URL throughout this guide.

---

## Create Your Slack App

### Step 1: Create New App

1. Go to [Slack API Apps](https://api.slack.com/apps)
2. Click **"Create New App"**
3. Choose **"From scratch"** (or use the [App Manifest](#app-manifest-quick-setup) for quick setup)
4. Enter App Name: **"Winston Legal Assistant"**
5. Select your workspace
6. Click **"Create App"**

### Step 2: Navigate to App Settings

You'll be taken to the app configuration page. Keep this open as you'll need it for the following steps.

---

## OAuth & Permissions Setup

OAuth scopes define what your bot can and cannot do in Slack. Set these up FIRST before enabling events.

### Step 1: Add Bot Token Scopes

1. In the left sidebar, click **"OAuth & Permissions"**
2. Scroll to **"Scopes"** section
3. Under **"Bot Token Scopes"**, click **"Add an OAuth Scope"**
4. Add the following scopes:

#### Required Bot Token Scopes:

| Scope | Purpose | Priority |
|-------|---------|----------|
| `app_mentions:read` | Receive notifications when bot is mentioned | **Critical** |
| `channels:history` | Read messages in public channels | **Critical** |
| `channels:read` | View basic channel information | **Critical** |
| `chat:write` | Send messages as the bot | **Critical** |
| `commands` | Enable slash commands | **Critical** |
| `im:history` | Read direct messages sent to the bot | **Critical** |
| `im:read` | View basic DM information | **Critical** |
| `im:write` | Send direct messages | **Critical** |
| `users:read` | View user information (for personalization) | Recommended |
| `groups:history` | Read messages in private channels (if invited) | Optional |
| `groups:read` | View private channel info | Optional |

### Step 2: Understanding Scopes

**Critical Scopes Explained:**

- **`app_mentions:read`**: Required to receive `app_mention` events when users type `@Winston`
- **`chat:write`**: Allows the bot to respond to messages
- **`commands`**: Required for all slash commands (`/legal-help`, `/constitutional`, etc.)
- **`im:history`** and `im:write`**: Required for direct message conversations with the bot
- **`channels:history`**: Required for the bot to read messages in channels where it's mentioned

**Important**: You must add these scopes BEFORE installing the bot to your workspace. If you add scopes later, you'll need to reinstall the app.

### Step 3: Bot User Display

1. In the left sidebar, click **"App Home"**
2. Under **"Your App's Presence in Slack"**, verify:
   - Display Name: **Winston Legal Assistant**
   - Default Username: **winston-legal** (or your preference)
3. Enable **"Always Show My Bot as Online"** (recommended)
4. Under **"Show Tabs"**, enable:
   - **Messages Tab** ✓ (allows users to DM the bot)

---

## Event Subscriptions Configuration

Event Subscriptions allow your bot to receive real-time events from Slack (like mentions, messages, etc.).

### Step 1: Enable Event Subscriptions

1. In the left sidebar, click **"Event Subscriptions"**
2. Toggle **"Enable Events"** to **ON**

### Step 2: Set Request URL

1. In the **"Request URL"** field, enter:
   ```
   https://your-railway-url.railway.app/slack/events
   ```
2. Slack will send a verification challenge to this URL
3. Your bot must respond with the challenge to verify ownership

**URL Verification Process:**

The Bolt framework automatically handles URL verification. When you enter your URL:

1. Slack sends a POST request with `type: "url_verification"` and a `challenge` string
2. Your bot echoes back the `challenge` value
3. Slack verifies the response and displays ✓ **Verified** next to the URL

**If verification fails:**
- Check that your Railway deployment is running (`/health` endpoint returns 200)
- Ensure `SLACK_SIGNING_SECRET` environment variable is set correctly
- Check Railway logs for errors: `railway logs`

### Step 3: Subscribe to Bot Events

Scroll down to **"Subscribe to bot events"** and click **"Add Bot User Event"**.

Add the following events:

#### Required Bot Events:

| Event | When It's Triggered | Required Scope |
|-------|---------------------|----------------|
| `app_mention` | When someone mentions @Winston in a channel | `app_mentions:read` |
| `message.im` | When a user sends a DM to Winston | `im:history` |
| `message.channels` | When a message is posted in a channel (if bot is in channel) | `channels:history` |

**Optional Events** (for enhanced functionality):
- `message.groups` - Private channel messages (requires `groups:history`)
- `app_home_opened` - User opens the bot's App Home tab

### Step 4: Save Changes

1. Click **"Save Changes"** at the bottom of the page
2. You'll see a banner: **"You need to reinstall your app"** - this is expected
3. We'll reinstall after completing all configurations

---

## Slash Commands Setup

Slash commands provide a convenient way for users to interact with Winston using commands like `/legal-help`.

### Step 1: Navigate to Slash Commands

1. In the left sidebar, click **"Slash Commands"**
2. Click **"Create New Command"**

### Step 2: Create Commands

Create each of the following commands:

#### Command 1: `/legal-help`

- **Command**: `/legal-help`
- **Request URL**: `https://your-railway-url.railway.app/slack/events`
- **Short Description**: `Get legal analysis and guidance from Winston`
- **Usage Hint**: `[your legal question]`
- **Escape channels, users, and links**: ✓ (checked)

Click **"Save"**

#### Command 2: `/constitutional`

- **Command**: `/constitutional`
- **Request URL**: `https://your-railway-url.railway.app/slack/events`
- **Short Description**: `Search and analyze US Constitution`
- **Usage Hint**: `[amendment, article, or topic]`
- **Escape channels, users, and links**: ✓ (checked)

Click **"Save"**

#### Command 3: `/define`

- **Command**: `/define`
- **Request URL**: `https://your-railway-url.railway.app/slack/events`
- **Short Description**: `Get legal term definitions from Black's Law Dictionary`
- **Usage Hint**: `[legal term]`
- **Escape channels, users, and links**: ✓ (checked)

Click **"Save"**

#### Command 4: `/defend-rights`

- **Command**: `/defend-rights`
- **Request URL**: `https://your-railway-url.railway.app/slack/events`
- **Short Description**: `Get real-time legal defense guidance`
- **Usage Hint**: `[situation description]`
- **Escape channels, users, and links**: ✓ (checked)

Click **"Save"**

#### Command 5: `/sovereign-rights`

- **Command**: `/sovereign-rights`
- **Request URL**: `https://your-railway-url.railway.app/slack/events`
- **Short Description**: `Learn about sovereign citizenship legal framework`
- **Usage Hint**: (leave empty)
- **Escape channels, users, and links**: ✓ (checked)

Click **"Save"**

### Notes on Slash Commands:

- All commands use the same `/slack/events` endpoint (Bolt routes them internally)
- Commands appear when users type `/` in Slack
- Usage hints help users understand command syntax
- **Escape channels, users, and links** should always be checked for security

---

## Interactivity & Shortcuts

Interactivity enables Winston to respond to button clicks, select menus, and other interactive components.

### Step 1: Enable Interactivity

1. In the left sidebar, click **"Interactivity & Shortcuts"**
2. Toggle **"Interactivity"** to **ON**

### Step 2: Set Request URL

1. In the **"Request URL"** field, enter:
   ```
   https://your-railway-url.railway.app/slack/events
   ```
2. Click **"Save Changes"**

**Note**: Even if you're not using interactive components yet, enabling this prepares your bot for future enhancements like buttons and modals.

---

## Install to Workspace

Now that all configurations are complete, it's time to install Winston to your workspace.

### Step 1: Install App

1. In the left sidebar, click **"Install App"**
2. Click **"Install to Workspace"**
3. Review the permissions requested
4. Click **"Allow"**

### Step 2: Copy Tokens

After installation, you'll see:

1. **Bot User OAuth Token**: `xoxb-...`
   - Copy this token
   - Add to Railway as environment variable: `SLACK_BOT_TOKEN`

2. **Signing Secret**: (found in **Settings > Basic Information**)
   - Scroll to **"App Credentials"** section
   - Click **"Show"** next to **Signing Secret**
   - Copy this secret
   - Add to Railway as environment variable: `SLACK_SIGNING_SECRET`

### Step 3: Update Railway Environment Variables

1. Go to your Railway project
2. Click on your service
3. Go to **"Variables"** tab
4. Add or update:
   ```
   SLACK_BOT_TOKEN=xoxb-your-bot-token
   SLACK_SIGNING_SECRET=your-signing-secret
   ```
5. Click **"Deploy"** to restart with new variables

### Step 4: Wait for Deployment

- Railway will redeploy your bot with the new credentials
- This typically takes 1-2 minutes
- Check deployment logs: `railway logs`

---

## Testing & Verification

Now let's verify that Winston is working correctly.

### Test 1: Health Check

```bash
curl https://your-railway-url.railway.app/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Winston minimal mode"
}
```

### Test 2: Slash Command

1. Open Slack and go to any channel or DM
2. Type: `/legal-help test`
3. Press Enter

**Expected Response:**
- Bot responds within 2-3 seconds
- In minimal mode: `✅ Winston is running! Add API keys to enable full features.`
- In full mode: Actual legal analysis (requires Anthropic API key)

### Test 3: Direct Message

1. In Slack, click on **"Apps"** in the sidebar
2. Find **"Winston Legal Assistant"**
3. Send a message: `Hello Winston`

**Expected Response:**
- Bot responds with typing indicator
- Bot sends a message (requires `im:history` and `im:write` scopes)

### Test 4: App Mention

1. Go to a public channel where Winston is a member
2. Type: `@Winston what is due process?`

**Expected Response:**
- Bot responds in the thread or channel
- Requires `app_mentions:read` and `channels:history` scopes

### Test 5: All Commands

Test each slash command:

```
/legal-help what is habeas corpus?
/constitutional 4th amendment
/define tort
/defend-rights traffic stop
/sovereign-rights
```

**Success Criteria:**
- All commands acknowledge within 3 seconds
- Bot responds with appropriate content
- No error messages

---

## Troubleshooting

### Issue 1: URL Verification Failed

**Symptoms:**
- ❌ next to Request URL
- Error: "We couldn't verify this URL"

**Solutions:**
1. Check Railway deployment is running:
   ```bash
   railway status
   curl https://your-railway-url.railway.app/health
   ```
2. Verify `SLACK_SIGNING_SECRET` is set in Railway
3. Check Railway logs for errors:
   ```bash
   railway logs --filter error
   ```
4. Ensure URL is exactly: `https://your-railway-url.railway.app/slack/events` (no trailing slash)

### Issue 2: Bot Doesn't Respond to Commands

**Symptoms:**
- Command is typed but bot doesn't respond
- Slack shows "command failed" or times out

**Solutions:**
1. Verify `SLACK_BOT_TOKEN` is set correctly in Railway
2. Check bot is installed to workspace (OAuth & Permissions page)
3. Verify command Request URL matches deployed endpoint
4. Check Railway logs:
   ```bash
   railway logs
   ```
5. Ensure bot has `commands` scope

### Issue 3: Bot Can't Read Messages

**Symptoms:**
- Bot doesn't respond to DMs
- Bot doesn't respond to @mentions

**Solutions:**
1. Verify Event Subscriptions are enabled
2. Check bot events are subscribed:
   - `message.im`
   - `app_mention`
   - `message.channels`
3. Verify required scopes are granted:
   - `im:history`, `im:write`
   - `app_mentions:read`
   - `channels:history`
4. **Reinstall the app** if scopes were added after initial install

### Issue 4: "Missing Scope" Errors

**Symptoms:**
- Slack returns error: "missing_scope"
- Bot can't perform certain actions

**Solutions:**
1. Go to **OAuth & Permissions**
2. Add the missing scope
3. **Reinstall the app to workspace** (required!)
4. Verify new token is updated in Railway

### Issue 5: Events Not Being Received

**Symptoms:**
- No events appearing in Railway logs
- Bot seems "deaf"

**Solutions:**
1. Check Event Subscriptions are toggled **ON**
2. Verify Request URL shows ✓ **Verified**
3. Re-verify URL if changed
4. Check Railway logs for incoming requests:
   ```bash
   railway logs --filter "slack"
   ```
5. Ensure bot is member of channels (for channel events)

### Issue 6: Intermittent Timeouts

**Symptoms:**
- Commands work sometimes but not always
- Slack shows "command timeout"

**Solutions:**
1. Check Railway service is running (not sleeping)
2. Verify Railway plan supports sufficient resources
3. Add health check pings to keep service warm
4. Consider upgrading Railway plan for better performance
5. Check bot responds to Slack within 3 seconds (Slack requirement)

### Common Configuration Mistakes

1. **Wrong Request URL format**
   - ✓ Correct: `https://your-app.railway.app/slack/events`
   - ✗ Wrong: `http://your-app.railway.app/slack/events` (not HTTPS)
   - ✗ Wrong: `https://your-app.railway.app/slack/events/` (trailing slash)

2. **Forgetting to reinstall after scope changes**
   - Always reinstall when adding new scopes!

3. **Using wrong token type**
   - Use **Bot User OAuth Token** (`xoxb-...`), not User OAuth Token (`xoxp-...`)

4. **Signing Secret vs App Token**
   - `SLACK_SIGNING_SECRET` is for HTTP mode (what you're using)
   - `SLACK_APP_TOKEN` is for Socket Mode (not needed for Railway deployment)

---

## App Manifest (Quick Setup)

For faster setup, use this app manifest to configure everything at once.

### Option A: Create New App with Manifest

1. Go to [Slack API Apps](https://api.slack.com/apps)
2. Click **"Create New App"**
3. Choose **"From an app manifest"**
4. Select your workspace
5. Choose **YAML** format
6. Paste the manifest below
7. Click **"Next"** → **"Create"**

### Option B: Update Existing App with Manifest

1. Go to your app settings
2. In the left sidebar, click **"App Manifest"**
3. Replace existing YAML with the manifest below
4. Click **"Save Changes"**

### Winston Legal Assistant App Manifest (YAML)

```yaml
display_information:
  name: Winston Legal Assistant
  description: Ultimate AI-powered legal assistant with US Constitution, Black's Law Dictionary, and founding documents expertise
  background_color: "#1A1D21"
  long_description: "Winston is a comprehensive legal research assistant that provides: \n\n• Constitutional analysis and full text search\n• Legal term definitions from Black's Law Dictionary\n• Real-time legal defense guidance\n• Sovereign citizenship legal framework education\n• Federal, state, and tax law research\n\nWinston helps users understand their legal rights and navigate complex legal situations with authoritative sources."

features:
  app_home:
    home_tab_enabled: true
    messages_tab_enabled: true
    messages_tab_read_only_enabled: false
  bot_user:
    display_name: Winston
    always_online: true
  slash_commands:
    - command: /legal-help
      description: Get legal analysis and guidance from Winston
      usage_hint: "[your legal question]"
      should_escape: true
    - command: /constitutional
      description: Search and analyze US Constitution
      usage_hint: "[amendment, article, or topic]"
      should_escape: true
    - command: /define
      description: Get legal term definitions from Black's Law Dictionary
      usage_hint: "[legal term]"
      should_escape: true
    - command: /defend-rights
      description: Get real-time legal defense guidance
      usage_hint: "[situation description]"
      should_escape: true
    - command: /sovereign-rights
      description: Learn about sovereign citizenship legal framework
      should_escape: true

oauth_config:
  scopes:
    bot:
      - app_mentions:read
      - channels:history
      - channels:read
      - chat:write
      - commands
      - groups:history
      - groups:read
      - im:history
      - im:read
      - im:write
      - users:read

settings:
  event_subscriptions:
    request_url: https://your-railway-url.railway.app/slack/events
    bot_events:
      - app_mention
      - message.channels
      - message.groups
      - message.im
  interactivity:
    is_enabled: true
    request_url: https://your-railway-url.railway.app/slack/events
  org_deploy_enabled: false
  socket_mode_enabled: false
  token_rotation_enabled: false
```

### After Using Manifest:

1. **Replace URL**: Change `your-railway-url` to your actual Railway domain
2. **Get Credentials**:
   - Go to **"OAuth & Permissions"** → Copy **Bot User OAuth Token**
   - Go to **"Basic Information"** → Copy **Signing Secret**
3. **Update Railway**:
   - Add `SLACK_BOT_TOKEN=xoxb-...`
   - Add `SLACK_SIGNING_SECRET=...`
4. **Install to Workspace**: Go to **"Install App"** → **"Install to Workspace"**
5. **Test**: Follow [Testing & Verification](#testing--verification) steps

---

## Additional Configuration (Optional)

### Socket Mode (Alternative to HTTP)

If you prefer Socket Mode instead of HTTP webhooks:

1. Go to **"Socket Mode"** in left sidebar
2. Toggle **"Enable Socket Mode"** to ON
3. Generate an App-Level Token with `connections:write` scope
4. Add to Railway: `SLACK_APP_TOKEN=xapp-...`
5. Update code to set `socketMode: true` in Bolt App config

**Note**: Socket Mode is better for development, HTTP mode is better for production.

### App Icon and Branding

1. Go to **"Basic Information"**
2. Scroll to **"Display Information"**
3. Upload app icon (recommended: 512x512 PNG with legal/scales theme)
4. Add background color (e.g., `#1A1D21` for dark theme)
5. Click **"Save Changes"**

### Bot Permissions in Channels

To allow Winston to read messages in a channel:

1. Go to the channel in Slack
2. Click channel name → **"Integrations"**
3. Click **"Add apps"**
4. Find **"Winston Legal Assistant"** and click **"Add"**

---

## Security Best Practices

1. **Never commit tokens to Git**:
   - Tokens should only exist in Railway environment variables
   - Add `.env` to `.gitignore`

2. **Rotate tokens periodically**:
   - Go to **"OAuth & Permissions"**
   - Click **"Revoke"** to revoke old token
   - **"Reinstall to Workspace"** to generate new token
   - Update Railway with new token

3. **Enable Token Rotation** (Enterprise feature):
   - Go to **"App Manifest"**
   - Set `token_rotation_enabled: true`
   - Configure rotation webhook handler

4. **Monitor bot usage**:
   - Check Railway logs regularly for suspicious activity
   - Set up log alerts for errors
   - Monitor Slack workspace audit logs

5. **Limit bot scope**:
   - Only request scopes you actually need
   - Avoid `*:write` scopes unless necessary
   - Review and remove unused scopes

---

## Useful Commands Reference

### Railway Commands

```bash
# View logs
railway logs

# Filter logs
railway logs --filter error
railway logs --filter "slack"

# Check status
railway status

# View environment variables
railway variables

# Deploy
railway up
```

### Slack API Testing

```bash
# Test health endpoint
curl https://your-railway-url.railway.app/health

# Test with verbose output
curl -v https://your-railway-url.railway.app/health

# Test Slack event simulation (requires valid token)
curl -X POST https://your-railway-url.railway.app/slack/events \
  -H "Content-Type: application/json" \
  -d '{"type":"url_verification","challenge":"test123"}'
```

---

## Support and Resources

### Official Documentation

- **Slack Bolt Framework**: https://tools.slack.dev/bolt-js/
- **Slack API Documentation**: https://api.slack.com/
- **Event Subscriptions Guide**: https://api.slack.com/events-api
- **OAuth Scopes Reference**: https://api.slack.com/scopes
- **App Manifests**: https://api.slack.com/reference/manifests

### Railway Documentation

- **Railway Docs**: https://docs.railway.app/
- **Environment Variables**: https://docs.railway.app/deploy/variables
- **Railway CLI**: https://docs.railway.app/develop/cli

### Winston Bot Resources

- **Project Repository**: (add your GitHub URL)
- **Health Check**: `https://your-railway-url.railway.app/health`
- **API Documentation**: `/docs/API.md` (if available)

---

## Checklist: Complete Setup Verification

Use this checklist to ensure everything is configured correctly:

### Configuration Checklist

- [ ] Slack app created
- [ ] All OAuth scopes added (11 bot scopes minimum)
- [ ] Bot user configured with display name
- [ ] Event Subscriptions enabled
- [ ] Request URL verified (shows ✓)
- [ ] Bot events subscribed: `app_mention`, `message.im`, `message.channels`
- [ ] All 5 slash commands created
- [ ] Interactivity enabled
- [ ] App installed to workspace
- [ ] `SLACK_BOT_TOKEN` added to Railway
- [ ] `SLACK_SIGNING_SECRET` added to Railway
- [ ] Railway service redeployed with new variables
- [ ] Health check endpoint returns 200 OK

### Testing Checklist

- [ ] `/health` endpoint responds
- [ ] `/legal-help` command works
- [ ] `/constitutional` command works
- [ ] `/define` command works
- [ ] `/defend-rights` command works
- [ ] `/sovereign-rights` command works
- [ ] Direct message to bot works
- [ ] @mention in channel works
- [ ] Bot responds within 3 seconds
- [ ] No error messages in Railway logs
- [ ] No "missing_scope" errors

---

## Congratulations!

Your Winston Legal Assistant bot is now fully configured and ready to use. Users can now:

- Ask legal questions via DM or @mentions
- Use slash commands for specific legal research
- Get constitutional analysis and legal definitions
- Receive real-time legal guidance

**Next Steps:**

1. **Add AI Features**: Configure `ANTHROPIC_API_KEY` for full AI capabilities
2. **Setup Vector Database**: Configure Pinecone for RAG-powered legal research
3. **Customize Responses**: Modify prompt templates in `/src/prompts/`
4. **Monitor Usage**: Set up analytics and logging
5. **Scale**: Upgrade Railway plan as usage grows

For questions or issues, check the [Troubleshooting](#troubleshooting) section or Railway logs.

---

**Last Updated**: November 2, 2025
**Bot Version**: 1.0.0
**Slack Bolt Version**: 3.17.0
