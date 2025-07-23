"use client";

import React, { useCallback, useRef } from 'react';
import { getIcon } from '@/utils/getIcon';
import { useUploadStore } from '@/store/uploadStore';

const FileUploadArea = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addFiles, dragOver, setDragOver } = useUploadStore();

  // 1.@files - nhận vào file từ input hoặc drop -> chuyển nó sang array  
  // 2. Filter files hợp lệ và không quá 50mb 
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const validTypes = ['.pdf', '.doc', '.docx'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      return validTypes.includes(fileExtension) && file.size <= 50 * 1024 * 1024; // 50MB limit
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
          ? 'border-[#6A994E] bg-green-100 scale-105'
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
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${dragOver ? 'bg-[#386641] scale-110' : 'bg-[#6A994E]/20'
          }`}>
          {getIcon('CloudUpload', 32, `transition-colors duration-300 ${dragOver ? 'text-white' : 'text-[#386641]'
            }`)}
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {dragOver ? 'Drop your file here' : 'You can drag and drop files here'}
        </h3>

        <p className="text-gray-500 mb-4">Or if you prefer</p>

        <div className="bg-[#386641] text-white font-semibold px-8 py-3 rounded-lg hover:bg-[#2d4f31] transition-colors duration-300 shadow-md hover:shadow-lg">
          Browse files
        </div>

        <div className="mt-4 text-xs text-gray-500 space-y-1">
          <p>Supported formats: PDF, DOC, DOCX</p>
          <p>Maximum size: 50MB per file</p>
        </div>
      </div>
    </section>
  );
};

export default FileUploadArea;