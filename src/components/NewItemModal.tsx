import React, { useState } from 'react';
import { Swimlane, Status, Impact } from '@/lib/data';
import { X } from 'lucide-react';

interface NewItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: any) => void;
  lanes: Swimlane[];
}

export function NewItemModal({ isOpen, onClose, onSave, lanes }: NewItemModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: 'Not Started' as Status,
    owner: '',
    impact: 'Medium' as Impact,
    laneId: lanes[0]?.id || ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
        ...formData,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        comments: [],
        subItems: [],
        dependencies: []
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Add New Roadmap Item</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
           <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
               <input
                 required
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                 placeholder="e.g., Database Migration"
                 value={formData.title}
                 onChange={e => setFormData({...formData, title: e.target.value})}
               />
           </div>

           <div className="grid grid-cols-2 gap-4">
               <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                   <input
                     type="date"
                     required
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                     value={formData.startDate}
                     onChange={e => setFormData({...formData, startDate: e.target.value})}
                   />
               </div>
               <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                   <input
                     type="date"
                     required
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                     value={formData.endDate}
                     onChange={e => setFormData({...formData, endDate: e.target.value})}
                   />
               </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
               <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Lane / Team</label>
                   <select
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                     value={formData.laneId}
                     onChange={e => setFormData({...formData, laneId: e.target.value})}
                   >
                       {lanes.map(lane => (
                           <option key={lane.id} value={lane.id}>{lane.title}</option>
                       ))}
                   </select>
               </div>
               <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                   <input
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                     placeholder="Name"
                     value={formData.owner}
                     onChange={e => setFormData({...formData, owner: e.target.value})}
                   />
               </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                   <select
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                     value={formData.status}
                     onChange={e => setFormData({...formData, status: e.target.value as Status})}
                   >
                       <option>Not Started</option>
                       <option>In Progress</option>
                       <option>Blocked</option>
                       <option>Complete</option>
                   </select>
               </div>
               <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Impact</label>
                   <select
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                     value={formData.impact}
                     onChange={e => setFormData({...formData, impact: e.target.value as Impact})}
                   >
                       <option>Low</option>
                       <option>Medium</option>
                       <option>High</option>
                   </select>
               </div>
           </div>

           <div className="pt-4 flex justify-end space-x-3">
               <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
               <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg shadow-sm transition-colors">Create Item</button>
           </div>
        </form>
      </div>
    </div>
  );
}
