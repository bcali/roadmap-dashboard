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

// ============================================================
// KPI types
// ============================================================

export interface KpiTarget {
  key: string;
  name: string;
  target: number | null;
  unit: string;
  direction: 'above' | 'below';
}

export interface KpiMetrics {
  payment_success_rate: number | null;
  avg_cost_per_transaction: number | null;
  pct_hotels_on_stack: number | null;
}

export interface RoadmapMetrics {
  total_tasks: number;
  completed: number;
  in_progress: number;
  blocked: number;
  not_started: number;
  completion_pct: number;
  schedule_health: string;
}

export interface KpiSnapshot {
  week: string;
  date: string;
  metrics: KpiMetrics;
  roadmap_metrics: RoadmapMetrics;
}

export interface KpiData {
  version: string;
  targets: KpiTarget[];
  history: KpiSnapshot[];
}

// ============================================================
// Recommendation types
// ============================================================

export interface Recommendation {
  id: string;
  title: string;
  type: string;
  affects: string;
  current_state: string;
  proposed_change: string;
  rationale: string;
  kpi_impact: string | null;
  confidence: 'High' | 'Medium' | 'Low';
}

// ============================================================
// Analysis metadata
// ============================================================

export interface AnalysisRecord {
  week: string;
  timestamp: string;
  input_tokens: number;
  output_tokens: number;
  cost_estimate: number;
  recommendation_count: number;
}

export interface AnalysisHistory {
  version: string;
  runs: AnalysisRecord[];
}
