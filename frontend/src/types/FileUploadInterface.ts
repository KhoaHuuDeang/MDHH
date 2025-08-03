export interface FileUploadInterface {
  id: string;
  name: string;
  size: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  uploadedAt: string;
  file?: File;
  uploadUrl?: string;
  s3Key?: string;
  errorMessage?: string;
}

export interface UploadMetadata {
  title: string;
  description: string;
  category: DocumentCategory;
  folderId?: string;
  classificationLevelId?: string;
  tags: string[];
  visibility: 'public' | 'private';
}


export interface ResourceMetadata {
  title: string;        // Individual file title
  description: string;  // File-specific description
  category: string;     // Resource category
  visibility: 'public' | 'private';
}


export enum VisibilityType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  RESTRICTED = 'restricted'
}

export enum DocumentCategory {
  LECTURE = 'lecture',
  EXERCISE = 'exercise',
  EXAM = 'exam',
  REFERENCE = 'reference',
  OTHER = 'other'
}

export interface FileUploadMetadata {
  originalFilename: string;
  mimetype: string;
  fileSize: number;
  folder?: string;
}

export interface PreSignedUploadResult {
  uploadUrl: string;
  s3Key: string;
  uploadId: string;
  expiresIn: number;
}

export interface UploadResponse {
  uploadId: string;
  preSignedUrls: PreSignedUploadResult[];
  expiresIn: number;
}

export interface UploadSession {
  id: string;
  title: string;
  description: string;
  subject: string;
  category: DocumentCategory;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  totalFiles: number;
  uploadedFiles: number;
  createdAt: string;
  completedAt?: string;
  files: UploadFile[];
}

export interface UploadFile {
  id: string;
  originalFilename: string;
  s3Key: string;
  fileSize: number;
  mimetype: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  uploadedAt?: string;
}

export interface PaginatedUploads {
  uploads: UploadSession[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };





}