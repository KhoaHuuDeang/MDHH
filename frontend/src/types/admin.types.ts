export interface AdminUserItem {
  id: string;
  username: string;
  displayname: string;
  email: string;
  role_name: string;
  created_at: Date;
  is_disabled: boolean;
  disabled_until?: Date;
  disabled_reason?: string;
  disabled_by?: string;
  disabled_at?: Date;
  providers: string[];
}

export interface PaginationState {
  hasNext: boolean;
  hasPrevious: boolean;
  nextCursor?: string;
  prevCursor?: string;
  currentPage?: number;
  totalPages?: number;
  total?: number;
}

export interface AdminUsersResponse {
  users: AdminUserItem[];
  pagination: PaginationState;
  meta: {
    paginationType: 'offset' | 'cursor';
    searchActive: boolean;
  };
}

export interface AdminUsersQuery {
  page?: number;
  cursor?: string;
  search?: string;
  limit?: number;
}

export interface DisableUserOptions {
  disabled_until?: string;
  disabled_reason: string;
}

export interface AdminUsersState {
  users: AdminUserItem[];
  pagination: PaginationState;
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  currentCursor: string | null;
  paginationType: 'offset' | 'cursor';
}

export interface FetchParams {
  page?: number;
  cursor?: string;
}