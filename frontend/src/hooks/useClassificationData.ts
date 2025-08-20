import useSWR from 'swr';
import { classificationService } from '@/services/classificationService';
import { ClassificationLevel, TagsByLevel } from '@/types/classification.types';

/**
 * Hook to fetch all classification levels with caching
 * Cache duration: 30 minutes (data changes infrequently)
 */
export const useClassificationLevels = () => {
  const { data, error, isLoading, mutate } = useSWR<ClassificationLevel[]>(
    'classification-levels',
    classificationService.getClassificationLevels,
    {
      // Long cache since classification levels rarely change
      refreshInterval: 1800000, // 30 minutes
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 600000, // 10 minutes
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  );

  return {
    classificationLevels: data,
    isLoading,
    error,
    mutate
  };
};

/**
 * Hook to fetch tags by classification level with caching
 * Cache duration: 10 minutes (more dynamic than levels)
 */
export const useTagsByLevel = (levelId: string | null) => {
  const { data, error, isLoading, mutate } = useSWR<TagsByLevel[]>(
    levelId ? `tags-by-level-${levelId}` : null,
    levelId ? () => classificationService.getTagsByLevel(levelId) : null,
    {
      // Medium cache since tags can change more frequently
      refreshInterval: 600000, // 10 minutes
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
      errorRetryCount: 2,
      errorRetryInterval: 3000,
    }
  );

  return {
    tags: data,
    isLoading,
    error,
    mutate
  };
};

/**
 * Hook to fetch all tags across all levels
 * Useful for search functionality
 */
export const useAllTags = () => {
  const { data, error, isLoading, mutate } = useSWR<TagsByLevel[]>(
    'all-tags',
    classificationService.getAllTags,
    {
      // Medium cache
      refreshInterval: 900000, // 15 minutes
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
      errorRetryCount: 2,
      errorRetryInterval: 3000,
    }
  );

  return {
    allTags: data,
    isLoading,
    error,
    mutate
  };
};