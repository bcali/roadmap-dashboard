# Weekly Aggregation → Master Program Tracker

**Purpose:** After generating all weekly input files (emails, meetings, status), run this prompt to aggregate everything into the master `inputs/weekly-digest.md` tracker. This file maintains a rolling history of all weeks and serves as the AI's long-term memory.

**When to use:** Last step each week, after all 3 input files are generated.

**How to use:**
1. Ensure this week's `inputs/weekly/YYYY-WXX/` folder has emails.md, meetings.md, and status.md
2. Run this prompt — it reads the current week's files plus the existing digest
3. Output appends to the master tracker

---

<weekly_aggregation>

<inputs>
WEEK: [YYYY-WXX, e.g., 2026-W07]

THIS WEEK'S INPUT FILES:
[Paste the contents of all 3 files, or if running in Claude Code, they will be read from inputs/weekly/YYYY-WXX/]

CURRENT WEEKLY DIGEST (if exists):
[Paste the current contents of inputs/weekly-digest.md, or "FIRST RUN" if this is the first time]
</inputs>

<system_context>
You are a program management analyst maintaining a running digest of the Minor Hotels payment modernization program. This digest is the AI's institutional memory — it compounds week over week.

ACTIVE INITIATIVES: PAY-001, LOY-001, ANA-001
KPIs: Payment Success Rate (>=75%), Avg Cost/Txn (decreasing), % Hotels on Stack (increasing)

This digest serves three purposes:
1. **Rolling summary** — Quick reference of what happened each week
2. **Trend tracking** — Spot patterns across weeks (recurring blockers, velocity changes, stakeholder sentiment)
3. **Context for AI analysis** — The weekly analysis pipeline reads this digest to understand program history
</system_context>

<instructions>
Process this week's three input files (emails, meetings, status) and produce TWO outputs:

### Output 1: This Week's Digest Entry
A concise summary to append to the master tracker.

### Output 2: Updated Trend Analysis
Review the full history and update trend observations.

MASTER TRACKER FORMAT (`inputs/weekly-digest.md`):

```markdown
# Payment Program — Weekly Digest

**Last Updated:** [Date]
**Program Owner:** Brian
**Weeks Tracked:** [N]

---

## Trend Analysis

### Program Health Trajectory
[2-3 sentences on overall direction — improving, stable, declining?]

### KPI Trends
| KPI | 4 Weeks Ago | 3 Weeks Ago | 2 Weeks Ago | Last Week | This Week | Direction |
|-----|-------------|-------------|-------------|-----------|-----------|-----------|
| Payment Success Rate | - | - | - | - | [val] | [arrow] |
| Avg Cost/Txn | - | - | - | - | [val] | [arrow] |
| % Hotels on Stack | - | - | - | - | [val] | [arrow] |

### Recurring Themes
- [Theme that keeps appearing across weeks]
- [Persistent blocker or concern]

### Velocity Observations
- [Are tasks completing on schedule? Slipping? Accelerating?]

### Stakeholder Sentiment
- [Based on email tone, meeting discussions — are stakeholders satisfied, concerned, engaged?]

---

## Weekly Entries

### Week [YYYY-WXX] — [Date Range]

**Overall Assessment:** [One sentence]
**RAG Status:** [Red/Amber/Green per initiative]

| Initiative | Status | Key Event | Blocker |
|-----------|--------|-----------|---------|
| PAY-001 | [status] | [Most important thing] | [Blocker or "None"] |
| LOY-001 | [status] | [Most important thing] | [Blocker or "None"] |
| ANA-001 | [status] | [Most important thing] | [Blocker or "None"] |

**Decisions Made:**
- [Decision 1] (source: [email/meeting/status])
- [Decision 2]

**Action Items Created:**
- [ ] [Action] — [Owner] — Due: [Date]

**Risks Identified:**
- [Risk 1] — Affects: [Workstream ID]

**KPI Data Points:**
- Payment Success Rate: [value or "no data"]
- Avg Cost/Txn: [value or "no data"]
- % Hotels on Stack: [value or "no data"]

**Key Quotes:**
> "[Notable quote from meeting or email]" — [Person]

**Source Documents:**
- emails.md: [N] roadmap-relevant emails processed
- meetings.md: [N] meetings processed
- status.md: [Confluence page date]

---

### Week [YYYY-W(XX-1)] — [Previous week]
[Previous entry preserved as-is]

---
```

RULES:
- NEVER modify previous week entries — only append the new week at the top (after Trend Analysis)
- Update the Trend Analysis section based on ALL historical entries
- Keep each weekly entry concise — max 30 lines
- If this is the first run, create the full document structure with just this week's entry
- Cross-reference across the 3 input files — if emails mention something that meetings contradict, note it
- Preserve specific numbers and dates exactly
- The Trend Analysis section should grow smarter each week as more data accumulates
</instructions>

</weekly_aggregation>
