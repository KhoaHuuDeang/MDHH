import { useState, useEffect, useCallback, useOptimistic, useTransition } from 'react'
import { userService } from '@/services/userService'
import useNotifications from '@/hooks/useNotifications'

interface UserProfile {
  id: string
  email: string
  username: string
  displayname: string
  birth?: string
  avatar?: string
  banner?: string  // background image field
  roles: {
    id: string
    name: string
  }
  created_at: string
  updated_at: string
}

interface UseUserProfileReturn {
  userData: UserProfile | null
  optimisticData: UserProfile | null
  isLoading: boolean
  error: string | null
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  refreshProfile: () => Promise<void>
}

type ProfileAction =
  | { type: 'UPDATE_FIELD', field: keyof UserProfile, value: any }
  | { type: 'UPDATE_AVATAR', url: string }
  | { type: 'UPDATE_BANNER', url: string }

export const useUserProfile = (userId: string): UseUserProfileReturn => {

  const [userData, setUserData] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const toast = useNotifications()



  // useOptimistic for instant UI updates
  const [optimisticData, updateOptimistic] = useOptimistic(
    userData,
    (state: UserProfile | null, action: ProfileAction) => {
      if (!state) return state
      switch (action.type) {
        case 'UPDATE_FIELD':
          return { ...state, [action.field]: action.value }
        case 'UPDATE_AVATAR':
          return { ...state, avatar: action.url }
        case 'UPDATE_BANNER':
          return { ...state, banner: action.url }
        default:
          return state
      }
    }
  )

  const [isPending, startTransition] = useTransition()

  const fetchUserProfile = useCallback(async () => {
    if (!userId) return

    try {
      setIsLoading(true)
      setError(null)
      const data = await userService.getUser(userId)
      setUserData(data)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user profile')
      toast.error('Không thể tải thông tin profile')
    } finally {
      setIsLoading(false)
    }
  }, [userId, toast])

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!userId || !userData) return
    if (updates.avatar) {
      //wrap in startTransition
      startTransition(() => {
        updateOptimistic({ type: 'UPDATE_AVATAR', url: updates.avatar! })
      })
    } else if (updates.banner) {
      startTransition(() => {
        updateOptimistic({ type: 'UPDATE_BANNER', url: updates.banner || 'logo.svg' })
      })
    } else {
      Object.entries(updates).forEach(([field, value]) => {
        startTransition(() => {
          updateOptimistic({
            type: 'UPDATE_FIELD',
            field: field as keyof UserProfile,
            value
          })
        })
      })
    }

    try {
      const updatedData = await userService.updateUser(userId, updates)
      console.log('tao sure 100% avatar ở trong đây ', updatedData.avatar)
      setUserData(updatedData)
      toast.success('Profile đã được cập nhật')
    } catch (err: any) {
      // Optimistic update will automatically revert on re-render
      setError(err.message || 'Failed to update profile')
      toast.error('Không thể cập nhật profile')
      // Force refresh to ensure consistency
      await fetchUserProfile()
    }
  }, [userId, userData, toast, fetchUserProfile, updateOptimistic])

  const refreshProfile = useCallback(async () => {
    await fetchUserProfile()
  }, [fetchUserProfile])

  useEffect(() => {
    fetchUserProfile()
  }, [fetchUserProfile])

  return {
    userData,
    optimisticData,
    isLoading,
    error,
    updateProfile,
    refreshProfile
  }
}

export default useUserProfile