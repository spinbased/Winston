# Railway Deployment Checklist

## Pre-Deployment Checklist

### 1. Code Preparation
- [x] Code committed to git repository
- [x] TypeScript compiles without errors (`npm run build`)
- [x] All dependencies listed in package.json
- [x] railway.json configured correctly
- [x] Procfile configured correctly
- [ ] Git repository pushed to GitHub/GitLab/Bitbucket

### 2. Railway Setup
- [ ] Railway account created at https://railway.app
- [ ] Railway CLI installed (optional): `npm i -g @railway/cli`
- [ ] Project created in Railway dashboard
- [ ] GitHub repository connected to Railway project

### 3. Environment Variables (Minimal Mode)
Required for basic functionality:
- [ ] `SLACK_BOT_TOKEN` - From https://api.slack.com/apps → OAuth & Permissions
- [ ] `SLACK_SIGNING_SECRET` - From https://api.slack.com/apps → Basic Information

### 4. Slack App Configuration
- [ ] Slack app created at https://api.slack.com/apps
- [ ] Bot Token Scopes added:
  - [ ] `chat:write` - Send messages
  - [ ] `commands` - Handle slash commands
  - [ ] `app_mentions:read` - Read mentions
- [ ] Slash command `/legal-help` created
- [ ] Request URL set to: `https://your-app.up.railway.app/slack/events`
- [ ] Event subscriptions enabled
- [ ] Bot installed to workspace

---

## Deployment Checklist

### Phase 1: Initial Deployment (Minimal Mode)

#### Step 1: Push Code to Repository
```bash
cd /mnt/c/Users/qntm5/legal-slack-bot/app
git status
git push origin main
```
- [ ] Code pushed to GitHub
- [ ] Railway detects push and starts build

#### Step 2: Monitor Build
- [ ] Check Railway dashboard for build status
- [ ] Build command runs: `npm install && npm run build`
- [ ] Build completes successfully
- [ ] No TypeScript errors in logs

#### Step 3: Configure Environment Variables
In Railway Variables tab, add:
- [ ] `SLACK_BOT_TOKEN` = `xoxb-...`
- [ ] `SLACK_SIGNING_SECRET` = `...`

#### Step 4: Deployment Starts
- [ ] Railway starts container with: `node dist/index-minimal.js`
- [ ] Health check passes at `/health`
- [ ] No crash errors in logs

#### Step 5: Update Slack Request URL
- [ ] Copy Railway app URL from dashboard
- [ ] Update Slack app Request URL to: `https://your-app.up.railway.app/slack/events`
- [ ] Slack verifies URL successfully (green checkmark)

#### Step 6: Test Basic Functionality
- [ ] Open Slack workspace
- [ ] Type `/legal-help` in any channel
- [ ] Bot responds with: "✅ Winston is running! Add API keys to enable full features."
- [ ] No errors in Railway logs

**Status**: Minimal mode deployment complete! ✅

---

### Phase 2: Upgrade to Full Mode (Redis)

#### Step 1: Add Redis Service
- [ ] Railway dashboard → Click "+ New"
- [ ] Select "Database" → "Add Redis"
- [ ] Redis service provisioned successfully
- [ ] Redis is running (green status indicator)

#### Step 2: Get Redis Connection URL
- [ ] Click Redis service in Railway
- [ ] Go to "Variables" tab
- [ ] Copy `REDIS_URL` value
- [ ] Format verified: `redis://default:password@host:port`

#### Step 3: Add Redis to App Service
- [ ] Go back to app service (not Redis service)
- [ ] Click "Variables" tab
- [ ] Add new variable: `REDIS_URL` = `redis://...`
- [ ] Variable saved successfully

#### Step 4: Update Configuration Files
Update `railway.json`:
```json
{
  "deploy": {
    "startCommand": "node dist/index.js"
  }
}
```

Update `Procfile`:
```
web: node dist/index.js
```

- [ ] Files updated locally
- [ ] Changes committed to git
- [ ] Changes pushed to GitHub

#### Step 5: Monitor Deployment
- [ ] Railway detects push and rebuilds
- [ ] Build completes successfully
- [ ] App starts with full version: `node dist/index.js`
- [ ] Check logs for: "✅ Redis connected successfully"

#### Step 6: Test Redis Functionality
- [ ] Bot responds to `/legal-help`
- [ ] Sessions are persisted (test conversation continuity)
- [ ] No Redis connection errors in logs

**Status**: Full mode with Redis complete! ✅

---

### Phase 3: Enable AI Features

#### Step 1: Get Anthropic API Key
- [ ] Sign up at https://console.anthropic.com
- [ ] Navigate to API Keys section
- [ ] Create new API key
- [ ] Copy key (starts with `sk-ant-`)
- [ ] Save key securely

#### Step 2: Add API Key to Railway
- [ ] Railway → App service → Variables
- [ ] Add: `ANTHROPIC_API_KEY` = `sk-ant-...`
- [ ] Railway auto-redeploys

#### Step 3: Verify AI Features
- [ ] Check logs for: "✅ Anthropic client initialized"
- [ ] Test legal question in Slack
- [ ] Bot provides AI-powered response
- [ ] Response quality is good

**Status**: AI features enabled! ✅

---

### Phase 4: Add Legal Knowledge Base (Optional)

#### Step 1: Set Up Pinecone
- [ ] Sign up at https://www.pinecone.io
- [ ] Create new project
- [ ] Create index named `legal-knowledge`
- [ ] Get API key from dashboard
- [ ] Note environment region (e.g., `us-east1-gcp`)

#### Step 2: Add Pinecone to Railway
Railway Variables:
- [ ] `PINECONE_API_KEY` = `your-key`
- [ ] `PINECONE_ENVIRONMENT` = `us-east1-gcp`
- [ ] `PINECONE_INDEX_NAME` = `legal-knowledge`

#### Step 3: Populate Knowledge Base
- [ ] Prepare legal documents (PDF, TXT, etc.)
- [ ] Run document ingestion script (if available)
- [ ] Verify vectors in Pinecone dashboard
- [ ] Test retrieval with sample query

#### Step 4: Verify RAG Features
- [ ] Ask bot a legal question
- [ ] Check if response includes knowledge base sources
- [ ] Verify citation accuracy
- [ ] Test with various legal topics

**Status**: Full RAG system deployed! ✅

---

## Post-Deployment Checklist

### Monitoring
- [ ] Railway logs show no errors
- [ ] Health check endpoint responding: `GET /health`
- [ ] Slack commands working reliably
- [ ] Redis connection stable
- [ ] AI responses generating correctly

### Performance
- [ ] Response time < 3 seconds for basic commands
- [ ] Response time < 10 seconds for AI queries
- [ ] No memory leaks (monitor Railway metrics)
- [ ] CPU usage reasonable (< 80% average)

### Security
- [ ] All API keys stored in Railway Variables (not in code)
- [ ] No secrets committed to git repository
- [ ] Railway environment is "production"
- [ ] Slack signing secret verified on all requests

### Documentation
- [ ] Deployment URL documented
- [ ] Environment variables documented
- [ ] Slack app configuration documented
- [ ] Troubleshooting steps documented

---

## Rollback Plan

### If Deployment Fails

#### Option 1: Rollback to Previous Commit
```bash
git log --oneline -5
git revert HEAD
git push origin main
```
- [ ] Railway auto-deploys previous working version

#### Option 2: Rollback to Minimal Mode
```bash
# Update railway.json
"startCommand": "node dist/index-minimal.js"

# Update Procfile
web: node dist/index-minimal.js

git commit -am "rollback: Revert to minimal mode"
git push origin main
```
- [ ] Railway deploys minimal version without Redis

#### Option 3: Manual Rollback in Railway
- [ ] Railway dashboard → Deployments tab
- [ ] Find last working deployment
- [ ] Click "..." menu → "Redeploy"

---

## Validation Tests

### Test 1: Health Check
```bash
curl https://your-app.up.railway.app/health
```
Expected:
```json
{"status": "ok", "message": "Winston minimal mode"}
```
- [ ] Test passes

### Test 2: Slack Command
In Slack:
```
/legal-help
```
Expected: Bot responds immediately
- [ ] Test passes

### Test 3: AI Response (if enabled)
In Slack:
```
/legal-help What is a contract?
```
Expected: Detailed AI response about contracts
- [ ] Test passes

### Test 4: Redis Connection (if enabled)
Check Railway logs for:
```
✅ Redis connected successfully
```
- [ ] Test passes

---

## Environment-Specific Checklists

### Development
- [ ] Use separate Slack app for development
- [ ] Use development environment variables
- [ ] Test locally with `npm run dev`
- [ ] Use local Redis: `docker run -d -p 6379:6379 redis:alpine`

### Staging (Optional)
- [ ] Create separate Railway project for staging
- [ ] Use staging Slack app
- [ ] Test with staging API keys
- [ ] Validate all features before production

### Production
- [ ] Use production Slack app
- [ ] Use production API keys with spending limits
- [ ] Enable Railway monitoring and alerts
- [ ] Set up log aggregation (optional)

---

## Troubleshooting Guide

### Issue: Build Fails on Railway

**Symptoms**: Red status, build errors in logs

**Checks**:
- [ ] Verify `package.json` dependencies are correct
- [ ] Check for TypeScript compilation errors
- [ ] Ensure `npm run build` works locally
- [ ] Verify Node.js version compatibility

**Solution**:
```bash
# Test locally
npm install
npm run build

# Check logs
railway logs

# Fix errors and redeploy
git commit -am "fix: Build errors"
git push
```

---

### Issue: App Crashes After Deployment

**Symptoms**: Yellow/red status, crashes in logs

**Checks**:
- [ ] Environment variables are set correctly
- [ ] `SLACK_BOT_TOKEN` and `SLACK_SIGNING_SECRET` are valid
- [ ] Health check endpoint is responding
- [ ] No unhandled promise rejections

**Solution**:
1. Check Railway logs for error messages
2. Verify all required environment variables
3. Test locally with same environment variables
4. Rollback to last working deployment if needed

---

### Issue: Slack Not Responding

**Symptoms**: Bot doesn't respond to commands

**Checks**:
- [ ] Slack Request URL is correct
- [ ] URL verification passed (green checkmark)
- [ ] Bot has correct OAuth scopes
- [ ] App is installed in workspace

**Solution**:
1. Verify Request URL: `https://your-app.up.railway.app/slack/events`
2. Check Slack API logs at api.slack.com/apps
3. Reinstall Slack app if needed
4. Check Railway logs for incoming requests

---

### Issue: Redis Connection Fails

**Symptoms**: Redis errors in logs

**Checks**:
- [ ] Redis service is running in Railway
- [ ] `REDIS_URL` is set in app service
- [ ] Redis and app are in same Railway project
- [ ] URL format is correct

**Solution**:
1. Verify Redis service status
2. Check `REDIS_URL` format: `redis://default:password@host:port`
3. Test connection with Railway Redis CLI
4. Fallback to minimal mode if needed

---

### Issue: AI Not Responding

**Symptoms**: No AI responses, generic messages

**Checks**:
- [ ] `ANTHROPIC_API_KEY` is set
- [ ] Key is valid (test at console.anthropic.com)
- [ ] Key has not exceeded rate limits
- [ ] Logs show Anthropic initialization

**Solution**:
1. Verify API key at Anthropic dashboard
2. Check API usage and limits
3. Test with simple prompt
4. Check Railway logs for API errors

---

## Next Steps After Deployment

### Immediate (Next 24 Hours)
- [ ] Monitor Railway logs for errors
- [ ] Test all Slack commands
- [ ] Verify health check is passing
- [ ] Confirm no memory/CPU issues

### Short-term (Next Week)
- [ ] Set up Railway monitoring alerts
- [ ] Document any issues encountered
- [ ] Optimize API usage (if needed)
- [ ] Gather user feedback

### Long-term (Next Month)
- [ ] Review and optimize costs
- [ ] Add additional features
- [ ] Improve documentation
- [ ] Consider scaling strategy

---

## Quick Reference

### Railway Commands
```bash
# Install CLI
npm i -g @railway/cli

# Login
railway login

# View logs
railway logs

# List variables
railway variables

# Set variable
railway variables set KEY=value

# Open dashboard
railway open
```

### Git Commands
```bash
# Status
git status

# Commit
git commit -am "message"

# Push
git push origin main

# Rollback
git revert HEAD
```

### Testing Commands
```bash
# Build locally
npm run build

# Test locally
npm run dev

# Health check
curl http://localhost:3000/health
```

---

## Support Resources

- **Railway Documentation**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Slack API Documentation**: https://api.slack.com/docs
- **Anthropic Documentation**: https://docs.anthropic.com
- **Project Documentation**: See `docs/` folder

---

**Last Updated**: 2025-11-02
**Version**: 1.0
**Maintained By**: Railway Deployment Coordinator
**Related Docs**:
- RAILWAY-QUICK-FIX.md
- RAILWAY-ENV-CHECKLIST.md
- VERCEL-DEPLOYMENT-SUMMARY.md
