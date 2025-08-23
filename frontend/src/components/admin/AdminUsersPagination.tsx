import React from 'react';
import { PaginationState } from '@/types/admin.types';

interface AdminUsersPaginationProps {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onNext: () => void;
  onPrevious: () => void;
}

function AdminUsersPagination({ 
  pagination, 
  onPageChange, 
  onNext, 
  onPrevious 
}: AdminUsersPaginationProps) {
  const { hasNext, hasPrevious, currentPage, totalPages, total } = pagination;

  // Render page numbers for offset pagination (first 20 pages)
  const renderPageNumbers = () => {
    if (!currentPage || !totalPages) return null;

    const pages = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // Show first page + ellipsis if needed
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => onPageChange(1)}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
        >
          1
        </button>
      );
      
      if (startPage > 2) {
        pages.push(
          <span key="start-ellipsis" className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300">
            ...
          </span>
        );
      }
    }

    // Show page numbers
    for (let i = startPage; i <= endPage && i <= 20; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${
            i === currentPage
              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }

    // Show ellipsis + last page if needed
    if (endPage < totalPages && endPage < 20) {
      if (endPage < totalPages - 1 && endPage < 19) {
        pages.push(
          <span key="end-ellipsis" className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300">
            ...
          </span>
        );
      }
      
      pages.push(
        <button
          key={Math.min(totalPages, 20)}
          onClick={() => onPageChange(Math.min(totalPages, 20))}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
        >
          {Math.min(totalPages, 20)}
        </button>
      );
    }

    return pages;
  };

  if (!hasNext && !hasPrevious) {
    return null;
  }

  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={onPrevious}
          disabled={!hasPrevious}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          disabled={!hasNext}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>

      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            {total !== undefined ? (
              <>
                Showing page <span className="font-medium">{currentPage || 1}</span> of{' '}
                <span className="font-medium">{totalPages}</span> ({total} total users)
              </>
            ) : (
              'Viewing users with cursor-based pagination'
            )}
          </p>
        </div>

        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={onPrevious}
              disabled={!hasPrevious}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Page numbers (only for offset pagination) */}
            {currentPage && totalPages && renderPageNumbers()}

            {/* For cursor pagination, show simple indicator */}
            {!currentPage && (
              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-gray-50 text-sm font-medium text-gray-500">
                Cursor mode
              </span>
            )}

            <button
              onClick={onNext}
              disabled={!hasNext}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}

AdminUsersPagination.displayName = 'AdminUsersPagination';
export default React.memo(AdminUsersPagination);