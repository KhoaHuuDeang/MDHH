"use client";

import { useSessionContext } from "@/contexts/SessionContext";
import UserProfileSection from "@/components/profile/UserProfileSection";
import UserStatsSection from "@/components/profile/UserStatsSection";
import ActivityFeedSection from "@/components/profile/ActivityFeedSection";
import useUserActivities from "@/hooks/useUserActivities";

import { useTranslation } from "react-i18next";

export default function ProfilePage() {
  const { session } = useSessionContext();
  const { t } = useTranslation();
  const { activities, isLoading } = useUserActivities(session!.user.id);

  const recentActivities = activities
    ? activities.slice(0, 3).map((activity) => ({
        id: activity.id,
        type: activity.type.toLowerCase(),
        title: activity.message || activity.type,
        time: new Date(activity.created_at).toLocaleDateString(),
        icon: activity.type === 'UPLOAD_SUCCESS' ? 'Upload' : activity.type === 'UPVOTE' ? 'ThumbsUp' : 'MessageCircle',
      }))
    : [];

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-gray-800">
      <main className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
        <UserProfileSection userId={session!.user.id} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <UserStatsSection userId={session!.user.id} />
          </div>
          <div className="lg:col-span-1">
            <ActivityFeedSection activities={recentActivities} isLoading={isLoading} />
          </div>
        </div>
      </main>
    </div>
  );
}
