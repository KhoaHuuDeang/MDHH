'use client'
import * as LucideIcons from 'lucide-react';
import { JSX, forwardRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FooterProps {
    style?: React.CSSProperties;
}

const Footer = forwardRef<HTMLElement, FooterProps>(({ style }, ref) => {
    const { t } = useTranslation();

    const getIcons = (icon: string, size = 18, classname?: string): JSX.Element => {
        const IconComponent = LucideIcons[icon as keyof typeof LucideIcons] as LucideIcon;
        return IconComponent ?
            <IconComponent size={size} className={classname} />
            : <></>
    }

    const socialLinks = [
        { name: 'Discord', icon: 'MessageSquare', href: '#', color: 'hover:text-[#5865F2]' },
        { name: 'Facebook', icon: 'Facebook', href: '#', color: 'hover:text-[#1877F2]' },
        { name: 'YouTube', icon: 'Youtube', href: '#', color: 'hover:text-[#FF0000]' }
    ];

    const footerLinks = [
        { name: t('footer.privacy'), href: '/privacy' },
        { name: t('footer.terms'), href: '/terms' },
        { name: t('footer.about'), href: '/about' },
        { name: t('footer.contact'), href: '/contact' }
    ];

    return (
        <footer
            ref={ref}
            style={style}
            className="bg-gradient-to-t from-[#1a2e1a] via-[#2d4a2d] to-[#1a2e1a]
                         border-t-2 border-[#386641]/30 py-8
                         relative
                         before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#386641] before:via-[#6A994E] before:to-[#386641] before:opacity-60">
            <div className="container mx-auto px-4 md:px-6">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Logo & Brand Section */}
                    <div className="flex flex-col items-center md:items-start space-y-4 justify-center">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="relative">
                                <Image
                                    src="/logo.svg"
                                    alt="MDHH Logo"
                                    width={48}
                                    height={48}
                                    className="h-12 w-12 transition-transform duration-300 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 rounded-full ring-2 ring-transparent group-hover:ring-[#6A994E]/50 transition-all duration-300"></div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white group-hover:text-[#6A994E] transition-colors duration-300">
                                    MDHH
                                </h3>
                                <p className="text-sm text-gray-300 group-hover:text-[#6A994E]/80 transition-colors duration-300">
                                    NỀN TẢNG HỌC TẬP SỐ 1 VN
                                </p>
                            </div>
                        </Link>

                        {/* Mission Statement */}
                        <p className="text-sm text-gray-300 text-center md:text-left max-w-xs">
                            {t('footer.mission') || 'HỌC TẬP TÍCH CỰC VẬN MAY SẼ ĐẾN'}
                        </p>
                    </div>



                    {/* Social Media & Contact */}
                    <div className="flex flex-col items-center md:items-end space-y-4">
                        <h4 className="text-lg font-semibold text-white">{t('footer.connectWithUs') || 'Kết Nối Với Chúng Tôi'}</h4>

                        {/* Social Media Links */}
                        <div className="flex gap-3">
                            {socialLinks.map(social => (
                                <a
                                    key={social.name}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`p-3 rounded-xl transition-all duration-300
                                             text-gray-300 ${social.color} hover:bg-[#386641]/20
                                             hover:shadow-lg hover:shadow-[#386641]/25 hover:scale-110
                                             border border-transparent hover:border-[#386641]/30
                                             focus:outline-none focus:ring-2 focus:ring-[#6A994E]/50`}
                                    aria-label={`Follow us on ${social.name}`}
                                >
                                    {getIcons(social.icon, 20)}
                                </a>
                            ))}
                        </div>

                        {/* Contact Info */}
                        <div className="text-sm text-gray-300 space-y-2">
                            <div className="flex items-center gap-2">
                                {getIcons('Mail', 16, 'text-[#6A994E]')}
                                <span>contact@mdhh.edu.vn</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {getIcons('Phone', 16, 'text-[#6A994E]')}
                                <span>+84 123 456 789</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {getIcons('MapPin', 16, 'text-[#6A994E]')}
                                <span>Việt Nam</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-[#386641]/20 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        {/* Copyright */}
                        <div className="text-center md:text-left">
                            <p className="text-sm text-gray-300">
                                {t('footer.copyright')}
                            </p>
                        </div>

                        {/* Footer Links */}
                        <div className="flex flex-wrap justify-center md:justify-end gap-6">
                            {footerLinks.map(link => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-xs text-gray-400 hover:text-[#6A994E] transition-colors duration-300 underline underline-offset-2"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-4 pt-4 border-t border-[#386641]/10">
                        <p className="text-xs text-gray-400 text-center">
                            Nền tảng được phát triển với ❤️ bởi MDHH Team • Phiên bản DEVELOPE
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
})

Footer.displayName = 'Footer'

export default Footer
