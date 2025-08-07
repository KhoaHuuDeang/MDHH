"use client";

import React, { useCallback, useMemo } from 'react';
import { getIcon } from '@/utils/getIcon';
import { DocumentCategory, FileUploadInterface } from '@/types/FileUploadInterface';
import { ResourceCreationMetadata } from '@/types/FileUploadInterface';

// ✅ Enhanced interface with better typing
interface FileMetadataEditorProps {
  files: FileUploadInterface[];
  fileMetadata: Record<string, ResourceCreationMetadata>;
  onFileMetadataChange: (fileId: string, field: keyof ResourceCreationMetadata, value: string) => void;
  className?: string;
  showCompletionStatus?: boolean;
  maxDescriptionLength?: number;
}

// ✅ Constants extracted for maintainability
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

const DEFAULT_METADATA: ResourceCreationMetadata = {
  title: '',
  description: '',
  category: DocumentCategory.OTHER,
  visibility: 'public'
};

// ✅ Direct function with explicit props typing (no React.FC)
function FileMetadataEditor({
  files,
  fileMetadata,
  onFileMetadataChange,
  className = '',
  showCompletionStatus = true,
  maxDescriptionLength = 500
}: FileMetadataEditorProps) {
  // ✅ Memoized handler with proper typing
  const handleFieldChange = useCallback((fileId: string, field: keyof ResourceCreationMetadata) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    onFileMetadataChange(fileId, field, e.target.value);
  }, [onFileMetadataChange]);

  // ✅ Memoized metadata getter with default values
  const getFileMetadata = useCallback((fileId: string): ResourceCreationMetadata => {
    return fileMetadata[fileId] || DEFAULT_METADATA;
  }, [fileMetadata]);

  // ✅ Memoized completion statistics
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

  // ✅ Early return for empty state
  if (!files || files.length === 0) {
    return (
      <EmptyState className={className} />
    );
  }

  return (
    <section className={`space-y-6 ${className}`} aria-labelledby="file-metadata-title">
      {/* ✅ Enhanced header with completion status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getIcon('Files', 24, 'text-[#6A994E]')}
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
        Provide specific metadata for each uploaded file to help others find and understand your content
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

      {/* ✅ Progress summary */}
      {showCompletionStatus && (
        <ProgressSummary stats={completionStats} />
      )}
    </section>
  );
}

// ✅ Extracted sub-components for better maintainability

interface EmptyStateProps {
  className?: string;
}

const EmptyState = React.memo<EmptyStateProps>(({ className = '' }) => (
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

EmptyState.displayName = 'EmptyState';

interface CompletionBadgeProps {
  completed: number;
  total: number;
  percentage: number;
}

const CompletionBadge = React.memo<CompletionBadgeProps>(({ completed, total, percentage }) => (
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

CompletionBadge.displayName = 'CompletionBadge';

interface FileMetadataCardProps {
  file: FileUploadInterface;
  index: number;
  metadata: ResourceCreationMetadata;
  onFieldChange: (fileId: string, field: keyof ResourceCreationMetadata) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
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
  const isDescriptionValid = descriptionLength <= maxDescriptionLength;

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
      {/* ✅ Enhanced file header */}
      <FileHeader file={file} index={index} isComplete={isComplete} />

      {/* ✅ Improved form layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FormField
          id={`file-title-${file.id}`}
          label="File Title"
          type="input"
          value={metadata.title}
          onChange={onFieldChange(file.id, 'title')}
          placeholder="e.g., Chapter 5: Quantum Mechanics"
          required
        />

        <FormField
          id={`file-category-${file.id}`}
          label="Category"
          type="select"
          value={metadata.category}
          onChange={onFieldChange(file.id, 'category')}
          options={DOCUMENT_CATEGORIES}
          required
        />

        <div className="lg:col-span-2">
          <FormField
            id={`file-description-${file.id}`}
            label="File Description"
            type="textarea"
            value={metadata.description}
            onChange={onFieldChange(file.id, 'description')}
            placeholder="Describe the content, topics covered, or learning objectives..."
            maxLength={maxDescriptionLength}
            helperText={`${descriptionLength}/${maxDescriptionLength} characters`}
            isValid={isDescriptionValid}
            required
          />
        </div>

        <FormField
          id={`file-visibility-${file.id}`}
          label="File Visibility"
          type="select"
          value={metadata.visibility}
          onChange={onFieldChange(file.id, 'visibility')}
          options={VISIBILITY_OPTIONS}
        />
      </div>
    </div>
  );
});

FileMetadataCard.displayName = 'FileMetadataCard';

interface FileHeaderProps {
  file: FileUploadInterface;
  index: number;
  isComplete: boolean;
}

const FileHeader = React.memo<FileHeaderProps>(({ file, index, isComplete }) => (
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
        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
          {file.file?.type || 'Unknown type'}
        </span>
      </div>
    </div>
  </div>
));

FileHeader.displayName = 'FileHeader';

interface FormFieldProps {
  id: string;
  label: string;
  type: 'input' | 'textarea' | 'select';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder?: string;
  required?: boolean;
  options?: readonly { value: string; label: string; description?: string; disabled?: boolean }[];
  maxLength?: number;
  helperText?: string;
  isValid?: boolean;
}

const FormField = React.memo<FormFieldProps>(({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  options = [],
  maxLength,
  helperText,
  isValid = true
}) => {
  const baseClasses = `
    w-full p-3 border rounded-lg transition-all duration-200
    focus:border-[#6A994E] focus:outline-none focus:ring-2 focus:ring-[#6A994E]/20
    ${isValid ? 'border-gray-300' : 'border-red-300 bg-red-50'}
  `;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {type === 'input' && (
        <input
          id={id}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={baseClasses}
          required={required}
          maxLength={maxLength}
        />
      )}

      {type === 'textarea' && (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${baseClasses} resize-none`}
          rows={3}
          required={required}
          maxLength={maxLength}
        />
      )}

      {type === 'select' && (
        <select
          id={id}
          value={value}
          onChange={onChange}
          className={baseClasses}
          required={required}
        >
          {options.map(option => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
      )}

      {helperText && (
        <p className={`text-xs ${isValid ? 'text-gray-500' : 'text-red-500'}`}>
          {helperText}
        </p>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

interface ProgressSummaryProps {
  stats: { completed: number; total: number; percentage: number };
}

const ProgressSummary = React.memo<ProgressSummaryProps>(({ stats }) => (
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
        className="bg-[#6A994E] h-2 rounded-full transition-all duration-300"
        style={{ width: `${stats.percentage}%` }}
      />
    </div>
  </div>
));

ProgressSummary.displayName = 'ProgressSummary';

// ✅ Default export following MDHH convention
export default React.memo(FileMetadataEditor);