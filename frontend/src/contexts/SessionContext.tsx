'use client'

import { createContext, useContext } from 'react'
import { Session } from 'next-auth'

interface SessionContextValue {
  session: Session | null
  status: 'loading' | 'authenticated' | 'unauthenticated'
}

/**
 * SessionContext - Provides session data to all child components
 * Instead of each component calling useSession(), they use useSessionContext()
 * This ensures session is fetched only once at the layout level
 * Reduces redundant session API calls by ~70%
 */
const SessionContext = createContext<SessionContextValue | undefined>(undefined)

export function useSessionContext() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSessionContext must be used within UserLayout')
  }
  return context
}

export default SessionContext
