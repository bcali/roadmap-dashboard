import { useEffect, useRef } from 'react';
import Gantt from 'frappe-gantt';
import { getStatusColor, formatDate } from '../utils/dataTransforms';
import '../styles/gantt-overrides.css';

export default function GanttChart({ data, viewMode, onTaskClick, onTaskHover }) {
  const ganttRef = useRef(null);
  const ganttInstance = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0 || !ganttRef.current) return;

    // Transform data for Gantt
    const tasks = data.map((item) => ({
      id: item.id,
      name: item.title,
      start: item.start_date ? formatDateForGantt(item.start_date) : new Date().toISOString().split('T')[0],
      end: item.end_date ? formatDateForGantt(item.end_date) : new Date().toISOString().split('T')[0],
      progress: item.progress || 0,
      dependencies: Array.isArray(item.dependency) ? item.dependency.join(',') : item.dependency || '',
      custom_class: getCustomClass(item),
      _data: item, // Store original data for click handler
    }));

    // Clear existing Gantt
    if (ganttInstance.current) {
      try {
        ganttInstance.current.clear();
      } catch (e) {
        // Ignore clear errors
      }
    }

    // Clear the container
    ganttRef.current.innerHTML = '';

    try {
      // Create new Gantt instance
      ganttInstance.current = new Gantt(ganttRef.current, tasks, {
        view_mode: viewMode,
        date_format: 'YYYY-MM-DD',
        custom_popup_html: (task) => {
          const item = task._data;
          return `
            <div class="gantt-popup">
              <div class="gantt-popup-title">${item.title}</div>
              <div class="gantt-popup-row">
                <span class="label">Owner:</span>
                <span class="value">${item.owner}</span>
              </div>
              <div class="gantt-popup-row">
                <span class="label">Status:</span>
                <span class="value status-${item.status.toLowerCase().replace(/ /g, '-')}">${item.status}</span>
              </div>
              <div class="gantt-popup-row">
                <span class="label">Dates:</span>
                <span class="value">${formatDate(item.start_date)} → ${formatDate(item.end_date)}</span>
              </div>
              <div class="gantt-popup-row">
                <span class="label">Effort:</span>
                <span class="value">${item.effort_days || 0} days</span>
              </div>
              <div class="gantt-popup-row">
                <span class="label">Impact:</span>
                <span class="value">${item.impact}</span>
              </div>
              ${item.notes ? `
                <div class="gantt-popup-row">
                  <span class="label">Notes:</span>
                  <span class="value">${item.notes}</span>
                </div>
              ` : ''}
            </div>
          `;
        },
        on_click: (task) => {
          if (onTaskClick && task._data) {
            onTaskClick(task._data);
          }
        },
        on_date_change: () => {
          // Prevent date changes (read-only)
        },
        on_progress_change: () => {
          // Prevent progress changes (read-only)
        },
        on_view_change: (mode) => {
          console.log('View changed to:', mode);
        },
      });

      // Apply custom colors based on status
      tasks.forEach((task) => {
        const barElement = ganttRef.current.querySelector(`.bar[data-id="${task.id}"]`);
        if (barElement && task._data) {
          const color = getStatusColor(task._data.status);
          const progressBar = barElement.querySelector('.bar-progress');
          if (progressBar) {
            progressBar.style.fill = color;
          }
        }
      });
    } catch (error) {
      console.error('Error creating Gantt chart:', error);
    }

    return () => {
      if (ganttInstance.current) {
        try {
          ganttInstance.current.clear();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [data, viewMode, onTaskClick]);

  return (
    <div className="gantt-container">
      <div ref={ganttRef} className="gantt-chart"></div>
      {data.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <p>No tasks to display</p>
        </div>
      )}
    </div>
  );
}

/**
 * Format date for Gantt (YYYY-MM-DD)
 */
function formatDateForGantt(date) {
  if (!date) return new Date().toISOString().split('T')[0];

  if (typeof date === 'string') {
    return date;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Get custom CSS class based on task properties
 */
function getCustomClass(item) {
  const classes = [];

  // Level classes
  classes.push(`level-${item.level}`);

  // Status classes
  classes.push(`status-${item.status.toLowerCase().replace(/ /g, '-')}`);

  // Impact classes
  if (item.impact) {
    classes.push(`impact-${item.impact.toLowerCase()}`);
  }

  return classes.join(' ');
}
