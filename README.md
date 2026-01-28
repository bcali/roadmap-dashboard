# Payment Roadmap Dashboard

Interactive Gantt chart visualization for the payments modernization roadmap. Built with React, Vite, and Frappe-Gantt.

## Features

✅ **Interactive Gantt Chart** - Visualize tasks across timeline with zoom controls (Day/Week/Month/Quarter)
✅ **Real-time Filtering** - Filter by quarter, epic, status, impact, and effort
✅ **Status Tracking** - Color-coded by status (Complete, In Progress, Blocked, Not Started)
✅ **Hierarchy View** - 3-level structure: Initiative → Epic → Task
✅ **Task Details** - Click any task for full details including dependencies and notes
✅ **Export to PNG** - Download roadmap snapshot for presentations
✅ **CSV-Powered** - Edit roadmap in Excel, refresh browser to see updates

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open browser to http://localhost:5173
```

### Build for Production

```bash
# Build static files
npm run build

# Preview production build
npm run preview
```

## Deployment to OneDrive

The dashboard is designed to run from OneDrive for easy sharing with leadership.

### Step 1: Build

```bash
npm run build
```

This creates a `dist/` folder with all static files.

### Step 2: Copy to OneDrive

Copy these files to your OneDrive folder:

```
D:\Users\bclark\OneDrive - Minor International PCL\All Things Payments\Payment Dashboard\
├── index.html (from dist/)
├── assets/ (entire folder from dist/)
└── sample-roadmap-data.csv (your roadmap data)
```

**PowerShell script to automate:**

```powershell
# Build
npm run build

# Copy to OneDrive
$dest = "D:\Users\bclark\OneDrive - Minor International PCL\All Things Payments\Payment Dashboard"
Copy-Item -Path "dist\*" -Destination $dest -Recurse -Force

Write-Host "✅ Deployed to OneDrive!"
Write-Host "Share link: File -> Share in OneDrive"
```

### Step 3: Share

1. Right-click `index.html` in OneDrive
2. Click "Share"
3. Set permissions (view-only for leadership)
4. Copy link and share

Recipients can open the link directly - the dashboard runs entirely in the browser!

## Data Format

The dashboard reads from `sample-roadmap-data.csv` in the same directory.

### CSV Schema

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| id | Yes | Unique identifier | PAY-001 |
| parent_id | No | Parent task ID (blank for top-level) | PAY-001 |
| level | Yes | 1=Initiative, 2=Epic, 3=Task | 2 |
| title | Yes | Task name | Juspay Integration |
| owner | Yes | Accountable person | Brian |
| status | Yes | Complete, In Progress, Blocked, Not Started | In Progress |
| start_date | Yes | Start date (M/D/YYYY or YYYY-MM-DD) | 1/1/2025 |
| end_date | Yes | End date | 2/15/2025 |
| effort_days | Yes | Estimated effort in days | 10 |
| impact | Yes | High, Medium, Low | High |
| dependency | No | Comma-separated task IDs | PAY-003, PAY-004 |
| notes | No | Additional context | Blocked on credentials |

### Updating the Roadmap

1. Open `sample-roadmap-data.csv` in Excel
2. Make changes (add tasks, update status, adjust dates)
3. Save the file
4. Refresh browser (Ctrl+R) or click "🔄 Refresh" button

Changes appear instantly!

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Frappe-Gantt** - Gantt chart library
- **PapaParse** - CSV parsing
- **html2canvas** - PNG export

## Project Structure

```
roadmap-dashboard/
├── src/
│   ├── components/       # React components
│   ├── hooks/            # Custom hooks
│   ├── utils/            # Utilities
│   ├── styles/           # CSS files
│   ├── App.jsx           # Main app
│   └── main.jsx          # Entry point
├── public/
│   └── sample-roadmap-data.csv
├── PRD.md                # Product requirements
└── README.md             # This file
```

## Development

### Troubleshooting

**CSV not loading:**
- Check browser console for errors
- Verify CSV is in same directory as index.html
- Check CSV format matches schema
- Try hard refresh (Ctrl+Shift+R)

**Gantt not rendering:**
- Check that dates are valid
- Verify at least one task exists
- Check browser console for errors
- Try different view mode

## License

MIT

---

**Last Updated:** January 2026
