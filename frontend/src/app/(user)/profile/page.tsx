'use client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import useNotifications from '@/hooks/useNotifications'
import * as LucideIcons from 'lucide-react'
import { LucideIcon } from 'lucide-react'

import Image from 'next/image'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const toast = useNotifications()
  const getIcon = (iconName: string, size = 20, className?: string) => {
    const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as LucideIcon
    return IconComponent ? <IconComponent size={size} className={className} /> : null
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      toast.error("Chưa đăng nhập đừng có mò vào đây")
      router.push('/auth/signin')
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

  const stats = [
    { label: 'Uploads', value: '47', icon: 'Upload', color: 'text-[#6A994E]' },
    { label: 'Upvotes', value: '324', icon: 'ThumbsUp', color: 'text-[#6A994E]' },
    { label: 'Comments', value: '89', icon: 'MessageCircle', color: 'text-[#6A994E]' },
    { label: 'Downloads', value: '156', icon: 'Download', color: 'text-[#6A994E]' }
  ]

  const achievements = [
    { title: 'First Upload', description: 'Tải lên tài liệu đầu tiên', icon: 'Upload', unlocked: true },
    { title: 'Popular Creator', description: 'Nhận 50 upvotes cho tài liệu', icon: 'Star', unlocked: true },
    { title: 'Active Contributor', description: 'Tải lên 20 tài liệu', icon: 'FileText', unlocked: false },
    { title: 'Community Helper', description: 'Nhận 100 upvotes tổng cộng', icon: 'Heart', unlocked: false },
    { title: 'Knowledge Sharer', description: 'Tài liệu được tải về 500 lần', icon: 'Share2', unlocked: false },
    { title: 'Expert Reviewer', description: 'Viết 50 bình luận hữu ích', icon: 'MessageSquare', unlocked: false },
  ]

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Header Profile Section */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-8 border border-gray-200 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-transparent pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
              {/* Avatar */}
              <div className="relative group">
                <div className="h-32 w-32 rounded-full border-4 border-gray-300 shadow-lg hover:shadow-xl hover:shadow-gray-300/50 transition-all duration-100 group-hover:scale-105 overflow-hidden">
                  {session.user?.avatar ? (
                    <Image
                      src={session.user.avatar}
                      alt="Profile"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-4xl font-bold">
                      {session.user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-[#386641] rounded-full border-4 border-white flex items-center justify-center">
                  {getIcon('CheckCircle', 16, 'text-white')}
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center lg:text-left">
                <div className="mb-4">
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                    {session.user?.name || 'Tên người dùng'}
                  </h1>
                  <p className="text-gray-600 text-lg mb-2">{session.user?.email || 'Email người dùng'}</p>
                  <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-500">
                    {getIcon('MapPin', 16)}
                    <span>Việt Nam</span>
                    <span className="mx-2">•</span>
                    {getIcon('Calendar', 16)}
                    <span>Tham gia tháng 7, 2025</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <button className="px-6 py-3 bg-[#6A994E] hover:bg-[#386641] text-white rounded-xl font-semibold transition-all duration-100 cursor-pointer hover:scale-105 shadow-md hover:shadow-lg flex items-center gap-2">
                  {getIcon('Edit', 18)}
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                  className="px-6 py-3 bg-[#BC4749]  text-white rounded-xl font-semibold transition-all duration-100 cursor-pointer hover:scale-105 shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  {getIcon('LogOut', 18)}
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className=" bg-white border-gray-100 rounded-2xl p-6 border hover:border-green-300 hover:bg-green-50 transition-all duration-200 hover:scale-105 hover:shadow-lg group"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`
            h-12 w-12 rounded-full flex items-center justify-center
            bg-gray-100
            group-hover:bg-[#386641]
            group-hover:text-white
            transition-all duration-200
            text-[#6A994E]
          `}
                >
                  {getIcon(stat.icon, 24, "transition-all duration-200")}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-gray-500 text-sm ">
                    {stat.label}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Achievements */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                {getIcon('Award', 20, 'text-amber-600')}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Thành tích</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <div key={index} className={`p-4 rounded-xl border transition-all duration-100 hover:scale-105 ${achievement.unlocked
                  ? 'bg-green-50 border-green-200 hover:border-green-300'
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${achievement.unlocked
                      ? 'bg-[#386641] text-white'
                      : 'bg-gray-300 text-gray-500'
                      }`}>
                      {getIcon(achievement.icon, 16)}
                    </div>
                    <h3 className={`font-semibold ${achievement.unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                      {achievement.title}
                    </h3>
                  </div>
                  <p className={`text-sm ${achievement.unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                    {achievement.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                {getIcon('Activity', 20, 'text-blue-600')}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Hoạt động gần đây</h2>
            </div>
            <div className="space-y-4">
              {/* mốt tách ra mảng riêng sài chung với homePage */}
              {[
                { action: 'Tải lên "Bài tập Toán cao cấp A1"', time: '2 giờ trước', icon: 'Upload', color: 'text-slate-600' },
                { action: 'Truy cập folder "Lập trình Python"', time: '5 giờ trước', icon: 'Folder', color: 'text-slate-600' },
                { action: 'Tải về "Đề thi Vật lý đại cương"', time: '1 ngày trước', icon: 'Download', color: 'text-slate-600' },
                { action: 'Bình luận trong "Tài liệu KTLT"', time: '2 ngày trước', icon: 'MessageCircle', color: 'text-slate-600' },
                { action: 'Truy cập "Môn Tiếng Anh chuyên ngành"', time: '3 ngày trước', icon: 'BookOpen', color: 'text-slate-600' },
                { action: 'Upvote "Giáo trình Cơ sở dữ liệu"', time: '1 tuần trước', icon: 'ThumbsUp', color: 'text-slate-600' },
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-300">
                  <div className={`${activity.color} mt-1`}>
                    {getIcon(activity.icon, 16)}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 text-sm font-medium">{activity.action}</p>
                    <p className="text-gray-500 text-xs">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}