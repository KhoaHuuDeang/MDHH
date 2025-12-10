'use client'

import { useSession } from 'next-auth/react'
import { useTranslation } from 'react-i18next'
import useUserAchievements from '@/hooks/useUserAchievements'
import { getIcon } from '@/utils/getIcon'

export default function AchievementsPage() {
  const { data: session } = useSession()
  const { t } = useTranslation()
  const { achievements, isLoading, unlockedCount } = useUserAchievements(session!.user.id)

  if (isLoading || !achievements) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">{t('profile.achievements')}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('profile.achievements')}</h1>
          <p className="text-gray-600">
            {t('stats.progressBadge')}: {unlockedCount}/{achievements.length} {t('common.approved')}
          </p>
          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#6A994E] transition-all"
              style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`rounded-lg p-6 border-2 transition-all ${
                achievement.unlocked
                  ? 'bg-white border-[#6A994E] shadow-md'
                  : 'bg-gray-100 border-gray-300'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                  achievement.unlocked ? 'bg-[#6A994E]' : 'bg-gray-300'
                }`}
              >
                {getIcon(achievement.icon, 24, achievement.unlocked ? 'text-white' : 'text-gray-500')}
              </div>

              <h3
                className={`text-lg font-bold mb-2 ${
                  achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                {achievement.title}
              </h3>

              <p
                className={`text-sm mb-4 ${
                  achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
                }`}
              >
                {achievement.description}
              </p>

              {achievement.progress !== undefined && achievement.target !== undefined && (
                <div className="text-xs text-gray-500">
                  {t('stats.progressBadge')}: {achievement.progress}/{achievement.target}
                </div>
              )}

              {achievement.unlocked && (
                <div className="mt-3 text-xs text-[#6A994E] font-medium">✓ {t('common.approved')}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
