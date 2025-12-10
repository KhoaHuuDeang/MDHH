import { useState, useEffect, useCallback } from "react";
import { csrAxiosClient } from "@/utils/axiosClient";

export type LogType =
  | "COMMENT"
  | "UPVOTE"
  | "DOWNVOTE"
  | "APPROVED"
  | "DECLINED"
  | "UPLOAD_SUCCESS"
  | "UPLOAD_FAILED";

export interface Log {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: LogType;
  entity_type: string | null;
  entity_id: string | null;
  message: string | null;
  is_read: boolean;
  created_at: string;
  actor: {
    id: string;
    displayname: string;
    username: string;
    avatar: string | null;
  } | null;
}

export interface NotificationsResponse {
  logs: Log[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useLogNotifications(
  unreadOnly: boolean = false,
  autoRefresh: boolean = true
) {
  const [notifications, setNotifications] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (unreadOnly) params.append("unread", "true");
      params.append("limit", "20");

      const response = await csrAxiosClient.get(
        `/logs/notifications?${params.toString()}`
      );

      // Handle standardized response format
      const data = response.data.result || response.data;
      setNotifications(data.logs || []);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching notifications:", err);
      setError(err.response?.data?.message || "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  }, [unreadOnly]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await csrAxiosClient.patch(`/logs/${id}/read`);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
    } catch (err: any) {
      console.error("Error marking notification as read:", err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await csrAxiosClient.patch("/logs/read-all");
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, is_read: true }))
      );
    } catch (err: any) {
      console.error("Error marking all notifications as read:", err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    if (autoRefresh) {
      const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [fetchNotifications, autoRefresh]);

  return {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}
