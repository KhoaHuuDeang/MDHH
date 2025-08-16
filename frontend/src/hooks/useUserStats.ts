import { useState, useEffect, useCallback } from 'react'
import { userService } from '@/services/userService'
import useNotifications from '@/hooks/useNotifications'

interface UserStats {
  uploads: number
  upvotes: number
  comments: number
  downloads: number
}

interface UseUserStatsReturn {
  stats: UserStats | null
  isLoading: boolean
  error: string | null
  refreshStats: () => Promise<void>
}

export const useUserStats = (userId: string): UseUserStatsReturn => {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const toast = useNotifications()

  const fetchUserStats = useCallback(async () => {
    if (!userId) return

    try {
      setIsLoading(true)
      setError(null)
      const data = await userService.getUserStats(userId)
      setStats(data)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user stats')
      toast.error('Không thể tải thống kê người dùng')
    } finally {
      setIsLoading(false)
    }
  }, [userId, toast])

  const refreshStats = useCallback(async () => {
    await fetchUserStats()
  }, [fetchUserStats])

  useEffect(() => {
    fetchUserStats()
  }, [fetchUserStats])

  return {
    stats,
    isLoading,
    error,
    refreshStats
  }
}

export default useUserStats