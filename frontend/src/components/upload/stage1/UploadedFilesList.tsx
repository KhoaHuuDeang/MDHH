"use client";

import React, { memo } from 'react';
import { FileUploadInterface } from '@/types/FileUploadInterface';
import FileItem from './FileItem';

interface UploadedFilesListProps {
  files: FileUploadInterface[];
  onRemoveFile: (fileId: string) => void;
}

const UploadedFilesList = memo(({ files, onRemoveFile }: UploadedFilesListProps) => {
  if (files.length === 0) return null;
  return (
    <section className="space-y-3" role="list" aria-label="Uploaded files">
      {files.map((file) => (
        <FileItem 
          key={file.id} 
          file={file} 
          onRemove={onRemoveFile}
        />
      ))}
    </section>
  );
});

UploadedFilesList.displayName = 'UploadedFilesList';

export default UploadedFilesList;