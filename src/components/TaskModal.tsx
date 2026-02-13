import React, { useState } from 'react';
import { RoadmapItem, Comment } from '@/lib/data';
import { X, Calendar, User, FileText, MessageSquare, CheckCircle, Circle } from 'lucide-react';
import { format } from 'date-fns';
import { CommentsView } from './CommentsView';
import { WorkstreamLink } from './WorkstreamLink';

interface TaskModalProps {
  item: RoadmapItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: RoadmapItem) => void;
}

export function TaskModal({ item, isOpen, onClose, onSave }: TaskModalProps) {
  const [showComments, setShowComments] = useState(false);
  const [editedItem, setEditedItem] = useState<RoadmapItem>({ ...item });

  if (!isOpen) return null;

  const handleStatusChange = (status: any) => {
    setEditedItem({ ...editedItem, status });
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedItem({ ...editedItem, notes: e.target.value });
  };

  const handleAddComment = (text: string) => {
      const newComment: Comment = {
          id: Math.random().toString(),
          author: 'Me',
          text,
          date: new Date().toISOString()
      };
      const updated = {
          ...editedItem,
          comments: [...editedItem.comments, newComment]
      };
      setEditedItem(updated);
      onSave(updated);
  };

  const saveChanges = () => {
      onSave(editedItem);
      onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
           <div className="flex-1 min-w-0">
             <div className="flex items-center space-x-3">
                 <div className={`h-4 w-4 rounded-full shrink-0 ${editedItem.status === 'Complete' ? 'bg-emerald-500' : editedItem.status === 'In Progress' ? 'bg-blue-500' : 'bg-gray-400'}`} />
                 <input
                   className="text-xl font-bold bg-transparent border-none focus:ring-0 text-gray-900 w-full"
                   value={editedItem.title}
                   onChange={(e) => setEditedItem({...editedItem, title: e.target.value})}
                 />
             </div>
             <div className="mt-1 ml-7">
               <WorkstreamLink itemId={editedItem.id} />
             </div>
           </div>
           <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors shrink-0">
             <X size={20} />
           </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">

            {/* Meta Grid */}
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Timeline</label>
                    <div className="flex items-center text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                        <Calendar size={16} className="mr-2 text-gray-400" />
                        <span className="text-sm font-medium">
                            {format(new Date(editedItem.startDate), 'MMM d')} - {format(new Date(editedItem.endDate), 'MMM d, yyyy')}
                        </span>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Owner</label>
                    <div className="flex items-center text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                        <User size={16} className="mr-2 text-gray-400" />
                        <span className="text-sm font-medium">{editedItem.owner}</span>
                    </div>
                </div>

                <div className="space-y-1">
                     <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</label>
                     <select
                        className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                        value={editedItem.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                     >
                        <option>Not Started</option>
                        <option>In Progress</option>
                        <option>Blocked</option>
                        <option>Complete</option>
                     </select>
                </div>

                <div className="space-y-1">
                     <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Impact</label>
                     <div className="flex items-center space-x-2">
                        {['Low', 'Medium', 'High'].map(lvl => (
                            <button
                                key={lvl}
                                onClick={() => setEditedItem({...editedItem, impact: lvl as any})}
                                className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${editedItem.impact === lvl ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            >
                                {lvl}
                            </button>
                        ))}
                     </div>
                </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
                        <FileText size={14} className="mr-1" />
                        Notes
                    </label>
                    <button
                        onClick={() => setShowComments(true)}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center hover:underline"
                    >
                        <MessageSquare size={14} className="mr-1" />
                        See Comments ({editedItem.comments.length})
                    </button>
                </div>
                <textarea
                    className="w-full p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent min-h-[120px]"
                    placeholder="Add notes here..."
                    value={editedItem.notes || ''}
                    onChange={handleNotesChange}
                />
            </div>

            {/* Sub Items */}
            <div className="space-y-3">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sub-Items</label>
                <div className="bg-gray-50 rounded-lg border border-gray-200 divide-y divide-gray-200">
                    {editedItem.subItems.length === 0 && (
                        <div className="p-4 text-center text-sm text-gray-400 italic">No sub-items defined.</div>
                    )}
                    {editedItem.subItems.map(sub => (
                        <div key={sub.id} className="p-3 flex items-center justify-between hover:bg-white transition-colors">
                            <div className="flex items-center space-x-3">
                                {sub.status === 'Complete' ? <CheckCircle size={16} className="text-emerald-500" /> : <Circle size={16} className="text-gray-300" />}
                                <span className={`text-sm ${sub.status === 'Complete' ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{sub.title}</span>
                            </div>
                            <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{sub.status}</span>
                        </div>
                    ))}
                </div>
            </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
            <button onClick={onClose} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors text-sm">Cancel</button>
            <button onClick={saveChanges} className="px-4 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg shadow-sm transition-colors text-sm">Save Changes</button>
        </div>

        {/* Comments Overlay */}
        {showComments && (
            <CommentsView
                comments={editedItem.comments}
                onClose={() => setShowComments(false)}
                onAddComment={handleAddComment}
            />
        )}
      </div>
    </div>
  );
}
