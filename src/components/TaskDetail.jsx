import { formatDate, getStatusColor } from '../utils/dataTransforms';

export default function TaskDetail({ task, position, onClose }) {
  if (!task) return null;

  const statusColor = getStatusColor(task.status);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-25 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed z-50 bg-white rounded-lg shadow-2xl border border-slate-200 max-w-md"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-4 flex items-start justify-between">
          <div className="flex-1 pr-4">
            <h3 className="text-lg font-semibold text-slate-900">{task.title}</h3>
            <p className="text-sm text-slate-500 mt-1">{task.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {/* Status */}
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase">Status</label>
            <div className="mt-1 flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: statusColor }}
              />
              <span className="text-sm font-medium text-slate-900">{task.status}</span>
            </div>
          </div>

          {/* Owner */}
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase">Owner</label>
            <p className="mt-1 text-sm text-slate-900">{task.owner}</p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">Start Date</label>
              <p className="mt-1 text-sm text-slate-900">
                {task.start_date ? formatDate(task.start_date) : 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">End Date</label>
              <p className="mt-1 text-sm text-slate-900">
                {task.end_date ? formatDate(task.end_date) : 'N/A'}
              </p>
            </div>
          </div>

          {/* Effort & Impact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">Effort</label>
              <p className="mt-1 text-sm text-slate-900">
                {task.effort_days ? `${task.effort_days} days` : 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">Impact</label>
              <p className="mt-1">
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    task.impact === 'High'
                      ? 'bg-red-100 text-red-700'
                      : task.impact === 'Medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {task.impact}
                </span>
              </p>
            </div>
          </div>

          {/* Progress */}
          {task.progress !== undefined && (
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">Progress</label>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${task.progress}%`,
                      backgroundColor: statusColor,
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-900">{task.progress}%</span>
              </div>
            </div>
          )}

          {/* Dependencies */}
          {task.dependency && task.dependency.length > 0 && (
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">Dependencies</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {task.dependency.map((depId) => (
                  <span
                    key={depId}
                    className="inline-block px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded"
                  >
                    {depId}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {task.notes && (
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">Notes</label>
              <p className="mt-1 text-sm text-slate-700 bg-slate-50 rounded p-3 border border-slate-200">
                {task.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-3 bg-slate-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
