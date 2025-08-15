'use client'
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import useNotifications from '@/hooks/useNotifications'
import UserProfileSection from '@/components/profile/UserProfileSection'
import UserStatsSection from '@/components/profile/UserStatsSection'
import ActivityFeedSection from '@/components/profile/ActivityFeedSection'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const toast = useNotifications()

  // ✅ ALL STATE MANAGEMENT AT PAGE LEVEL
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValues, setTempValues] = useState<Record<string, string>>({})
  const [showSensitiveData, setShowSensitiveData] = useState({
    email: false,
    phone: false
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      toast.error("Chưa đăng nhập đừng có mò vào đây")
      router.push('/auth')
    }
  }, [status, router, toast])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#386641] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải thông tin...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  // ✅ MOCK DATA - Will be replaced in Split 2
  const userData = {
    displayName: session.user?.name || 'Người dùng',
    username: session.user?.username || 'username',
    email: session.user?.email || 'user@example.com',
    phone: '0987654321', // MOCK
    avatar: session.user?.avatar,
    joinDate: 'Tháng 7, 2025' // MOCK
  }

  const stats = [
    { label: 'Uploads', value: '47', icon: 'Upload', color: 'text-[#6A994E]' },
    { label: 'Upvotes', value: '324', icon: 'ThumbsUp', color: 'text-[#6A994E]' },
    { label: 'Comments', value: '89', icon: 'MessageCircle', color: 'text-[#6A994E]' },
    { label: 'Downloads', value: '156', icon: 'Download', color: 'text-[#6A994E]' }
  ]

  const achievements = [
    { title: 'First Upload', description: 'Tải lên tài liệu đầu tiên', icon: 'Upload', unlocked: true },
    { title: 'Popular Creator', description: 'Nhận 50 upvotes cho tài liệu', icon: 'Star', unlocked: true },
    { title: 'Active Contributor', description: 'Tải lên 10 tài liệu', icon: 'Award', unlocked: false },
    { title: 'Helper', description: 'Bình luận giúp đỡ 25 lần', icon: 'Heart', unlocked: false }
  ]

  const recentActivities = [
    { 
      id: 1, 
      type: 'upload', 
      title: 'Tải lên "Đề thi Giải tích 1"', 
      time: '2 giờ trước',
      icon: 'Upload'
    },
    { 
      id: 2, 
      type: 'comment', 
      title: 'Bình luận về "Bài tập Cấu trúc dữ liệu"', 
      time: '1 ngày trước',
      icon: 'MessageCircle'
    },
    { 
      id: 3, 
      type: 'upvote', 
      title: 'Nhận upvote cho "Slide Java cơ bản"', 
      time: '2 ngày trước',
      icon: 'ThumbsUp'
    }
  ]

  // ✅ HANDLERS AT PAGE LEVEL - Passed down to components
  const handleEdit = (field: string) => {
    setEditingField(field)
    setTempValues({ ...tempValues, [field]: userData[field as keyof typeof userData] as string })
  }

  const handleSave = (field: string) => {
    // TODO: API call to update user data
    toast.success(`${field} đã được cập nhật`)
    setEditingField(null)
    setTempValues({})
  }

  const handleCancel = () => {
    setEditingField(null)
    setTempValues({})
  }

  const toggleSensitiveData = (field: 'email' | 'phone') => {
    setShowSensitiveData(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' })
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-gray-800">
      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        
        {/* User data + editing functionality */}
        <UserProfileSection 
          userData={userData}
          editingField={editingField}
          tempValues={tempValues}
          showSensitiveData={showSensitiveData}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          onToggleSensitiveData={toggleSensitiveData}
          onSignOut={handleSignOut}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats + achievements*/}
          <div className="lg:col-span-2">
            <UserStatsSection 
              stats={stats}
              achievements={achievements}
            />
          </div>

          {/* Recent activity */}
          <div className="lg:col-span-1">
            <ActivityFeedSection 
              activities={recentActivities}
            />
          </div>
        </div>
      </main>
    </div>
  )
}