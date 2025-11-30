'use client';

import { useState, useEffect } from 'react';
import { moderationService } from '@/services/moderationService';
import { AdminFolderItem, AdminFoldersQuery } from '@/types/moderation.types';

export default function AdminFoldersPage() {
  const [folders, setFolders] = useState<AdminFolderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState<AdminFoldersQuery>({ page: 1, limit: 20 });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchFolders();
  }, [query]);

  const fetchFolders = async () => {
    try {
      setLoading(true);
      const data = await moderationService.getFolders(query);
      setFolders(data.folders);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Failed to fetch folders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    // Logic cũ: Prompt -> Confirm -> Delete -> Refetch
    const reason = prompt('Reason for deletion:');
    if (!reason) return;
    if (!confirm('Delete this folder? This will remove all associated data.')) return;
    try {
      await moderationService.deleteFolder(id, reason);
      fetchFolders();
    } catch (error) {
      console.error('Failed to delete folder:', error);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-100 text-[#386641]">
        <div className="flex flex-col items-center gap-3">
             <div className="w-8 h-8 border-4 border-[#F0F8F2] border-t-[#386641] rounded-full animate-spin"></div>
             <span className="text-sm font-medium">Loading Folders...</span>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans text-sm">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header Section */}
        <div className="flex justify-between items-end mb-4">
            <div>
                <h1 className="text-xl font-bold text-[#386641] uppercase tracking-wide">Folders Management</h1>
                <p className="text-gray-500 text-xs mt-1">Organize and moderate user collections.</p>
            </div>
            <div className="text-xs text-gray-500 bg-white px-3 py-1 rounded-sm border border-gray-200 shadow-sm">
                Total records: <span className="font-bold text-[#386641]">{total}</span>
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
                    placeholder="Search folders..."
                    className="pl-9 pr-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-[#386641] focus:ring-1 focus:ring-[#386641] w-64 transition-all text-sm"
                    onChange={(e) => setQuery({ ...query, search: e.target.value, page: 1 })}
                />
            </div>

            <div className="h-8 w-[1px] bg-gray-200 mx-1 hidden sm:block"></div>

            <select
                className="px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-[#386641] focus:ring-1 focus:ring-[#386641] bg-white cursor-pointer hover:border-gray-400 transition-colors text-sm"
                onChange={(e) => setQuery({ ...query, visibility: e.target.value as any, page: 1 })}
            >
                <option value="">All Visibility</option>
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
            </select>
            
            <button 
                onClick={() => fetchFolders()}
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
                            <th className="p-3 border-r border-[#4a7a53] text-xs font-medium uppercase tracking-wider w-[25%]">Name</th>
                            <th className="p-3 border-r border-[#4a7a53] text-xs font-medium uppercase tracking-wider w-[20%]">User</th>
                            <th className="p-3 border-r border-[#4a7a53] text-xs font-medium uppercase tracking-wider w-[10%] text-center">Visibility</th>
                            <th className="p-3 border-r border-[#4a7a53] text-xs font-medium uppercase tracking-wider w-[10%] text-center">Files</th>
                            <th className="p-3 border-r border-[#4a7a53] text-xs font-medium uppercase tracking-wider w-[10%] text-center">Followers</th>
                            <th className="p-3 border-r border-[#4a7a53] text-xs font-medium uppercase tracking-wider w-[15%]">Created</th>
                            <th className="p-3 text-xs font-medium uppercase tracking-wider w-[10%] text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {folders.length === 0 ? (
                             <tr>
                                <td colSpan={7} className="p-8 text-center text-gray-400 bg-white">
                                    <div className="flex flex-col items-center">
                                        <svg className="w-12 h-12 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                                        No folders found.
                                    </div>
                                </td>
                             </tr>
                        ) : (
                            folders.map((folder) => (
                                <tr key={folder.id} className="hover:bg-[#F0F8F2] transition-colors group">
                                    {/* Name Column */}
                                    <td className="p-3 border-r border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5 text-[#6A994E]" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path></svg>
                                            <span className="font-semibold text-gray-800 truncate max-w-[200px]" title={folder.name || undefined}>{folder.name || 'Unnamed Folder'}</span>
                                        </div>
                                    </td>
                                    {/* User Column */}
                                    <td className="p-3 border-r border-gray-100 text-gray-700">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-500 font-bold border border-gray-200">
                                                {folder.user?.username?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                            <span className="truncate">{folder.user?.username || 'N/A'}</span>
                                        </div>
                                    </td>
                                    {/* Visibility Column */}
                                    <td className="p-3 border-r border-gray-100 text-center">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border
                                            ${folder.visibility === 'PUBLIC' 
                                                ? 'bg-green-50 text-green-700 border-green-200' 
                                                : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                            {folder.visibility === 'PUBLIC' 
                                                ? <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg> 
                                                : <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>}
                                            {folder.visibility || 'N/A'}
                                        </span>
                                    </td>
                                    {/* Files Count */}
                                    <td className="p-3 border-r border-gray-100 text-center">
                                        <span className="bg-gray-50 px-2 py-1 rounded text-xs font-mono text-gray-600 border border-gray-200">
                                            {folder._count?.folder_files || 0}
                                        </span>
                                    </td>
                                    {/* Followers Count */}
                                    <td className="p-3 border-r border-gray-100 text-center">
                                        <span className="text-xs font-semibold text-gray-700">
                                            {folder._count?.follows || 0}
                                        </span>
                                    </td>
                                    {/* Created At */}
                                    <td className="p-3 border-r border-gray-100 text-gray-500 text-xs whitespace-nowrap">
                                        {folder.created_at ? new Date(folder.created_at).toLocaleString() : 'N/A'}
                                    </td>
                                    {/* Actions */}
                                    <td className="p-3 text-center">
                                        <button 
                                            onClick={() => handleDelete(folder.id)} 
                                            className="p-1.5 rounded-sm text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors border border-transparent hover:border-red-100 opacity-80 group-hover:opacity-100"
                                            title="Delete Folder"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                        </button>
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
                    Showing page <span className="font-semibold text-gray-900">{query.page}</span> of <span className="font-semibold text-gray-900">{totalPages}</span>
                </span>
                <div className="flex items-center gap-1">
                    <button
                        disabled={query.page === 1}
                        onClick={() => setQuery({ ...query, page: (query.page || 1) - 1 })}
                        className="px-3 py-1.5 border border-gray-300 rounded-sm text-xs bg-white text-gray-600 hover:bg-gray-50 hover:text-[#386641] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Previous
                    </button>
                    <div className="px-3 py-1.5 bg-[#386641] text-white text-xs font-bold rounded-sm border border-[#386641]">
                        {query.page}
                    </div>
                    <button
                        disabled={query.page === totalPages}
                        onClick={() => setQuery({ ...query, page: (query.page || 1) + 1 })}
                        className="px-3 py-1.5 border border-gray-300 rounded-sm text-xs bg-white text-gray-600 hover:bg-gray-50 hover:text-[#386641] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}