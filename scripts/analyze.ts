#!/usr/bin/env node
/**
 * analyze.ts - Main AI analysis orchestrator
 *
 * Reads all context (CSV, JSON, baseline docs, weekly inputs, history),
 * calls Claude Opus 4.6 with extended thinking, and writes:
 *   - recommendations/archive/YYYY-WXX.md
 *   - recommendations/latest.md (copy)
 *   - Updates to workstream .md files (weekly log entries)
 *   - Updates to data/kpis.json (if KPI data in inputs)
 *   - Updates to data/analysis-history.json
 *
 * Usage: npx tsx scripts/analyze.ts [--week YYYY-WXX] [--dry-run]
 */

import { resolve, join, basename } from 'path';
import { readFile, writeFile, readdir, mkdir, copyFile, stat } from 'fs/promises';
import { analyzeWithClaude, estimateTokens } from './lib/anthropic.js';
import { buildSystemPrompt, buildAnalysisPrompt } from './lib/prompts.js';
import { renderRecommendationsMd, appendWeeklyLog } from './lib/markdown.js';
import { readCSV } from './lib/csv-io.js';
import {
  loadRoadmapJson, saveRoadmapJson,
  loadKpiData, saveKpiData,
  loadAnalysisHistory, saveAnalysisHistory,
} from './lib/json-io.js';
import type { AnalysisOutput, AnalysisRecord } from './lib/types.js';

const ROOT = resolve(import.meta.dirname, '..');

function getCurrentWeek(): string {
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - jan1.getTime()) / 86400000);
  const week = Math.ceil((days + jan1.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

function getPriorWeeks(week: string, count: number): string[] {
  const [yearStr, weekStr] = week.split('-W');
  let year = parseInt(yearStr, 10);
  let w = parseInt(weekStr, 10);
  const weeks: string[] = [];
  for (let i = 0; i < count; i++) {
    w--;
    if (w < 1) { year--; w = 52; }
    weeks.push(`${year}-W${String(w).padStart(2, '0')}`);
  }
  return weeks;
}

async function loadDirectory(dir: string): Promise<{ filename: string; content: string }[]> {
  const results: { filename: string; content: string }[] = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.md')) {
        const content = await readFile(join(dir, entry.name), 'utf-8');
        results.push({ filename: entry.name, content });
      } else if (entry.isDirectory()) {
        // Recurse one level for workstreams/{INIT}/*.md
        const subEntries = await readdir(join(dir, entry.name), { withFileTypes: true });
        for (const sub of subEntries) {
          if (sub.isFile() && sub.name.endsWith('.md')) {
            const content = await readFile(join(dir, entry.name, sub.name), 'utf-8');
            results.push({ filename: `${entry.name}/${sub.name}`, content });
          }
        }
      }
    }
  } catch (err: any) {
    if (err.code !== 'ENOENT') throw err;
  }
  return results;
}

async function loadWeeklyInputs(week: string): Promise<{ filename: string; content: string }[]> {
  const dir = join(ROOT, 'inputs', 'weekly', week);
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    const results: { filename: string; content: string }[] = [];
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.md')) {
        const content = await readFile(join(dir, entry.name), 'utf-8');
        results.push({ filename: entry.name, content });
      }
    }
    return results;
  } catch {
    return [];
  }
}

async function loadPriorRecommendations(weeks: string[]): Promise<{ filename: string; content: string }[]> {
  const results: { filename: string; content: string }[] = [];
  for (const week of weeks) {
    const path = join(ROOT, 'recommendations', 'archive', `${week}.md`);
    try {
      const content = await readFile(path, 'utf-8');
      results.push({ filename: `${week}.md`, content });
    } catch {
      // File doesn't exist for this week, skip
    }
  }
  return results;
}

function parseAnalysisJson(text: string): AnalysisOutput {
  // Strip markdown code fences if Claude wraps the response
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  return JSON.parse(cleaned) as AnalysisOutput;
}

async function main() {
  // Parse args
  const args = process.argv.slice(2);
  const weekIdx = args.indexOf('--week');
  const week = weekIdx !== -1 && args[weekIdx + 1] ? args[weekIdx + 1] : getCurrentWeek();
  const dryRun = args.includes('--dry-run');

  console.log(`\n=== AI Roadmap Analysis for ${week} ===`);
  if (dryRun) console.log('(DRY RUN - no files will be written)\n');

  // 1. Load all context
  console.log('Loading context...');

  const csvText = await readFile(join(ROOT, 'public', 'sample-roadmap-data.csv'), 'utf-8');
  const roadmapJson = await loadRoadmapJson(join(ROOT, 'data', 'roadmap.json'));
  const kpiData = await loadKpiData(join(ROOT, 'data', 'kpis.json'));
  const baselineDocs = await loadDirectory(join(ROOT, 'inputs', 'baseline'));
  const weeklyInputs = await loadWeeklyInputs(week);
  const priorRecommendations = await loadPriorRecommendations(getPriorWeeks(week, 4));
  const workstreamFiles = await loadDirectory(join(ROOT, 'workstreams'));

  console.log(`  CSV: ${csvText.split('\n').length} lines`);
  console.log(`  Roadmap JSON: ${roadmapJson ? roadmapJson.entries.length + ' entries' : 'not found'}`);
  console.log(`  KPI data: ${kpiData ? kpiData.history.length + ' snapshots' : 'not found'}`);
  console.log(`  Baseline docs: ${baselineDocs.length}`);
  console.log(`  Weekly inputs: ${weeklyInputs.length}`);
  console.log(`  Prior recommendations: ${priorRecommendations.length}`);
  console.log(`  Workstream files: ${workstreamFiles.length}`);

  // 2. Estimate token usage
  const allText = [
    csvText,
    JSON.stringify(roadmapJson),
    JSON.stringify(kpiData),
    ...baselineDocs.map(d => d.content),
    ...weeklyInputs.map(d => d.content),
    ...priorRecommendations.map(d => d.content),
    ...workstreamFiles.map(d => d.content),
  ].join('\n');

  const estimatedInputTokens = estimateTokens(allText) + 800; // +800 for system prompt
  console.log(`\nEstimated input tokens: ~${estimatedInputTokens.toLocaleString()}`);

  if (estimatedInputTokens > 180_000) {
    console.warn('WARNING: Context approaching 200K limit. Truncating older data...');
    // In the future: truncate workstream weekly logs, summarize old recommendations
  }

  // 3. Build prompts
  const systemPrompt = buildSystemPrompt();
  const analysisPrompt = buildAnalysisPrompt({
    csvText,
    roadmapJson,
    kpiData,
    baselineDocs,
    weeklyInputs,
    priorRecommendations,
    workstreamFiles,
    week,
  });

  // 4. Call Claude
  console.log('\nCalling Claude Opus 4.6 with extended thinking...');
  const result = await analyzeWithClaude({
    systemPrompt,
    userPrompt: analysisPrompt,
    maxTokens: 16000,
    budgetTokens: 12000,
  });

  console.log(`\nAPI Response:`);
  console.log(`  Input tokens:  ${result.inputTokens.toLocaleString()}`);
  console.log(`  Output tokens: ${result.outputTokens.toLocaleString()}`);
  console.log(`  Cost estimate: $${result.costEstimate.toFixed(4)}`);

  // 5. Parse structured output
  let analysis: AnalysisOutput;
  try {
    analysis = parseAnalysisJson(result.response);
    console.log(`\nParsed ${analysis.recommendations.length} recommendations`);
  } catch (err) {
    console.error('\nFailed to parse AI response as JSON:');
    console.error(result.response.substring(0, 500));
    throw new Error('AI response was not valid JSON. Check prompts.');
  }

  if (dryRun) {
    console.log('\n--- DRY RUN OUTPUT ---');
    console.log(`Executive Summary: ${analysis.executive_summary}`);
    console.log(`Recommendations: ${analysis.recommendations.length}`);
    for (const rec of analysis.recommendations) {
      console.log(`  [${rec.confidence}] ${rec.id}: ${rec.title} (${rec.type} -> ${rec.affects})`);
    }
    console.log(`Observations: ${analysis.observations.length}`);
    console.log('\nDry run complete. No files written.');
    return;
  }

  // 6. Write recommendations
  console.log('\nWriting outputs...');

  const recsDir = join(ROOT, 'recommendations', 'archive');
  await mkdir(recsDir, { recursive: true });

  const recsMd = renderRecommendationsMd(week, analysis);
  const recsPath = join(recsDir, `${week}.md`);
  await writeFile(recsPath, recsMd, 'utf-8');
  console.log(`  Wrote: recommendations/archive/${week}.md`);

  // Copy to latest
  const latestPath = join(ROOT, 'recommendations', 'latest.md');
  await copyFile(recsPath, latestPath);
  console.log('  Wrote: recommendations/latest.md');

  // 7. Update workstream .md files with weekly observations
  for (const [wsId, update] of Object.entries(analysis.workstream_updates)) {
    // Find the workstream file
    for (const wsFile of workstreamFiles) {
      if (wsFile.filename.includes(wsId)) {
        const filePath = join(ROOT, 'workstreams', wsFile.filename);
        const updated = appendWeeklyLog(wsFile.content, week, update);
        await writeFile(filePath, updated, 'utf-8');
        console.log(`  Updated: workstreams/${wsFile.filename}`);
        break;
      }
    }
  }

  // 8. Update roadmap.json with AI observations
  if (roadmapJson) {
    for (const entry of roadmapJson.entries) {
      const update = analysis.workstream_updates[entry.id];
      if (update) {
        entry.last_ai_review = new Date().toISOString();
        entry.ai_observations = update.observations;
        if (update.risks.length > 0) {
          entry.ai_risk_level = 'yellow';
        }
      }
      // Check if any recommendation flags this item
      const recs = analysis.recommendations.filter(r => r.affects === entry.id);
      for (const rec of recs) {
        if (rec.type === 'risk_flag') {
          entry.ai_risk_level = 'red';
        }
      }
    }
    roadmapJson.last_updated = new Date().toISOString();
    await saveRoadmapJson(join(ROOT, 'data', 'roadmap.json'), roadmapJson);
    console.log('  Updated: data/roadmap.json');
  }

  // 9. Update KPI data from AI assessment
  if (kpiData) {
    const hasNewData = analysis.kpi_assessment.some(k => k.current_value !== null);
    if (hasNewData) {
      const allTasks = roadmapJson?.entries.filter(e => e.level === 3) ?? [];
      const total = allTasks.length;
      const completed = allTasks.filter(t => t.status === 'Complete').length;
      const inProgress = allTasks.filter(t => t.status === 'In Progress').length;
      const blocked = allTasks.filter(t => t.status === 'Blocked').length;

      kpiData.history.push({
        week,
        date: new Date().toISOString().split('T')[0],
        metrics: {
          payment_success_rate: analysis.kpi_assessment.find(k => k.key === 'payment_success_rate')?.current_value ?? null,
          avg_cost_per_transaction: analysis.kpi_assessment.find(k => k.key === 'avg_cost_per_transaction')?.current_value ?? null,
          pct_hotels_on_stack: analysis.kpi_assessment.find(k => k.key === 'pct_hotels_on_stack')?.current_value ?? null,
        },
        roadmap_metrics: {
          total_tasks: total,
          completed,
          in_progress: inProgress,
          blocked,
          not_started: total - completed - inProgress - blocked,
          completion_pct: total > 0 ? Math.round((completed / total) * 100) : 0,
          schedule_health: blocked > 0 ? 'behind' : (inProgress > total * 0.5 ? 'at-risk' : 'on-track'),
        },
        notes: analysis.executive_summary,
      });
      await saveKpiData(join(ROOT, 'data', 'kpis.json'), kpiData);
      console.log('  Updated: data/kpis.json');
    }
  }

  // 10. Update analysis history
  const history = await loadAnalysisHistory(join(ROOT, 'data', 'analysis-history.json'))
    ?? { version: '1.0', runs: [] };

  const record: AnalysisRecord = {
    week,
    timestamp: new Date().toISOString(),
    input_tokens: result.inputTokens,
    output_tokens: result.outputTokens,
    thinking_tokens: result.thinkingTokens,
    cost_estimate: result.costEstimate,
    recommendation_count: analysis.recommendations.length,
    recommendations_file: `recommendations/archive/${week}.md`,
  };
  history.runs.push(record);
  await saveAnalysisHistory(join(ROOT, 'data', 'analysis-history.json'), history);
  console.log('  Updated: data/analysis-history.json');

  console.log(`\n=== Analysis Complete ===`);
  console.log(`Recommendations: ${analysis.recommendations.length}`);
  console.log(`Review at: recommendations/archive/${week}.md`);
}

main().catch(err => {
  console.error('\nAnalysis failed:', err);
  process.exit(1);
});
