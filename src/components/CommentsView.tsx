import React, { useState } from 'react';
import { Comment } from '@/lib/data';
import { X, Send, User } from 'lucide-react';
import { format } from 'date-fns';

interface CommentsViewProps {
  comments: Comment[];
  onClose: () => void;
  onAddComment: (text: string) => void;
}

export function CommentsView({ comments, onClose, onAddComment }: CommentsViewProps) {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  return (
    <div className="absolute inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-bottom-10 duration-300">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="font-bold text-gray-800 flex items-center">
            Comments
            <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{comments.length}</span>
        </h3>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {comments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <p>No comments yet.</p>
                <p className="text-sm">Be the first to share your thoughts!</p>
            </div>
        ) : (
            comments.map((comment) => (
            <div key={comment.id} className="flex space-x-3 group">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    <User size={14} />
                </div>
                <div className="flex-1 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-900">{comment.author}</span>
                        <span className="text-xs text-gray-400">{format(new Date(comment.date), 'MMM d, h:mm a')}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{comment.text}</p>
                </div>
            </div>
            ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
        <div className="relative">
            <input
                className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                autoFocus
            />
            <button
                type="submit"
                disabled={!newComment.trim()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-blue-600 hover:bg-blue-50 rounded-md disabled:text-gray-300 disabled:hover:bg-transparent transition-colors"
            >
                <Send size={18} />
            </button>
        </div>
      </form>
    </div>
  );
}
