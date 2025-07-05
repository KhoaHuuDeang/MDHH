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
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a2e1a] via-[#2d4a2d] to-[#0f1a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#6A994E] border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg">Đang tải thông tin...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  const stats = [
    { label: 'Uploads', value: '47', icon: 'Upload', color: 'text-[#6A994E]' },
    { label: 'Upvotes', value: '324', icon: 'ThumbsUp', color: 'text-[#C89B3C]' },
    { label: 'Comments', value: '89', icon: 'MessageCircle', color: 'text-[#3B82F6]' },
    { label: 'Downloads', value: '156', icon: 'Download', color: 'text-[#8B5CF6]' }
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
    <div className="min-h-screen bg-gradient-to-br from-[#1a2e1a] via-[#2d4a2d] to-[#0f1a0f] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Header Profile Section */}
        <div className="bg-gradient-to-r from-[#2d4a2d] to-[#1a3a1a] rounded-3xl p-8 border-2 border-[#386641]/30 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#386641]/5 to-transparent pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
              {/* Avatar */}
              <div className="relative group">
                <div className="h-32 w-32 rounded-full border-4 border-[#6A994E] shadow-lg hover:shadow-xl hover:shadow-[#386641]/50 transition-all duration-300 group-hover:scale-105 overflow-hidden">
                  {session.user?.avatar ? (
                    <Image
                      src={session.user.avatar}
                      alt="Profile"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#386641] to-[#6A994E] flex items-center justify-center text-white text-4xl font-bold">
                      {session.user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-[#6A994E] rounded-full border-4 border-[#1a2e1a] flex items-center justify-center">
                  {getIcon('CheckCircle', 16, 'text-white')}
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center lg:text-left">
                <div className="mb-4">
                  <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                    Tên người dùng
                  </h1>
                  <p className="text-[#6A994E] text-lg mb-2">Email người dùng</p>
                  <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-300">
                    {getIcon('MapPin', 16)}
                    <span>Việt Nam</span>
                    <span className="mx-2">•</span>
                    {getIcon('Calendar', 16)}
                    <span>Tham gia tháng 7, 2025</span>
                  </div>
                </div>

                {/* Level Progress IN PROGRESSING*/}
                {/* <div className="bg-[#1a2e1a]/50 rounded-xl p-4 border border-[#386641]/30">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-white font-semibold">Level 5 Learner</span>
                                        <span className="text-[#6A994E] text-sm">1,250 / 2,000 XP</span>
                                    </div>
                                    <div className="w-full bg-[#0f1a0f] rounded-full h-3 overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-[#386641] to-[#6A994E] rounded-full transition-all duration-1000 ease-out shadow-lg shadow-[#6A994E]/50" 
                                             style={{ width: '62.5%' }}></div>
                                    </div>
                                    <p className="text-gray-400 text-sm mt-2">750 XP to Level 6</p>
                                </div> */}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <button className="px-6 py-3 bg-gradient-to-r from-[#386641] to-[#6A994E] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-[#386641]/50 transition-all duration-300 hover:scale-105 flex items-center gap-2">
                  {getIcon('Edit', 18)}
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2"
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
            <div key={index} className="bg-gradient-to-br from-[#2d4a2d] to-[#1a3a1a] rounded-2xl p-6 border border-[#386641]/30 hover:border-[#6A994E]/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#386641]/25 group">
              <div className="flex items-center justify-between mb-4">
                <div className={`h-12 w-12 rounded-full bg-gradient-to-br from-[#386641]/20 to-[#6A994E]/20 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                  {getIcon(stat.icon, 24)}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Achievements */}
          <div className="lg:col-span-2 bg-gradient-to-br from-[#2d4a2d] to-[#1a3a1a] rounded-2xl p-6 border border-[#386641]/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#C89B3C] to-[#F0E6D2] flex items-center justify-center">
                {getIcon('Award', 20, 'text-[#1a2e1a]')}
              </div>
              <h2 className="text-2xl font-bold text-white">Thành tích</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <div key={index} className={`p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${achievement.unlocked
                  ? 'bg-gradient-to-br from-[#386641]/20 to-[#6A994E]/20 border-[#6A994E]/30 hover:border-[#6A994E]/50'
                  : 'bg-[#1a2e1a]/50 border-gray-600/30 hover:border-gray-500/50'
                  }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${achievement.unlocked
                      ? 'bg-[#6A994E] text-white'
                      : 'bg-gray-600 text-gray-400'
                      }`}>
                      {getIcon(achievement.icon, 16)}
                    </div>
                    <h3 className={`font-semibold ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}>
                      {achievement.title}
                    </h3>
                  </div>
                  <p className={`text-sm ${achievement.unlocked ? 'text-gray-300' : 'text-gray-500'}`}>
                    {achievement.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gradient-to-br from-[#2d4a2d] to-[#1a3a1a] rounded-2xl p-6 border border-[#386641]/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] flex items-center justify-center">
                {getIcon('Activity', 20, 'text-white')}
              </div>
              <h2 className="text-2xl font-bold text-white">Hoạt động gần đây</h2>
            </div>
            <div className="space-y-4">
              {[
                { action: 'Tải lên "Bài tập Toán cao cấp A1"', time: '2 giờ trước', icon: 'Upload', color: 'text-[#6A994E]' },
                { action: 'Truy cập folder "Lập trình Python"', time: '5 giờ trước', icon: 'Folder', color: 'text-[#F59E0B]' },
                { action: 'Tải về "Đề thi Vật lý đại cương"', time: '1 ngày trước', icon: 'Download', color: 'text-[#8B5CF6]' },
                { action: 'Bình luận trong "Tài liệu KTLT"', time: '2 ngày trước', icon: 'MessageCircle', color: 'text-[#3B82F6]' },
                { action: 'Truy cập "Môn Tiếng Anh chuyên ngành"', time: '3 ngày trước', icon: 'BookOpen', color: 'text-[#10B981]' },
                { action: 'Upvote "Giáo trình Cơ sở dữ liệu"', time: '1 tuần trước', icon: 'ThumbsUp', color: 'text-[#C89B3C]' },
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#1a2e1a]/50 transition-colors duration-300">
                  <div className={`${activity.color} mt-1`}>
                    {getIcon(activity.icon, 16)}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{activity.action}</p>
                    <p className="text-gray-400 text-xs">{activity.time}</p>
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