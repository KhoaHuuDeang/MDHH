import apiClient from './userService';
import { VoteType, VoteData, VoteResult, BulkVoteData } from '@/types/vote.types';

export interface FileData {
  id: string;
  title: string;
  description: string;
  category: string;
  author: string;
  createdAt: string;
  fileType: string;
  downloadCount: number;
  folderName?: string;
}

export interface FolderData {
  id: string;
  name: string;
  description: string;
  author: string;
  followCount: number;
}

export interface HomepageData {
  recentFiles: FileData[];
  popularFiles: FileData[];
  folders: FolderData[];
}

export interface SearchFilesParams {
  query?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface SearchFilesResponse {
  files: FileData[];
  total: number;
  hasMore: boolean;
}

// Homepage services
export const homepageService = {
  getHomepageData: async (): Promise<HomepageData> => {
    const response = await apiClient.get('/homepage');
    return response.data;
  },

  searchFiles: async (params: SearchFilesParams): Promise<SearchFilesResponse> => {
    const response = await apiClient.get('/files/search', { params });
    return response.data;
  },

  downloadFile: async (fileId: string): Promise<{ downloadUrl: string }> => {
    const response = await apiClient.post(`/files/${fileId}/download`);
    return response.data;
  },

  rateFile: async (fileId: string, rating: number): Promise<void> => {
    await apiClient.post(`/files/${fileId}/rate`, { value: rating });
  },

  rateFolder: async (folderId: string, rating: number): Promise<void> => {
    await apiClient.post(`/folders/${folderId}/rate`, { value: rating });
  },

  followFolder: async (folderId: string): Promise<void> => {
    await apiClient.post(`/folders/${folderId}/follow`);
  },

  unfollowFolder: async (folderId: string): Promise<void> => {
    await apiClient.delete(`/folders/${folderId}/follow`);
  },

  checkFollowStatus: async (folderId: string): Promise<{ isFollowing: boolean }> => {
    const response = await apiClient.get(`/folders/${folderId}/follow/status`);
    return response.data;
  },

  // File tracking and bookmarking
  trackFileView: async (fileId: string): Promise<void> => {
    await apiClient.post(`/files/${fileId}/view`);
  },

  bookmarkFile: async (fileId: string): Promise<void> => {
    await apiClient.post(`/files/${fileId}/bookmark`);
  },

  unbookmarkFile: async (fileId: string): Promise<void> => {
    await apiClient.delete(`/files/${fileId}/bookmark`);
  },

  // Vote system functions
  voteFile: async (fileId: string, voteType: VoteType): Promise<VoteResult> => {
    console.log(`Voting on file ${fileId} with type ${voteType}`);
    const response = await apiClient.post(`/votes/resources/${fileId}`, { voteType });
    return response.data;
  },

  getFileVotes: async (fileId: string): Promise<VoteData> => {
    const response = await apiClient.get(`/votes/resources/${fileId}`);
    return response.data;
  },

  getBulkFileVotes: async (fileIds: string[], includeUserVote: boolean = false): Promise<BulkVoteData> => {
    const params = {
      resourceIds: fileIds.join(','),
      ...(includeUserVote && { includeUserVote: 'true' })
    };
    const response = await apiClient.get('/votes/resources/bulk', { params });
    return response.data;
  },

  voteFolder: async (folderId: string, voteType: VoteType): Promise<VoteResult> => {
    const response = await apiClient.post(`/votes/folders/${folderId}`, { voteType });
    return response.data;
  },

  getFolderVotes: async (folderId: string, includeUserVote: boolean = false): Promise<VoteData> => {
    const params = includeUserVote ? { includeUserVote: 'true' } : {};
    const response = await apiClient.get(`/votes/folders/${folderId}`, { params });
    return response.data;
  }
};

export default homepageService;