#!/usr/bin/env node
/**
 * update-kpis.ts - Update KPI tracking data
 *
 * Reads the weekly status.md for KPI data points,
 * calculates roadmap-derived metrics from CSV,
 * and appends a new snapshot to data/kpis.json.
 *
 * Usage: npx tsx scripts/update-kpis.ts --week YYYY-WXX
 */

import { resolve, join } from 'path';
import { readFile } from 'fs/promises';
import { readCSV } from './lib/csv-io.js';
import { loadKpiData, saveKpiData } from './lib/json-io.js';
import type { KpiSnapshot, KpiMetrics, ScheduleHealth } from './lib/types.js';

const ROOT = resolve(import.meta.dirname, '..');

function getCurrentWeek(): string {
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - jan1.getTime()) / 86400000);
  const week = Math.ceil((days + jan1.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

function parseNumber(value: string): number | null {
  const cleaned = value.replace(/[^0-9.\-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Extract KPI values from weekly status.md content.
 */
function extractKpisFromStatus(content: string): Partial<KpiMetrics> {
  const metrics: Partial<KpiMetrics> = {};

  // Payment Success Rate
  const successMatch = content.match(/Payment Success Rate[:\s]*([0-9.]+)/i);
  if (successMatch) {
    metrics.payment_success_rate = parseNumber(successMatch[1]);
  }

  // Avg Cost per Transaction
  const costMatch = content.match(/(?:Avg |Average )?Cost per Transaction[:\s]*\$?([0-9.]+)/i);
  if (costMatch) {
    metrics.avg_cost_per_transaction = parseNumber(costMatch[1]);
  }

  // % Hotels on Payment Stack
  const hotelsMatch = content.match(/(?:% )?Hotels on (?:Payment )?Stack[:\s]*([0-9.]+)/i);
  if (hotelsMatch) {
    metrics.pct_hotels_on_stack = parseNumber(hotelsMatch[1]);
  }

  return metrics;
}

async function main() {
  const args = process.argv.slice(2);
  const weekIdx = args.indexOf('--week');
  const week = weekIdx !== -1 && args[weekIdx + 1] ? args[weekIdx + 1] : getCurrentWeek();

  console.log(`=== Update KPIs for ${week} ===\n`);

  // Load KPI data
  const kpiPath = join(ROOT, 'data', 'kpis.json');
  const kpiData = await loadKpiData(kpiPath);
  if (!kpiData) {
    console.error('data/kpis.json not found. Run generate-workstreams first.');
    process.exit(1);
  }

  // Check if we already have a snapshot for this week
  const existing = kpiData.history.find(s => s.week === week);
  if (existing) {
    console.log(`Snapshot for ${week} already exists. Use --force to overwrite (not implemented).`);
    return;
  }

  // Try to read weekly status file for KPI values
  const statusPath = join(ROOT, 'inputs', 'weekly', week, 'status.md');
  let kpiValues: Partial<KpiMetrics> = {};
  try {
    const statusContent = await readFile(statusPath, 'utf-8');
    kpiValues = extractKpisFromStatus(statusContent);
    console.log('Extracted KPI values from status.md:');
    console.log(`  Payment Success Rate: ${kpiValues.payment_success_rate ?? 'not found'}`);
    console.log(`  Avg Cost per Transaction: ${kpiValues.avg_cost_per_transaction ?? 'not found'}`);
    console.log(`  % Hotels on Stack: ${kpiValues.pct_hotels_on_stack ?? 'not found'}`);
  } catch {
    console.log(`No status.md found for ${week}, using null values for KPIs`);
  }

  // Calculate roadmap-derived metrics from CSV
  const csvRows = await readCSV(join(ROOT, 'public', 'sample-roadmap-data.csv'));
  const tasks = csvRows.filter(r => r.level === 3);
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'Complete').length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  const blocked = tasks.filter(t => t.status === 'Blocked').length;
  const notStarted = total - completed - inProgress - blocked;
  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  let health: ScheduleHealth = 'on-track';
  if (blocked > 0) health = 'behind';
  else if (completionPct < 20 && inProgress < total * 0.3) health = 'at-risk';

  console.log(`\nRoadmap metrics (from CSV):`);
  console.log(`  Total: ${total}, Complete: ${completed}, In Progress: ${inProgress}, Blocked: ${blocked}, Not Started: ${notStarted}`);
  console.log(`  Completion: ${completionPct}%, Health: ${health}`);

  // Build snapshot
  const snapshot: KpiSnapshot = {
    week,
    date: new Date().toISOString().split('T')[0],
    metrics: {
      payment_success_rate: kpiValues.payment_success_rate ?? null,
      avg_cost_per_transaction: kpiValues.avg_cost_per_transaction ?? null,
      pct_hotels_on_stack: kpiValues.pct_hotels_on_stack ?? null,
    },
    roadmap_metrics: {
      total_tasks: total,
      completed,
      in_progress: inProgress,
      blocked,
      not_started: notStarted,
      completion_pct: completionPct,
      schedule_health: health,
    },
    notes: '',
  };

  kpiData.history.push(snapshot);
  await saveKpiData(kpiPath, kpiData);

  console.log(`\nSnapshot saved to data/kpis.json`);
  console.log(`Total snapshots: ${kpiData.history.length}`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
