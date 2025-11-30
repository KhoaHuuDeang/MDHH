'use client'
import * as LucideIcons from 'lucide-react';
import { JSX, useState, useRef, useEffect, forwardRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SidebarProfileMenuProps } from '@/types/user.types';
import { LucideIcon } from 'lucide-react';
import { useLogNotifications } from '@/hooks/useLogNotifications';
import { getIconForLogType, formatRelativeTime, formatNotificationMessage } from '@/utils/notificationHelpers';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface HeaderProps {
    userProps: SidebarProfileMenuProps['mockUser'];
    HeaderItems: SidebarProfileMenuProps['items'];
    style?: React.CSSProperties;
}

const Header = forwardRef<HTMLElement, HeaderProps>(({ userProps, HeaderItems, style }, ref) => {
    const { t } = useTranslation();

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isMessageOpen, setIsMessageOpen] = useState(false);
    const [activeNotificationFilter, setActiveNotificationFilter] = useState<'all' | 'unread'>('all');

    const notificationRef = useRef<HTMLDivElement>(null);
    const messageRef = useRef<HTMLDivElement>(null);

    const getIcons = (icon: string, size = 18, classname?: string): JSX.Element => {
        const IconComponent = LucideIcons[icon as keyof typeof LucideIcons] as LucideIcon;
        return IconComponent ?
            <IconComponent size={size} className={classname} />
            : <></>
    }

    // Fetch notifications from API
    const { notifications: allNotifications, markAsRead, markAllAsRead } = useLogNotifications(false, true);
    console.log("All Notifications:", allNotifications);

    const filteredNotifications = activeNotificationFilter === 'all'
        ? allNotifications
        : allNotifications.filter(n => !n.is_read);

    const unreadCount = allNotifications.filter(n => !n.is_read).length;

    const handleNotificationClick = async (notificationId: string, isRead: boolean) => {
        if (!isRead) {
            await markAsRead(notificationId);
        }
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (

        <header
            ref={ref}
            style={style}
            className="sticky top-0 z-40 shadow-2xl border-b-2 border-[#386641]/30
                         bg-gradient-to-r from-[#1a2e1a] via-[#2d4a2d] to-[#1a2e1a]
                         backdrop-blur-md
                         relative
                         before:absolute before:inset-0 before:bg-gradient-to-r before:from-[#386641]/5 before:to-transparent before:pointer-events-none
                         after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-gradient-to-r after:from-[#386641] after:via-[#6A994E] after:to-[#386641] after:opacity-60">
            <div className='relative z-10'>
                <div className="container mx-auto px-4 md:px-6 py-3">
                    <div className="flex items-center justify-between h-16">
                        {/* Left Section - Mobile menu + Logo */}
                        <div className="flex items-center gap-6">
                            {/* Mobile Menu Button */}
                            <button
                                type="button"
                                className="lg:hidden p-3 rounded-xl transition-all duration-300
                                         text-white hover:text-[#6A994E] hover:bg-[#386641]/20
                                         hover:shadow-lg hover:shadow-[#386641]/25 hover:scale-105
                                         border border-transparent hover:border-[#386641]/30
                                         focus:outline-none focus:ring-2 focus:ring-[#6A994E]/50"
                                aria-label="Open sidebar"
                            >
                                {getIcons('Menu', 24)}
                            </button>

                            {/* Logo */}
                            <Link href="/home" className="flex-shrink-0 group">
                                <div className="relative">
                                    <Image
                                        src="/logo.svg"
                                        alt="Logo"
                                        width={40}
                                        height={40}
                                        className="h-20 w-20 md:h-30 md:w-30"
                                    />
                                </div>
                            </Link>
                        </div>

                        {/* Right Section - Cart + Notifications + Messages + User */}
                        <div className="flex items-center gap-3">
                            {/* Cart Button */}
                            <Link
                                href="/cart"
                                className="hidden sm:flex relative p-3 rounded-xl transition-all duration-300
                                         text-white hover:text-[#6A994E] hover:bg-[#386641]/20
                                         hover:shadow-lg hover:shadow-[#386641]/25 hover:scale-105
                                         border border-transparent hover:border-[#386641]/30
                                         focus:outline-none focus:ring-2 focus:ring-[#6A994E]/50"
                            >
                                {getIcons('ShoppingCart', 20)}
                            </Link>

                            {/* Notification Button */}
                            <div className="relative" ref={notificationRef}>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsNotificationOpen(!isNotificationOpen);
                                        setIsMessageOpen(false);
                                    }}
                                    className="hidden sm:flex relative p-3 rounded-xl transition-all duration-300
                                             text-white hover:text-[#6A994E] hover:bg-[#386641]/20
                                             hover:shadow-lg hover:shadow-[#386641]/25 hover:scale-105
                                             border border-transparent hover:border-[#386641]/30
                                             focus:outline-none focus:ring-2 focus:ring-[#6A994E]/50"
                                >
                                    {getIcons('Bell', 20)}
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#386641] border-2 border-[#6A994E] 
                                                       flex items-center justify-center text-xs font-bold text-white">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Notification Dropdown */}
                                {isNotificationOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-[380px] bg-[#2d4a2d] rounded-xl shadow-2xl border-2 border-[#386641]/40 z-50 overflow-hidden">
                                        {/* Header */}
                                        <div className="p-4 border-b border-[#386641]/30">
                                            <div className="flex justify-between items-center mb-3">
                                                <h2 className="text-xl font-bold text-white">Thông báo</h2>
                                                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#386641]/20 hover:bg-[#386641]/40 transition-colors">
                                                    {getIcons('MoreHorizontal', 16, 'text-white')}
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setActiveNotificationFilter('all')}
                                                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${activeNotificationFilter === 'all'
                                                            ? 'bg-[#6A994E] text-white'
                                                            : 'bg-[#386641]/30 text-gray-300 hover:bg-[#386641]/50'
                                                        }`}
                                                >
                                                    Tất cả
                                                </button>
                                                <button
                                                    onClick={() => setActiveNotificationFilter('unread')}
                                                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${activeNotificationFilter === 'unread'
                                                            ? 'bg-[#6A994E] text-white'
                                                            : 'bg-[#386641]/30 text-gray-300 hover:bg-[#386641]/50'
                                                        }`}
                                                >
                                                    Chưa đọc ({unreadCount})
                                                </button>
                                            </div>
                                        </div>

                                        {/* Notification List */}
                                        <div className="max-h-[400px] overflow-y-auto">
                                            {filteredNotifications.length > 0 ? (
                                                filteredNotifications.map((notification) => {
                                                    const { title, content } = formatNotificationMessage(notification);
                                                    const icon = getIconForLogType(notification.type);
                                                    const avatar = notification.actor?.avatar || '/logo.svg';
                                                    const timeAgo = formatRelativeTime(notification.created_at);

                                                    return (
                                                        <div
                                                            key={notification.id}
                                                            onClick={() => handleNotificationClick(notification.id, notification.is_read)}
                                                            className={`flex items-start gap-3 p-4 hover:bg-[#386641]/20 cursor-pointer border-b border-[#386641]/20 transition-colors ${!notification.is_read ? 'bg-[#386641]/10' : ''
                                                                }`}
                                                        >
                                                            <div className="relative flex-shrink-0">
                                                                <Image
                                                                    src={avatar}
                                                                    alt=""
                                                                    width={48}
                                                                    height={48}
                                                                    className="w-12 h-12 rounded-full object-cover"
                                                                />
                                                                <div className="absolute -bottom-1 -right-1 bg-[#6A994E] rounded-full p-1 border-2 border-[#2d4a2d]">
                                                                    {getIcons(icon, 12, 'text-white')}
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-semibold text-white mb-1">
                                                                    {title}
                                                                </p>
                                                                <p className="text-sm text-gray-300 mb-2 line-clamp-2">
                                                                    {content}
                                                                </p>
                                                                <p className="text-xs text-[#6A994E] font-medium">
                                                                    {timeAgo}
                                                                </p>
                                                            </div>
                                                            {!notification.is_read && (
                                                                <div className="w-2 h-2 bg-[#6A994E] rounded-full flex-shrink-0 mt-2"></div>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="p-8 text-center">
                                                    <div className="w-16 h-16 mx-auto mb-4 bg-[#386641]/20 rounded-full flex items-center justify-center">
                                                        {getIcons('Bell', 32, 'text-gray-400')}
                                                    </div>
                                                    <p className="text-gray-400">Không có thông báo nào</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        <div className="p-3 border-t border-[#386641]/30">
                                            <button
                                                onClick={markAllAsRead}
                                                className="w-full bg-[#386641]/30 text-white text-sm font-semibold py-2 rounded-lg hover:bg-[#386641]/50 transition-colors"
                                            >
                                                Đánh dấu tất cả đã đọc
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>


                            {/* Language Switcher */}
                            <LanguageSwitcher />

                            {/* Admin Console Button - Only visible to admins */}
                            {userProps.role === 'ADMIN' && (
                                <Link
                                    href="/admin/users"
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300
                                             text-white hover:text-[#6A994E] hover:bg-[#386641]/20
                                             hover:shadow-lg hover:shadow-[#386641]/25 hover:scale-105
                                             border border-[#386641]/30 hover:border-[#6A994E]
                                             focus:outline-none focus:ring-2 focus:ring-[#6A994E]/50"
                                    title="Admin Console"
                                >
                                    {getIcons('Settings', 20, 'transition-colors duration-300')}
                                    <span className="hidden md:inline text-sm font-semibold">{t('header.admin')}</span>
                                </Link>
                            )}

                            {/* User Avatar Dropdown - Rest of existing code... */}
                            <div className="relative">
                                {isUserMenuOpen && (
                                    <div className="absolute top-full right-0 mt-3 w-64 rounded-2xl shadow-2xl p-3 z-50
                                                   bg-gradient-to-b from-[#2d4a2d] to-[#1a2e1a]
                                                   border-2 border-[#386641]/40 shadow-[#386641]/25">
                                        {/* User info header */}
                                        <div className="flex items-center p-3 border-b border-[#386641]/30 mb-3 rounded-xl bg-[#386641]/5">
                                            <div className="h-12 w-12 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0
                                                          bg-gradient-to-br from-[#386641] to-[#6A994E]
                                                          shadow-lg shadow-[#386641]/50 ring-2 ring-[#6A994E]/50">
                                                {userProps.initials}
                                            </div>
                                            <div className="ml-4 truncate">
                                                <p className="text-sm font-semibold text-white truncate">{userProps.name}</p>
                                                <p className="text-xs text-gray-300 truncate">{userProps.email}</p>
                                            </div>
                                        </div>

                                        {/* Menu items */}
                                        <ul className="space-y-1.5">
                                            {HeaderItems.map(item => (
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
                                                            {item.icon && getIcons(item.icon, 20, 'hover:text-[#6A994E] transition-colors duration-300')}
                                                            <span>{item.label}</span>
                                                        </Link>
                                                    ) : item.action && (
                                                        <button
                                                            className='flex items-center gap-4 w-full rounded-xl transition-all duration-300
                                                                     text-sm h-11 px-4 text-white font-medium
                                                                     hover:bg-gradient-to-r hover:from-[#386641]/20 hover:to-[#2d4a2d]/50
                                                                     hover:text-[#6A994E] hover:shadow-lg hover:shadow-[#386641]/20
                                                                     border border-transparent hover:border-[#386641]/30'>
                                                            {item.icon && getIcons(item.icon, 20, 'hover:text-[#6A994E] transition-colors duration-300')}
                                                            <span>{item.label}</span>
                                                        </button>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <button
                                    onClick={() => setIsUserMenuOpen(prev => !prev)}
                                    aria-expanded={isUserMenuOpen}
                                    aria-haspopup="menu"
                                    className='flex items-center gap-3 p-2 rounded-xl transition-all duration-300
                                             text-white hover:text-[#6A994E] hover:bg-[#386641]/20
                                             hover:shadow-lg hover:shadow-[#386641]/25 hover:scale-105
                                             border border-transparent hover:border-[#386641]/30
                                             focus:outline-none focus:ring-2 focus:ring-[#6A994E]/50'
                                >
                                    <div className="relative">
                                        <Image
                                            className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover
                                                     border-2 border-[#6A994E]/60 hover:border-[#6A994E] transition-all duration-300
                                                     shadow-lg hover:shadow-xl hover:shadow-[#386641]/50"
                                            src={userProps.avatar || '/logo.svg'}
                                            alt="User avatar"
                                            width={48}
                                            height={48}
                                        />
                                        {/* Online indicator */}
                                        <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-[#6A994E] border-2 border-[#1a2e1a]"></span>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-2">
                                        <div className="text-left">
                                            <p className="text-sm font-semibold">{userProps.name}</p>
                                            <p className="text-xs text-gray-300">
                                                {userProps.role === 'ADMIN' ? (
                                                    <span className="bg-gradient-to-r from-[#386641] to-[#6A994E] text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                                                        Admin
                                                    </span>
                                                ) : 'Học viên'}
                                            </p>
                                        </div>
                                        {getIcons('ChevronDown', 16, `transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`)}
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
})

Header.displayName = 'Header'

export default Header