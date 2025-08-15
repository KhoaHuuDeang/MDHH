import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { uploadService } from '@/services/uploadService';
import { DocumentCategory, FileMetadata, FileUploadInterface, FolderManagement, PaginatedUploads, VisibilityType } from '@/types/FileUploadInterface';
import { ClassificationLevel, CreateFolderDto, Folder, Tag } from '@/types/FolderInterface';
import { folderService } from '@/services/folderService';
import { buildResourceCreationWithUploadDto } from '@/services/mappers/uploadMappers';

interface UploadState {
// Current upload session state
  files: FileUploadInterface[];
  currentStep: 1 | 2 | 3;
  isSubmitting: boolean;
  dragOver: boolean;
  resourceId?: string;
  sessionId?: string;
  errors: Record<string, string>;
  lastUploadResult?: {
    resourceId: string;
    resourceTitle: string;
    uploadedAt: string;
  };
  // Upload history state
  uploadHistory: PaginatedUploads | null;
  isLoadingHistory: boolean;

  // reduce lagging, render component 
  debouncedControllers: Record<string, { // fieldId 
    timeoutId: NodeJS.Timeout; //debounce timeout
    abortController: AbortController; // cancel upload process
  }>;
  // ví dụ : 
  //   debouncedControllers = {
  //   'fileId_123': {
  //     timeoutId: 50,
  //     abortController: new AbortController(),
  //   },
  //   'fileId_456': {
  //     timeoutId: 51,
  //     abortController: new AbortController(),
  //   }
  // };


  // Upload controllers for cancellation - using Record instead of Map for Immer compatibility
  uploadControllers: Record<string, AbortController>;


  fileMetadata: Record<string, FileMetadata>;
  folders: Folder[];
  folderManagement: FolderManagement;
  classificationLevels: ClassificationLevel[];
  availableTags: Tag[];

  isLoadingClassifications: boolean;
  isLoadingTags: boolean;
  isLoadingFolders: boolean;
  validationErrors: Record<string, string[]>;


  // Actions
  addFiles: (files: File[]) => Promise<void>;
  requestPreSignedUrls: (fileObjects: FileUploadInterface[]) => Promise<void>; // Added for 2-step pattern
  removeFile: (fileId: string) => void;
  cancelFileUpload: (fileId: string) => void;
  updateFileProgress: (fileId: string, progress: number) => void;
  updateFileStatus: (fileId: string, status: FileUploadInterface['status'], errorMessage?: string) => void;
  retryFileUpload: (fileId: string) => Promise<void>;


  // Step management
  nextStep: () => void;
  setCurrentStep: (step: 1 | 2 | 3) => void;
  validateStep: (step: number) => boolean;

  // Upload flow (updated for 2-step pattern)
  submitUpload: () => Promise<void>;
  resetUpload: () => void;
  removeAllFiles: () => void
  // Upload history
  loadUploadHistory: (page?: number, limit?: number) => Promise<void>;
  deleteUploadSession: (resourceId: string) => Promise<void>; // Changed to resourceId

  // UI state
  setDragOver: (dragOver: boolean) => void;
  setError: (key: string, message: string) => void;
  clearError: (key: string) => void;
  clearAllErrors: () => void;



  //  Metadata actions
  fetchClassificationLevels: () => Promise<void>;
  fetchTagsByLevel: (levelId: string) => Promise<void>;
  fetchUserFolders: () => Promise<void>;
  createFolder: (name: string, levelId: string, tagIds?: string[]) => Promise<string>;
  updateFolderManagement: (data: Partial<FolderManagement>,options? : {debounce?: boolean}) => void;
  // Sử dụng generic vì typescript sẽ tìm tới gia đình tôi
  // K đại diện cho một field trong ResourceCreationMetadata ->  đó là lý do tại sao filed : K
  // val (val)sẽ đại diện cho giá trị của field (K) trong ResourceCreationMetadata
  // tôi yêu geneirc 
  updateFileMetadata: <K extends keyof FileMetadata>(fileId: string, field: K, value: FileMetadata[K]) => void;
  validateMetadataCompletion: () => Record<string, string[]>;

  clearAllDebouncedOperations: () => Promise<void>;
  // error handling

  setValidationErrors: (field: string, errors: string[]) => void;
  clearValidationErrors: (field?: string) => void;
}

export const useUploadStore = create<UploadState>()(
  persist(
    immer(
      devtools((set, get) => ({
        // Initial states
        files: [],
        folderManagement: {
          selectedFolderId: undefined,
          newFolderData: undefined,
        },
        debouncedControllers: {},
        fileMetadata: {},
        folders: [],
        classificationLevels: [],
        availableTags: [],
        isLoadingClassifications: false,
        isLoadingTags: false,
        isLoadingFolders: false,
        currentStep: 1,
        isSubmitting: false,
        dragOver: false,
        resourceId: undefined,
        sessionId: undefined,
        errors: {},
        uploadHistory: null,
        isLoadingHistory: false,
        uploadControllers: {},
        validationErrors: {},// Initialize as empty object instead of Map
        // File management actions (updated for 2-step pattern)
        addFiles: async (newFiles: File[]) => {
          try {
            set((state) => {
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
              valid: File[];
              error: Record<string, string>
            }>((acc, file) => {
              if (!validTypes.includes(file.type)) {
                acc.error[file.name] = `File ${file.name} has invalid type`;
              }
              else if (file.size > maxSize) {
                acc.error[file.name] = `File ${file.name} exceeds 50MB limit`;
              }
              else {
                acc.valid.push(file)
              }
              return acc;
            }, { valid: [], error: {} })
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

        removeFile: async (fileId: string) => {
          set((state) => {
            state.errors = {}
          })
          // Cancel upload if in progress
          const file = get().files.find((f) => f.id === fileId);
          get().cancelFileUpload(fileId);
          if (file?.status === 'completed' && file.s3Key) {
            try {
              await uploadService.deleteS3File(file.s3Key)
              console.log(`deleted statuss: ${file.s3Key}`);
            } catch (err) {
              get().setError('upload', `Failed to remove file ${file.name}`);
            }
          }
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
          const { files } = get();

          switch (step) {
            case 1:
              return files.some(f => f.status === 'completed');
            case 2:
              const errors = get().validateMetadataCompletion();
              return Object.keys(errors).length === 0;
            case 3:
              return true;
            default:
              return false;
          }
        },

        // Upload flow (2-step pattern: uploads already done, now create resource)
        submitUpload: async () => {
          try {
            const { files, folderManagement, fileMetadata } = get();
            const successFiles = files.filter((f: FileUploadInterface) => f.status === 'completed');

            if (successFiles.length === 0) {
              throw new Error('No successfully uploaded files found');
            }

            set((state) => {
              state.isSubmitting = true;
            });

            //  payload with folder management and per-file metadata
            const payload = buildResourceCreationWithUploadDto(
              folderManagement,
              files,
              fileMetadata
            );
            console.log('Resource creation payload SKIBIDI:', payload);
            const response = await uploadService.createResourceWithUploads(payload);
          } catch (error) {
            console.error('Submit upload failed:', error);
            get().setError('submit', 'Failed to submit upload');
          } finally {
            set((state) => {
              state.isSubmitting = false;
            });
          }
        },

        resetUpload: async () => {
          // Clear all debounced operations trước khi reset
          get().clearAllDebouncedOperations();

          set((state) => {
            state.files = [];
            state.folderManagement = {
              selectedFolderId: undefined,
              newFolderData: undefined,
            };
            state.fileMetadata = {};
            state.currentStep = 1;
            state.resourceId = undefined;
            state.sessionId = undefined;
            state.errors = {};
            state.validationErrors = {};
            state.isSubmitting = false;
            state.uploadControllers = {};
            state.debouncedControllers = {}; // ✅ Clear debounced controllers
          });
        },
        removeAllFiles: async () => {
          try {
            const { files } = get()
            // Cancel all uploads
            files.forEach(file => get().cancelFileUpload(file.id));
            const s3DeletionPromises = files
              .filter(file => file.status === 'completed' && file.s3Key)
              .map(async (file) => {
                try {
                  await uploadService.deleteS3File(file.s3Key!);
                  console.log(`🗑️ S3 file deleted: ${file.s3Key}`);
                } catch (error) {
                  console.warn(`⚠️ Failed to delete S3 file ${file.s3Key}:`, error);
                }
              });
            await Promise.all(s3DeletionPromises);

            set((state) => {
              state.files = [];
              state.uploadControllers = {};
            });
          } catch (error) {
            console.error('Failed to remove all files:', error);
            get().setError('remove', 'Failed to remove all files');
          }
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

        fetchClassificationLevels: async () => {
          try {
            set((state) => { state.isLoadingClassifications = true; });

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classification-levels`);
            const levels = await response.json();

            set((state) => {
              state.classificationLevels = levels;
              state.isLoadingClassifications = false;
            });
          } catch (error) {
            console.error('Failed to fetch classification levels:', error);
            get().setError('classifications', 'Failed to load classification levels');
            set((state) => { state.isLoadingClassifications = false; });
          }
        },
        fetchTagsByLevel: async (levelId: string) => {
          // unique key for the fetchTags request
          const controllerKey = `fetchTags_${levelId}`;
          // fetch debouncedControllers by construction with get()
          const { debouncedControllers } = get();
          //check if the controller exists
          if (debouncedControllers[controllerKey]) {
            debouncedControllers[controllerKey].abortController.abort(); //cancel previous request
          }
          //then create new 
          const abortController = new AbortController();
          set((state) => {
            state.debouncedControllers[controllerKey] = {
              timeoutId: setTimeout(() => { }, 0), // Dummy timeout
              abortController
            };
            state.isLoadingTags = true;
          });
          try {
            set((state) => { state.isLoadingTags = true; });
            const tags = await folderService.getTagsByLevel(levelId, { signal: abortController.signal });
            // request do not cancel -> fetch completed -> set loading -> false
            if (!abortController.signal.aborted) {
              set((state) => {
                state.availableTags = tags;
                state.isLoadingTags = false;
                delete state.debouncedControllers[controllerKey];
              });
            }
          } catch (error) {
            console.error('Failed to fetch tags:', error);
            get().setError('tags', 'Failed to load tags');
            set((state) => {
              state.isLoadingTags = false;
              delete state.debouncedControllers[controllerKey]
            });
          }
        },
        // update + debounce + abort
        updateFileMetadata: <K extends keyof FileMetadata>(fileId: string, field: K, value: FileMetadata[K], options?: { debounce?: boolean }) => {
          //  debounce field default is true,
          //  if updateFileMetadata(fileId,field) options = undefined ||
          //  if updateFileMetadata(fileId,field,{}), options.debounce = true -> debounce update
          //  if updateFileMetadata(fileId,field,{debounce : false}), options.debounce = false -> update without debounce
          const { debounce = true } = options || {};

          if (!debounce || (field !== 'title' && field !== 'description')) {
            set((state) => {
              if (!state.fileMetadata[fileId]) {
                state.fileMetadata[fileId] = {
                  title: '',
                  description: '',
                  category: 'OTHER' as DocumentCategory,
                  visibility: 'PUBLIC' as VisibilityType,
                };
              }
              state.fileMetadata[fileId][field] = value;
            });
            return;
          }

          // unique key defined 
          // fileMetadata_fieldId_title/description etc . . . 
          const controllerKey = `fileMetadata_${fileId}_${field}`;
          const { debouncedControllers } = get();


          if (debouncedControllers[controllerKey]) {
            clearTimeout(debouncedControllers[controllerKey].timeoutId);
            debouncedControllers[controllerKey].abortController.abort();
          }

          const abortController = new AbortController();
          const timeoutId = setTimeout(() => {
            if (!abortController.signal.aborted) {
              set((state) => {
                if (!state.fileMetadata[fileId]) {
                  state.fileMetadata[fileId] = {
                    title: '',
                    description: '',
                    category: 'OTHER' as DocumentCategory,
                    visibility: 'PUBLIC' as VisibilityType,
                  };
                }
                state.fileMetadata[fileId][field] = value;
                // Clean up completed controller
                delete state.debouncedControllers[controllerKey];
              });
            }
          }, 500);

          set((state) => {
            state.debouncedControllers[controllerKey] = {
              timeoutId,
              abortController
            };
          });

        },

        validateMetadataCompletion: (): Record<string, string[]> => {
          const { fileMetadata, files, folderManagement } = get();
          const completedFiles = files.filter(f => f.status === 'completed');
          const errors: Record<string, string[]> = {};

          if (!folderManagement.selectedFolderId && !folderManagement.newFolderData) {
            errors.folder = ['Please select or create a folder'];
          }
          if (folderManagement.newFolderData) {
            const fd = folderManagement.newFolderData;
            const folderErrs: string[] = [];
            if (!fd.name?.trim()) folderErrs.push('Folder name is required');
            if (!fd.folderClassificationId) folderErrs.push('Classification level is required');
            if (folderErrs.length) errors.folder = folderErrs;
          }

          // File-level validation
          const invalidFiles: string[] = [];
          completedFiles.forEach(file => {
            const fileMeta = fileMetadata[file.id];
            const fileErrors: string[] = [];

            if (!fileMeta?.title?.trim()) {
              fileErrors.push('Title is required');
            }
            if (!fileMeta?.description?.trim()) {
              fileErrors.push('Description is required');
            }
            if (!fileMeta?.category) {
              fileErrors.push('Category is required');
            }
            if (fileErrors.length > 0) {
              invalidFiles.push(`${file.name}: ${fileErrors.join(', ')}`);
            }
          });

          if (invalidFiles.length > 0) {
            errors.files = invalidFiles;
          }
          return errors;
        },

        clearAllDebouncedOperations: () => {
          // debounceControllers is object
          const { debouncedControllers } = get();
          // Object.values will transfer all values in object into array, 
          Object.values(debouncedControllers)
            // so can you foreach
            // attention we clear timeout and abort, not fileId
            .forEach(({ timeoutId, abortController }) => {
              clearTimeout(timeoutId);
              abortController.abort();
            });

          set((state) => {
            state.debouncedControllers = {};
          });
        },
        getValidationErrors: (): Record<string, string[]> => {
          const { fileMetadata, files, folderManagement } = get();
          const completedFiles = files.filter(f => f.status === 'completed');

          const errors: Record<string, string[]> = {};

          // Folder validation
          if (!folderManagement.selectedFolderId && !folderManagement.newFolderData) {
            errors.folder = ['Please select or create a folder'];
          }
          if (folderManagement.newFolderData && !folderManagement.newFolderData.folderClassificationId) {
            errors.classification = ['Please select a classification level'];
          }

          // Individual file validation
          const invalidFiles: string[] = [];
          completedFiles.forEach(file => {
            const fileMeta = fileMetadata[file.id];
            const fileErrors: string[] = [];

            if (!fileMeta?.title?.trim()) {
              fileErrors.push('Title is required');
            }
            if (!fileMeta?.description.trim()) {
              fileErrors.push('Description is required');
            }
            if (!fileMeta?.category) {
              fileErrors.push('Category is required');
            }

            if (fileErrors.length > 0) {
              invalidFiles.push(`${file.name}: ${fileErrors.join(', ')}`);
            }
          });

          if (invalidFiles.length > 0) {
            errors.files = invalidFiles;
          }

          return errors;
        },

        fetchUserFolders: async () => {
          set((state) => { state.isLoadingFolders = true; });
          try {
            const folders = await folderService.getUserFolders();
            set((state) => {
              state.folders = folders;
              state.isLoadingFolders = false;
            });
          } catch (err) {
            get().setError('folders', 'Failed to load your folders');
            set((state) => { state.isLoadingFolders = false; });
          }

        },


        createFolder: async (name: string, levelId: string, tagIds?: string[]): Promise<string> => {
          const folderData: CreateFolderDto = {
            name: name.trim(),
            classificationLevelId: levelId,
            description: `Folder for ${name}`,
            visibility: 'PUBLIC',
            tagIds: tagIds || [],
          };
          try {
            const validateFolder = folderService.validateFolderData(folderData);
            if (validateFolder.length > 0) {
              get().setValidationErrors('folder', validateFolder);
              throw new Error('Validation errors occurred');
            }
            const newFolder = await folderService.createFolder(folderData);

            set((state) => {
              state.folders.push(newFolder);
            });
            get().clearValidationErrors('folder');
            return newFolder.id;
          } catch (err) {
            get().setError('folder', 'Failed to create folder');
            throw new Error('Failed to create folder');
          }
        },
        setValidationErrors: (field: string, errors: string[]) => {
          set((state) => {
            state.validationErrors[field] = errors;
          });

        },

        clearValidationErrors: (field?: string) => {
          set((state) => {
            if (field) {
              delete state.validationErrors[field];
            } else {
              state.validationErrors = {};
            }
          });
        },


        updateFolderManagement: (data: Partial<FolderManagement>, options?: { immediate?: boolean }) => {
          const { immediate = false } = options || {};
          // Immediate update for non-text fields like dropdown/select/etc . . . 
          if (immediate) {
            set((state) => {
              // Object.assign will merge new data into current state 
              Object.assign(state.folderManagement, data);
            });
            return;
          }
          // Debounced update for text fields
          const controllerKey = 'folderManagement'; // Mark key identify 
          const { debouncedControllers } = get();

          // Check debounce is on progress ? 
          if (debouncedControllers[controllerKey]) {
            // clear timeout to avoid duplicate 
            clearTimeout(debouncedControllers[controllerKey].timeoutId);
            // clear prior request if pending  
            debouncedControllers[controllerKey].abortController.abort();
          }

          // Create new controller
          // Create new abort for this 
          const abortController = new AbortController();
          // create new timeout 
          const timeoutId = setTimeout(() => {
            // is request is cancelled ?
            if (!abortController.signal.aborted) {
              // debounce is working good  
              set((state) => {
                Object.assign(state.folderManagement, data);
                // Clean up completed controller
                delete state.debouncedControllers[controllerKey];
              });
            }
          }, 300); // delay 

          // Store controller
          set((state) => {
            state.debouncedControllers[controllerKey] = {
              timeoutId,
              abortController
            };
          });
        },
      }), {
        name: 'upload-store',
      })
    ),
    {
      name: 'upload-store',
      partialize: (state) => ({
        resourceId: state.resourceId,
        sessionId: state.sessionId,
      }),
    }
  )
);
