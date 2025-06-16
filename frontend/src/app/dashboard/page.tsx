'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useNotifications from '@/hooks/useNotifications'
export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { success } = useNotifications()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-black">Profile</h1>
            <button
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Info Card */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-black">User Information</h3>
              <div className="space-y-2 text-black">
                <p><strong>ID:</strong> {session.user.id}</p>
                <p><strong>Name:</strong> {session.user.name}</p>
                <p><strong>Email:</strong> {session.user.email}</p>
                <p><strong>Username:</strong> {session.user.username}</p>
                <p><strong>Role:</strong>
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${session.user.role === 'admin'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                    }`}>
                    {session.user.role}
                  </span>
                </p>
              </div>
            </div>

            {/* Session Info Card */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-black">Session Details</h3>
              <div className="space-y-2 text-black">
                <p><strong>Access Token:</strong>
                  <span className="text-xs bg-gray-100 p-1 rounded ml-2">
                    {session.accessToken ? '✅ Present' : '❌ Missing'}
                  </span>
                </p>
                <p><strong>Session Strategy:</strong> JWT</p>
                <p><strong>Provider:</strong> Credentials</p>
              </div>
            </div>

            {/* Role-based Actions */}
            {session.user.role === 'admin' && (
              <div className="bg-yellow-50 p-4 rounded-lg md:col-span-2">
                <h3 className="text-lg font-semibold mb-3">Admin Actions</h3>
                <div className="flex space-x-4">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Manage Users
                  </button>
                  <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    System Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
