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


export interface FileMetadata {
  title: string;
  description: string;
  category: DocumentCategory;
  visibility: VisibilityType;
}


export interface FolderManagement {
  selectedFolderId?: string;
  newFolderData?: {
    name: string;
    description: string;
    folderClassificationId: string;
    folderTagIds?: string[];
  };
  mode?: 'select' | 'create';
}

export enum VisibilityType {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE'
}

export enum DocumentCategory {
  LECTURE = 'LECTURE',
  EXERCISE = 'EXERCISE',
  EXAM = 'EXAM',
  REFERENCE = 'REFERENCE',
  OTHER = 'OTHER'
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