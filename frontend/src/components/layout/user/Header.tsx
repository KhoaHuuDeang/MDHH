'use client'
import * as LucideIcons from 'lucide-react';
import { JSX, useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SidebarProfileMenuProps } from '@/types/user.types';
import { LucideIcon } from 'lucide-react';

export default function Header({ userProps, HeaderItems }: { userProps: SidebarProfileMenuProps['mockUser'], HeaderItems: SidebarProfileMenuProps['items'] }) {

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

    const handleAction = (action: string, item: string) => {
        console.log(`Action: ${action} for item: ${item}`);
    };

    // Mock data for notifications
    const notifications = [
        {
            id: 1,
            type: 'document',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
            title: 'Tài liệu mới được tải lên',
            content: 'Admin đã tải lên tài liệu "Bài tập Toán cao cấp A1" trong môn Toán',
            time: '2 giờ trước',
            isRead: false,
            icon: 'Upload'
        },
        {
            id: 2,
            type: 'comment',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=100&h=100&fit=crop&crop=face',
            title: 'Bình luận mới',
            content: 'Nguyễn Thị Mai đã bình luận trong tài liệu "Giáo trình Lập trình Python"',
            time: '5 giờ trước',
            isRead: false,
            icon: 'MessageCircle'
        },
        {
            id: 3,
            type: 'like',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
            title: 'Upvote mới',
            content: 'Trần Văn Nam đã upvote tài liệu của bạn "Đề thi Vật lý đại cương"',
            time: '1 ngày trước',
            isRead: true,
            icon: 'ThumbsUp'
        },
        {
            id: 4,
            type: 'achievement',
            avatar: '/logo.svg',
            title: 'Thành tích mới',
            content: 'Chúc mừng! Bạn đã đạt được thành tích "Popular Creator"',
            time: '2 ngày trước',
            isRead: true,
            icon: 'Award'
        }
    ];

    const messages = [
        {
            id: 1,
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
            name: 'Nguyễn Văn A',
            lastMessage: 'Cảm ơn bạn đã chia sẻ tài liệu!',
            time: '10 phút trước',
            isRead: false
        },
        {
            id: 2,
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=100&h=100&fit=crop&crop=face',
            name: 'Trần Thị B',
            lastMessage: 'Bạn có thể gửi thêm tài liệu về chủ đề này không?',
            time: '2 giờ trước',
            isRead: false
        },
        {
            id: 3,
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
            name: 'Lê Văn C',
            lastMessage: 'OK, tôi sẽ kiểm tra lại',
            time: '1 ngày trước',
            isRead: true
        }
    ];

    const filteredNotifications = activeNotificationFilter === 'all'
        ? notifications
        : notifications.filter(n => !n.isRead);

    const unreadCount = notifications.filter(n => !n.isRead).length;
    const unreadMessageCount = messages.filter(m => !m.isRead).length;

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationOpen(false);
            }
            if (messageRef.current && !messageRef.current.contains(event.target as Node)) {
                setIsMessageOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        
        <header className="sticky top-0 z-40 shadow-2xl border-b-2 border-[#386641]/30
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
                            <Link href="/" className="flex-shrink-0 group">
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

                        {/* Right Section - Notifications + Messages + User */}
                        <div className="flex items-center gap-3">
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
                                                filteredNotifications.map((notification) => (
                                                    <div
                                                        key={notification.id}
                                                        className={`flex items-start gap-3 p-4 hover:bg-[#386641]/20 cursor-pointer border-b border-[#386641]/20 transition-colors ${!notification.isRead ? 'bg-[#386641]/10' : ''
                                                            }`}
                                                    >
                                                        <div className="relative flex-shrink-0">
                                                            <Image
                                                                src={notification.avatar}
                                                                alt=""
                                                                width={48}
                                                                height={48}
                                                                className="w-12 h-12 rounded-full object-cover"
                                                            />
                                                            <div className="absolute -bottom-1 -right-1 bg-[#6A994E] rounded-full p-1 border-2 border-[#2d4a2d]">
                                                                {getIcons(notification.icon, 12, 'text-white')}
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-white mb-1">
                                                                {notification.title}
                                                            </p>
                                                            <p className="text-sm text-gray-300 mb-2 line-clamp-2">
                                                                {notification.content}
                                                            </p>
                                                            <p className="text-xs text-[#6A994E] font-medium">
                                                                {notification.time}
                                                            </p>
                                                        </div>
                                                        {!notification.isRead && (
                                                            <div className="w-2 h-2 bg-[#6A994E] rounded-full flex-shrink-0 mt-2"></div>
                                                        )}
                                                    </div>
                                                ))
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
                                            <button className="w-full bg-[#386641]/30 text-white text-sm font-semibold py-2 rounded-lg hover:bg-[#386641]/50 transition-colors">
                                                Xem tất cả thông báo
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Message Button */}
                            <div className="relative" ref={messageRef}>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsMessageOpen(!isMessageOpen);
                                        setIsNotificationOpen(false);
                                    }}
                                    className="hidden md:flex relative p-3 rounded-xl transition-all duration-300
                                             text-white hover:text-[#6A994E] hover:bg-[#386641]/20
                                             hover:shadow-lg hover:shadow-[#386641]/25 hover:scale-105
                                             border border-transparent hover:border-[#386641]/30
                                             focus:outline-none focus:ring-2 focus:ring-[#6A994E]/50"
                                >
                                    {getIcons('MessageCircle', 20)}
                                    {unreadMessageCount > 0 && (
                                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#6A994E] border-2 border-[#386641] 
                                                       flex items-center justify-center text-xs font-bold text-white">
                                            {unreadMessageCount}
                                        </span>
                                    )}
                                </button>

                                {/* Message Dropdown */}
                                {isMessageOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-[340px] bg-[#2d4a2d] rounded-xl shadow-2xl border-2 border-[#386641]/40 z-50 overflow-hidden">
                                        {/* Header */}
                                        <div className="p-4 border-b border-[#386641]/30">
                                            <div className="flex justify-between items-center">
                                                <h2 className="text-xl font-bold text-white">Tin nhắn</h2>
                                                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#386641]/20 hover:bg-[#386641]/40 transition-colors">
                                                    {getIcons('Edit3', 16, 'text-white')}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Message List */}
                                        <div className="max-h-[400px] overflow-y-auto">
                                            {messages.map((message) => (
                                                <div
                                                    key={message.id}
                                                    className={`flex items-center gap-3 p-4 hover:bg-[#386641]/20 cursor-pointer border-b border-[#386641]/20 transition-colors ${!message.isRead ? 'bg-[#386641]/10' : ''
                                                        }`}
                                                >
                                                    <div className="relative flex-shrink-0">
                                                        <Image
                                                            src={message.avatar}
                                                            alt=""
                                                            width={40}
                                                            height={40}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                        {!message.isRead && (
                                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#6A994E] rounded-full border border-[#2d4a2d]"></div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <p className="text-sm font-semibold text-white truncate">
                                                                {message.name}
                                                            </p>
                                                            <p className="text-xs text-gray-400 ml-2 flex-shrink-0">
                                                                {message.time}
                                                            </p>
                                                        </div>
                                                        <p className="text-sm text-gray-300 truncate">
                                                            {message.lastMessage}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Footer */}
                                        <div className="p-3 border-t border-[#386641]/30">
                                            <button className="w-full bg-[#386641]/30 text-white text-sm font-semibold py-2 rounded-lg hover:bg-[#386641]/50 transition-colors">
                                                Xem tất cả tin nhắn
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

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
                                                            onClick={() => item.action && handleAction(item.action, item.label)}
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
                                            src="https://lh3.googleusercontent.com/a/ACg8ocJjqTxlK60D1xNMf5mP2f4-wHDBzQkTZdHaNxLKLNGDjw=s96-c"
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
                                            <p className="text-xs text-gray-300">Học viên</p>
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
}