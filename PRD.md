# Roadmap Visualization Dashboard - PRD & Technical Spec

## Overview

Build a browser-based roadmap dashboard that reads from a CSV file on OneDrive and renders an interactive Gantt chart. No backend server required—pure frontend using PapaParse to parse CSV directly in browser.

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

- **Framework:** React (single-page app)
- **Gantt Library:** frappe-gantt (lightweight, MIT license)
- **CSV Parsing:** PapaParse (fast CSV parser)
- **Styling:** Tailwind CSS
- **Build:** Vite
- **Export:** html2canvas (PNG export)
- **Deployment:** OneDrive (static HTML file)

---

## Features (Priority Order)

### P0 - MVP (Must Have)

1. **CSV Data Loading**
   - Load CSV from OneDrive path (same folder as index.html)
   - Parse using PapaParse
   - Handle date parsing (multiple formats)
   - Validate required fields, surface errors gracefully

2. **Gantt Chart Rendering**
   - Render tasks as horizontal bars on timeline
   - Color-code by status:
     - Complete: Green `#22c55e`
     - In Progress: Blue `#3b82f6`
     - Blocked: Red `#ef4444`
     - Not Started: Gray `#9ca3af`
   - Show today marker (vertical line)
   - Support zoom levels: Day, Week, Month, Quarter

3. **Hierarchy Display**
   - 3-level hierarchy: Initiative → Epic → Task
   - Collapse/expand on click
   - Progress rolls up from children to parents

4. **Filtering**
   - Quarter filter: Q1/Q2/Q3/Q4
   - Epic filter: Dropdown of all Level 2 items
   - Status filter: Complete, In Progress, Blocked, Not Started
   - Impact filter: High, Medium, Low

5. **Summary Cards**
   - Count by status: Complete | In Progress | Blocked | Not Started
   - Update dynamically when filters change

### P1 - Polish (Should Have)

6. **Dependency Arrows**
   - Draw connector lines between dependent tasks
   - Gray color, 2px stroke

7. **Task Detail Tooltip**
   - On hover/click show: Title, Owner, Status, Dates, Notes
   - Positioned near cursor

8. **Export to PNG**
   - Button to capture current Gantt view as image
   - Filename: `roadmap_YYYY-MM-DD.png`

9. **Last Updated Timestamp**
   - Show when CSV file was last modified

---

## Component Structure

```
src/
├── main.jsx              # Entry point
├── App.jsx               # Main app shell
├── components/
│   ├── FilterBar.jsx     # Filters and controls
│   ├── GanttChart.jsx    # Gantt visualization
│   ├── SummaryCards.jsx  # Status counts
│   ├── TaskDetail.jsx    # Tooltip/modal
│   └── ErrorState.jsx    # Error display
├── hooks/
│   └── useRoadmapData.js # Data loading hook
├── utils/
│   ├── csvParser.js      # CSV loading/parsing
│   ├── dataTransforms.js # Data manipulation
│   └── ganttHelpers.js   # Gantt utilities
└── styles/
    └── gantt-overrides.css # Custom Gantt styles
```

---

## Development Plan

### Phase 1: Data Layer ✅ (Current)
- [x] Project setup
- [ ] CSV parser
- [ ] Data transforms
- [ ] useRoadmapData hook

### Phase 2: Core UI
- [ ] App.jsx shell
- [ ] GanttChart component
- [ ] Zoom controls
- [ ] Status colors

### Phase 3: Filtering
- [ ] FilterBar component
- [ ] All 4 filters
- [ ] Filter state management

### Phase 4: Polish
- [ ] SummaryCards
- [ ] TaskDetail tooltip
- [ ] Dependency arrows
- [ ] PNG export

### Phase 5: Deploy
- [ ] Build for production
- [ ] Copy to OneDrive folder
- [ ] Test from OneDrive location

---

## Definition of Done

- [ ] Dashboard loads CSV in <3 seconds
- [ ] All 4 filters work correctly
- [ ] Gantt displays 3-level hierarchy with collapse/expand
- [ ] Status colors match spec
- [ ] Today marker visible
- [ ] Summary cards update with filters
- [ ] Export to PNG works
- [ ] No console errors
- [ ] Deployed to OneDrive and accessible

---

## Notes

- CSV file and dashboard will live in same OneDrive folder
- No backend server needed - pure client-side
- File access works because both files are in same directory
- Users can edit CSV directly in Excel, refresh browser to see updates
