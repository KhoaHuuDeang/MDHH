import { 
  UserResourcesResponse, 
  ResourceListItem, 
  ResourceStats,
  FileTypeInfo 
} from '@/types/uploads.types';

/**
 * File type mapping for icons and display names
 */
const FILE_TYPE_MAP: Record<string, FileTypeInfo> = {
  'application/pdf': {
    extension: 'PDF',
    icon: 'FileText',
    color: 'text-red-500',
    displayName: 'PDF Document'
  },
  'application/vnd.ms-powerpoint': {
    extension: 'PPT',
    icon: 'Presentation',
    color: 'text-orange-500',
    displayName: 'PowerPoint'
  },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
    extension: 'PPTX',
    icon: 'Presentation',
    color: 'text-orange-500',
    displayName: 'PowerPoint'
  },
  'application/msword': {
    extension: 'DOC',
    icon: 'FileText',
    color: 'text-blue-500',
    displayName: 'Word Document'
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    extension: 'DOCX',
    icon: 'FileText',
    color: 'text-blue-500',
    displayName: 'Word Document'
  },
  'application/vnd.ms-excel': {
    extension: 'XLS',
    icon: 'Sheet',
    color: 'text-green-500',
    displayName: 'Excel Spreadsheet'
  },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
    extension: 'XLSX',
    icon: 'Sheet',
    color: 'text-green-500',
    displayName: 'Excel Spreadsheet'
  },
  'image/jpeg': {
    extension: 'JPG',
    icon: 'Image',
    color: 'text-purple-500',
    displayName: 'JPEG Image'
  },
  'image/png': {
    extension: 'PNG',
    icon: 'Image',
    color: 'text-purple-500',
    displayName: 'PNG Image'
  },
  'text/plain': {
    extension: 'TXT',
    icon: 'FileText',
    color: 'text-gray-500',
    displayName: 'Text File'
  },
  'default': {
    extension: 'FILE',
    icon: 'File',
    color: 'text-gray-500',
    displayName: 'Unknown File'
  }
};

/**
 * Extract file type information from MIME type
 */
export function getFileTypeInfo(mimeType: string): FileTypeInfo {
  return FILE_TYPE_MAP[mimeType] || FILE_TYPE_MAP['default'];
}

/**
 * Format file size from bytes to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  
  return `${size.toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}

/**
 * Format date to Vietnamese locale string
 */
export function formatUploadDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * Map visibility to status for UI display
 */
export function mapVisibilityToStatus(visibility: 'PUBLIC' | 'PRIVATE'): 'approved' | 'pending' | 'rejected' {
  switch (visibility) {
    case 'PUBLIC':
      return 'approved';
    case 'PRIVATE':
      return 'pending'; // Temporary mapping
    default:
      return 'pending';
  }
}

/**
 * Generate thumbnail URL based on file type
 */
export function generateThumbnail(mimeType: string): string {
  const fileTypeInfo = getFileTypeInfo(mimeType);
  
  // Default thumbnails from Unsplash based on file type
  const thumbnailMap: Record<string, string> = {
    'PDF': 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=100&h=100&fit=crop',
    'PPT': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop',
    'PPTX': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop',
    'DOC': 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=100&h=100&fit=crop',
    'DOCX': 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=100&h=100&fit=crop',
    'XLS': 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=100&h=100&fit=crop',
    'XLSX': 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=100&h=100&fit=crop',
    'JPG': 'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?w=100&h=100&fit=crop',
    'PNG': 'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?w=100&h=100&fit=crop',
    'default': 'https://images.unsplash.com/photo-1568667256549-094345857637?w=100&h=100&fit=crop'
  };

  return thumbnailMap[fileTypeInfo.extension] || thumbnailMap['default'];
}

/**
 * Transform API response to UI-friendly resource list items
 */
export function transformResourcesResponse(response: UserResourcesResponse): ResourceListItem[] {
  return response.resources.map(item => {
    const fileTypeInfo = getFileTypeInfo(item.mime_type);
    
    return {
      id: item.resource_id,
      title: item.resource_details.title,
      description: item.resource_details.description,
      category: item.resource_details.category,
      visibility: item.resource_details.visibility,
      folderName: item.resource_details.folder_name,
      fileType: fileTypeInfo.extension,
      fileSize: formatFileSize(item.file_size),
      uploadDate: formatUploadDate(item.created_at),
      upvotes: item.resource_details.upvotes_count,
      downloads: item.resource_details.downloads_count,
      views: 0, // Will be implemented later
      ratings: item.resource_details.upvotes_count, // Same as upvotes for now
      ratingCount: item.resource_details.upvotes_count, // Same as upvotes for now
      status: mapVisibilityToStatus(item.resource_details.visibility),
      subject: item.resource_details.category, // Use category as subject
      thumbnail: generateThumbnail(item.mime_type)
    };
  });
}

/**
 * Calculate statistics from resource list
 */
export function calculateResourceStats(resources: ResourceListItem[]): ResourceStats {
  return {
    totalDocuments: resources.length,
    totalViews: resources.reduce((sum, item) => sum + item.views, 0),
    totalDownloads: resources.reduce((sum, item) => sum + item.downloads, 0),
    totalUpvotes: resources.reduce((sum, item) => sum + item.upvotes, 0)
  };
}

/**
 * Format statistics for display
 */
export function formatStats(stats: ResourceStats) {
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return [
    { 
      label: 'Tài liệu', 
      value: formatNumber(stats.totalDocuments), 
      icon: 'FileText', 
      color: 'blue' 
    },
    { 
      label: 'Lượt xem', 
      value: formatNumber(stats.totalViews), 
      icon: 'Eye', 
      color: 'green' 
    },
    { 
      label: 'Tải xuống', 
      value: formatNumber(stats.totalDownloads), 
      icon: 'Download', 
      color: 'purple' 
    },
    { 
      label: 'Upvotes', 
      value: formatNumber(stats.totalUpvotes), 
      icon: 'ThumbsUp', 
      color: 'yellow' 
    }
  ];
}