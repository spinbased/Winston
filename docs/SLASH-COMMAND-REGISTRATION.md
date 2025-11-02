# Slash Command Registration Guide

**Important:** Slash commands must be registered manually in the Slack App dashboard. This guide makes it quick and easy.

## Quick Registration Steps

1. **Go to Slack App Settings:**
   - URL: https://api.slack.com/apps/A09QL5XGC6M/slash-commands
   - Click "Create New Command"

2. **For EVERY command, use:**
   - **Request URL:** `https://winston-production.up.railway.app/slack/events`
   - **Escape channels, users, and links sent to your app:** Check this box

3. **After adding all commands:**
   - Click "Reinstall App" at the top
   - This activates all new commands

---

## Copy-Paste Command Details

### General (1 command)

**Command:** `/legal-help`
**Short Description:** General legal questions and assistance
**Usage Hint:** [your legal question]

---

### Constitutional Law (3 commands)

**Command:** `/constitutional`
**Short Description:** Constitutional law analysis and interpretation
**Usage Hint:** [query about constitution]

**Command:** `/amendment`
**Short Description:** Specific constitutional amendment explanation
**Usage Hint:** [amendment number or topic]

**Command:** `/bill-of-rights`
**Short Description:** Bill of Rights analysis and protections
**Usage Hint:** [query about bill of rights]

---

### Rights & Protections (3 commands)

**Command:** `/rights`
**Short Description:** Your legal rights in specific situations
**Usage Hint:** [describe situation]

**Command:** `/miranda`
**Short Description:** Miranda rights explanation and application
**Usage Hint:** [miranda rights question]

**Command:** `/due-process`
**Short Description:** Due process rights (5th and 14th amendments)
**Usage Hint:** [due process question]

---

### Criminal Law (3 commands)

**Command:** `/criminal-defense`
**Short Description:** Criminal defense information and strategies
**Usage Hint:** [criminal law topic]

**Command:** `/search-seizure`
**Short Description:** 4th Amendment search and seizure law
**Usage Hint:** [search and seizure question]

**Command:** `/arrest-rights`
**Short Description:** Rights during arrest and detention
**Usage Hint:** [arrest situation]

---

### Civil Law (3 commands)

**Command:** `/contract-law`
**Short Description:** Contract principles, breach, and remedies
**Usage Hint:** [contract question]

**Command:** `/tort-law`
**Short Description:** Negligence, torts, liability, and damages
**Usage Hint:** [tort law question]

**Command:** `/property-law`
**Short Description:** Property ownership, easements, and zoning
**Usage Hint:** [property question]

---

### Legal Research (3 commands)

**Command:** `/define`
**Short Description:** Legal term definition from Black's Law Dictionary
**Usage Hint:** [legal term]

**Command:** `/case-law`
**Short Description:** Case law research and precedents
**Usage Hint:** [case law topic]

**Command:** `/statute`
**Short Description:** Federal or state statute explanation
**Usage Hint:** [statute query]

---

### Court & Procedure (3 commands)

**Command:** `/court-procedure`
**Short Description:** Court procedures and filing requirements
**Usage Hint:** [procedure question]

**Command:** `/evidence`
**Short Description:** Rules of evidence and admissibility
**Usage Hint:** [evidence question]

**Command:** `/appeals`
**Short Description:** Appeals process and standards of review
**Usage Hint:** [appeals question]

---

### Family & Estate Law (2 commands)

**Command:** `/family-law`
**Short Description:** Divorce, custody, support, and adoption
**Usage Hint:** [family law question]

**Command:** `/estate-law`
**Short Description:** Wills, trusts, probate, and inheritance
**Usage Hint:** [estate planning question]

---

### Business & Employment (2 commands)

**Command:** `/business-law`
**Short Description:** Business formation, contracts, and liability
**Usage Hint:** [business law question]

**Command:** `/employment-law`
**Short Description:** Workplace rights, discrimination, wages
**Usage Hint:** [employment question]

---

### Specialized Areas (4 commands)

**Command:** `/intellectual-property`
**Short Description:** Patents, trademarks, and copyrights
**Usage Hint:** [IP question]

**Command:** `/immigration`
**Short Description:** Visas, citizenship, deportation, asylum
**Usage Hint:** [immigration question]

**Command:** `/tax-law`
**Short Description:** IRS code, deductions, and audits
**Usage Hint:** [tax question]

**Command:** `/bankruptcy`
**Short Description:** Bankruptcy chapters 7/11/13 and discharge
**Usage Hint:** [bankruptcy question]

---

### Consumer & Housing (2 commands)

**Command:** `/consumer-rights`
**Short Description:** Consumer protection and warranties
**Usage Hint:** [consumer rights question]

**Command:** `/landlord-tenant`
**Short Description:** Leases, evictions, and security deposits
**Usage Hint:** [landlord-tenant question]

---

### Traffic & Motor Vehicle (2 commands)

**Command:** `/traffic-law`
**Short Description:** Traffic violations, DUI, and license issues
**Usage Hint:** [traffic law question]

**Command:** `/traffic-stop`
**Short Description:** Rights during traffic stops
**Usage Hint:** [traffic stop question]

---

### Legal Process & Help (3 commands)

**Command:** `/legal-process`
**Short Description:** Legal processes and timelines
**Usage Hint:** [process question]

**Command:** `/find-lawyer`
**Short Description:** How to find legal representation
**Usage Hint:** (leave empty)

**Command:** `/legal-emergency`
**Short Description:** Emergency legal resources
**Usage Hint:** (leave empty)

---

### Document Analysis (5 commands)

**Command:** `/analyze-contract`
**Short Description:** Full contract analysis with red flags
**Usage Hint:** [paste contract text]

**Command:** `/analyze-document`
**Short Description:** Legal document analysis
**Usage Hint:** [paste document text]

**Command:** `/summarize-document`
**Short Description:** Document summarization
**Usage Hint:** [paste document text]

**Command:** `/extract-clauses`
**Short Description:** Extract and categorize contract clauses
**Usage Hint:** [paste contract text]

**Command:** `/assess-risks`
**Short Description:** Risk assessment (high/medium/low)
**Usage Hint:** [paste document text]

---

## Quick Checklist

- [ ] Go to https://api.slack.com/apps/A09QL5XGC6M/slash-commands
- [ ] Click "Create New Command" for each of 37 commands above
- [ ] Use Request URL: `https://winston-production.up.railway.app/slack/events`
- [ ] Copy command name, description, and usage hint from above
- [ ] Check "Escape channels, users, and links"
- [ ] Click "Reinstall App" when all commands are added
- [ ] Test commands in Slack!

---

## All Command Names (for quick reference)

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

## Notes

- **All commands are already implemented** in the code and deployed
- They just need to be registered in Slack to be accessible
- Registration takes about 10-15 minutes for all 37 commands
- After registration, reinstall the app to activate them
- Commands will work immediately after reinstall

---

**Winston AI | Powered by LEVEL 7 LABS**
