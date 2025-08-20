import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { homepageService } from '@/services/homepageService';
import { setAuthToken } from '@/services/userService';
import useNotifications from './useNotifications';
import { VoteType, VoteData } from '@/types/vote.types';

export interface FileActionResult {
  success: boolean;
  message?: string;
  data?: any;
}

export interface UseFileActionsReturn {
  downloadFile: (fileId: string, fileName?: string) => Promise<FileActionResult>;
  // Vote functions replace rating
  voteFile: (fileId: string, voteType: VoteType) => Promise<FileActionResult>;
  getFileVotes: (fileId: string) => Promise<VoteData>;
  // Legacy rating function (kept for backward compatibility)
  rateFile: (fileId: string, rating: number) => Promise<FileActionResult>;
  bookmarkFile: (fileId: string) => Promise<FileActionResult>;
  unbookmarkFile: (fileId: string) => Promise<FileActionResult>;
  viewFile: (fileId: string) => Promise<FileActionResult>;
  followFolder: (folderId: string) => Promise<FileActionResult>;
  unfollowFolder: (folderId: string) => Promise<FileActionResult>;
  
  // Loading states
  isDownloading: boolean;
  isVoting: boolean;
  isRating: boolean; // Keep for backward compatibility
  isBookmarking: boolean;
  isViewing: boolean;
  isFollowing: boolean;
}

/**
 * Custom hook for file and folder actions
 * Handles download, rating, bookmarking, viewing, and following functionality
 */
export const useFileActions = (): UseFileActionsReturn => {
  const { data: session, status } = useSession();
  const toast = useNotifications();
  
  // Loading states
  const [isDownloading, setIsDownloading] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [isRating, setIsRating] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Use useSession for authentication check and token setup
  useEffect(() => {
    if (session?.accessToken) {
      setAuthToken(session.accessToken);
    } else if (status === "unauthenticated") {
      setAuthToken(null);
    }
  }, [session?.accessToken, status]);

  // Download file action
  const downloadFile = useCallback(async (fileId: string, fileName?: string): Promise<FileActionResult> => {
    if (!session) {
      toast.error('Vui lòng đăng nhập để tải file');
      return { success: false, message: 'Not authenticated' };
    }

    setIsDownloading(true);
    
    try {
      // First, get the download URL
      const downloadData = await homepageService.downloadFile(fileId);
      
      if (downloadData.downloadUrl) {
        // Create a temporary anchor element to trigger download
        const link = document.createElement('a');
        link.href = downloadData.downloadUrl;
        link.download = fileName || 'download';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('Tải file thành công');
        return { success: true, data: downloadData };
      } else {
        throw new Error('Download URL not provided');
      }
    } catch (error: any) {
      const message = error.message || 'Không thể tải file';
      toast.error(message);
      return { success: false, message };
    } finally {
      setIsDownloading(false);
    }
  }, [session, toast]);

  // Vote file action
  const voteFile = useCallback(async (fileId: string, voteType: VoteType): Promise<FileActionResult> => {
    if (!session) {
      toast.error('Vui lòng đăng nhập để vote');
      return { success: false, message: 'Not authenticated' };
    }

    setIsVoting(true);
    
    try {
      console.log('🚀 Starting vote request for file:', fileId, 'with type:', voteType);
      const result = await homepageService.voteFile(fileId, voteType);
      console.log('✅ Vote API response:', result);
      
      if (result.success) {
        const voteMessage = voteType === 'up' ? 'Đã upvote!' : 'Đã downvote!';
        toast.success(result.message || voteMessage);
        return { success: true, data: result.voteData };
      } else {
        console.error('❌ Vote failed - result not successful:', result);
        throw new Error(result.message || 'Vote failed');
      }
    } catch (error: any) {
      console.error('❌ Vote error caught:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      const message = error.response?.data?.message || error.message || 'Không thể vote';
      toast.error(message);
      return { success: false, message };
    } finally {
      setIsVoting(false);
    }
  }, [session, toast]);

  // Get file votes
  const getFileVotes = useCallback(async (fileId: string): Promise<VoteData> => {
    return await homepageService.getFileVotes(fileId);
  }, []);

  // Rate file action (legacy - kept for backward compatibility)
  const rateFile = useCallback(async (fileId: string, rating: number): Promise<FileActionResult> => {
    if (!session) {
      toast.error('Vui lòng đăng nhập để đánh giá');
      return { success: false, message: 'Not authenticated' };
    }

    if (rating < 1 || rating > 5) {
      toast.error('Đánh giá phải từ 1 đến 5 sao');
      return { success: false, message: 'Invalid rating value' };
    }

    setIsRating(true);
    
    try {
      await homepageService.rateFile(fileId, rating);
      toast.success('Đánh giá thành công');
      return { success: true };
    } catch (error: any) {
      const message = error.message || 'Không thể đánh giá file';
      toast.error(message);
      return { success: false, message };
    } finally {
      setIsRating(false);
    }
  }, [session, toast]);

  // Bookmark file action
  const bookmarkFile = useCallback(async (fileId: string): Promise<FileActionResult> => {
    if (!session) {
      toast.error('Vui lòng đăng nhập để lưu file');
      return { success: false, message: 'Not authenticated' };
    }

    setIsBookmarking(true);
    
    try {
      await homepageService.bookmarkFile(fileId);
      toast.success('Đã lưu file');
      return { success: true };
    } catch (error: any) {
      const message = error.message || 'Không thể lưu file';
      toast.error(message);
      return { success: false, message };
    } finally {
      setIsBookmarking(false);
    }
  }, [session, toast]);

  // Unbookmark file action
  const unbookmarkFile = useCallback(async (fileId: string): Promise<FileActionResult> => {
    if (!session) {
      return { success: false, message: 'Not authenticated' };
    }

    setIsBookmarking(true);
    
    try {
      await homepageService.unbookmarkFile(fileId);
      toast.success('Đã bỏ lưu file');
      return { success: true };
    } catch (error: any) {
      const message = error.message || 'Không thể bỏ lưu file';
      toast.error(message);
      return { success: false, message };
    } finally {
      setIsBookmarking(false);
    }
  }, [session, toast]);

  // View file action (track view count)
  const viewFile = useCallback(async (fileId: string): Promise<FileActionResult> => {
    setIsViewing(true);
    
    try {
      // Track view using homepageService (authentication optional)
      await homepageService.trackFileView(fileId);
      return { success: true };
    } catch (error: any) {
      // Don't show error toast for view tracking failures
      console.warn('Failed to track file view:', error);
      return { success: false, message: error.message };
    } finally {
      setIsViewing(false);
    }
  }, []);

  // Follow folder action
  const followFolder = useCallback(async (folderId: string): Promise<FileActionResult> => {
    if (!session) {
      toast.error('Vui lòng đăng nhập để theo dõi thư mục');
      return { success: false, message: 'Not authenticated' };
    }

    setIsFollowing(true);
    
    try {
      await homepageService.followFolder(folderId);
      toast.success('Đã theo dõi thư mục');
      return { success: true };
    } catch (error: any) {
      const message = error.message || 'Không thể theo dõi thư mục';
      toast.error(message);
      return { success: false, message };
    } finally {
      setIsFollowing(false);
    }
  }, [session, toast]);

  // Unfollow folder action
  const unfollowFolder = useCallback(async (folderId: string): Promise<FileActionResult> => {
    if (!session) {
      return { success: false, message: 'Not authenticated' };
    }

    setIsFollowing(true);
    
    try {
      await homepageService.unfollowFolder(folderId);
      toast.success('Đã bỏ theo dõi thư mục');
      return { success: true };
    } catch (error: any) {
      const message = error.message || 'Không thể bỏ theo dõi thư mục';
      toast.error(message);
      return { success: false, message };
    } finally {
      setIsFollowing(false);
    }
  }, [session, toast]);

  return {
    downloadFile,
    // Vote functions (new)
    voteFile,
    getFileVotes,
    // Legacy functions (keep for backward compatibility)
    rateFile,
    bookmarkFile,
    unbookmarkFile,
    viewFile,
    followFolder,
    unfollowFolder,
    
    // Loading states
    isDownloading,
    isVoting,
    isRating,
    isBookmarking,
    isViewing,
    isFollowing
  };
};

export default useFileActions;