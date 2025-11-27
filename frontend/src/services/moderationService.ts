import { csrAxiosClient } from '@/utils/axiosClient';
import {
  AdminUploadsQuery,
  AdminUploadsResponse,
  AdminCommentsQuery,
  AdminCommentsResponse,
  AdminFoldersQuery,
  AdminFoldersResponse,
} from '@/types/moderation.types';

class ModerationService {
  // ========== UPLOADS ==========
  async getUploads(query: AdminUploadsQuery): Promise<AdminUploadsResponse> {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.status) params.append('status', query.status);
    if (query.moderation_status) params.append('moderation_status', query.moderation_status);
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    const response = await csrAxiosClient.get<AdminUploadsResponse>(
      `/admin/moderation/uploads?${params}`
    );
    return response.data;
  }

  async deleteUpload(uploadId: string, reason?: string): Promise<{ message: string }> {
    const response = await csrAxiosClient.delete<{ message: string }>(
      `/admin/moderation/uploads/${uploadId}`,
      { data: { uploadId, reason } }
    );
    return response.data;
  }

  async flagUpload(uploadId: string, reason: string): Promise<{ message: string }> {
    const response = await csrAxiosClient.post<{ message: string }>(
      `/admin/moderation/uploads/${uploadId}/flag`,
      { uploadId, reason }
    );
    return response.data;
  }

  async approveUpload(uploadId: string): Promise<{ message: string; status: string; result: any }> {
    const response = await csrAxiosClient.post<{ message: string; status: string; result: any }>(
      `/admin/moderation/uploads/${uploadId}/approve`
    );
    return response.data;
  }

  async rejectUpload(uploadId: string, reason: string): Promise<{ message: string; status: string; result: any }> {
    const response = await csrAxiosClient.post<{ message: string; status: string; result: any }>(
      `/admin/moderation/uploads/${uploadId}/reject`,
      { reason }
    );
    return response.data;
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

    const response = await csrAxiosClient.get<AdminCommentsResponse>(
      `/admin/moderation/comments?${params}`
    );
    return response.data;
  }

  async deleteComment(commentId: string, reason?: string): Promise<{ message: string }> {
    const response = await csrAxiosClient.delete<{ message: string }>(
      `/admin/moderation/comments/${commentId}`,
      { data: { commentId, reason } }
    );
    return response.data;
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

    const response = await csrAxiosClient.get<AdminFoldersResponse>(
      `/admin/moderation/folders?${params}`
    );
    return response.data;
  }

  async deleteFolder(folderId: string, reason?: string): Promise<{ message: string }> {
    const response = await csrAxiosClient.delete<{ message: string }>(
      `/admin/moderation/folders/${folderId}`,
      { data: { folderId, reason } }
    );
    return response.data;
  }
}

export const moderationService = new ModerationService();
