import { useState, useCallback, useDeferredValue, useEffect, useOptimistic, useTransition } from 'react';
import { adminService } from '@/services/adminService.csr';
import useNotifications from '@/hooks/useNotifications';
import {
  AdminUserItem,
  AdminUsersState,
  PaginationState,
  DisableUserOptions,
  FetchParams
} from '@/types/admin.types';

const initialPagination: PaginationState = {
  hasNext: false,
  hasPrevious: false,
  currentPage: 1
};

interface UseAdminUsersReturn {
  users: AdminUserItem[];
  pagination: PaginationState;
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  goToPage: (page: number) => void;
  goNext: () => void;
  goPrevious: () => void;
  disableUser: (userId: string, options: DisableUserOptions) => Promise<void>;
  enableUser: (userId: string) => Promise<void>;
  refresh: () => void;
  performSearch: () => void;
}

type UserOptimisticAction = 
  | { type: 'DISABLE_USER', userId: string, options: DisableUserOptions }
  | { type: 'ENABLE_USER', userId: string };

export const useAdminUsers = (): UseAdminUsersReturn => {
  const [state, setState] = useState<AdminUsersState>({
    users: [],
    pagination: initialPagination,
    isLoading: false,
    error: null,
    searchTerm: '',
    currentCursor: null,
    paginationType: 'offset', 
  });

  const toast = useNotifications();
  const deferredSearch = useDeferredValue(state.searchTerm);

  // Optimistic updates for user actions
  const [optimisticUsers, updateOptimisticUsers] = useOptimistic(
    state.users,
    (currentUsers: AdminUserItem[], action: UserOptimisticAction) => {
      switch (action.type) {
        case 'DISABLE_USER':
          return currentUsers.map(user =>
            user.id === action.userId
              ? {
                  ...user,
                  is_disabled: true,
                  disabled_reason: action.options.disabled_reason,
                  disabled_until: action.options.disabled_until ? new Date(action.options.disabled_until) : undefined,
                  disabled_at: new Date()
                }
              : user
          );
        case 'ENABLE_USER':
          return currentUsers.map(user =>
            user.id === action.userId
              ? {
                  ...user,
                  is_disabled: false,
                  disabled_reason: undefined,
                  disabled_until: undefined,
                  disabled_by: undefined,
                  disabled_at: undefined
                }
              : user
          );
        default:
          return currentUsers;
      }
    }
  );

  const [isPending, startTransition] = useTransition();

  const fetchUsers = useCallback(async (params: FetchParams, searchTerm?: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await adminService.getUsers({
        page: params.page,
        cursor: params.cursor,
        search: searchTerm || undefined,
        limit: 10
      });
      
      setState(prev => ({
        ...prev,
        users: response.users,
        pagination: {
          ...response.pagination,
          currentPage: response.pagination.currentPage || prev.pagination.currentPage
        },
        paginationType: response.meta.paginationType,
        currentCursor: params.cursor || null,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch users',
        isLoading: false
      }));
    }
  }, []);

  // Initial load - only run once on mount
  useEffect(() => {
    fetchUsers({ page: 1 }, ''); // Load initial data without search
  }, [fetchUsers]);

  // Auto-fetch when deferred search changes
  const performSearch = useCallback(() => {
    fetchUsers({ page: 1 }, deferredSearch);
  }, [fetchUsers, deferredSearch]);

  // Navigation logic handling hybrid pagination
  const goToPage = useCallback((page: number) => {
    if (page <= 20) {
      fetchUsers({ page }, deferredSearch);
    } else {
      // Convert to cursor pagination
      fetchUsers({ cursor: state.pagination.nextCursor }, deferredSearch);
    }
  }, [fetchUsers, state.pagination.nextCursor, deferredSearch]);

  const goNext = useCallback(() => {
    if (state.paginationType === 'offset' && state.pagination.currentPage) {
      if (state.pagination.currentPage < 20 && state.pagination.hasNext) {
        goToPage(state.pagination.currentPage + 1);
      } else if (state.pagination.nextCursor) {
        fetchUsers({ cursor: state.pagination.nextCursor }, deferredSearch);
      }
    } else if (state.pagination.nextCursor) {
      fetchUsers({ cursor: state.pagination.nextCursor }, deferredSearch);
    }
  }, [state.paginationType, state.pagination, fetchUsers, goToPage, deferredSearch]);

  const goPrevious = useCallback(() => {
    if (state.paginationType === 'offset' && state.pagination.currentPage) {
      if (state.pagination.currentPage > 1) {
        goToPage(state.pagination.currentPage - 1);
      }
    } else if (state.pagination.prevCursor) {
      fetchUsers({ cursor: state.pagination.prevCursor }, deferredSearch);
    }
  }, [state.paginationType, state.pagination, fetchUsers, goToPage, deferredSearch]);

  const disableUser = useCallback(async (userId: string, options: DisableUserOptions) => {
    // Optimistic update
    startTransition(() => {
      updateOptimisticUsers({ type: 'DISABLE_USER', userId, options });
    });

    try {
      await adminService.disableUser(userId, options);
      
      // Update actual state on success
      setState(prev => ({
        ...prev,
        users: prev.users.map(user =>
          user.id === userId
            ? {
                ...user,
                is_disabled: true,
                disabled_reason: options.disabled_reason,
                disabled_until: options.disabled_until ? new Date(options.disabled_until) : undefined,
                disabled_at: new Date()
              }
            : user
        )
      }));
      
      toast.success('User disabled successfully');
    } catch (error) {
      // Revert optimistic update by refreshing data
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Failed to disable user' }));
      toast.error('Failed to disable user');
      throw error;
    }
  }, [toast, startTransition, updateOptimisticUsers]);

  const enableUser = useCallback(async (userId: string) => {
    // Optimistic update
    startTransition(() => {
      updateOptimisticUsers({ type: 'ENABLE_USER', userId });
    });

    try {
      await adminService.enableUser(userId);
      
      // Update actual state on success
      setState(prev => ({
        ...prev,
        users: prev.users.map(user =>
          user.id === userId
            ? {
                ...user,
                is_disabled: false,
                disabled_reason: undefined,
                disabled_until: undefined,
                disabled_by: undefined,
                disabled_at: undefined
              }
            : user
        )
      }));
      
      toast.success('User enabled successfully');
    } catch (error) {
      // Revert optimistic update by refreshing data
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Failed to enable user' }));
      toast.error('Failed to enable user');
      throw error;
    }
  }, [toast, startTransition, updateOptimisticUsers]);

  const setSearchTerm = useCallback((term: string) => {
    setState(prev => ({ ...prev, searchTerm: term }));
  }, []);

  const refresh = useCallback(() => {
    if (state.paginationType === 'offset' && state.pagination.currentPage) {
      fetchUsers({ page: state.pagination.currentPage }, deferredSearch);
    } else {
      fetchUsers({ cursor: state.currentCursor || undefined }, deferredSearch);
    }
  }, [fetchUsers, state.paginationType, state.pagination.currentPage, state.currentCursor, deferredSearch]);

  return {
    users: optimisticUsers, // Use optimistic users instead of state.users
    pagination: state.pagination,
    isLoading: state.isLoading || isPending, // Include transition pending state
    error: state.error,
    searchTerm: state.searchTerm,
    setSearchTerm,
    goToPage,
    goNext,
    goPrevious,
    disableUser,
    enableUser,
    refresh,
    performSearch
  };
};