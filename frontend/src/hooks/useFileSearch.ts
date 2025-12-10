import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import useSWR from 'swr';
import { homepageService, type SearchFilesParams, type SearchFilesResponse } from '@/services/homepageService';

export interface SearchFilters {
  category?: string;
  fileType?: string;
  sortBy?: 'relevance' | 'date' | 'downloads' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  author: string;
  createdAt: string;
  fileType: string;
  downloadCount: number;
  relevanceScore?: number;
}

interface UseFileSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  results: SearchResult[];
  totalCount: number;
  hasMore: boolean;
  isLoading: boolean;
  error: any;
  isSearching: boolean;
  clearSearch: () => void;
  loadMore: () => void;
}

// Search fetcher function using homepageService
const searchFetcher = async (params: SearchFilesParams): Promise<SearchFilesResponse> => {
  return await homepageService.searchFiles(params);
};

/**
 * Custom hook for file search with debouncing and advanced filtering
 * Provides real-time search with performance optimizations
 */
export const useFileSearch = (initialQuery: string = '', initialFilters: SearchFilters = {}): UseFileSearchReturn => {
  const [query, setQuery] = useState<string>(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [page, setPage] = useState<number>(1);
  
  // Debounce search query to avoid excessive API calls
  const [debouncedQuery] = useDebounce(query, 300);
  
  // Build search parameters
  const searchParams = useMemo((): SearchFilesParams | null => {
    if (!debouncedQuery.trim()) {
      return null; // Don't search if query is empty
    }

    return {
      query: debouncedQuery.trim(),
      classificationLevelId: filters.category,
      page: page,
      limit: 20
    };
  }, [debouncedQuery, filters, page]);

  // SWR for search results
  const { data, error, isLoading, mutate } = useSWR<SearchFilesResponse>(
    searchParams,
    searchFetcher,
    {
      // Don't cache search results for too long
      dedupingInterval: 1000,
      
      // Keep previous data while searching
      keepPreviousData: true,
      
      // Don't automatically revalidate search results
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0,
      
      // Error handling
      errorRetryCount: 2,
      errorRetryInterval: 1000,
      
      // Don't retry on client errors
      shouldRetryOnError: (error) => {
        return !(error?.status >= 400 && error?.status < 500);
      },
      
      // Conditional fetching - only if we have a search URL
      revalidateIfStale: false,
      
      // Handle successful search
      onSuccess: (data) => {
        console.log(`Search completed: ${data.result.files.length} results for "${debouncedQuery}"`);
      },
      
      // Handle search errors
      onError: (error) => {
        console.error('Search failed:', error);
      }
    }
  );

  // Determine if we're actively searching
  const isSearching = useMemo(() => {
    return isLoading && !!debouncedQuery.trim();
  }, [isLoading, debouncedQuery]);

  // Clear search function
  const clearSearch = useCallback(() => {
    setQuery('');
    setPage(1);
  }, []);

  // Load more results (pagination)
  const loadMore = useCallback(() => {
    if (data?.result.hasMore && !isLoading) {
      setPage(prev => prev + 1);
    }
  }, [data?.result.hasMore, isLoading]);

  // Reset page when query or filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, filters]);

  // Update filters with callback
  const updateFilters = useCallback((newFilters: SearchFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Memoize results to prevent unnecessary re-renders
  const results = useMemo(() => {
    if (page === 1) {
      return data?.result.files || [];
    }

    // For pagination, we need to accumulate results
    // This is a simplified version - in real app, you'd want to manage this differently
    return data?.result.files || [];
  }, [data?.result.files, page]);

  return {
    query,
    setQuery,
    filters,
    setFilters: updateFilters,
    results,
    totalCount: data?.result.total || 0,
    hasMore: data?.result.hasMore || false,
    isLoading,
    error,
    isSearching,
    clearSearch,
    loadMore
  };
};

/**
 * Hook for getting search suggestions/autocomplete
 */

export const useSearchSuggestions = (query: string) => {
  const [debouncedQuery] = useDebounce(query, 200);
  
  const suggestionsUrl = useMemo(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
      return null;
    }
    
    return `${process.env.NEXT_PUBLIC_API_URL}/files/suggestions?q=${encodeURIComponent(debouncedQuery.trim())}`;
  }, [debouncedQuery]);

  // Create a separate fetcher for suggestions
  const suggestionsFetcher = async (url: string): Promise<string[]> => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch suggestions');
    }
    return response.json();
  };

  const { data: suggestions, isLoading: isLoadingSuggestions } = useSWR<string[]>(
    suggestionsUrl,
    suggestionsFetcher,
    {
      dedupingInterval: 500,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0,
      errorRetryCount: 1,
      fallbackData: []
    }
  );

  return {
    suggestions: suggestions || [],
    isLoadingSuggestions
  };
};

export default useFileSearch;