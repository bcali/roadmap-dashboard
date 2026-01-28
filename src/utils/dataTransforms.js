/**
 * Build hierarchical structure from flat data
 * @param {Array} flatData - Flat array of tasks
 * @returns {Array} - Hierarchical tree structure
 */
export function buildHierarchy(flatData) {
  if (!flatData || flatData.length === 0) return [];

  // Create a map for quick lookup
  const idMap = {};
  flatData.forEach(item => {
    idMap[item.id] = { ...item, children: [] };
  });

  // Build tree
  const tree = [];
  flatData.forEach(item => {
    const node = idMap[item.id];

    if (item.parent_id && idMap[item.parent_id]) {
      // Add to parent's children
      idMap[item.parent_id].children.push(node);
    } else {
      // Top-level item (no parent or orphan)
      tree.push(node);
    }
  });

  return tree;
}

/**
 * Calculate progress for an item based on its children or status
 * @param {Object} item - Task item
 * @param {Array} allItems - All tasks (for recursive lookup)
 * @returns {number} - Progress percentage (0-100)
 */
export function calculateProgress(item, allItems = []) {
  // If has explicit progress, use it
  if (item.progress !== undefined) return item.progress;

  // Find children
  const children = allItems.filter(i => i.parent_id === item.id);

  // If leaf node (no children), derive from status
  if (children.length === 0) {
    switch (item.status) {
      case 'Complete':
        return 100;
      case 'In Progress':
        return 50;
      case 'Blocked':
        return 25;
      case 'Not Started':
      default:
        return 0;
    }
  }

  // If has children, average their progress
  const childProgress = children.map(c => calculateProgress(c, allItems));
  const avgProgress = childProgress.reduce((sum, p) => sum + p, 0) / children.length;

  return Math.round(avgProgress);
}

/**
 * Get quarter from date
 * @param {Date} date - Date object
 * @returns {string} - Quarter string (e.g., "Q1 2025")
 */
export function getQuarter(date) {
  if (!date) return null;

  const month = date.getMonth(); // 0-11
  const year = date.getFullYear();
  const quarter = Math.floor(month / 3) + 1;

  return `Q${quarter} ${year}`;
}

/**
 * Check if task falls within a specific quarter
 * @param {Object} task - Task with start_date and end_date
 * @param {string} targetQuarter - Quarter string (e.g., "Q1 2025")
 * @returns {boolean}
 */
export function taskInQuarter(task, targetQuarter) {
  if (!task.start_date || !task.end_date) return false;

  const startQ = getQuarter(task.start_date);
  const endQ = getQuarter(task.end_date);

  return startQ === targetQuarter || endQ === targetQuarter;
}

/**
 * Get effort bucket from days
 * @param {number} days - Effort in days
 * @returns {string} - "Low", "Medium", or "High"
 */
export function getEffortBucket(days) {
  if (!days || days === 0) return 'Unknown';
  if (days < 3) return 'Low';
  if (days <= 10) return 'Medium';
  return 'High';
}

/**
 * Get unique list of epics (Level 2 items)
 * @param {Array} data - All tasks
 * @returns {Array<string>} - Epic titles
 */
export function getUniqueEpics(data) {
  if (!data) return [];

  const epics = data
    .filter(item => item.level === 2)
    .map(item => item.title)
    .sort();

  return [...new Set(epics)];
}

/**
 * Get unique quarters from all tasks
 * @param {Array} data - All tasks
 * @returns {Array<string>} - Sorted quarter strings
 */
export function getUniqueQuarters(data) {
  if (!data) return [];

  const quarters = new Set();

  data.forEach(task => {
    if (task.start_date) {
      quarters.add(getQuarter(task.start_date));
    }
    if (task.end_date) {
      quarters.add(getQuarter(task.end_date));
    }
  });

  return Array.from(quarters).sort();
}

/**
 * Check if item is descendant of another item
 * @param {Object} item - Item to check
 * @param {string} ancestorTitle - Title of potential ancestor
 * @param {Array} allItems - All items
 * @returns {boolean}
 */
export function isDescendantOf(item, ancestorTitle, allItems) {
  if (!item.parent_id) return false;

  const parent = allItems.find(i => i.id === item.parent_id);
  if (!parent) return false;

  if (parent.title === ancestorTitle) return true;

  return isDescendantOf(parent, ancestorTitle, allItems);
}

/**
 * Apply filters to data
 * @param {Array} data - All tasks
 * @param {Object} filters - Filter object
 * @returns {Array} - Filtered tasks
 */
export function applyFilters(data, filters) {
  if (!data) return [];

  return data.filter(item => {
    // Quarter filter
    if (filters.quarter && filters.quarter !== 'all') {
      if (!taskInQuarter(item, filters.quarter)) {
        return false;
      }
    }

    // Epic filter (show epic and all its descendants)
    if (filters.epic && filters.epic !== 'all') {
      const isEpic = item.title === filters.epic;
      const isDescendant = isDescendantOf(item, filters.epic, data);

      if (!isEpic && !isDescendant) {
        return false;
      }
    }

    // Effort filter
    if (filters.effort && filters.effort !== 'all') {
      const bucket = getEffortBucket(item.effort_days);
      if (bucket !== filters.effort) {
        return false;
      }
    }

    // Impact filter
    if (filters.impact && filters.impact !== 'all') {
      if (item.impact !== filters.impact) {
        return false;
      }
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      if (item.status !== filters.status) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Count tasks by status
 * @param {Array} data - Tasks to count
 * @returns {Object} - Counts by status
 */
export function countByStatus(data) {
  if (!data) {
    return {
      Complete: 0,
      'In Progress': 0,
      Blocked: 0,
      'Not Started': 0,
    };
  }

  const counts = {
    Complete: 0,
    'In Progress': 0,
    Blocked: 0,
    'Not Started': 0,
  };

  data.forEach(item => {
    if (counts.hasOwnProperty(item.status)) {
      counts[item.status]++;
    }
  });

  return counts;
}

/**
 * Format date for display
 * @param {Date} date - Date object
 * @returns {string} - Formatted date (e.g., "Jan 15, 2025")
 */
export function formatDate(date) {
  if (!date) return '';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Calculate date range duration in days
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} - Duration in days
 */
export function getDuration(startDate, endDate) {
  if (!startDate || !endDate) return 0;

  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Validate date range (start before end)
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {boolean}
 */
export function isValidDateRange(startDate, endDate) {
  if (!startDate || !endDate) return true; // Allow missing dates

  return startDate <= endDate;
}

/**
 * Get color for status
 * @param {string} status - Status value
 * @returns {string} - Hex color
 */
export function getStatusColor(status) {
  const colors = {
    Complete: '#22c55e',
    'In Progress': '#3b82f6',
    Blocked: '#ef4444',
    'Not Started': '#9ca3af',
  };

  return colors[status] || colors['Not Started'];
}

/**
 * Sort data by hierarchy and dates
 * @param {Array} data - Tasks to sort
 * @returns {Array} - Sorted tasks
 */
export function sortByHierarchy(data) {
  if (!data) return [];

  // Sort by level first, then by start date
  return [...data].sort((a, b) => {
    // Level takes priority
    if (a.level !== b.level) {
      return a.level - b.level;
    }

    // Within same level, sort by start date
    if (a.start_date && b.start_date) {
      return a.start_date - b.start_date;
    }

    return 0;
  });
}
