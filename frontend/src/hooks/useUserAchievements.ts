import { useState, useEffect, useCallback, useMemo } from 'react'
import { userService } from '@/services/userService'
import useUserStats from './useUserStats'
import useUserActivities from './useUserActivities'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  progress?: number
  target?: number
}

interface UseUserAchievementsReturn {
  achievements: Achievement[] | null
  isLoading: boolean
  error: string | null
  unlockedCount: number
}

export const useUserAchievements = (userId: string): UseUserAchievementsReturn => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { stats } = useUserStats(userId)
  const { activities } = useUserActivities(userId)

  // Compute achievements based on user stats and activities
  const achievements = useMemo(() => {
    if (!stats || !activities) return null

    const computedAchievements: Achievement[] = [
      {
        id: 'first-upload',
        title: 'First Upload',
        description: 'Tải lên tài liệu đầu tiên',
        icon: 'Upload',
        unlocked: stats.uploads >= 1,
        progress: Math.min(stats.uploads, 1),
        target: 1,
      },
      {
        id: 'popular-creator',
        title: 'Popular Creator',
        description: 'Nhận 50 upvotes cho tài liệu',
        icon: 'Star',
        unlocked: stats.upvotes >= 50,
        progress: Math.min(stats.upvotes, 50),
        target: 50,
      },
      {
        id: 'active-contributor',
        title: 'Active Contributor',
        description: 'Tải lên 10 tài liệu',
        icon: 'Award',
        unlocked: stats.uploads >= 10,
        progress: Math.min(stats.uploads, 10),
        target: 10,
      },
      {
        id: 'helper',
        title: 'Helper',
        description: 'Bình luận giúp đỡ 25 lần',
        icon: 'Heart',
        unlocked: stats.comments >= 25,
        progress: Math.min(stats.comments, 25),
        target: 25,
      },
      {
        id: 'download-hero',
        title: 'Download Hero',
        description: 'Tài liệu của bạn được tải 100 lần',
        icon: 'Download',
        unlocked: stats.downloads >= 100,
        progress: Math.min(stats.downloads, 100),
        target: 100,
      },
    ]

    return computedAchievements
  }, [stats, activities])

  useEffect(() => {
    if (stats && activities) {
      setIsLoading(false)
      setError(null)
    }
  }, [stats, activities])

  const unlockedCount = achievements
    ? achievements.filter((a) => a.unlocked).length
    : 0

  return {
    achievements,
    isLoading,
    error,
    unlockedCount,
  }
}

export default useUserAchievements
