import React from 'react';
import { Search, Plus } from 'lucide-react';

interface HeaderProps {
  onSearch: (query: string) => void;
  onNewItem: () => void;
}

export function Header({ onSearch, onNewItem }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold text-gray-800">Payment Roadmap</h1>
        <span className="text-gray-300">/</span>
        <span className="text-gray-500 text-sm">Dashboard</span>
        <button
          onClick={onNewItem}
          className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center"
        >
          <Plus size={16} className="mr-1" />
          View
        </button>
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-1.5 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded-full bg-gray-50 focus:bg-white transition-all outline-none w-64 text-sm"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-300 overflow-hidden" title={`User ${i}`}>
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="Avatar" />
                </div>
            ))}
            <button className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">
                <Plus size={16} />
            </button>
        </div>
      </div>
    </header>
  );
}
