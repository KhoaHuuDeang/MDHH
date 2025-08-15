'use client'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import useNotifications from '@/hooks/useNotifications'
import Image from 'next/image'
import { getIcon } from '@/utils/getIcon'
export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const toast = useNotifications()

  // States for editing
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

  // User data with fallbacks
  const userData = {
    displayName: session.user?.name || 'Người dùng',
    username: session.user?.username || 'username',
    email: session.user?.email || 'user@example.com',
    phone: '0987654321', // This would come from session or API
    avatar: session.user?.avatar,
    joinDate: 'Tháng 7, 2025'
  }

  const maskEmail = (email: string) => {
    const [local, domain] = email.split('@')
    return `${'*'.repeat(local.length)}@${domain}`
  }

  const maskPhone = (phone: string) => {
    return `${'*'.repeat(phone.length - 4)}${phone.slice(-4)}`
  }

  const handleEdit = (field: string) => {
    setEditingField(field)
    setTempValues({ ...tempValues, [field]: userData[field as keyof typeof userData] as string })
  }

  const handleSave = (field: string) => {
    // Here you would typically make an API call to update the user data
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
    <div className="min-h-screen bg-white py-8 px-4">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 space-y-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-8 border border-gray-200 shadow-lg relative overflow-hidden">

        {/* Discord-style Profile Header */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200">
          <div className="relative">
            {/* Banner */}
            <div
              className="h-32 sm:h-40 bg-gradient-to-r from-[#6A994E] to-[#386641] bg-cover bg-center"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80')"
              }}
            />

            {/* Avatar and Logout Button */}
            <div className="px-4 sm:px-6">
              <div className="relative flex flex-col sm:flex-row sm:justify-between sm:items-end w-full -mt-12 sm:-mt-16">
                <div className="relative mb-4 sm:mb-0">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white overflow-hidden shadow-lg">
                    {userData.avatar ? (
                      <Image
                        src={userData.avatar}
                        alt="Profile"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#6A994E] to-[#386641] flex items-center justify-center text-white text-2xl sm:text-3xl font-bold">
                        {userData.displayName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-1 right-1 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 border-4 border-white rounded-full"></div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl text-2xl sm:text-base font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 w-full sm:w-auto"
                >
                  {getIcon('LogOut', 20)}
                  <span>Đăng xuất</span>
                </button>
              </div>

              {/* User Name and Badges */}
              <div className="mt-4 pb-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <h1 className="text-gray-900 text-2xl sm:text-3xl font-bold">{userData.displayName}</h1>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#6A994E] rounded-lg flex items-center justify-center shadow-md">
                      {getIcon('Star', 16, 'text-white')}
                    </div>
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-md">
                      {getIcon('Shield', 16, 'text-white')}
                    </div>
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center shadow-md">
                      {getIcon('Crown', 16, 'text-white')}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mt-2">Thành viên từ {userData.joinDate}</p>
              </div>
            </div>
          </div>

          {/* User Info Card */}
          <div className="bg-gray-50 mx-4 sm:mx-6 mb-6 p-4 sm:p-6 rounded-xl border border-gray-200">
            <div className="space-y-6">

              {/* Display Name */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="flex-grow">
                  <h2 className="text-lg font-bold uppercase text-gray-500 mb-2">Tên hiển thị</h2>
                  {editingField === 'displayName' ? (
                    <input
                      type="text"
                      value={tempValues.displayName || ''}
                      onChange={(e) => setTempValues({ ...tempValues, displayName: e.target.value })}
                      className="w-full bg-white border-2 border-blue-500 rounded-lg px-4 py-2 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                  ) : (
                    <span className="text-gray-900 text-base font-medium">{userData.displayName}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {editingField === 'displayName' && (
                    <button
                      onClick={handleCancel}
                      className="text-gray-600 hover:text-gray-800 text-2xl font-medium hover:underline transition-colors duration-200"
                    >
                      Hủy
                    </button>
                  )}
                  <button
                    onClick={() => editingField === 'displayName' ? handleSave('displayName') : handleEdit('displayName')}
                    className="bg-gray-600 cursor-pointer hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    {editingField === 'displayName' ? 'Lưu' : 'Sửa'}
                  </button>
                </div>
              </div>

              <div className="border-b border-gray-300"></div>

              {/* Username */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="flex-grow">
                  <h2 className="text-lg font-bold uppercase text-gray-500 mb-2">Tên người dùng</h2>
                  {editingField === 'username' ? (
                    <input
                      type="text"
                      value={tempValues.username || ''}
                      onChange={(e) => setTempValues({ ...tempValues, username: e.target.value })}
                      className="w-full bg-white border-2 border-blue-500 rounded-lg px-4 py-2 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                  ) : (
                    <span className="text-gray-900 text-base font-medium">{userData.username}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {editingField === 'username' && (
                    <button
                      onClick={handleCancel}
                      className="text-gray-600 hover:text-gray-800 text-lg font-medium hover:underline transition-colors duration-200"
                    >
                      Hủy
                    </button>
                  )}
                  <button
                    onClick={() => editingField === 'username' ? handleSave('username') : handleEdit('username')}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 cursor-pointer"
                  >
                    {editingField === 'username' ? 'Lưu' : 'Sửa'}
                  </button>
                </div>
              </div>

              <div className="border-b border-gray-300"></div>

              {/* Email */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="flex-grow">
                  <h2 className="text-lg font-bold uppercase text-gray-500 mb-2">Email</h2>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    {editingField === 'email' ? (
                      <input
                        type="email"
                        value={tempValues.email || ''}
                        onChange={(e) => setTempValues({ ...tempValues, email: e.target.value })}
                        className="w-full bg-white border-2 border-blue-500 rounded-lg px-4 py-2 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                      />
                    ) : (
                      <>
                        <span className="text-gray-900 text-base font-medium">
                          {showSensitiveData.email ? userData.email : maskEmail(userData.email)}
                        </span>
                        <button
                          onClick={() => toggleSensitiveData('email')}
                          className="text-blue-600 hover:text-blue-800 text-lg font-medium hover:underline transition-colors duration-200"
                        >
                          {showSensitiveData.email ? 'Ẩn' : 'Hiện'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {editingField === 'email' && (
                    <button
                      onClick={handleCancel}
                      className="text-gray-600 hover:text-gray-800 text-lg font-medium hover:underline transition-colors duration-200"
                    >
                      Hủy
                    </button>
                  )}
                  <button
                    onClick={() => editingField === 'email' ? handleSave('email') : handleEdit('email')}
                    className="bg-gray-600 cursor-pointer hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    {editingField === 'email' ? 'Lưu' : 'Sửa'}
                  </button>
                </div>
              </div>

              <div className="border-b border-gray-300"></div>

              {/* Phone */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="flex-grow">
                  <h2 className="text-lg font-bold uppercase text-gray-500 mb-2">Số điện thoại</h2>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    {editingField === 'phone' ? (
                      <input
                        type="tel"
                        value={tempValues.phone || ''}
                        onChange={(e) => setTempValues({ ...tempValues, phone: e.target.value })}
                        className="w-full bg-white border-2 border-blue-500 rounded-lg px-4 py-2 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                      />
                    ) : (
                      <>
                        <span className="text-gray-900 text-base font-medium">
                          {showSensitiveData.phone ? userData.phone : maskPhone(userData.phone)}
                        </span>
                        <button
                          onClick={() => toggleSensitiveData('phone')}
                          className="text-blue-600 hover:text-blue-800 text-lg font-medium hover:underline transition-colors duration-200"
                        >
                          {showSensitiveData.phone ? 'Ẩn' : 'Hiện'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {editingField === 'phone' && (
                    <button
                      onClick={handleCancel}
                      className="text-gray-600 hover:text-gray-800 text-lg font-medium hover:underline transition-colors duration-200"
                    >
                      Hủy
                    </button>
                  )}
                  <button
                    onClick={() => editingField === 'phone' ? handleSave('phone') : handleEdit('phone')}
                    className="bg-gray-600 hover:bg-gray-700 cursor-pointer text-white px-4 py-2 rounded-lg text-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    {editingField === 'phone' ? 'Lưu' : 'Sửa'}
                  </button>
                </div>
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
                  <div className="text-gray-500  ">
                    {stat.label}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Achievements */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm ">
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
                  <p className={`text-lg ${achievement.unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
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
                    <p className="text-gray-900 text-lg font-medium">{activity.action}</p>
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