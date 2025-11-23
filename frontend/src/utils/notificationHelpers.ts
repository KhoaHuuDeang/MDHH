import { LogType } from '@/hooks/useLogNotifications';

// Map LogType to Lucide icon names
export function getIconForLogType(type: LogType): string {
  const iconMap: Record<LogType, string> = {
    COMMENT: 'MessageCircle',
    UPVOTE: 'ThumbsUp',
    DOWNVOTE: 'ThumbsDown',
    APPROVED: 'CheckCircle',
    DECLINED: 'XCircle',
    UPLOAD_SUCCESS: 'Upload',
    UPLOAD_FAILED: 'AlertCircle',
  };
  return iconMap[type] || 'Bell';
}

// Format timestamp to relative time (e.g., "2 hours ago")
export function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Vừa xong';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ngày trước`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} tuần trước`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} tháng trước`;
}

// Format notification message based on type
export function formatNotificationMessage(log: {
  type: LogType;
  message: string | null;
  actor: { displayname: string } | null;
}): { title: string; content: string } {
  const actorName = log.actor?.displayname || 'Hệ thống';

  const messageMap: Record<LogType, { title: string; content: string }> = {
    COMMENT: {
      title: 'Bình luận mới',
      content: log.message || `${actorName} đã bình luận vào tài liệu của bạn`,
    },
    UPVOTE: {
      title: 'Upvote mới',
      content: log.message || `${actorName} đã upvote tài liệu của bạn`,
    },
    DOWNVOTE: {
      title: 'Downvote mới',
      content: log.message || `${actorName} đã downvote tài liệu của bạn`,
    },
    APPROVED: {
      title: 'Tài liệu được duyệt',
      content: log.message || `${actorName} đã duyệt tài liệu của bạn`,
    },
    DECLINED: {
      title: 'Tài liệu bị từ chối',
      content: log.message || `${actorName} đã từ chối tài liệu của bạn`,
    },
    UPLOAD_SUCCESS: {
      title: 'Tải lên thành công',
      content: log.message || 'Tài liệu của bạn đã được tải lên thành công',
    },
    UPLOAD_FAILED: {
      title: 'Tải lên thất bại',
      content: log.message || 'Có lỗi xảy ra khi tải lên tài liệu',
    },
  };

  return messageMap[log.type] || {
    title: 'Thông báo',
    content: log.message || 'Bạn có thông báo mới',
  };
}
