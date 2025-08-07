"use client";

import React, { useCallback, useMemo } from 'react';
import { getIcon } from '@/utils/getIcon';

interface Tag {
  id: string;
  name: string;
  description?: string;
  level_id?: string;
}

interface TagSelectorProps {
  tags: Tag[];
  selectedTags: string[]; // ✅ FIXED: Changed from Tag[] to string[]
  onTagsChange: (tagIds: string[]) => void; // ✅ FIXED: Consistent with string[]
  disabled?: boolean;
  isLoading?: boolean;
  maxSelection?: number;
  className?: string;
  showSelectionCount?: boolean;
}

function TagSelector({
  tags,
  selectedTags,
  onTagsChange,
  disabled = false,
  isLoading = false,
  maxSelection = 8, // ✅ Reduced from 10 to 8 for better UX
  className = '',
  showSelectionCount = true
}: TagSelectorProps) {
  // ✅ Optimized tag toggle with validation
  const handleTagToggle = useCallback((tagId: string) => {
    if (disabled) return;
    
    if (selectedTags.includes(tagId)) {
      // Remove tag
      onTagsChange(selectedTags.filter(id => id !== tagId));
    } else {
      // Add tag with max validation
      if (selectedTags.length >= maxSelection) {
        console.warn(`Maximum ${maxSelection} tags allowed`);
        return;
      }
      onTagsChange([...selectedTags, tagId]);
    }
  }, [selectedTags, onTagsChange, disabled, maxSelection]);

  // ✅ Enhanced selection summary with memoization
  const selectionSummary = useMemo(() => {
    const selectedTagObjects = tags.filter(tag => selectedTags.includes(tag.id));
    return {
      count: selectedTags.length,
      isMaxReached: selectedTags.length >= maxSelection,
      selectedTagObjects,
      remainingSlots: maxSelection - selectedTags.length
    };
  }, [selectedTags, tags, maxSelection]);

  // ✅ Optimized disabled state
  if (disabled) {
    return (
      <DisabledTagsState 
        message="Please select a classification level first"
        className={className}
      />
    );
  }

  return (
    <section className={className} aria-labelledby="tags-selector">
      {/* ✅ Enhanced header with progress indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {getIcon('Tags', 24, 'text-[#6A994E]')}
          <h3 id="tags-selector" className="text-lg font-semibold text-gray-900">
            Select Tags
          </h3>
        </div>
        
        {showSelectionCount && (
          <SelectionCounter 
            count={selectionSummary.count}
            max={maxSelection}
            isMaxReached={selectionSummary.isMaxReached}
          />
        )}
      </div>

      {/* ✅ Progress bar for selection */}
      <ProgressBar 
        current={selectionSummary.count}
        max={maxSelection}
        className="mb-4"
      />

      {/* ✅ Tags content */}
      {isLoading ? (
        <LoadingTagsState />
      ) : tags.length === 0 ? (
        <EmptyTagsState />
      ) : (
        <>
          <TagsGrid
            tags={tags}
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
            isMaxReached={selectionSummary.isMaxReached}
          />
          
          {/* ✅ Selection summary */}
          {selectionSummary.count > 0 && (
            <SelectionSummary 
              selectedTags={selectionSummary.selectedTagObjects}
              onRemoveTag={(tagId) => handleTagToggle(tagId)}
              className="mt-6"
            />
          )}
        </>
      )}
    </section>
  );
}

// ✅ Extracted optimized sub-components
const DisabledTagsState = React.memo<{ message: string; className?: string }>(({ 
  message, 
  className = '' 
}) => (
  <section className={`opacity-50 ${className}`}>
    <div className="p-6 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
      <div className="text-center">
        {getIcon('Lock', 32, 'text-gray-400 mx-auto mb-3')}
        <p className="text-gray-500 text-sm">{message}</p>
      </div>
    </div>
  </section>
));

const SelectionCounter = React.memo<{ 
  count: number; 
  max: number; 
  isMaxReached: boolean; 
}>(({ count, max, isMaxReached }) => (
  <div className="flex items-center gap-2">
    <span className={`text-sm font-medium ${isMaxReached ? 'text-amber-600' : 'text-gray-600'}`}>
      {count}/{max} selected
    </span>
    {isMaxReached && (
      <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
        Max reached
      </span>
    )}
  </div>
));

const ProgressBar = React.memo<{ 
  current: number; 
  max: number; 
  className?: string; 
}>(({ current, max, className = '' }) => {
  const percentage = Math.round((current / max) * 100);
  
  return (
    <div className={`w-full ${className}`}>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-[#6A994E] h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
});

const LoadingTagsState = React.memo(() => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
    {Array.from({ length: 8 }, (_, i) => (
      <div key={i} className="animate-pulse bg-gray-200 h-16 rounded-lg" />
    ))}
  </div>
));

const EmptyTagsState = React.memo(() => (
  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
    {getIcon('Tag', 48, 'text-gray-300 mx-auto mb-4')}
    <h4 className="text-lg font-medium text-gray-900 mb-2">No tags available</h4>
    <p className="text-gray-500 text-sm">
      No tags found for this classification level
    </p>
  </div>
));

interface TagsGridProps {
  tags: Tag[];
  selectedTags: string[];
  onTagToggle: (tagId: string) => void;
  isMaxReached: boolean;
}

const TagsGrid = React.memo<TagsGridProps>(({ 
  tags, 
  selectedTags, 
  onTagToggle, 
  isMaxReached 
}) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
    {tags.map(tag => {
      const isSelected = selectedTags.includes(tag.id);
      const isDisabled = !isSelected && isMaxReached;
      
      return (
        <TagCard
          key={tag.id}
          tag={tag}
          isSelected={isSelected}
          isDisabled={isDisabled}
          onToggle={() => onTagToggle(tag.id)}
        />
      );
    })}
  </div>
));

interface TagCardProps {
  tag: Tag;
  isSelected: boolean;
  isDisabled: boolean;
  onToggle: () => void;
}

const TagCard = React.memo<TagCardProps>(({ tag, isSelected, isDisabled, onToggle }) => (
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
));

interface SelectionSummaryProps {
  selectedTags: Tag[];
  onRemoveTag: (tagId: string) => void;
  className?: string;
}

const SelectionSummary = React.memo<SelectionSummaryProps>(({ 
  selectedTags, 
  onRemoveTag, 
  className = '' 
}) => (
  <div className={`p-4 bg-green-50 border border-green-200 rounded-lg ${className}`}>
    <div className="flex items-center gap-2 mb-3">
      {getIcon('CheckCircle', 16, 'text-green-600')}
      <span className="text-sm font-medium text-green-800">
        Selected Tags ({selectedTags.length})
      </span>
    </div>
    
    <div className="flex flex-wrap gap-2">
      {selectedTags.map(tag => (
        <SelectedTagChip
          key={tag.id}
          tag={tag}
          onRemove={() => onRemoveTag(tag.id)}
        />
      ))}
    </div>
  </div>
));

const SelectedTagChip = React.memo<{ 
  tag: Tag; 
  onRemove: () => void; 
}>(({ tag, onRemove }) => (
  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 
                   text-xs rounded-full border border-green-200">
    {tag.name}
    <button
      type="button"
      onClick={onRemove}
      className="ml-1 hover:bg-green-200 rounded-full p-0.5 transition-colors duration-150"
      title={`Remove ${tag.name}`}
    >
      {getIcon('X', 10, 'text-green-600')}
    </button>
  </span>
));

// Set display names
DisabledTagsState.displayName = 'DisabledTagsState';
SelectionCounter.displayName = 'SelectionCounter';
ProgressBar.displayName = 'ProgressBar';
LoadingTagsState.displayName = 'LoadingTagsState';
EmptyTagsState.displayName = 'EmptyTagsState';
TagsGrid.displayName = 'TagsGrid';
TagCard.displayName = 'TagCard';
SelectionSummary.displayName = 'SelectionSummary';
SelectedTagChip.displayName = 'SelectedTagChip';

export default React.memo(TagSelector);