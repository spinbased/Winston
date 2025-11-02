# Winston - Quick Start Guide 🚀

Get Winston up and running in 3 easy steps!

## Option 1: Automated GitHub Setup (Recommended)

### Run the automated script:

```bash
cd /mnt/c/Users/qntm5/legal-slack-bot/app

# Make script executable (if not already)
chmod +x setup-github.sh

# Run the setup script
./setup-github.sh
```

**What it does**:
1. ✅ Installs GitHub CLI (if needed)
2. ✅ Authenticates with GitHub (interactive login)
3. ✅ Creates "Winston" repository
4. ✅ Adds repository topics
5. ✅ Pushes all code to GitHub
6. ✅ Displays repository URL

**Total time**: ~3-5 minutes

---

## Option 2: Manual GitHub Setup

If the script doesn't work or you prefer manual setup:

### 1. Install GitHub CLI

```bash
# Ubuntu/Debian/WSL
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh -y
```

### 2. Authenticate

```bash
gh auth login
```

Follow the prompts:
- Choose: GitHub.com
- Protocol: HTTPS
- Authenticate: Login with web browser

### 3. Create Repository & Push

```bash
# Create repository
gh repo create Winston \
    --public \
    --source=. \
    --description="AI Legal Defense System with 805,000+ legal documents" \
    --remote=origin

# Push code
git push -u origin main

# Add topics
gh repo edit --add-topic ai,legal-tech,slack-bot,rag,vector-database,claude,openai,typescript,vercel,n8n
```

### 4. Get Repository URL

```bash
gh repo view --web
```

---

## Option 3: Web Interface (No CLI)

### 1. Create Repository

1. Go to: https://github.com/new
2. Repository name: `Winston`
3. Description: `AI Legal Defense System with 805,000+ legal documents`
4. Visibility: Public
5. **DO NOT** initialize with README
6. Click **Create repository**

### 2. Push Code

```bash
cd /mnt/c/Users/qntm5/legal-slack-bot/app

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/Winston.git

# Push
git push -u origin main
```

### 3. Add Topics

Go to your repository → Settings → Topics → Add:
```
ai, legal-tech, slack-bot, rag, vector-database, claude, openai,
typescript, vercel, n8n, automation, legal-assistant
```

---

## After GitHub Setup

### Deploy to Vercel (5 minutes)

1. Go to: https://vercel.com/new
2. Click **Import Git Repository**
3. Select your Winston repository
4. Configure:
   - Framework: Other
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add Environment Variables (see .env.template)
6. Click **Deploy**

Your Winston will be live at: `https://winston-xxx.vercel.app`

### Test Deployment

```bash
# Check health
curl https://your-winston.vercel.app/health

# Check metrics
curl https://your-winston.vercel.app/metrics
```

---

## Environment Variables for Vercel

Copy from `.env.template` and add in Vercel dashboard:

**Required**:
- `SLACK_BOT_TOKEN`
- `SLACK_SIGNING_SECRET`
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `PINECONE_API_KEY`
- `REDIS_URL` (use Upstash free tier)

**Optional**:
- `SLACK_APP_TOKEN`
- `N8N_WEBHOOK_URL`
- `LOG_LEVEL=info`

---

## Process Legal Data (One-Time)

After Vercel deployment, process data **locally** (one-time setup):

```bash
# Install dependencies
npm install

# Option A: Process base data only (~15 min)
npm run data:process-all

# Option B: Process ALL legal data (~3-5 hours)
npm run data:all-law
```

This uploads embeddings to Pinecone. The bot then has access to all 805,000 documents.

---

## Configure Slack App

1. Go to: https://api.slack.com/apps
2. Click **Create New App** → From scratch
3. Name: "Winston Legal AI"
4. Add OAuth scopes (see DEPLOYMENT-GUIDE.md)
5. Create 31 slash commands (all point to your Vercel URL)
6. Enable event subscriptions
7. Install to workspace

---

## Verify Everything Works

### In Slack:
```
/legal-help What is habeas corpus?
/constitutional 4th amendment
/traffic-stop pulled over for speeding
/tax-strategy minimize my taxes
```

### Voice Message:
Send audio message → Winston transcribes and responds

### Health Check:
```bash
curl https://your-winston.vercel.app/health
```

---

## Troubleshooting

### GitHub CLI won't install
- Try Option 3 (Web Interface)
- Or install manually: https://cli.github.com/manual/

### Authentication fails
```bash
# Re-authenticate
gh auth logout
gh auth login
```

### Push fails
```bash
# Check remote
git remote -v

# Remove and re-add
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/Winston.git
git push -u origin main
```

### Vercel deployment fails
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Ensure `npm run build` works locally

---

## Need Help?

- **GitHub Setup**: See GITHUB-SETUP.md
- **Vercel Deployment**: See DEPLOYMENT-GUIDE.md
- **Full Documentation**: See README.md
- **N8N Integration**: See n8n-workflows/README.md

---

## Quick Links

- **Create GitHub Repo**: https://github.com/new
- **Deploy to Vercel**: https://vercel.com/new
- **Slack Apps**: https://api.slack.com/apps
- **Upstash Redis**: https://upstash.com
- **Pinecone**: https://www.pinecone.io

---

**Built with Agent OS + Claude-Flow + Claude Code**

The Ultimate Coding Agent System 🚀⚖️
