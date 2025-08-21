import { useState, useEffect, useCallback, useMemo } from 'react';
import { uploadService } from '@/services/uploadService';
import { transformResourcesResponse, calculateResourceStats, formatStats } from '@/utils/resourceMappers';
import { ResourceListItem } from '@/types/uploads.types';
import useNotifications from '@/hooks/useNotifications';

interface UseUserResourcesParams {
  userId?: string;
  accessToken?: string;
  enabled?: boolean; // Control when hook should be active
}

interface UseUserResourcesReturn {
  // Data state
  resources: ResourceListItem[];
  isLoading: boolean;
  error: string | null;
  
  // Pagination state
  currentPage: number;
  totalPages: number;
  total: number;
  
  // Calculated stats
  stats: Array<{
    label: string;
    value: string;
    icon: string;
    color: string;
  }>;
  
  // Actions
  setCurrentPage: (page: number) => void;
  refetch: () => void;
}

const ITEMS_PER_PAGE = 10;

export const useUserResources = ({
  userId,
  accessToken,
  enabled = true
}: UseUserResourcesParams): UseUserResourcesReturn => {
  const toast = useNotifications();
  
  // Data state
  const [resources, setResources] = useState<ResourceListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Memoized fetch function to prevent recreations
  const fetchResources = useCallback(async (
    page: number,
    status?: string,
    search?: string
  ) => {
    if (!enabled || !userId || !accessToken) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await uploadService.getUserResources(
        page,
        ITEMS_PER_PAGE,
        status === 'all' ? undefined : status,
        search?.trim() || undefined
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
  }, [enabled, userId, accessToken, toast]);

  // Memoized stats calculation
  const stats = useMemo(() => {
    if (isLoading || resources.length === 0) {
      return [
        { label: 'Tài liệu', value: '0', icon: 'FileText', color: 'blue' },
        { label: 'Lượt xem', value: '0', icon: 'Eye', color: 'green' },
        { label: 'Tải xuống', value: '0', icon: 'Download', color: 'purple' },
        { label: 'Upvotes', value: '0', icon: 'ThumbsUp', color: 'yellow' }
      ];
    }
    
    const resourceStats = calculateResourceStats(resources);
    return formatStats(resourceStats);
  }, [resources, isLoading]);

  // Memoized refetch function
  const refetch = useCallback(() => {
    fetchResources(currentPage);
  }, [fetchResources, currentPage]);

  // Reset page to 1 when hook params change
  useEffect(() => {
    setCurrentPage(1);
  }, [userId, accessToken]);

  // Initial data fetch and when dependencies change
  useEffect(() => {
    if (enabled && userId && accessToken) {
      fetchResources(1);
    }
  }, [enabled, userId, accessToken, fetchResources]);

  // Page change handler
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchResources(page);
  }, [fetchResources]);

  return {
    // Data state
    resources,
    isLoading,
    error,
    
    // Pagination state
    currentPage,
    totalPages,
    total,
    
    // Calculated stats
    stats,
    
    // Actions
    setCurrentPage: handlePageChange,
    refetch
  };
};