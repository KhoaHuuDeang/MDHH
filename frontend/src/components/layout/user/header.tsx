'use client'
import * as LucideIcons from 'lucide-react';
import { JSX, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SidebarProfileMenuProps } from '@/types/user.types';
import { LucideIcon } from 'lucide-react';
export default function Header({ userProps, HeaderItems }: { userProps: SidebarProfileMenuProps['mockUser'], HeaderItems: SidebarProfileMenuProps['items'] }) {

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const getIcons = (icon: string, size = 18, classname?: string): JSX.Element => {
        const IconComponent = LucideIcons[icon as keyof typeof LucideIcons] as LucideIcon;
        return IconComponent ?
            <IconComponent size={size} className={classname} />
            : <></>
    }
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
                            
                            {/* Logo với hiệu ứng educational */}
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
                        {/* Right Section - Notifications + User */}
                        <div className="flex items-center gap-3">
                            {/* Notification Buttons */}
                            <button 
                                type="button" 
                                className="hidden sm:flex relative p-3 rounded-xl transition-all duration-300
                                         text-white hover:text-[#6A994E] hover:bg-[#386641]/20
                                         hover:shadow-lg hover:shadow-[#386641]/25 hover:scale-105
                                         border border-transparent hover:border-[#386641]/30
                                         focus:outline-none focus:ring-2 focus:ring-[#6A994E]/50"
                            >
                                {getIcons('Bell', 20)}
                                {/* Notification badge */}
                                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#386641] border-2 border-[#6A994E] 
                                               flex items-center justify-center text-xs font-bold text-white">3</span>
                            </button>
                            
                            <button 
                                type="button" 
                                className="hidden md:flex relative p-3 rounded-xl transition-all duration-300
                                         text-white hover:text-[#6A994E] hover:bg-[#386641]/20
                                         hover:shadow-lg hover:shadow-[#386641]/25 hover:scale-105
                                         border border-transparent hover:border-[#386641]/30
                                         focus:outline-none focus:ring-2 focus:ring-[#6A994E]/50"
                            >
                                {getIcons('MessageCircle', 20)}
                                {/* Message badge */}
                                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#6A994E] border-2 border-[#386641] 
                                               flex items-center justify-center text-xs font-bold text-white">7</span>
                            </button>

                            {/* User Avatar Dropdown */}
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
                                                    {item.href && (
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