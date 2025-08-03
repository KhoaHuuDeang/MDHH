"use client";

import React from 'react';
import { getIcon } from '@/utils/getIcon';

interface Tag {
  id: string;
  name: string;
  description?: string;
}

interface TagSelectorProps {
  tags: Tag[];
  selectedTags: string[];
  onTagsChange: (tagIds: string[]) => void;
  disabled: boolean;
  isLoading: boolean;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  tags,
  selectedTags,
  onTagsChange,
  disabled,
  isLoading
}) => {
  const handleTagToggle = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(id => id !== tagId));
    } else {
      onTagsChange([...selectedTags, tagId]);
    }
  };

  if (disabled) {
    return (
      <section className="opacity-50">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Tags Selection
        </label>
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <p className="text-gray-500 text-sm flex items-center gap-2">
            {getIcon('Lock', 16)}
            Please select a classification level first
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        Tags Selection
        <span className="text-gray-500 font-normal ml-2">
          ({selectedTags.length} selected)
        </span>
      </label>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-12 rounded-lg"></div>
          ))}
        </div>
      ) : tags.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="mb-2">{getIcon('Tag', 24, 'text-gray-400 mx-auto')}</div>
          <p>No tags available for this classification level.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {tags.map(tag => {
            const isSelected = selectedTags.includes(tag.id);
            
            return (
              <label
                key={tag.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 
                           hover:shadow-md hover:shadow-[#386641]/20 hover:scale-105 
                           focus:outline-none focus:ring-2 focus:ring-[#6A994E]/50 ${
                  isSelected
                    ? 'border-[#6A994E] bg-green-50 shadow-md shadow-[#386641]/20'
                    : 'border-gray-200 hover:border-[#6A994E]'
                }`}
                title={tag.description}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleTagToggle(tag.id)}
                  className="sr-only"
                />
                
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                    isSelected
                      ? 'border-[#6A994E] bg-[#6A994E]'
                      : 'border-gray-300'
                  }`}>
                    {isSelected && getIcon('Check', 12, 'text-white')}
                  </div>
                  
                  <span className={`text-sm font-medium ${
                    isSelected ? 'text-[#6A994E]' : 'text-gray-700'
                  }`}>
                    {tag.name}
                  </span>
                </div>
                
                {tag.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {tag.description}
                  </p>
                )}
              </label>
            );
          })}
        </div>
      )}

      {selectedTags.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            {getIcon('CheckCircle', 16, 'text-green-600')}
            <span className="text-sm font-medium text-green-800">
              Selected Tags ({selectedTags.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tagId => {
              const tag = tags.find(t => t.id === tagId);
              return tag ? (
                <span
                  key={tagId}
                  className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full border border-green-200"
                >
                  {tag.name}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default React.memo(TagSelector);