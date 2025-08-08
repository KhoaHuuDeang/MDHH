"use client";

import React, { useCallback, useMemo } from 'react';
import { getIcon } from '@/utils/getIcon';
import { DocumentCategory, FileUploadInterface } from '@/types/FileUploadInterface';

// ✅ Updated interface for Stage 2 per-file metadata
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

// ✅ Constants for Stage 2 per-file categorization
const DOCUMENT_CATEGORIES = [
  { value: DocumentCategory.LECTURE, label: '📚 Lecture', icon: 'BookOpen' },
  { value: DocumentCategory.EXAM, label: '📋 Exam', icon: 'FileText' },
  { value: DocumentCategory.EXERCISE, label: '📝 Exercise', icon: 'PenTool' },
  { value: DocumentCategory.REFERENCE, label: '📖 Reference', icon: 'Book' },
  { value: DocumentCategory.OTHER, label: '📄 Other', icon: 'File' },
] as const;

const VISIBILITY_OPTIONS = [
  {
    value: 'public',
    label: '🌐 Public',
    description: 'Anyone can view and download',
    icon: 'Globe'
  },
  {
    value: 'private',
    label: '🔒 Private', 
    description: 'Only you can access',
    icon: 'Lock'
  },
] as const;

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

  // Memoized metadata getter with defaults
  const getFileMetadata = useCallback((fileId: string): FileMetadata => {
    return fileMetadata[fileId] || DEFAULT_METADATA;
  }, [fileMetadata]);

  // Completion statistics
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
    return (
      <EmptyState className={className} />
    );
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

// ✅ Sub-components (same implementation but with corrected props)

const EmptyState = React.memo<{ className?: string }>(({ className = '' }) => (
  <section className={`text-center py-12 ${className}`} role="status">
    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
      {getIcon('FileX', 32, 'text-gray-400')}
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">No files to configure</h3>
    <p className="text-gray-500 text-sm">
      Upload files in Step 1 before proceeding to metadata entry
    </p>
  </section>
));

const CompletionBadge = React.memo<{ 
  completed: number; 
  total: number; 
  percentage: number; 
}>(({ completed, total, percentage }) => (
  <div className="flex items-center gap-2">
    <div className={`
      px-3 py-1 rounded-full text-sm font-medium
      ${percentage === 100
        ? 'bg-green-100 text-green-800'
        : percentage > 0
          ? 'bg-yellow-100 text-yellow-800'
          : 'bg-gray-100 text-gray-600'
      }
    `}>
      {completed}/{total} Complete ({percentage}%)
    </div>
    {percentage === 100 && getIcon('CheckCircle', 16, 'text-green-600')}
  </div>
));

interface FileMetadataCardProps {
  file: FileUploadInterface;
  index: number;
  metadata: FileMetadata;
  onFieldChange: (fileId: string, field: keyof FileMetadata) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  maxDescriptionLength: number;
}

const FileMetadataCard = React.memo<FileMetadataCardProps>(({
  file,
  index,
  metadata,
  onFieldChange,
  maxDescriptionLength
}) => {
  const isComplete = !!(metadata.title?.trim() && metadata.description?.trim() && metadata.category);
  const descriptionLength = metadata.description?.length || 0;

  return (
    <div
      className={`
        p-6 rounded-lg border-2 transition-all duration-200
        ${isComplete
          ? 'border-green-200 bg-green-50/50'
          : 'border-orange-200 bg-orange-50/30'
        }
      `}
      role="region"
      aria-labelledby={`file-header-${file.id}`}
    >
      {/* File header */}
      <div className="flex items-start gap-4 mb-6">
        <div className={`
          w-12 h-12 rounded-lg flex items-center justify-center
          ${isComplete ? 'bg-green-100' : 'bg-orange-100'}
        `}>
          {isComplete
            ? getIcon('CheckCircle', 24, 'text-green-600')
            : getIcon('FileText', 24, 'text-orange-600')
          }
        </div>
        <div className="flex-1">
          <h3 id={`file-header-${file.id}`} className="font-semibold text-gray-900 mb-1">
            File {index + 1}: {file.name}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{(file.size / (1024 * 1024)).toFixed(1)} MB</span>
            <span className={`
              px-2 py-1 rounded-full text-xs font-medium
              ${isComplete
                ? 'bg-green-100 text-green-700'
                : 'bg-orange-100 text-orange-700'
              }
            `}>
              {isComplete ? 'Complete' : 'Incomplete'}
            </span>
          </div>
        </div>
      </div>

      {/* Form fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            File Title *
          </label>
          <input
            type="text"
            value={metadata.title}
            onChange={onFieldChange(file.id, 'title')}
            placeholder="e.g., Chapter 5: Advanced Topics"
            className="w-full p-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            value={metadata.category}
            onChange={onFieldChange(file.id, 'category')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
          >
            {DOCUMENT_CATEGORIES.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={metadata.description}
            onChange={onFieldChange(file.id, 'description')}
            placeholder="Describe the content, topics covered, learning objectives..."
            maxLength={maxDescriptionLength}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20 resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            {descriptionLength}/{maxDescriptionLength} characters
          </p>
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Visibility
          </label>
          <select
            value={metadata.visibility}
            onChange={onFieldChange(file.id, 'visibility')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
          >
            {VISIBILITY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
});

const ProgressSummary = React.memo<{ 
  stats: { completed: number; total: number; percentage: number }; 
}>(({ stats }) => (
  <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium text-gray-700">
        Completion Progress
      </span>
      <span className="text-sm text-gray-600">
        {stats.completed}/{stats.total} files
      </span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-green-500 h-2 rounded-full transition-all duration-300"
        style={{ width: `${stats.percentage}%` }}
      />
    </div>
  </div>
));

// ✅ Set display names per copilot-instructions.md
EmptyState.displayName = 'EmptyState';
CompletionBadge.displayName = 'CompletionBadge';
FileMetadataCard.displayName = 'FileMetadataCard';
ProgressSummary.displayName = 'ProgressSummary';
FileMetadataEditor.displayName = 'FileMetadataEditor';

export default React.memo(FileMetadataEditor);