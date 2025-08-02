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

  // Upload controllers for cancellation - using Record instead of Map for Immer compatibility
  uploadControllers: Record<string, AbortController>;

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
        // Initial states
        files: [],
        metadata: {
          title: '',
          description: '',
          subject: '',
          category: 'other' as const,
          tags: [],
          visibility: 'public' as const,
          thumbnailFile: undefined,
        },
        currentStep: 1,
        isSubmitting: false,
        dragOver: false,
        resourceId: undefined,
        sessionId: undefined,
        errors: {},
        uploadHistory: null,
        isLoadingHistory: false,
        uploadControllers: {}, // Initialize as empty object instead of Map
        // File management actions (updated for 2-step pattern)
        addFiles: async (newFiles: File[]) => {
          try {
            set((state) =>{
              state.errors = {}
            })

            // Validate files
              const validTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
              ];
              const maxSize = 50 * 1024 * 1024; // 50MB

             const validFiles = newFiles.reduce<{
              valid : File[];
              error : Record<string,string>
             }>((acc,file)=>{
                if(!validTypes.includes(file.type)){
                  acc.error[file.name] = `File ${file.name} has invalid type`;
                }
                else if(file.size > maxSize){
                  acc.error[file.name] = `File ${file.name} exceeds 50MB limit`;
                }
                else{
                  acc.valid.push(file)
                }
                return acc;
             },{valid : [],error : {}})
            // Create file objects
            const fileObjects: FileUploadInterface[] = validFiles.valid.map((file, index) => ({
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

        // Request pre-signed URLs and start uploads
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

              // OPTIMIZATION: Single atomic state update for all initial setup
              set((state) => {
                state.uploadControllers[fileObj.id] = controller; // Object assignment instead of Map.set
                const file = state.files.find((f: FileUploadInterface) => f.id === fileObj.id);
                if (file) {
                  // Update all properties atomically to prevent race conditions
                  file.status = 'uploading';
                  file.progress = 0;
                  file.uploadUrl = preSignedData.preSignedUrl;
                  file.s3Key = preSignedData.s3Key;
                  file.errorMessage = undefined; // Clear any previous errors
                }
              });

              try {
                // Add small delay to ensure UI updates are rendered
                await new Promise(resolve => setTimeout(resolve, 10));
                
                await uploadService.uploadToS3(
                  fileObj.file!,
                  preSignedData.preSignedUrl,
                  (progress) => {
                    // Optimized progress callback with bounds checking
                    const validProgress = Math.min(100, Math.max(0, Math.round(progress)));
                    get().updateFileProgress(fileObj.id, validProgress);
                  },
                  controller.signal
                );

                // Final completion update
                set((state) => {
                  const file = state.files.find((f: FileUploadInterface) => f.id === fileObj.id);
                  if (file) {
                    file.status = 'completed';
                    file.progress = 100;
                    file.errorMessage = undefined;
                  }
                });

              } catch (error) {
                const err = error as Error;
                const errorMessage = err.message === 'Upload aborted' 
                  ? 'Upload cancelled' 
                  : 'Upload failed';
                
                // Atomic error state update
                set((state) => {
                  const file = state.files.find((f: FileUploadInterface) => f.id === fileObj.id);
                  if (file) {
                    file.status = 'error';
                    file.errorMessage = errorMessage;
                    file.progress = 0;
                  }
                });

                console.error(`Upload failed for ${fileObj.name}:`, error);
              } finally {
                set((state) => {
                  delete state.uploadControllers[fileObj.id]; // Object delete instead of Map.delete
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
          const controller = get().uploadControllers[fileId]; // Object access instead of Map.get
          if (controller) {
            controller.abort();
          }
        },

        updateFileProgress: (fileId: string, progress: number) => {
          set((state) => {
            const file = state.files.find((f: FileUploadInterface) => f.id === fileId);
            if (file) {
              // Ensure progress is within valid bounds and force re-render
              const validProgress = Math.min(100, Math.max(0, Math.round(progress)));
              file.progress = validProgress;
              
              // Force status to 'uploading' if progress > 0 and status is still 'pending'
              if (validProgress > 0 && file.status === 'pending') {
                file.status = 'uploading';
              }
              
              console.log(`✅ Progress update for ${file.name}: ${validProgress}%`);
            } else {
              console.warn(`❌ File with id ${fileId} not found for progress update`);
            }
          });
        },

        updateFileStatus: (fileId: string, status: FileUploadInterface['status'], errorMessage?: string) => {
          set((state) => {
            const file = state.files.find((f: FileUploadInterface) => f.id === fileId);
            if (file) {
              file.status = status;
              file.errorMessage = errorMessage;
              
              // Ensure progress consistency based on status
              if (status === 'completed') {
                file.progress = 100;
              } else if (status === 'pending') {
                file.progress = 0;
              }
              // Don't modify progress for 'uploading' and 'error' states
              
              console.log(`✅ Status update for ${file.name}: ${status}${file.progress ? ` (${file.progress}%)` : ''}`);
            } else {
              console.warn(`❌ File with id ${fileId} not found for status update`);
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
              state.uploadControllers[fileId] = controller; // Object assignment instead of Map.set
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

            get().updateFileStatus(fileId, 'completed');

          } catch (error) {
            console.error('Retry upload failed:', error);
            get().updateFileStatus(fileId, 'error', 'Retry failed');
          } finally {
            set((state) => {
              delete state.uploadControllers[fileId]; // Object delete instead of Map.delete
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
          return !!(metadata.title && metadata.description);
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
              return files.some(f => f.status === 'completed');
            case 2:
              return !!(metadata.title && metadata.description);
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
            const successFiles = files.filter((f: FileUploadInterface) => f.status === 'completed');

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
          Object.values(uploadControllers).forEach((controller: AbortController) => controller.abort());

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
            state.uploadControllers = {}; // Reset to empty object instead of Map.clear()
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