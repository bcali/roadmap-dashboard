#!/usr/bin/env node
/**
 * process-inputs.ts - Validate and index input documents
 *
 * Scans inputs/ directory for new files, validates structure,
 * and updates data/input-index.json.
 *
 * Usage: npx tsx scripts/process-inputs.ts
 */

import { resolve, join, relative } from 'path';
import { readdir, readFile, stat } from 'fs/promises';
import { loadInputIndex, saveInputIndex } from './lib/json-io.js';
import type { InputRecord } from './lib/types.js';

const ROOT = resolve(import.meta.dirname, '..');
const INPUTS_DIR = join(ROOT, 'inputs');
const INDEX_PATH = join(ROOT, 'data', 'input-index.json');

type InputType = InputRecord['type'];

function classifyFile(filePath: string): InputType {
  const rel = relative(INPUTS_DIR, filePath).toLowerCase();
  if (rel.startsWith('baseline')) return 'baseline';
  if (rel.includes('email')) return 'emails';
  if (rel.includes('meeting')) return 'meetings';
  if (rel.includes('status')) return 'status';
  return 'notes';
}

function extractWeek(filePath: string): string {
  const rel = relative(INPUTS_DIR, filePath);
  // Match weekly/YYYY-WXX pattern
  const match = rel.match(/weekly[\/\\](\d{4}-W\d{2})/);
  if (match) return match[1];
  return 'baseline';
}

async function scanDirectory(dir: string): Promise<string[]> {
  const results: string[] = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'templates') continue; // Skip templates
        results.push(...await scanDirectory(fullPath));
      } else if (entry.name.endsWith('.md')) {
        results.push(fullPath);
      }
    }
  } catch (err: any) {
    if (err.code !== 'ENOENT') throw err;
  }
  return results;
}

function validateTemplate(content: string, type: InputType): string[] {
  const warnings: string[] = [];

  // Check for unfilled placeholders
  const placeholders = content.match(/\[.*?\]/g) ?? [];
  const unfilled = placeholders.filter(p =>
    p.includes('YYYY') || p.includes('Name') || p.includes('Date') || p.includes('Subject')
  );
  if (unfilled.length > 0) {
    warnings.push(`Has ${unfilled.length} unfilled placeholder(s): ${unfilled.slice(0, 3).join(', ')}`);
  }

  // Check minimum content length (templates are ~500 chars, filled should be more)
  if (content.length < 200) {
    warnings.push('Very short content - may be an empty template');
  }

  // Type-specific checks
  if (type === 'status') {
    if (!content.includes('KPI') && !content.includes('Payment Success') && !content.includes('payment_success')) {
      warnings.push('Status file missing KPI section');
    }
  }

  return warnings;
}

async function main() {
  console.log('=== Process Input Documents ===\n');

  // Load existing index
  const index = await loadInputIndex(INDEX_PATH)
    ?? { version: '1.0', inputs: [] };

  const existingPaths = new Set(index.inputs.map(i => i.file));

  // Scan for all .md files in inputs/
  const allFiles = await scanDirectory(INPUTS_DIR);
  console.log(`Found ${allFiles.length} markdown file(s) in inputs/\n`);

  let newCount = 0;
  let warnCount = 0;

  for (const filePath of allFiles) {
    const relPath = relative(ROOT, filePath).replace(/\\/g, '/');

    if (existingPaths.has(relPath)) {
      continue; // Already indexed
    }

    const content = await readFile(filePath, 'utf-8');
    const fileStat = await stat(filePath);
    const type = classifyFile(filePath);
    const week = extractWeek(filePath);

    // Validate
    const warnings = validateTemplate(content, type);

    const record: InputRecord = {
      week,
      file: relPath,
      type,
      indexed_at: new Date().toISOString(),
      size_bytes: fileStat.size,
    };

    index.inputs.push(record);
    newCount++;

    console.log(`  NEW: ${relPath}`);
    console.log(`       Type: ${type} | Week: ${week} | Size: ${fileStat.size} bytes`);

    if (warnings.length > 0) {
      warnCount += warnings.length;
      for (const w of warnings) {
        console.log(`       WARNING: ${w}`);
      }
    }
  }

  // Save updated index
  await saveInputIndex(INDEX_PATH, index);

  console.log(`\n--- Summary ---`);
  console.log(`  Total indexed: ${index.inputs.length}`);
  console.log(`  New this run:  ${newCount}`);
  console.log(`  Warnings:      ${warnCount}`);
  console.log(`\nIndex saved to: data/input-index.json`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
