import React, { useCallback } from 'react';
import { getIcon } from '@/utils/getIcon';

interface FolderMetadataSectionProps {
  title: string;
  description: string;
  visibility: 'public' | 'private';
  onFieldChange: (field: string, value: string) => void;
}

function FolderMetadataSection({
  title,
  description,
  visibility,
  onFieldChange
}: FolderMetadataSectionProps) {
  
  const handleInputChange = useCallback((field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    onFieldChange(field, e.target.value);
  }, [onFieldChange]);

  return (
    <section className="space-y-6" aria-labelledby="folder-metadata-title">
      <div className="flex items-center gap-3">
        {getIcon('Folder', 24, 'text-[#6A994E]')}
        <h2 id="folder-metadata-title" className="text-xl font-semibold text-gray-900">
          Folder Information
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Folder Title */}
        <div className="space-y-2">
          <label htmlFor="folder-title" className="block text-sm font-medium text-gray-700">
            Folder Title <span className="text-red-500">*</span>
          </label>
          <input
            id="folder-title"
            type="text"
            value={title}
            onChange={handleInputChange('title')}
            placeholder="e.g., Advanced Physics Materials"
            className="w-full p-3 border border-gray-300 rounded-lg 
                       focus:border-[#6A994E] focus:outline-none focus:ring-2 focus:ring-[#6A994E]/20
                       transition-all duration-200"
            aria-describedby="title-help"
            required
          />
          <p id="title-help" className="text-xs text-gray-500">
            Choose a descriptive name for your folder
          </p>
        </div>

        {/* Visibility */}
        <div className="space-y-2">
          <label htmlFor="folder-visibility" className="block text-sm font-medium text-gray-700">
            Visibility
          </label>
          <select
            id="folder-visibility"
            value={visibility}
            onChange={handleInputChange('visibility')}
            className="w-full p-3 border border-gray-300 rounded-lg 
                       focus:border-[#6A994E] focus:outline-none focus:ring-2 focus:ring-[#6A994E]/20
                       transition-all duration-200"
          >
            <option value="public">Public - Anyone can view</option>
            <option value="private">Private - Only you can view</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="folder-description" className="block text-sm font-medium text-gray-700">
          Folder Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="folder-description"
          value={description}
          onChange={handleInputChange('description')}
          placeholder="Describe the contents and purpose of this folder..."
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-lg 
                     focus:border-[#6A994E] focus:outline-none focus:ring-2 focus:ring-[#6A994E]/20
                     transition-all duration-200 resize-none"
          aria-describedby="description-help"
          required
        />
        <p id="description-help" className="text-xs text-gray-500">
          Provide context about the educational materials in this folder
        </p>
      </div>
    </section>
  );
}

export default React.memo(FolderMetadataSection);