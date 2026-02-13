#!/usr/bin/env node
/**
 * apply-recommendations.ts - Apply approved recommendations to roadmap data
 *
 * Reads a recommendations .md file, finds checked [x] Approved items,
 * and applies their changes to both:
 *   - public/sample-roadmap-data.csv
 *   - data/roadmap.json
 *
 * Usage: npx tsx scripts/apply-recommendations.ts [path-to-recommendations.md]
 *        npx tsx scripts/apply-recommendations.ts  (uses recommendations/latest.md)
 */

import { resolve, join } from 'path';
import { readFile } from 'fs/promises';
import { readCSV, writeCSV } from './lib/csv-io.js';
import { loadRoadmapJson, saveRoadmapJson } from './lib/json-io.js';
import type { Recommendation, RecommendationType } from './lib/types.js';

const ROOT = resolve(import.meta.dirname, '..');
const CSV_PATH = join(ROOT, 'public', 'sample-roadmap-data.csv');
const JSON_PATH = join(ROOT, 'data', 'roadmap.json');

interface ApprovedRecommendation extends Recommendation {
  rawBlock: string;
}

/**
 * Parse the recommendations .md file and extract approved items.
 */
function parseApprovedRecommendations(content: string): ApprovedRecommendation[] {
  const approved: ApprovedRecommendation[] = [];

  // Split by recommendation blocks (### N. Title)
  const blocks = content.split(/(?=### \d+\. )/);

  for (const block of blocks) {
    // Check if this block has a checked approval box
    if (!block.match(/- \[x\] \*\*Approved\*\*/i)) {
      continue;
    }

    // Parse fields
    const id = extractField(block, 'ID');
    const title = block.match(/### \d+\. (.+)/)?.[1] ?? '';
    const type = extractField(block, 'Type')?.replace(/`/g, '') as RecommendationType;
    const affects = extractField(block, 'Affects') ?? '';
    const currentState = extractField(block, 'Current') ?? '';
    const proposedChange = extractField(block, 'Proposed') ?? '';
    const rationale = extractField(block, 'Rationale') ?? '';
    const kpiImpact = extractField(block, 'KPI Impact');
    const confidence = extractField(block, 'Confidence') as 'High' | 'Medium' | 'Low' ?? 'Medium';

    if (id && type && affects) {
      approved.push({
        id,
        title,
        type,
        affects,
        current_state: currentState,
        proposed_change: proposedChange,
        rationale,
        kpi_impact: kpiImpact || null,
        confidence,
        rawBlock: block,
      });
    }
  }

  return approved;
}

function extractField(block: string, field: string): string | undefined {
  const regex = new RegExp(`\\*\\*${field}:\\*\\*\\s*(.+)`, 'i');
  const match = block.match(regex);
  return match?.[1]?.trim();
}

/**
 * Apply a single recommendation to the CSV rows.
 */
function applyToCSV(
  rows: ReturnType<typeof import('./lib/csv-io.js').readCSV extends (...args: any) => Promise<infer R> ? R : never>,
  rec: ApprovedRecommendation,
): boolean {
  const row = rows.find(r => r.id === rec.affects);
  if (!row) {
    console.warn(`  WARNING: Item ${rec.affects} not found in CSV, skipping`);
    return false;
  }

  switch (rec.type) {
    case 'status_change': {
      const newStatus = rec.proposed_change.match(/(Complete|In Progress|Blocked|Not Started)/i)?.[1];
      if (newStatus) {
        console.log(`  ${rec.affects}: status "${row.status}" -> "${newStatus}"`);
        row.status = newStatus as any;
        return true;
      }
      break;
    }
    case 'date_change': {
      // Try to extract dates from proposed_change
      const dates = rec.proposed_change.match(/(\d{1,2}\/\d{1,2}\/\d{4})/g);
      if (dates && dates.length >= 1) {
        // If two dates, first is start, second is end
        // If one date, assume it's the end date
        if (dates.length >= 2) {
          console.log(`  ${rec.affects}: dates "${row.start_date} - ${row.end_date}" -> "${dates[0]} - ${dates[1]}"`);
          row.start_date = dates[0];
          row.end_date = dates[1];
        } else {
          console.log(`  ${rec.affects}: end_date "${row.end_date}" -> "${dates[0]}"`);
          row.end_date = dates[0];
        }
        return true;
      }
      break;
    }
    case 'note_update': {
      const newNote = rec.proposed_change;
      console.log(`  ${rec.affects}: notes updated`);
      row.notes = newNote;
      return true;
    }
    case 'dependency_change': {
      const deps = rec.proposed_change.match(/[A-Z]{3}-\d{3}/g);
      if (deps) {
        console.log(`  ${rec.affects}: dependencies -> [${deps.join(', ')}]`);
        row.dependency = deps;
        return true;
      }
      break;
    }
    case 'risk_flag': {
      // Risk flags only update the JSON, not the CSV
      console.log(`  ${rec.affects}: flagged as at-risk (JSON only)`);
      return true;
    }
    case 'new_task': {
      // New tasks need to be appended - handled separately
      console.log(`  New task for ${rec.affects}: not yet supported via apply script`);
      console.log(`  Please add manually to CSV.`);
      return false;
    }
  }

  console.warn(`  WARNING: Could not apply ${rec.id} (${rec.type}) - unrecognized format`);
  return false;
}

async function main() {
  const recsPath = process.argv[2]
    ? resolve(process.argv[2])
    : join(ROOT, 'recommendations', 'latest.md');

  console.log(`\n=== Apply Approved Recommendations ===`);
  console.log(`Source: ${recsPath}\n`);

  // Read recommendations file
  const content = await readFile(recsPath, 'utf-8');
  const approved = parseApprovedRecommendations(content);

  if (approved.length === 0) {
    console.log('No approved recommendations found. Nothing to apply.');
    return;
  }

  console.log(`Found ${approved.length} approved recommendation(s):\n`);
  for (const rec of approved) {
    console.log(`  [${rec.confidence}] ${rec.id}: ${rec.title} (${rec.type} -> ${rec.affects})`);
  }
  console.log('');

  // Load current data
  const csvRows = await readCSV(CSV_PATH);
  const roadmapJson = await loadRoadmapJson(JSON_PATH);

  let appliedCount = 0;

  console.log('Applying changes:');
  for (const rec of approved) {
    const applied = applyToCSV(csvRows, rec);
    if (applied) appliedCount++;

    // Also update JSON
    if (roadmapJson && applied) {
      const entry = roadmapJson.entries.find(e => e.id === rec.affects);
      if (entry) {
        if (rec.type === 'status_change') {
          const newStatus = rec.proposed_change.match(/(Complete|In Progress|Blocked|Not Started)/i)?.[1];
          if (newStatus) entry.status = newStatus as any;
        }
        if (rec.type === 'risk_flag') {
          entry.ai_risk_level = 'red';
        }
        if (rec.type === 'date_change') {
          const dates = rec.proposed_change.match(/(\d{1,2}\/\d{1,2}\/\d{4})/g);
          if (dates && dates.length >= 2) {
            entry.start_date = dates[0];
            entry.end_date = dates[1];
          } else if (dates) {
            entry.end_date = dates[0];
          }
        }
        if (rec.type === 'note_update') {
          entry.notes = rec.proposed_change;
        }
      }
    }
  }

  // Write updated files
  if (appliedCount > 0) {
    await writeCSV(CSV_PATH, csvRows);
    console.log(`\nWrote updated CSV: public/sample-roadmap-data.csv`);

    if (roadmapJson) {
      roadmapJson.last_updated = new Date().toISOString();
      await saveRoadmapJson(JSON_PATH, roadmapJson);
      console.log('Wrote updated JSON: data/roadmap.json');
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`  Approved:  ${approved.length}`);
  console.log(`  Applied:   ${appliedCount}`);
  console.log(`  Skipped:   ${approved.length - appliedCount}`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
