'use client'

import { useSession } from 'next-auth/react'
import { useRef, useState } from 'react'
import { SidebarItems } from "@/data/SidebarItems"
import profileItems from '@/data/profileMenuItem'
import Footer from "@/components/layout/user/Footer"
import Sidebar from "@/components/layout/user/Sidebar"
import Header from "@/components/layout/user/Header"
import { useLayoutDimensions } from '@/hooks/useLayoutDimensions'
import { useComputedPosition, generateStyleObject, getScrollableContentStyles } from '@/hooks/useComputedPosition'

interface UserLayoutClientProps {
  children: React.ReactNode
}

export default function UserLayoutClient({ children }: UserLayoutClientProps) {
  const { data: session } = useSession()

  // Refs for layout elements
  const headerRef = useRef<HTMLElement>(null)
  const sidebarRef = useRef<HTMLElement>(null)
  const footerRef = useRef<HTMLElement>(null)

  // Sidebar collapsed state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // CPU-based layout calculations
  const dimensions = useLayoutDimensions({
    headerRef,
    sidebarRef,
    footerRef,
    sidebarCollapsedWidth: 80,
    sidebarExpandedWidth: 248,
  })

  // Compute positions using CPU-only calculations
  const computedStyles = useComputedPosition(dimensions)

  // Create user data from session (guaranteed by DisabledGuard)
  const realUserData = {
    initials: (session?.user?.displayname || session?.user?.username)?.substring(0, 2).toUpperCase() || 'U',
    name: session?.user?.displayname || session?.user?.username || 'User',
    email: session?.user?.email || 'user@example.com',
    avatar: session?.user?.avatar || '/logo.svg',
    role: session?.user?.role
  }

  return (
    <div className="relative w-full h-screen bg-gray-900 text-gray-100 font-sans overflow-hidden">
      {/* Sidebar - Hidden on mobile/tablet via computed position */}
      {dimensions.breakpoint === 'desktop' && (
        <Sidebar
          ref={sidebarRef}
          navItems={SidebarItems}
          userItems={profileItems}
          user={realUserData}
          style={generateStyleObject(computedStyles.sidebar)}
          onCollapsedChange={setIsSidebarCollapsed}
        />
      )}

      {/* Header - Fixed position with computed dimensions */}
      <Header
        ref={headerRef}
        userProps={realUserData}
        HeaderItems={profileItems}
        style={generateStyleObject(computedStyles.header)}
      />

      {/* Main Content Area - Computed offsets for perfect fit */}
      <main
        className="bg-white text-gray-900"
        style={{
          ...generateStyleObject(computedStyles.mainContent),
          ...getScrollableContentStyles(computedStyles.mainContent.maxHeight),
        }}
      >
        {children}
      </main>

      {/* Footer - Fixed at bottom with computed position */}
      <Footer
        ref={footerRef}
        style={generateStyleObject(computedStyles.footer)}
      />
    </div>
  )
}