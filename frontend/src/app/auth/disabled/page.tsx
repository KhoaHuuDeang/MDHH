'use client'

import { useSession } from 'next-auth/react'
import { signOut } from 'next-auth/react'
import { useEffect } from 'react'
import Link from 'next/link'

export default function DisabledPage() {
  const { data: session } = useSession()

  // Auto-redirect if user is not actually disabled
  useEffect(() => {
    if (session && !session.user?.is_disabled) {
      window.location.href = '/home'
    }
  }, [session])

  // If no session or user not disabled, show generic message
  if (!session?.user?.is_disabled) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Truy cập bị từ chối</h1>
          <p className="text-gray-600 mb-6">Bạn không có quyền truy cập trang này.</p>
          <Link
            href="/home"
            className="w-full bg-[#386641] text-white px-6 py-3 rounded-lg hover:bg-[#6A994E] transition-colors inline-block"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    )
  }

  const disabledUntil = session.user.disabled_until ? new Date(session.user.disabled_until) : null
  const now = new Date()
  const isPermanent = !disabledUntil
  const isExpired = disabledUntil && now >= disabledUntil

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-6 text-white">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Tài khoản bị khóa</h1>
                <p className="text-red-100">Quyền truy cập đã bị tạm ngừng</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8 space-y-6">
            {/* Main Message */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <p className="text-gray-700 text-lg">
                Tài khoản của bạn hiện đang bị khóa và không thể truy cập các chức năng của hệ thống.
              </p>
            </div>

            {/* Disable Details */}
            <div className="space-y-4">
              {/* Reason */}
              {session.user.disabled_reason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-red-800 mb-1">Lý do khóa tài khoản</h3>
                      <p className="text-red-700 text-sm">{session.user.disabled_reason}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Expiry Time */}
              {!isPermanent && (
                <div className={`border rounded-lg p-4 ${isExpired ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                  <div className="flex items-start">
                    <svg className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${isExpired ? 'text-green-400' : 'text-yellow-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className={`font-semibold mb-1 ${isExpired ? 'text-green-800' : 'text-yellow-800'}`}>
                        {isExpired ? 'Thời gian khóa đã hết' : 'Thời gian khóa'}
                      </h3>
                      <p className={`text-sm ${isExpired ? 'text-green-700' : 'text-yellow-700'}`}>
                        {isExpired ? 'Tài khoản đã được mở khóa.' : `Khóa đến: ${disabledUntil?.toLocaleDateString('vi-VN')} lúc ${disabledUntil?.toLocaleTimeString('vi-VN')}`}
                      </p>
                      {isExpired && (
                        <p className="text-green-600 text-xs mt-1">Vui lòng đăng nhập lại để tiếp tục sử dụng.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Permanent Disable */}
              {isPermanent && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Khóa vĩnh viễn</h3>
                      <p className="text-gray-600 text-sm">Tài khoản này đã bị khóa vĩnh viễn.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              {/* Sign Out Button */}
              <button
                onClick={() => signOut({ callbackUrl: '/auth' })}
                className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Đăng xuất
              </button>
              
              {/* Refresh if expired */}
              {isExpired && (
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-[#386641] text-white px-6 py-3 rounded-lg hover:bg-[#6A994E] transition-colors font-semibold"
                >
                  Làm mới trang
                </button>
              )}
              
              {/* Contact Support */}
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">Có thắc mắc về việc khóa tài khoản?</p>
                <Link
                  href="mailto:support@mdhh.com"
                  className="text-[#386641] hover:text-[#6A994E] text-sm font-medium transition-colors"
                >
                  Liên hệ bộ phận hỗ trợ →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            MDHH Platform © 2025 • Powered by Security System
          </p>
        </div>
      </div>
    </div>
  )
}