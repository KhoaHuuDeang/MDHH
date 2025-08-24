import { ssrFetchClient } from '@/utils/fetchClient';
import { AdminUsersQuery, AdminUsersResponse, DisableUserOptions } from '@/types/admin.types';

/**
 * Admin Service - Server-side (SSR)
 */
class AdminService {
  async getUsers(query: AdminUsersQuery): Promise<AdminUsersResponse> {
    const params = new URLSearchParams();
    
    if (query.page) params.append('page', query.page.toString());
    if (query.cursor) params.append('cursor', query.cursor);
    if (query.search) params.append('search', query.search);
    if (query.limit) params.append('limit', query.limit.toString());

    return ssrFetchClient.fetchJSON(`/admin/users?${params.toString()}`);
  }

  async disableUser(userId: string, options: DisableUserOptions) {
    return ssrFetchClient.fetchJSON(`/admin/users/${userId}/disable`, {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }

  async enableUser(userId: string) {
    return ssrFetchClient.fetchJSON(`/admin/users/${userId}/enable`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }
}

export const adminService = new AdminService();