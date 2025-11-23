'use client';

import { useState, useEffect } from 'react';
import { moderationService } from '@/services/moderationService';
import { AdminCommentItem, AdminCommentsQuery } from '@/types/moderation.types';

export default function AdminCommentsPage() {
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
    const reason = prompt('Reason for deletion:');
    if (!reason) return;
    try {
      await moderationService.deleteComment(id, reason);
      fetchComments();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Comments Moderation</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search..."
          className="border p-2 mr-2"
          onChange={(e) => setQuery({ ...query, search: e.target.value, page: 1 })}
        />
        <select
          className="border p-2"
          onChange={(e) =>
            setQuery({ ...query, is_deleted: e.target.value === 'true', page: 1 })
          }
        >
          <option value="">All</option>
          <option value="false">Active</option>
          <option value="true">Deleted</option>
        </select>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">User</th>
            <th className="p-2 border">Content</th>
            <th className="p-2 border">Resource/Folder</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Created</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {comments.map((comment) => (
            <tr key={comment.id}>
              <td className="p-2 border">{comment.user?.username || 'N/A'}</td>
              <td className="p-2 border">{comment.content?.substring(0, 100) || ''}...</td>
              <td className="p-2 border">
                {comment.resource?.title || comment.folder?.name || 'N/A'}
              </td>
              <td className="p-2 border">{comment.is_deleted ? 'Deleted' : 'Active'}</td>
              <td className="p-2 border">{comment.created_at ? new Date(comment.created_at).toLocaleString() : 'N/A'}</td>
              <td className="p-2 border">
                {!comment.is_deleted && (
                  <button onClick={() => handleDelete(comment.id)} className="text-red-600">
                    Delete
                  </button>
                )}
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
