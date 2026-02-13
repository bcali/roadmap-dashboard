// ============================================================
// Core roadmap types (mirrors src/lib/csvParser.ts for Node.js)
// ============================================================

export type Status = 'Complete' | 'In Progress' | 'Blocked' | 'Not Started';
export type Impact = 'High' | 'Medium' | 'Low';
export type RiskLevel = 'green' | 'yellow' | 'red';
export type ScheduleHealth = 'on-track' | 'at-risk' | 'behind';

export interface CSVRow {
  id: string;
  parent_id: string | null;
  level: number;
  title: string;
  owner: string;
  status: Status;
  start_date: string; // ISO or M/D/YYYY
  end_date: string;
  effort_days: number;
  impact: Impact;
  dependency: string[];
  notes: string;
}

// ============================================================
// Enriched roadmap JSON (superset of CSV)
// ============================================================

export interface RoadmapEntry {
  id: string;
  parent_id: string | null;
  level: 1 | 2 | 3;
  title: string;
  owner: string;
  status: Status;
  start_date: string; // ISO 8601
  end_date: string;
  effort_days: number;
  impact: Impact;
  dependencies: string[];
  notes: string;
  // Enriched fields
  workstream_file: string | null;
  last_ai_review: string | null;
  ai_risk_level: RiskLevel | null;
  ai_observations: string[];
}

export interface RoadmapData {
  version: string;
  last_updated: string;
  generated_from_csv: string;
  entries: RoadmapEntry[];
}

// ============================================================
// KPI tracking
// ============================================================

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
  schedule_health: ScheduleHealth;
}

export interface KpiSnapshot {
  week: string; // "YYYY-WXX"
  date: string; // ISO date
  metrics: KpiMetrics;
  roadmap_metrics: RoadmapMetrics;
  notes: string;
}

export interface KpiTarget {
  key: keyof KpiMetrics;
  name: string;
  target: number | null;
  unit: string;
  direction: 'above' | 'below';
}

export interface KpiData {
  version: string;
  targets: KpiTarget[];
  history: KpiSnapshot[];
}

// ============================================================
// AI recommendations
// ============================================================

export type RecommendationType =
  | 'status_change'
  | 'date_change'
  | 'new_task'
  | 'risk_flag'
  | 'note_update'
  | 'dependency_change';

export type Confidence = 'High' | 'Medium' | 'Low';

export interface Recommendation {
  id: string; // REC-YYYY-WXX-001
  title: string;
  type: RecommendationType;
  affects: string; // Roadmap item ID
  current_state: string;
  proposed_change: string;
  rationale: string;
  kpi_impact: string | null;
  confidence: Confidence;
}

export interface KpiAssessment {
  key: string;
  current_value: number | null;
  target: number | null;
  status: 'above-target' | 'on-target' | 'below-target' | 'no-data';
  trend: string;
}

export interface WorkstreamUpdate {
  workstream_id: string;
  current_state_summary: string;
  observations: string[];
  risks: string[];
}

export interface AnalysisOutput {
  executive_summary: string;
  kpi_assessment: KpiAssessment[];
  recommendations: Recommendation[];
  workstream_updates: Record<string, WorkstreamUpdate>;
  observations: string[];
}

// ============================================================
// Analysis history & input index
// ============================================================

export interface AnalysisRecord {
  week: string;
  timestamp: string;
  input_tokens: number;
  output_tokens: number;
  thinking_tokens: number;
  cost_estimate: number;
  recommendation_count: number;
  recommendations_file: string;
}

export interface AnalysisHistory {
  version: string;
  runs: AnalysisRecord[];
}

export interface InputRecord {
  week: string;
  file: string;
  type: 'emails' | 'meetings' | 'status' | 'notes' | 'baseline';
  indexed_at: string;
  size_bytes: number;
}

export interface InputIndex {
  version: string;
  inputs: InputRecord[];
}

// ============================================================
// Hierarchy helpers
// ============================================================

export interface WorkstreamHierarchy {
  initiative: CSVRow;
  epics: {
    epic: CSVRow;
    tasks: CSVRow[];
  }[];
}
