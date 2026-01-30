# Payment Roadmap Dashboard

Interactive swimlane Gantt chart visualization for the payments modernization roadmap. Built with React 19, TypeScript, Vite, and Tailwind CSS.

**Live Demo:** https://bcali.github.io/roadmap-dashboard/

![Dashboard Preview](docs/preview.png)

## Features

- **Swimlane Gantt Chart** - Tasks organized by team/epic with color-coded status bars
- **Real-time Search** - Filter tasks instantly by title
- **Task Management** - Click any task to view/edit details, status, notes, and comments
- **Today Marker** - Visual indicator of current date on timeline
- **Impact Indicators** - Ring highlights show task priority (High/Medium/Low)
- **Export to PNG** - Download roadmap snapshot for presentations
- **CSV-Powered** - Edit roadmap in Excel, push to GitHub to update

## Quick Start

### View the Dashboard

Just visit: **https://bcali.github.io/roadmap-dashboard/**

Works on Mac, PC, and mobile - no installation needed!

### Local Development

```bash
# Clone the repo
git clone https://github.com/bcali/roadmap-dashboard.git
cd roadmap-dashboard

# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:5173
```

## Deployment

The dashboard is automatically deployed to GitHub Pages when you push to `main`.

### How It Works

1. Push changes to `main` branch
2. GitHub Actions builds the project
3. Deploys to https://bcali.github.io/roadmap-dashboard/
4. Takes ~2 minutes

### First-Time Setup

If GitHub Pages isn't enabled yet:

1. Go to **https://github.com/bcali/roadmap-dashboard/settings/pages**
2. Under "Build and deployment" → Source: Select **"GitHub Actions"**
3. Done! The workflow will deploy automatically on next push.

## Updating the Roadmap Data

### Option 1: Edit in GitHub (Easiest)

1. Go to https://github.com/bcali/roadmap-dashboard/blob/main/public/sample-roadmap-data.csv
2. Click the pencil icon (Edit)
3. Make changes
4. Click "Commit changes"
5. Wait ~2 minutes for deployment

### Option 2: Edit Locally

1. Edit `public/sample-roadmap-data.csv` in Excel or any text editor
2. Commit and push:
   ```bash
   git add public/sample-roadmap-data.csv
   git commit -m "Update roadmap data"
   git push
   ```
3. Wait ~2 minutes for deployment

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

### Hierarchy Structure

```
Level 1: Initiative (top-level grouping)
  └── Level 2: Epic (becomes swimlane header)
        └── Level 3: Task (displayed as bars in swimlane)
```

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| TypeScript | Type safety |
| Vite 7 | Build tool |
| Tailwind CSS 4 | Styling |
| Radix UI | Accessible components |
| Lucide | Icons |
| date-fns | Date handling |
| PapaParse | CSV parsing |
| Sonner | Toast notifications |
| html2canvas | PNG export |

## Project Structure

```
roadmap-dashboard/
├── .github/workflows/
│   └── deploy.yml          # GitHub Pages deployment
├── public/
│   └── sample-roadmap-data.csv  # Roadmap data
├── src/
│   ├── components/
│   │   ├── Layout.tsx      # App shell (Sidebar + Header)
│   │   ├── Header.tsx      # Top navigation
│   │   ├── Sidebar.tsx     # Icon sidebar
│   │   ├── RoadmapDashboard.tsx  # Main view
│   │   ├── GanttChart.tsx  # Swimlane chart
│   │   ├── TaskModal.tsx   # Task details modal
│   │   ├── NewItemModal.tsx # Create task modal
│   │   ├── CommentsView.tsx # Comments panel
│   │   └── ui/             # Reusable UI components
│   ├── lib/
│   │   ├── data.ts         # Type definitions
│   │   ├── csvParser.ts    # CSV loading
│   │   └── csvToSwimlane.ts # Data transformation
│   ├── hooks/
│   │   └── useRoadmapData.ts # Data hook
│   ├── App.tsx             # Root component
│   └── main.tsx            # Entry point
├── PRD.md                  # Product requirements
├── CHANGELOG.md            # Version history
└── README.md               # This file
```

## Troubleshooting

### Data not loading?
- Check browser console (F12) for errors
- Verify CSV format matches schema above
- Make sure dates are valid

### Deployment not working?
- Check GitHub Actions tab for errors
- Verify Pages is set to "GitHub Actions" source
- Wait 2-3 minutes after push

### Local dev issues?
- Delete `node_modules` and run `npm install`
- Check Node.js version (requires 18+)
- Try `npm run build` to see TypeScript errors

## Contributing

1. Fork the repo
2. Create a feature branch
3. Make changes
4. Submit a PR

## License

MIT

---

**Maintained by:** Brian Clark
**Last Updated:** January 2026
