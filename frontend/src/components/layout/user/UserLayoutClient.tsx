'use client'

import { useSession } from 'next-auth/react'
import { SidebarItems } from "@/data/SidebarItems"
import profileItems from '@/data/profileMenuItem'
import Footer from "@/components/layout/user/Footer"
import Sidebar from "@/components/layout/user/Sidebar"
import Header from "@/components/layout/user/Header"

interface UserLayoutClientProps {
  children: React.ReactNode
}

export default function UserLayoutClient({ children }: UserLayoutClientProps) {
  const { data: session } = useSession()

  // Create user data from session (guaranteed by DisabledGuard)
  const realUserData = {
    initials: (session?.user?.displayname || session?.user?.username)?.substring(0, 2).toUpperCase() || 'U',
    name: session?.user?.displayname || session?.user?.username || 'User',
    email: session?.user?.email || 'user@example.com',
    role: session?.user?.role
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans">
      {/* Sidebar - Hidden on mobile by default */}
      <div className="hidden lg:flex">
        <Sidebar
          navItems={SidebarItems}
          userItems={profileItems}
          user={realUserData}
        />
      </div>
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Vùng nội dung chính */}
        <main className="flex-1 overflow-auto  bg-white text-gray-900">
          {/* Header */}
          <Header userProps={realUserData} HeaderItems={profileItems} />
          {/* Footer */}
          {children}
          <Footer />
        </main>
      </div>
    </div>
  )
}