// Upload Types
export interface AdminUploadItem {
  id: string;
  user_id: string | null;
  resource_id: string | null;
  file_name: string | null;
  mime_type: string | null;
  file_size: number | null;
  s3_key: string | null;
  status: string | null;
  moderation_status: string | null;
  moderation_reason: string | null;
  moderated_by: string | null;
  moderated_at: string | null;
  created_at: string | null;
  uploaded_at: string | null;
  user?: {
    id: string;
    username: string | null;
    email: string | null;
  };
  resource?: {
    id: string;
    title: string | null;
  };
}

export interface AdminUploadsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'PENDING' | 'COMPLETED' | 'FAILED';
  moderation_status?: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AdminUploadsResponse {
  uploads: AdminUploadItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Comment Types
export interface AdminCommentItem {
  id: string;
  user_id: string | null;
  resource_id: string | null;
  folder_id: string | null;
  parent_id: string | null;
  content: string | null;
  is_deleted: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  user?: {
    id: string;
    username: string | null;
    email: string | null;
  };
  resource?: {
    id: string;
    title: string | null;
  };
  folder?: {
    id: string;
    name: string | null;
  };
}

export interface AdminCommentsQuery {
  page?: number;
  limit?: number;
  search?: string;
  is_deleted?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AdminCommentsResponse {
  comments: AdminCommentItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Folder Types
export interface AdminFolderItem {
  id: string;
  name: string | null;
  description: string | null;
  visibility: string | null;
  user_id: string;
  classification_level_id: string;
  created_at: string | null;
  updated_at: string | null;
  user?: {
    id: string;
    username: string | null;
    email: string | null;
  };
  classification_level?: {
    id: string;
    name: string | null;
  };
  _count?: {
    folder_files: number;
    comments: number;
    follows: number;
  };
}

export interface AdminFoldersQuery {
  page?: number;
  limit?: number;
  search?: string;
  visibility?: 'PUBLIC' | 'PRIVATE';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AdminFoldersResponse {
  folders: AdminFolderItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
