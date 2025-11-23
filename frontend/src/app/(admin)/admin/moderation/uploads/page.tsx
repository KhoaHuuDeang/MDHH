'use client';

import { useState, useEffect } from 'react';
import { moderationService } from '@/services/moderationService';
import { AdminUploadItem, AdminUploadsQuery } from '@/types/moderation.types';

export default function AdminUploadsPage() {
  const [uploads, setUploads] = useState<AdminUploadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState<AdminUploadsQuery>({ page: 1, limit: 20 });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

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
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this upload?')) return;
    try {
      await moderationService.deleteUpload(id);
      fetchUploads();
    } catch (error) {
      console.error('Failed to delete upload:', error);
    }
  };

  const handleFlag = async (id: string) => {
    const reason = prompt('Reason for flagging:');
    if (!reason) return;
    try {
      await moderationService.flagUpload(id, reason);
      fetchUploads();
    } catch (error) {
      console.error('Failed to flag upload:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Uploads Moderation</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search..."
          className="border p-2 mr-2"
          onChange={(e) => setQuery({ ...query, search: e.target.value, page: 1 })}
        />
        <select
          className="border p-2"
          onChange={(e) => setQuery({ ...query, status: e.target.value as any, page: 1 })}
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">File Name</th>
            <th className="p-2 border">User</th>
            <th className="p-2 border">Size</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Created</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {uploads.map((upload) => (
            <tr key={upload.id}>
              <td className="p-2 border">{upload.file_name || 'N/A'}</td>
              <td className="p-2 border">{upload.user?.username || 'N/A'}</td>
              <td className="p-2 border">{upload.file_size ? (upload.file_size / 1024).toFixed(2) : 'N/A'} KB</td>
              <td className="p-2 border">{upload.status || 'N/A'}</td>
              <td className="p-2 border">{upload.created_at ? new Date(upload.created_at).toLocaleString() : 'N/A'}</td>
              <td className="p-2 border">
                <button onClick={() => handleFlag(upload.id)} className="text-yellow-600 mr-2">
                  Flag
                </button>
                <button onClick={() => handleDelete(upload.id)} className="text-red-600">
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
