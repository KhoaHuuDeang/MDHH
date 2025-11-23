import {
  AdminUploadsQuery,
  AdminUploadsResponse,
  AdminCommentsQuery,
  AdminCommentsResponse,
  AdminFoldersQuery,
  AdminFoldersResponse,
} from '@/types/moderation.types';

class ModerationService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });
  }

  // ========== UPLOADS ==========
  async getUploads(query: AdminUploadsQuery): Promise<AdminUploadsResponse> {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.status) params.append('status', query.status);
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    const response = await this.fetchWithAuth(
      `${this.baseUrl}/admin/moderation/uploads?${params}`
    );
    if (!response.ok) throw new Error('Failed to fetch uploads');
    return response.json();
  }

  async deleteUpload(uploadId: string, reason?: string): Promise<{ message: string }> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/admin/moderation/uploads/${uploadId}`,
      {
        method: 'DELETE',
        body: JSON.stringify({ uploadId, reason }),
      }
    );
    if (!response.ok) throw new Error('Failed to delete upload');
    return response.json();
  }

  async flagUpload(uploadId: string, reason: string): Promise<{ message: string }> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/admin/moderation/uploads/${uploadId}/flag`,
      {
        method: 'POST',
        body: JSON.stringify({ uploadId, reason }),
      }
    );
    if (!response.ok) throw new Error('Failed to flag upload');
    return response.json();
  }

  // ========== COMMENTS ==========
  async getComments(query: AdminCommentsQuery): Promise<AdminCommentsResponse> {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.is_deleted !== undefined) params.append('is_deleted', query.is_deleted.toString());
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    const response = await this.fetchWithAuth(
      `${this.baseUrl}/admin/moderation/comments?${params}`
    );
    if (!response.ok) throw new Error('Failed to fetch comments');
    return response.json();
  }

  async deleteComment(commentId: string, reason?: string): Promise<{ message: string }> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/admin/moderation/comments/${commentId}`,
      {
        method: 'DELETE',
        body: JSON.stringify({ commentId, reason }),
      }
    );
    if (!response.ok) throw new Error('Failed to delete comment');
    return response.json();
  }

  // ========== FOLDERS ==========
  async getFolders(query: AdminFoldersQuery): Promise<AdminFoldersResponse> {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.visibility) params.append('visibility', query.visibility);
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    const response = await this.fetchWithAuth(
      `${this.baseUrl}/admin/moderation/folders?${params}`
    );
    if (!response.ok) throw new Error('Failed to fetch folders');
    return response.json();
  }

  async deleteFolder(folderId: string, reason?: string): Promise<{ message: string }> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/admin/moderation/folders/${folderId}`,
      {
        method: 'DELETE',
        body: JSON.stringify({ folderId, reason }),
      }
    );
    if (!response.ok) throw new Error('Failed to delete folder');
    return response.json();
  }
}

export const moderationService = new ModerationService();
