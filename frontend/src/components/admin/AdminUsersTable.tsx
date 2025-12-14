import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminUserItem, DisableUserOptions } from '@/types/admin.types';
import { DisableUserModal } from './DisableUserModal';
import { EnableUserModal } from './EnableUserModal';

interface AdminUsersTableProps {
  users: AdminUserItem[];
  isLoading: boolean;
  onDisableUser: (userId: string, options: DisableUserOptions) => Promise<void>;
  onEnableUser: (userId: string) => Promise<void>;
  onUpdateRole: (userId: string, role: 'USER' | 'ADMIN') => Promise<void>;
}

function AdminUsersTable({
  users,
  isLoading,
  onDisableUser,
  onEnableUser,
  onUpdateRole
}: AdminUsersTableProps) {
  const { t } = useTranslation();
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showEnableModal, setShowEnableModal] = useState(false);

  const handleDisableUser = (user: AdminUserItem) => {
    setSelectedUser(user);
    setShowDisableModal(true);
  };

  const handleEnableUser = (user: AdminUserItem) => {
    setSelectedUser(user);
    setShowEnableModal(true);
  };

  const handleDisableConfirm = async (options: DisableUserOptions) => {
    if (!selectedUser) return;
    
    try {
      await onDisableUser(selectedUser.id, options);
      setShowDisableModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to disable user:', error);
      // Error handling is done in the hook
    }
  };

  const handleEnableConfirm = async () => {
    if (!selectedUser) return;
    
    try {
      await onEnableUser(selectedUser.id);
      setShowEnableModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to enable user:', error);
      // Error handling is done in the hook
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (user: AdminUserItem) => {
    if (!user.is_disabled) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {t('adminUsers.status.active')}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        {t('adminUsers.status.disabled')}
      </span>
    );
  };

  if (users.length === 0 && !isLoading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t('adminUsers.noUsersFound')}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {t('adminUsers.adjustSearch')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Providers
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.displayname || user.username}
                      </div>
                      <div className="text-sm text-gray-500">@{user.username}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role_name}
                      onChange={(e) => onUpdateRole(user.id, e.target.value as 'USER' | 'ADMIN')}
                      className="text-xs font-medium px-2.5 py-1 rounded border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      {getStatusBadge(user)}
                      {user.is_disabled && user.disabled_reason && (
                        <div className="text-xs text-gray-500" title={user.disabled_reason}>
                          {user.disabled_reason.length > 30 
                            ? `${user.disabled_reason.substring(0, 30)}...`
                            : user.disabled_reason
                          }
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-1">
                      {user.providers.map((provider) => (
                        <span
                          key={provider}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {provider}
                        </span>
                      ))}
                      {user.providers.length === 0 && (
                        <span className="text-xs text-gray-400">Local</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {user.is_disabled ? (
                      <button
                        onClick={() => handleEnableUser(user)}
                        className="text-green-600 hover:text-green-900 font-medium"
                      >
                        Enable
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDisableUser(user)}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        Disable
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {selectedUser && (
        <>
          <DisableUserModal
            isOpen={showDisableModal}
            user={selectedUser}
            onClose={() => {
              setShowDisableModal(false);
              setSelectedUser(null);
            }}
            onConfirm={handleDisableConfirm}
          />
          
          <EnableUserModal
            isOpen={showEnableModal}
            user={selectedUser}
            onClose={() => {
              setShowEnableModal(false);
              setSelectedUser(null);
            }}
            onConfirm={handleEnableConfirm}
          />
        </>
      )}
    </>
  );
}

AdminUsersTable.displayName = 'AdminUsersTable';
export default React.memo(AdminUsersTable);