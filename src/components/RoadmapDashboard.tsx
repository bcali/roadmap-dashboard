import React, { useState, useMemo } from 'react';
import { Plus, Filter, LayoutGrid, Share, Settings, Maximize2, List, Flag, Calendar } from 'lucide-react';
import { GanttChart } from './GanttChart';
import { Swimlane, RoadmapItem } from '@/lib/data';
import { TaskModal } from './TaskModal';
import { NewItemModal } from './NewItemModal';
import { toast } from 'sonner';

interface RoadmapDashboardProps {
  searchQuery?: string;
  data: Swimlane[];
  onDataChange: (data: Swimlane[]) => void;
  onExport?: () => void;
}

export function RoadmapDashboard({ searchQuery = '', data, onDataChange, onExport }: RoadmapDashboardProps) {
  const [view, setView] = useState<'timeline' | 'items' | 'milestones'>('timeline');
  const [selectedItem, setSelectedItem] = useState<RoadmapItem | null>(null);
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const lowerQuery = searchQuery.toLowerCase();
    return data.map(lane => ({
      ...lane,
      items: lane.items.filter(item => item.title.toLowerCase().includes(lowerQuery))
    })).filter(lane => lane.items.length > 0);
  }, [data, searchQuery]);

  const handleItemClick = (item: RoadmapItem) => {
    setSelectedItem(item);
  };

  const handleSaveItem = (updatedItem: RoadmapItem) => {
    const newData = data.map(lane => ({
      ...lane,
      items: lane.items.map(i => i.id === updatedItem.id ? updatedItem : i)
    }));
    onDataChange(newData);
    setSelectedItem(null);
    toast.success("Item updated");
  };

  const handleCreateItem = (newItem: any) => {
      const laneId = newItem.laneId || data[0]?.id;
      const newData = data.map(lane => {
          if (lane.id === laneId) {
              return { ...lane, items: [...lane.items, { ...newItem, id: Math.random().toString(36).substr(2, 9) }] };
          }
          return lane;
      });
      onDataChange(newData);
      setIsNewItemModalOpen(false);
      toast.success("New item created");
  };

  // Count totals for the footer
  const totalItems = data.reduce((acc, lane) => acc + lane.items.length, 0);
  const shownItems = filteredData.reduce((acc, lane) => acc + lane.items.length, 0);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors ${view === 'items' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            onClick={() => setView('items')}
          >
            <List size={16} className="mr-2" /> Items
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors ${view === 'milestones' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            onClick={() => setView('milestones')}
          >
            <Flag size={16} className="mr-2" /> Milestones
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors ${view === 'timeline' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-900'}`}
            onClick={() => setView('timeline')}
          >
            <Calendar size={16} className="mr-2" /> Timeline
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsNewItemModalOpen(true)}
            className="px-4 py-2 bg-white border border-blue-500 text-blue-600 hover:bg-blue-50 rounded-md text-sm font-medium flex items-center transition-colors shadow-sm"
          >
            <Plus size={16} className="mr-2" /> Item
          </button>
          <div className="h-6 w-px bg-gray-300 mx-2" />
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-md" title="Filter">
            <Filter size={18} />
          </button>
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-md" title="Group By">
            <LayoutGrid size={18} />
          </button>
          <button
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-md"
            title="Export"
            onClick={onExport}
          >
            <Share size={18} />
          </button>
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-md" title="Settings">
            <Settings size={18} />
          </button>
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-md" title="Fullscreen">
            <Maximize2 size={18} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative">
        {view === 'timeline' && (
            <GanttChart
                data={filteredData}
                onItemClick={handleItemClick}
            />
        )}
        {view !== 'timeline' && (
            <div className="flex items-center justify-center h-full text-gray-400">
                Other views not implemented in this demo.
            </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-sm text-gray-500 text-center">
        {totalItems} total items • {shownItems} shown
      </div>

      {/* Modals */}
      {selectedItem && (
        <TaskModal
            item={selectedItem}
            isOpen={!!selectedItem}
            onClose={() => setSelectedItem(null)}
            onSave={handleSaveItem}
        />
      )}

      {isNewItemModalOpen && (
          <NewItemModal
            isOpen={isNewItemModalOpen}
            onClose={() => setIsNewItemModalOpen(false)}
            onSave={handleCreateItem}
            lanes={data}
          />
      )}
    </div>
  );
}
