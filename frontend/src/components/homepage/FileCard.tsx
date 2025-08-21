'use client';

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import * as lucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { getMimeTypeIcon, getFileTypeDescription } from '@/utils/mimeTypeIcons';
import { FileData } from '@/hooks/useHomepageData';
import { FileWithFolder } from '@/services/homepageService';
import useFileActions from '@/hooks/useFileActions';
import { VoteData } from '@/types/vote.types';

const getIcons = (iconName: string, size: number, className?: string) => {
  const IconComponent = lucideIcons[iconName as keyof typeof lucideIcons] as LucideIcon;
  return IconComponent ? <IconComponent className={className} size={size} /> : null;
};

interface FileCardProps {
  file: FileData | FileWithFolder;
  onView?: (fileId: string) => void;
  showThumbnail?: boolean;
  className?: string;
}

const FileCard: React.FC<FileCardProps> = React.memo(({
  file,
  onView,
  showThumbnail = true,
  className = ''
}) => {
  const { downloadFile, voteFile, getFileVotes, bookmarkFile, viewFile, isDownloading, isVoting, isBookmarking } = useFileActions();

  // Vote data state
  const [voteData, setVoteData] = useState<VoteData>({
    upvotes: 0,
    downvotes: 0,
    userVote: null
  });

  // Load vote data on mount
  useEffect(() => {
    const loadVoteData = async () => {
      try {
        const data = await getFileVotes(file.id);
        setVoteData(data);
      } catch (error) {
        console.error('Failed to load vote data:', error);
      }
    };

    loadVoteData();
  }, [file.id, getFileVotes]);

  // Memoized file icon and type description
  const { iconName, typeDescription } = useMemo(() => {
    return {
      iconName: getMimeTypeIcon(file.fileType, file.title),
      typeDescription: getFileTypeDescription(file.fileType, file.title)
    };
  }, [file.fileType, file.title]);

  // Format creation date
  const formattedDate = useMemo(() => {
    try {
      return new Date(file.createdAt).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Unknown date';
    }
  }, [file.createdAt]);

  // Handle file view
  const handleView = useCallback(async () => {
    await viewFile(file.id);
    onView?.(file.id);
  }, [file.id, viewFile, onView]);

  // Handle file download
  const handleDownload = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    await downloadFile(file.id, file.title);
  }, [file.id, file.title, downloadFile]);

  // Handle bookmark toggle
  const handleBookmark = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    await bookmarkFile(file.id);
  }, [file.id, bookmarkFile]);

  // Handle upvote with optimistic update
  const handleUpvote = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Optimistic update
    const wasUpvoted = voteData.userVote === 'up';
    const newVoteData: VoteData = {
      upvotes: wasUpvoted ? voteData.upvotes - 1 : voteData.upvotes + 1,
      downvotes: voteData.userVote === 'down' ? voteData.downvotes - 1 : voteData.downvotes,
      userVote: wasUpvoted ? null : 'up'
    };
    
    setVoteData(newVoteData);
    
    try {
      const result = await voteFile(file.id, 'up');
      if (result.success && result.data) {
        setVoteData(result.data);
      }
    } catch (error) {
      // Revert optimistic update on error
      setVoteData(voteData);
      console.error('Vote failed:', error);
    }
  }, [file.id, voteFile, voteData]);

  // Handle downvote with optimistic update
  const handleDownvote = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Optimistic update
    const wasDownvoted = voteData.userVote === 'down';
    const newVoteData: VoteData = {
      upvotes: voteData.userVote === 'up' ? voteData.upvotes - 1 : voteData.upvotes,
      downvotes: wasDownvoted ? voteData.downvotes - 1 : voteData.downvotes + 1,
      userVote: wasDownvoted ? null : 'down'
    };
    
    setVoteData(newVoteData);
    
    try {
      const result = await voteFile(file.id, 'down');
      if (result.success && result.data) {
        setVoteData(result.data);
      }
    } catch (error) {
      // Revert optimistic update on error
      setVoteData(voteData);
      console.error('Vote failed:', error);
    }
  }, [file.id, voteFile, voteData]);

  return (
    <div className={`group ${className}`}>
      <div className="bg-white border border-gray-200 hover:border-[#6A994E] hover:shadow-md transition-all duration-200 rounded-lg overflow-hidden">
        
        {/* Main clickable area */}
        <div 
          onClick={handleView}
          className="cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleView();
            }
          }}
          aria-label={`View ${file.title}`}
        >
          {/* File preview area */}
          <div className="relative bg-gray-50 h-48">
            {/* Download count badge */}
            <div className="absolute top-2.5 left-2.5 bg-[#386641] text-white px-2.5 py-0.5 text-xs font-medium rounded-full z-10">
              {file.downloadCount} downloads
            </div>

            {/* File type badge */}
            <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm text-gray-600 px-2 py-1 text-xs rounded-md z-10">
              {typeDescription}
            </div>

            {/* File preview/icon */}
            <div className="w-full h-full flex items-center justify-center">
              {showThumbnail ? (
                <div className="relative w-full h-full">
                  {/* This could be replaced with actual file thumbnails when available */}
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    {getIcons(iconName, 48, "text-gray-400")}
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  {getIcons(iconName, 48, "text-gray-400")}
                </div>
              )}
            </div>
          </div>

          {/* File info area */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-2 group-hover:text-[#386641] transition-colors leading-tight">
              {file.title}
            </h3>
            
            {file.description && (
              <p className="text-gray-500 text-xs line-clamp-2 mb-2">
                {file.description}
              </p>
            )}
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>By {file.author}</span>
                <span>{formattedDate}</span>
              </div>
              
              {file.category && (
                <div className="flex items-center text-sm text-gray-500">
                  {getIcons("Tag", 14, "mr-1")}
                  <span>{file.category}</span>
                </div>
              )}
              
              {/* Folder information */}
              {file.folderName && (
                <div className="flex items-center text-sm text-gray-500 cursor-pointer hover:text-[#386641] transition-colors duration-200 px-2 py-1 hover:bg-gray-50 rounded-md -mx-2">
                  {getIcons("Folder", 14, "mr-2")}
                  <span>From folder: <span className="text-gray-400 font-normal">{file.folderName}</span></span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions row */}
        <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100 bg-gray-50/50">
          {/* Download button */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center text-gray-600 hover:text-[#386641] text-xs font-medium transition-colors duration-200 px-3 py-2 hover:bg-[#6A994E]/10 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`Download ${file.title}`}
          >
            {isDownloading ? (
              <>
                {getIcons("Loader2", 14, "mr-1 animate-spin")}
                <span>Downloading...</span>
              </>
            ) : (
              <>
                {getIcons("Download", 14, "mr-1")}
                <span>Download</span>
              </>
            )}
          </button>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            {/* Upvote button */}
            <button
              onClick={handleUpvote}
              disabled={isVoting}
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center text-xs font-medium transition-all duration-200 px-3 py-1.5 rounded-md border focus:outline-none focus:ring-2 focus:ring-[#6A994E]/50 ${
                voteData.userVote === 'up'
                  ? 'bg-[#6A994E] text-white border-[#6A994E] shadow-sm'
                  : 'text-gray-600 border-gray-200 hover:border-[#6A994E] hover:text-[#6A994E] hover:bg-[#6A994E]/5'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={`Upvote ${file.title}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleUpvote(e);
                }
              }}
            >
              {isVoting && voteData.userVote === 'up' ? (
                getIcons("Loader2", 12, "mr-1 animate-spin")
              ) : (
                getIcons("ChevronUp", 12, "mr-1")
              )}
              <span>{voteData.upvotes}</span>
            </button>

            {/* Downvote button */}
            <button
              onClick={handleDownvote}
              disabled={isVoting}
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center text-xs font-medium transition-all duration-200 px-3 py-1.5 rounded-md border focus:outline-none focus:ring-2 focus:ring-red-300/50 ${
                voteData.userVote === 'down'
                  ? 'text-red-600 border-red-300 bg-red-50'
                  : 'text-gray-600 border-gray-200 hover:border-red-300 hover:text-red-600 hover:bg-red-50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={`Downvote ${file.title}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleDownvote(e);
                }
              }}
            >
              {isVoting && voteData.userVote === 'down' ? (
                getIcons("Loader2", 12, "mr-1 animate-spin")
              ) : (
                getIcons("ChevronDown", 12, "mr-1")
              )}
              <span>{voteData.downvotes}</span>
            </button>

            {/* Bookmark button */}
            <button
              onClick={handleBookmark}
              disabled={isBookmarking}
              className="flex items-center text-gray-500 hover:text-[#386641] text-xs font-medium transition-colors duration-200 px-2 py-1 border border-gray-200 rounded-md hover:border-[#6A994E] hover:bg-[#6A994E]/5 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`Bookmark ${file.title}`}
            >
              {isBookmarking ? (
                getIcons("Loader2", 14, "animate-spin")
              ) : (
                getIcons("Bookmark", 14)
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

FileCard.displayName = 'FileCard';

export default FileCard;