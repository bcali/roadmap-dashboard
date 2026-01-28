import Papa from 'papaparse';

/**
 * Load and parse CSV file from URL or local path
 * @param {string} filePath - Path to CSV file (relative or absolute)
 * @returns {Promise<{data: Array, lastModified: Date, errors: Array}>}
 */
export async function loadCSV(filePath) {
  try {
    const response = await fetch(filePath);

    if (!response.ok) {
      throw new Error(`Failed to load CSV: ${response.statusText}`);
    }

    const csvText = await response.text();
    const lastModified = response.headers.get('last-modified')
      ? new Date(response.headers.get('last-modified'))
      : new Date();

    return parseCSV(csvText, lastModified);
  } catch (error) {
    console.error('Error loading CSV:', error);
    throw error;
  }
}

/**
 * Parse CSV text into structured data
 * @param {string} csvText - Raw CSV content
 * @param {Date} lastModified - File modification date
 * @returns {{data: Array, lastModified: Date, errors: Array}}
 */
export function parseCSV(csvText, lastModified = new Date()) {
  const parseResult = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false, // Keep everything as strings initially
    transformHeader: (header) => header.trim(),
  });

  if (parseResult.errors.length > 0) {
    console.warn('CSV parsing errors:', parseResult.errors);
  }

  // Transform and validate rows
  const { data: transformedData, errors: validationErrors } = transformRows(parseResult.data);

  return {
    data: transformedData,
    lastModified,
    errors: [...parseResult.errors, ...validationErrors],
  };
}

/**
 * Transform CSV rows into application data format
 * @param {Array} rows - Raw CSV rows
 * @returns {{data: Array, errors: Array}}
 */
function transformRows(rows) {
  const transformedData = [];
  const errors = [];

  rows.forEach((row, index) => {
    const validation = validateRow(row, index);

    if (!validation.valid) {
      errors.push(...validation.errors);
      return; // Skip invalid rows
    }

    try {
      transformedData.push({
        id: row.id,
        parent_id: row.parent_id || null,
        level: parseInt(row.level, 10),
        title: row.title,
        owner: row.owner,
        status: normalizeStatus(row.status),
        start_date: parseDate(row.start_date),
        end_date: parseDate(row.end_date),
        effort_days: row.effort_days ? parseInt(row.effort_days, 10) : 0,
        impact: row.impact,
        dependency: row.dependency ? row.dependency.split(',').map(d => d.trim()) : [],
        notes: row.notes || '',
        _rowIndex: index, // For debugging
      });
    } catch (error) {
      errors.push({
        row: index + 2, // +2 for header and 0-index
        message: `Transform error: ${error.message}`,
      });
    }
  });

  return { data: transformedData, errors };
}

/**
 * Validate a single row has required fields
 * @param {Object} row - CSV row
 * @param {number} index - Row index
 * @returns {{valid: boolean, errors: Array}}
 */
export function validateRow(row, index) {
  const errors = [];
  const requiredFields = ['id', 'level', 'title', 'owner', 'status', 'start_date', 'end_date', 'impact'];

  requiredFields.forEach(field => {
    if (!row[field] || row[field].toString().trim() === '') {
      errors.push({
        row: index + 2, // +2 for header and 0-index
        field,
        message: `Missing required field: ${field}`,
      });
    }
  });

  // Validate level is 1, 2, or 3
  if (row.level && ![1, 2, 3, '1', '2', '3'].includes(row.level)) {
    errors.push({
      row: index + 2,
      field: 'level',
      message: `Invalid level: ${row.level}. Must be 1, 2, or 3`,
    });
  }

  // Validate status
  const validStatuses = ['Complete', 'In Progress', 'Blocked', 'Not Started'];
  if (row.status && !validStatuses.some(s => s.toLowerCase() === row.status.toLowerCase())) {
    errors.push({
      row: index + 2,
      field: 'status',
      message: `Invalid status: ${row.status}. Must be one of: ${validStatuses.join(', ')}`,
    });
  }

  // Validate impact
  const validImpacts = ['High', 'Medium', 'Low'];
  if (row.impact && !validImpacts.some(i => i.toLowerCase() === row.impact.toLowerCase())) {
    errors.push({
      row: index + 2,
      field: 'impact',
      message: `Invalid impact: ${row.impact}. Must be one of: ${validImpacts.join(', ')}`,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Parse date from various formats
 * Handles: MM/DD/YYYY, M/D/YYYY, YYYY-MM-DD
 * @param {string} dateStr - Date string
 * @returns {Date}
 */
export function parseDate(dateStr) {
  if (!dateStr) return null;

  // Try ISO format first (YYYY-MM-DD)
  let date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date;
  }

  // Try MM/DD/YYYY or M/D/YYYY format
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const month = parseInt(parts[0], 10) - 1; // Month is 0-indexed
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    date = new Date(year, month, day);

    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  console.warn(`Could not parse date: ${dateStr}`);
  return null;
}

/**
 * Normalize status to standard values
 * @param {string} status - Raw status value
 * @returns {string}
 */
function normalizeStatus(status) {
  if (!status) return 'Not Started';

  const normalized = status.toLowerCase().trim();

  if (normalized.includes('complete')) return 'Complete';
  if (normalized.includes('progress') || normalized.includes('in-progress')) return 'In Progress';
  if (normalized.includes('block')) return 'Blocked';

  return 'Not Started';
}

/**
 * Get file info from response headers
 * @param {Response} response - Fetch response
 * @returns {{lastModified: Date, size: number}}
 */
export function getFileInfo(response) {
  return {
    lastModified: response.headers.get('last-modified')
      ? new Date(response.headers.get('last-modified'))
      : new Date(),
    size: parseInt(response.headers.get('content-length') || '0', 10),
  };
}
