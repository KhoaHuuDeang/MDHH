"use client";

import React, { memo, useMemo } from 'react';
import { FileUploadInterface } from '@/types/FileUploadInterface';
import { formatBytes } from '@/data/FileUploadMockdata';
import { getIcon } from '@/utils/getIcon';

interface FileItemProps {
  file: FileUploadInterface;
  onRemove: (fileId: string) => void;
}
function FileItem({ file, onRemove }: FileItemProps) {
  const isSuccess = file.status === 'success';
  const isError = file.status === 'error';
  const isUploading = file.status === 'uploading';


  const statusConfig = useMemo(() => {
    switch (file.status) {
      case 'success':
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
      default:
        return {
          containerClass: 'bg-blue-50 border-blue-200',
          icon: 'Clock',
          iconClass: 'text-blue-600',
          ariaLabel: 'Uploading'
        }
    }}, [file.status]);


    const progressBarWidth = useMemo(() =>
      `${file.progress || 0}%`, [file.progress]
    );

    const handleRemove = React.useCallback(() => {
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
          {isSuccess && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 flex-shrink-0">
                {formatBytes(file.size)}
              </span>
              <div className="w-full bg-gray-200 rounded-full h-1.5 flex-1">
                <div
                  className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: progressBarWidth }}
                  role="progressbar"
                  aria-valuenow={file.progress || 100}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Upload progress"
                />
              </div>
              <span className="text-xs text-gray-500 font-semibold flex-shrink-0">
                {file.progress || 100}%
              </span>
            </div>
          )}

          {isUploading && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-blue-600 flex-shrink-0">
                Đang tải lên...
              </span>
              <div className="w-full bg-gray-200 rounded-full h-1.5 flex-1">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: progressBarWidth }}
                  role="progressbar"
                  aria-valuenow={file.progress || 0}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Upload progress"
                />
              </div>
              <span className="text-xs text-blue-600 font-semibold flex-shrink-0">
                {file.progress || 0}%
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

  export default memo(FileItem);