"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import useNotifications from "@/hooks/useNotifications";
import UserProfileSection from "@/components/profile/UserProfileSection";
import UserStatsSection from "@/components/profile/UserStatsSection";
import ActivityFeedSection from "@/components/profile/ActivityFeedSection";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useNotifications();

  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<Record<string, string>>({});
  const [showSensitiveData, setShowSensitiveData] = useState({ email: false, phone: false });

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("Chưa đăng nhập đừng có mò vào đây");
      router.push("/auth");
    }
  }, [status, router, toast]);

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

  if (!session) return null;

  const userData = {
    displayName: session.user?.name || "Người dùng",
    username: (session.user as any)?.username || "username",
    email: session.user?.email || "user@example.com",
    role: (session.user as any)?.role || "Member",
    birth: (session.user as any)?.birth || "",
    phone: "0987654321", // MOCK
    avatar: (session.user as any)?.avatar,
    banner: "/logo.svg",
    joinDate: "Tháng 7, 2025",
  };

  const stats = [
    { label: "Uploads", value: "47", icon: "Upload", color: "text-[#6A994E]" },
    { label: "Upvotes", value: "324", icon: "ThumbsUp", color: "text-[#6A994E]" },
    { label: "Comments", value: "89", icon: "MessageCircle", color: "text-[#6A994E]" },
    { label: "Downloads", value: "156", icon: "Download", color: "text-[#6A994E]" },
  ];

  const achievements = [
    { title: "First Upload", description: "Tải lên tài liệu đầu tiên", icon: "Upload", unlocked: true },
    { title: "Popular Creator", description: "Nhận 50 upvotes cho tài liệu", icon: "Star", unlocked: true },
    { title: "Active Contributor", description: "Tải lên 10 tài liệu", icon: "Award", unlocked: false },
    { title: "Helper", description: "Bình luận giúp đỡ 25 lần", icon: "Heart", unlocked: false },
  ];

  const recentActivities = [
    { id: 1, type: "upload", title: 'Tải lên "Đề thi Giải tích 1"', time: "2 giờ trước", icon: "Upload" },
    { id: 2, type: "comment", title: 'Bình luận về "Bài tập Cấu trúc dữ liệu"', time: "1 ngày trước", icon: "MessageCircle" },
    { id: 3, type: "upvote", title: 'Nhận upvote cho "Slide Java cơ bản"', time: "2 ngày trước", icon: "ThumbsUp" },
  ];

  const handleEdit = (field: string) => {
    setEditingField(field);
    setTempValues((prev) => ({ ...prev, [field]: (userData as any)[field] ?? "" }));
  };

  const handleTempChange = (field: string, value: string) => {
    setTempValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (field: string) => {
    // TODO: API call to update user data with tempValues[field]
    // console.log("save", field, tempValues[field]);
    toast.success(`${field} đã được cập nhật`);
    setEditingField(null);
  };

  const handleCancel = () => {
    setEditingField(null);
  };

  const toggleSensitiveData = (field: "email" | "phone") => {
    setShowSensitiveData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth" });
  };


  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Take the newest file from input
    const file = e.target.files?.[0];
    if (file) {
      // handle logic later
    }
  }
  const handleBackgroundChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Take the newest file from input
    const file = e.target.files?.[0];
    if (file) {
      // handle logic later
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-gray-800">
      <main className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
        <UserProfileSection
          userData={userData}
          editingField={editingField}
          tempValues={tempValues}
          showSensitiveData={showSensitiveData}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          onTempChange={handleTempChange}
          onToggleSensitiveData={toggleSensitiveData}
          onSignOut={handleSignOut}
          onAvatarChange={handleAvatarChange}
          onBackgroundChange={handleBackgroundChange}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <UserStatsSection stats={stats} achievements={achievements} />
          </div>
          <div className="lg:col-span-1">
            <ActivityFeedSection activities={recentActivities} />
          </div>
        </div>
      </main>
    </div>
  );
}
