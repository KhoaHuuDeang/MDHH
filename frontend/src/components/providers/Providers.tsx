'use client'
import { SessionProvider } from 'next-auth/react'
import { ToastContainer } from 'react-toastify'
import { ReactNode, useEffect, useState } from 'react'
import I18nProvider from '@/providers/I18nProvider'
import { tokenCache } from '@/utils/tokenCache'
import 'react-toastify/dist/ReactToastify.css'

interface ProvidersProps {
  children: ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Suppress hydration mismatch warnings from browser extensions
  useEffect(() => {
    const originalError = console.error
    console.error = (...args) => {
      if (
        args[0]?.includes?.('hydrated') ||
        args[0]?.includes?.('Hydration mismatch')
      ) {
        return
      }
      originalError(...args)
    }
    return () => {
      console.error = originalError
    }
  }, [])

  // Listen for session updates to keep token cache in sync
  useEffect(() => {
    const handleSessionUpdate = (event: StorageEvent) => {
      if (event.key === 'nextauth.session-token') {
        tokenCache.clearCache()
      }
    }

    window.addEventListener('storage', handleSessionUpdate)
    return () => window.removeEventListener('storage', handleSessionUpdate)
  }, [])

  if (!mounted) return null

  return (
    <SessionProvider
      refetchInterval={5 * 60}
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
    >
      <I18nProvider>
        <ToastContainer position="top-right" autoClose={3000} />
        {children}
      </I18nProvider>
    </SessionProvider>
  )
}
