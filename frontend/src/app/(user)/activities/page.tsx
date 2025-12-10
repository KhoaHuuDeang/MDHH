'use client';

import { useSessionContext } from '@/contexts/SessionContext';
import { useTranslation } from 'react-i18next';
import useUserActivities from '@/hooks/useUserActivities';
import { getIcon } from '@/utils/getIcon';

export default function ActivitiesPage() {
  const { session } = useSessionContext();
  const { t } = useTranslation();
  const { activities, isLoading, pagination, fetchMore } = useUserActivities(session!.user.id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">{t('stats.recentActivity')}</h1>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{t('stats.recentActivity')}</h1>

        {!activities || activities.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center text-gray-500">
            <p>{t('stats.noActivity')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => {
              const iconName = activity.type === 'UPLOAD_SUCCESS' ? 'Upload' : activity.type === 'UPVOTE' ? 'ThumbsUp' : 'MessageCircle';
              const Icon = getIcon(iconName);

              return (
                <div key={activity.id} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-gray-400">
                      {Icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.message || activity.type}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.created_at).toLocaleDateString()} {new Date(activity.created_at).toLocaleTimeString()}
                      </p>
                      {activity.actor && (
                        <p className="text-xs text-gray-600 mt-1">
                          {t('home.by')} {activity.actor.displayname}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => fetchMore(page)}
                className={`px-3 py-1 rounded text-sm ${
                  pagination.page === page
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
