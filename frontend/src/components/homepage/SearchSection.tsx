'use client';

import React from 'react';
import SearchBar from './SearchBar';
import CategoryFilter, { FilterChangeParams } from './CategoryFilter';

interface SearchSectionProps {
  onSearch?: (query: string) => void;
  onFilterChange?: (params: FilterChangeParams) => void;
  className?: string;
}

const SearchSection: React.FC<SearchSectionProps> = React.memo(({
  onSearch,
  onFilterChange,
  className = ''
}) => {
  return (
    <section className={`mb-12 ${className}`}>
      <div className="space-y-6">
        <SearchBar onSearch={onSearch} />
        <CategoryFilter onFilterChange={onFilterChange} />
      </div>
    </section>
  );
});

SearchSection.displayName = 'SearchSection';

export default SearchSection;