"use client";

import React, { useCallback, useMemo } from 'react';
import { getIcon } from '@/utils/getIcon';
import { Tag } from '@/types/FolderInterface';
import { DisabledTagsState, EmptyTagsState, LoadingTagsState } from './sub-components/tag/DisabledTagsState ';
import ProgressBar from '@/components/layout/ProgressBar';
import TagsGrid from './sub-components/tag/TagsGrid';
import SelectionSummary from './sub-components/tag/SelectionSummary';


export interface TagSelectorProps {
  tags: Tag[];
  selectedTags: string[];
  onTagsChange: (tagIds: string[]) => void;
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
  maxSelection = 8,
  className = '',
  showSelectionCount = true
}: TagSelectorProps) {

  // All logic remains here
  const handleTagToggle = useCallback((tagId: string) => {
    if (disabled) return;

    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(id => id !== tagId));
    } else {
      if (selectedTags.length >= maxSelection) {
        console.warn(`Maximum ${maxSelection} tags allowed`);
        return;
      }
      onTagsChange([...selectedTags, tagId]);
    }
  }, [selectedTags, onTagsChange, disabled, maxSelection]);

  const selectionSummary = useMemo(() => {
    const selectedTagObjects = tags.filter(tag => selectedTags.includes(tag.id));
    return {
      count: selectedTags.length,
      isMaxReached: selectedTags.length >= maxSelection,
      selectedTagObjects,
      remainingSlots: maxSelection - selectedTags.length
    };
  }, [selectedTags, tags, maxSelection]);

  // ✅ The component now renders the imported sub-components
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {getIcon('Tags', 24, 'text-[#6A994E]')}
          <h3 id="tags-selector" className="text-lg font-semibold text-gray-900">
            Select Tags
          </h3>
        </div>

        {showSelectionCount && (
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${selectionSummary.isMaxReached ? 'text-amber-600' : 'text-gray-600'}`}>
              {selectionSummary.count}/{maxSelection} selected
            </span>
            {selectionSummary.isMaxReached && (
              <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                Max reached
              </span>
            )}
          </div>
        )}
      </div>

      <ProgressBar
        current={selectionSummary.count}
        max={maxSelection}
        className="mb-4"
      />

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

// ✅ Use React.memo for performance optimization
export default React.memo(TagSelector);