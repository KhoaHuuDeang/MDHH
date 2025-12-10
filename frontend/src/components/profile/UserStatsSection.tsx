import React from 'react'
import { getIcon } from '@/utils/getIcon'
import useUserStats from '@/hooks/useUserStats'
import useUserAchievements from '@/hooks/useUserAchievements'

interface Achievement {
  title: string
  description: string
  icon: string
  unlocked: boolean
}

interface UserStatsSectionProps {
  userId: string
}

function UserStatsSection({ userId }: UserStatsSectionProps) {
  const { stats, isLoading } = useUserStats(userId);
  const { achievements: realAchievements, isLoading: achievementsLoading } = useUserAchievements(userId);

  // Transform real achievements to match component interface
  const achievements: Achievement[] = realAchievements
    ? realAchievements.map((a) => ({
        title: a.title,
        description: a.description,
        icon: a.icon,
        unlocked: a.unlocked,
      }))
    : [];

  // Transform real stats data to display format
  const statsDisplay = stats ? [
    { label: "Uploads", value: stats.uploads.toString(), icon: "Upload", color: "text-[#6A994E]" },
    { label: "Upvotes", value: stats.upvotes.toString(), icon: "ThumbsUp", color: "text-[#6A994E]" },
    { label: "Comments", value: stats.comments.toString(), icon: "MessageCircle", color: "text-[#6A994E]" },
    { label: "Downloads", value: stats.downloads.toString(), icon: "Download", color: "text-[#6A994E]" },
  ] : [];

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <section className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gray-200 rounded-lg" />
              <div className="h-6 bg-gray-200 rounded w-48" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full" />
                    <div>
                      <div className="h-6 bg-gray-200 rounded w-12 mb-1" />
                      <div className="h-4 bg-gray-100 rounded w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      
      {/* Statistics Cards */}
      <section className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#6A994E] rounded-lg flex items-center justify-center">
            {getIcon('BarChart3', 20, 'text-white')}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Thống kê hoạt động</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {statsDisplay.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-4 border hover:bg-gray-100 group-hover:bg-[#386641] text-[#6A994E] group-hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full flex items-center justify-center bg-gray-100 group-hover:bg-[#386641] text-[#6A994E] group-hover:text-white transition-all">
                  {getIcon(stat.icon, 24)}
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 group-hover:text-black transition-colors">{stat.value}</div>
                  <div className="text-gray-500 text-sm group-hover:text-black transition-colors">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Achievements Section */}
      <section className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
            {getIcon('Trophy', 20, 'text-white')}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Thành tích</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                achievement.unlocked
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 hover:shadow-md'
                  : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    achievement.unlocked
                      ? 'bg-yellow-400 text-white shadow-md'
                      : 'bg-gray-300 text-gray-500'
                  }`}
                >
                  {getIcon(achievement.icon, 20)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-bold ${achievement.unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                      {achievement.title}
                    </h3>
                    {achievement.unlocked && (
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        {getIcon('Check', 12, 'text-white')}
                      </div>
                    )}
                  </div>
                  <p className={`text-sm ${achievement.unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                    {achievement.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Achievement Progress */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Tiến độ thành tích</span>
            <span className="text-sm text-gray-500">
              {achievements.filter(a => a.unlocked).length}/{achievements.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${(achievements.filter(a => a.unlocked).length / achievements.length) * 100}%`
              }}
            ></div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default UserStatsSection