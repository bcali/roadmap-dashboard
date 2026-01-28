import { getUniqueEpics, getUniqueQuarters } from '../utils/dataTransforms';

export default function FilterBar({ data, filters, setFilters, viewMode, setViewMode }) {
  const epics = getUniqueEpics(data);
  const quarters = getUniqueQuarters(data);

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const resetFilters = () => {
    setFilters({
      quarter: 'all',
      epic: 'all',
      effort: 'all',
      impact: 'all',
      status: 'all',
    });
  };

  const activeFiltersCount = Object.values(filters).filter((v) => v !== 'all').length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* View Mode */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">View:</label>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Day">Day</option>
            <option value="Week">Week</option>
            <option value="Month">Month</option>
            <option value="Quarter">Quarter</option>
          </select>
        </div>

        <div className="h-6 w-px bg-slate-300" />

        {/* Quarter Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Quarter:</label>
          <select
            value={filters.quarter}
            onChange={(e) => handleFilterChange('quarter', e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Quarters</option>
            {quarters.map((quarter) => (
              <option key={quarter} value={quarter}>
                {quarter}
              </option>
            ))}
          </select>
        </div>

        {/* Epic Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Epic:</label>
          <select
            value={filters.epic}
            onChange={(e) => handleFilterChange('epic', e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[200px]"
          >
            <option value="all">All Epics</option>
            {epics.map((epic) => (
              <option key={epic} value={epic}>
                {epic}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Status:</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="Complete">Complete</option>
            <option value="In Progress">In Progress</option>
            <option value="Blocked">Blocked</option>
            <option value="Not Started">Not Started</option>
          </select>
        </div>

        {/* Impact Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Impact:</label>
          <select
            value={filters.impact}
            onChange={(e) => handleFilterChange('impact', e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Effort Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Effort:</label>
          <select
            value={filters.effort}
            onChange={(e) => handleFilterChange('effort', e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="Low">Low (&lt;3d)</option>
            <option value="Medium">Medium (3-10d)</option>
            <option value="High">High (&gt;10d)</option>
          </select>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                {activeFiltersCount} {activeFiltersCount === 1 ? 'filter' : 'filters'}
              </span>
              <button
                onClick={resetFilters}
                className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Clear all
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
