// skibidi-existing-folder-selector.tsx
"use client";

import React from 'react';
import { getIcon } from '@/utils/getIcon';
import { Folder } from '@/types/FolderInterface';

interface ExistingFolderSelectorProps {
  folders: Folder[];
  selectedFolderId?: string;
  onFolderSelect: (folderId: string) => void;
  isLoading: boolean;
}

function ExistingFolderSelector({
  folders,
  selectedFolderId,
  onFolderSelect,
  isLoading
}: ExistingFolderSelectorProps) {
  //  Loading State
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  // Empty State
  if (folders.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
        {getIcon('Folder', 48, 'text-gray-300 mx-auto mb-4')}
        <h4 className="text-lg font-medium text-gray-900 mb-2">No folders available</h4>
        <p className="text-gray-500 text-sm">Create a new folder to get started</p>
      </div>
    );
  }

  //  Main Content
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {folders.map(folder => (
        <button
          key={folder.id}
          type="button"
          onClick={() => onFolderSelect(folder.id)}
          className={`p-4 border-2 rounded-lg text-left transition-all duration-200
                     hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500/50
                     ${selectedFolderId === folder.id 
                       ? 'border-green-500 bg-green-50 shadow-lg' 
                       : 'border-gray-200 hover:border-green-300'
                     }`}
          aria-pressed={selectedFolderId === folder.id}
        >
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                            ${selectedFolderId === folder.id ? 'bg-green-500' : 'bg-gray-100'}`}>
              {getIcon('Folder', 20, selectedFolderId === folder.id ? 'text-white' : 'text-gray-600')}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={`font-medium truncate ${selectedFolderId === folder.id ? 'text-green-700' : 'text-gray-900'}`}>
                {folder.name}
              </h4>
              {folder.description && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {folder.description}
                </p>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

ExistingFolderSelector.displayName = 'ExistingFolderSelector';

export default React.memo(ExistingFolderSelector);