import { create } from 'zustand';
import { FileUploadInterface } from '@/types/FileUploadInterface';

interface UploadState {
  files: FileUploadInterface[];
  isSubmitting: boolean;
  dragOver: boolean;
  uploadProgress: Record<string, number>;
  metadata: {
    title: string;
    description: string;
    subject: string;
    category: string;
    tags: string[];
    visibility: 'public' | 'private' | 'restricted';
    thumbnailFile?: File;
    price?: number;
  };
  currentStep: 1 | 2 | 3;
  stepValidation: {
    step1: boolean;
    step2: boolean;
    step3: boolean;
  };

  // Actions
  addFiles: (files: File[]) => void;
  removeFile: (fileId: string) => void;
  updateFileStatus: (fileId: string, status: FileUploadInterface['status'], errorMessage?: string) => void;
  updateFileProgress: (fileId: string, progress: number) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  setDragOver: (dragOver: boolean) => void;
  resetUpload: () => void;
  submitFiles: () => Promise<void>;
  uploadFile: (fileObj: FileUploadInterface, file: File) => Promise<void>;
  nextStep: () => void;
  prevStep: () => void;
  canProceed: (step: number) => boolean;
  updateMetadata: (data: Partial<UploadState['metadata']>) => void;
  validateStep: (step: number) => boolean;
  setCurrentStep: (step: 1 | 2 | 3) => void;
  validateCurrentStep: () => boolean;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
}

export const useUploadStore = create<UploadState>()((set, get) => ({
  files: [],
  isSubmitting: false,
  dragOver: false,
  uploadProgress: {},
  metadata: {
    title: "",
    description: "",
    subject: "",
    category: "",
    tags: [],
    visibility: 'public',
    thumbnailFile: undefined,
    price: undefined,
  },
  currentStep: 1,
  stepValidation: {
    step1: false,
    step2: false,
    step3: false
  },

  addFiles: (newFiles: File[]) => {
    const currentFiles = get().files;
    const fileObjects: FileUploadInterface[] = newFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      status: 'uploading',
      progress: 0,
      uploadedAt: new Date().toISOString(),
    }));
    
    set({
      files: [...currentFiles, ...fileObjects],
    });

    fileObjects.forEach((fileObj) => {
      get().uploadFile(fileObj, newFiles.find(f => f.name === fileObj.name)!);
    });
  },

  removeFile: (fileId: string) => {
    set((state) => ({
      files: state.files.filter((file) => file.id !== fileId),
    }));
  },

  updateFileStatus: (fileId: string, status: FileUploadInterface['status'], errorMessage?: string) => {
    set((state) => ({
      files: state.files.map((file) =>
        file.id === fileId
          ? { ...file, status, errorMessage, progress: status === 'success' ? 100 : file.progress }
          : file
      ),
    }));
  },

  updateFileProgress: (fileId: string, progress: number) => {
    set((state) => ({
      files: state.files.map((file) =>
        file.id === fileId ? { ...file, progress } : file
      ),
    }));
  },

  setSubmitting: (isSubmitting: boolean) => set({ isSubmitting }),
  setDragOver: (dragOver: boolean) => set({ dragOver }),

  resetUpload: () => {
    set({
      files: [],
      isSubmitting: false,
      dragOver: false,
      uploadProgress: {},
      metadata: {
        title: "",
        description: "",
        subject: "",
        category: "",
        tags: [],
        visibility: 'public',
        thumbnailFile: undefined,
        price: undefined,
      },
      currentStep: 1,
    });
  },

  submitFiles: async () => {
    const { files, setSubmitting } = get();
    const successFiles = files.filter(f => f.status === 'success');

    if (successFiles.length === 0) return;

    setSubmitting(true);

    try {
      const response = await fetch('/api/uploads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileIds: successFiles.map(f => f.id) }),
      });

      if (!response.ok) throw new Error('Submission failed');

      get().resetUpload();
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setSubmitting(false);
    }
  },

  uploadFile: async (fileObj: FileUploadInterface, file: File) => {
    const { updateFileProgress, updateFileStatus } = get();
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileId', fileObj.id!);

      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded * 100) / event.total);
          updateFileProgress(fileObj.id!, progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          updateFileStatus(fileObj.id!, 'success');
        } else {
          updateFileStatus(fileObj.id!, 'error', 'Upload failed');
        }
      };

      xhr.onerror = () => {
        updateFileStatus(fileObj.id!, 'error', 'Network error');
      };

      xhr.open('POST', '/api/uploads');
      xhr.send(formData);
    } catch (error) {
      updateFileStatus(fileObj.id!, 'error', 'Upload failed');
    }
  },

  updateMetadata: (data: Partial<UploadState['metadata']>) => {
    set((state) => ({
      metadata: { ...state.metadata, ...data }
    }));
  },

  canProceed: (step: number) => {
    return get().validateStep(step);
  },

  validateStep: (step: number) => {
    const { files, metadata } = get();
    switch (step) {
      case 1: return files.filter(f => f.status === 'success').length > 0;
      case 2: return !!(metadata.title && metadata.description && metadata.subject);
      case 3: return true;
      default: return false;
    }
  },

  setCurrentStep: (step) => set({ currentStep: step }),

  validateCurrentStep: () => {
    const { currentStep } = get();
    return get().validateStep(currentStep);
  },

  saveToLocalStorage: () => {
    const { currentStep, files, metadata } = get();
    localStorage.setItem('upload_progress', JSON.stringify({
      currentStep,
      fileIds: files.map(f => f.id),
      metadata
    }));
  },

  loadFromLocalStorage: () => {
    try {
      const saved = localStorage.getItem('upload_progress');
      if (saved) {
        const data = JSON.parse(saved);
        set({
          currentStep: data.currentStep,
          metadata: { ...get().metadata, ...data.metadata }
        });
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
  },

  nextStep: () => {
    const { currentStep, validateCurrentStep } = get();
    if (validateCurrentStep() && currentStep < 3) {
      set({ currentStep: currentStep + 1 as 1 | 2 | 3 });
      get().saveToLocalStorage();
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 1) {
      set({ currentStep: currentStep - 1 as 1 | 2 | 3 });
    }
  },
}));