'use client';

import React from 'react';
import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';

interface SearchSectionProps {
  onSearch?: (query: string) => void;
  onCategoryChange?: (category: string) => void;
  className?: string;
}

const SearchSection: React.FC<SearchSectionProps> = React.memo(({
  onSearch,
  onCategoryChange,
  className = ''
}) => {
  return (
    <section className={`mb-12 ${className}`}>
      <div className="space-y-6">
        <SearchBar onSearch={onSearch} />
        <CategoryFilter onCategoryChange={onCategoryChange} />
      </div>
    </section>
  );
});

SearchSection.displayName = 'SearchSection';

export default SearchSection;