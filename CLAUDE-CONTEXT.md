# Claude Code Session Context

**Last Updated:** 2026-02-13

## Project Overview

AI-powered roadmap management system for Minor Hotels' payments modernization program. Combines a React swimlane Gantt dashboard with a Claude-driven weekly analysis pipeline.

**GitHub Repo:** https://github.com/bcali/roadmap-dashboard
**Live Dashboard:** https://bcali.github.io/roadmap-dashboard/
**Local Path:** `D:\Users\bclark\roadmap-dashboard`

## Current State

### What's Built

**Frontend (React 19 + TypeScript + Vite 7 + Tailwind CSS 4):**
- Swimlane Gantt chart with 47 items across 3 initiatives (PAY, LOY, ANA)
- KPI cards (payment success rate, avg cost/txn, % hotels on stack)
- AI Recommendations slide-out panel (parses recommendations/latest.md)
- Analysis Indicator badge in header (shows last AI run date)
- WorkstreamLink in task modals (links to workstream .md on GitHub)
- Task management (edit status, notes, comments, sub-items)
- Search, PNG export, demo mode fallback

**AI Pipeline (scripts/ — Node.js + tsx):**
- `analyze.ts` — orchestrates weekly Claude Opus 4.6 analysis with extended thinking
- `generate-workstreams.ts` — initializes .md files from CSV (already run, 14 files)
- `process-inputs.ts` — validates & indexes weekly input markdown
- `apply-recommendations.ts` — applies approved recs to CSV + JSON
- `update-kpis.ts` — extracts KPI data from status updates

**Infrastructure:**
- `data/` — enriched JSON (roadmap.json, kpis.json, analysis-history.json, input-index.json)
- `workstreams/` — active .md files per initiative and epic
- `inputs/templates/` — structured markdown templates for weekly inputs
- `prompts/` — prompts for generating input data from Outlook, Teams, Confluence
- `.github/workflows/` — deploy.yml, ai-analyze.yml (weekly cron), process-inputs.yml

### What's NOT Done Yet

- **ANTHROPIC_API_KEY** not yet added to GitHub repo secrets (needed for AI analysis)
- **No real weekly inputs** yet — templates exist but no data has been ingested
- **Phase 5** not started: expandable hierarchy in Gantt, trend sparklines, operational runbook, tests
- **Dependency arrows** not yet implemented in Gantt chart
- **Prompt library** — `add_roadmap_prompts.py` pushed to bcali/prompt-library but needs local execution

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, TypeScript 5.8, Vite 7, Tailwind CSS 4 |
| UI | Radix UI, Lucide icons, Sonner toasts, html2canvas |
| Data | PapaParse (CSV), custom JSON schemas |
| AI | @anthropic-ai/sdk, Claude Opus 4.6, extended thinking |
| Scripts | tsx (zero-build TS execution) |
| CI/CD | GitHub Actions, GitHub Pages |

## Key Design Decisions

1. **CSV stays as frontend source** — dashboard reads CSV directly. JSON is the enriched data layer for AI.
2. **Recommend only** — AI never writes to CSV. Generates recommendation .md files. User checks `[x] Approved` boxes, then runs apply script.
3. **Markdown as interface** — all inputs, outputs, and workstream notes are markdown files. Human-readable, git-trackable.
4. **Cost-conscious** — ~$2.40/weekly run (~$12/month). Extended thinking budget configurable.
5. **No backend** — pure frontend + GitHub Actions + Claude API. No server to maintain.

## NPM Scripts

```bash
npm run dev                    # Vite dev server
npm run build                  # Production build
npm run generate-workstreams   # Init .md files from CSV
npm run analyze                # Run AI analysis
npm run analyze:dry            # Dry run (no API)
npm run process-inputs         # Validate + index inputs
npm run apply-recommendations  # Apply approved recs
npm run update-kpis            # Update KPI data
```

## File Quick Reference

| What | Where |
|------|-------|
| CSV data | `public/sample-roadmap-data.csv` |
| Frontend types | `src/lib/data.ts` |
| KPI cards | `src/components/KpiCards.tsx` |
| Recommendations panel | `src/components/RecommendationsPanel.tsx` |
| Analysis indicator | `src/components/AnalysisIndicator.tsx` |
| AI analysis script | `scripts/analyze.ts` |
| Prompt engineering | `scripts/lib/prompts.ts` |
| Claude API wrapper | `scripts/lib/anthropic.ts` |
| Shared types (scripts) | `scripts/lib/types.ts` |
| Input templates | `inputs/templates/` |
| Workstream files | `workstreams/` |
| KPI data | `data/kpis.json` |
