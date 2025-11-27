import { useState, useEffect, useCallback } from 'react'
import { csrAxiosClient } from '@/utils/axiosClient'
import useNotifications from '@/hooks/useNotifications'

interface Activity {
  id: string
  user_id: string
  actor_id?: string
  type: 'COMMENT' | 'UPVOTE' | 'DOWNVOTE' | 'APPROVED' | 'DECLINED' | 'UPLOAD_SUCCESS' | 'UPLOAD_FAILED'
  entity_type?: string
  entity_id?: string
  message?: string
  is_read: boolean
  created_at: string
  actor?: {
    id: string
    displayname: string
    username: string
    avatar?: string
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface UseUserActivitiesReturn {
  activities: Activity[] | null
  isLoading: boolean
  error: string | null
  pagination: Pagination | null
  refreshActivities: () => Promise<void>
  fetchMore: (page: number) => Promise<void>
}

export const useUserActivities = (userId: string): UseUserActivitiesReturn => {
  const [activities, setActivities] = useState<Activity[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const toast = useNotifications()

  const fetchUserActivities = useCallback(async (page: number = 1) => {
    if (!userId) return

    try {
      setIsLoading(true)
      setError(null)
      const response = await csrAxiosClient.get(`/logs/user/activities`, {
        params: { page, limit: 20 }
      })

      setActivities(response.data.result.activities)
      setPagination(response.data.result.pagination)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch activities')
      toast.error('Không thể tải hoạt động')
    } finally {
      setIsLoading(false)
    }
  }, [userId, toast])

  const refreshActivities = useCallback(async () => {
    await fetchUserActivities(1)
  }, [fetchUserActivities])

  const fetchMore = useCallback(async (page: number) => {
    await fetchUserActivities(page)
  }, [fetchUserActivities])

  useEffect(() => {
    fetchUserActivities(1)
  }, [fetchUserActivities])

  return {
    activities,
    isLoading,
    error,
    pagination,
    refreshActivities,
    fetchMore
  }
}

export default useUserActivities
