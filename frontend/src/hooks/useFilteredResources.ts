import { useState, useEffect, useCallback, useMemo } from 'react';
import { uploadService } from '@/services/uploadService';
import { transformResourcesResponse } from '@/utils/resourceMappers';
import { ResourceListItem } from '@/types/uploads.types';
import useNotifications from '@/hooks/useNotifications';

type FilterStatus = 'all' | 'approved' | 'pending' | 'rejected';

interface UseFilteredResourcesParams {
  userId?: string;
  accessToken?: string;
  enabled?: boolean;
}

interface UseFilteredResourcesReturn {
  // Data state
  resources: ResourceListItem[];
  isLoading: boolean;
  error: string | null;
  
  // Filter state
  activeTab: FilterStatus;
  searchTerm: string;
  
  // Pagination state
  currentPage: number;
  totalPages: number;
  total: number;
  
  // Tab counts (for displaying counts in UI)
  tabCounts: {
    all: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  
  // Actions
  setActiveTab: (tab: FilterStatus) => void;
  setSearchTerm: (search: string) => void;
  setCurrentPage: (page: number) => void;
  refetch: () => void;
}
const ITEMS_PER_PAGE = 10;
const SEARCH_DEBOUNCE_MS = 500;

export const useFilteredResources = ({
  userId,
  accessToken,
  enabled = true
}: UseFilteredResourcesParams): UseFilteredResourcesReturn => {
  const toast = useNotifications();
  
  // Data state
  const [resources, setResources] = useState<ResourceListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [activeTab, setActiveTab] = useState<FilterStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Tab counts for display
  const [tabCounts, setTabCounts] = useState({
    all: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, debouncedSearchTerm]);

  // Memoized fetch function
  const fetchResources = useCallback(async () => {
    if (!enabled || !userId || !accessToken) {
      return;
    }

    try {
      // Set auth token before making API calls to avoid race condition
      setIsLoading(true);
      setError(null);
      const response = await uploadService.getUserResources(
        currentPage,
        ITEMS_PER_PAGE,
        activeTab === 'all' ? undefined : activeTab,
        debouncedSearchTerm.trim() || undefined
      );
      
      const transformedResources = transformResourcesResponse(response);
      setResources(transformedResources);
      setTotalPages(response.pagination.totalPages);
      setTotal(response.pagination.total);
      
    } catch (err: any) {
      console.error('Failed to fetch resources:', err);
      const errorMessage = err.message || 'Không thể tải dữ liệu tài liệu';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [
    enabled, 
    userId, 
    accessToken, 
    currentPage, 
    activeTab, 
    debouncedSearchTerm, 
    toast
  ]);

  // Fetch tab counts separately (for displaying accurate counts)
  const fetchTabCounts = useCallback(async () => {
    if (!enabled || !userId || !accessToken || debouncedSearchTerm) {
      // Don't fetch counts when searching, as it would be expensive
      return;
    }

    try {
      // Set auth token before making API calls to avoid race condition
      // Fetch counts for all tabs in parallel
      const [allResponse, approvedResponse, pendingResponse, rejectedResponse] = await Promise.all([
        uploadService.getUserResources(1, 1, undefined, undefined),
        uploadService.getUserResources(1, 1, 'approved', undefined),
        uploadService.getUserResources(1, 1, 'pending', undefined),
        uploadService.getUserResources(1, 1, 'rejected', undefined)
      ]);

      setTabCounts({
        all: allResponse.pagination.total,
        approved: approvedResponse.pagination.total,
        pending: pendingResponse.pagination.total,
        rejected: rejectedResponse.pagination.total
      });
    } catch (err) {
      console.error('Failed to fetch tab counts:', err);
      // Don't show error for tab counts, it's not critical
    }
  }, [enabled, userId, accessToken, debouncedSearchTerm]);

  // Fetch resources when dependencies change
  useEffect(() => {
    if (enabled && userId && accessToken) {
      fetchResources();
    }
  }, [fetchResources]);

  // Fetch tab counts when filters change (but not when searching)
  useEffect(() => {
    if (enabled && userId && accessToken && !debouncedSearchTerm) {
      fetchTabCounts();
    }
  }, [fetchTabCounts]);

  // Memoized action handlers
  const handleTabChange = useCallback((tab: FilterStatus) => {
    setActiveTab(tab);
  }, []);

  const handleSearchChange = useCallback((search: string) => {
    setSearchTerm(search);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const refetch = useCallback(() => {
    fetchResources();
    if (!debouncedSearchTerm) {
      fetchTabCounts();
    }
  }, [fetchResources, fetchTabCounts, debouncedSearchTerm]);

  return {
    // Data state
    resources,
    isLoading,
    error,
    
    // Filter state
    activeTab,
    searchTerm,
    
    // Pagination state
    currentPage,
    totalPages,
    total,
    
    // Tab counts
    tabCounts,
    
    // Actions
    setActiveTab: handleTabChange,
    setSearchTerm: handleSearchChange,
    setCurrentPage: handlePageChange,
    refetch
  };
};