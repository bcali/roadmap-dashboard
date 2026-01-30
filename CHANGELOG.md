# Changelog

All notable changes to the Roadmap Dashboard project.

## [2.1.0] - 2026-01-30

### 🚀 GitHub Pages Deployment

Added automatic deployment to GitHub Pages for easy sharing.

#### Added
- **GitHub Actions Workflow** - Automatic deployment on push to `main`
- **Live URL** - https://bcali.github.io/roadmap-dashboard/

#### Changed
- Updated `vite.config.ts` with GitHub Pages base path
- Fixed CSV fetch path to use absolute URL
- Updated README with deployment instructions

---

## [2.0.0] - 2026-01-30

### 🎨 Major UI Redesign - Figma Make Integration

Complete redesign of the dashboard following the Figma Make design system. This is a breaking change that replaces the previous implementation.

#### Added
- **New Layout System**
  - Sidebar navigation with icon buttons
  - Header with search bar and user avatars
  - Modern card-based content area

- **Swimlane-based Gantt Chart**
  - Custom-built swimlane visualization (replaced frappe-gantt)
  - Color-coded team/epic lanes
  - Status-based bar colors (Complete, In Progress, Blocked, Not Started)
  - Impact indicators with ring highlights
  - Today marker
  - Quarterly grid overlay

- **Task Management**
  - TaskModal: Full task detail/edit modal with status, impact, notes
  - NewItemModal: Create new roadmap items
  - CommentsView: Add and view comments on tasks
  - Sub-item tracking

- **Modern UI Components**
  - Button, ScrollArea, Dialog components (Radix UI based)
  - Toast notifications (Sonner)
  - Lucide icons throughout

- **TypeScript Support**
  - Full TypeScript conversion
  - Type-safe data models
  - Path aliases (@/)

#### Changed
- **Tech Stack Updates**
  - Upgraded to TypeScript
  - Replaced frappe-gantt with custom swimlane implementation
  - Added date-fns for date handling
  - Added Radix UI primitives
  - Added class-variance-authority for component variants

- **Data Layer**
  - New Swimlane data model
  - CSV to Swimlane adapter (groups by epic/owner)
  - Preserved CSV loading capability

- **Component Structure**
  ```
  src/
  ├── components/
  │   ├── Layout.tsx         # New: App shell
  │   ├── Header.tsx         # New: Top navigation
  │   ├── Sidebar.tsx        # New: Icon sidebar
  │   ├── RoadmapDashboard.tsx
  │   ├── GanttChart.tsx     # Rewritten: Custom swimlane
  │   ├── TaskModal.tsx      # New: Task details
  │   ├── NewItemModal.tsx   # New: Create items
  │   ├── CommentsView.tsx   # New: Comments
  │   ├── ui/                # New: UI primitives
  │   └── figma/             # New: Figma utilities
  ├── lib/
  │   ├── data.ts            # Type definitions
  │   ├── csvParser.ts       # CSV parsing
  │   ├── csvToSwimlane.ts   # Data transformation
  │   └── utils.ts           # Utility functions
  └── hooks/
      └── useRoadmapData.ts  # Data loading hook
  ```

#### Removed
- frappe-gantt dependency
- Old JSX components (FilterBar, SummaryCards, TaskDetail, ErrorState)
- Old JavaScript utilities

### Migration Notes
- The dashboard now uses a swimlane view grouped by epic/team
- CSV data format remains compatible - no changes needed to existing data files
- TypeScript is now required for development

---

## [1.0.0] - 2026-01-28

### Initial Release
- Basic Gantt chart using frappe-gantt
- CSV data loading with PapaParse
- Filter bar (Quarter, Epic, Effort, Impact, Status)
- Summary cards showing task counts by status
- Task detail tooltip
- PNG export functionality
- Tailwind CSS styling
