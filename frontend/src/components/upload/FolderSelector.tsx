"use client";

import React, { useState, useCallback } from 'react';
import { getIcon } from '@/utils/getIcon';

interface Folder {
  id: string;
  name: string;
  visibility: 'public' | 'private';
  created_at: string;
}

interface FolderSelectorProps {
  folders: Folder[];
  selectedFolderId?: string;
  onFolderChange: (folderId: string) => void;
  onCreateFolder: (name: string) => Promise<void>;
  disabled: boolean;
  isLoading?: boolean;
}

const FolderSelector: React.FC<FolderSelectorProps> = ({
  folders,
  selectedFolderId,
  onFolderChange,
  onCreateFolder,
  disabled,
  isLoading = false
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const handleCreateFolder = useCallback(async () => {
    if (!newFolderName.trim()) return;
    
    setIsCreatingFolder(true);
    try {
      await onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create folder:', error);
    } finally {
      setIsCreatingFolder(false);
    }
  }, [newFolderName, onCreateFolder]);

  if (disabled) {
    return (
      <section className="opacity-50">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Folder Selection
        </label>
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <p className="text-gray-500 text-sm flex items-center gap-2">
            {getIcon('Lock', 16)}
            Please select a classification level first
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        Folder Selection *
      </label>

      {isLoading ? (
        <div className="animate-pulse bg-gray-200 h-12 rounded-lg"></div>
      ) : (
        <div className="space-y-3">
          {/* Create New Folder Option */}
          <div className={`border rounded-lg transition-all duration-200 ${
            isCreating ? 'border-[#6A994E] bg-green-50' : 'border-gray-200 hover:border-[#6A994E]'
          }`}>
            <label className="flex items-center p-4 cursor-pointer">
              <input
                type="radio"
                name="folder"
                checked={isCreating}
                onChange={() => {
                  setIsCreating(true);
                  if (selectedFolderId) onFolderChange('');
                }}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                isCreating ? 'border-[#6A994E] bg-[#6A994E]' : 'border-gray-300'
              }`}>
                {isCreating && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              
              <div className="flex items-center gap-2">
                {getIcon('Plus', 18, 'text-[#6A994E]')}
                <span className="font-medium text-gray-900">Create New Folder</span>
              </div>
            </label>

            {isCreating && (
              <div className="px-4 pb-4 border-t border-gray-200 mt-2 pt-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Enter folder name..."
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg 
                             focus:border-[#6A994E] focus:outline-none focus:ring-2 focus:ring-[#6A994E]/50"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                    autoFocus
                  />
                  <button
                    onClick={handleCreateFolder}
                    disabled={!newFolderName.trim() || isCreatingFolder}
                    className="bg-[#386641] text-white px-4 py-2 rounded-lg hover:bg-[#2d4f31] 
                             disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200
                             font-medium shadow-md hover:shadow-lg"
                  >
                    {isCreatingFolder ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      'Create'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Existing Folders */}
          {folders.map(folder => (
            <label
              key={folder.id}
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 
                         hover:border-[#6A994E] hover:shadow-md hover:shadow-[#386641]/20 ${
                selectedFolderId === folder.id
                  ? 'border-[#6A994E] bg-green-50'
                  : 'border-gray-200'
              }`}
            >
              <input
                type="radio"
                name="folder"
                value={folder.id}
                checked={selectedFolderId === folder.id}
                onChange={(e) => {
                  onFolderChange(e.target.value);
                  setIsCreating(false);
                }}
                className="sr-only"
              />
              
              <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                selectedFolderId === folder.id
                  ? 'border-[#6A994E] bg-[#6A994E]'
                  : 'border-gray-300'
              }`}>
                {selectedFolderId === folder.id && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>

              <div className="flex items-center gap-3 flex-1">
                {getIcon('Folder', 20, selectedFolderId === folder.id ? 'text-[#6A994E]' : 'text-gray-400')}
                <div>
                  <div className="font-medium text-gray-900">{folder.name}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    {getIcon(folder.visibility === 'public' ? 'Globe' : 'Lock', 14)}
                    {folder.visibility === 'public' ? 'Public' : 'Private'}
                    <span>•</span>
                    <span>{new Date(folder.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </label>
          ))}

          {folders.length === 0 && !isCreating && (
            <div className="text-center py-6 text-gray-500">
              <div className="mb-2">{getIcon('FolderPlus', 24, 'text-gray-400 mx-auto')}</div>
              <p>No folders available for this classification level.</p>
              <p className="text-sm">Create your first folder above.</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default React.memo(FolderSelector);