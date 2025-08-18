'use client';

import React, { useState, useCallback, useMemo } from 'react';
import * as lucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

const getIcons = (iconName: string, size: number, className?: string) => {
  const IconComponent = lucideIcons[iconName as keyof typeof lucideIcons] as LucideIcon;
  return IconComponent ? <IconComponent className={className} size={size} /> : null;
};

interface Category {
  id: string;
  name: string;
  icon: string;
  count?: number;
}

interface CategoryFilterProps {
  onCategoryChange?: (category: string) => void;
  className?: string;
  showCounts?: boolean;
}

const categories: Category[] = [
  { id: 'all', name: 'All Categories', icon: 'Grid3X3', count: 0 },
  { id: 'documents', name: 'Documents', icon: 'FileText', count: 0 },
  { id: 'presentations', name: 'Presentations', icon: 'FileBarChart', count: 0 },
  { id: 'spreadsheets', name: 'Spreadsheets', icon: 'FileSpreadsheet', count: 0 },
  { id: 'images', name: 'Images', icon: 'Image', count: 0 },
  { id: 'videos', name: 'Videos', icon: 'Video', count: 0 },
  { id: 'audio', name: 'Audio', icon: 'Music', count: 0 },
  { id: 'archives', name: 'Archives', icon: 'Archive', count: 0 },
  { id: 'code', name: 'Code Files', icon: 'Code', count: 0 },
];

const CategoryFilter: React.FC<CategoryFilterProps> = React.memo(({
  onCategoryChange,
  className = '',
  showCounts = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    onCategoryChange?.(categoryId === 'all' ? '' : categoryId);
  }, [onCategoryChange]);

  const memoizedCategories = useMemo(() => categories, []);

  return (
    <div className={`${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-sm font-medium text-gray-600">Filter by category:</span>
        <span className="text-xs text-gray-400">({memoizedCategories.length - 1} categories available)</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {memoizedCategories.map((category) => {
          const isSelected = selectedCategory === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 text-sm font-medium
                ${isSelected 
                  ? 'bg-[#6A994E] text-white border-[#6A994E] shadow-md' 
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#6A994E] hover:bg-[#6A994E]/5 hover:text-[#6A994E]'
                }
              `}
              aria-pressed={isSelected}
              aria-label={`Filter by ${category.name}`}
            >
              <span className={`${isSelected ? 'text-white' : 'text-gray-500'}`}>
                {getIcons(category.icon, 16)}
              </span>
              <span>{category.name}</span>
              {showCounts && category.count !== undefined && (
                <span className={`
                  text-xs px-2 py-0.5 rounded-full font-medium
                  ${isSelected 
                    ? 'bg-white/20 text-white' 
                    : 'bg-gray-100 text-gray-500'
                  }
                `}>
                  {category.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Active filter indicator */}
      {selectedCategory !== 'all' && (
        <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600">
          <span>Active filter:</span>
          <span className="px-2 py-1 bg-[#6A994E]/10 text-[#6A994E] rounded-md font-medium">
            {memoizedCategories.find(cat => cat.id === selectedCategory)?.name}
          </span>
          <button
            onClick={() => handleCategorySelect('all')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear category filter"
          >
            {getIcons("X", 14)}
          </button>
        </div>
      )}
    </div>
  );
});

CategoryFilter.displayName = 'CategoryFilter';

export default CategoryFilter;