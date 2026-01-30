import { CSVRow } from './csvParser';
import { Swimlane, RoadmapItem, Status, Impact, getEpicColor } from './data';

/**
 * Convert flat CSV data to Swimlane format
 * Groups items by their parent epic (level 2) or by level 1 categories
 */
export function csvToSwimlanes(csvData: CSVRow[]): Swimlane[] {
  if (!csvData || csvData.length === 0) {
    return [];
  }

  // Find all level 1 and level 2 items to use as swimlanes
  const level1Items = csvData.filter(item => item.level === 1);
  const level2Items = csvData.filter(item => item.level === 2);

  // If we have level 2 items, use them as swimlanes
  // Otherwise, fall back to level 1 items
  // If neither, create a single "All Items" swimlane
  let swimlaneHeaders: CSVRow[] = [];

  if (level2Items.length > 0) {
    swimlaneHeaders = level2Items;
  } else if (level1Items.length > 0) {
    swimlaneHeaders = level1Items;
  } else {
    // No hierarchy - create a single swimlane with all items
    return [{
      id: 'all-items',
      title: 'ALL ITEMS',
      color: 'bg-blue-500',
      items: csvData.map(row => csvRowToRoadmapItem(row)),
    }];
  }

  // Build swimlanes from headers
  const swimlanes: Swimlane[] = swimlaneHeaders.map(header => {
    // Find all items that belong to this swimlane
    // Items belong if they have this as parent_id, or are descendants
    const childItems = findDescendants(header.id, csvData)
      .filter(item => item.id !== header.id); // Exclude the header itself

    // If using level 2 as swimlanes, only include level 3 items
    // If using level 1 as swimlanes, include level 2 and 3 items
    const filteredItems = childItems.filter(item =>
      item.level > header.level
    );

    return {
      id: header.id,
      title: header.title.toUpperCase(),
      color: getEpicColor(header.title),
      items: filteredItems.map(row => csvRowToRoadmapItem(row)),
    };
  });

  // Filter out empty swimlanes
  return swimlanes.filter(lane => lane.items.length > 0);
}

/**
 * Find all descendants of an item in the hierarchy
 */
function findDescendants(parentId: string, allItems: CSVRow[]): CSVRow[] {
  const directChildren = allItems.filter(item => item.parent_id === parentId);
  const descendants = [...directChildren];

  directChildren.forEach(child => {
    descendants.push(...findDescendants(child.id, allItems));
  });

  return descendants;
}

/**
 * Convert a CSV row to a RoadmapItem
 */
function csvRowToRoadmapItem(row: CSVRow): RoadmapItem {
  const now = new Date();

  return {
    id: row.id,
    title: row.title,
    startDate: row.start_date || now,
    endDate: row.end_date || now,
    status: (row.status as Status) || 'Not Started',
    owner: row.owner || 'Unassigned',
    impact: (row.impact as Impact) || 'Medium',
    dependencies: row.dependency || [],
    comments: [],
    subItems: [],
    notes: row.notes || '',
    progress: calculateProgressFromStatus(row.status),
    // Preserve CSV fields
    epic: undefined,
    effort: row.effort_days?.toString(),
    quarter: undefined,
  };
}

/**
 * Calculate progress percentage from status
 */
function calculateProgressFromStatus(status: string): number {
  switch (status) {
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

/**
 * Alternative: Group items by owner into swimlanes
 */
export function csvToSwimlanesByOwner(csvData: CSVRow[]): Swimlane[] {
  if (!csvData || csvData.length === 0) {
    return [];
  }

  // Get unique owners
  const owners = [...new Set(csvData.map(item => item.owner || 'Unassigned'))];

  // Create swimlane for each owner
  return owners.map((owner, index) => {
    const ownerItems = csvData.filter(item => (item.owner || 'Unassigned') === owner);

    const colors = [
      'bg-blue-600', 'bg-amber-400', 'bg-red-400', 'bg-emerald-500',
      'bg-purple-500', 'bg-pink-600', 'bg-indigo-500', 'bg-cyan-500'
    ];

    return {
      id: `owner-${owner.toLowerCase().replace(/\s+/g, '-')}`,
      title: owner.toUpperCase(),
      color: colors[index % colors.length],
      items: ownerItems.map(row => csvRowToRoadmapItem(row)),
    };
  });
}

/**
 * Alternative: Group items by status into swimlanes
 */
export function csvToSwimlanesByStatus(csvData: CSVRow[]): Swimlane[] {
  const statuses = ['In Progress', 'Not Started', 'Blocked', 'Complete'];

  const statusColors: Record<string, string> = {
    'In Progress': 'bg-blue-500',
    'Not Started': 'bg-gray-400',
    'Blocked': 'bg-red-500',
    'Complete': 'bg-emerald-500',
  };

  return statuses.map(status => {
    const statusItems = csvData.filter(item => item.status === status);

    return {
      id: `status-${status.toLowerCase().replace(/\s+/g, '-')}`,
      title: status.toUpperCase(),
      color: statusColors[status] || 'bg-gray-500',
      items: statusItems.map(row => csvRowToRoadmapItem(row)),
    };
  }).filter(lane => lane.items.length > 0);
}
