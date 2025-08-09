import React from 'react';
import { getIcon } from '@/utils/getIcon';
import { Tag } from '@/types/FolderInterface';

export interface TagCardProps {
  tag: Tag;
  isSelected: boolean;
  isDisabled: boolean;
  onToggle: () => void;
}

function TagCard({ tag, isSelected, isDisabled, onToggle }: TagCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={isDisabled}
      className={`p-3 border-2 rounded-lg text-left transition-all duration-200 
                 focus:outline-none focus:ring-2 focus:ring-[#6A994E]/50
                 ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md hover:scale-105'}
                 ${isSelected
                   ? 'border-[#6A994E] bg-green-50 shadow-md shadow-[#6A994E]/20'
                   : 'border-gray-200 hover:border-[#6A994E]/50'
                 }`}
      title={tag.description || `Tag: ${tag.name}`}
      aria-pressed={isSelected}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-colors
                        ${isSelected ? 'border-[#6A994E] bg-[#6A994E]' : 'border-gray-300'}`}>
          {isSelected && getIcon('Check', 12, 'text-white')}
        </div>
        
        <span className={`text-sm font-medium truncate
                         ${isSelected ? 'text-[#6A994E]' : 'text-gray-700'}`}>
          {tag.name}
        </span>
      </div>
      
      {tag.description && (
        <p className="text-xs text-gray-500 line-clamp-2">
          {tag.description}
        </p>
      )}
    </button>
  );
}

TagCard.displayName = 'TagCard';

export default React.memo(TagCard);