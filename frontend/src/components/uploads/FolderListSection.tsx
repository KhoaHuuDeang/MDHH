'use client';

import React, { useEffect, useState } from 'react';
import { getIcon } from '@/utils/getIcon';
import useNotifications from '@/hooks/useNotifications';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';

interface Folder {
  id: string;
  name: string;
  description: string | null;
  visibility: string;
  created_at: string;
  classification_levels: { id: string; name: string };
  folder_tags: Array<{ tags: { id: string; name: string } }>;
}

interface FolderListSectionProps {
  userId: string;
  accessToken: string;
}

export default function FolderListSection({ userId, accessToken }: FolderListSectionProps) {
  const toast = useNotifications();
  const { t } = useTranslation();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; id: string | null; name: string }>({
    isOpen: false,
    id: null,
    name: '',
  });

  const fetchFolders = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/folders`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch folders');
      }

      const data = await res.json();
      setFolders(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Folder fetch error:', error);
      toast.error(error.message || t('folders.cannotLoad'));
      setFolders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (folderId: string, folderName: string) => {
    setDeleteDialog({ isOpen: true, id: folderId, name: folderName });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/folders/${deleteDialog.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      toast.success(t('folders.deleted'));
      fetchFolders();
      setDeleteDialog({ isOpen: false, id: null, name: '' });
    } catch (error) {
      toast.error(t('folders.cannotDelete'));
    }
  };

  useEffect(() => {
    fetchFolders();
  }, [userId, accessToken]);

  if (isLoading) {
    return (
      <section className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('folders.myFolders')}</h2>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t('folders.myFolders')}</h2>
        <div className="text-sm text-gray-600">
          {t('folders.total')}: {folders.length} {t('folders.folders')}
        </div>
      </div>

      {folders.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            {getIcon('Folder', 48, 'text-gray-400')}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('folders.noFolders')}</h3>
          <p className="text-gray-500">{t('folders.createWhenUpload')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow bg-gray-50"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    {getIcon('Folder', 24, 'text-blue-600')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{folder.name}</h3>
                    <p className="text-xs text-gray-500">{folder.classification_levels.name}</p>
                  </div>
                </div>
              </div>

              {folder.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{folder.description}</p>
              )}

              <div className="flex flex-wrap gap-1 mb-3">
                {folder.folder_tags.map((ft, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full"
                  >
                    {getIcon('Tag', 10)}
                    {ft.tags.name}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
                <span className="flex items-center gap-1">
                  {getIcon('Calendar', 12)}
                  {new Date(folder.created_at).toLocaleDateString('vi-VN')}
                </span>
                <button
                  onClick={() => handleDelete(folder.id, folder.name)}
                  className="flex items-center gap-1 text-red-600 hover:text-red-800 font-medium"
                >
                  {getIcon('Trash2', 12)}
                  {t('common.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title={t('common.delete')}
        message={`${t('folders.deleteConfirm')} "${deleteDialog.name}"?`}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, id: null, name: '' })}
      />
    </section>
  );
}
