import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface User {
  id: string
  email: string
  username: string
  displayname: string
  role: string
  birth?: string
  accessToken: string
}

interface UserState {
  user: User | null
  users: User[]
  loading: boolean
  error: string | null
  
  // Actions
  setUser: (user: User | null) => void
  setUsers: (users: User[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  
  // Role-based access
  isAdmin: () => boolean
  isUser: () => boolean
  hasRole: (role: string) => boolean
}

export const useUserStore = create<UserState>()(
  devtools(
    (set, get) => ({
      user: null,
      users: [],
      loading: false,
      error: null,

      setUser: (user) => set({ user }, false, 'setUser'),
      setUsers: (users) => set({ users }, false, 'setUsers'),
      setLoading: (loading) => set({ loading }, false, 'setLoading'),
      setError: (error) => set({ error }, false, 'setError'),
      clearError: () => set({ error: null }, false, 'clearError'),

      // Role helpers
      isAdmin: () => get().user?.role === 'admin',
      isUser: () => get().user?.role === 'user',
      hasRole: (role) => get().user?.role === role,
    }),
    { name: 'user-store' }
  )
)
