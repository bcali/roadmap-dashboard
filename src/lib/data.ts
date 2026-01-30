export type Status = 'Complete' | 'In Progress' | 'Blocked' | 'Not Started';
export type Impact = 'High' | 'Medium' | 'Low';

export interface Comment {
  id: string;
  author: string;
  text: string;
  date: string;
}

export interface SubItem {
  id: string;
  title: string;
  status: Status;
}

export interface RoadmapItem {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  status: Status;
  owner: string;
  impact: Impact;
  dependencies: string[];
  comments: Comment[];
  subItems: SubItem[];
  notes?: string;
  progress?: number;
  // CSV fields for backwards compatibility
  epic?: string;
  effort?: string;
  quarter?: string;
}

export interface Swimlane {
  id: string;
  title: string;
  color: string;
  items: RoadmapItem[];
}

// Color mapping for swimlanes based on epic names
export const EPIC_COLORS: Record<string, string> = {
  'milestones': 'bg-blue-600',
  'self serve': 'bg-amber-400',
  'mobile': 'bg-red-400',
  'webstore': 'bg-emerald-500',
  'help desk': 'bg-blue-500',
  'infrastructure': 'bg-pink-600',
  'payment': 'bg-purple-500',
  'security': 'bg-indigo-500',
  'analytics': 'bg-cyan-500',
  'integration': 'bg-orange-500',
  'default': 'bg-gray-500',
};

export function getEpicColor(epic: string): string {
  const normalized = epic.toLowerCase().trim();
  return EPIC_COLORS[normalized] || EPIC_COLORS['default'];
}
