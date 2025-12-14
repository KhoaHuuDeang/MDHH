'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { moderationService } from '@/services/moderationService';
import { AdminUploadItem, AdminUploadsQuery } from '@/types/moderation.types';
import useNotifications from '@/hooks/useNotifications';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { PromptDialog } from '@/components/dialogs/PromptDialog';

export default function AdminUploadsPage() {
  const { t } = useTranslation();
  const toast = useNotifications();
  const [uploads, setUploads] = useState<AdminUploadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState<AdminUploadsQuery>({ page: 1, limit: 20 });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchInput, setSearchInput] = useState('');

  // Dialog states
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const [approveDialog, setApproveDialog] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const [rejectDialog, setRejectDialog] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(prev => ({ ...prev, search: searchInput || undefined, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchUploads();
  }, [query]);

  const fetchUploads = async () => {
    try {
      setLoading(true);
      const data = await moderationService.getUploads(query);
      setUploads(data.uploads);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Failed to fetch uploads:', error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await moderationService.deleteUpload(id);
      await fetchUploads();
      toast.success(t('admin.deleted'));
      setDeleteDialog({ isOpen: false, id: null });
    } catch (error) {
      console.error('Failed to delete upload:', error);
      toast.error(t('common.error'));
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await moderationService.approveUpload(id);
      await fetchUploads();
      toast.success(t('admin.updated'));
      setApproveDialog({ isOpen: false, id: null });
    } catch (error) {
      console.error('Failed to approve upload:', error);
      toast.error(t('admin.error'));
    }
  };

  const handleReject = async (reason: string) => {
    if (!rejectDialog.id) return;
    if (!reason.trim()) {
      toast.error(t('admin.reasonRequired'));
      return;
    }
    try {
      await moderationService.rejectUpload(rejectDialog.id, reason);
      await fetchUploads();
      toast.success(t('admin.updated'));
      setRejectDialog({ isOpen: false, id: null });
    } catch (error) {
      console.error('Failed to reject upload:', error);
      toast.error(t('admin.error'));
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50 text-[#386641]">
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
                <h1 className="text-xl font-bold text-[#386641] uppercase tracking-wide">{t('admin.uploadModeration')}</h1>
                <p className="text-gray-500 text-xs mt-1">{t('admin.recentActivity')}</p>
            </div>
            <div className="text-xs text-gray-500">
                {t('admin.pendingApprovals')}: <span className="font-bold text-[#386641]">{total}</span>
            </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-4 rounded-sm shadow-sm mb-4 border border-gray-200 flex flex-wrap gap-3 items-center">
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </span>
                <input
                    type="text"
                    placeholder="Search by filename..."
                    value={searchInput}
                    className="pl-9 pr-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-[#386641] focus:ring-1 focus:ring-[#386641] w-64 transition-all"
                    onChange={(e) => setSearchInput(e.target.value)}
                />
            </div>

            <div className="h-8 w-[1px] bg-gray-200 mx-1 hidden sm:block"></div>

            <select
                className="px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-[#386641] focus:ring-1 focus:ring-[#386641] bg-white cursor-pointer hover:border-gray-400 transition-colors"
                onChange={(e) => setQuery({ ...query, status: e.target.value as any, page: 1 })}
            >
                <option value="">{t('admin.all')}</option>
                <option value="PENDING">{t('common.pending')}</option>
                <option value="COMPLETED">{t('resources.approvedStatus')}</option>
                <option value="FAILED">{t('resources.rejectedStatus')}</option>
            </select>

            <select
                className="px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-[#386641] focus:ring-1 focus:ring-[#386641] bg-white cursor-pointer hover:border-gray-400 transition-colors"
                onChange={(e) => setQuery({ ...query, moderation_status: e.target.value as any, page: 1 })}
            >
                <option value="">{t('admin.all')}</option>
                <option value="PENDING_APPROVAL">{t('admin.pendingApprovals')}</option>
                <option value="APPROVED">{t('resources.approvedStatus')}</option>
                <option value="REJECTED">{t('resources.rejectedStatus')}</option>
            </select>

            <button
                onClick={() => fetchUploads()}
                className="ml-auto p-2 text-gray-500 hover:text-[#386641] hover:bg-[#F0F8F2] rounded-sm transition-colors"
                title="Refresh Data"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>
            </button>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="bg-[#386641] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#2b4d32]">
                            <th className="p-3 border-r border-[#4a7a53] w-[18%]">{t('upload.fileName')}</th>
                            <th className="p-3 border-r border-[#4a7a53] w-[17%]">Title</th>
                            <th className="p-3 border-r border-[#4a7a53] w-[12%]">{t('admin.user')}</th>
                            <th className="p-3 border-r border-[#4a7a53] w-[8%] text-right">{t('fileCard.download')}</th>
                            <th className="p-3 border-r border-[#4a7a53] w-[8%] text-center">{t('admin.status')}</th>
                            <th className="p-3 border-r border-[#4a7a53] w-[17%]">{t('admin.moderation')}</th>
                            <th className="p-3 border-r border-[#4a7a53] w-[12%]">{t('admin.createdAt')}</th>
                            <th className="p-3 text-center w-[8%]">{t('admin.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {uploads.map((upload) => (
                            <tr key={upload.id} className="hover:bg-[#F0F8F2] transition-colors group">
                                <td className="p-3 border-r border-gray-100">
                                    <div className="font-medium text-gray-900 truncate max-w-[200px]" title={upload.file_name || undefined}>
                                        {upload.file_name || 'N/A'}
                                    </div>
                                </td>
                                <td className="p-3 border-r border-gray-100">
                                    <div className="text-gray-700 truncate max-w-[200px]" title={upload.resource?.title || undefined}>
                                        {upload.resource?.title || 'N/A'}
                                    </div>
                                </td>
                                <td className="p-3 border-r border-gray-100 text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                            {upload.user?.username?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <span className="truncate">{upload.user?.username || 'N/A'}</span>
                                    </div>
                                </td>
                                <td className="p-3 border-r border-gray-100 text-right font-mono text-gray-500 text-xs">
                                    {upload.file_size ? (upload.file_size / 1024).toFixed(2) : '0.00'} KB
                                </td>
                                <td className="p-3 border-r border-gray-100 text-center">
                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border
                                        ${upload.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                          upload.status === 'FAILED' ? 'bg-red-50 text-red-700 border-red-100' :
                                          'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                        {upload.status || 'N/A'}
                                    </span>
                                </td>
                                <td className="p-3 border-r border-gray-100">
                                    <div className="flex flex-col gap-1">
                                        <span className={`inline-flex w-fit items-center px-2 py-0.5 rounded-sm text-[11px] font-bold border
                                            ${upload.moderation_status === 'APPROVED' ? 'bg-[#F0F8F2] text-[#386641] border-[#386641]/20' :
                                              upload.moderation_status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                                              'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                                            {upload.moderation_status === 'APPROVED' && <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}
                                            {upload.moderation_status || 'N/A'}
                                        </span>
                                        {upload.moderation_reason && (
                                            <span className="text-[10px] text-gray-500 italic border-l-2 border-gray-300 pl-1.5 line-clamp-1" title={upload.moderation_reason}>
                                                "{upload.moderation_reason}"
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-3 border-r border-gray-100 text-gray-500 text-xs whitespace-nowrap">
                                    {upload.created_at ? new Date(upload.created_at).toLocaleString() : 'N/A'}
                                </td>
                                <td className="p-3 text-center">
                                    <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                        {upload.moderation_status === 'PENDING_APPROVAL' && (
                                            <>
                                                <button
                                                    onClick={() => setApproveDialog({ isOpen: true, id: upload.id })}
                                                    className="p-1.5 rounded-sm text-green-600 hover:bg-green-100 hover:text-green-700 transition-colors border border-transparent hover:border-green-200"
                                                    title={t('resources.approvedStatus')}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                                </button>
                                                <button
                                                    onClick={() => setRejectDialog({ isOpen: true, id: upload.id })}
                                                    className="p-1.5 rounded-sm text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors border border-transparent hover:border-red-100"
                                                    title={t('resources.rejectedStatus')}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => setDeleteDialog({ isOpen: true, id: upload.id })}
                                            className="p-1.5 rounded-sm text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors border border-transparent hover:border-gray-300"
                                            title={t('common.delete')}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {uploads.length === 0 && (
                             <tr>
                                <td colSpan={8} className="p-8 text-center text-gray-400 bg-white">
                                    <div className="flex flex-col items-center">
                                        <svg className="w-12 h-12 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                        {t('admin.noData')}
                                    </div>
                                </td>
                             </tr>
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

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null })}
        onConfirm={() => deleteDialog.id && handleDelete(deleteDialog.id)}
        title={t('common.delete')}
        message={t('admin.deleteConfirm')}
      />

      {/* Approve Confirm Dialog */}
      <ConfirmDialog
        isOpen={approveDialog.isOpen}
        onClose={() => setApproveDialog({ isOpen: false, id: null })}
        onConfirm={() => approveDialog.id && handleApprove(approveDialog.id)}
        title={t('common.confirm')}
        message={t('resources.approvedStatus')}
      />

      {/* Reject Prompt Dialog */}
      <PromptDialog
        isOpen={rejectDialog.isOpen}
        onClose={() => setRejectDialog({ isOpen: false, id: null })}
        onConfirm={handleReject}
        title={t('resources.rejectedStatus')}
        message={t('admin.reason')}
        defaultValue=""
      />
    </div>
  );
}
