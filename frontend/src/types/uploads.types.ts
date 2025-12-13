// Frontend interfaces matching backend response structure for resources listing

import { VisibilityType } from "./FileUploadInterface";

export interface UserResourcesResponse {
  resources: ResourceItemResponse[];
  pagination: PaginationResponse;
}

export interface ResourceItemResponse {
  resource_id: string;
  user_id: string;
  file_size: number;
  mime_type: string;
  created_at: string; // ISO string from API
  moderation_status: 'APPROVED' | 'PENDING_APPROVAL' | 'REJECTED';
  moderation_reason?: string | null;
  resource_details: ResourceDetailsResponse;
}

export interface ResourceDetailsResponse {
  title: string;
  description: string;
  visibility: VisibilityType;
  category: string;
  folder_name: string;
  upvotes_count: number;
  downloads_count: number;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Transformed interface for UI display
export interface ResourceListItem {
  id: string;           // resource_id
  title: string;
  description: string;
  category: string;
  visibility: VisibilityType;
  folderName: string;   // folder_name
  fileType: string;     // extracted from mime_type
  fileSize: string;     // formatted file_size (e.g., "2.5 MB")
  uploadDate: string;   // formatted created_at
  upvotes: number;      // upvotes_count
  downloads: number;    // downloads_count
  views: number;        // Will be 0 for now, to be implemented later
  ratings: number;      // Same as upvotes for now
  ratingCount: number;  // Same as upvotes for now
  status: 'approved' | 'pending' | 'rejected';  // derived from visibility
  subject: string;      // Same as category for now
  thumbnail: string;    // Default thumbnail based on file type
}

// Query parameters for API requests
export interface GetResourcesParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

// Statistics for the user profile section
export interface ResourceStats {
  totalDocuments: number;
  totalViews: number;
  totalDownloads: number;
  totalUpvotes: number;
}

// Status badge configuration
export interface StatusBadgeConfig {
  color: string;
  icon: string;
  text: string;
}

// File type mapping for icons and display
export interface FileTypeInfo {
  extension: string;
  icon: string;
  color: string;
  displayName: string;
}