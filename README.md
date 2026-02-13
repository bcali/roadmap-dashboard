# Payment Roadmap Dashboard

AI-powered roadmap management system for the payments modernization program. Built with React 19, TypeScript, Vite 7, and Tailwind CSS 4, with a Claude-driven analysis pipeline that ingests weekly inputs and generates actionable recommendations.

**Live Dashboard:** https://bcali.github.io/roadmap-dashboard/

## What It Does

This system goes beyond a static Gantt chart. It combines visual roadmap tracking with an AI analysis pipeline that:

- **Visualizes** 47 roadmap items across 3 initiatives in an interactive swimlane Gantt chart
- **Tracks KPIs** — payment success rate (target: >=75%), avg cost per transaction, % hotels on payment stack
- **Ingests weekly inputs** — structured markdown templates for emails, meetings, and status updates
- **Analyzes with AI** — Claude Opus 4.6 reviews inputs against the roadmap and generates change recommendations
- **Maintains workstream notes** — active `.md` files per initiative, epic, and task that accumulate context over time
- **Recommends, doesn't act** — all AI suggestions require human approval before applying to the roadmap

## Architecture

```
Weekly Inputs (markdown templates)
  --> Push to main
  --> GitHub Actions: process-inputs.yml validates & indexes
  --> GitHub Actions: ai-analyze.yml (weekly cron Monday 9AM UTC)
      --> Claude Opus 4.6 analyzes inputs + roadmap + history
      --> Generates recommendations/YYYY-WXX.md
      --> Updates workstreams/*.md with observations
  --> User reviews recommendations, checks [x] Approved boxes
  --> User runs apply script --> CSV + JSON updated
  --> deploy.yml auto-deploys updated dashboard
```

## Dashboard Features

- **Swimlane Gantt Chart** — tasks organized by epic with color-coded status bars
- **KPI Cards** — 3 key metrics with target thresholds, trend indicators, and status colors
- **AI Recommendations Panel** — slide-out sidebar listing latest AI-generated recommendations
- **Analysis Indicator** — header badge showing last AI analysis date with recency coloring
- **Workstream Links** — click through from any task to its workstream notes on GitHub
- **Real-time Search** — filter tasks instantly by title
- **Task Management** — click any task to view/edit details, status, notes, and comments
- **Export to PNG** — download roadmap snapshot for presentations

## Quick Start

### View the Dashboard

Visit: **https://bcali.github.io/roadmap-dashboard/**

Works on Mac, PC, and mobile — no installation needed.

### Local Development

```bash
git clone https://github.com/bcali/roadmap-dashboard.git
cd roadmap-dashboard
npm install
npm run dev
# Open http://localhost:5173
```

### Enable AI Analysis

1. Add `ANTHROPIC_API_KEY` to your GitHub repo secrets
2. The `ai-analyze` workflow runs weekly (Monday 9AM UTC) or can be triggered manually
3. Estimated cost: ~$2.40/weekly run (~$12/month)

## Weekly Workflow

### 1. Prepare Inputs

Fill in the structured markdown templates each week:

| Template | Source | Purpose |
|----------|--------|---------|
| `inputs/weekly/YYYY-WXX/emails.md` | Outlook Copilot summary | Key decisions and action items from email |
| `inputs/weekly/YYYY-WXX/meetings.md` | Teams transcript | Meeting decisions, blockers, commitments |
| `inputs/weekly/YYYY-WXX/status.md` | Confluence / manual | KPI data points, per-initiative status |
| `inputs/weekly/YYYY-WXX/notes.md` | Manual observations | Risks, context, anything the AI should know |

Templates are in `inputs/templates/`. Prompts for generating input data from Outlook, Teams, and Confluence are in `prompts/`.

### 2. Push to Main

```bash
git add inputs/weekly/2026-W07/
git commit -m "Add weekly inputs for W07"
git push
```

The `process-inputs` workflow automatically validates and indexes new inputs.

### 3. AI Analysis Runs

Every Monday (or manually via workflow dispatch), Claude analyzes:
- Current roadmap state (CSV + enriched JSON)
- All weekly inputs since last analysis
- Baseline documents (PRDs, strategy docs)
- Workstream history and prior recommendations
- KPI trends

Output: `recommendations/latest.md` with structured recommendations.

### 4. Review & Apply

Open `recommendations/latest.md`, check the `[x] Approved` boxes for recommendations you accept, then:

```bash
npm run apply-recommendations
```

This updates both the CSV and enriched JSON atomically.

## Project Structure

```
roadmap-dashboard/
├── .github/workflows/
│   ├── deploy.yml              # GitHub Pages deployment
│   ├── ai-analyze.yml          # Weekly AI analysis (cron + manual)
│   └── process-inputs.yml      # Input validation on push
├── public/
│   ├── sample-roadmap-data.csv # Roadmap data (source of truth for viz)
│   ├── data/                   # Frontend-accessible JSON data
│   └── recommendations/        # Latest recommendations for panel
├── src/
│   ├── components/
│   │   ├── Layout.tsx          # App shell (Sidebar + Header + RecsPanel)
│   │   ├── Header.tsx          # Top nav + AnalysisIndicator
│   │   ├── Sidebar.tsx         # Icon sidebar + AI Recommendations button
│   │   ├── RoadmapDashboard.tsx # KPI cards + toolbar + Gantt
│   │   ├── GanttChart.tsx      # Swimlane chart
│   │   ├── TaskModal.tsx       # Task details + WorkstreamLink
│   │   ├── KpiCards.tsx        # 3-column KPI metric cards
│   │   ├── RecommendationsPanel.tsx # Slide-out AI recommendations
│   │   ├── AnalysisIndicator.tsx    # Header analysis badge
│   │   ├── WorkstreamLink.tsx  # Link to workstream .md on GitHub
│   │   └── ...                 # Other UI components
│   ├── lib/
│   │   ├── data.ts             # Type definitions (KPIs, Recommendations, etc.)
│   │   ├── csvParser.ts        # CSV loading/parsing
│   │   └── csvToSwimlane.ts    # Data transformation
│   ├── hooks/
│   │   ├── useRoadmapData.ts   # Roadmap data hook
│   │   ├── useKpiData.ts       # KPI data hook
│   │   └── useAnalysisHistory.ts # Analysis history hook
│   ├── App.tsx                 # Root component
│   └── main.tsx                # Entry point
├── scripts/
│   ├── lib/
│   │   ├── types.ts            # Shared TypeScript interfaces
│   │   ├── anthropic.ts        # Claude API wrapper (retry, cost tracking)
│   │   ├── prompts.ts          # System + analysis prompt engineering
│   │   ├── csv-io.ts           # CSV read/write for Node.js
│   │   ├── json-io.ts          # Typed JSON data file operations
│   │   └── markdown.ts         # Markdown generation for workstreams
│   ├── analyze.ts              # Main AI analysis orchestrator
│   ├── generate-workstreams.ts # Initialize .md files from CSV
│   ├── process-inputs.ts       # Validate & index new inputs
│   ├── apply-recommendations.ts # Apply approved changes to CSV + JSON
│   └── update-kpis.ts          # Update KPI tracking data
├── inputs/
│   ├── templates/              # Fillable markdown templates
│   ├── baseline/               # Long-lived reference docs
│   └── weekly/YYYY-WXX/        # Weekly input files
├── workstreams/
│   ├── _overview.md            # Program-level KPI tracking
│   ├── PAY-001/                # Payments initiative + epics
│   ├── LOY-001/                # Loyalty initiative + epics
│   └── ANA-001/                # Analytics initiative + epics
├── recommendations/            # AI-generated recommendation files
├── data/                       # Enriched JSON data (AI pipeline)
├── prompts/                    # Input generation prompts
├── PRD.md                      # Product requirements
├── CHANGELOG.md                # Version history
└── README.md                   # This file
```

## NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build (TypeScript check + Vite) |
| `npm run generate-workstreams` | Initialize workstream .md files from CSV |
| `npm run analyze` | Run AI analysis (requires `ANTHROPIC_API_KEY`) |
| `npm run analyze:dry` | Dry run analysis (no API calls) |
| `npm run process-inputs` | Validate and index input files |
| `npm run apply-recommendations` | Apply approved recommendations to CSV |
| `npm run update-kpis` | Update KPI data from weekly status |

## KPI Tracking

| Metric | Target | Direction | Description |
|--------|--------|-----------|-------------|
| Payment Success Rate | >= 75% | Above | Transaction success rate across all properties |
| Avg Cost per Transaction | Tracking | Below | Payment processing cost per transaction |
| % Hotels on Payment Stack | Tracking | Above | Rollout coverage of new payment infrastructure |

KPIs are displayed as color-coded cards at the top of the dashboard:
- **Green** — meeting or exceeding target
- **Amber** — within 10% of target
- **Red** — below threshold

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| TypeScript 5.8 | Type safety |
| Vite 7 | Build tool |
| Tailwind CSS 4 | Styling |
| Radix UI | Accessible components |
| Lucide | Icons |
| date-fns | Date handling |
| PapaParse | CSV parsing |
| Sonner | Toast notifications |
| html2canvas | PNG export |
| @anthropic-ai/sdk | Claude API (AI analysis) |
| tsx | TypeScript script execution |

## CSV Data Format

The dashboard reads from `public/sample-roadmap-data.csv`:

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| id | Yes | Unique identifier | PAY-001 |
| parent_id | No | Parent task ID (creates hierarchy) | PAY-001 |
| level | Yes | 1=Initiative, 2=Epic, 3=Task | 2 |
| title | Yes | Task name | Juspay Integration |
| owner | Yes | Accountable person | Brian |
| status | Yes | Complete, In Progress, Blocked, Not Started | In Progress |
| start_date | Yes | Start date (M/D/YYYY or YYYY-MM-DD) | 1/1/2025 |
| end_date | Yes | End date | 2/15/2025 |
| effort_days | No | Estimated effort in days | 10 |
| impact | Yes | High, Medium, Low | High |
| dependency | No | Comma-separated task IDs | PAY-003, PAY-004 |
| notes | No | Additional context | Blocked on credentials |

### Hierarchy

```
Level 1: Initiative (top-level grouping)
  └── Level 2: Epic (becomes swimlane header)
        └── Level 3: Task (displayed as bars in swimlane)
```

## Deployment

The dashboard auto-deploys to GitHub Pages on every push to `main`.

### How It Works

1. Push changes to `main` branch
2. GitHub Actions builds the project
3. Deploys to https://bcali.github.io/roadmap-dashboard/
4. Takes ~2 minutes

### First-Time Setup

If GitHub Pages isn't enabled yet:

1. Go to **https://github.com/bcali/roadmap-dashboard/settings/pages**
2. Under "Build and deployment" → Source: Select **"GitHub Actions"**
3. Add `ANTHROPIC_API_KEY` to repo secrets for AI analysis

## Troubleshooting

### Data not loading?
- Check browser console (F12) for errors
- Verify CSV format matches schema above
- Make sure dates are valid

### AI analysis not running?
- Verify `ANTHROPIC_API_KEY` is set in GitHub repo secrets
- Check the Actions tab for workflow run logs
- Try `npm run analyze:dry` locally to test without API calls

### Local dev issues?
- Delete `node_modules` and run `npm install`
- Check Node.js version (requires 18+)
- Try `npm run build` to see TypeScript errors

## License

MIT

---

**Maintained by:** Brian Clark
**Last Updated:** February 2026
