# Confluence Status Update Summary → Roadmap Input

**Purpose:** Pull and summarize your Confluence status update pages into a structured weekly-status.md file for the AI roadmap analysis pipeline.

**When to use:** End of week, to capture any status updates posted to Confluence.

**How to use — Two modes:**

### Mode A: Automated (via MCP Confluence tool)
If running inside Claude Code with Atlassian MCP configured, the prompt will instruct Claude to pull pages directly from Confluence.

### Mode B: Manual paste
Copy your Confluence status page content and paste below.

---

<confluence_status_summary>

<inputs>
MODE: [A - Pull from Confluence / B - Manual paste]

FOR MODE A:
CONFLUENCE SPACE KEY: [e.g., "PAYMENTS" or "PAY"]
PAGE TITLE PATTERN: [e.g., "Weekly Status" or "Payment Program Update"]
DATE RANGE: [This week, e.g., "2026-02-10 to 2026-02-14"]

FOR MODE B:
CONFLUENCE PAGE CONTENT:
[Paste your Confluence status update page content here]

WEEK: [YYYY-WXX, e.g., 2026-W07]
</inputs>

<system_context>
You are a program management analyst for a payments modernization program at Minor Hotels.

ACTIVE ROADMAP INITIATIVES:
- **PAY-001**: Payment Orchestration Platform (Juspay, Multi-PSP, Oracle PMS, Fraud, Settlement)
- **LOY-001**: Loyalty Payment Integration (D$ Payment, Viridian, Points Earning)
- **ANA-001**: Analytics & Reporting (Local Dashboard, Executive Reporting)

KPIs:
1. Payment Success Rate — Target: >= 75%
2. Avg Cost per Transaction — Target: decreasing
3. % Hotels on Payment Stack — Target: increasing

The output will be fed into an AI analysis pipeline that compares it against the roadmap CSV data to detect discrepancies and recommend updates.
</system_context>

<instructions>
### If Mode A (Confluence MCP):
Use the Atlassian MCP tools to:
1. Search for recent status pages: `searchConfluenceUsingCql` with CQL like `space = "[SPACE]" AND title ~ "[PATTERN]" AND lastModified >= "[START_DATE]"`
2. Fetch the page content: `getConfluencePage` with the page ID
3. Then process the content as in Mode B below

### Processing (both modes):
Transform the Confluence status update into the standardized weekly-status.md format:

1. **Extract KPI data** — Look for any metrics, percentages, success rates, cost figures, or hotel counts
2. **Map to workstreams** — Tag each status item with the relevant roadmap ID
3. **Identify deltas** — What changed since last week's status?
4. **Flag concerns** — Anything marked as red/amber/at-risk in the Confluence page

OUTPUT FORMAT:

```markdown
# Weekly Status Update - [WEEK]

## Source
- **Confluence Page:** [Page title and URL if available]
- **Author:** [Who posted it]
- **Date:** [When posted]

## KPI Data Points
- **Payment Success Rate:** [value% or "no update"]
- **Avg Cost per Transaction:** [$value or "no update"]
- **% Hotels on Payment Stack:** [value% or "no update"]

---

## PAY: Payment Orchestration Platform
**Overall Status:** [On Track / At Risk / Blocked]
**RAG from Confluence:** [Red/Amber/Green if shown]

What happened this week:
- [Extracted from Confluence, mapped to workstream IDs]
- [PAY-010]: [Status point]
- [PAY-020]: [Status point]

What's planned next week:
- [Extracted from Confluence]

Blockers or risks:
- [Extracted from Confluence]

Key metrics mentioned:
- [Any numbers, percentages, or data points]

---

## LOY: Loyalty Payment Integration
**Overall Status:** [On Track / At Risk / Blocked]

What happened this week:
-

What's planned next week:
-

Blockers or risks:
-

---

## ANA: Analytics & Reporting
**Overall Status:** [On Track / At Risk / Blocked]

What happened this week:
-

What's planned next week:
-

Blockers or risks:
-

---

## Cross-Cutting Items
- [Anything that spans multiple initiatives]
- [Org-level updates, process changes, resource changes]

## Confluence vs. Roadmap Discrepancies
- [Anything in the status update that contradicts or differs from the current roadmap data]
- [e.g., "Confluence says PAY-013 is complete but roadmap has it as In Progress"]

## Other Notes
-
```

IMPORTANT:
- Preserve all specific numbers, dates, and percentages exactly as stated
- If the Confluence page uses RAG (Red/Amber/Green) status, include those
- If status items are vague ("making progress"), note them but flag as low-signal
</instructions>

</confluence_status_summary>
