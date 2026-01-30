import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { RoadmapDashboard } from '@/components/RoadmapDashboard';
import { useRoadmapData } from '@/hooks/useRoadmapData';
import { Toaster, toast } from 'sonner';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  // Use Vite's base URL for correct path in both dev and production
  const csvPath = `${import.meta.env.BASE_URL}sample-roadmap-data.csv`;
  const { data, loading, error, lastModified, reload, setData } = useRoadmapData(csvPath);

  // Handle export
  const handleExport = async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const ganttElement = document.querySelector('[data-slot="gantt-container"]') ||
                           document.querySelector('.gantt-container') ||
                           document.querySelector('main');

      if (!ganttElement) {
        toast.error('Could not find chart to export');
        return;
      }

      toast.loading('Generating export...');

      const canvas = await html2canvas(ganttElement as HTMLElement, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error('Failed to create image');
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const today = new Date().toISOString().split('T')[0];
        link.download = `roadmap_${today}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);

        toast.dismiss();
        toast.success('Exported successfully!');
      });
    } catch (err: any) {
      console.error('Export error:', err);
      toast.error('Failed to export: ' + err.message);
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
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={reload}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!data || data.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-gray-400 text-5xl mb-4">📭</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Data Found</h2>
          <p className="text-gray-600 mb-4">
            Make sure sample-roadmap-data.csv is in the public directory.
          </p>
          <button
            onClick={reload}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Layout
        onSearch={setSearchQuery}
        onNewItem={() => {}}
      >
        <div className="h-full flex flex-col">
          {/* Info bar */}
          {lastModified && (
            <div className="text-xs text-gray-500 mb-2 flex items-center justify-between">
              <span>
                Last updated: {lastModified.toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
              <button
                onClick={reload}
                className="text-blue-600 hover:underline"
              >
                🔄 Refresh
              </button>
            </div>
          )}

          {/* Main dashboard */}
          <div className="flex-1">
            <RoadmapDashboard
              searchQuery={searchQuery}
              data={data}
              onDataChange={setData}
              onExport={handleExport}
            />
          </div>
        </div>
      </Layout>
      <Toaster position="bottom-right" />
    </>
  );
}
