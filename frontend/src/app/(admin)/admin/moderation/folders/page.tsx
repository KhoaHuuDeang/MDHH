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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Folders Moderation</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search..."
          className="border p-2 mr-2"
          onChange={(e) => setQuery({ ...query, search: e.target.value, page: 1 })}
        />
        <select
          className="border p-2"
          onChange={(e) => setQuery({ ...query, visibility: e.target.value as any, page: 1 })}
        >
          <option value="">All Visibility</option>
          <option value="PUBLIC">Public</option>
          <option value="PRIVATE">Private</option>
        </select>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">User</th>
            <th className="p-2 border">Visibility</th>
            <th className="p-2 border">Files</th>
            <th className="p-2 border">Followers</th>
            <th className="p-2 border">Created</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {folders.map((folder) => (
            <tr key={folder.id}>
              <td className="p-2 border">{folder.name || 'N/A'}</td>
              <td className="p-2 border">{folder.user?.username || 'N/A'}</td>
              <td className="p-2 border">{folder.visibility || 'N/A'}</td>
              <td className="p-2 border">{folder._count?.folder_files || 0}</td>
              <td className="p-2 border">{folder._count?.follows || 0}</td>
              <td className="p-2 border">{folder.created_at ? new Date(folder.created_at).toLocaleString() : 'N/A'}</td>
              <td className="p-2 border">
                <button onClick={() => handleDelete(folder.id)} className="text-red-600">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4">
        <button
          disabled={query.page === 1}
          onClick={() => setQuery({ ...query, page: (query.page || 1) - 1 })}
          className="border p-2 mr-2"
        >
          Previous
        </button>
        <span>Page {query.page} of {totalPages}</span>
        <button
          disabled={query.page === totalPages}
          onClick={() => setQuery({ ...query, page: (query.page || 1) + 1 })}
          className="border p-2 ml-2"
        >
          Next
        </button>
      </div>
    </div>
  );
}
