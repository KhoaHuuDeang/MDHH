"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import useNotifications from "@/hooks/useNotifications";
import UserProfileSection from "@/components/profile/UserProfileSection";
import UserStatsSection from "@/components/profile/UserStatsSection";
import ActivityFeedSection from "@/components/profile/ActivityFeedSection";
import { setAuthToken } from "@/services/userService";

export default function ProfilePage() {
  
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useNotifications();

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("Chưa đăng nhập đừng có mò vào đây");
      router.push("/auth");
    }
  }, [status, router, toast]);

  // Set auth token when session changes
  useEffect(() => {
    if (session?.accessToken) {
      setAuthToken(session.accessToken);
    } else {
      setAuthToken(null);
    }
  }, [session?.accessToken]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-[#386641]"></div>
          <p className="text-lg text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!session?.user?.id) return null;

  // Keep mockdata for activities as requested
  const recentActivities = [
    { id: 1, type: "upload", title: 'Tải lên "Đề thi Giải tích 1"', time: "2 giờ trước", icon: "Upload" },
    { id: 2, type: "comment", title: 'Bình luận về "Bài tập Cấu trúc dữ liệu"', time: "1 ngày trước", icon: "MessageCircle" },
    { id: 3, type: "upvote", title: 'Nhận upvote cho "Slide Java cơ bản"', time: "2 ngày trước", icon: "ThumbsUp" },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-gray-800">
      <main className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
        <UserProfileSection userId={session.user.id} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <UserStatsSection userId={session.user.id} />
          </div>
          <div className="lg:col-span-1">
            <ActivityFeedSection activities={recentActivities} />
          </div>
        </div>
      </main>
    </div>
  );
}
