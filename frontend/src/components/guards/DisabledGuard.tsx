'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'

interface DisabledGuardProps {
  children: React.ReactNode
  redirectTo?: string
}

export default function DisabledGuard({ children, redirectTo = '/auth' }: DisabledGuardProps) {
  const { data: session, status } = useSession()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (status === 'loading') return



    // Check if user is disabled
    if (session!.user.is_disabled) {
      const now = new Date()
      const disabledUntil = session!.user.disabled_until ? new Date(session!.user.disabled_until) : null

      // If permanently disabled or still within disabled period
      if (!disabledUntil || now < disabledUntil) {
        // Sign out and redirect to disabled page
        signOut({ callbackUrl: '/auth/disabled' })
        return
      }
    }

    setIsChecking(false)
  }, [session, status, redirectTo])

  // Show loading state while checking
  if (status === 'loading' || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-[#386641] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Đang kiểm tra trạng thái tài khoản...</p>
        </div>
      </div>
    )
  }

  // Show disabled message if user is disabled
  if (session?.user?.is_disabled) {
    const disabledUntil = session.user.disabled_until ? new Date(session.user.disabled_until) : null
    const now = new Date()

    if (!disabledUntil || now < disabledUntil) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="max-w-md p-8 bg-white rounded-lg shadow-lg border-l-4 border-red-500">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="ml-4 text-xl font-bold text-red-700">Tài khoản bị khóa</h2>
            </div>
            
            <div className="space-y-3">
              <p className="text-gray-700">
                Tài khoản của bạn đã bị tạm khóa và không thể truy cập hệ thống.
              </p>
              
              {session.user.disabled_reason && (
                <div className="p-3 bg-red-50 rounded-md">
                  <p className="text-sm text-red-800">
                    <strong>Lý do:</strong> {session.user.disabled_reason}
                  </p>
                </div>
              )}
              
              {disabledUntil && (
                <div className="p-3 bg-yellow-50 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <strong>Khóa đến:</strong> {disabledUntil.toLocaleDateString('vi-VN')} lúc {disabledUntil.toLocaleTimeString('vi-VN')}
                  </p>
                </div>
              )}
              
              <div className="pt-4 space-y-2">
                <button
                  onClick={() => signOut({ callbackUrl: '/auth' })}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Đăng xuất
                </button>
                
                <p className="text-xs text-gray-500 text-center">
                  Liên hệ admin nếu bạn cho rằng đây là lỗi
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}