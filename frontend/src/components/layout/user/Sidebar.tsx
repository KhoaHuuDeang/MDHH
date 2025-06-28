'use client'
import { Montserrat_Underline } from 'next/font/google';
import React from 'react';
import { useState } from 'react';


//để tạm chưa có cách giải quyết hay hơn 
const IconHome = () => <svg xmlns="http://www.w3.org/2000/svg" width = "24" height = "24" viewBox = "0 0 24 24" fill = "none" stroke = "currentColor" strokeWidth = "2" strokeLinecap = "round" strokeLinejoin = "round" > <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" > </path><polyline points="9 22 9 12 15 12 15 22"></polyline > </svg>;
const IconSearch = ({ size = 16 }) => <svg xmlns="http://www.w3.org/2000/svg" width = { size } height = { size } viewBox = "0 0 24 24" fill = "none" stroke = "currentColor" strokeWidth = "2" strokeLinecap = "round" strokeLinejoin = "round" > <circle cx="11" cy = "11" r = "8" > </circle><path d="m21 21-4.3-4.3"></path > </svg>;
const IconMessageSquare = ({ size = 16 }) => <svg xmlns="http://www.w3.org/2000/svg" width = { size } height = { size } viewBox = "0 0 24 24" fill = "none" stroke = "currentColor" strokeWidth = "2" strokeLinecap = "round" strokeLinejoin = "round" > <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" > </path></svg >;
const IconCheckCircle = ({ size = 16 }) => <svg xmlns="http://www.w3.org/2000/svg" width = { size } height = { size } viewBox = "0 0 24 24" fill = "none" stroke = "currentColor" strokeWidth = "2" strokeLinecap = "round" strokeLinejoin = "round" > <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" > </path><polyline points="22 4 12 14.01 9 11.01"></polyline > </svg>;
const IconFolder = ({ size = 16 }) => <svg xmlns="http://www.w3.org/2000/svg" width = { size } height = { size } viewBox = "0 0 24 24" fill = "none" stroke = "currentColor" strokeWidth = "2" strokeLinecap = "round" strokeLinejoin = "round" > <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" > </path></svg >;
const IconHistory = ({ size = 16 }) => <svg xmlns="http://www.w3.org/2000/svg" width = { size } height = { size } viewBox = "0 0 24 24" fill = "none" stroke = "currentColor" strokeWidth = "2" strokeLinecap = "round" strokeLinejoin = "round" > <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" > </path><path d="M3 3v5h5"></path > <path d="M12 7v5l4 2" > </path></svg >;
const IconPlus = ({ size = 12 }) => <svg xmlns="http://www.w3.org/2000/svg" width = { size } height = { size } viewBox = "0 0 24 24" fill = "none" stroke = "currentColor" strokeWidth = "2" strokeLinecap = "round" strokeLinejoin = "round" > <path d="M5 12h14" > </path><path d="M12 5v14"></path > </svg>;
const IconChevronDown = ({ size = 16, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width = { size } height = { size } viewBox = "0 0 24 24" fill = "none" stroke = "currentColor" strokeWidth = "2" strokeLinecap = "round" strokeLinejoin = "round" className = { className } > <path d="m6 9 6 6 6-6" > </path></svg >;
const IconSidebarToggle = ({ size = 17, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width = { size } height = { size } viewBox = "0 0 24 24" fill = "none" stroke = "currentColor" strokeWidth = "2" strokeLinecap = "round" strokeLinejoin = "round" className = { className } > <path d="M17 12H3" > </path><path d="m11 18 6-6-6-6"></path > <path d="M21 5v14" > </path></svg >;


// interface chính, để nào rảnh tách ra sau  

// interface phụ khi nào làm xong interface chính sẽ tách ra đảm bảo clean code he` he` 
 interface MenuItem {
  id: string;
  label: string;
  icon: string | React.ComponentType<any>
  href?: string;
  action?: string ;
  subMenu?: MenuItem[];
}

interface MenuProps {
  items: MenuItem[];
}
//mockdata đang chờ được tách ra thành file riêng nèeeeeeeeeeeee
// Dữ liệu giả cho các mục điều hướng


export default function Sidebar ({navItems} : {navItems: MenuItem[]}) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [openMenus, setOpenMenus] = useState<Record<string,boolean>>({})


    // Chuyển đổi trạng thái thu gọn của toàn bộ sidebar
    const toggleSidebar = () => {
        setIsCollapsed((prev) => !prev);
    };

    // Chuyển đổi trạng thái đóng/mở của một submenu cụ thể
    const toggleMenu = (menuId : string) => {
        setOpenMenus(prevState => ({
            ...prevState,
            [menuId]: !prevState[menuId]
        }));
    };

    // Hàm xử lý các hành động như mở tìm kiếm hoặc tạo mục mới
    const handleAction = (action : string, item : string) => {
        // Trong một ứng dụng thực tế, hành động này sẽ kích hoạt modal hoặc UI khác
        console.log(`Action: ${action} for item: ${item}`);
    };

    return (
        <div className="flex h-screen bg-gray-900 text-gray-100 font-sans">
            {/* --- BẮT ĐẦU COMPONENT SIDEBAR --- */}
            <aside
                // Tự động đặt chiều rộng dựa trên trạng thái thu gọn
                className={`flex-shrink-0 bg-gray-800 border-r border-gray-700 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}
            >
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <header className={`flex items-center justify-center h-16 flex-shrink-0 ${isCollapsed ? 'px-0' : 'px-4'}`}>
                        <a href="/" aria-label="Home page" className="p-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-400 hover:text-white hover:bg-gray-700">
                            <IconHome />
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
                                    <IconSearch size={16} />
                                    {!isCollapsed && <span>Search</span>}
                                </div>
                                {!isCollapsed && <span className="text-xs text-gray-500">Ctrl+K</span>}
                            </button>
                        </div>

                        {/* Các liên kết điều hướng động */}
                        <ul className="flex flex-col space-y-1">
                            {navItems.map((item) => (
                                <li key={item.id} className="relative group/menu-item">
                                    {item.subMenu ? (
                                        // Nút menu có thể thu gọn
                                        <button
                                            onClick={() => toggleMenu(item.id)}
                                            className="flex items-center w-full gap-3 rounded-lg hover:bg-gray-700 text-sm h-10 px-3 text-gray-300"
                                        >
                                            <item.icon size={18} />
                                            {!isCollapsed && <span className="flex-grow text-left">{item.label}</span>}
                                            {!isCollapsed && (
                                                <IconChevronDown
                                                    className={`transition-transform duration-200 ${openMenus[item.id] ? 'rotate-180' : ''}`}
                                                />
                                            )}
                                        </button>
                                    ) : (
                                        // Liên kết thông thường
                                        <a href={item.href} className="flex items-center w-full gap-3 rounded-lg hover:bg-gray-700 text-sm h-10 px-3 text-gray-300">
                                            <item.icon size={18} />
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
                                                <IconPlus size={14} />
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
                    </nav>

                    {/* Footer */}
                    <footer className="flex-shrink-0 p-2 border-t border-gray-700">
                        <div className="flex items-center justify-between">
                            {/* User Menu */}
                            <button className={`h-12 w-12 rounded-full border border-gray-600 hover:opacity-80 flex items-center justify-center ${isCollapsed ? 'mx-auto' : 'ml-1'}`} aria-label="User menu">
                                <span className="flex h-full w-full items-center justify-center rounded-full bg-indigo-600 text-white font-bold">DK</span>
                            </button>

                            {/* Nút thu gọn Sidebar */}
                            {!isCollapsed && (
                                <button
                                    onClick={toggleSidebar}
                                    className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-gray-700 text-gray-400"
                                    aria-label="Collapse Sidebar"
                                >
                                    <IconSidebarToggle />
                                </button>
                            )}
                        </div>
                        {/* Hiển thị nút mở rộng khi đã thu gọn */}
                        {isCollapsed && (
                            <div className="mt-2 flex justify-center">
                                <button
                                    onClick={toggleSidebar}
                                    className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-gray-700 text-gray-400"
                                    aria-label="Expand Sidebar"
                                >
                                    <IconSidebarToggle className="rotate-180" />
                                </button>
                            </div>
                        )}
                    </footer>
                </div>
            </aside>
            {/* --- KẾT THÚC COMPONENT SIDEBAR --- */}

            {/* Vùng nội dung chính */}
            <main className="flex-grow p-8">
                <h1 className="text-3xl font-bold text-white">Main Content</h1>
                <p className="mt-4 text-gray-400">The sidebar is now a living, breathing component.</p>
            </main>
        </div>
    );
};

