import React from 'react'
import { getIcon } from '@/utils/getIcon'

interface Activity {
  id: string | number
  type: string
  title: string
  time: string
  icon: string
}

interface ActivityFeedSectionProps {
  activities: Activity[]
  isLoading?: boolean
}

const ActivityFeedSection: React.FC<ActivityFeedSectionProps> = ({
  activities,
  isLoading = false
}) => {
  
  // ✅ UTILITY FUNCTIONS - Specific to activity rendering
  const getActivityColor = (type: string) => {
    const colors = {
      upload: 'bg-blue-100 text-blue-600 border-blue-200',
      comment: 'bg-green-100 text-green-600 border-green-200',
      upvote: 'bg-purple-100 text-purple-600 border-purple-200',
      download: 'bg-orange-100 text-orange-600 border-orange-200',
      default: 'bg-gray-100 text-gray-600 border-gray-200'
    }
    return colors[type as keyof typeof colors] || colors.default
  }

  const getActivityIconColor = (type: string) => {
    const colors = {
      upload: 'text-blue-600',
      comment: 'text-green-600',
      upvote: 'text-purple-600',
      download: 'text-orange-600',
      default: 'text-gray-600'
    }
    return colors[type as keyof typeof colors] || colors.default
  }

  return (
    <section className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 h-fit">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
          {getIcon('Activity', 20, 'text-white')}
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Hoạt động gần đây</h2>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-4">
        {isLoading ? (
          /* Loading skeleton */
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4 p-3 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          activities.map((activity, index) => (
            <div key={activity.id} className="relative">
              {/* Timeline line */}
              {index < activities.length - 1 && (
                <div className="absolute left-6 top-12 w-px h-8 bg-gray-200"></div>
              )}
              
              <div className="flex items-start gap-4 group hover:bg-gray-50 p-3 rounded-lg transition-colors">
                {/* Activity Icon */}
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.type)}`}>
                  {getIcon(activity.icon, 18, getActivityIconColor(activity.type))}
                </div>
                
                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 text-sm font-medium group-hover:text-gray-700">
                    {activity.title}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {activity.time}
                  </p>
                </div>

                {/* Action Button */}
                <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-all">
                  {getIcon('ExternalLink', 16)}
                </button>
              </div>
            </div>
          ))
        ) : (
          /* Empty State */
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {getIcon('Activity', 24, 'text-gray-400')}
            </div>
            <p className="text-gray-500 text-sm">Chưa có hoạt động nào</p>
          </div>
        )}
      </div>

      {/* View More Button */}
      {activities.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={() => window.location.href = '/activities'}
            className="w-full text-center text-[#6A994E] hover:text-[#386641] font-medium text-sm py-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Xem tất cả hoạt động
            {getIcon('ChevronRight', 16, 'inline ml-1')}
          </button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-lg font-bold text-gray-900">24h</div>
            <div className="text-xs text-gray-500">Hoạt động gần nhất</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-lg font-bold text-gray-900">{activities.length}</div>
            <div className="text-xs text-gray-500">Hoạt động tuần này</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ActivityFeedSection