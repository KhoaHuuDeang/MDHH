'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as lucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

const getIcons = (iconName: string, size: number, className?: string) => {
  const IconComponent = lucideIcons[iconName as keyof typeof lucideIcons] as LucideIcon;
  return IconComponent ? <IconComponent className={className} size={size} /> : null;
};

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
  initialValue?: string;
}

const SearchBar: React.FC<SearchBarProps> = React.memo(({
  onSearch,
  placeholder = "Tìm kiếm tài liệu ",
  className = '',
  initialValue = ''
}) => {
  // URL state management
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(initialValue);

  // Initialize from URL on mount
  useEffect(() => {
    const queryFromUrl = searchParams.get('query') || '';
    setSearchQuery(queryFromUrl);
  }, [searchParams]);

  // Update URL when search is triggered
  const updateUrlWithQuery = useCallback((query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (query.trim()) {
      params.set('query', query.trim());
    } else {
      params.delete('query');
    }
    
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    router.replace(newUrl, { scroll: false });
  }, [router, searchParams]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    updateUrlWithQuery(searchQuery);
    onSearch?.(searchQuery);
  }, [searchQuery, onSearch, updateUrlWithQuery]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Optional: Trigger search on every keystroke (with debouncing handled by parent)
    // onSearch?.(value);
  }, []);

  const handleClear = useCallback(() => {
    setSearchQuery('');
    updateUrlWithQuery('');
    onSearch?.('');
  }, [onSearch, updateUrlWithQuery]);

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="bg-white border-2 border-gray-200 hover:border-[#6A994E] focus-within:border-[#6A994E] transition-all duration-200 rounded-xl shadow-sm">
        <div className="relative flex items-center">
          <input
            type="search"
            placeholder={placeholder}
            className="w-full py-6 px-8 bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none font-medium text-lg rounded-xl pr-20"
            value={searchQuery}
            onChange={handleInputChange}
            aria-label="Search files and folders"
          />
          
          {/* Clear button */}
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-16 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              aria-label="Clear search"
            >
              {getIcons("X", 16)}
            </button>
          )}
          
          {/* Search button */}
          <button
            type="submit"
            className="absolute right-4 bg-[#386641] text-white p-4 hover:bg-[#2d4f31] transition-colors duration-200 rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!searchQuery.trim()}
            aria-label="Search"
          >
            {getIcons("Search", 20, "text-white")}
          </button>
        </div>
      </div>
      
      {/* Search suggestions could be added here */}
      {/* <SearchSuggestions query={searchQuery} onSelectSuggestion={setSearchQuery} /> */}
    </form>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;