"use client";

import React, { JSX, useState } from 'react';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { SidebarProfileMenuProps, SidebarMenuItems } from '@/types/user.types';
import { LucideIcon } from 'lucide-react';

// Define AdminSidebarItems
const AdminSidebarItems = [
  { id: 'admin-dashboard', label: 'Bảng điều khiển Quản trị', icon: 'LayoutDashboard', href: '/admin/dashboard' },
  { id: 'admin-moderation', label: 'Kiểm soát Nội dung', icon: 'ShieldCheck', href: '/admin/moderation' },
  { id: 'admin-users', label: 'Quản lý Người dùng', icon: 'Users', href: '/admin/users' },
  { id: 'admin-orders', label: 'Quản lý Đơn hàng', icon: 'ShoppingCart', href: '/admin/orders' },
];

export default function Sidebar({
  navItems,
  userItems,
  user,
}: {
  navItems: SidebarMenuItems['items'];
  userItems: SidebarMenuItems['items'];
  user: SidebarProfileMenuProps['mockUser'];
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Chuyển đổi trạng thái thu gọn của toàn bộ sidebar
  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  // Chuyển đổi trạng thái đóng/mở của một submenu cụ thể
  const toggleMenu = (menuId: string) => {
    console.log(menuId);
    setOpenMenus((prevState) => ({
      ...prevState,
      [menuId]: !prevState[menuId],
    }));
  };

  // Hàm xử lý các hành động như mở tìm kiếm hoặc tạo mục mới
  const handleAction = (action: string, item: string) => {
    console.log(`Action: ${action} for item: ${item}`);
  };

  const getIcon = (iconName: string, size = 18, classname?: string): JSX.Element => {
    const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as LucideIcon;
    return IconComponent ? <IconComponent size={size} className={classname} /> : <></>;
  };

  return (
    <>
      {/* --- SIDEBAR --- */}
      <aside
        className={`flex-shrink-0 transition-all duration-200 ease-out shadow-2xl
          ${isCollapsed ? 'w-20' : 'w-62'}
          bg-gradient-to-b from-[#1a2e1a] via-[#2d4a2d] to-[#0f1a0f]
          border-r-2 border-[#386641]/30
          relative 
          before:absolute before:inset-0 before:bg-gradient-to-r before:from-[#386641]/5 before:to-transparent before:pointer-events-none
          after:absolute after:top-0 after:right-0 after:w-1 after:h-full after:bg-gradient-to-b after:from-[#386641] after:via-[#6A994E]/50 after:to-[#386641] after:opacity-60
        `}
      >
        <div className="flex h-full flex-col relative z-10">
          {/* Header */}
          <header
            className={`flex items-center justify-center h-20 flex-shrink-0 ${
              isCollapsed ? 'px-0' : 'px-6'
            } border-b border-[#386641]/20`}
          >
            <Link
              href="/"
              aria-label="Home page"
              className="p-3 rounded-xl focus:outline-none transition-all duration-300 
                text-white hover:text-[#6A994E] hover:bg-[#386641]/10
                hover:shadow-lg hover:shadow-[#386641]/25 hover:scale-110
                ring-2 ring-transparent hover:ring-[#6A994E]/50"
            >
              {getIcon('Home', 28, 'drop-shadow-lg')}
            </Link>
          </header>

          {/* Navigation */}
          <nav className="flex-grow overflow-y-auto overflow-x-hidden px-3 py-4 space-y-3">
            {/* Search Button */}
            <div className="px-1">
              <button
                onClick={() => handleAction('open-search', 'Search')}
                className="flex items-center w-full gap-3 text-left outline-none transition-all duration-300
                  text-sm py-3 px-4 rounded-xl
                  bg-gradient-to-r from-[#2d4a2d] to-[#1a3a1a]
                  border border-[#386641]/40
                  text-white hover:text-[#6A994E]
                  hover:bg-gradient-to-r hover:from-[#386641]/20 hover:to-[#2d4a2d]
                  hover:border-[#6A994E] hover:shadow-lg hover:shadow-[#386641]/30
                  focus:ring-2 focus:ring-[#6A994E]/50 focus:border-[#6A994E]
                  group"
              >
                <div className="flex items-center gap-3 w-full">
                  {getIcon('Search', 18, 'group-hover:text-[#6A994E] transition-colors duration-300')}
                  {!isCollapsed && <span className="font-semibold tracking-wide">Tìm kiếm</span>}
                </div>
              </button>
            </div>

            {/* Main Menu Items */}
            <ul className={`flex flex-col space-y-2 ${isCollapsed ? 'items-center' : ''}`}>
              {navItems.map((item) => (
                <li key={item.id} className="relative group/menu-item">
                  {item.subMenu ? (
                    // Submenu Button
                    <button
                      onClick={() => toggleMenu(item.id)}
                      className="flex items-center w-full gap-4 rounded-xl transition-all duration-300
                        text-sm h-12 px-4 text-white font-medium tracking-wide
                        hover:bg-gradient-to-r hover:from-[#386641]/20 hover:to-[#2d4a2d]/50
                        hover:text-[#6A994E] hover:shadow-lg hover:shadow-[#386641]/20
                        focus:outline-none focus:ring-2 focus:ring-[#6A994E]/50
                        border border-transparent hover:border-[#386641]/30
                        group/submenu"
                    >
                      {item.icon && getIcon(item.icon, 20, 'group-hover/submenu:text-[#6A994E] transition-colors duration-300')}
                      {!isCollapsed && (
                        <>
                          <span className="flex-grow text-left">{item.label}</span>
                          {getIcon(
                            'ChevronDown',
                            18,
                            `transition-all duration-300 group-hover/submenu:text-[#6A994E] ${
                              openMenus[item.id] ? 'rotate-180' : ''
                            }`
                          )}
                        </>
                      )}
                    </button>
                  ) : (
                    item.href && (
                      <Link
                        href={item.href}
                        className="flex items-center w-full gap-4 rounded-xl transition-all duration-300
                          text-sm h-12 px-4 text-white font-medium tracking-wide
                          hover:bg-gradient-to-r hover:from-[#386641]/20 hover:to-[#2d4a2d]/50
                          hover:text-[#6A994E] hover:shadow-lg hover:shadow-[#386641]/20
                          focus:outline-none focus:ring-2 focus:ring-[#6A994E]/50
                          border border-transparent hover:border-[#386641]/30
                          group/link"
                      >
                        {item.icon && getIcon(item.icon, 20, 'group-hover/link:text-[#6A994E] transition-colors duration-300')}
                        {!isCollapsed && <span>{item.label}</span>}
                      </Link>
                    )
                  )}

                  {/* Action Button */}
                  {!isCollapsed && item.action && (
                    <span className="absolute top-1/2 right-3 -translate-y-1/2 opacity-0 group-hover/menu-item:opacity-100 transition-all duration-300">
                      <button
                        onClick={() => handleAction(item.action ?? '?', item.label)}
                        className="h-7 w-7 flex items-center justify-center rounded-lg transition-all duration-300
                          hover:bg-[#386641] hover:text-white text-[#6A994E]
                          hover:shadow-lg hover:shadow-[#386641]/50 hover:scale-110
                          border border-[#6A994E]/50 hover:border-[#386641]"
                        aria-label={`Create new ${item.label}`}
                      >
                        {getIcon('Plus', 16, 'font-bold')}
                      </button>
                    </span>
                  )}

                  {/* Submenu */}
                  {item.subMenu && !isCollapsed && (
                    <ul
                      className={`pl-12 pr-3 space-y-1.5 overflow-hidden transition-all duration-500 ease-out
                        ${openMenus[item.id] ? 'max-h-96 py-3' : 'max-h-0'}`}
                    >
                      {item.subMenu.map((subItem) => (
                        <li key={subItem.id}>
                          {subItem.href && (
                            <Link
                              href={subItem.href}
                              className="flex items-center w-full rounded-lg transition-all duration-300
                                text-xs h-9 px-4 text-gray-300 font-medium
                                hover:bg-[#386641]/15 hover:text-white
                                hover:shadow-md hover:shadow-[#386641]/10
                                border-l-2 border-transparent hover:border-[#6A994E]/50"
                            >
                              {subItem.label}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>

            {/* Admin Menu Items (only for admin users) */}
            {/* {user.role === 'admin' && ( */}
              <>
                <div className="my-4 border-t border-[#386641]/20" /> {/* Separator */}
                <h3
                  className={`text-sm font-semibold text-gray-300 px-4 ${
                    isCollapsed ? 'text-center' : ''
                  }`}
                >
                  {!isCollapsed && ''}
                </h3>
                <ul className={`flex flex-col space-y-2 ${isCollapsed ? 'items-center' : ''}`}>
                  {AdminSidebarItems.map((item) => (
                    <li key={item.id} className="relative group/menu-item">
                      {item.href && (
                        <Link
                          href={item.href}
                          className="flex items-center w-full gap-4 rounded-xl transition-all duration-300
                            text-sm h-12 px-4 text-white font-medium tracking-wide
                            hover:bg-gradient-to-r hover:from-[#386641]/20 hover:to-[#2d4a2d]/50
                            hover:text-[#6A994E] hover:shadow-lg hover:shadow-[#386641]/20
                            focus:outline-none focus:ring-2 focus:ring-[#6A994E]/50
                            border border-transparent hover:border-[#386641]/30
                            group/link"
                        >
                          {item.icon && getIcon(item.icon, 20, 'group-hover/link:text-[#6A994E] transition-colors duration-300')}
                          {!isCollapsed && <span>{item.label}</span>}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            {/* )} */}
          </nav>

          {/* Footer với user menu */}
          <footer className="flex-shrink-0 p-3 border-t border-[#386641]/20 mt-auto bg-gradient-to-r from-[#1a2e1a]/50 to-[#2d4a2d]/50">
            <div className="relative">
              {/* User Menu Dropdown */}
              {isUserMenuOpen && (
                <div
                  className={`absolute bottom-full mb-3 w-64 rounded-2xl shadow-2xl p-3 z-50
                    bg-gradient-to-b from-[#2d4a2d] to-[#1a3a1a]
                    border-2 border-[#386641]/40
                    shadow-[#386641]/25
                    ${isCollapsed ? 'left-0' : 'left-2'}`}
                >
                  {/* User Info */}
                  <div className="flex items-center p-3 border-b border-[#386641]/30 mb-3 rounded-xl bg-[#386641]/5">
                    <div
                      className="h-12 w-12 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0
                        bg-gradient-to-br from-[#386641] to-[#6A994E]
                        shadow-lg shadow-[#386641]/50 ring-2 ring-[#6A994E]/50"
                    >
                      {user.initials}
                    </div>
                    <div className="ml-4 truncate">
                      <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                      <p className="text-xs text-gray-300 truncate">{user.email}</p>
                    </div>
                  </div>
                  {/* User Menu Items */}
                  <ul className="space-y-1.5">
                    {userItems.map((item) => (
                      <li key={item.id}>
                        {item.href ? (
                          <Link
                            href={item.href}
                            className="flex items-center gap-4 w-full rounded-xl transition-all duration-300
                              text-sm h-11 px-4 text-white font-medium
                              hover:bg-gradient-to-r hover:from-[#386641]/20 hover:to-[#2d4a2d]/50
                              hover:text-[#6A994E] hover:shadow-lg hover:shadow-[#386641]/20
                              border border-transparent hover:border-[#386641]/30"
                          >
                            {item.icon &&
                              getIcon(item.icon, 20, 'hover:text-[#6A994E] transition-colors duration-200')}
                            <span>{item.label}</span>
                          </Link>
                        ) : (
                          item.action && (
                            <button
                              className="flex items-center gap-2 w-full rounded-xl transition-all duration-300
                                text-sm h-11 px-4 text-white font-medium
                                hover:bg-gradient-to-r hover:from-[#386641]/20 hover:to-[#2d4a2d]/50
                                hover:text-[#6A994E] hover:shadow-lg hover:shadow-[#386641]/20
                                border border-transparent hover:border-[#386641]/30 cursor-pointer"
                              onClick={() => item.action && handleAction(item.action, item.label)}
                            >
                              {item.icon &&
                                getIcon(item.icon, 20, 'hover:text-[#6A994E] transition-colors duration-200')}
                              {item.label}
                            </button>
                          )
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Footer Controls */}
              <div className="flex items-center justify-between">
                {/* User Avatar Button */}
                <button
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="menu"
                  className={`h-14 w-14 rounded-full flex items-center justify-center transition-all duration-300
                    focus:outline-none focus:ring-2 focus:ring-[#6A994E]/50
                    hover:scale-110 hover:shadow-xl hover:shadow-[#386641]/50
                    border-2 border-[#6A994E]/60 hover:border-[#6A994E]
                    ${isCollapsed ? 'mx-auto' : 'ml-1'}
                    group`}
                  aria-label="User menu"
                >
                  <span
                    className="flex h-full w-full items-center justify-center rounded-full font-bold text-white text-lg
                      bg-gradient-to-br from-[#386641] to-[#6A994E] 
                      shadow-inner group-hover:from-[#6A994E] group-hover:to-[#386641]
                      transition-all duration-300"
                  >
                    {user.initials}
                  </span>
                </button>

                {/* Collapse Button */}
                {!isCollapsed && (
                  <button
                    onClick={toggleSidebar}
                    className="h-11 w-11 flex items-center justify-center rounded-xl transition-all duration-300
                      hover:bg-[#386641]/20 text-gray-300 hover:text-[#6A994E]
                      hover:shadow-lg hover:shadow-[#386641]/25 hover:scale-105
                      border border-transparent hover:border-[#386641]/30"
                    aria-label="Collapse Sidebar"
                  >
                    {getIcon('ChevronRight', 20, `transition-transform duration-300 ${isCollapsed ? 'rotate-0' : 'rotate-180'}`)}
                  </button>
                )}
              </div>

              {/* Expand Button when collapsed */}
              {isCollapsed && (
                <div className="mt-3 flex justify-center">
                  <button
                    onClick={toggleSidebar}
                    className="h-11 w-11 flex items-center justify-center rounded-xl transition-all duration-300
                      hover:bg-[#386641]/20 text-gray-300 hover:text-[#6A994E]
                      hover:shadow-lg hover:shadow-[#386641]/25 hover:scale-105
                      border border-transparent hover:border-[#386641]/30"
                    aria-label="Expand Sidebar"
                  >
                    {getIcon('ChevronLeft', 20, `transition-transform duration-300 ${isCollapsed ? 'rotate-180' : 'rotate-0'}`)}
                  </button>
                </div>
              )}
            </div>
          </footer>
        </div>
      </aside>
    </>
  );
}