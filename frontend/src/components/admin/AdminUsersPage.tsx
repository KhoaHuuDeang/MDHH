"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { exportToExcel } from '@/utils/exportToExcel';
import useNotifications from '@/hooks/useNotifications';
import AdminUsersHeader from './AdminUsersHeader';
import AdminUsersTable from './AdminUsersTable';
import AdminUsersPagination from './AdminUsersPagination';
import SpinnerLoading from '../layout/spinner';

function AdminUsersPage() {
  const { t } = useTranslation();
  const toast = useNotifications();
  const {
    users,
    pagination,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    goToPage,
    goNext,
    goPrevious,
    disableUser,
    enableUser,
    updateUserRole,
    refresh,
    performSearch
  } = useAdminUsers();

  const handleExport = () => {
    try {
      exportToExcel(users, 'users');
      toast.success(t('admin.exportSuccess'));
    } catch (error) {
      console.error('Export error:', error);
      toast.error(t('common.error'));
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{t('adminUsers.error')}</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={refresh}
                    className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                  >
                    {t('adminUsers.retry')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <AdminUsersHeader
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onRefresh={refresh}
            onSearch={performSearch}
            onExport={handleExport}
            isLoading={isLoading}
          />
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <SpinnerLoading/>
            </div>
          ) : (
            <>
              <AdminUsersTable
                users={users}
                isLoading={isLoading}
                onDisableUser={disableUser}
                onEnableUser={enableUser}
                onUpdateRole={updateUserRole}
              />
              
              <AdminUsersPagination
                pagination={pagination}
                onPageChange={goToPage}
                onNext={goNext}
                onPrevious={goPrevious}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default React.memo(AdminUsersPage);