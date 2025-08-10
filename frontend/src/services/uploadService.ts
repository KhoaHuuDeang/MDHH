
import {
  DocumentCategory,
  FileUploadInterface,
  FileUploadMetadata,
  FolderManagement,
  PaginatedUploads,
  VisibilityType,
} from '@/types/FileUploadInterface';
import { getSession } from 'next-auth/react';


// Backend API response types (matching uploadsService.md patterns)
interface PreSignedUrlResponseDto {
  sessionId: string;
  preSignedData: PreSignedFileData[];
  expiresIn: number;
}

interface PreSignedFileData {
  s3Key: string;
  preSignedUrl: string;
  originalFilename: string;
  fileSize: number;
  mimetype: string;
}

interface ResourceResponseDto {
  resource: {
    id: string;
    title: string;
    description: string;
    category?: string;
    visibility: string;
    status: string;
    created_at: Date;
  };
  uploads: {
    id: string;
    user_id: string;
    resource_id: string;
    file_name: string;
    mime_type: string;
    file_size: number;
    s3_key: string;
    status: string;
    created_at: Date;
  }[];
}


interface CreateResourceWithUploadsPayload {
  title: string;
  description: string;
  visibility: string;
  folderManagement: FolderManagement;
  files: FileWithMetadataDto[];
}
interface FileWithMetadataDto {
  originalFilename: string;
  mimetype: string;
  fileSize: number;
  s3Key: string;
  title: string;
  description: string;
  category: DocumentCategory;
  fileVisibility: VisibilityType;
}
export interface FolderManagementDto {
  selectedFolderId?: string;
  newFolderData?: {
    name: string;
    description: string;
    folderClassificationId: string;
    folderTagIds?: string[];
  };
}
export interface UploadCreationData {
  originalFilename: string;
  mimetype: string;
  fileSize: number;
  s3Key: string;
  title: string;
  description: string;
  category: string;
  fileVisibility: VisibilityType;
}
export interface ResourceCreationWithUploadDto {
  title: string;
  description: string;
  visibility: string;
  folderManagement: FolderManagementDto;
  files: UploadCreationData[];
}
class UploadService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL;
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    let lastError: Error;
    const token = await this.getToken();
    if (!token) {
      throw new Error('Authentication token is missing');
    }
    console.log()
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(endpoint, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await this.getToken()}`,
            ...options.headers,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();

          if (response.status === 409 && errorText.includes('folder')) {
            throw new Error('Folder name already exists. Please choose a different name.');
          }

          if (response.status === 422 && errorText.includes('classification')) {
            throw new Error('Invalid classification level. Please select a valid classification.');
          }

          if (response.status === 400 && errorText.includes('metadata')) {
            throw new Error('File metadata validation failed. Please check all required fields.');
          }


          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }


        return await response.json();
      } catch (error) {
        lastError = error as Error;

        if (attempt < this.maxRetries) {
          await this.delay(this.retryDelay * attempt);
          continue;
        }
      }
    }

    throw lastError!;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Step 1: Request pre-signed URLs (2-step pattern from uploadsService.md)
   * No DB writes, only validation and URL generation
   */
  async requestPreSignedUrls(
    files: FileUploadMetadata[]
  ): Promise<PreSignedUrlResponseDto> {
    return this.makeRequest<PreSignedUrlResponseDto>(`${this.baseUrl}/uploads/request-presigned-urls`, {
      method: 'POST',
      body: JSON.stringify({
        files: files.map(file => ({
          originalFilename: file.originalFilename,
          mimetype: file.mimetype,
          fileSize: file.fileSize,
          folderId: file.folder
        }))
      }),
    });
  }

  /**
   * Step 2: Create resource with uploads (database transaction)
   * Creates both resource and upload records atomically
   */
  async createResourceWithUploads(
    payload: CreateResourceWithUploadsPayload
  ): Promise<ResourceResponseDto> {
    const body: any = {
      title: payload.title,
      description: payload.description,
      visibility: payload.visibility?.toUpperCase() ,
      folderManagement: {}
    };
    console.log('PAYLOAD : ', payload);
    console.log('PAYLOAD NEW FOLDER : ', payload.folderManagement.newFolderData);
    console.log('PAYLOAD SELECTED FOLDER : ', payload.folderManagement.selectedFolderId);

    if (payload.folderManagement.selectedFolderId === undefined || !payload.folderManagement.newFolderData) {
      body.folderManagement.newFolderData = payload.folderManagement.newFolderData;
    }else{
      body.folderManagement.selectedFolderId = payload.folderManagement.selectedFolderId;
    }
    console.log('SERVICE KKKK : ', body);
    body.files = payload.files;

    return this.makeRequest<ResourceResponseDto>(
      `${this.baseUrl}/uploads/create-resource`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );
  }


  /**
   * Upload file to S3 using pre-signed URL
   * Direct browser-to-S3 upload with progress tracking
   */
  async uploadToS3(
    file: File,
    preSignedUrl: string,
    onProgress?: (progress: number) => void,
    signal?: AbortSignal
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (signal) {
        signal.addEventListener('abort', () => {
          xhr.abort();
          reject(new Error('Upload aborted'));
        });
      }

      // Enhanced progress tracking with immediate callback
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded * 100) / event.total);
          console.log(`📊 S3 Upload progress: ${progress}%`);

          // Use requestAnimationFrame for smooth UI updates
          requestAnimationFrame(() => {
            onProgress(progress);
          });
        }
      };

      // Ensure we start with 0% progress
      xhr.upload.onloadstart = () => {
        console.log(`🚀 S3 Upload started for file: ${file.name}`);
        if (onProgress) {
          requestAnimationFrame(() => {
            onProgress(0);
          });
        }
      };

      xhr.onload = () => {
        console.log(`✅ S3 Upload completed with status: ${xhr.status}`);
        if (xhr.status === 200 || xhr.status === 204) {
          // Ensure 100% progress on success
          if (onProgress) {
            requestAnimationFrame(() => {
              onProgress(100);
            });
          }
          resolve();
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        console.error(`❌ S3 Upload network error for file: ${file.name}`);
        reject(new Error('Network error during upload'));
      };

      xhr.ontimeout = () => {
        console.error(`⏰ S3 Upload timeout for file: ${file.name}`);
        reject(new Error('Upload timeout'));
      };

      xhr.open('PUT', preSignedUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.timeout = 300000; // 5 minutes

      console.log(`📤 Starting S3 upload for: ${file.name} (${file.size} bytes)`);
      xhr.send(file);
    });
  }

  /**
   * Step 3: Complete upload process (optional verification)
   * Verifies S3 uploads and updates status to completed
   */
  async completeUpload(resourceId: string): Promise<void> {
    await this.makeRequest(`${this.baseUrl}/uploads/complete/${resourceId}`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  /**
   * Get user's uploads with pagination
   * Matches backend /uploads/my-uploads endpoint
   */
  async getUserUploads(page = 1, limit = 10, status?: string): Promise<PaginatedUploads> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status) {
      params.append('status', status);
    }

    return this.makeRequest<PaginatedUploads>(
      `${this.baseUrl}/uploads/my-uploads?${params.toString()}`,
      { method: 'GET' }
    );
  }

  /**
   * Delete resource and associated files
   * Matches backend DELETE /uploads/resource/:resourceId
   */
  async deleteUpload(resourceId: string): Promise<void> {
    await this.makeRequest(`${this.baseUrl}/uploads/resource/${resourceId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Generate download URL for uploaded file
   * Matches backend GET /uploads/download/:uploadId
   */
  async generateDownloadUrl(uploadId: string): Promise<{ downloadUrl: string }> {
    return this.makeRequest<{ downloadUrl: string }>(
      `${this.baseUrl}/uploads/download/${uploadId}`,
      { method: 'GET' }
    );
  }




  async deleteS3File(s3Key: string): Promise<void> {
    return this.makeRequest<void>(`${this.baseUrl}/uploads/delete-s3-file`, {
      method: 'DELETE',
      body: JSON.stringify({ s3Key }),
    });
  }

  // Batch deletion for multiple files
  async deleteMultipleS3Files(s3Keys: string[]): Promise<void> {
    return this.makeRequest<void>(`${this.baseUrl}/uploads/delete-multiple-s3-files`, {
      method: 'DELETE',
      body: JSON.stringify({ s3Keys }),
    });
  }
  /**
   * Retry failed upload
   * Uses the retry endpoint for failed uploads
   */
  async retryUpload(uploadId: string): Promise<PreSignedUrlResponseDto> {
    return this.makeRequest<PreSignedUrlResponseDto>(`${this.baseUrl}/uploads/retry`, {
      method: 'POST',
      body: JSON.stringify({
        uploadId,
      }),
    });
  }

  /**
   * Get JWT token from NextAuth session (not localStorage)
   * This fixes the 401 authentication errors
   */
  private async getToken(): Promise<string> {
    if (typeof window !== 'undefined') {
      const session = await getSession();
      return session?.accessToken!;
    }
    return '';
  }
}

export const uploadService = new UploadService();