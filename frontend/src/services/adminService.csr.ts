import { csrAxiosClient } from '@/utils/axiosClient';
import { AdminUsersQuery, AdminUsersResponse, DisableUserOptions } from '@/types/admin.types';

/**
 * Admin Service - Client-side (CSR)
 * Uses axios client for CSR operations
 */
class AdminService {

  async getUsers(query: AdminUsersQuery): Promise<AdminUsersResponse> {
    const params = new URLSearchParams();
    
    if (query.page) params.append('page', query.page.toString());
    if (query.cursor) params.append('cursor', query.cursor);
    if (query.search) params.append('search', query.search);
    if (query.limit) params.append('limit', query.limit.toString());

    const response = await csrAxiosClient.get<AdminUsersResponse>(`/admin/users?${params.toString()}`);
    return response.data;
  }

  async disableUser(userId: string, options: DisableUserOptions) {
    const response = await csrAxiosClient.post(`/admin/users/${userId}/disable`, options);
    return response.data;
  }

  async enableUser(userId: string) {
    const response = await csrAxiosClient.post(`/admin/users/${userId}/enable`, {});
    return response.data;
  }
}

export const adminService = new AdminService();