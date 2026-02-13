import { readFile, writeFile } from 'fs/promises';
import Papa from 'papaparse';
import type { CSVRow, Status, Impact } from './types.js';

/**
 * Read and parse the roadmap CSV file from disk.
 */
export async function readCSV(filePath: string): Promise<CSVRow[]> {
  const text = await readFile(filePath, 'utf-8');
  return parseCSVText(text);
}

/**
 * Parse CSV text into structured CSVRow array.
 */
export function parseCSVText(text: string): CSVRow[] {
  const result = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
    transformHeader: (h: string) => h.trim(),
  });

  if (result.errors.length > 0) {
    console.warn('CSV parse warnings:', result.errors);
  }

  return (result.data as Record<string, string>[]).map(row => ({
    id: row.id || '',
    parent_id: row.parent_id || null,
    level: parseInt(row.level, 10) || 1,
    title: row.title || 'Untitled',
    owner: row.owner || '',
    status: normalizeStatus(row.status),
    start_date: row.start_date || '',
    end_date: row.end_date || '',
    effort_days: row.effort_days ? parseInt(row.effort_days, 10) : 0,
    impact: normalizeImpact(row.impact),
    dependency: row.dependency ? row.dependency.split(',').map(d => d.trim()).filter(Boolean) : [],
    notes: row.notes || '',
  }));
}

/**
 * Write CSVRow array back to a CSV file on disk.
 */
export async function writeCSV(filePath: string, rows: CSVRow[]): Promise<void> {
  const csvRows = rows.map(row => ({
    id: row.id,
    parent_id: row.parent_id || '',
    level: row.level,
    title: row.title,
    owner: row.owner,
    status: row.status,
    start_date: row.start_date,
    end_date: row.end_date,
    effort_days: row.effort_days || '',
    impact: row.impact,
    dependency: row.dependency.join(', '),
    notes: row.notes,
  }));

  const csv = Papa.unparse(csvRows, {
    columns: ['id', 'parent_id', 'level', 'title', 'owner', 'status', 'start_date', 'end_date', 'effort_days', 'impact', 'dependency', 'notes'],
  });

  await writeFile(filePath, csv + '\n', 'utf-8');
}

function normalizeStatus(status: string | undefined): Status {
  if (!status) return 'Not Started';
  const s = status.toLowerCase().trim();
  if (s.includes('complete')) return 'Complete';
  if (s.includes('progress') || s.includes('in-progress')) return 'In Progress';
  if (s.includes('block')) return 'Blocked';
  return 'Not Started';
}

function normalizeImpact(impact: string | undefined): Impact {
  if (!impact) return 'Medium';
  const i = impact.toLowerCase().trim();
  if (i.includes('high')) return 'High';
  if (i.includes('low')) return 'Low';
  return 'Medium';
}

/**
 * Build the 3-level hierarchy from flat CSV rows.
 */
export function buildHierarchy(rows: CSVRow[]) {
  const initiatives = rows.filter(r => r.level === 1);
  const epics = rows.filter(r => r.level === 2);
  const tasks = rows.filter(r => r.level === 3);

  return initiatives.map(init => ({
    initiative: init,
    epics: epics
      .filter(e => e.parent_id === init.id)
      .map(epic => ({
        epic,
        tasks: tasks.filter(t => t.parent_id === epic.id),
      })),
  }));
}
