# Winston AI Legal Assistant - Complete Guide

**Version:** production-v3.0
**Model:** Claude Sonnet 4 (claude-sonnet-4-20250514)
**Platform:** Railway + Slack
**Powered by:** LEVEL 7 LABS

---

## 🎯 Overview

Winston AI is a comprehensive legal assistant for Slack with 37 specialized slash commands, document analysis, conversation memory, and RAG-enhanced responses.

### Key Features
- ✅ **37 Slash Commands** - Specialized legal expertise
- ✅ **Document Analysis** - Contract review, risk assessment, clause extraction
- ✅ **Conversation Memory** - Context-aware responses (last 10 messages)
- ✅ **RAG Integration** - Pinecone vector database for knowledge retrieval
- ✅ **Message Deduplication** - No double responses
- ✅ **Claude Sonnet 4** - Latest AI model for specialized legal roles

---

## 📋 All 37 Slash Commands

### Constitutional Law (3 commands)
- `/constitutional [query]` - Constitutional law analysis and interpretation
- `/amendment [number/topic]` - Specific amendment explanation with case law
- `/bill-of-rights [query]` - Bill of Rights analysis

### Rights & Protections (3 commands)
- `/rights [situation]` - Your legal rights in specific situations
- `/miranda [query]` - Miranda rights explanation
- `/due-process [query]` - Due process rights (5th & 14th amendments)

### Criminal Law (3 commands)
- `/criminal-defense [topic]` - Criminal defense information and strategies
- `/search-seizure [query]` - 4th Amendment search and seizure law
- `/arrest-rights` - Rights during arrest and detention

### Civil Law (3 commands)
- `/contract-law [query]` - Contract principles, breach, remedies
- `/tort-law [query]` - Negligence, torts, liability, damages
- `/property-law [query]` - Property ownership, easements, zoning

### Legal Definitions & Research (3 commands)
- `/define [term]` - Black's Law Dictionary definitions
- `/case-law [topic]` - Case law research and precedents
- `/statute [query]` - Federal/state statute explanation

### Court & Procedure (3 commands)
- `/court-procedure [query]` - Court procedures and filing requirements
- `/evidence [query]` - Rules of evidence and admissibility
- `/appeals [query]` - Appeals process and standards

### Family & Estate Law (2 commands)
- `/family-law [query]` - Divorce, custody, support, adoption
- `/estate-law [query]` - Wills, trusts, probate, inheritance

### Business & Employment (2 commands)
- `/business-law [query]` - Business formation, contracts, liability
- `/employment-law [query]` - Workplace rights, discrimination, wages

### Specialized Areas (4 commands)
- `/intellectual-property [query]` - Patents, trademarks, copyrights
- `/immigration [query]` - Visas, citizenship, deportation, asylum
- `/tax-law [query]` - IRS code, deductions, audits
- `/bankruptcy [query]` - Chapters 7/11/13, discharge

### Consumer & Housing (2 commands)
- `/consumer-rights [query]` - Consumer protection, warranties, fraud
- `/landlord-tenant [query]` - Leases, evictions, deposits

### Traffic & Motor Vehicle (2 commands)
- `/traffic-law [query]` - Traffic violations, DUI, license issues
- `/traffic-stop` - Rights during traffic stops

### Legal Process & Help (3 commands)
- `/legal-process [query]` - Legal processes and timelines
- `/find-lawyer` - How to find legal representation
- `/legal-emergency` - Emergency legal resources

### Document Analysis (5 commands)
- `/analyze-contract [text]` - Full contract analysis with red flags
- `/analyze-document [text]` - Legal document analysis
- `/summarize-document [text]` - Document summarization
- `/extract-clauses [text]` - Extract and categorize contract clauses
- `/assess-risks [text]` - Risk assessment (high/medium/low)

### General Legal (1 command)
- `/legal-help [question]` - General legal questions

---

## 💬 Communication Methods

### 1. Direct Messages
Send Winston a DM directly:
```
User: What is habeas corpus?
Winston: [Provides detailed legal explanation]
```

### 2. @Mentions in Channels
Mention Winston in any channel:
```
@Winston what are my rights during a traffic stop?
```

### 3. Slash Commands
Use specialized commands:
```
/constitutional explain the 4th amendment
/rights police interrogation
/analyze-contract [paste contract]
```

---

## 📄 Document Analysis Features

### Contract Analysis
```
/analyze-contract [paste full contract text]
```
Provides:
- Summary of key terms
- Obligations and rights for each party
- Risk assessment
- Red flags (problematic clauses)
- Recommendations

### Document Analysis
```
/analyze-document [paste document]
```
Identifies:
- Document type
- Purpose and key provisions
- Legal implications
- Action items

### Summarization
```
/summarize-document [paste long document]
```
Creates comprehensive summary with:
- Main points
- Key sections
- Important details

### Clause Extraction
```
/extract-clauses [paste contract]
```
Extracts and categorizes:
- 💰 Payment terms
- 🚪 Termination conditions
- ⚠️ Liability provisions
- 🔒 Confidentiality clauses
- 💡 Intellectual property rights

### Risk Assessment
```
/assess-risks [paste document]
```
Categorizes risks by severity:
- 🚨 HIGH RISK (immediate attention)
- ⚠️ MEDIUM RISK (should address)
- ℹ️ LOW RISK (monitor)
- ✅ Recommendations

---

## 🧠 Advanced Features

### Conversation Memory
Winston remembers your last 10 messages per user:
```
User: What is the 4th amendment?
Winston: [Explains 4th amendment]

User: When does it apply?
Winston: [Understands context, explains when 4th amendment applies]
```

### RAG (Retrieval-Augmented Generation)
When enabled with Pinecone:
- Searches legal knowledge base
- Retrieves relevant context
- Enhances responses with specific legal information
- Stores analyzed documents for future reference

**Environment Variables:**
```
PINECONE_API_KEY=your-pinecone-key
PINECONE_INDEX=winston-legal-kb
```

### Message Deduplication
Prevents double responses:
- Tracks message timestamps
- Skips duplicate events
- Automatic cleanup (last 1000 messages)

---

## 🔧 Setup & Configuration

### Required Environment Variables
```bash
# Slack Configuration
SLACK_BOT_TOKEN=xoxb-***
SLACK_SIGNING_SECRET=***

# AI Configuration
ANTHROPIC_API_KEY=sk-ant-***

# Optional: RAG Configuration
PINECONE_API_KEY=*** (optional)
PINECONE_INDEX=winston-legal-kb (optional)

# Railway Configuration
PORT=8080 (auto-assigned)
```

### Health Check
```bash
curl https://winston-production.up.railway.app/health
```

Returns:
```json
{
  "status": "ok",
  "message": "Winston AI Legal Assistant",
  "version": "production-v3.0",
  "model": "claude-sonnet-4-20250514",
  "ai": "enabled",
  "features": {
    "conversation_memory": true,
    "sonnet_4": true,
    "session_management": true,
    "context_aware": true,
    "deduplication": true
  },
  "sessions": 0
}
```

---

## 📝 Registering Slash Commands in Slack

**IMPORTANT:** Slash commands must be created in Slack app settings.

### Steps to Register All 37 Commands:

1. Go to: https://api.slack.com/apps/A09QL5XGC6M/slash-commands
2. Click "Create New Command"
3. For each command, set:
   - **Command:** `/command-name`
   - **Request URL:** `https://winston-production.up.railway.app/slack/events`
   - **Short Description:** Brief description of command
   - **Usage Hint:** `[your question]` or `[paste text]`
4. Click "Save"
5. Repeat for all 37 commands
6. Reinstall app to workspace

### Command List for Registration:
```
/legal-help
/constitutional
/amendment
/bill-of-rights
/rights
/miranda
/due-process
/criminal-defense
/search-seizure
/arrest-rights
/contract-law
/tort-law
/property-law
/define
/case-law
/statute
/court-procedure
/evidence
/appeals
/family-law
/estate-law
/business-law
/employment-law
/intellectual-property
/immigration
/tax-law
/bankruptcy
/consumer-rights
/landlord-tenant
/traffic-law
/traffic-stop
/legal-process
/find-lawyer
/legal-emergency
/analyze-contract
/analyze-document
/summarize-document
/extract-clauses
/assess-risks
```

---

## 🎓 Usage Examples

### Example 1: Constitutional Question
```
User: /constitutional what is the establishment clause?

Winston: ⚖️ Constitutional Analysis

The Establishment Clause is part of the First Amendment...
[Detailed analysis with case law]

Winston AI | Powered by LEVEL 7 LABS
```

### Example 2: Contract Analysis
```
User: /analyze-contract

This Agreement is entered into on [DATE] between...
[Full contract text]

Winston: ⚖️ Contract Analysis

**Summary:**
This is a standard service agreement...

**Key Terms:**
• Payment: Net 30 terms
• Termination: 30 days notice
• Liability: Limited to fees paid

**Red Flags:**
⚠️ Unlimited liability clause in Section 5
⚠️ Automatic renewal without notice

**Recommendations:**
1. Negotiate liability cap
2. Add termination rights
3. Require renewal notice

Winston AI | Powered by LEVEL 7 LABS
```

### Example 3: Emergency Resources
```
User: /legal-emergency

Winston: 🚨 Legal Emergency Resources

**Immediate Threats:**
• Call 911 for emergencies
• Domestic violence: 1-800-799-7233

**Arrest/Detention:**
• Remain silent
• Request lawyer immediately
• Don't consent to searches

[Full emergency guide]

Winston AI | Powered by LEVEL 7 LABS
```

---

## 🔒 Security & Privacy

### Data Handling
- **No permanent storage** of user messages (except temporary session memory)
- **Session data cleared** automatically (hourly cleanup)
- **No personal data** stored in Pinecone (only legal knowledge)
- **Secure API** connections (HTTPS only)

### Privacy Notes
- Winston provides **legal education**, not legal advice
- Conversations are not attorney-client privileged
- For legal advice, consult a licensed attorney
- Use `/find-lawyer` to locate legal representation

---

## 🚀 Deployment

### Current Deployment
- **Platform:** Railway
- **URL:** https://winston-production.up.railway.app
- **Branch:** main (auto-deploy)
- **Build:** npm install && npm run build
- **Start:** node dist/index-production.js

### Monitoring
- **Logs:** Railway dashboard
- **Health:** `/health` endpoint
- **Metrics:** Session count, AI status

---

## 📊 Technical Architecture

### Stack
- **Runtime:** Node.js + TypeScript
- **Framework:** Slack Bolt SDK v3.22.0
- **AI:** Claude Sonnet 4 (Anthropic API)
- **Vector DB:** Pinecone (optional)
- **Hosting:** Railway
- **Repository:** GitHub (auto-deploy)

### File Structure
```
app/
├── src/
│   ├── index-production.ts       # Main application
│   └── lib/
│       ├── rag.ts                # RAG & Pinecone integration
│       └── document-analysis.ts  # Document analysis functions
├── dist/                         # Compiled JavaScript
├── docs/                         # Documentation
├── railway.json                  # Railway configuration
├── package.json                  # Dependencies
└── tsconfig.json                 # TypeScript config
```

### Key Features Implementation
- **Session Management:** In-memory Map with TTL
- **Deduplication:** Set-based timestamp tracking
- **Error Handling:** Comprehensive try-catch with specific error messages
- **Logging:** Console logging with emojis for visibility

---

## 🆘 Troubleshooting

### Bot Not Responding
1. Check `/health` endpoint is returning 200
2. Verify Event Subscriptions are enabled in Slack app
3. Check Railway logs for errors
4. Ensure ANTHROPIC_API_KEY is set correctly

### Slash Commands Not Working
1. Commands must be registered in Slack app settings
2. Request URL must point to `/slack/events`
3. Reinstall app after adding commands
4. **Note:** Slash commands don't work in threads (Slack limitation)

### Double Responses
- Should be fixed with deduplication
- Check Railway logs for "Skipping duplicate message"
- Ensure `numReplicas: 1` in railway.json

### AI Errors
- Check ANTHROPIC_API_KEY is valid
- Monitor API rate limits
- Check Anthropic account status

---

## 📈 Future Enhancements

### Planned Features
- [ ] File upload support for documents
- [ ] Multi-document comparison
- [ ] Legal form generation
- [ ] Case law search integration
- [ ] State-specific legal information
- [ ] Integration with LexisNexis/Westlaw
- [ ] Advanced RAG with legal corpus
- [ ] Multi-language support

### Optional Integrations
- Redis for distributed session storage
- PostgreSQL for conversation history
- Elasticsearch for document search
- S3 for document storage

---

## 📞 Support & Resources

### Quick Links
- **Slack App:** https://api.slack.com/apps/A09QL5XGC6M
- **Railway:** https://railway.app/dashboard
- **Health Check:** https://winston-production.up.railway.app/health
- **GitHub:** (your repository)

### Getting Help
- Use `/legal-help` for general questions
- Use `/find-lawyer` for lawyer referrals
- Use `/legal-emergency` for emergencies

---

## 📜 Legal Disclaimer

Winston AI provides **legal education and information only**. This is not legal advice and does not create an attorney-client relationship. For legal advice specific to your situation, consult a licensed attorney in your jurisdiction.

Use `/find-lawyer` to locate qualified legal representation.

---

**Winston AI | Powered by LEVEL 7 LABS**
**Built with Claude Code | Deployed on Railway**

*Version 3.0 - Complete Legal Assistant with 37 Commands*
