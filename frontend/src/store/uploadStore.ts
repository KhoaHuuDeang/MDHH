import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { uploadService } from '@/services/uploadService';
import { FileUploadInterface, UploadMetadata, PaginatedUploads } from '@/types/FileUploadInterface';

interface UploadState {
  // Current upload session state
  files: FileUploadInterface[];
  metadata: UploadMetadata;
  currentStep: 1 | 2 | 3;
  isSubmitting: boolean;
  dragOver: boolean;
  resourceId?: string; // Changed from uploadId to resourceId to match backend
  sessionId?: string; // Temporary session ID from pre-signed URL request
  errors: Record<string, string>;
  
  // Upload history state
  uploadHistory: PaginatedUploads | null;
  isLoadingHistory: boolean;
  
  // Upload controllers for cancellation
  uploadControllers: Map<string, AbortController>;
  
  // Actions
  addFiles: (files: File[]) => Promise<void>;
  requestPreSignedUrls: (fileObjects: FileUploadInterface[]) => Promise<void>; // Added for 2-step pattern
  removeFile: (fileId: string) => void;
  cancelFileUpload: (fileId: string) => void;
  updateFileProgress: (fileId: string, progress: number) => void;
  updateFileStatus: (fileId: string, status: FileUploadInterface['status'], errorMessage?: string) => void;
  retryFileUpload: (fileId: string) => Promise<void>;
  
  // Metadata actions
  updateMetadata: (data: Partial<UploadMetadata>) => void;
  validateMetadata: () => boolean;
  
  // Step management
  nextStep: () => void;
  prevStep: () => void;
  setCurrentStep: (step: 1 | 2 | 3) => void;
  validateStep: (step: number) => boolean;
  
  // Upload flow (updated for 2-step pattern)
  submitUpload: () => Promise<void>;
  resetUpload: () => void;
  
  // Upload history
  loadUploadHistory: (page?: number, limit?: number) => Promise<void>;
  deleteUploadSession: (resourceId: string) => Promise<void>; // Changed to resourceId
  
  // UI state
  setDragOver: (dragOver: boolean) => void;
  setError: (key: string, message: string) => void;
  clearError: (key: string) => void;
  clearAllErrors: () => void;
}

export const useUploadStore = create<UploadState>()(
  persist(
    immer(
      devtools((set, get) => ({
        // Initial state
        files: [],
        metadata: {
          title: '',
          description: '',
          subject: '',
          category: 'other' as const,
          tags: [],
          visibility: 'public' as const,
          thumbnailFile: undefined,
          price: undefined,
        },
        currentStep: 1,
        isSubmitting: false,
        dragOver: false,
        resourceId: undefined,
        sessionId: undefined,
        errors: {},
        uploadHistory: null,
        isLoadingHistory: false,
        uploadControllers: new Map(),

        // File management actions (updated for 2-step pattern)
        addFiles: async (newFiles: File[]) => {
          try {
            set((state) => {
              state.errors = {};
            });

            // Validate files
            const validFiles = newFiles.filter(file => {
              const validTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
              ];
              const maxSize = 50 * 1024 * 1024; // 50MB
              
              if (!validTypes.includes(file.type)) {
                get().setError('fileType', `File ${file.name} has invalid type`);
                return false;
              }
              
              if (file.size > maxSize) {
                get().setError('fileSize', `File ${file.name} exceeds 50MB limit`);
                return false;
              }
              
              return true;
            });

            if (validFiles.length === 0) return;

            // Create file objects
            const fileObjects: FileUploadInterface[] = validFiles.map((file, index) => ({
              id: `${Date.now()}-${index}`,
              name: file.name,
              size: file.size,
              status: 'pending',
              progress: 0,
              uploadedAt: new Date().toISOString(),
              file,
            }));

            set((state) => {
              state.files.push(...fileObjects);
            });

            // Step 1: Get pre-signed URLs (no metadata required for this step)
            await get().requestPreSignedUrls(fileObjects);

          } catch (error) {
            console.error('Error adding files:', error);
            get().setError('upload', 'Failed to add files');
          }
        },

        // Step 1: Request pre-signed URLs and start uploads
        requestPreSignedUrls: async (fileObjects: FileUploadInterface[]) => {
          try {
            const fileMetadata = fileObjects.map(fileObj => ({
              originalFilename: fileObj.name,
              mimetype: fileObj.file!.type,
              fileSize: fileObj.size,
              folder: 'uploads'
            }));

            const response = await uploadService.requestPreSignedUrls(fileMetadata);
            
            set((state) => {
              state.sessionId = response.sessionId;
            });

            // Start parallel uploads with cancellation support
            const uploadPromises = fileObjects.map(async (fileObj, index) => {
              const preSignedData = response.preSignedData[index];
              const controller = new AbortController();
              
              set((state) => {
                state.uploadControllers.set(fileObj.id, controller);
                const file = state.files.find((f: FileUploadInterface) => f.id === fileObj.id);
                if (file) {
                  file.status = 'uploading';
                  file.uploadUrl = preSignedData.preSignedUrl;
                  file.s3Key = preSignedData.s3Key;
                }
              });

              try {
                await uploadService.uploadToS3(
                  fileObj.file!,
                  preSignedData.preSignedUrl,
                  (progress) => get().updateFileProgress(fileObj.id, progress),
                  controller.signal
                );

                get().updateFileStatus(fileObj.id, 'success');
              } catch (error) {
                const err = error as Error;
                if (err.message === 'Upload aborted') {
                  get().updateFileStatus(fileObj.id, 'error', 'Upload cancelled');
                } else {
                  console.error(`Upload failed for ${fileObj.name}:`, error);
                  get().updateFileStatus(fileObj.id, 'error', 'Upload failed');
                }
              } finally {
                set((state) => {
                  state.uploadControllers.delete(fileObj.id);
                });
              }
            });

            await Promise.allSettled(uploadPromises);

          } catch (error) {
            console.error('Error requesting pre-signed URLs:', error);
            get().setError('upload', 'Failed to get upload URLs');
            
            fileObjects.forEach(fileObj => {
              get().updateFileStatus(fileObj.id, 'error', 'Failed to start upload');
            });
          }
        },

        removeFile: (fileId: string) => {
          // Cancel upload if in progress
          get().cancelFileUpload(fileId);
          
          set((state) => {
            state.files = state.files.filter((file: FileUploadInterface) => file.id !== fileId);
          });
        },

        cancelFileUpload: (fileId: string) => {
          const controller = get().uploadControllers.get(fileId);
          if (controller) {
            controller.abort();
          }
        },

        updateFileProgress: (fileId: string, progress: number) => {
          set((state) => {
            const file = state.files.find((f: FileUploadInterface) => f.id === fileId);
            if (file) {
              file.progress = progress;
            }
          });
        },

        updateFileStatus: (fileId: string, status: FileUploadInterface['status'], errorMessage?: string) => {
          set((state) => {
            const file = state.files.find((f: FileUploadInterface) => f.id === fileId);
            if (file) {
              file.status = status;
              file.errorMessage = errorMessage;
              if (status === 'success') {
                file.progress = 100;
              }
            }
          });
        },

        retryFileUpload: async (fileId: string) => {
          try {
            const file = get().files.find((f: FileUploadInterface) => f.id === fileId);
            if (!file || !file.file) throw new Error('File not found');

            set((state) => {
              const targetFile = state.files.find((f: FileUploadInterface) => f.id === fileId);
              if (targetFile) {
                targetFile.status = 'uploading';
                targetFile.progress = 0;
                targetFile.errorMessage = undefined;
              }
            });

            // For retry, we need to request new pre-signed URLs
            const response = await uploadService.retryUpload(fileId);
            const controller = new AbortController();
            
            set((state) => {
              state.uploadControllers.set(fileId, controller);
            });
            
            // Use the first pre-signed URL from the retry response
            const preSignedUrl = response.preSignedData[0]?.preSignedUrl;
            if (!preSignedUrl) {
              throw new Error('No pre-signed URL received for retry');
            }
            
            await uploadService.uploadToS3(
              file.file,
              preSignedUrl,
              (progress) => get().updateFileProgress(fileId, progress),
              controller.signal
            );

            get().updateFileStatus(fileId, 'success');

          } catch (error) {
            console.error('Retry upload failed:', error);
            get().updateFileStatus(fileId, 'error', 'Retry failed');
          } finally {
            set((state) => {
              state.uploadControllers.delete(fileId);
            });
          }
        },

        // Metadata actions
        updateMetadata: (data: Partial<UploadMetadata>) => {
          set((state) => {
            Object.assign(state.metadata, data);
          });
        },

        validateMetadata: (): boolean => {
          const { metadata } = get();
          return !!(metadata.title && metadata.description );
        },

        // Step management
        nextStep: () => {
          const { currentStep, validateStep } = get();
          if (validateStep(currentStep) && currentStep < 3) {
            set((state) => {
              state.currentStep = (currentStep + 1) as 1 | 2 | 3;
            });
          }
        },

        prevStep: () => {
          const { currentStep } = get();
          if (currentStep > 1) {
            set((state) => {
              state.currentStep = (currentStep - 1) as 1 | 2 | 3;
            });
          }
        },

        setCurrentStep: (step: 1 | 2 | 3) => {
          set((state) => {
            state.currentStep = step;
          });
        },

        validateStep: (step: number): boolean => {
          const { files, metadata } = get();
          
          switch (step) {
            case 1:
              return files.some(f => f.status === 'success');
            case 2:
              return !!(metadata.title && metadata.description );
            case 3:
              return true;
            default:
              return false;
          }
        },

        // Upload flow (2-step pattern: uploads already done, now create resource)
        submitUpload: async () => {
          try {
            const { files, metadata } = get();
            const successFiles = files.filter((f: FileUploadInterface) => f.status === 'success');
            
            if (successFiles.length === 0) {
              throw new Error('No successfully uploaded files found');
            }

            set((state) => {
              state.isSubmitting = true;
            });

            // Step 2: Create resource with upload records in database
            const fileData = successFiles.map((file: FileUploadInterface) => ({
              originalFilename: file.name,
              mimetype: file.file!.type,
              fileSize: file.size,
              s3Key: file.s3Key || '', // S3 key from successful upload
            }));

            const response = await uploadService.createResourceWithUploads(metadata, fileData);
            
            set((state) => {
              state.resourceId = response.resource.id;
            });

            // Step 3: Optional completion verification
            if (response.resource.id) {
              await uploadService.completeUpload(response.resource.id);
            }

            // Refresh upload history
            await get().loadUploadHistory();

            // Reset current session
            get().resetUpload();

          } catch (error) {
            console.error('Submit upload failed:', error);
            get().setError('submit', 'Failed to submit upload');
          } finally {
            set((state) => {
              state.isSubmitting = false;
            });
          }
        },

        resetUpload: () => {
          // Cancel all ongoing uploads
          const { uploadControllers } = get();
          uploadControllers.forEach(controller => controller.abort());
          
          set((state) => {
            state.files = [];
            state.metadata = {
              title: '',
              description: '',
              category: state.metadata.category,
              tags: [],
              visibility: state.metadata.visibility,
              thumbnailFile: undefined,
            };
            state.currentStep = 1;
            state.isSubmitting = false;
            state.dragOver = false;
            state.resourceId = undefined;
            state.sessionId = undefined;
            state.errors = {};
            state.uploadControllers.clear();
          });
        },

        // Upload history
        loadUploadHistory: async (page = 1, limit = 10) => {
          try {
            set((state) => {
              state.isLoadingHistory = true;
            });

            const history = await uploadService.getUserUploads(page, limit);
            
            set((state) => {
              state.uploadHistory = history;
            });

          } catch (error) {
            console.error('Failed to load upload history:', error);
            get().setError('history', 'Failed to load upload history');
          } finally {
            set((state) => {
              state.isLoadingHistory = false;
            });
          }
        },

        deleteUploadSession: async (resourceId: string) => {
          try {
            await uploadService.deleteUpload(resourceId);
            
            // Refresh upload history
            await get().loadUploadHistory();

          } catch (error) {
            console.error('Failed to delete upload:', error);
            get().setError('delete', 'Failed to delete upload');
          }
        },

        // UI state
        setDragOver: (dragOver: boolean) => {
          set((state) => {
            state.dragOver = dragOver;
          });
        },

        setError: (key: string, message: string) => {
          set((state) => {
            state.errors[key] = message;
          });
        },

        clearError: (key: string) => {
          set((state) => {
            delete state.errors[key];
          });
        },

        clearAllErrors: () => {
          set((state) => {
            state.errors = {};
          });
        },
      }), {
        name: 'upload-store',
      })
    ),
    {
      name: 'upload-store',
      partialize: (state) => ({
        metadata: state.metadata,
        currentStep: state.currentStep,
        resourceId: state.resourceId,
        sessionId: state.sessionId,
      }),
    }
  )
);