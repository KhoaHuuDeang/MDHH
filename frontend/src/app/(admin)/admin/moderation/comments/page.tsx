'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { moderationService } from '@/services/moderationService';
import { AdminCommentItem, AdminCommentsQuery } from '@/types/moderation.types';

export default function AdminCommentsPage() {
  const { t } = useTranslation();
  const [comments, setComments] = useState<AdminCommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState<AdminCommentsQuery>({ page: 1, limit: 20 });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchComments();
  }, [query]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await moderationService.getComments(query);
      setComments(data.comments);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const reason = prompt(t('admin.reason'));
    if (!reason) return;
    try {
      await moderationService.deleteComment(id, reason);
      fetchComments();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-100 text-[#386641]">
        <div className="flex flex-col items-center gap-3">
             <div className="w-8 h-8 border-4 border-[#F0F8F2] border-t-[#386641] rounded-full animate-spin"></div>
             <span className="text-sm font-medium">{t('common.loading')}</span>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans text-sm">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header Section */}
        <div className="flex justify-between items-end mb-4">
            <div>
                <h1 className="text-xl font-bold text-[#386641] uppercase tracking-wide">{t('admin.commentModeration')}</h1>
                <p className="text-gray-500 text-xs mt-1">{t('admin.recentActivity')}</p>
            </div>
            <div className="text-xs text-gray-500 bg-white px-3 py-1 rounded-sm border border-gray-200 shadow-sm">
                {t('admin.pendingApprovals')}: <span className="font-bold text-[#386641]">{total}</span>
            </div>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-white p-4 rounded-sm shadow-sm mb-4 border border-gray-200 flex flex-wrap gap-3 items-center">
             <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </span>
                <input
                    type="text"
                    placeholder={t('common.writeComment')}
                    className="pl-9 pr-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-[#386641] focus:ring-1 focus:ring-[#386641] w-64 transition-all text-sm"
                    onChange={(e) => setQuery({ ...query, search: e.target.value, page: 1 })}
                />
            </div>

            <div className="h-8 w-[1px] bg-gray-200 mx-1 hidden sm:block"></div>

            <select
                className="px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-[#386641] focus:ring-1 focus:ring-[#386641] bg-white cursor-pointer hover:border-gray-400 transition-colors text-sm"
                onChange={(e) =>
                    setQuery({ ...query, is_deleted: e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined, page: 1 })
                }
            >
                <option value="">{t('admin.all')}</option>
                <option value="false">{t('admin.active')}</option>
                <option value="true">{t('common.noComments')}</option>
            </select>
            
            <button 
                onClick={() => fetchComments()}
                className="ml-auto p-2 text-gray-500 hover:text-[#386641] hover:bg-[#F0F8F2] rounded-sm transition-colors" 
                title="Refresh Data"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>
            </button>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-left">
                    <thead className="bg-[#386641] text-white">
                        <tr>
                            <th className="p-3 border-r border-[#4a7a53] text-xs font-medium uppercase tracking-wider w-[15%]">{t('admin.user')}</th>
                            <th className="p-3 border-r border-[#4a7a53] text-xs font-medium uppercase tracking-wider w-[35%]">{t('upload.description')}</th>
                            <th className="p-3 border-r border-[#4a7a53] text-xs font-medium uppercase tracking-wider w-[20%]">{t('resources.manage')}</th>
                            <th className="p-3 border-r border-[#4a7a53] text-xs font-medium uppercase tracking-wider w-[10%] text-center">{t('admin.status')}</th>
                            <th className="p-3 border-r border-[#4a7a53] text-xs font-medium uppercase tracking-wider w-[12%]">{t('profile.birth')}</th>
                            <th className="p-3 text-xs font-medium uppercase tracking-wider w-[8%] text-center">{t('admin.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {comments.length === 0 ? (
                             <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-400 bg-white">
                                    <div className="flex flex-col items-center">
                                        <svg className="w-12 h-12 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                                        {t('admin.noData')}
                                    </div>
                                </td>
                             </tr>
                        ) : (
                            comments.map((comment) => (
                                <tr 
                                    key={comment.id} 
                                    // UX FIX: Apply different styles if deleted
                                    className={`transition-colors group border-b border-gray-100 ${
                                        comment.is_deleted 
                                            ? 'bg-gray-50 opacity-60 grayscale-[30%] hover:bg-gray-100 cursor-not-allowed italic' // Deleted style
                                            : 'hover:bg-[#F0F8F2] bg-white' // Active style
                                    }`}
                                >
                                    <td className="p-3 border-r border-gray-100 text-gray-900 font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${comment.is_deleted ? 'bg-gray-200 border-gray-300 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>
                                                {comment.user?.username?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                            <span className="truncate">{comment.user?.username || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="p-3 border-r border-gray-100 text-gray-600">
                                        {/* UX FIX: Line-through content if deleted */}
                                        <p className={`line-clamp-2 text-xs leading-relaxed ${comment.is_deleted ? 'line-through text-gray-400' : ''}`} title={comment.content || undefined}>
                                            {comment.content || ''}
                                        </p>
                                    </td>
                                    <td className="p-3 border-r border-gray-100 text-gray-500 text-xs">
                                        {comment.resource?.title ? (
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                                {comment.resource.title}
                                            </span>
                                        ) : comment.folder?.name ? (
                                            <span className="flex items-center gap-1">
                                                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                                                {comment.folder.name}
                                            </span>
                                        ) : 'N/A'}
                                    </td>
                                    <td className="p-3 border-r border-gray-100 text-center">
                                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border
                                            ${comment.is_deleted 
                                                ? 'bg-gray-100 text-gray-500 border-gray-200' // Changed badge color for deleted to be less concerning
                                                : 'bg-[#F0F8F2] text-[#386641] border-[#6A994E]'}`}>
                                            {comment.is_deleted ? 'Deleted' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="p-3 border-r border-gray-100 text-gray-500 text-xs whitespace-nowrap">
                                        {comment.created_at ? new Date(comment.created_at).toLocaleString() : 'N/A'}
                                    </td>
                                    <td className="p-3 text-center">
                                        {!comment.is_deleted ? (
                                            <button
                                                onClick={() => handleDelete(comment.id)}
                                                className="p-1.5 rounded-sm text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors border border-transparent hover:border-red-100 opacity-80 group-hover:opacity-100"
                                                title={t('common.delete')}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                            </button>
                                        ) : (
                                            <span className="text-gray-300 cursor-not-allowed" title="Cannot perform actions on deleted comment">
                                                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/></svg>
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            <div className="bg-gray-50 p-4 border-t border-gray-200 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                    {t('admin.pageInfo', { current: query.page, total: totalPages })}
                </span>
                <div className="flex items-center gap-1">
                    <button
                        disabled={query.page === 1}
                        onClick={() => setQuery({ ...query, page: (query.page || 1) - 1 })}
                        className="px-3 py-1.5 border border-gray-300 rounded-sm text-xs bg-white text-gray-600 hover:bg-gray-50 hover:text-[#386641] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {t('upload.previous')}
                    </button>
                    <div className="px-3 py-1.5 bg-[#386641] text-white text-xs font-bold rounded-sm border border-[#386641]">
                        {query.page}
                    </div>
                    <button
                        disabled={query.page === totalPages}
                        onClick={() => setQuery({ ...query, page: (query.page || 1) + 1 })}
                        className="px-3 py-1.5 border border-gray-300 rounded-sm text-xs bg-white text-gray-600 hover:bg-gray-50 hover:text-[#386641] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {t('upload.next')}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}