"use client";

import React, { memo, useEffect, useMemo } from 'react';
import { FileUploadInterface } from '@/types/FileUploadInterface';
import { formatBytes } from '@/utils/formatBytes';
import { getIcon } from '@/utils/getIcon';

interface FileItemProps {
  file: FileUploadInterface;
  onRemove: (fileId: string) => void;
}
function FileItem({ file, onRemove }: FileItemProps) {
  const isCompleted = file.status === 'completed';
  const isError = file.status === 'error';
  const isUploading = file.status === 'uploading'; 

  // Force re-render on file changes - debug helper
  useEffect(() => {
    console.log(`🔄 FileItem re-rendered for ${file.name}: status=${file.status}, progress=${file.progress}`);
  }, [file.status, file.progress, file.name]); 

  const statusConfig = useMemo(() => {
    console.log(`🔍 File ${file.name} status: ${file.status}, progress: ${file.progress}`);
    switch (file.status) {
      case 'completed':
        return {
          containerClass: 'bg-white border-gray-200',
          icon: 'CheckCircle',
          iconClass: 'text-green-600',
          ariaLabel: 'Upload successful'
        }
      case 'error':
        return {
          containerClass: 'bg-red-50 border-red-200',
          icon: 'XCircle',
          iconClass: 'text-red-600',
          ariaLabel: 'Upload failed'
        }
      case 'uploading':
        return {
          containerClass: 'bg-blue-50 border-blue-200',
          icon: 'Clock',
          iconClass: 'text-blue-600',
          ariaLabel: 'Uploading'
        }
      default:
        return {
          containerClass: 'bg-gray-50 border-gray-200',
          icon: 'Clock',
          iconClass: 'text-gray-600',
          ariaLabel: 'Pending'
        }
    }}, [file.status, file.progress, file.name]); // Add file.name to dependencies


    const progressBarWidth = useMemo(() =>
      `${file.progress || 0}%`, [file.progress]
    );

    const handleRemove = React.useCallback(async () => {
      onRemove(file.id);
    }, [file.id, onRemove]);
    
    return (
      <article
        className={`p-4 rounded-lg shadow-sm border flex flex-col gap-2 transition-all duration-200 ${statusConfig.containerClass}`}
        role="listitem"
        aria-label={`File: ${file.name}, ${statusConfig.ariaLabel}`}
      >
        <header className="flex items-center gap-3">
          <div className="flex-shrink-0" aria-hidden="true">
            {getIcon(statusConfig.icon, 22, statusConfig.iconClass)}
          </div>

          <h4 className="font-medium text-gray-800 truncate flex-1" title={file.name}>
            {file.name}
          </h4>

          <button
            onClick={handleRemove}
            className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors duration-200 p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label={`Remove ${file.name}`}
            type="button"
          >
            {getIcon('X', 18)}
          </button>
        </header>

        <div className="pl-8">
          {((isCompleted) || (isUploading) || (file.status === 'pending' && (file.progress || 0) > 0)) && (
            <div className="flex items-center gap-3">
              <span className={`text-xs flex-shrink-0 ${
                isCompleted ? 'text-gray-500' : 
                isUploading ? 'text-blue-600' : 
                'text-orange-600'
              }`}>
                {isCompleted ? formatBytes(file.size) :
                 isUploading ? 'Đang tải lên...' :
                 'Đang khởi tạo upload...'
                }
              </span>
              <div className="w-full bg-gray-200 rounded-full h-1.5 flex-1">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isCompleted ? 'bg-green-500' :
                    isUploading ? 'bg-blue-500' :
                    'bg-orange-500'
                  }`}
                  style={{ width: progressBarWidth }}
                  role="progressbar"
                  aria-valuenow={file.progress || 0}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Upload progress: ${file.progress || 0}%`}
                />
              </div>
              <span className={`text-xs font-semibold flex-shrink-0 ${
                isCompleted ? 'text-gray-500' : 
                isUploading ? 'text-blue-600' : 
                'text-orange-600'
              }`}>
                {file.progress || 0}%
              </span>
            </div>
          )}

          {/* Show file size for truly pending files (no progress yet) */}
          {file.status === 'pending' && (file.progress || 0) === 0 && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 flex-shrink-0">
                {formatBytes(file.size)} • Chờ upload...
              </span>
            </div>
          )}

          {isError && (
            <div role="alert" className="text-xs text-red-600">
              {file.errorMessage || 'Đã xảy ra lỗi khi tải lên'}
            </div>
          )}
        </div>
      </article>
    );
  };

  FileItem.displayName = 'FileItem';

  export default memo(FileItem, (prevProps, nextProps) => {
    const prevFile = prevProps.file;
    const nextFile = nextProps.file;
    
    // Skip re-render ONLY if ALL critical properties are identical
    const arePropsEqual = (
      prevFile.id === nextFile.id &&
      prevFile.status === nextFile.status &&
      prevFile.progress === nextFile.progress &&
      prevFile.name === nextFile.name &&
      prevFile.errorMessage === nextFile.errorMessage &&
      prevProps.onRemove === nextProps.onRemove
    );
    return arePropsEqual; // true = skip re-render, false = do re-render
  });