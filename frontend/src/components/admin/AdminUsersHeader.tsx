import React from 'react';
import { useTranslation } from 'react-i18next';

interface AdminUsersHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onRefresh: () => void;
  onSearch: () => void;
  onExport: () => void;
  isLoading: boolean;
}

function AdminUsersHeader({
  searchTerm,
  onSearchChange,
  onRefresh,
  onSearch,
  onExport,
  isLoading
}: AdminUsersHeaderProps) {
  const { t } = useTranslation();
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('adminUsers.title')}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {t('adminUsers.description')}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onExport}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white bg-[#386641] hover:bg-[#2b4d32] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#386641]"
            >
              <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t('admin.export')}
            </button>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className={`-ml-1 mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t('adminUsers.refresh')}
            </button>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="relative flex">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyPress={handleKeyPress}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-l-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder={t('adminUsers.searchPlaceholder')}
              />
            </div>
            <button
              onClick={onSearch}
              className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {t('adminUsers.search')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

AdminUsersHeader.displayName = 'AdminUsersHeader';
export default React.memo(AdminUsersHeader);