import { useState, useEffect, useCallback } from 'react'
import { csrAxiosClient } from '@/utils/axiosClient'

interface UseNotificationBadgeReturn {
  unreadCount: number | null
  isLoading: boolean
  error: string | null
  refreshCount: () => Promise<void>
}

export const useNotificationBadge = (): UseNotificationBadgeReturn => {
  const [unreadCount, setUnreadCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUnreadCount = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await csrAxiosClient.get('/logs/unread-count')
      setUnreadCount(response.data.result.unreadCount)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch unread count')
      setUnreadCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshCount = useCallback(async () => {
    await fetchUnreadCount()
  }, [fetchUnreadCount])

  useEffect(() => {
    fetchUnreadCount()

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  return {
    unreadCount,
    isLoading,
    error,
    refreshCount
  }
}

export default useNotificationBadge
