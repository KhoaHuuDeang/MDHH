"use client";

import React, { useCallback, useRef } from 'react';
import { getIcon } from '@/utils/getIcon';
import { useUploadStore } from '@/store/uploadStore';

const FileUploadArea = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addFiles = useUploadStore(state => state.addFiles);
  const dragOver = useUploadStore(state => state.dragOver);
  const setDragOver = useUploadStore(state => state.setDragOver);

  // 1.@files - nhận vào file từ input hoặc drop -> chuyển nó sang array  
  // 2. Filter files hợp lệ và không quá 50mb 
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes 
    const validFiles = fileArray.filter(file => {
      const validTypes = ['.pdf', '.doc', '.docx'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      return validTypes.includes(fileExtension) && file.size <= maxSize;
    });

    if (validFiles.length > 0) {
      addFiles(validFiles);
    }
  }, [addFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    e.target.value = ''; // Reset input
  }, [handleFileSelect]);

  return (
    <section
      className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${dragOver
          ? 'border-[#6A994E] bg-green-100 shadow-lg'
          : 'border-[#6A994E]/50 bg-green-50 hover:bg-green-100'
        }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="File upload area - click to browse or drag and drop files"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <input
        ref={fileInputRef}
        accept=".pdf,.doc,.docx"
        multiple
        type="file"
        className="hidden"
        onChange={handleInputChange}
        aria-hidden="true"
      />

      <div className="flex flex-col items-center justify-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${dragOver ? 'bg-[#386641] shadow-lg' : 'bg-[#6A994E]/20'
          }`}>
          {getIcon('CloudUpload', 32, `transition-colors duration-300 ${dragOver ? 'text-white' : 'text-[#386641]'
            }`)}
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {dragOver ? 'Thả tệp của bạn vào đây' : 'Bạn có thể kéo thả tệp vào đây hoặc nhấp để duyệt'}
        </h3>

        <p className="text-gray-500 mb-4">Hoặc nếu bạn thích</p>

        <div className="bg-[#386641] text-white font-semibold px-8 py-3 rounded-lg hover:bg-[#2d4f31] transition-colors duration-300 shadow-md hover:shadow-lg">
          Duyệt tệp
        </div>

        <div className="mt-4 text-xs text-gray-500 space-y-1">
          <p>Định dạng được hỗ trợ: PDF, DOC, DOCX</p>
          <p>Kích thước tối đa: 50MB mỗi tệp</p>
        </div>
      </div>
    </section>
  );
};

export default FileUploadArea;