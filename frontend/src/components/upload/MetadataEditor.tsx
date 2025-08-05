import React, { useCallback } from 'react';
import { getIcon } from '@/utils/getIcon';
import { FileUploadInterface } from '@/types/FileUploadInterface';
import { ResourceMetadata } from '@/types/FolderInterface';

interface FileMetadataEditorProps {
  files: FileUploadInterface[];
  fileMetadata: Record<string, ResourceMetadata>;
  onFileMetadataChange: (fileId: string, field: string, value: string) => void;
}

const RESOURCE_CATEGORIES = [
  { value: 'lecture', label: 'Lecture Notes' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'exam', label: 'Exam/Test' },
  { value: 'reference', label: 'Reference Material' },
  { value: 'lab', label: 'Lab/Practice' },
  { value: 'project', label: 'Project' },
  { value: 'other', label: 'Other' },
];

function FileMetadataEditor({ 
  files, 
  fileMetadata, 
  onFileMetadataChange 
}: FileMetadataEditorProps) {
  
  const handleFieldChange = useCallback((fileId: string, field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    onFileMetadataChange(fileId, field, e.target.value);
  }, [onFileMetadataChange]);

  const getFileMetadata = useCallback((fileId: string): ResourceMetadata => {
    return fileMetadata[fileId] || {
      title: '',
      description: '',
      category: '',
      visibility: 'public'
    };
  }, [fileMetadata]);

  return (
    <section className="space-y-6" aria-labelledby="file-metadata-title">
      <div className="flex items-center gap-3">
        {getIcon('Files', 24, 'text-[#6A994E]')}
        <h2 id="file-metadata-title" className="text-xl font-semibold text-gray-900">
          Individual File Information
        </h2>
      </div>
      
      <p className="text-gray-600 text-sm">
        Provide specific metadata for each uploaded file
      </p>

      <div className="space-y-8">
        {files.map((file, index) => {
          const fileMeta = getFileMetadata(file.id);
          const isComplete = !!(fileMeta.title?.trim() && fileMeta.description?.trim() && fileMeta.category);
          
          return (
            <div 
              key={file.id}
              className={`
                p-6 rounded-lg border-2 transition-all duration-200
                ${isComplete 
                  ? 'border-green-200 bg-green-50/50' 
                  : 'border-orange-200 bg-orange-50/30'
                }
              `}
            >
              {/* File Header */}
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
                  <h3 className="font-semibold text-gray-900 mb-1">
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

              {/* Metadata Form */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* File Title */}
                <div className="space-y-2">
                  <label 
                    htmlFor={`file-title-${file.id}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    File Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`file-title-${file.id}`}
                    type="text"
                    value={fileMeta.title}
                    onChange={handleFieldChange(file.id, 'title')}
                    placeholder="e.g., Chapter 5: Quantum Mechanics"
                    className="w-full p-3 border border-gray-300 rounded-lg 
                               focus:border-[#6A994E] focus:outline-none focus:ring-2 focus:ring-[#6A994E]/20
                               transition-all duration-200"
                    required
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label 
                    htmlFor={`file-category-${file.id}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id={`file-category-${file.id}`}
                    value={fileMeta.category}
                    onChange={handleFieldChange(file.id, 'category')}
                    className="w-full p-3 border border-gray-300 rounded-lg 
                               focus:border-[#6A994E] focus:outline-none focus:ring-2 focus:ring-[#6A994E]/20
                               transition-all duration-200"
                    required
                  >
                    <option value="">Select category...</option>
                    {RESOURCE_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* File Description - spans full width */}
                <div className="lg:col-span-2 space-y-2">
                  <label 
                    htmlFor={`file-description-${file.id}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    File Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id={`file-description-${file.id}`}
                    value={fileMeta.description}
                    onChange={handleFieldChange(file.id, 'description')}
                    placeholder="Describe the content, topics covered, or learning objectives..."
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg 
                               focus:border-[#6A994E] focus:outline-none focus:ring-2 focus:ring-[#6A994E]/20
                               transition-all duration-200 resize-none"
                    required
                  />
                </div>

                {/* File Visibility */}
                <div className="space-y-2">
                  <label 
                    htmlFor={`file-visibility-${file.id}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    File Visibility
                  </label>
                  <select
                    id={`file-visibility-${file.id}`}
                    value={fileMeta.visibility}
                    onChange={handleFieldChange(file.id, 'visibility')}
                    className="w-full p-3 border border-gray-300 rounded-lg 
                               focus:border-[#6A994E] focus:outline-none focus:ring-2 focus:ring-[#6A994E]/20
                               transition-all duration-200"
                  >
                    <option value="public">Public - Anyone can view</option>
                    <option value="private">Private - Only you can view</option>
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default React.memo(FileMetadataEditor);