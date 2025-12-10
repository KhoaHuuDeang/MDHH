// app/dashboard/ClientDashboard.tsx
"use client";

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminService } from '@/services/adminService.csr';

export default function ClientDashboard() {
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getAnalytics()
      .then(data => {
        if (data && data.result) {
          setAnalytics(data.result);
        } else if (data) {
          setAnalytics(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load analytics:', err);
        setLoading(false);
        setAnalytics(null);
      });
  }, []);

  if (loading) return <div className="p-8">{t('common.loading')}</div>;
  if (!analytics) return <div className="p-8">{t('admin.error')}</div>;

  return (
    <div className="flex-1 p-4 sm:p-8">
      <h1 className="text-3xl font-bold mb-8">{t('admin.dashboard')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">{t('admin.totalUsers')}</h3>
          <p className="text-3xl font-bold">{analytics.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">{t('upload.title')}</h3>
          <p className="text-3xl font-bold">{analytics.totalUploads}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">{t('admin.comments')}</h3>
          <p className="text-3xl font-bold">{analytics.totalComments}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">{t('admin.folders')}</h3>
          <p className="text-3xl font-bold">{analytics.totalFolders}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">{t('admin.activeUsers')} (30d)</h3>
          <p className="text-2xl">{analytics.activeUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">{t('admin.disabledUsers')}</h3>
          <p className="text-2xl">{analytics.disabledUsers}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-xl font-semibold mb-4">{t('admin.recentActivity')} (7 days)</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-gray-500">{t('stats.uploads')}</p>
            <p className="text-2xl font-bold">{analytics.recentActivity.newUsers}</p>
          </div>
          <div>
            <p className="text-gray-500">{t('upload.title')}</p>
            <p className="text-2xl font-bold">{analytics.recentActivity.newUploads}</p>
          </div>
          <div>
            <p className="text-gray-500">{t('admin.comments')}</p>
            <p className="text-2xl font-bold">{analytics.recentActivity.newComments}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">{t('admin.users')} by {t('admin.role')}</h3>
        <div className="space-y-2">
          {analytics.usersByRole.map((role: any) => (
            <div key={role.role} className="flex justify-between">
              <span>{role.role}</span>
              <span className="font-bold">{role.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}