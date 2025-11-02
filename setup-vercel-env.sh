#!/bin/bash

# Winston Vercel Environment Variables Setup Script
# This script helps you configure all required environment variables for Vercel deployment

set -e

echo "🚀 Winston Vercel Environment Setup"
echo "===================================="
echo ""
echo "This script will help you set up environment variables for Vercel deployment."
echo "You'll need to have your API keys ready."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if vercel CLI is available
if ! command -v npx &> /dev/null; then
    echo -e "${RED}Error: npx not found. Please install Node.js${NC}"
    exit 1
fi

echo -e "${BLUE}Setting up environment variables...${NC}"
echo ""

# Function to set environment variable
set_env_var() {
    local var_name=$1
    local var_description=$2
    local is_required=$3

    echo -e "${YELLOW}${var_name}${NC}"
    echo "  Description: ${var_description}"

    if [ "$is_required" = "true" ]; then
        echo -e "  ${RED}REQUIRED${NC}"
    else
        echo "  (Optional - press Enter to skip)"
    fi

    read -p "  Enter value: " var_value

    if [ -n "$var_value" ]; then
        npx vercel env add "$var_name" production <<< "$var_value"
        echo -e "${GREEN}  ✅ Set${NC}"
    elif [ "$is_required" = "true" ]; then
        echo -e "${RED}  ⚠️  Warning: Required variable skipped${NC}"
    else
        echo "  ⏭️  Skipped"
    fi

    echo ""
}

echo "================================================"
echo "REQUIRED VARIABLES"
echo "================================================"
echo ""

# Slack Configuration
echo -e "${BLUE}=== Slack Configuration ===${NC}"
set_env_var "SLACK_BOT_TOKEN" "Your Slack bot token (starts with xoxb-)" "true"
set_env_var "SLACK_SIGNING_SECRET" "Your Slack signing secret" "true"
set_env_var "SLACK_APP_TOKEN" "Your Slack app token (starts with xapp-)" "true"

# AI APIs
echo -e "${BLUE}=== AI API Keys ===${NC}"
set_env_var "ANTHROPIC_API_KEY" "Your Claude API key (starts with sk-ant-)" "true"
set_env_var "OPENAI_API_KEY" "Your OpenAI API key (starts with sk-)" "true"

# Vector Database
echo -e "${BLUE}=== Vector Database (Pinecone) ===${NC}"
set_env_var "PINECONE_API_KEY" "Your Pinecone API key" "true"
set_env_var "PINECONE_ENVIRONMENT" "Pinecone environment (e.g., us-east-1-aws)" "true"
set_env_var "PINECONE_INDEX_NAME" "Pinecone index name (e.g., legal-knowledge)" "true"

# Redis
echo -e "${BLUE}=== Redis Configuration ===${NC}"
echo "⚠️  For Vercel, use Upstash Redis (free tier available)"
echo "   Sign up at: https://upstash.com"
set_env_var "REDIS_URL" "Redis connection URL (e.g., redis://...)" "true"

echo ""
echo "================================================"
echo "OPTIONAL VARIABLES"
echo "================================================"
echo ""

# Application Configuration
echo -e "${BLUE}=== Application Configuration ===${NC}"
set_env_var "NODE_ENV" "Environment (production recommended)" "false"
set_env_var "LOG_LEVEL" "Logging level (info, debug, error)" "false"

# N8N Integration
echo -e "${BLUE}=== N8N Integration (Optional) ===${NC}"
set_env_var "N8N_WEBHOOK_URL" "Your N8N webhook URL" "false"
set_env_var "N8N_API_KEY" "Your N8N API key" "false"

# Performance Configuration
echo -e "${BLUE}=== Performance Configuration (Optional) ===${NC}"
set_env_var "TOP_K_RETRIEVAL" "Number of documents to retrieve (default: 15)" "false"
set_env_var "SIMILARITY_THRESHOLD" "Similarity threshold (default: 0.7)" "false"

echo ""
echo "================================================"
echo -e "${GREEN}✅ Environment Variables Setup Complete!${NC}"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Run: npx vercel deploy --prod"
echo "2. Your Winston instance will be deployed"
echo "3. Note your deployment URL"
echo "4. Configure Slack app with this URL"
echo ""
echo "See DEPLOYMENT-GUIDE.md for detailed instructions"
echo ""
