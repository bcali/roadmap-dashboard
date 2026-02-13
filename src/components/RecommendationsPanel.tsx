import { useState, useEffect } from 'react';
import { X, AlertTriangle, Calendar, ArrowRightLeft, Plus, Flag, FileText, Link2, ChevronRight } from 'lucide-react';

interface Recommendation {
  id: string;
  title: string;
  type: string;
  affects: string;
  rationale: string;
  confidence: string;
  proposed_change: string;
}

interface ParsedRecommendations {
  week: string;
  generated: string;
  summary: string;
  recommendations: Recommendation[];
}

const TYPE_ICONS: Record<string, typeof AlertTriangle> = {
  status_change: ArrowRightLeft,
  date_change: Calendar,
  new_task: Plus,
  risk_flag: Flag,
  note_update: FileText,
  dependency_change: Link2,
};

const CONFIDENCE_COLORS: Record<string, string> = {
  High: 'bg-emerald-100 text-emerald-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low: 'bg-gray-100 text-gray-600',
};

function parseRecommendationsMarkdown(md: string): ParsedRecommendations {
  const weekMatch = md.match(/# Roadmap Recommendations - Week (.+)/);
  const generatedMatch = md.match(/\*\*Generated:\*\* (.+)/);
  const summaryMatch = md.match(/## Executive Summary\n\n([\s\S]*?)(?=\n##)/);

  const recommendations: Recommendation[] = [];
  const recBlocks = md.split(/(?=### \d+\. )/);

  for (const block of recBlocks) {
    const titleMatch = block.match(/### \d+\. (.+)/);
    if (!titleMatch) continue;

    const id = block.match(/\*\*ID:\*\* (.+)/)?.[1] ?? '';
    const type = block.match(/\*\*Type:\*\* `(.+)`/)?.[1] ?? '';
    const affects = block.match(/\*\*Affects:\*\* (.+)/)?.[1] ?? '';
    const rationale = block.match(/\*\*Rationale:\*\* (.+)/)?.[1] ?? '';
    const confidence = block.match(/\*\*Confidence:\*\* (.+)/)?.[1] ?? 'Medium';
    const proposed = block.match(/\*\*Proposed:\*\* (.+)/)?.[1] ?? '';

    recommendations.push({
      id,
      title: titleMatch[1],
      type,
      affects,
      rationale,
      confidence,
      proposed_change: proposed,
    });
  }

  return {
    week: weekMatch?.[1] ?? 'Unknown',
    generated: generatedMatch?.[1] ?? '',
    summary: summaryMatch?.[1]?.trim() ?? 'No summary available.',
    recommendations,
  };
}

interface RecommendationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RecommendationsPanel({ isOpen, onClose }: RecommendationsPanelProps) {
  const [data, setData] = useState<ParsedRecommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const BASE_URL = import.meta.env.BASE_URL || '/';

  useEffect(() => {
    if (!isOpen) return;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}recommendations/latest.md`);
        if (res.ok) {
          const md = await res.text();
          setData(parseRecommendationsMarkdown(md));
        }
      } catch {
        // No recommendations yet
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div className="w-[420px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">AI Recommendations</h2>
            {data && (
              <p className="text-xs text-gray-500">Week {data.week}</p>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
            </div>
          )}

          {!loading && !data && (
            <div className="p-6 text-center">
              <div className="text-gray-300 text-4xl mb-3">🤖</div>
              <p className="text-gray-500 text-sm">No AI recommendations yet.</p>
              <p className="text-gray-400 text-xs mt-1">
                Push weekly inputs and run the analysis workflow.
              </p>
            </div>
          )}

          {!loading && data && (
            <>
              {/* Summary */}
              <div className="p-4 bg-blue-50 border-b border-blue-100">
                <p className="text-sm text-blue-800">{data.summary}</p>
              </div>

              {/* Recommendations list */}
              <div className="divide-y divide-gray-100">
                {data.recommendations.length === 0 && (
                  <div className="p-4 text-center text-gray-400 text-sm">
                    No specific recommendations this week.
                  </div>
                )}

                {data.recommendations.map((rec) => {
                  const Icon = TYPE_ICONS[rec.type] ?? FileText;
                  const expanded = expandedId === rec.id;

                  return (
                    <div key={rec.id} className="hover:bg-gray-50 transition-colors">
                      <button
                        className="w-full text-left p-4 flex items-start space-x-3"
                        onClick={() => setExpandedId(expanded ? null : rec.id)}
                      >
                        <div className="mt-0.5 p-1.5 rounded bg-gray-100 text-gray-500">
                          <Icon size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {rec.title}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                              {rec.affects}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${CONFIDENCE_COLORS[rec.confidence] ?? CONFIDENCE_COLORS.Medium}`}>
                              {rec.confidence}
                            </span>
                          </div>
                        </div>
                        <ChevronRight size={16} className={`text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
                      </button>

                      {expanded && (
                        <div className="px-4 pb-4 pl-12 space-y-2">
                          <div>
                            <span className="text-[10px] font-semibold text-gray-400 uppercase">Proposed</span>
                            <p className="text-xs text-gray-700">{rec.proposed_change}</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold text-gray-400 uppercase">Rationale</span>
                            <p className="text-xs text-gray-600">{rec.rationale}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50 text-center">
          <p className="text-[10px] text-gray-400">
            Approve recommendations in <code className="bg-gray-200 px-1 rounded">recommendations/latest.md</code>
          </p>
        </div>
      </div>
    </div>
  );
}
