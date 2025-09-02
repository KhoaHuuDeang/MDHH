'use client';

import React, { useCallback, useMemo, useState } from 'react';
import * as lucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { FolderData } from '@/services/homepageService';
import useFileActions from '@/hooks/useFileActions';

const getIcons = (iconName: string, size: number, className?: string) => {
  const IconComponent = lucideIcons[iconName as keyof typeof lucideIcons] as LucideIcon;
  return IconComponent ? <IconComponent className={className} size={size} /> : null;
};

interface FolderCardProps {
  folder: FolderData;
  onView?: (folderId: string) => void;
  className?: string;
  isFollowing?: boolean;
}

const FolderCard: React.FC<FolderCardProps> = React.memo(({
  folder,
  onView,
  className = '',
  isFollowing: initialFollowing = false
}) => {
  const { followFolder, unfollowFolder, isFollowing: isFollowingLoading } = useFileActions();
  const [isFollowed, setIsFollowed] = useState(initialFollowing);

  // Handle folder view
  const handleView = useCallback(() => {
    onView?.(folder.id);
    // Navigate to folder page
    window.location.href = `/folders/${folder.id}`;
  }, [folder.id, onView]);

  // Handle follow/unfollow toggle
  const handleFollowToggle = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      if (isFollowed) {
        const result = await unfollowFolder(folder.id);
        if (result.success) {
          setIsFollowed(false);
        }
      } else {
        const result = await followFolder(folder.id);
        if (result.success) {
          setIsFollowed(true);
        }
      }
    } catch (error) {
      console.error('Follow toggle failed:', error);
    }
  }, [isFollowed, folder.id, followFolder, unfollowFolder]);

  // Format follow count
  const formattedFollowCount = useMemo(() => {
    const count = folder.followCount;
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  }, [folder.followCount]);

  return (
    <div className={`group ${className}`}>
      <div 
        onClick={handleView}
        className="bg-white border border-gray-200 hover:border-[#6A994E] hover:shadow-lg transition-all duration-200 rounded-xl overflow-hidden h-60 cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleView();
          }
        }}
        aria-label={`View ${folder.name} folder`}
      >
        {/* Top Section - Icon & Title */}
        <div className="p-6 flex-1">
          <div className="flex flex-col h-full">
            {/* Folder Icon & Follow Count */}
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-[#6A994E] flex items-center justify-center rounded-lg group-hover:bg-[#386641] transition-colors duration-200">
                {getIcons("Folder", 24, "text-white")}
              </div>
              
              {/* Follow count badge */}
              <div className="flex items-center bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs">
                {getIcons("Users", 12, "mr-1")}
                <span>{formattedFollowCount}</span>
              </div>
            </div>

            {/* Folder Title */}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 text-base line-clamp-2 group-hover:text-[#386641] transition-colors leading-tight mb-2">
                {folder.name}
              </h3>
              
              {/* Folder Description */}
              {folder.description && (
                <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed">
                  {folder.description}
                </p>
              )}
            </div>

            {/* Author Info */}
            <div className="mt-auto pt-3">
              <div className="flex items-center text-xs text-gray-500">
                {getIcons("User", 12, "mr-1")}
                <span>Created by {folder.author}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Follow Button */}
        <div className="px-6 pb-6">
          <button
            onClick={handleFollowToggle}
            disabled={isFollowingLoading}
            className={`
              w-full py-3 px-4 text-sm font-semibold transition-all duration-200 flex justify-center items-center rounded-lg border
              ${isFollowed 
                ? 'bg-[#6A994E] text-white border-[#6A994E] hover:bg-[#386641] hover:border-[#386641]' 
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-[#6A994E] hover:text-white hover:border-[#6A994E]'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            aria-label={`${isFollowed ? 'Unfollow' : 'Follow'} ${folder.name}`}
          >
            {isFollowingLoading ? (
              <>
                {getIcons("Loader2", 16, "mr-2 animate-spin")}
                <span>{isFollowed ? 'Unfollowing...' : 'Following...'}</span>
              </>
            ) : (
              <>
                {isFollowed ? (
                  <>
                    {getIcons("UserCheck", 16, "mr-2")}
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    {getIcons("UserPlus", 16, "mr-2 group-hover:rotate-12 transition-transform duration-200")}
                    <span>Follow</span>
                  </>
                )}
              </>
            )}
          </button>
        </div>

        {/* Hover overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-[#6A994E]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
      </div>
    </div>
  );
});

FolderCard.displayName = 'FolderCard';

export default FolderCard;