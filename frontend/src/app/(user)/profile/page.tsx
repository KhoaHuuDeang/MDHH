"use client";

import { useSession } from "next-auth/react";
import UserProfileSection from "@/components/profile/UserProfileSection";
import UserStatsSection from "@/components/profile/UserStatsSection";
import ActivityFeedSection from "@/components/profile/ActivityFeedSection";

export default function ProfilePage() {
  // Authentication is handled at layout level - no need for guards here
  const { data: session } = useSession();

  // Keep mockdata for activities as requested
  const recentActivities = [
    { id: 1, type: "upload", title: 'Tải lên "Đề thi Giải tích 1"', time: "2 giờ trước", icon: "Upload" },
    { id: 2, type: "comment", title: 'Bình luận về "Bài tập Cấu trúc dữ liệu"', time: "1 ngày trước", icon: "MessageCircle" },
    { id: 3, type: "upvote", title: 'Nhận upvote cho "Slide Java cơ bản"', time: "2 ngày trước", icon: "ThumbsUp" },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-gray-800">
      <main className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
        <UserProfileSection userId={session!.user.id} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <UserStatsSection userId={session!.user.id} />
          </div>
          <div className="lg:col-span-1">
            <ActivityFeedSection activities={recentActivities} />
          </div>
        </div>
      </main>
    </div>
  );
}
