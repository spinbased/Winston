# Winston Environment Variables - Quick Reference Guide

## 🔑 Required Environment Variables

Before deploying Winston to Vercel, you need these API keys:

### 1. Slack Configuration

**Where to get:**
1. Go to https://api.slack.com/apps
2. Select your app (or create one)
3. Go to "OAuth & Permissions" for `SLACK_BOT_TOKEN`
4. Go to "Basic Information" for `SLACK_SIGNING_SECRET`
5. Go to "Basic Information" → "App-Level Tokens" for `SLACK_APP_TOKEN`

**Required variables:**
```bash
SLACK_BOT_TOKEN=xoxb-YOUR-BOT-TOKEN-HERE
SLACK_SIGNING_SECRET=YOUR-SIGNING-SECRET-HERE
SLACK_APP_TOKEN=xapp-YOUR-APP-TOKEN-HERE
```

---

### 2. Anthropic Claude API

**Where to get:**
1. Go to https://console.anthropic.com
2. Create account or sign in
3. Go to "API Keys"
4. Create new key

**Required variables:**
```bash
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Pricing:** $3 per million input tokens, $15 per million output tokens (Haiku model)

---

### 3. OpenAI API

**Where to get:**
1. Go to https://platform.openai.com
2. Create account or sign in
3. Go to "API Keys"
4. Create new key

**Required variables:**
```bash
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Used for:**
- Text embeddings (text-embedding-3-large)
- Voice transcription (Whisper)

**Pricing:** $0.13 per million tokens (embeddings), $0.006 per minute (Whisper)

---

### 4. Pinecone Vector Database

**Where to get:**
1. Go to https://www.pinecone.io
2. Create account (free tier available)
3. Create new index:
   - Name: `legal-knowledge`
   - Dimensions: `1536`
   - Metric: `cosine`
   - Pod: `p1.x1` (starter)
4. Go to "API Keys" to get your key
5. Note your environment (e.g., `us-east-1-aws`)

**Required variables:**
```bash
PINECONE_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
PINECONE_ENVIRONMENT=us-east-1-aws
PINECONE_INDEX_NAME=legal-knowledge
```

**Pricing:** ~$70/month (p1 pod), free tier available for testing

---

### 5. Redis (Upstash Recommended)

**Where to get (Upstash - Best for Vercel):**
1. Go to https://upstash.com
2. Create account (free tier: 10k commands/day)
3. Click "Create Database"
4. Choose "Global" for best performance
5. Copy the Redis URL from dashboard

**Required variables:**
```bash
REDIS_URL=rediss://default:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@xxxxx.upstash.io:6379
```

**Alternative (Redis Cloud):**
1. Go to https://redis.com/try-free
2. Create free database
3. Copy connection string

**Pricing:**
- Upstash: Free (10k commands/day), then pay-per-request
- Redis Cloud: Free (30MB), then $5+/month

---

## 🛠️ Optional Environment Variables

### N8N Integration

**Where to get:**
1. Set up N8N instance (https://n8n.io)
2. Create webhook node
3. Copy webhook URL
4. Create API key in N8N settings

**Optional variables:**
```bash
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/winston
N8N_API_KEY=your-n8n-api-key
```

---

### Performance Tuning

**Optional variables:**
```bash
NODE_ENV=production
LOG_LEVEL=info
TOP_K_RETRIEVAL=15
SIMILARITY_THRESHOLD=0.7
```

---

## 🚀 Setting Environment Variables in Vercel

### Method 1: CLI (Interactive)

```bash
# Run the automated setup script
./setup-vercel-env.sh
```

### Method 2: CLI (Manual)

```bash
# Slack
npx vercel env add SLACK_BOT_TOKEN production
# (paste value when prompted)

npx vercel env add SLACK_SIGNING_SECRET production
npx vercel env add SLACK_APP_TOKEN production

# AI APIs
npx vercel env add ANTHROPIC_API_KEY production
npx vercel env add OPENAI_API_KEY production

# Pinecone
npx vercel env add PINECONE_API_KEY production
npx vercel env add PINECONE_ENVIRONMENT production
npx vercel env add PINECONE_INDEX_NAME production

# Redis
npx vercel env add REDIS_URL production

# Optional
npx vercel env add NODE_ENV production
npx vercel env add LOG_LEVEL production
```

### Method 3: Web Dashboard

1. Go to https://vercel.com/dashboard
2. Select your Winston project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter variable name and value
6. Select "Production" environment
7. Click **Save**
8. Repeat for all variables

---

## ✅ Verification Checklist

Before deploying, verify you have:

- [ ] Slack Bot Token (xoxb-...)
- [ ] Slack Signing Secret
- [ ] Slack App Token (xapp-...)
- [ ] Anthropic API Key (sk-ant-...)
- [ ] OpenAI API Key (sk-...)
- [ ] Pinecone API Key
- [ ] Pinecone Environment
- [ ] Pinecone Index Name
- [ ] Redis URL (Upstash or Redis Cloud)

---

## 💰 Cost Breakdown

### Free Tier (Testing)

| Service | Free Tier | Cost After |
|---------|-----------|------------|
| Vercel | 100GB bandwidth | $20/month (Pro) |
| Upstash Redis | 10k commands/day | Pay per request |
| Pinecone | 1 index (starter) | $70/month (p1 pod) |
| Anthropic | No free tier | $3-15 per 1M tokens |
| OpenAI | $5 free credits | $0.13 per 1M tokens |

### Production Estimate (10,000 queries/month)

| Service | Monthly Cost |
|---------|--------------|
| Vercel | $0 (free tier) |
| Upstash Redis | $0 (under limit) |
| Pinecone | $70 |
| Claude Haiku | $20-30 |
| OpenAI | $5-10 |
| **Total** | **~$95-110/month** |

### Heavy Usage (100,000 queries/month)

| Service | Monthly Cost |
|---------|--------------|
| Vercel | $20 (Pro tier) |
| Upstash Redis | $10-20 |
| Pinecone | $200 (scaled) |
| Claude Haiku | $150-200 |
| OpenAI | $30-50 |
| **Total** | **~$410-490/month** |

---

## 🔐 Security Best Practices

### ✅ DO:
- Store all secrets in Vercel environment variables
- Use different keys for development and production
- Rotate API keys regularly
- Enable rate limiting (already configured)
- Monitor usage via provider dashboards

### ❌ DON'T:
- Commit `.env` file to Git (already in `.gitignore`)
- Share API keys in Slack/email
- Use production keys in development
- Hardcode secrets in code
- Expose keys in client-side code

---

## 🆘 Troubleshooting

### Error: "Slack verification failed"

**Cause:** Incorrect `SLACK_SIGNING_SECRET`

**Solution:**
1. Go to Slack app settings → Basic Information
2. Copy "Signing Secret" (not App ID!)
3. Update Vercel environment variable
4. Redeploy

### Error: "Redis connection refused"

**Cause:** Invalid `REDIS_URL` or IP not whitelisted

**Solution:**
1. Verify URL format: `rediss://...` (note the double 's')
2. In Upstash dashboard, check if Vercel IPs are allowed
3. Test connection locally first

### Error: "Pinecone index not found"

**Cause:** Index doesn't exist or wrong name

**Solution:**
1. Go to Pinecone dashboard
2. Verify index name matches `PINECONE_INDEX_NAME`
3. Check index is in "Ready" state
4. Verify dimensions = 1536

### Error: "Anthropic API rate limit"

**Cause:** Too many requests or insufficient credits

**Solution:**
1. Check usage: https://console.anthropic.com/usage
2. Add payment method if needed
3. Increase rate limits in dashboard
4. Enable caching (already configured)

---

## 📚 Next Steps

After setting environment variables:

1. **Deploy to Vercel:**
   ```bash
   npx vercel deploy --prod
   ```

2. **Configure Slack app** with Vercel URL

3. **Process legal data** (locally, one-time):
   ```bash
   npm run data:all-law
   ```

4. **Test deployment:**
   ```bash
   curl https://your-winston.vercel.app/health
   ```

5. **Monitor metrics:**
   ```bash
   curl https://your-winston.vercel.app/metrics
   ```

---

## 🔗 Quick Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Slack Apps**: https://api.slack.com/apps
- **Anthropic Console**: https://console.anthropic.com
- **OpenAI Platform**: https://platform.openai.com
- **Pinecone Dashboard**: https://app.pinecone.io
- **Upstash Dashboard**: https://console.upstash.com

---

**Built with Agent OS + Claude-Flow + Claude Code**

The Ultimate Coding Agent System 🚀⚖️
