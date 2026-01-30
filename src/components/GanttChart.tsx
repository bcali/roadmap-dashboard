import React, { useRef } from 'react';
import { Swimlane, RoadmapItem } from '@/lib/data';
import { differenceInDays, startOfYear, endOfYear, format } from 'date-fns';

interface GanttChartProps {
  data: Swimlane[];
  onItemClick: (item: RoadmapItem) => void;
}

const START_DATE = startOfYear(new Date());
const END_DATE = endOfYear(new Date());
const TOTAL_DAYS = differenceInDays(END_DATE, START_DATE);

export function GanttChart({ data, onItemClick }: GanttChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate position logic
  const getPosition = (date: Date) => {
    const diff = differenceInDays(date, START_DATE);
    return Math.max(0, Math.min(100, (diff / TOTAL_DAYS) * 100));
  };

  const getWidth = (start: Date, end: Date) => {
    const startPos = getPosition(start);
    const endPos = getPosition(end);
    return Math.max(0.5, endPos - startPos);
  };

  // Helper to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete': return 'bg-emerald-500 border-emerald-600';
      case 'In Progress': return 'bg-blue-500 border-blue-600';
      case 'Blocked': return 'bg-red-500 border-red-600';
      default: return 'bg-gray-400 border-gray-500';
    }
  };

  const getImpactBorder = (impact: string) => {
     switch (impact) {
         case 'High': return 'ring-2 ring-red-400 ring-offset-1';
         case 'Medium': return 'ring-2 ring-amber-400 ring-offset-1';
         case 'Low': return 'ring-1 ring-emerald-400 ring-offset-1';
         default: return '';
     }
  }

  // Calculate today marker position
  const todayPosition = getPosition(new Date());

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
        {/* Timeline Header */}
        <div className="flex border-b border-gray-200 bg-gray-50 h-12 shrink-0">
            <div className="w-48 shrink-0 border-r border-gray-200 bg-white z-10 sticky left-0 flex items-center justify-center font-bold text-xs text-gray-500 tracking-wider">
                TEAMS
            </div>
            <div className="flex-1 relative overflow-hidden">
                <div className="absolute inset-0 flex">
                    {[0, 1, 2, 3].map(q => (
                        <div key={q} className="flex-1 border-r border-gray-200 flex items-center justify-center font-bold text-gray-600 bg-gray-50 text-sm">
                            Q{q + 1}
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto relative" ref={containerRef}>
            {/* Grid Background */}
             <div className="absolute inset-0 flex pointer-events-none">
                 <div className="w-48 shrink-0 border-r border-gray-100 bg-gray-50/50"></div>
                 <div className="flex-1 flex">
                     {[0, 1, 2, 3].map(q => (
                         <div key={q} className="flex-1 border-r border-dashed border-gray-200"></div>
                     ))}
                 </div>
             </div>

            {/* Today marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-orange-500 z-20 pointer-events-none"
              style={{ left: `calc(192px + ${todayPosition}% * (100% - 192px) / 100)` }}
            >
              <div className="absolute -top-0 -left-2 bg-orange-500 text-white text-[10px] px-1 rounded">
                Today
              </div>
            </div>

            {data.map((lane) => (
                <div key={lane.id} className="flex border-b border-gray-100 min-h-[100px] hover:bg-gray-50/30 transition-colors">
                    {/* Swimlane Header */}
                    <div className="w-48 shrink-0 border-r border-gray-200 p-4 flex flex-col justify-center sticky left-0 bg-white z-10 group">
                        <div className={`text-white text-xs font-bold px-3 py-4 rounded shadow-sm text-center uppercase tracking-wide ${lane.color}`}>
                            {lane.title}
                        </div>
                    </div>

                    {/* Timeline Track */}
                    <div className="flex-1 relative py-4" style={{ height: `${Math.max(100, lane.items.length * 40 + 20)}px` }}>
                        {lane.items.map((item, index) => {
                            const left = getPosition(item.startDate);
                            const width = getWidth(item.startDate, item.endDate);

                            return (
                                <div
                                    key={item.id}
                                    className={`absolute h-8 rounded text-xs font-medium text-white flex items-center px-2 cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.01] transition-all truncate z-0 ${getStatusColor(item.status)} ${getImpactBorder(item.impact)}`}
                                    style={{
                                        left: `${left}%`,
                                        width: `${width}%`,
                                        top: `${index * 40 + 10}px`,
                                    }}
                                    onClick={() => onItemClick(item)}
                                    title={`${item.title} (${format(item.startDate, 'MMM d')} - ${format(item.endDate, 'MMM d')})`}
                                >
                                    <span className="truncate flex-1">{item.title}</span>
                                    {item.comments.length > 0 && (
                                        <div className="ml-1 w-4 h-4 bg-white/30 rounded-full flex items-center justify-center text-[10px]">
                                            {item.comments.length}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}
