# Remaining 26 Slash Commands to Add Manually

After creating your Slack app with the simplified manifest, add these commands manually:

**Go to:** Your Slack App → Slash Commands → Create New Command

**All commands use the same Request URL:** `https://your-winston.vercel.app/slack/events`

---

## Law Enforcement Interactions (10 commands)

### /defend-rights
- **Description:** Know your rights and how to defend them
- **Usage Hint:** police questioning

### /sovereign-rights
- **Description:** Understand individual sovereignty
- **Usage Hint:** natural rights vs legal rights

### /traffic-stop
- **Description:** Know your rights during traffic stops
- **Usage Hint:** pulled over for speeding

### /warrant-check
- **Description:** Understand warrants and when they're required
- **Usage Hint:** search warrant requirements

### /miranda-rights
- **Description:** Learn about Miranda rights
- **Usage Hint:** when do they apply?

### /search-seizure
- **Description:** 4th Amendment search and seizure law
- **Usage Hint:** illegal search

### /remain-silent
- **Description:** 5th Amendment right to remain silent
- **Usage Hint:** when to invoke

### /right-to-counsel
- **Description:** 6th Amendment right to attorney
- **Usage Hint:** public defender

### /police-misconduct
- **Description:** Report and address police misconduct
- **Usage Hint:** excessive force

### /arrest-rights
- **Description:** Know your rights when arrested
- **Usage Hint:** what happens after arrest

### /evidence-suppression
- **Description:** Motion to suppress illegally obtained evidence
- **Usage Hint:** illegal search evidence

### /qualified-immunity
- **Description:** Understand qualified immunity doctrine
- **Usage Hint:** police immunity

---

## Tax Law (9 commands)

### /irs-audit
- **Description:** Handle IRS audits
- **Usage Hint:** audit notice received

### /tax-deductions
- **Description:** Find eligible tax deductions
- **Usage Hint:** business expenses

### /tax-credits
- **Description:** Discover available tax credits
- **Usage Hint:** child tax credit

### /offshore-tax
- **Description:** International and offshore tax law
- **Usage Hint:** foreign accounts

### /tax-court
- **Description:** Tax Court procedures and cases
- **Usage Hint:** dispute with IRS

### /innocent-spouse
- **Description:** Innocent spouse relief
- **Usage Hint:** ex-spouse tax debt

### /tax-liens
- **Description:** Deal with tax liens and levies
- **Usage Hint:** IRS lien on property

### /estimated-tax
- **Description:** Calculate estimated tax payments
- **Usage Hint:** quarterly payments

### /constitutional-tax
- **Description:** Constitutional basis of taxation
- **Usage Hint:** 16th amendment

---

## Civil Law (5 commands)

### /contract-review
- **Description:** Review contracts and agreements
- **Usage Hint:** employment contract

### /legal-research
- **Description:** Comprehensive legal research
- **Usage Hint:** case law on topic

### /file-lawsuit
- **Description:** Guide to filing a lawsuit
- **Usage Hint:** small claims court

### /appeal-case
- **Description:** Appeal process and procedures
- **Usage Hint:** appellate court

### /pro-se
- **Description:** Represent yourself in court (pro se)
- **Usage Hint:** self-representation

---

## Quick Add Instructions

For each command above:

1. Go to https://api.slack.com/apps
2. Select your Winston app
3. Click **Slash Commands** in left sidebar
4. Click **Create New Command**
5. Fill in:
   - **Command:** (e.g., `/defend-rights`)
   - **Request URL:** `https://your-winston.vercel.app/slack/events`
   - **Short Description:** (copy from above)
   - **Usage Hint:** (copy from above)
6. Click **Save**
7. Repeat for all 26 commands

**Estimated time:** ~15 minutes (30 seconds per command)

---

## Bulk Add Tip

To speed this up:
1. Open Slack app settings in one browser tab
2. Keep this list open in another tab
3. Copy/paste each command quickly
4. Use keyboard shortcuts (Tab to navigate fields)

---

## Verification

After adding all commands, test each one:
```
/legal-help test
/traffic-stop test
/tax-strategy test
```

All should respond (once Winston is deployed).

---

**Built with Agent OS + Claude-Flow + Claude Code**
