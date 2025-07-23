import { create } from 'zustand';
import { FileUploadInterface } from '@/types/FileUploadInterface';

interface UploadState {
  files: FileUploadInterface[];
  isSubmitting: boolean;
  dragOver: boolean;
  uploadProgress: Record<string, number>;

  // Actions
  //@files - danh sách file đã upload
  //@fileId - id của file 
  //@status  - trạng thái của file 
  //@errorMessage - thông báo lỗi nếu có 
  //@progress - tiến trình upload của file 
  //@isSubmitting - luận lí trạng thái của form  
  //@dragOver - luận lí trạng thái drag 
  addFiles: (files: File[]) => void;
  removeFile: (fileId: string) => void;
  updateFileStatus: (fileId: string, status: FileUploadInterface['status'], errorMessage?: string) => void;
  updateFileProgress: (fileId: string, progress: number) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  setDragOver: (dragOver: boolean) => void;
  resetUpload: () => void;
  submitFiles: () => Promise<void>;
  uploadFile: (fileObj: FileUploadInterface, file: File) => Promise<void>;
}


export const useUploadStore = create<UploadState>()(
  //@set - thêm mới 
  //@get - lấy 
  (set, get) => ({
    files: [], //list files uploaded 
    isSubmitting: false, // trạng thái form 
    dragOver: false, // trạng thái kéo thả 
    uploadProgress: {}, // tiến trình
    //Action CREATE 
    addFiles: (newFiles: File[]) => {
      //Lấy danh sách files đã upload từ đó cho tới nay
      const currentFiles = get().files
      // Biến này lưu các đối tượng file có kiểu dữ liệu FileUploadInterface, cập nhật cho nó 
      const fileObjects: FileUploadInterface[] = newFiles.map((file, index) => ({
        id: `${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
        status: 'uploading',
        progress: 0,
        uploadedAt: new Date().toISOString(),
      }));
      // Thay thế danh sách file trước đó thành file mới tạo là fileObjects
      set({
        files: [...currentFiles, ...fileObjects],
      });

      // Start upload for each file
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
      });
    },

    submitFiles: async () => {
      const { files, setSubmitting } = get();
      const successFiles = files.filter(f => f.status === 'success');

      if (successFiles.length === 0) return;

      setSubmitting(true);

      try {
        // API call to submit files
        const response = await fetch('/api/uploads/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileIds: successFiles.map(f => f.id) }),
        });

        if (!response.ok) throw new Error('Submission failed');

        // Reset after successful submission
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


        // track tiến trình qua progress của upload
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            // progress = (currentByte / totalByte) * 100
            const progress = Math.round((event.loaded * 100) / event.total);
            //update state progress cho tiến trình upload file
            updateFileProgress(fileObj.id!, progress);
          }
        };
        // trong lúc upload,
        // nếu thành công thì cập nhật trạng thái là success, 
        // nếu thất bại thì cập nhật trạng thái là error
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
        // open POST method, gửi đi cùng với formdata 
        xhr.open('POST', '/api/uploads');
        xhr.send(formData);
      } catch (error) {
        updateFileStatus(fileObj.id!, 'error', 'Upload failed');
      }
    },
  }),
);