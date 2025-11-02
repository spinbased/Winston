# Winston - AI Legal Defense System 🤖⚖️

The most comprehensive AI legal assistant ever created, powered by 805,000+ legal documents spanning the entire US legal system.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

## 🌟 Features

- **31 Specialized Slash Commands** - Law enforcement, tax law, contracts, and more
- **805,000+ Legal Documents** - Complete US legal system coverage
- **Voice Message Support** - Whisper AI transcription
- **Session Memory** - 24-hour conversation history
- **Smart Caching** - 98% semantic similarity matching
- **Production Ready** - Health checks, metrics, logging, rate limiting

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Redis
- API Keys: Slack, Anthropic (Claude), OpenAI, Pinecone

### Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.template .env
# Edit .env with your API keys

# Build
npm run build

# Start Redis
redis-server &

# Run
npm start
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

## 📚 Data Processing

### Process Base Legal Data (~15 min)

```bash
npm run data:process-all
```

### Process ALL Law Data (~3-5 hours)

```bash
# Federal + State + Tax law
npm run data:all-law

# Or individually
npm run data:federal  # 1.2 GB, 55k docs
npm run data:state    # 2.6 GB, 510k docs
npm run data:tax      # 1.3 GB, 225k docs
```

## 💬 Available Commands

### General Legal (5 commands)
- `/legal-help` - General legal assistance
- `/constitutional` - Constitutional analysis
- `/define` - Legal term definitions
- `/defend-rights` - Legal defense guidance
- `/sovereign-rights` - Sovereign citizenship framework

### Law Enforcement (10 commands)
- `/traffic-stop` - Real-time traffic stop defense
- `/warrant-check` - Warrant validity verification
- `/miranda-rights` - Miranda rights explanation
- `/search-seizure` - 4th Amendment rights
- `/remain-silent` - 5th Amendment guidance
- `/right-to-counsel` - 6th Amendment attorney rights
- `/police-misconduct` - File complaint guidance
- `/arrest-rights` - What to do when arrested
- `/evidence-suppression` - Motion to suppress evidence
- `/qualified-immunity` - Challenge qualified immunity

### Tax Law (10 commands)
- `/tax-strategy` - Aggressive tax minimization
- `/irs-audit` - IRS audit defense
- `/tax-deductions` - Maximize deductions
- `/tax-credits` - All available credits
- `/offshore-tax` - International tax strategies
- `/tax-court` - Tax Court litigation
- `/innocent-spouse` - Innocent spouse relief
- `/tax-liens` - Handle IRS liens/levies
- `/estimated-tax` - Quarterly payment strategy
- `/constitutional-tax` - Constitutional tax challenges

### General Legal Services (5 commands)
- `/contract-review` - Contract analysis
- `/legal-research` - Case law research
- `/file-lawsuit` - Civil lawsuit guidance
- `/appeal-case` - Appellate procedure
- `/pro-se` - Self-representation guide

### Utility (1 command)
- `/new-session` - Reset conversation history

## 🔧 Production Endpoints

- `GET /health` - Service health check
- `GET /metrics` - System metrics

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│         Slack Interface             │
│  31 Commands + Voice + Sessions     │
└──────────────┬──────────────────────┘
               │
┌──────────────┴──────────────────────┐
│     Enhanced Legal Slack Bot        │
│  Session │ Cache │ Voice │ Legal    │
└──────────────┬──────────────────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
┌───▼───┐ ┌───▼────┐ ┌───▼─────┐
│ Redis │ │Pinecone│ │ Claude  │
│       │ │ Vector │ │ Haiku   │
│       │ │   DB   │ │  4.5    │
└───────┘ └────────┘ └─────────┘
```

## 📊 Knowledge Base

| Source | Documents | Size |
|--------|-----------|------|
| Base Legal | 15,000 | 128 MB |
| Federal Law | 55,000 | 1.2 GB |
| State Law | 510,000 | 2.6 GB |
| Tax Law | 225,000 | 1.3 GB |
| **TOTAL** | **805,000** | **5.2 GB** |

## 🔐 Environment Variables

See `.env.template` for all required variables:

- `SLACK_BOT_TOKEN` - Your Slack bot token
- `SLACK_SIGNING_SECRET` - Slack signing secret
- `ANTHROPIC_API_KEY` - Claude API key
- `OPENAI_API_KEY` - OpenAI API key (embeddings + Whisper)
- `PINECONE_API_KEY` - Pinecone vector DB key
- `REDIS_URL` - Redis connection URL

## 💰 Costs

- **One-Time**: ~$300 (embeddings)
- **Monthly**: ~$250-340 (Pinecone + APIs + hosting)
- **Per-Query**: ~$0.0001

## 🛠️ Development

```bash
# Development mode with auto-reload
npm run dev

# Build
npm run build

# Lint
npm run lint

# Format
npm run format

# Type check
npm run typecheck
```

## 📝 NPM Scripts

### Data Processing
- `data:extract-pdf` - Extract text from PDFs
- `data:parse-definitions` - Parse Black's Law Dictionary
- `data:parse-constitutional` - Parse Constitution
- `data:parse-founding` - Parse Founding Documents
- `data:chunk` - Chunk all documents
- `data:embed` - Generate embeddings
- `data:load` - Load to Pinecone
- `data:process-all` - Run full base pipeline
- `data:federal` - Process federal law
- `data:state` - Process state law
- `data:tax` - Process tax law
- `data:all-law` - Process ALL law data

## 🧪 Testing

```bash
# Run tests
npm test

# Test coverage
npm run test:coverage
```

## 🤝 N8N Integration

Winston can integrate with n8n for workflow automation. See `n8n-workflows/` directory for templates.

Example workflows:
- Automated legal research triggers
- Document processing pipelines
- Multi-agent legal analysis
- Scheduled report generation

## 📖 Documentation

- [FINAL-COMPLETION-REPORT.md](FINAL-COMPLETION-REPORT.md) - Complete feature documentation
- [PROGRESS-REPORT-SESSION-2.md](PROGRESS-REPORT-SESSION-2.md) - Development progress
- [Agent OS Specs](agent-os/specs/) - Technical specifications

## 🏆 Built With

- **Agent OS** - Spec-driven development
- **Claude-Flow** - Multi-agent orchestration
- **Claude Code** - Implementation
- **TypeScript** - Type-safe code
- **Slack Bolt** - Slack integration
- **Anthropic Claude** - AI reasoning
- **OpenAI** - Embeddings & Whisper
- **Pinecone** - Vector database
- **Redis** - Caching & sessions

## ⚖️ Legal Disclaimer

This is an educational AI assistant. It provides legal information, NOT legal advice. Always consult a licensed attorney for your specific legal situation.

## 📄 License

MIT

## 🙏 Acknowledgments

Built using the Ultimate Coding Agent System:
- Agent OS by Builder Methods
- Claude-Flow by rUv
- Claude Code by Anthropic

---

**Winston** - Your AI Legal Defense Companion ⚖️🤖

Made with ❤️ using Agent OS + Claude-Flow + Claude Code
