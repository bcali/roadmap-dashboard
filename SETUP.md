# Roadmap Dashboard - Setup Guide

Quick setup guide for deploying and customizing the Roadmap Dashboard.

## Quick Start (5 Minutes)

### Option 1: Use the Live Version (Easiest)

1. Visit **https://bcali.github.io/roadmap-dashboard/**
2. The dashboard loads with demo data if no CSV is available
3. Share this URL with your team - works on Mac, PC, and mobile

### Option 2: Fork and Deploy Your Own

1. Fork the repo: https://github.com/bcali/roadmap-dashboard
2. Enable GitHub Pages:
   - Go to Settings → Pages
   - Source: **GitHub Actions**
3. Push any change to trigger deployment
4. Access at: `https://YOUR-USERNAME.github.io/roadmap-dashboard/`

---

## Customizing Your Data

### CSV File Location

The dashboard reads from `public/sample-roadmap-data.csv`. Replace this file with your roadmap data.

### CSV Format

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| id | Yes | Unique identifier | PAY-001 |
| parent_id | No | Parent task ID | PAY-001 |
| level | Yes | 1=Initiative, 2=Epic, 3=Task | 2 |
| title | Yes | Task name | Juspay Integration |
| owner | Yes | Person responsible | Brian |
| status | Yes | Complete, In Progress, Blocked, Not Started | In Progress |
| start_date | Yes | Start date (M/D/YYYY or YYYY-MM-DD) | 1/1/2025 |
| end_date | Yes | End date | 2/15/2025 |
| effort_days | No | Estimated days | 10 |
| impact | Yes | High, Medium, Low | High |
| dependency | No | Comma-separated IDs | PAY-003, PAY-004 |
| notes | No | Additional context | Waiting on approval |

### Updating Data

**GitHub (Easiest):**
1. Go to your repo → `public/sample-roadmap-data.csv`
2. Click Edit (pencil icon)
3. Make changes and commit
4. Wait ~2 minutes for auto-deploy

**Local:**
1. Edit `public/sample-roadmap-data.csv`
2. `git add . && git commit -m "Update roadmap" && git push`

---

## Advanced Configuration

### Custom CSV URL

Set a custom CSV location using environment variables:

1. Create `.env` file (copy from `.env.example`):
   ```
   VITE_CSV_URL=https://your-domain.com/roadmap.csv
   ```

2. Rebuild and deploy

### Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Features

| Feature | Description |
|---------|-------------|
| **Demo Mode** | Shows sample data when CSV fails to load |
| **Auto-Retry** | Click "Retry" to reload CSV data |
| **Search** | Filter tasks by title in real-time |
| **Task Details** | Click any task to view/edit details |
| **Export** | Download roadmap as PNG image |
| **Today Marker** | Visual indicator of current date |

---

## Troubleshooting

### Dashboard shows "Demo Mode"

The CSV file couldn't be loaded. Common causes:
- **404 Error**: CSV file doesn't exist at expected path
- **CORS Error**: CSV hosted on different domain without CORS headers
- **Network Error**: Check internet connection
- **Parse Error**: CSV format is invalid

**Fix**: Check browser console (F12) for detailed error message.

### Data not updating after push

- GitHub Actions deployment takes ~2 minutes
- Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)
- Check GitHub Actions tab for build errors

### Blank page

- Check browser console for JavaScript errors
- Verify Node.js 18+ for local development
- Try `npm run build` to see TypeScript errors

### Export not working

- Ensure the chart is fully loaded
- Try a different browser (Chrome works best)
- Check for ad blockers interfering

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_CSV_URL` | Custom CSV file URL | `{BASE_URL}sample-roadmap-data.csv` |

---

## Support

- **Issues**: https://github.com/bcali/roadmap-dashboard/issues
- **Documentation**: See [PRD.md](PRD.md) for full technical spec
- **Changelog**: See [CHANGELOG.md](CHANGELOG.md) for version history
