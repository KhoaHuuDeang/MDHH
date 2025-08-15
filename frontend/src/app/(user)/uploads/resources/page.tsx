'use client'
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import Image from 'next/image';
import useNotifications from '@/hooks/useNotifications';

export default function UploadsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const toast = useNotifications();
    
    const [activeTab, setActiveTab] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'date' | 'views' | 'ratings'>('date');

    const getIcon = (iconName: string, size = 20, className?: string) => {
        const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as LucideIcon;
        return IconComponent ? <IconComponent size={size} className={className} /> : null;
    };

    useEffect(() => {
        if (status === 'unauthenticated') {
            toast.error("Chưa đăng nhập đừng có mò vào đây");
            router.push('/auth');
        }
    }, [status, router, toast]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Đang tải thông tin...</p>
                </div>
            </div>
        );
    }

    if (!session) return null;

    // User data with fallbacks
    const userData = {
        displayName: session.user?.name || 'Người dùng',
        email: session.user?.email || 'user@example.com',
        avatar: session.user?.avatar,
    };

    // Mock data for uploads
    const uploads = [
        {
            id: 1,
            title: 'Bài giảng Hệ Cơ sở dữ liệu',
            description: 'Tổng hợp các slide bài giảng môn Hệ cơ sở dữ liệu, bao gồm các chủ đề về mô hình quan hệ, SQL, và tối ưu hóa truy vấn.',
            fileType: 'PDF',
            fileSize: '2.5 MB',
            uploadDate: '2025-07-15',
            views: 1234,
            downloads: 56,
            ratings: 15,
            ratingCount: 15,
            status: 'approved',
            subject: 'Hệ CSDL',
            category: 'Bài giảng',
            thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=100&h=100&fit=crop'
        },
        {
            id: 2,
            title: 'Đề thi cuối kỳ Giải tích 1',
            description: 'Đề thi có đáp án chi tiết, giúp sinh viên ôn tập hiệu quả cho kỳ thi cuối kỳ.',
            fileType: 'PDF',
            fileSize: '1.2 MB',
            uploadDate: '2025-07-12',
            views: 0,
            downloads: 0,
            ratings: 0,
            ratingCount: 0,
            status: 'rejected',
            rejectionReason: 'Slide bài giảng không được phép.',
            subject: 'Giải tích 1',
            category: 'Đề thi',
            thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop'
        }
    ];

    const stats = [
        { label: 'Tài liệu', value: '2', icon: 'FileText', color: 'blue' },
        { label: 'Lượt xem', value: '1.2K', icon: 'Eye', color: 'green' },
        { label: 'Tải xuống', value: '56', icon: 'Download', color: 'purple' },
        { label: 'Upvotes', value: '15', icon: 'ThumbsUp', color: 'yellow' }
    ];

    const filteredUploads = uploads.filter(upload => {
        const matchesTab = activeTab === 'all' || upload.status === activeTab;
        const matchesSearch = upload.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            upload.subject.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const getStatusBadge = (status: string, rejectionReason?: string) => {
        const statusConfig = {
            approved: { 
                color: 'bg-green-100 text-green-800', 
                icon: 'CheckCircle', 
                text: 'Approved' 
            },
            pending: { 
                color: 'bg-yellow-100 text-yellow-800', 
                icon: 'Clock', 
                text: 'Pending' 
            },
            rejected: { 
                color: 'bg-red-100 text-red-800', 
                icon: 'XCircle', 
                text: 'Rejected' 
            }
        };

        const config = statusConfig[status as keyof typeof statusConfig];
        return (
            <div className="flex flex-col">
                <span className={`inline-flex items-center gap-1.5 ${config.color} text-xs font-semibold px-2.5 py-1 rounded-full mb-1`}>
                    {getIcon(config.icon, 12)}
                    {config.text}
                </span>
                {status === 'rejected' && rejectionReason && (
                    <p className="text-xs text-red-600 text-left md:text-right">
                        Lý do: {rejectionReason}
                    </p>
                )}
            </div>
        );
    };
    return (
        <div className="min-h-screen bg-[#F7F8FA] text-gray-800">
            <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
                {/* Enhanced Header Section */}
                <section className="bg-gradient-to-r from-white to-gray-50 p-8 rounded-2xl shadow-lg border border-gray-200">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left Side: User Info */}
                        <div className="flex items-start gap-6 flex-1">
                            <div className="relative">
                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white shadow-lg overflow-hidden">
                                    {userData.avatar ? (
                                        <Image
                                            src={userData.avatar}
                                            alt="User avatar"
                                            width={96}
                                            height={96}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                                            {userData.displayName.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{userData.displayName}</h1>
                                <div className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer mb-3">
                                    {getIcon('GraduationCap', 16)}
                                    <span>Trường Đại học Nguyễn Tất Thành</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {stats.map((stat, index) => (
                                <div
                                    key={index}
                                    className={`bg-white rounded-2xl p-4 border hover:bg-gray-100 group-hover:bg-[#386641] text-[#6A994E] group-hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg group`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`h-12 w-12 rounded-full flex items-center justify-center bg-gray-100 group-hover:bg-[#386641] text-[#6A994E] group-hover:text-white transition-all`}>
                                            {getIcon(stat.icon, 24)}
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                                            <div className="text-gray-500 text-sm">{stat.label}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Uploads Management Section */}
                <section className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    {/* Header with Tabs and Controls */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Quản lý tài liệu</h2>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { key: 'all', label: 'Tất cả', count: uploads.length },
                                        { key: 'approved', label: 'Đã duyệt', count: uploads.filter(u => u.status === 'approved').length },
                                        { key: 'pending', label: 'Chờ duyệt', count: uploads.filter(u => u.status === 'pending').length },
                                        { key: 'rejected', label: 'Bị từ chối', count: uploads.filter(u => u.status === 'rejected').length }
                                    ].map(tab => (
                                        <button
                                            key={tab.key}
                                            onClick={() => setActiveTab(tab.key as any)}
                                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                                                activeTab === tab.key
                                                    ? 'bg-blue-500 text-white shadow-lg'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            {tab.label} ({tab.count})
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Search and Sort Controls */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm tài liệu..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto"
                                    />
                                    {getIcon('Search', 20, 'absolute left-3 top-2.5 text-gray-400')}
                                </div>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="date">Sắp xếp theo ngày</option>
                                    <option value="views">Sắp xếp theo lượt xem</option>
                                    <option value="ratings">Sắp xếp theo đánh giá</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Document List */}
                    <div className="grid gap-6 p-6">
                        {filteredUploads.length > 0 ? (
                            filteredUploads.map((upload) => (
                                <div key={upload.id} className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow duration-300 border border-gray-200">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Left Part */}
                                        <div className="flex-1">
                                            <div className="flex items-start gap-4">
                                                <Image
                                                    src={upload.thumbnail}
                                                    alt="thumbnail"
                                                    width={60}
                                                    height={80}
                                                    className="w-16 h-20 rounded-lg object-cover border bg-white"
                                                />
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                                                        {upload.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mt-1 mb-3 line-clamp-2">
                                                        {upload.description}
                                                    </p>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500 border-b border-gray-200 pb-3 mb-3">
                                                        <span className="flex items-center gap-1.5">
                                                            {getIcon('BookOpen', 14)}
                                                            {upload.subject}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            {getIcon('Tag', 14)}
                                                            {upload.category}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            {getIcon('Calendar', 14)}
                                                            {new Date(upload.uploadDate).toLocaleDateString('vi-VN')}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
                                                        <div className="flex items-center gap-1 font-medium">
                                                            {getIcon('Eye', 16, 'text-blue-500')}
                                                            {upload.views.toLocaleString()}
                                                        </div>
                                                        <div className="flex items-center gap-1 font-medium">
                                                            {getIcon('Download', 16, 'text-green-500')}
                                                            {upload.downloads}
                                                        </div>
                                                        <div className="flex items-center gap-1 font-medium">
                                                            {getIcon('Star', 16, 'text-purple-500')}
                                                            {upload.ratingCount} Ratings
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Right Part */}
                                        <div className="flex flex-col justify-between items-start md:items-end gap-4 md:w-48">
                                            {getStatusBadge(upload.status, upload.rejectionReason)}
                                            <div className="flex gap-2">
                                                <button className="flex items-center justify-center gap-2 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                                                    Xem
                                                </button>
                                                <button className="flex items-center justify-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm">
                                                    Xóa
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center">
                                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                    {getIcon('FileText', 48, 'text-gray-400')}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy tài liệu</h3>
                                <p className="text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Quick Upload Button */}
                <div className="fixed bottom-8 right-8">
                    <button className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group">
                        {getIcon('Plus', 28)}
                        <span className="absolute right-full mr-3 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Tải lên tài liệu mới
                        </span>
                    </button>
                </div>
            </main>
        </div>
    );
}