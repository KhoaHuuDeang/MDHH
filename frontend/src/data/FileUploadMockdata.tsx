import { FileUploadInterface } from "@/types/FileUploadInterface";

// Hàm tiện ích để định dạng kích thước file
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const mockFiles: FileUploadInterface[] = [
  {
    id: "1",
    userId: "user-001",
    name: 'BG_Chuong_5.pdf',
    size: 690355, 
    status: 'success',
    progress: 100,
    uploadedAt: "2025-07-21T09:00:00Z"
  },
  {
    id: "2",
    userId: "user-001",
    name: 'Invalid_File_Format.zip',
    size: 123456,
    status: 'error',
    progress: 0,
    errorMessage: 'Upload failed. File type is not supported.',
    uploadedAt: "2025-07-21T09:05:00Z"
  },
  {
    id: "3",
    userId: "user-002",
    name: 'Lecture_Slides.pptx',
    size: 2048000,
    status: 'uploading',
    progress: 60,
    uploadedAt: "2025-07-21T09:10:00Z"
  }
];