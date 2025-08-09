"use client";

import React, { useCallback } from 'react';
import { getIcon } from '@/utils/getIcon';
import { DocumentCategory, FileUploadInterface } from '@/types/FileUploadInterface';

interface FileMetadata {
  title: string;
  description: string;
  category: DocumentCategory;
  visibility: 'PUBLIC' | 'PRIVATE';
}

interface FileMetadataCardProps {
  file: FileUploadInterface;
  index: number;
  metadata: FileMetadata;
  onFieldChange: (fileId: string, field: keyof FileMetadata) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  maxDescriptionLength: number;
}

const DOCUMENT_CATEGORIES = [
  { value: DocumentCategory.LECTURE, label: '📚 Lecture', icon: 'BookOpen' },
  { value: DocumentCategory.EXAM, label: '📋 Exam', icon: 'FileText' },
  { value: DocumentCategory.EXERCISE, label: '📝 Exercise', icon: 'PenTool' },
  { value: DocumentCategory.REFERENCE, label: '📖 Reference', icon: 'Book' },
  { value: DocumentCategory.OTHER, label: '📄 Other', icon: 'File' },
] as const;

const VISIBILITY_OPTIONS = [
  {
    value: 'PUBLIC',
    label: '🌐 Public',
    description: 'Anyone can view and download',
    icon: 'Globe'
  },
  {
    value: 'PRIVATE',
    label: '🔒 Private',
    description: 'Only you can access',
    icon: 'Lock'
  },
] as const;

function FileMetadataCard({
  file,
  index,
  metadata,
  onFieldChange,
  maxDescriptionLength
}: FileMetadataCardProps) {
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
}

FileMetadataCard.displayName = 'FileMetadataCard';

export default React.memo(FileMetadataCard);