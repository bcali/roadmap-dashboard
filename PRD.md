# Roadmap Visualization Dashboard - PRD & Technical Spec

> **v2.0 Update (2026-01-30):** Major redesign with Figma Make UI - see [CHANGELOG.md](CHANGELOG.md) for details.

## Overview

Build a browser-based roadmap dashboard that reads from a CSV file on OneDrive and renders an interactive swimlane Gantt chart. No backend server required—pure frontend using PapaParse to parse CSV directly in browser.

## Problem

The payments modernization program needs a visual roadmap artifact serving both executive consumption (timeline, dependencies, progress at a glance) and operational tracking (tasks, blockers, owners). Current CSV tracker has accurate data but no visual output—requiring verbal status updates and creating communication overhead.

## Users

- **Primary:** Brian (PM) - updates CSV, uses dashboard for planning
- **Secondary:** Brian's boss + leadership - views dashboard for status, filters by quarter/epic

## Success Criteria

- Dashboard loads in <3 seconds
- Update workflow: Edit CSV → Save → Refresh browser → See changes (<2 min total)
- Boss can self-serve status without scheduling sync meetings
- Reduce roadmap status communication from ~2.5 hours/week to <30 min/week

---

## Data File Location

**OneDrive Path:** `D:\Users\bclark\OneDrive - Minor International PCL\All Things Payments\Payment Dashboard\sample-roadmap-data.csv`

For deployment, the dashboard will be hosted as `index.html` in the same OneDrive folder, allowing direct file access.

---

## CSV Schema

The CSV file is the single source of truth with these columns:

| Column | Type | Required | Description | Example |
|--------|------|----------|-------------|---------|
| `id` | String | Yes | Unique identifier | `PAY-001` |
| `parent_id` | String | No | Parent's id for hierarchy (blank = top level) | `PAY-001` |
| `level` | Number | Yes | Hierarchy depth: 1=Initiative, 2=Epic, 3=Task | `2` |
| `title` | String | Yes | Display name | `Juspay Orchestration Go-Live` |
| `owner` | String | Yes | Accountable person | `Brian` |
| `status` | String | Yes | One of: `Not Started`, `In Progress`, `Blocked`, `Complete` | `In Progress` |
| `start_date` | Date | Yes | Planned start | `1/1/2025` |
| `end_date` | Date | Yes | Planned end | `2/14/2025` |
| `effort_days` | Number | Yes | Estimated effort in days | `5` |
| `impact` | String | Yes | One of: `High`, `Medium`, `Low` | `High` |
| `dependency` | String | No | Comma-separated ids this is blocked by | `PAY-003, PAY-004` |
| `notes` | String | No | Context, blockers, details | `Waiting on Oracle OHIP` |

---

## Technical Stack

- **Framework:** React 19 + TypeScript
- **Gantt Library:** Custom swimlane-based implementation
- **CSV Parsing:** PapaParse
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI primitives, Lucide icons
- **Notifications:** Sonner (toast)
- **Build:** Vite 7
- **Export:** html2canvas (PNG export)
- **Deployment:** OneDrive (static HTML file)

---

## Features (Priority Order)

### P0 - MVP (Must Have) ✅ COMPLETE

1. **CSV Data Loading** ✅
   - Load CSV from OneDrive path (same folder as index.html)
   - Parse using PapaParse
   - Handle date parsing (multiple formats)
   - Validate required fields, surface errors gracefully

2. **Swimlane Gantt Chart Rendering** ✅
   - Render tasks as horizontal bars in swimlanes grouped by epic/team
   - Color-code by status:
     - Complete: Emerald `bg-emerald-500`
     - In Progress: Blue `bg-blue-500`
     - Blocked: Red `bg-red-500`
     - Not Started: Gray `bg-gray-400`
   - Show today marker (vertical orange line)
   - Quarterly grid overlay (Q1, Q2, Q3, Q4)
   - Impact indicators (ring highlights)

3. **Modern Layout** ✅
   - Sidebar navigation with icon buttons
   - Header with search and user avatars
   - View toggle (Items, Milestones, Timeline)
   - Action toolbar

4. **Search/Filtering** ✅
   - Real-time search across task titles
   - View mode switching

5. **Task Management** ✅
   - Click task to open detail modal
   - Edit status, impact, notes
   - View and add comments
   - Sub-item tracking

### P1 - Polish (Should Have)

6. **Dependency Arrows** ⏳
   - Draw connector lines between dependent tasks
   - Gray color, 2px stroke

7. **Task Detail Modal** ✅
   - Full modal with: Title, Owner, Status, Dates, Notes
   - Editable fields
   - Comments section

8. **Export to PNG** ✅
   - Button to capture current Gantt view as image
   - Filename: `roadmap_YYYY-MM-DD.png`

9. **Last Updated Timestamp** ✅
   - Show when CSV file was last modified

---

## Component Structure

```
src/
├── main.tsx                    # Entry point
├── App.tsx                     # Main app shell
├── index.css                   # Global styles
├── vite-env.d.ts              # TypeScript declarations
├── components/
│   ├── Layout.tsx             # App shell (Sidebar + Header + Main)
│   ├── Header.tsx             # Top navigation bar
│   ├── Sidebar.tsx            # Icon navigation sidebar
│   ├── RoadmapDashboard.tsx   # Main dashboard with toolbar
│   ├── GanttChart.tsx         # Swimlane Gantt visualization
│   ├── TaskModal.tsx          # Task detail/edit modal
│   ├── NewItemModal.tsx       # Create new item modal
│   ├── CommentsView.tsx       # Comments overlay
│   ├── ui/
│   │   ├── button.tsx         # Button component
│   │   ├── scroll-area.tsx    # Scroll area component
│   │   └── utils.ts           # cn() utility
│   └── figma/
│       └── ImageWithFallback.tsx
├── lib/
│   ├── data.ts                # Type definitions (Swimlane, RoadmapItem, etc.)
│   ├── csvParser.ts           # CSV loading/parsing
│   ├── csvToSwimlane.ts       # CSV to Swimlane transformation
│   └── utils.ts               # Utility functions
└── hooks/
    └── useRoadmapData.ts      # Data loading hook
```

---

## Development Plan

### Phase 1: Data Layer ✅
- [x] Project setup
- [x] CSV parser (TypeScript)
- [x] Data transforms (csvToSwimlane)
- [x] useRoadmapData hook

### Phase 2: Core UI ✅
- [x] App.tsx shell with Layout
- [x] Sidebar + Header components
- [x] GanttChart swimlane component
- [x] Status colors
- [x] Today marker

### Phase 3: Task Management ✅
- [x] TaskModal component
- [x] NewItemModal component
- [x] CommentsView component
- [x] Edit functionality

### Phase 4: Polish ✅
- [x] View toggle (Items/Milestones/Timeline)
- [x] Search functionality
- [x] PNG export
- [x] Toast notifications

### Phase 5: Deploy ✅
- [x] Build for production
- [x] GitHub Pages deployment configured
- [x] GitHub Actions workflow for auto-deploy
- [x] Live at https://bcali.github.io/roadmap-dashboard/

---

## Definition of Done

- [x] Dashboard loads CSV in <3 seconds
- [x] Search filters work correctly
- [x] Gantt displays swimlane view grouped by epic
- [x] Status colors match spec
- [x] Today marker visible
- [x] Task modal with editing
- [x] Export to PNG works
- [x] No console errors
- [x] Deployed to GitHub Pages and accessible

---

## Design Reference

**Figma Make Design:** The UI follows the Figma Make export from:
`https://www.figma.com/make/egNk95xzinMXyiMrI2oUc2/Create-Product-Roadmap-Dashboard`

Key design elements:
- Compact sidebar (64px) with icon navigation
- Header with search and avatar group
- Card-based main content area
- Swimlane Gantt with color-coded team lanes
- Modal dialogs for task details

---

## Notes

- **Deployment:** GitHub Pages at https://bcali.github.io/roadmap-dashboard/
- **Data Updates:** Edit CSV in GitHub or push locally, auto-deploys in ~2 minutes
- **Access:** Works on Mac, PC, mobile - no installation needed
- **Tech:** No backend server needed - pure client-side
- **Development:** TypeScript provides type safety and better developer experience
- **CI/CD:** GitHub Actions workflow handles build and deployment automatically
