import type { CSVRow, WorkstreamUpdate, KpiData, KpiAssessment, Recommendation, AnalysisOutput } from './types.js';

/**
 * Format a date string (M/D/YYYY or ISO) into a readable format.
 */
function formatDate(dateStr: string): string {
  if (!dateStr) return 'TBD';
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(parts[0], 10) - 1]} ${parseInt(parts[1], 10)}, ${parts[2]}`;
  }
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

// ============================================================
// Workstream .md file generation
// ============================================================

export function renderEpicMd(
  epic: CSVRow,
  initiative: CSVRow,
  tasks: CSVRow[],
): string {
  const lines: string[] = [
    `# ${epic.id}: ${epic.title}`,
    '',
    `**Initiative:** ${initiative.id} ${initiative.title}`,
    `**Owner:** ${epic.owner}`,
    `**Status:** ${epic.status}`,
    `**Timeline:** ${formatDate(epic.start_date)} - ${formatDate(epic.end_date)}`,
    `**Impact:** ${epic.impact}`,
    `**Last AI Review:** Not yet analyzed`,
    '',
    '## Current State',
    '',
    `${epic.notes || 'No notes yet.'}`,
    '',
    '## Sub-Items',
    '',
    '| ID | Title | Status | Start | End | Impact | Notes |',
    '|----|-------|--------|-------|-----|--------|-------|',
  ];

  for (const task of tasks) {
    lines.push(
      `| ${task.id} | ${task.title} | ${task.status} | ${formatDate(task.start_date)} | ${formatDate(task.end_date)} | ${task.impact} | ${task.notes || '-'} |`
    );
  }

  lines.push(
    '',
    '## Weekly Log',
    '',
    '_No entries yet. Observations will be appended by the AI analysis workflow._',
    '',
    '## Risks & Blockers',
    '',
    '_None identified yet._',
    '',
    '## Dependencies',
    '',
  );

  const deps = tasks.filter(t => t.dependency.length > 0);
  if (deps.length > 0) {
    for (const t of deps) {
      lines.push(`- **${t.id}** depends on: ${t.dependency.join(', ')}`);
    }
  } else {
    lines.push('_No dependencies tracked._');
  }

  lines.push('');
  return lines.join('\n');
}

export function renderInitiativeMd(
  initiative: CSVRow,
  epics: { epic: CSVRow; tasks: CSVRow[] }[],
): string {
  const totalTasks = epics.reduce((sum, e) => sum + e.tasks.length, 0);
  const completed = epics.reduce((sum, e) => sum + e.tasks.filter(t => t.status === 'Complete').length, 0);
  const inProgress = epics.reduce((sum, e) => sum + e.tasks.filter(t => t.status === 'In Progress').length, 0);
  const blocked = epics.reduce((sum, e) => sum + e.tasks.filter(t => t.status === 'Blocked').length, 0);
  const pct = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

  const lines: string[] = [
    `# ${initiative.id}: ${initiative.title}`,
    '',
    `**Owner:** ${initiative.owner}`,
    `**Status:** ${initiative.status}`,
    `**Timeline:** ${formatDate(initiative.start_date)} - ${formatDate(initiative.end_date)}`,
    `**Impact:** ${initiative.impact}`,
    '',
    '## Progress Summary',
    '',
    `| Metric | Value |`,
    `|--------|-------|`,
    `| Total Tasks | ${totalTasks} |`,
    `| Completed | ${completed} (${pct}%) |`,
    `| In Progress | ${inProgress} |`,
    `| Blocked | ${blocked} |`,
    `| Not Started | ${totalTasks - completed - inProgress - blocked} |`,
    '',
    '## Epics',
    '',
    '| ID | Title | Status | Tasks | Completion |',
    '|----|-------|--------|-------|------------|',
  ];

  for (const { epic, tasks } of epics) {
    const epicDone = tasks.filter(t => t.status === 'Complete').length;
    const epicPct = tasks.length > 0 ? Math.round((epicDone / tasks.length) * 100) : 0;
    lines.push(
      `| [${epic.id}](./${epic.id}.md) | ${epic.title} | ${epic.status} | ${tasks.length} | ${epicPct}% |`
    );
  }

  lines.push(
    '',
    '## Notes',
    '',
    initiative.notes || '_No notes._',
    '',
  );

  return lines.join('\n');
}

export function renderOverviewMd(
  hierarchies: { initiative: CSVRow; epics: { epic: CSVRow; tasks: CSVRow[] }[] }[],
  kpiData: KpiData | null,
): string {
  // Calculate overall stats
  const allTasks = hierarchies.flatMap(h => h.epics.flatMap(e => e.tasks));
  const total = allTasks.length;
  const completed = allTasks.filter(t => t.status === 'Complete').length;
  const inProgress = allTasks.filter(t => t.status === 'In Progress').length;
  const blocked = allTasks.filter(t => t.status === 'Blocked').length;
  const notStarted = total - completed - inProgress - blocked;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const lines: string[] = [
    '# Payment Modernization Program - Status Overview',
    '',
    `**Last Updated:** ${new Date().toISOString().split('T')[0]}`,
    '**Program Owner:** Brian',
    '',
    '## Program KPIs',
    '',
    '| KPI | Current | Target | Status |',
    '|-----|---------|--------|--------|',
  ];

  if (kpiData && kpiData.history.length > 0) {
    const latest = kpiData.history[kpiData.history.length - 1];
    for (const target of kpiData.targets) {
      const val = latest.metrics[target.key];
      const display = val !== null ? `${val}${target.unit}` : 'No data';
      const tgt = target.target !== null ? `${target.direction === 'above' ? '>= ' : '<= '}${target.target}${target.unit}` : 'Trending ' + target.direction;
      lines.push(`| ${target.name} | ${display} | ${tgt} | - |`);
    }
  } else {
    lines.push(
      '| Payment Success Rate | No data | >= 75% | - |',
      '| Avg Cost per Transaction | No data | Decreasing | - |',
      '| % Hotels on Payment Stack | No data | Increasing | - |',
    );
  }

  lines.push(
    '',
    '## Roadmap Health',
    '',
    `- **Total Tasks:** ${total}`,
    `- **Completed:** ${completed} (${pct}%)`,
    `- **In Progress:** ${inProgress}`,
    `- **Blocked:** ${blocked}`,
    `- **Not Started:** ${notStarted}`,
    '',
    '## Initiative Summary',
    '',
    '| Initiative | Completion | Status | Epics |',
    '|-----------|-----------|--------|-------|',
  );

  for (const h of hierarchies) {
    const tasks = h.epics.flatMap(e => e.tasks);
    const done = tasks.filter(t => t.status === 'Complete').length;
    const iPct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
    lines.push(
      `| [${h.initiative.id}: ${h.initiative.title}](./${h.initiative.id}/initiative.md) | ${iPct}% | ${h.initiative.status} | ${h.epics.length} |`
    );
  }

  lines.push(
    '',
    '## Recent Changes',
    '',
    '_No AI analysis has been run yet. Changes will be summarized here after the first weekly analysis._',
    '',
    '## Key Decisions Needed',
    '',
    '_Will be populated by AI analysis._',
    '',
  );

  return lines.join('\n');
}

// ============================================================
// Recommendations .md generation
// ============================================================

export function renderRecommendationsMd(
  week: string,
  analysis: AnalysisOutput,
): string {
  const now = new Date().toISOString();
  const lines: string[] = [
    `# Roadmap Recommendations - Week ${week}`,
    '',
    `**Generated:** ${now}`,
    `**Analysis Period:** ${week}`,
    `**Model:** claude-opus-4-6 (extended thinking)`,
    '',
    '## Executive Summary',
    '',
    analysis.executive_summary,
    '',
    '## KPI Assessment',
    '',
    '| KPI | Current | Target | Status | Trend |',
    '|-----|---------|--------|--------|-------|',
  ];

  for (const kpi of analysis.kpi_assessment) {
    const val = kpi.current_value !== null ? String(kpi.current_value) : 'No data';
    const tgt = kpi.target !== null ? String(kpi.target) : '-';
    lines.push(`| ${kpi.key} | ${val} | ${tgt} | ${kpi.status} | ${kpi.trend} |`);
  }

  lines.push(
    '',
    '## Recommended Changes',
    '',
  );

  for (let i = 0; i < analysis.recommendations.length; i++) {
    const rec = analysis.recommendations[i];
    lines.push(
      `### ${i + 1}. ${rec.title}`,
      `- [ ] **Approved**`,
      `- **ID:** ${rec.id}`,
      `- **Type:** \`${rec.type}\``,
      `- **Affects:** ${rec.affects}`,
      `- **Current:** ${rec.current_state}`,
      `- **Proposed:** ${rec.proposed_change}`,
      `- **Rationale:** ${rec.rationale}`,
      `- **KPI Impact:** ${rec.kpi_impact || 'None'}`,
      `- **Confidence:** ${rec.confidence}`,
      '',
    );
  }

  if (analysis.observations.length > 0) {
    lines.push(
      '## Observations (No Action Required)',
      '',
    );
    for (const obs of analysis.observations) {
      lines.push(`- ${obs}`);
    }
    lines.push('');
  }

  lines.push(
    '---',
    '*Review each recommendation and check the "Approved" box for items you want applied.*',
    '',
  );

  return lines.join('\n');
}

/**
 * Append a weekly log entry to an existing workstream .md file.
 */
export function appendWeeklyLog(
  existingContent: string,
  week: string,
  update: WorkstreamUpdate,
): string {
  const logEntry = [
    `### Week ${week}`,
    `**Summary:** ${update.current_state_summary}`,
    '',
  ];

  if (update.observations.length > 0) {
    for (const obs of update.observations) {
      logEntry.push(`- ${obs}`);
    }
  } else {
    logEntry.push('- No notable changes this week.');
  }
  logEntry.push('');

  // Insert after "## Weekly Log" header
  const marker = '## Weekly Log';
  const idx = existingContent.indexOf(marker);
  if (idx === -1) {
    // No weekly log section, append at end
    return existingContent + '\n' + logEntry.join('\n');
  }

  const afterMarker = idx + marker.length;
  const nextLine = existingContent.indexOf('\n', afterMarker);
  const insertPoint = nextLine === -1 ? afterMarker : nextLine + 1;

  // Remove the placeholder text if present
  const placeholder = '_No entries yet. Observations will be appended by the AI analysis workflow._';
  const content = existingContent.replace(placeholder, '');

  const before = content.substring(0, insertPoint);
  const after = content.substring(insertPoint);

  return before + '\n' + logEntry.join('\n') + after;
}
