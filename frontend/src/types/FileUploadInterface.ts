export type UploadStatus = 'success' | 'error' | 'uploading';

export interface FileUploadInterface {
  id: string;
  userId?: string;
  name: string;
  size: number;
  status: UploadStatus;
  progress?: number;
  errorMessage?: string;
  uploadedAt?: string;
}

export interface UploadFormData {
  title: string;
  description: string;
  subject: string;
  category: string;
  tags: string[];
}