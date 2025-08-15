import React from 'react'
import Image from 'next/image'
import { getIcon } from '@/utils/getIcon'

interface UserData {
  displayName: string
  username: string
  email: string
  phone: string
  avatar?: string
  joinDate: string
}

interface UserProfileSectionProps {
  userData: UserData
  editingField: string | null
  tempValues: Record<string, string>
  showSensitiveData: {
    email: boolean
    phone: boolean
  }
  onEdit: (field: string) => void
  onSave: (field: string) => void
  onCancel: () => void
  onToggleSensitiveData: (field: 'email' | 'phone') => void
  onSignOut: () => void
}

const UserProfileSection: React.FC<UserProfileSectionProps> = ({
  userData,
  editingField,
  tempValues,
  showSensitiveData,
  onEdit,
  onSave,
  onCancel,
  onToggleSensitiveData,
  onSignOut
}) => {
  
  // ✅ UTILITY FUNCTIONS - Specific to this component
  const maskEmail = (email: string) => {
    const [local, domain] = email.split('@')
    return `${'*'.repeat(local.length)}@${domain}`
  }

  const maskPhone = (phone: string) => {
    return `${'*'.repeat(phone.length - 4)}${phone.slice(-4)}`
  }

  return (
    <>
      {/* Enhanced Header Section */}
      <section className="bg-gradient-to-r from-white to-gray-50 p-8 rounded-2xl shadow-lg border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Side: User Info */}
          <div className="flex items-start gap-6 flex-1">
            <div className="relative">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white shadow-lg overflow-hidden">
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
              onClick={onSignOut}
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
      </section>

      {/* User Info Card */}
      <section className="bg-gray-50 mx-4 sm:mx-6 mb-6 p-4 sm:p-6 rounded-xl border border-gray-200">
        <div className="space-y-6">

          {/* Display Name */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex-grow">
              <h2 className="text-lg font-bold uppercase text-gray-500 mb-2">Tên hiển thị</h2>
              {editingField === 'displayName' ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempValues.displayName || ''}
                    onChange={(e) => onEdit('displayName')}
                    className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6A994E] focus:border-transparent text-gray-900"
                    placeholder="Nhập tên hiển thị"
                  />
                  <button
                    onClick={() => onSave('displayName')}
                    className="px-4 py-2 bg-[#6A994E] text-white rounded-lg hover:bg-[#386641] transition-colors"
                  >
                    {getIcon('Check', 16)}
                  </button>
                  <button
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
                  >
                    {getIcon('X', 16)}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-xl text-gray-900 font-semibold">{userData.displayName}</p>
                  <button
                    onClick={() => onEdit('displayName')}
                    className="text-[#6A994E] hover:text-[#386641] transition-colors"
                  >
                    {getIcon('Edit2', 20)}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Username */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex-grow">
              <h2 className="text-lg font-bold uppercase text-gray-500 mb-2">Tên người dùng</h2>
              {editingField === 'username' ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempValues.username || ''}
                    onChange={(e) => onEdit('username')}
                    className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6A994E] focus:border-transparent text-gray-900"
                    placeholder="Nhập tên người dùng"
                  />
                  <button
                    onClick={() => onSave('username')}
                    className="px-4 py-2 bg-[#6A994E] text-white rounded-lg hover:bg-[#386641] transition-colors"
                  >
                    {getIcon('Check', 16)}
                  </button>
                  <button
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
                  >
                    {getIcon('X', 16)}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-xl text-gray-900">@{userData.username}</p>
                  <button
                    onClick={() => onEdit('username')}
                    className="text-[#6A994E] hover:text-[#386641] transition-colors"
                  >
                    {getIcon('Edit2', 20)}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex-grow">
              <h2 className="text-lg font-bold uppercase text-gray-500 mb-2">Email</h2>
              <div className="flex items-center justify-between">
                <p className="text-xl text-gray-900">
                  {showSensitiveData.email ? userData.email : maskEmail(userData.email)}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => onToggleSensitiveData('email')}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {getIcon(showSensitiveData.email ? 'EyeOff' : 'Eye', 20)}
                  </button>
                  <button
                    onClick={() => onEdit('email')}
                    className="text-[#6A994E] hover:text-[#386641] transition-colors"
                  >
                    {getIcon('Edit2', 20)}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Phone */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex-grow">
              <h2 className="text-lg font-bold uppercase text-gray-500 mb-2">Số điện thoại</h2>
              <div className="flex items-center justify-between">
                <p className="text-xl text-gray-900">
                  {showSensitiveData.phone ? userData.phone : maskPhone(userData.phone)}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => onToggleSensitiveData('phone')}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {getIcon(showSensitiveData.phone ? 'EyeOff' : 'Eye', 20)}
                  </button>
                  <button
                    onClick={() => onEdit('phone')}
                    className="text-[#6A994E] hover:text-[#386641] transition-colors"
                  >
                    {getIcon('Edit2', 20)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default UserProfileSection