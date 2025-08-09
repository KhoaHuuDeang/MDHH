"use client";

import React, { useCallback, useMemo } from 'react';
import { getIcon } from '@/utils/getIcon';
import { DocumentCategory, FileUploadInterface } from '@/types/FileUploadInterface';
import EmptyState from '@/components/layout/EmptyState';
import CompletionBadge from '@/components/layout/user/CompletionBadge';
import FileMetadataCard from './FileMetadataCard';
import ProgressSummary from '@/components/layout/ProgressSummary';


// ... (Các interfaces và constants giống như ban đầu, nhưng di chuyển vào component con nếu cần)
interface FileMetadata {
  title: string;
  description: string;
  category: DocumentCategory;
  visibility: 'public' | 'private';
}

interface FileMetadataEditorProps {
  files: FileUploadInterface[];
  fileMetadata: Record<string, FileMetadata>;
  onFileMetadataChange: (fileId: string, field: keyof FileMetadata, value: string) => void;
  className?: string;
  showCompletionStatus?: boolean;
  maxDescriptionLength?: number;
}

const DEFAULT_METADATA: FileMetadata = {
  title: '',
  description: '',
  category: DocumentCategory.OTHER,
  visibility: 'public'
};

function FileMetadataEditor({
  files,
  fileMetadata,
  onFileMetadataChange,
  className = '',
  showCompletionStatus = true,
  maxDescriptionLength = 500
}: FileMetadataEditorProps) {
  // Optimized handler with proper typing
  const handleFieldChange = useCallback((fileId: string, field: keyof FileMetadata) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    onFileMetadataChange(fileId, field, e.target.value);
  }, [onFileMetadataChange]);

  //  Memoized metadata getter with defaults
  const getFileMetadata = useCallback((fileId: string): FileMetadata => {
    return fileMetadata[fileId] || DEFAULT_METADATA;
  }, [fileMetadata]);

  //  Completion statistics
  const completionStats = useMemo(() => {
    const completed = files.filter(file => {
      const meta = getFileMetadata(file.id);
      return !!(meta.title?.trim() && meta.description?.trim() && meta.category);
    }).length;

    return {
      completed,
      total: files.length,
      percentage: files.length > 0 ? Math.round((completed / files.length) * 100) : 0
    };
  }, [files, getFileMetadata]);

  if (!files || files.length === 0) {
    return <EmptyState className={className} />;
  }

  return (
    <section className={`space-y-6 ${className}`} aria-labelledby="file-metadata-title">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getIcon('Files', 24, 'text-green-600')}
          <h2 id="file-metadata-title" className="text-xl font-semibold text-gray-900">
            Individual File Information
          </h2>
        </div>

        {showCompletionStatus && (
          <CompletionBadge
            completed={completionStats.completed}
            total={completionStats.total}
            percentage={completionStats.percentage}
          />
        )}
      </div>

      <p className="text-gray-600 text-sm">
        Provide specific metadata for each file. This helps with organization and discoverability.
      </p>

      <div className="space-y-6">
        {files.map((file, index) => (
          <FileMetadataCard
            key={file.id}
            file={file}
            index={index}
            metadata={getFileMetadata(file.id)}
            onFieldChange={handleFieldChange}
            maxDescriptionLength={maxDescriptionLength}
          />
        ))}
      </div>

      {showCompletionStatus && (
        <ProgressSummary stats={completionStats} />
      )}
    </section>
  );
}

FileMetadataEditor.displayName = 'FileMetadataEditor';

export default React.memo(FileMetadataEditor);