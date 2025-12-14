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
}

interface Tag {
  id: string;
  name: string;
  description?: string;
  level_id: string;
  classification_levels?: Classification;
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const { t } = useTranslation();
  const toast = useNotifications();

  // Dialog states
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const [editDialog, setEditDialog] = useState<{ isOpen: boolean; step: 'name' | 'desc'; tag: Tag | null; newName: string; newDesc: string }>({
    isOpen: false,
    step: 'name',
    tag: null,
    newName: '',
    newDesc: ''
  });

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const [tagsRes, classRes] = await Promise.all([
        csrAxiosClient.get('/tags'),
        csrAxiosClient.get('/classification-levels'),
      ]);
      setTags(tagsRes.data);
      setClassifications(classRes.data);
    } catch (err) {
      console.error(err);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const create = async () => {
    if (!name.trim() || !selectedLevel) {
      toast.error(t('admin.tagNameRequired'));
      return;
    }
    try {
      await csrAxiosClient.post('/tags', { name, description, levelId: selectedLevel });
      setName('');
      setDescription('');
      setSelectedLevel('');
      await fetchTags();
      toast.success(t('admin.created'));
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('common.error'));
    }
  };

  const update = async (id: string, newName: string, newDesc: string) => {
    try {
      await csrAxiosClient.put(`/tags/${id}`, { name: newName, description: newDesc });
      await fetchTags();
      toast.success(t('admin.updated'));
      setEditDialog({ isOpen: false, step: 'name', tag: null, newName: '', newDesc: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('common.error'));
    }
  };

  const handleEditClick = (tag: Tag) => {
    setEditDialog({
      isOpen: true,
      step: 'name',
      tag,
      newName: tag.name,
      newDesc: tag.description || ''
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
    if (editDialog.tag) {
      update(editDialog.tag.id, editDialog.newName, value);
    }
  };

  const deleteTag = async (id: string) => {
    try {
      await csrAxiosClient.delete(`/tags/${id}`);
      await fetchTags();
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
             <span className="text-sm font-medium">{t('admin.loadingTags')}</span>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans text-sm">
      <div className="max-w-[1400px] mx-auto">

        {/* Page Header */}
        <div className="mb-6">
            <h1 className="text-xl font-bold text-[#386641] uppercase tracking-wide">{t('admin.tagsManagement')}</h1>
            <p className="text-gray-500 text-xs mt-1">{t('admin.tagsDesc')}</p>
        </div>

        {/* Create New Panel */}
        <div className="bg-white p-5 rounded-sm shadow-sm mb-6 border border-gray-200 border-t-4 border-t-[#386641]">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            {t('admin.createNewTag')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            {/* Classification Select */}
            <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t('admin.classification')} <span className="text-red-500">*</span></label>
                <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:border-[#386641] focus:ring-1 focus:ring-[#386641] bg-white text-sm"
                >
                    <option value="">{t('admin.selectLevel')}</option>
                    {classifications.map((c) => (
                    <option key={c.id} value={c.id}>
                        {c.name}
                    </option>
                    ))}
                </select>
            </div>

            {/* Name Input */}
            <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t('admin.tagName')} <span className="text-red-500">*</span></label>
                <input
                    type="text"
                    placeholder={t('admin.tagNamePlaceholder')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:border-[#386641] focus:ring-1 focus:ring-[#386641] text-sm"
                />
            </div>

            {/* Description Input */}
            <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t('admin.descriptionLabel')}</label>
                <textarea
                    placeholder={t('admin.descriptionPlaceholder')}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:border-[#386641] focus:ring-1 focus:ring-[#386641] text-sm resize-none h-[42px] leading-tight"
                    rows={1}
                />
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 pt-[22px]">
                <button
                    onClick={create}
                    className="w-full bg-[#386641] text-white px-4 py-2.5 rounded-sm hover:bg-[#2b4d32] shadow-sm hover:shadow-md transition-all font-medium flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    {t('admin.addTag')}
                </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
             <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-left">
                    <thead className="bg-[#386641] text-white">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider border-r border-[#4a7a53] w-[25%]">{t('upload.tag')}</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider border-r border-[#4a7a53] w-[20%]">{t('admin.classification')}</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider border-r border-[#4a7a53] w-[40%]">{t('upload.description')}</th>
                            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider w-[15%]">{t('admin.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {tags.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-10 text-center text-gray-500 bg-white">
                                    <div className="flex flex-col items-center">
                                        <svg className="w-12 h-12 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                                        {t('admin.noTagsFound')}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            tags.map((tag) => (
                                <tr key={tag.id} className="hover:bg-[#F0F8F2] transition-colors group">
                                    <td className="px-4 py-3 border-r border-gray-100">
                                        <span className="font-semibold text-gray-800">{tag.name}</span>
                                    </td>
                                    <td className="px-4 py-3 border-r border-gray-100">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                            {tag.classification_levels?.name || t('admin.unknown')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 border-r border-gray-100 text-gray-600">
                                        {tag.description || <span className="text-gray-400 italic">{t('admin.noDescription')}</span>}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleEditClick(tag)}
                                                className="p-1.5 rounded-sm text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors"
                                                title={t('common.edit')}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                                            </button>
                                            <button
                                                onClick={() => setDeleteDialog({ isOpen: true, id: tag.id })}
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
                {t('admin.total')} {tags.length} {t('sidebar.tags').toLowerCase()}
            </div>
        </div>
      </div>

      {/* Edit Dialog - Name */}
      <PromptDialog
        isOpen={editDialog.isOpen && editDialog.step === 'name'}
        onClose={() => setEditDialog({ isOpen: false, step: 'name', tag: null, newName: '', newDesc: '' })}
        onConfirm={handleEditNameConfirm}
        title={t('common.edit')}
        message={t('admin.newName')}
        defaultValue={editDialog.newName}
      />

      {/* Edit Dialog - Description */}
      <PromptDialog
        isOpen={editDialog.isOpen && editDialog.step === 'desc'}
        onClose={() => setEditDialog({ isOpen: false, step: 'name', tag: null, newName: '', newDesc: '' })}
        onConfirm={handleEditDescConfirm}
        title={t('common.edit')}
        message={t('admin.newDescription')}
        defaultValue={editDialog.newDesc}
      />

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null })}
        onConfirm={() => deleteDialog.id && deleteTag(deleteDialog.id)}
        title={t('common.delete')}
        message={t('admin.deleteTagConfirm')}
      />
    </div>
  );
}
