'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import useNotifications from '@/hooks/useNotifications';
import SpinnerLoading from '@/components/layout/spinner';
import { useUserResources } from '@/hooks/useUserResources';
import { getIcon } from '@/utils/getIcon';
import ResourcesListSection from '@/components/uploads/ResourcesListSection';

export default function UploadManagement() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const toast = useNotifications();

    
    useEffect(() => {
        if (status === 'unauthenticated') {
            toast.error("Chưa đăng nhập đừng có mò vào đây");
            router.push('/auth');
        }
    }, [status, router, toast]);


    // Use the custom hook for stats calculation
    const { stats } = useUserResources({
        userId: session?.user?.id,
        accessToken: session?.accessToken,
        enabled: Boolean(session?.user?.id && session?.accessToken)
    });

    if (status === 'loading') {
        return (
          <SpinnerLoading />
        );
    }

    if (!session) return null;

    // User data with fallbacks
    const userData = {
        displayName: session.user?.name || 'Người dùng',
        email: session.user?.email || 'user@example.com',
        avatar: session.user?.avatar,
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

                {/* Resources List Section - Clean component separation */}
                {session?.user?.id && session?.accessToken && (
                    <ResourcesListSection 
                        userId={session.user.id} 
                        accessToken={session.accessToken} 
                    />
                )}

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