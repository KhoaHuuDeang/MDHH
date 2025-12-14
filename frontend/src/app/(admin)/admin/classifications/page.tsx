'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { csrAxiosClient } from '@/utils/axiosClient';
import useNotifications from '@/hooks/useNotifications';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { PromptDialog } from '@/components/dialogs/PromptDialog';

interface Classification {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export default function ClassificationsPage() {
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { t } = useTranslation();
  const toast = useNotifications();

  // Dialog states
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const [editDialog, setEditDialog] = useState<{ isOpen: boolean; step: 'name' | 'desc'; classification: Classification | null; newName: string; newDesc: string }>({
    isOpen: false,
    step: 'name',
    classification: null,
    newName: '',
    newDesc: ''
  });

  useEffect(() => {
    fetchClassifications();
  }, []);

  const fetchClassifications = async () => {
    try {
      const res = await csrAxiosClient.get('/classification-levels');
      setClassifications(res.data);
    } catch (err) {
      console.error(err);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const create = async () => {
    if (!name.trim()) {
      toast.error(t('admin.nameRequired'));
      return;
    }
    try {
      await csrAxiosClient.post('/classification-levels', { name, description });
      setName('');
      setDescription('');
      await fetchClassifications();
      toast.success(t('admin.created'));
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('common.error'));
    }
  };

  const update = async (id: string, newName: string, newDesc: string) => {
    try {
      await csrAxiosClient.put(`/classification-levels/${id}`, { name: newName, description: newDesc });
      await fetchClassifications();
      toast.success(t('admin.updated'));
      setEditDialog({ isOpen: false, step: 'name', classification: null, newName: '', newDesc: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('common.error'));
    }
  };

  const handleEditClick = (c: Classification) => {
    setEditDialog({
      isOpen: true,
      step: 'name',
      classification: c,
      newName: c.name,
      newDesc: c.description || ''
    });
  };

  const handleEditNameConfirm = (value: string) => {
    setEditDialog(prev => ({
      ...prev,
      newName: value,
      step: 'desc'
    }));
  };

  const handleEditDescConfirm = (value: string) => {
    if (editDialog.classification) {
      update(editDialog.classification.id, editDialog.newName, value);
    }
  };

  const deleteClass = async (id: string) => {
    try {
      await csrAxiosClient.delete(`/classification-levels/${id}`);
      await fetchClassifications();
      toast.success(t('admin.deleted'));
      setDeleteDialog({ isOpen: false, id: null });
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('common.error'));
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

        {/* Page Title */}
        <div className="mb-6">
            <h1 className="text-xl font-bold text-[#386641] uppercase tracking-wide">{t('admin.classificationsManagement')}</h1>
            <p className="text-gray-500 text-xs mt-1">{t('admin.classificationsDesc')}</p>
        </div>

        {/* Create New Panel */}
        <div className="bg-white p-5 rounded-sm shadow-sm mb-6 border border-gray-200 border-t-4 border-t-[#386641]">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
            {t('admin.addNewClassification')}
          </h2>
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="flex-1 w-full">
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t('admin.levelName')} <span className="text-red-500">*</span></label>
                <input
                    type="text"
                    placeholder="e.g. Confidential, Public..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:border-[#386641] focus:ring-1 focus:ring-[#386641] transition-colors text-sm"
                />
            </div>
            <div className="flex-[2] w-full">
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t('upload.description')}</label>
                <input
                    type="text"
                    placeholder="Enter a brief description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:border-[#386641] focus:ring-1 focus:ring-[#386641] transition-colors text-sm"
                />
            </div>
            <div className="mt-auto pt-[22px]"> {/* Align button with inputs */}
                <button
                    onClick={create}
                    className="bg-[#386641] text-white px-6 py-2.5 rounded-sm hover:bg-[#2b4d32] shadow-sm hover:shadow-md transition-all font-medium flex items-center gap-2 whitespace-nowrap"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    {t('common.create')}
                </button>
            </div>
          </div>
        </div>

        {/* List Table */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-left">
                    <thead className="bg-[#386641] text-white">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider border-r border-[#4a7a53] w-[25%]">{t('admin.levelName')}</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider border-r border-[#4a7a53] w-[45%]">{t('upload.description')}</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider border-r border-[#4a7a53] w-[15%]">{t('admin.createdAt')}</th>
                            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider w-[15%]">{t('admin.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {classifications.length === 0 ? (
                             <tr>
                                <td colSpan={4} className="px-6 py-10 text-center text-gray-500 bg-white">
                                    <div className="flex flex-col items-center">
                                        <svg className="w-12 h-12 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                        {t('admin.noData')}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            classifications.map((c) => (
                                <tr key={c.id} className="hover:bg-[#F0F8F2] transition-colors group">
                                    <td className="px-4 py-3 border-r border-gray-100">
                                        <span className="font-semibold text-[#386641]">{c.name}</span>
                                    </td>
                                    <td className="px-4 py-3 border-r border-gray-100 text-gray-600">
                                        {c.description || <span className="text-gray-400 italic">No description</span>}
                                    </td>
                                    <td className="px-4 py-3 border-r border-gray-100 text-xs text-gray-500">
                                        {c.created_at ? new Date(c.created_at).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleEditClick(c)}
                                                className="p-1.5 rounded-sm text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors"
                                                title={t('common.edit')}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                                            </button>
                                            <button
                                                onClick={() => setDeleteDialog({ isOpen: true, id: c.id })}
                                                className="p-1.5 rounded-sm text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                                                title={t('common.delete')}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-xs text-gray-500 flex justify-end">
                {t('admin.totalItems')}: {classifications.length}
            </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title={t('common.delete')}
        message={t('admin.deleteConfirm')}
        onConfirm={() => deleteDialog.id && deleteClass(deleteDialog.id)}
        onCancel={() => setDeleteDialog({ isOpen: false, id: null })}
        confirmText={t('common.yes')}
        cancelText={t('common.no')}
      />

      {/* Edit Name Prompt */}
      <PromptDialog
        isOpen={editDialog.isOpen && editDialog.step === 'name'}
        title={t('admin.newName')}
        defaultValue={editDialog.newName}
        onConfirm={handleEditNameConfirm}
        onCancel={() => setEditDialog({ isOpen: false, step: 'name', classification: null, newName: '', newDesc: '' })}
        confirmText={t('upload.next')}
        cancelText={t('common.cancel')}
      />

      {/* Edit Description Prompt */}
      <PromptDialog
        isOpen={editDialog.isOpen && editDialog.step === 'desc'}
        title={t('admin.newDescription')}
        defaultValue={editDialog.newDesc}
        onConfirm={handleEditDescConfirm}
        onCancel={() => setEditDialog({ isOpen: false, step: 'name', classification: null, newName: '', newDesc: '' })}
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
      />
    </div>
  );
}