import apiClient from './userService';
import { ClassificationLevel, TagsByLevel } from '@/types/classification.types';

export const classificationService = {
  /**
   * Get all classification levels with their associated tags
   * @returns Promise<ClassificationLevel[]>
   */
  getClassificationLevels: async (): Promise<ClassificationLevel[]> => {
    const response = await apiClient.get('/classification-levels');
    return response.data;
  },

  /**
   * Get tags by specific classification level ID
   * @param levelId - The classification level ID
   * @returns Promise<TagsByLevel[]>
   */
  getTagsByLevel: async (levelId: string): Promise<TagsByLevel[]> => {
    const response = await apiClient.get(`/tags/by-level/${levelId}`);
    return response.data;
  },

  /**
   * Get all tags (across all classification levels)
   * @returns Promise<TagsByLevel[]>
   */
  getAllTags: async (): Promise<TagsByLevel[]> => {
    const response = await apiClient.get('/tags');
    return response.data;
  }
};

export default classificationService;