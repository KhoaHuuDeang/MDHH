'use client';

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import * as lucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { getMimeTypeIcon, getFileTypeDescription } from '@/utils/mimeTypeIcons';
import { FileData, homepageService } from '@/services/homepageService';
import useFileActions from '@/hooks/useFileActions';
import { VoteData } from '@/types/vote.types';
import CommentModal from '@/components/modals/CommentModal';

const getIcons = (iconName: string, size: number, className?: string) => {
  const IconComponent = lucideIcons[iconName as keyof typeof lucideIcons] as LucideIcon;
  return IconComponent ? <IconComponent className={className} size={size} /> : null;
};

interface FileCardProps {
  file: FileData;
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
  const { downloadFile, voteFile, getFileVotes, bookmarkFile, isDownloading, isVoting, isBookmarking } = useFileActions();

  // Vote data state
  const [voteData, setVoteData] = useState<VoteData>({
    upvotes: 0,
    downvotes: 0,
    userVote: null
  });

  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [isFlagging, setIsFlagging] = useState(false);

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

  const { iconName, typeDescription } = useMemo(() => {
    return {
      iconName: getMimeTypeIcon(file.fileType, file.title),
      typeDescription: getFileTypeDescription(file.fileType, file.title)
    };
  }, [file.fileType, file.title]);

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

  const handleView = useCallback((e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.stopPropagation();
    setCommentModalOpen(true);
  }, []);

  const handleFlag = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    const reason = prompt('Enter reason for flagging this file:');
    if (!reason) return;

    setIsFlagging(true);
    try {
      await homepageService.flagUpload(file.id, reason);
      alert('File flagged successfully');
    } catch (error) {
      console.error('Failed to flag file:', error);
      alert('Failed to flag file');
    } finally {
      setIsFlagging(false);
    }
  }, [file.id]);

  const handleDownload = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    await downloadFile(file.id, file.title);
  }, [file.id, file.title, downloadFile]);

  const handleBookmark = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    await bookmarkFile(file.id);
  }, [file.id, bookmarkFile]);

  const handleUpvote = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
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
      setVoteData(voteData);
    }
  }, [file.id, voteFile, voteData]);

  const handleDownvote = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
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
      setVoteData(voteData);
    }
  }, [file.id, voteFile, voteData]);

  return (
    <div className={`group h-full ${className}`}>
      {/* Flex col and h-full ensures the card stretches to fill the grid cell, 
        and the footer sticks to the bottom 
      */}
      <div className="flex flex-col h-full bg-white border border-gray-200 hover:border-[#6A994E] hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden">
        
        {/* === 1. CLICKABLE CONTENT AREA === */}
        <div 
          onClick={handleView}
          className="flex-1 flex flex-col cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleView();
            }
          }}
        >
          {/* Preview Header */}
          <div className="relative bg-gray-50 h-48 shrink-0 border-b border-gray-100">
            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2 z-10">
              <span className="bg-[#386641] text-white px-2.5 py-1 text-[11px] font-semibold rounded-full shadow-sm">
                {file.downloadCount} downloads
              </span>
              {file.moderation_status && (
                <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full shadow-sm ${
                  file.moderation_status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                  file.moderation_status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {file.moderation_status.replace('_', ' ')}
                </span>
              )}
            </div>

            <div className="absolute top-3 right-3 z-10">
              <span className="bg-white/95 backdrop-blur-sm text-gray-700 px-2.5 py-1 text-[11px] font-medium rounded-md shadow-sm border border-gray-100">
                {typeDescription}
              </span>
            </div>

            {/* Icon/Thumbnail Centered */}
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-gray-100 group-hover:to-gray-200 transition-colors duration-300">
              {getIcons(iconName, 52, "text-gray-400 group-hover:text-[#386641] group-hover:scale-110 transition-all duration-300")}
            </div>
          </div>

          {/* Info Body */}
          <div className="p-5 flex flex-col flex-1">
            <div className="mb-3">
              <h3 className="font-bold text-gray-900 text-base line-clamp-2 leading-snug group-hover:text-[#386641] transition-colors mb-1.5">
                {file.title}
              </h3>
              
              {file.description && (
                <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                  {file.description}
                </p>
              )}
            </div>
            
            {/* Meta Data */}
            <div className="flex items-center justify-between text-xs text-gray-400 mb-3 font-medium">
              <span className="flex items-center gap-1">
                {getIcons("User", 12)}
                {file.author}
              </span>
              <span>{formattedDate}</span>
            </div>
            
            {/* Tags & Categories - Flexible height */}
            <div className="space-y-2 mb-4">
              <div className="flex flex-wrap gap-2">
                {file.category && (
                   <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                    {getIcons("Tag", 10)}
                    {file.category}
                  </span>
                )}
                {file.classificationLevel && (
                  <span className="inline-flex items-center gap-1 text-xs text-[#386641] bg-[#6A994E]/10 px-2 py-1 rounded-md border border-[#6A994E]/20">
                    {getIcons("Shield", 10)}
                    {file.classificationLevel}
                  </span>
                )}
              </div>

              {file.tags && file.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {file.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                      #{tag}
                    </span>
                  ))}
                  {file.tags.length > 3 && (
                    <span className="text-[10px] px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full">
                      +{file.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Folder - Pushed to bottom of content area */}
            {file.folderName && (
              <div className="mt-auto pt-3 border-t border-dashed border-gray-100">
                <div className="flex items-center text-xs text-gray-500 hover:text-[#386641] transition-colors gap-1.5">
                  {getIcons("FolderOpen", 14)}
                  <span className="truncate">In: {file.folderName}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* === 2. FOOTER ACTIONS (Sticky Bottom) === */}
        <div className="px-4 py-3 bg-gray-50/80 border-t border-gray-100 flex justify-between items-center gap-3">
          {/* Download */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 flex items-center justify-center gap-2 text-xs font-semibold text-gray-700 hover:text-white bg-white hover:bg-[#386641] border border-gray-200 hover:border-[#386641] transition-all duration-200 py-2 px-3 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group/btn"
          >
            {isDownloading ? (
              getIcons("Loader2", 14, "animate-spin")
            ) : (
              getIcons("Download", 14, "group-hover/btn:scale-110 transition-transform")
            )}
            <span>Download</span>
          </button>

          {/* Social Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleUpvote}
              disabled={isVoting}
              className={`h-9 min-w-[36px] px-2 flex items-center justify-center gap-1 rounded-lg border text-xs font-medium transition-all ${
                voteData.userVote === 'up'
                  ? 'bg-[#6A994E] text-white border-[#6A994E] shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#6A994E] hover:text-[#6A994E]'
              }`}
            >
              {getIcons("ChevronUp", 14)}
              <span>{voteData.upvotes}</span>
            </button>

            <button
              onClick={handleDownvote}
              disabled={isVoting}
              className={`h-9 w-9 flex items-center justify-center rounded-lg border transition-all ${
                voteData.userVote === 'down'
                  ? 'bg-red-50 text-red-600 border-red-200'
                  : 'bg-white text-gray-400 border-gray-200 hover:text-red-600 hover:border-red-200'
              }`}
            >
              {getIcons("ChevronDown", 14)}
            </button>

            <div className="w-px h-6 bg-gray-200 mx-1" />

            <button
              onClick={handleBookmark}
              disabled={isBookmarking}
              className="h-9 w-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-[#386641] hover:border-[#6A994E] transition-all"
            >
              {isBookmarking ? getIcons("Loader2", 14, "animate-spin") : getIcons("Bookmark", 14)}
            </button>

            <button
              onClick={handleFlag}
              disabled={isFlagging}
              className="h-9 w-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-yellow-600 hover:border-yellow-400 transition-all"
              title="Report"
            >
              {isFlagging ? getIcons("Loader2", 14, "animate-spin") : getIcons("Flag", 14)}
            </button>
          </div>
        </div>
      </div>

      <CommentModal
        isOpen={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        resourceId={file.id}
        title={file.title}
      />
    </div>
  );
});

FileCard.displayName = 'FileCard';

export default FileCard;