import { useAnalysisHistory } from '@/hooks/useAnalysisHistory';
import { Bot } from 'lucide-react';

export function AnalysisIndicator() {
  const { latestRun } = useAnalysisHistory();

  if (!latestRun) {
    return (
      <div className="flex items-center space-x-1.5 text-gray-400" title="No AI analysis has been run yet">
        <Bot size={14} />
        <span className="text-xs">No analysis</span>
      </div>
    );
  }

  const runDate = new Date(latestRun.timestamp);
  const daysSince = Math.floor((Date.now() - runDate.getTime()) / 86400000);

  let dotColor = 'bg-emerald-400';
  if (daysSince > 14) dotColor = 'bg-red-400';
  else if (daysSince > 7) dotColor = 'bg-amber-400';

  const dateStr = runDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div
      className="flex items-center space-x-1.5 px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-default"
      title={`Last AI analysis: ${runDate.toLocaleString()}\nRecommendations: ${latestRun.recommendation_count}\nCost: $${latestRun.cost_estimate.toFixed(2)}`}
    >
      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
      <Bot size={12} className="text-gray-500" />
      <span className="text-xs text-gray-600">{dateStr}</span>
    </div>
  );
}
