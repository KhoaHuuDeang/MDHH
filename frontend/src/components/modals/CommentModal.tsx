'use client';

import React, { useState, useEffect } from 'react';
import { csrAxiosClient } from '@/utils/axiosClient';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  users: {
    id: string;
    displayname: string;
    username: string;
    avatar: string | null;
  };
  other_comments?: Comment[];
}

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceId?: string;
  folderId?: string;
  title: string;
}

export default function CommentModal({
  isOpen,
  onClose,
  resourceId,
  folderId,
  title,
}: CommentModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, resourceId, folderId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const endpoint = resourceId
        ? `/comments/resource/${resourceId}`
        : `/comments/folder/${folderId}`;

      const response = await csrAxiosClient.get(endpoint);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const endpoint = resourceId
        ? `/comments/resource/${resourceId}`
        : `/comments/folder/${folderId}`;

      await csrAxiosClient.post(endpoint, {
        content: newComment,
        parentId: replyTo,
      });

      setNewComment('');
      setReplyTo(null);
      await fetchComments();
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white w-full max-w-[650px] max-h-[85vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10 shrink-0">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
            <span className="text-xs text-[#6A994E] font-medium mt-0.5">Discussion & Feedback</span>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#6A994E]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-5 scroll-smooth">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 space-y-3">
              <div className="w-8 h-8 border-4 border-[#F0F8F2] border-t-[#386641] rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500 font-medium">Loading conversation...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-gray-400">
              <div className="bg-[#F0F8F2] p-4 rounded-full mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#386641" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <p className="font-medium">No comments yet</p>
              <p className="text-xs">Be the first to share your thoughts.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {comments.map((comment) => (
                <div key={comment.id} className="group animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* Main Comment */}
                  <div className="flex gap-3 items-start">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-[#386641] text-white flex items-center justify-center font-bold text-sm shadow-sm select-none">
                      {comment.users.avatar ? (
                         <img src={comment.users.avatar} alt={comment.users.displayname} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        comment.users.displayname[0].toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 max-w-[85%]">
                      <div className="bg-[#F0F8F2] rounded-2xl px-4 py-3 text-gray-900 shadow-sm relative">
                        <p className="font-bold text-[#386641] text-sm mb-0.5 cursor-pointer hover:underline">
                          {comment.users.displayname}
                        </p>
                        <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                      <div className="flex gap-4 mt-1.5 ml-2 items-center">
                        <span className="text-xs text-gray-500 font-medium">
                            {new Date(comment.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <button
                          onClick={() => setReplyTo(comment.id)}
                          className="text-xs font-bold text-gray-500 hover:text-[#386641] transition-colors cursor-pointer"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Nested Replies */}
                  {comment.other_comments && comment.other_comments.length > 0 && (
                    <div className="ml-12 mt-3 pl-3 border-l-2 border-[#F0F8F2] space-y-3">
                      {comment.other_comments.map((reply) => (
                        <div key={reply.id} className="flex gap-2.5 items-start">
                          <div className="shrink-0 w-7 h-7 rounded-full bg-[#6A994E] text-white flex items-center justify-center text-xs font-bold shadow-sm select-none">
                            {reply.users.avatar ? (
                               <img src={reply.users.avatar} alt={reply.users.displayname} className="w-full h-full rounded-full object-cover" />
                            ) : (
                               reply.users.displayname[0].toUpperCase()
                            )}
                          </div>
                          <div className="flex-1 max-w-[90%]">
                            <div className="bg-gray-50 rounded-2xl px-3 py-2 text-gray-900 border border-gray-100">
                              <p className="font-bold text-gray-700 text-xs mb-0.5">
                                {reply.users.displayname}
                              </p>
                              <p className="text-sm break-words whitespace-pre-wrap">{reply.content}</p>
                            </div>
                            <span className="text-[10px] text-gray-400 mt-1 ml-2 block">
                               {new Date(reply.created_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment Input */}
        <div className="p-4 bg-white border-t border-gray-100 shrink-0 z-20">
          {replyTo && (
            <div className="flex justify-between items-center bg-[#F0F8F2] px-3 py-2 rounded-lg mb-3 border border-[#386641]/20 animate-in slide-in-from-bottom-2">
              <span className="text-sm text-[#386641] font-medium">Replying to a comment...</span>
              <button 
                onClick={() => setReplyTo(null)} 
                className="text-xs bg-white text-gray-600 px-2 py-1 rounded hover:bg-gray-100 border border-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex gap-2 items-center">
            <div className="relative flex-1">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 rounded-full px-5 py-3 pr-10 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#386641] focus:border-transparent transition-all shadow-sm"
              />
            </div>
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="shrink-0 bg-[#386641] hover:bg-[#2b4d32] disabled:opacity-50 disabled:cursor-not-allowed text-white w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-all active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={newComment.trim() ? "translate-x-0.5" : ""}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}