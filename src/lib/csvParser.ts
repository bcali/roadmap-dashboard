import Papa from 'papaparse';
import logger from './logger';

export interface CSVRow {
  id: string;
  parent_id: string | null;
  level: number;
  title: string;
  owner: string;
  status: string;
  start_date: Date | null;
  end_date: Date | null;
  effort_days: number;
  impact: string;
  dependency: string[];
  notes: string;
  _rowIndex: number;
}

export interface ParseResult {
  data: CSVRow[];
  lastModified: Date;
  errors: any[];
}

/**
 * Load and parse CSV file from URL or local path
 */
export async function loadCSV(filePath: string): Promise<ParseResult> {
  try {
    const response = await fetch(filePath);

    if (!response.ok) {
      throw new Error(`Failed to load CSV: ${response.statusText}`);
    }

    const csvText = await response.text();
    const lastModified = response.headers.get('last-modified')
      ? new Date(response.headers.get('last-modified')!)
      : new Date();

    return parseCSV(csvText, lastModified);
  } catch (error) {
    logger.error('Error loading CSV:', error);
    throw error;
  }
}

/**
 * Parse CSV text into structured data
 */
export function parseCSV(csvText: string, lastModified: Date = new Date()): ParseResult {
  const parseResult = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
    transformHeader: (header: string) => header.trim(),
  });

  if (parseResult.errors.length > 0) {
    logger.warn('CSV parsing errors:', parseResult.errors);
  }

  const { data: transformedData, errors: validationErrors } = transformRows(parseResult.data as any[]);

  return {
    data: transformedData,
    lastModified,
    errors: [...parseResult.errors, ...validationErrors],
  };
}

/**
 * Transform CSV rows into application data format
 */
function transformRows(rows: any[]): { data: CSVRow[], errors: any[] } {
  const transformedData: CSVRow[] = [];
  const errors: any[] = [];

  rows.forEach((row, index) => {
    try {
      transformedData.push({
        id: row.id || `row-${index}`,
        parent_id: row.parent_id || null,
        level: parseInt(row.level, 10) || 1,
        title: row.title || 'Untitled',
        owner: row.owner || '',
        status: normalizeStatus(row.status),
        start_date: parseDate(row.start_date),
        end_date: parseDate(row.end_date),
        effort_days: row.effort_days ? parseInt(row.effort_days, 10) : 0,
        impact: normalizeImpact(row.impact),
        dependency: row.dependency ? row.dependency.split(',').map((d: string) => d.trim()) : [],
        notes: row.notes || '',
        _rowIndex: index,
      });
    } catch (error: any) {
      errors.push({
        row: index + 2,
        message: `Transform error: ${error.message}`,
      });
    }
  });

  return { data: transformedData, errors };
}

/**
 * Parse date from various formats
 */
export function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  // Try ISO format first (YYYY-MM-DD)
  let date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date;
  }

  // Try MM/DD/YYYY or M/D/YYYY format
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const month = parseInt(parts[0], 10) - 1;
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    date = new Date(year, month, day);

    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  logger.warn(`Could not parse date: ${dateStr}`);
  return null;
}

/**
 * Normalize status to standard values
 */
function normalizeStatus(status: string): string {
  if (!status) return 'Not Started';

  const normalized = status.toLowerCase().trim();

  if (normalized.includes('complete')) return 'Complete';
  if (normalized.includes('progress') || normalized.includes('in-progress')) return 'In Progress';
  if (normalized.includes('block')) return 'Blocked';

  return 'Not Started';
}

/**
 * Normalize impact to standard values
 */
function normalizeImpact(impact: string): string {
  if (!impact) return 'Medium';

  const normalized = impact.toLowerCase().trim();

  if (normalized.includes('high')) return 'High';
  if (normalized.includes('low')) return 'Low';

  return 'Medium';
}
