import { useState } from 'react';
import { useRoadmapData } from './hooks/useRoadmapData';
import { applyFilters } from './utils/dataTransforms';
import FilterBar from './components/FilterBar';
import SummaryCards from './components/SummaryCards';
import GanttChart from './components/GanttChart';
import TaskDetail from './components/TaskDetail';
import ErrorState from './components/ErrorState';

function App() {
  // Load roadmap data
  const { data, loading, error, lastModified, reload } = useRoadmapData('./sample-roadmap-data.csv');

  // Filter state
  const [filters, setFilters] = useState({
    quarter: 'all',
    epic: 'all',
    effort: 'all',
    impact: 'all',
    status: 'all',
  });

  // View mode for Gantt chart
  const [viewMode, setViewMode] = useState('Month'); // Day | Week | Month | Quarter

  // Selected task for detail view
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskPosition, setTaskPosition] = useState({ x: 0, y: 0 });

  // Apply filters to data
  const filteredData = data ? applyFilters(data, filters) : [];

  // Handle task click
  const handleTaskClick = (task, position) => {
    setSelectedTask(task);
    if (position) {
      setTaskPosition(position);
    }
  };

  // Handle task hover
  const handleTaskHover = (task, position) => {
    // For now, just update position
    // Could implement hover preview here
  };

  // Handle export
  const handleExport = async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const ganttElement = document.querySelector('.gantt-container');

      if (!ganttElement) {
        alert('Gantt chart not found');
        return;
      }

      const canvas = await html2canvas(ganttElement, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const today = new Date().toISOString().split('T')[0];
        link.download = `roadmap_${today}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      });
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export: ' + err.message);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600">Loading roadmap data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ErrorState error={error} onRetry={reload} />
      </div>
    );
  }

  // No data state
  if (!data || data.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ErrorState
          error="No roadmap data found. Make sure sample-roadmap-data.csv is in the same directory."
          onRetry={reload}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Payment Roadmap Dashboard</h1>
              {lastModified && (
                <p className="text-sm text-slate-500 mt-1">
                  Last updated: {lastModified.toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={reload}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                🔄 Refresh
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                📷 Export PNG
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Summary Cards */}
        <div className="mb-6">
          <SummaryCards data={filteredData} />
        </div>

        {/* Filter Bar */}
        <div className="mb-6">
          <FilterBar
            data={data}
            filters={filters}
            setFilters={setFilters}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        </div>

        {/* Gantt Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          {filteredData.length > 0 ? (
            <GanttChart
              data={filteredData}
              viewMode={viewMode}
              onTaskClick={handleTaskClick}
              onTaskHover={handleTaskHover}
            />
          ) : (
            <div className="text-center py-12 text-slate-500">
              <p className="text-lg font-medium">No tasks match your filters</p>
              <p className="text-sm mt-2">Try adjusting your filter selection</p>
            </div>
          )}
        </div>

        {/* Task Detail Tooltip */}
        {selectedTask && (
          <TaskDetail
            task={selectedTask}
            position={taskPosition}
            onClose={() => setSelectedTask(null)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <p className="text-sm text-slate-500 text-center">
            Payment Modernization Roadmap • {data.length} total tasks •{' '}
            {filteredData.length} shown
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
