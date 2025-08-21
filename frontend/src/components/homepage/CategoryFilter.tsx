'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as lucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { useClassificationLevels, useTagsByLevel } from '@/hooks/useClassificationData';
import { ClassificationLevel, TagsByLevel } from '@/types/classification.types';

const getIcons = (iconName: string, size: number, className?: string) => {
  const IconComponent = lucideIcons[iconName as keyof typeof lucideIcons] as LucideIcon;
  return IconComponent ? <IconComponent className={className} size={size} /> : null;
};

export interface FilterChangeParams {
  classificationLevelId: string;
  selectedTags: string[];
}

interface CategoryFilterProps {
  onFilterChange?: (params: FilterChangeParams) => void;
  className?: string;
}

const CategoryFilter: React.FC<CategoryFilterProps> = React.memo(({
  onFilterChange,
  className = ''
}) => {
  // URL state management
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State management
  const [selectedClassification, setSelectedClassification] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Data fetching
  const { classificationLevels, isLoading: levelsLoading, error: levelsError } = useClassificationLevels();
  const { tags, isLoading: tagsLoading, error: tagsError } = useTagsByLevel(selectedClassification || null);

  // Initialize state from URL on mount
  useEffect(() => {
    const classificationFromUrl = searchParams.get('classification') || '';
    const tagsFromUrl = searchParams.get('tags') || '';
    
    setSelectedClassification(classificationFromUrl);
    setSelectedTags(tagsFromUrl ? tagsFromUrl.split(',').filter(Boolean) : []);
  }, [searchParams]);

  // Update URL when filters change
  const updateUrl = useCallback((classificationId: string, tags: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (classificationId) {
      params.set('classification', classificationId);
    } else {
      params.delete('classification');
    }
    
    if (tags.length > 0) {
      params.set('tags', tags.join(','));
    } else {
      params.delete('tags');
    }
    
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    router.replace(newUrl, { scroll: false });
  }, [router, searchParams]);

  // Notify parent of filter changes
  const notifyFilterChange = useCallback(() => {
    onFilterChange?.({
      classificationLevelId: selectedClassification,
      selectedTags: selectedTags
    });
  }, [selectedClassification, selectedTags, onFilterChange]);

  // Manual filter trigger - only when user clicks Filter button
  const handleApplyFilters = useCallback(() => {
    notifyFilterChange();
  }, [notifyFilterChange]);

  // Update URL when state changes (after render)
  useEffect(() => {
    // Only update URL if state has been initialized from URL (not on first mount)
    const isInitialState = selectedClassification === '' && selectedTags.length === 0;
    const hasUrlParams = searchParams.get('classification') || searchParams.get('tags');
    
    // Update URL if we have filters OR if we need to clear URL params
    if (!isInitialState || (isInitialState && hasUrlParams)) {
      updateUrl(selectedClassification, selectedTags);
    }
  }, [selectedClassification, selectedTags, updateUrl, searchParams]);

  // Handle classification level selection
  const handleClassificationChange = useCallback((levelId: string) => {
    setSelectedClassification(levelId);
    setSelectedTags([]); // Reset tags when classification changes
  }, []);

  // Handle tag selection/deselection
  const handleTagToggle = useCallback((tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  }, []);

  // Handle tags clear (all tags button)
  const handleTagsClear = useCallback(() => {
    setSelectedTags([]);
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSelectedClassification('');
    setSelectedTags([]);
  }, []);

  const hasActiveFilters = selectedClassification || selectedTags.length > 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Classification Level Filter */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">Classification Level</h3>
          {levelsLoading && (
            <div className="flex items-center text-xs text-gray-400">
              {getIcons("Loader2", 12, "animate-spin mr-1")}
              Loading...
            </div>
          )}
        </div>

        {levelsError && (
          <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
            Failed to load classification levels
          </div>
        )}

        <div className="space-y-2">
          {/* All Classifications Option */}
          <button
            onClick={() => handleClassificationChange('')}
            className={`w-full text-left px-4 py-2 rounded-lg border transition-all duration-200 text-sm
              ${!selectedClassification
                ? 'bg-[#6A994E] text-white border-[#6A994E] shadow-md'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#6A994E] hover:bg-[#6A994E]/5'
              }
            `}
          >
            <div className="flex items-center space-x-2">
              {getIcons("Grid3X3", 16, !selectedClassification ? "text-white" : "text-gray-500")}
              <span>All Classifications</span>
            </div>
          </button>

          {/* Classification Level Options */}
          {classificationLevels?.map((level) => (
            <button
              key={level.id}
              onClick={() => handleClassificationChange(level.id)}
              className={`w-full text-left px-4 py-2 rounded-lg border transition-all duration-200 text-sm
                ${selectedClassification === level.id
                  ? 'bg-[#6A994E] text-white border-[#6A994E] shadow-md'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#6A994E] hover:bg-[#6A994E]/5'
                }
              `}
            >
              <div className="flex items-center space-x-2">
                {getIcons("Shield", 16, selectedClassification === level.id ? "text-white" : "text-gray-500")}
                <span>{level.name}</span>
                <span className="text-xs text-gray-400">({level.tags.length} tags)</span>
              </div>
              {level.description && (
                <p className="text-xs mt-1 text-gray-400">
                  {level.description}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tags Filter */}
      {selectedClassification && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Tags</h3>
            {tagsLoading && (
              <div className="flex items-center text-xs text-gray-400">
                {getIcons("Loader2", 12, "animate-spin mr-1")}
                Loading tags...
              </div>
            )}
          </div>

          {tagsError && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
              Failed to load tags
            </div>
          )}

          {tags && tags.length > 0 ? (
            <div className="space-y-2">
              {/* All Tags Option */}
              <button
                onClick={handleTagsClear}
                className={`w-full text-left px-4 py-2 rounded-lg border transition-all duration-200 text-sm
                  ${selectedTags.length === 0
                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                  }
                `}
              >
                <div className="flex items-center space-x-2">
                  {getIcons("Tag", 16, selectedTags.length === 0 ? "text-blue-600" : "text-gray-500")}
                  <span>All Tags</span>
                </div>
              </button>

              {/* Tag Options */}
              {tags.map((tag) => {
                const isSelected = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => handleTagToggle(tag.id)}
                    className={`w-full text-left px-4 py-2 rounded-lg border transition-all duration-200 text-sm
                      ${isSelected
                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 border-2 rounded ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                        {isSelected && getIcons("Check", 12, "text-white")}
                      </div>
                      <span>{tag.name}</span>
                    </div>
                    {tag.description && (
                      <p className="text-xs mt-1 text-gray-400 ml-6">
                        {tag.description}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-gray-500 text-center py-4">
              No tags available for this classification level
            </div>
          )}
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Active Filters</h4>
            <button
              onClick={clearFilters}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear all
            </button>
          </div>

          <div className="space-y-2">
            {selectedClassification && (
              <div className="flex items-center text-xs text-gray-600">
                {getIcons("Shield", 12, "mr-1")}
                <span>Level: </span>
                <span className="font-medium ml-1">
                  {classificationLevels?.find(l => l.id === selectedClassification)?.name || 'Unknown'}
                </span>
              </div>
            )}

            {selectedTags.length > 0 && (
              <div className="flex items-start text-xs text-gray-600">
                {getIcons("Tag", 12, "mr-1 mt-0.5")}
                <div>
                  <span>Tags: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedTags.map((tagId) => {
                      const tag = tags?.find(t => t.id === tagId);
                      return (
                        <span key={tagId} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                          {tag?.name || 'Unknown'}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filter Action Button */}
      <div className="pt-4 border-t">
        <button
          onClick={handleApplyFilters}
          disabled={!hasActiveFilters}
          className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
            hasActiveFilters
              ? 'bg-[#6A994E] text-white hover:bg-[#5a8240] shadow-md hover:shadow-lg'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {getIcons("Filter", 16, "mr-2")}
          <span>Apply Filters</span>
          {hasActiveFilters && (
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
              {selectedClassification ? 1 : 0}+{selectedTags.length}
            </span>
          )}
        </button>
      </div>
    </div>
  );
});

CategoryFilter.displayName = 'CategoryFilter';

export default CategoryFilter;
export type { FilterChangeParams };