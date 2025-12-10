'use client'

import { useRef, useState } from 'react'
import { SidebarMenuItems, SidebarProfileMenuProps } from '@/types/user.types'
import Sidebar from "@/components/layout/user/Sidebar"
import Header from "@/components/layout/user/Header"
import { useLayoutDimensions } from '@/hooks/useLayoutDimensions'
import { useComputedPosition, generateStyleObject, getScrollableContentStyles } from '@/hooks/useComputedPosition'

interface AdminLayoutClientProps {
  children: React.ReactNode
  sidebarItems: SidebarMenuItems['items']
  profileItems: SidebarMenuItems['items']
  userData: SidebarProfileMenuProps['mockUser']
}

export default function AdminLayoutClient({
  children,
  sidebarItems,
  profileItems,
  userData,
}: AdminLayoutClientProps) {
  // Refs for layout elements
  const headerRef = useRef<HTMLElement>(null)
  const sidebarRef = useRef<HTMLElement>(null)

  // Sidebar collapsed state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // CPU-based layout calculations (no footer in admin layout)
  const dimensions = useLayoutDimensions({
    headerRef,
    sidebarRef,
    sidebarCollapsedWidth: 80,
    sidebarExpandedWidth: 248,
  })

  // Compute positions using CPU-only calculations
  const computedStyles = useComputedPosition(dimensions)

  // Adjust main content to account for no footer
  const mainContentStyles = {
    ...computedStyles.mainContent,
    bottom: 0,
    height: `calc(100vh - ${dimensions.header.height}px)`,
    maxHeight: `calc(100vh - ${dimensions.header.height}px)`,
  }

  return (
    <div className="relative w-full h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar - Hidden on mobile/tablet via computed position */}
      {dimensions.breakpoint === 'desktop' && (
        <Sidebar
          ref={sidebarRef}
          navItems={sidebarItems}
          userItems={profileItems}
          user={userData}
          style={generateStyleObject(computedStyles.sidebar)}
          onCollapsedChange={setIsSidebarCollapsed}
        />
      )}

      {/* Header - Fixed position with computed dimensions */}
      <Header
        ref={headerRef}
        userProps={userData}
        HeaderItems={profileItems}
        style={generateStyleObject(computedStyles.header)}
      />

      {/* Main Content Area - Computed offsets for perfect fit */}
      <main
        className="bg-white text-gray-900"
        style={{
          ...generateStyleObject(mainContentStyles),
          ...getScrollableContentStyles(mainContentStyles.maxHeight),
        }}
      >
        {children}
      </main>
    </div>
  )
}
