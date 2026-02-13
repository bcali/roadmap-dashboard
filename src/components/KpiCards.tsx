import { useKpiData } from '@/hooks/useKpiData';
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';
import type { KpiTarget, KpiSnapshot, KpiMetrics } from '@/lib/data';

function getStatusColor(target: KpiTarget, value: number | null): string {
  if (value === null) return 'text-gray-400';
  if (target.target === null) return 'text-blue-600';

  if (target.direction === 'above') {
    if (value >= target.target) return 'text-emerald-600';
    if (value >= target.target * 0.9) return 'text-amber-600';
    return 'text-red-600';
  } else {
    if (value <= target.target) return 'text-emerald-600';
    if (value <= target.target * 1.1) return 'text-amber-600';
    return 'text-red-600';
  }
}

function getBgColor(target: KpiTarget, value: number | null): string {
  if (value === null) return 'bg-gray-50 border-gray-200';
  if (target.target === null) return 'bg-blue-50 border-blue-200';

  if (target.direction === 'above') {
    if (value >= target.target) return 'bg-emerald-50 border-emerald-200';
    if (value >= target.target * 0.9) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  } else {
    if (value <= target.target) return 'bg-emerald-50 border-emerald-200';
    if (value <= target.target * 1.1) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  }
}

function getTrend(history: KpiSnapshot[], key: keyof KpiMetrics): 'up' | 'down' | 'flat' | null {
  if (history.length < 2) return null;
  const recent = history.slice(-2);
  const prev = recent[0].metrics[key];
  const curr = recent[1].metrics[key];
  if (prev === null || curr === null) return null;
  if (curr > prev) return 'up';
  if (curr < prev) return 'down';
  return 'flat';
}

function TrendIcon({ trend, direction }: { trend: 'up' | 'down' | 'flat' | null; direction: 'above' | 'below' }) {
  if (trend === null) return null;
  if (trend === 'flat') return <Minus size={14} className="text-gray-400" />;

  const isGood = (trend === 'up' && direction === 'above') || (trend === 'down' && direction === 'below');
  if (trend === 'up') return <TrendingUp size={14} className={isGood ? 'text-emerald-500' : 'text-red-500'} />;
  return <TrendingDown size={14} className={isGood ? 'text-emerald-500' : 'text-red-500'} />;
}

export function KpiCards() {
  const { kpiData, latest } = useKpiData();

  if (!kpiData) return null;

  return (
    <div className="grid grid-cols-3 gap-3 mb-3">
      {kpiData.targets.map((target) => {
        const value = latest?.metrics?.[target.key as keyof KpiMetrics] ?? null;
        const trend = kpiData.history.length >= 2
          ? getTrend(kpiData.history, target.key as keyof KpiMetrics)
          : null;

        return (
          <div
            key={target.key}
            className={`rounded-lg border px-4 py-3 ${getBgColor(target, value)}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide truncate">
                {target.name}
              </span>
              <TrendIcon trend={trend} direction={target.direction} />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className={`text-2xl font-bold ${getStatusColor(target, value)}`}>
                {value !== null ? `${value}${target.unit}` : '—'}
              </span>
              {target.target !== null && (
                <span className="text-xs text-gray-400 flex items-center">
                  <Target size={10} className="mr-0.5" />
                  {target.direction === 'above' ? '>=' : '<='} {target.target}{target.unit}
                </span>
              )}
            </div>
            {latest?.roadmap_metrics && target.key === 'payment_success_rate' && (
              <div className="mt-1 text-[10px] text-gray-400">
                Roadmap: {latest.roadmap_metrics.completion_pct}% complete ({latest.roadmap_metrics.completed}/{latest.roadmap_metrics.total_tasks} tasks)
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
