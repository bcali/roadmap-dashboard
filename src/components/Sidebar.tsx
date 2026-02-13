import React from 'react';
import {
  Download,
  List,
  Menu,
  Users,
  Bell,
  Zap,
  HelpCircle,
  Lightbulb
} from 'lucide-react';

interface SidebarProps {
  onOpenRecommendations?: () => void;
}

export function Sidebar({ onOpenRecommendations }: SidebarProps) {
  return (
    <aside className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-6 z-10 shadow-sm">
      {/* Logo Placeholder */}
      <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center text-white font-bold text-xl mb-4">
        R
      </div>

      <nav className="flex flex-col items-center space-y-6 flex-1">
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Export">
          <Download size={20} />
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="List View">
          <List size={20} />
        </button>
        <button className="p-2 text-white bg-teal-400 rounded-full shadow-lg ring-4 ring-teal-50 transition-all" title="Dashboard">
          <Menu size={20} />
        </button>
        <button
          className="p-2 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
          title="AI Recommendations"
          onClick={onOpenRecommendations}
        >
          <Lightbulb size={20} />
        </button>

        <div className="flex-1" />

        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Team">
          <Users size={20} />
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Notifications">
          <Bell size={20} />
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Automations">
          <Zap size={20} />
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Help">
          <HelpCircle size={20} />
        </button>
      </nav>

      <div className="mt-auto pt-4">
         <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
             <div className="w-full h-full bg-gray-300" />
         </div>
      </div>
    </aside>
  );
}
