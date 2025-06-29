'use client'
import React, { ComponentType, JSX, useState } from 'react';
import * as LucideIcons from "lucide-react"
import { MenuItem,MenuProps,ProfileMenuProps } from '@/types/user.types';

//@navItems các mục điều hướng chính như "Dashboard", "Projects", "Tasks"
//@userItems các item của profile như "Thông tin cá nhân", "Cài đặt", "Đăng xuất"
//@user thông tin người dùng
export default function Sidebar({ navItems, userItems, user }: { navItems: MenuProps['items'], userItems: ProfileMenuProps['items'], user: ProfileMenuProps['mockUser'] }) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);


    // Chuyển đổi trạng thái thu gọn của toàn bộ sidebar
    const toggleSidebar = () => {
        setIsCollapsed((prev) => !prev);
    };

    // Chuyển đổi trạng thái đóng/mở của một submenu cụ thể
    const toggleMenu = (menuId: string) => {
        console.log(menuId)
        setOpenMenus(prevState => ({
            ...prevState,
            [menuId]: !prevState[menuId]
        }));
    };

    // Hàm xử lý các hành động như mở tìm kiếm hoặc tạo mục mới
    const handleAction = (action: string, item: string) => {
        // Trong một ứng dụng thực tế, hành động này sẽ kích hoạt modal hoặc UI khác
        console.log(`Action: ${action} for item: ${item}`);
    };

    const getIcon = (iconName: string, size = 18, classname?: string): JSX.Element => {
        const IconComponent = (LucideIcons as any)[iconName]
        return IconComponent ? <IconComponent size={size} className={classname} />
            // notthing change 
            : <></>;
    }

    return (
        <>
            {/* --- BẮT ĐẦU COMPONENT SIDEBAR --- */}
            <aside
                // Tự động đặt chiều rộng dựa trên trạng thái thu gọn
                className={`flex-shrink-0 bg-gray-800 border-r border-gray-700 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}
            >
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <header className={`flex items-center justify-center h-16 flex-shrink-0 ${isCollapsed ? 'px-0' : 'px-4'}`}>
                        <a href="/" aria-label="Home page" className="p-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-400 hover:text-white hover:bg-gray-700">
                            {getIcon('House', 24)}
                        </a>
                    </header>

                    {/* Navigation */}
                    <nav className="flex-grow overflow-y-auto overflow-x-hidden px-2 space-y-2">
                        {/* Nút tìm kiếm */}
                        <div className="px-1.5 py-1">
                            <button
                                onClick={() => handleAction('open-search', 'Search')}
                                className="flex items-center w-full gap-2 text-left outline-none hover:bg-gray-700 text-sm py-2.5 px-3 rounded-lg border border-gray-600 bg-gray-900 justify-between text-gray-400"
                            >
                                <div className="flex items-center gap-2">
                                    {getIcon('Search', 16)}
                                    {!isCollapsed && <span>Search</span>}
                                </div>
                            </button>
                        </div>
                        {isCollapsed ? (
                            <ul className="flex flex-col space-y-1 items-center ">
                                {navItems.map((item) => (console.log(item),
                                    <li key={item.id} className="relative group/menu-item ">
                                        {item.subMenu ? (
                                            // Nút menu có thể thu gọn
                                            <button
                                                onClick={() => toggleMenu(item.id)}
                                                className="flex items-center w-full gap-3 rounded-lg hover:bg-gray-700 text-sm h-10 px-3 text-gray-300"
                                            >
                                                {item.icon && getIcon(item.icon, 18)}
                                                {!isCollapsed && <span className="flex-grow text-left">{item.label}</span>}
                                                {!isCollapsed && (
                                                    getIcon('ChevronDown', 16, `transition-transform duration-200 ${openMenus[item.id] ? 'rotate-180' : ''}`)
                                                )}
                                            </button>
                                        ) : (
                                            // Liên kết thông thường
                                            <a href={item.href} className="flex items-center w-full gap-3 rounded-lg hover:bg-gray-700 text-sm h-10 px-3 text-gray-300">
                                                {item.icon && getIcon(item.icon, 18)}
                                                {!isCollapsed && <span>{item.label}</span>}
                                            </a>
                                        )}

                                        {/* Nút hành động (ví dụ: '+') khi di chuột qua */}
                                        {!isCollapsed && item.action && (
                                            <span className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 group-hover/menu-item:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleAction(item.action ?? "?", item.label)}
                                                    className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-gray-600 text-gray-400"
                                                    aria-label={`Create new ${item.label}`}
                                                >
                                                    {getIcon('plus', 14)}
                                                </button>
                                            </span>
                                        )}

                                        {/* Danh sách submenu */}
                                        {item.subMenu && !isCollapsed && (
                                            <ul className={`pl-8 pr-2 space-y-1 overflow-hidden transition-all duration-300 ${openMenus[item.id] ? 'max-h-96 py-2' : 'max-h-0'}`}>
                                                {item.subMenu.map(subItem => (
                                                    <li key={subItem.id}>
                                                        <a href={subItem.href} className="flex items-center w-full rounded-md hover:bg-gray-700 text-xs h-8 px-3 text-gray-400">
                                                            {subItem.label}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <ul className="flex flex-col space-y-1 ">
                                {navItems.map((item) => (
                                    <li key={item.id} className="relative group/menu-item ">
                                        {item.subMenu ? (
                                            // Nút menu có thể thu gọn
                                            <button
                                                onClick={() => toggleMenu(item.id)}
                                                className="flex items-center w-full gap-3 rounded-lg hover:bg-gray-700 text-sm h-10 px-3 text-gray-300"
                                            >
                                                {item.icon && getIcon(item.icon, 18)}
                                                {!isCollapsed && <span className="flex-grow text-left">{item.label}</span>}
                                                {!isCollapsed && (
                                                    getIcon('ChevronDown', 16, `transition-transform duration-200 ${openMenus[item.id] ? 'rotate-180' : ''}`)
                                                )}
                                            </button>
                                        ) : (
                                            // Liên kết thông thường
                                            <a href={item.href} className="flex items-center w-full gap-3 rounded-lg hover:bg-gray-700 text-sm h-10 px-3 text-gray-300">
                                                {item.icon && getIcon(item.icon, 18)}
                                                {!isCollapsed && <span>{item.label}</span>}
                                            </a>
                                        )}

                                        {/* Nút hành động (ví dụ: '+') khi di chuột qua */}
                                        {!isCollapsed && item.action && (
                                            <span className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 group-hover/menu-item:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleAction(item.action ?? "?", item.label)}
                                                    className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-gray-600 text-gray-400"
                                                    aria-label={`Create new ${item.label}`}
                                                >
                                                    {getIcon('plus', 14)}
                                                </button>
                                            </span>
                                        )}

                                        {/* Danh sách submenu */}
                                        {item.subMenu && !isCollapsed && (
                                            <ul className={`pl-8 pr-2 space-y-1 overflow-hidden transition-all duration-300 ${openMenus[item.id] ? 'max-h-96 py-2' : 'max-h-0'}`}>
                                                {item.subMenu.map(subItem => (
                                                    <li key={subItem.id}>
                                                        <a href={subItem.href} className="flex items-center w-full rounded-md hover:bg-gray-700 text-xs h-8 px-3 text-gray-400">
                                                            {subItem.label}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}

                    </nav>
                    {/* Footer */}
                    <footer className="flex-shrink-0 p-2 border-t border-gray-700 mt-auto">
                        <div className="relative">
                            {isUserMenuOpen && (
                                <div className={`absolute bottom-full mb-2 w-56 bg-gray-700 rounded-lg shadow-lg p-2 z-10 ${isCollapsed ? '' : 'left-2'}`}>
                                    <div className="flex items-center p-2 border-b border-gray-600 mb-2">
                                        <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white flex-shrink-0">{user.initials}</div>
                                        <div className="ml-3 truncate">
                                            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                        </div>
                                    </div>
                                    <ul className="space-y-1">
                                        {userItems.map(item => {
                                            return (
                                                <li key={item.id}>
                                                    <a href={item.href || '#'} onClick={() => item.action && handleAction(item.action, item.label)} className="flex items-center gap-3 w-full rounded-md hover:bg-gray-600 text-sm h-9 px-3 text-gray-300">
                                                        {item.icon && getIcon(item.icon, 18)}
                                                        <span>{item.label}</span>
                                                    </a>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <button onClick={() => setIsUserMenuOpen(prev => !prev)} aria-expanded={isUserMenuOpen} aria-haspopup="menu" className={`h-12 w-12 rounded-full border border-gray-600 hover:opacity-80 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 ${isCollapsed ? 'mx-auto' : 'ml-1'}`} aria-label="User menu">
                                    <span className="flex h-full w-full items-center justify-center rounded-full bg-indigo-600 text-white font-bold">{user.initials}</span>
                                </button>
                                {!isCollapsed && (<button onClick={toggleSidebar} className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-gray-700 text-gray-400" aria-label="Collapse Sidebar">{getIcon('ChevronLeft', 18, `transition-transform duration-200 ${isCollapsed ? 'rotate-0' : 'rotate-180'}`)}</button>)}
                            </div>
                            {isCollapsed && (
                                <div className="mt-2 flex justify-center">
                                    <button onClick={toggleSidebar} className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-gray-700 text-gray-400 transition-transform duration-300" aria-label="Expand Sidebar">
                                        {getIcon('ChevronRight', 18, `transition-transform duration-300 ${isCollapsed ? 'rotate-180' : 'rotate-0'}`)}
                                    </button>
                                </div>
                            )}
                        </div>
                    </footer>
                </div>
            </aside>
        </>
    );
};

