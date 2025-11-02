#!/bin/bash

# Winston GitHub Setup Script
# Automates GitHub repository creation and push

set -e

echo "🚀 Winston GitHub Setup Script"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check if GitHub CLI is installed
echo -e "${BLUE}Step 1: Checking GitHub CLI...${NC}"
if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}GitHub CLI not found. Installing...${NC}"

    # Install GitHub CLI (Ubuntu/Debian)
    curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
    sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
    sudo apt update
    sudo apt install gh -y

    echo -e "${GREEN}✅ GitHub CLI installed${NC}"
else
    echo -e "${GREEN}✅ GitHub CLI already installed${NC}"
fi

# Step 2: Authenticate with GitHub
echo ""
echo -e "${BLUE}Step 2: GitHub Authentication${NC}"
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}Not authenticated. Starting login process...${NC}"
    gh auth login
else
    echo -e "${GREEN}✅ Already authenticated with GitHub${NC}"
fi

# Step 3: Create GitHub repository
echo ""
echo -e "${BLUE}Step 3: Creating GitHub Repository 'Winston'${NC}"

# Check if remote already exists
if git remote get-url origin &> /dev/null; then
    echo -e "${YELLOW}Remote 'origin' already exists. Removing...${NC}"
    git remote remove origin
fi

# Create repository
gh repo create Winston \
    --public \
    --source=. \
    --description="AI Legal Defense System with 805,000+ legal documents covering the entire US legal system. Features 31 specialized Slack commands, voice support, session memory, and smart caching. Built with Agent OS + Claude-Flow + Claude Code." \
    --remote=origin

echo -e "${GREEN}✅ Repository created${NC}"

# Step 4: Add topics
echo ""
echo -e "${BLUE}Step 4: Adding repository topics${NC}"
gh repo edit --add-topic ai,legal-tech,slack-bot,rag,vector-database,claude,openai,typescript,vercel,n8n,automation,legal-assistant,law-enforcement,tax-law,constitutional-law,agent-os,claude-flow

echo -e "${GREEN}✅ Topics added${NC}"

# Step 5: Push to GitHub
echo ""
echo -e "${BLUE}Step 5: Pushing code to GitHub${NC}"
git push -u origin main

echo -e "${GREEN}✅ Code pushed to GitHub${NC}"

# Step 6: Get repository URL
REPO_URL=$(gh repo view --json url -q .url)

echo ""
echo "================================"
echo -e "${GREEN}🎉 SUCCESS! Winston is now on GitHub!${NC}"
echo ""
echo -e "${BLUE}Repository URL:${NC} $REPO_URL"
echo ""
echo "Next steps:"
echo "1. Deploy to Vercel: https://vercel.com/new"
echo "2. Configure Slack app at: https://api.slack.com/apps"
echo "3. Process data: npm run data:all-law"
echo "4. Setup N8N workflows (optional)"
echo ""
echo "See DEPLOYMENT-GUIDE.md for detailed instructions"
echo ""
echo -e "${GREEN}Built with Agent OS + Claude-Flow + Claude Code${NC}"
echo "================================"
