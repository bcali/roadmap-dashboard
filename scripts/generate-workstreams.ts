#!/usr/bin/env node
/**
 * generate-workstreams.ts
 *
 * Reads the roadmap CSV and generates:
 *   - workstreams/_overview.md          (program-level KPI + health)
 *   - workstreams/{INIT}/initiative.md  (per-initiative summary)
 *   - workstreams/{INIT}/{EPIC}.md      (per-epic detail + task table)
 *   - data/roadmap.json                 (enriched roadmap data)
 *   - data/kpis.json                    (initialized if missing)
 *   - data/input-index.json             (initialized if missing)
 *   - data/analysis-history.json        (initialized if missing)
 *
 * Usage:  npx tsx scripts/generate-workstreams.ts [--force]
 *   --force   Overwrite existing workstream .md files (default: skip existing)
 */

import { resolve, join } from 'path';
import { writeFile, mkdir, access } from 'fs/promises';
import { readCSV, buildHierarchy } from './lib/csv-io.js';
import { saveRoadmapJson, saveKpiData, saveAnalysisHistory, saveInputIndex, loadKpiData } from './lib/json-io.js';
import { renderOverviewMd, renderInitiativeMd, renderEpicMd } from './lib/markdown.js';
import type { RoadmapData, RoadmapEntry, KpiData, AnalysisHistory, InputIndex } from './lib/types.js';

const ROOT = resolve(import.meta.dirname, '..');
const CSV_PATH = join(ROOT, 'public', 'sample-roadmap-data.csv');
const WORKSTREAMS_DIR = join(ROOT, 'workstreams');
const DATA_DIR = join(ROOT, 'data');

const force = process.argv.includes('--force');

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function writeIfNew(path: string, content: string): Promise<boolean> {
  if (!force && await fileExists(path)) {
    console.log(`  SKIP (exists): ${path.replace(ROOT, '.')}`);
    return false;
  }
  await mkdir(resolve(path, '..'), { recursive: true });
  await writeFile(path, content, 'utf-8');
  console.log(`  WROTE: ${path.replace(ROOT, '.')}`);
  return true;
}

async function main() {
  console.log('=== Generate Workstreams ===\n');
  console.log(`CSV: ${CSV_PATH}`);
  console.log(`Force overwrite: ${force}\n`);

  // 1. Read CSV
  const rows = await readCSV(CSV_PATH);
  console.log(`Loaded ${rows.length} CSV rows\n`);

  // 2. Build hierarchy
  const hierarchies = buildHierarchy(rows);
  console.log(`Found ${hierarchies.length} initiatives:\n`);

  for (const h of hierarchies) {
    console.log(`  ${h.initiative.id}: ${h.initiative.title}`);
    for (const e of h.epics) {
      console.log(`    ${e.epic.id}: ${e.epic.title} (${e.tasks.length} tasks)`);
    }
  }
  console.log('');

  // 3. Generate workstream .md files
  console.log('--- Workstream Files ---');

  // Overview
  const kpiData = await loadKpiData(join(DATA_DIR, 'kpis.json'));
  await writeIfNew(
    join(WORKSTREAMS_DIR, '_overview.md'),
    renderOverviewMd(hierarchies, kpiData),
  );

  // Per initiative + per epic
  for (const h of hierarchies) {
    const initDir = join(WORKSTREAMS_DIR, h.initiative.id);
    await mkdir(initDir, { recursive: true });

    await writeIfNew(
      join(initDir, 'initiative.md'),
      renderInitiativeMd(h.initiative, h.epics),
    );

    for (const e of h.epics) {
      await writeIfNew(
        join(initDir, `${e.epic.id}.md`),
        renderEpicMd(e.epic, h.initiative, e.tasks),
      );
    }
  }

  // 4. Generate data/roadmap.json
  console.log('\n--- Data Files ---');
  const now = new Date().toISOString();

  const entries: RoadmapEntry[] = rows.map(row => {
    // Determine workstream file path
    let workstreamFile: string | null = null;
    if (row.level === 2) {
      const parent = rows.find(r => r.id === row.parent_id);
      if (parent) {
        workstreamFile = `workstreams/${parent.id}/${row.id}.md`;
      }
    } else if (row.level === 1) {
      workstreamFile = `workstreams/${row.id}/initiative.md`;
    }

    return {
      id: row.id,
      parent_id: row.parent_id,
      level: row.level as 1 | 2 | 3,
      title: row.title,
      owner: row.owner,
      status: row.status,
      start_date: row.start_date,
      end_date: row.end_date,
      effort_days: row.effort_days,
      impact: row.impact,
      dependencies: row.dependency,
      notes: row.notes,
      workstream_file: workstreamFile,
      last_ai_review: null,
      ai_risk_level: null,
      ai_observations: [],
    };
  });

  const roadmapData: RoadmapData = {
    version: '1.0',
    last_updated: now,
    generated_from_csv: now,
    entries,
  };

  await saveRoadmapJson(join(DATA_DIR, 'roadmap.json'), roadmapData);
  console.log(`  WROTE: ./data/roadmap.json (${entries.length} entries)`);

  // 5. Initialize kpis.json if missing
  if (!await fileExists(join(DATA_DIR, 'kpis.json'))) {
    const kpis: KpiData = {
      version: '1.0',
      targets: [
        {
          key: 'payment_success_rate',
          name: 'Payment Success Rate',
          target: 75,
          unit: '%',
          direction: 'above',
        },
        {
          key: 'avg_cost_per_transaction',
          name: 'Avg Cost per Transaction',
          target: null,
          unit: '$',
          direction: 'below',
        },
        {
          key: 'pct_hotels_on_stack',
          name: '% Hotels on Payment Stack',
          target: null,
          unit: '%',
          direction: 'above',
        },
      ],
      history: [],
    };
    await saveKpiData(join(DATA_DIR, 'kpis.json'), kpis);
    console.log('  WROTE: ./data/kpis.json (initialized)');
  } else {
    console.log('  SKIP (exists): ./data/kpis.json');
  }

  // 6. Initialize analysis-history.json if missing
  if (!await fileExists(join(DATA_DIR, 'analysis-history.json'))) {
    const history: AnalysisHistory = {
      version: '1.0',
      runs: [],
    };
    await saveAnalysisHistory(join(DATA_DIR, 'analysis-history.json'), history);
    console.log('  WROTE: ./data/analysis-history.json (initialized)');
  } else {
    console.log('  SKIP (exists): ./data/analysis-history.json');
  }

  // 7. Initialize input-index.json if missing
  if (!await fileExists(join(DATA_DIR, 'input-index.json'))) {
    const index: InputIndex = {
      version: '1.0',
      inputs: [],
    };
    await saveInputIndex(join(DATA_DIR, 'input-index.json'), index);
    console.log('  WROTE: ./data/input-index.json (initialized)');
  } else {
    console.log('  SKIP (exists): ./data/input-index.json');
  }

  console.log('\n=== Done ===');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
