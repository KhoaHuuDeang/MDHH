import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { homepageService, type HomepageData, type FileData, type FolderData } from '@/services/homepageService';

interface UseHomepageDataReturn {
  data: HomepageData | undefined;
  isLoading: boolean;
  error: any;
  mutate: () => void;
}

// Fetcher function for SWR using homepageService
const fetcher = async (): Promise<HomepageData> => {
  return await homepageService.getHomepageData();
};

/**
 * Custom hook for fetching homepage data with SWR
 * Provides caching, automatic revalidation, and optimistic updates
 * Fetches for all users - homepage endpoint is public
 */
export const useHomepageData = (): UseHomepageDataReturn => {
  const { data: session, status } = useSession();
  // Always fetch homepage data - backend endpoint is public
  const swrKey = 'homepage-data';

  const { data, error, mutate, isLoading } = useSWR<HomepageData>(
    swrKey, // null = no fetch
    fetcher,
    {
      // Less aggressive revalidation since homepage data changes infrequently
      
      // Only revalidate on focus occasionally
      revalidateOnFocus: false,
      
      // Revalidate when reconnecting to network
      revalidateOnReconnect: true,
      
      // Refresh every 30 minutes (homepage data changes slowly)
      refreshInterval: 1800000, // 30 minutes
      
      // Keep previous data while revalidating
      keepPreviousData: true,
      
      // Dedupe requests within 10 seconds
      dedupingInterval: 10000,
      
      // Conservative retry on error
      errorRetryCount: 2,
      errorRetryInterval: 3000,
      
      // Fallback data structure
      fallbackData: {
        recentFiles: [],
        popularFiles: [],
        folders: []
      },
      
      // Conditional fetching - don't retry on client errors
      shouldRetryOnError: (error) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          console.warn(`Homepage data fetch returned ${error.status}, not retrying`);
          return false;
        }
        return true;
      },

      // Transform data if needed
      onSuccess: (data) => {
        console.log('Homepage data loaded successfully:', {
          recentFiles: data.recentFiles?.length || 0,
          popularFiles: data.popularFiles?.length || 0,
          folders: data.folders?.length || 0
        });
      },

      // Handle errors
      onError: (error) => {
        console.error('Error fetching homepage data:', error);
      }
    }
  );

  return {
    data,
    isLoading,
    error,
    mutate
  };
};

export default useHomepageData;