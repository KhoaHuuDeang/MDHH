"use client";

import React, { useCallback, useState, useMemo } from 'react';
import { getIcon } from '@/utils/getIcon';
import { Folder } from '@/types/FolderInterface';

interface FolderSectionProps {
  existingFolders: Folder[];
  selectedFolderId?: string;
  onFolderSelect: (folderId: string) => void;
  onCreateNewFolder: (folderName: string) => void;
  classificationLevelId?: string;
  isLoading?: boolean;
  className?: string;
}

function FolderSection({
  existingFolders,
  selectedFolderId,
  onFolderSelect,
  onCreateNewFolder,
  classificationLevelId,
  isLoading = false,
  className = ''
}: FolderSectionProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [validationError, setValidationError] = useState('');

  // ✅ Memoized filtered folders by classification level
  const availableFolders = useMemo(() => {
    if (!classificationLevelId) return [];
    return existingFolders.filter(folder => 
      folder.classification_level_id === classificationLevelId
    );
  }, [existingFolders, classificationLevelId]);

  // ✅ Optimized handlers with useCallback
  const handleFolderSelect = useCallback((folderId: string) => {
    setShowCreateForm(false);
    setNewFolderName('');
    setValidationError('');
    onFolderSelect(folderId);
  }, [onFolderSelect]);

  const handleCreateNewFolder = useCallback(() => {
    if (!newFolderName.trim()) {
      setValidationError('Folder name is required');
      return;
    }

    if (newFolderName.length < 3) {
      setValidationError('Folder name must be at least 3 characters');
      return;
    }

    // Check for duplicate names
    const isDuplicate = availableFolders.some(folder => 
      folder.name.toLowerCase() === newFolderName.trim().toLowerCase()
    );

    if (isDuplicate) {
      setValidationError('A folder with this name already exists');
      return;
    }

    onCreateNewFolder(newFolderName.trim());
    setNewFolderName('');
    setShowCreateForm(false);
    setValidationError('');
  }, [newFolderName, availableFolders, onCreateNewFolder]);

  const handleToggleCreateForm = useCallback(() => {
    setShowCreateForm(prev => !prev);
    setValidationError('');
    if (showCreateForm) {
      setNewFolderName('');
    }
  }, [showCreateForm]);

  // ✅ Early return for disabled state
  if (!classificationLevelId) {
    return (
      <DisabledState 
        message="Please select a classification level first"
        className={className}
      />
    );
  }

  return (
    <section className={`space-y-6 ${className}`} aria-labelledby="folder-section-title">
      {/* Folder selection*/}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getIcon('Folder', 24, 'text-[#6A994E]')}
          <h3 id="folder-section-title" className="text-lg font-semibold text-gray-900">
            Choose Folder
          </h3>
          {availableFolders.length > 0 && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              {availableFolders.length} available
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleToggleCreateForm}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#6A994E] 
                     border border-[#6A994E] rounded-lg hover:bg-[#6A994E] hover:text-white 
                     transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#6A994E]/50"
          aria-expanded={showCreateForm}
        >
          {getIcon(showCreateForm ? 'X' : 'Plus', 16)}
          {showCreateForm ? 'Cancel' : 'New Folder'}
        </button>
      </div>

      {/* ✅ Loading state */}
      {isLoading ? (
        <LoadingState />
      ) : (
        <>
          {/* ✅ Create new folder form */}
          {showCreateForm && (
            <CreateFolderForm
              newFolderName={newFolderName}
              setNewFolderName={setNewFolderName}
              validationError={validationError}
              onSubmit={handleCreateNewFolder}
              onCancel={handleToggleCreateForm}
            />
          )}

          {/* ✅ Existing folders grid */}
          {availableFolders.length > 0 ? (
            <FolderGrid
              folders={availableFolders}
              selectedFolderId={selectedFolderId}
              onFolderSelect={handleFolderSelect}
            />
          ) : (
            <EmptyFoldersState 
              onCreateFirst={() => setShowCreateForm(true)}
            />
          )}
        </>
      )}
    </section>
  );
}

// ✅ Extracted sub-components for better maintainability
const DisabledState = React.memo<{ message: string; className?: string }>(({ 
  message, 
  className = '' 
}) => (
  <section className={`opacity-50 ${className}`}>
    <div className="p-6 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
      <div className="text-center">
        {getIcon('Lock', 32, 'text-gray-400 mx-auto mb-3')}
        <p className="text-gray-500 text-sm">{message}</p>
      </div>
    </div>
  </section>
));

const LoadingState = React.memo(() => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: 3 }, (_, i) => (
      <div key={i} className="animate-pulse bg-gray-200 h-24 rounded-lg" />
    ))}
  </div>
));

interface CreateFolderFormProps {
  newFolderName: string;
  setNewFolderName: (name: string) => void;
  validationError: string;
  onSubmit: () => void;
  onCancel: () => void;
}

const CreateFolderForm = React.memo<CreateFolderFormProps>(({
  newFolderName,
  setNewFolderName,
  validationError,
  onSubmit,
  onCancel
}) => (
  <div className="p-4 border border-[#6A994E]/30 rounded-lg bg-green-50/50">
    <div className="flex items-center gap-3 mb-3">
      {getIcon('FolderPlus', 20, 'text-[#6A994E]')}
      <h4 className="font-medium text-gray-900">Create New Folder</h4>
    </div>
    
    <div className="space-y-3">
      <input
        type="text"
        value={newFolderName}
        onChange={(e) => setNewFolderName(e.target.value)}
        placeholder="Enter folder name..."
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 
                   focus:ring-[#6A994E]/50 transition-all duration-200
                   ${validationError ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSubmit();
          if (e.key === 'Escape') onCancel();
        }}
        autoFocus
      />
      
      {validationError && (
        <p className="text-red-600 text-xs flex items-center gap-1">
          {getIcon('AlertCircle', 14)}
          {validationError}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!newFolderName.trim()}
          className="flex-1 px-3 py-2 bg-[#386641] text-white rounded-lg 
                     hover:bg-[#2d4f31] disabled:bg-gray-400 disabled:cursor-not-allowed
                     transition-all duration-200 text-sm font-medium"
        >
          Create Folder
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg 
                     hover:bg-gray-50 transition-all duration-200 text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
));

interface FolderGridProps {
  folders: Folder[];
  selectedFolderId?: string;
  onFolderSelect: (folderId: string) => void;
}

const FolderGrid = React.memo<FolderGridProps>(({ 
  folders, 
  selectedFolderId, 
  onFolderSelect 
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {folders.map(folder => (
      <FolderCard
        key={folder.id}
        folder={folder}
        isSelected={selectedFolderId === folder.id}
        onSelect={() => onFolderSelect(folder.id)}
      />
    ))}
  </div>
));

interface FolderCardProps {
  folder: Folder;
  isSelected: boolean;
  onSelect: () => void;
}

const FolderCard = React.memo<FolderCardProps>(({ folder, isSelected, onSelect }) => (
  <button
    type="button"
    onClick={onSelect}
    className={`p-4 border-2 rounded-lg text-left transition-all duration-200
               hover:shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#6A994E]/50
               ${isSelected 
                 ? 'border-[#6A994E] bg-green-50 shadow-lg shadow-[#6A994E]/20' 
                 : 'border-gray-200 hover:border-[#6A994E]/50'
               }`}
    aria-pressed={isSelected}
  >
    <div className="flex items-start gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                      ${isSelected ? 'bg-[#6A994E]' : 'bg-gray-100'}`}>
        {getIcon('Folder', 20, isSelected ? 'text-white' : 'text-gray-600')}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className={`font-medium truncate ${isSelected ? 'text-[#6A994E]' : 'text-gray-900'}`}>
          {folder.name}
        </h4>
        {folder.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {folder.description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-gray-400">
            {folder.visibility === 'public' ? '🌐 Public' : '🔒 Private'}
          </span>
        </div>
      </div>
    </div>
  </button>
));

const EmptyFoldersState = React.memo<{ onCreateFirst: () => void }>(({ onCreateFirst }) => (
  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
    {getIcon('Folder', 48, 'text-gray-300 mx-auto mb-4')}
    <h4 className="text-lg font-medium text-gray-900 mb-2">No folders available</h4>
    <p className="text-gray-500 text-sm mb-4">
      Create your first folder for this classification level
    </p>
    <button
      type="button"
      onClick={onCreateFirst}
      className="px-4 py-2 bg-[#6A994E] text-white rounded-lg hover:bg-[#386641] 
                 transition-colors duration-200 text-sm font-medium"
    >
      Create First Folder
    </button>
  </div>
));

// Set display names for debugging
DisabledState.displayName = 'DisabledState';
LoadingState.displayName = 'LoadingState';
CreateFolderForm.displayName = 'CreateFolderForm';
FolderGrid.displayName = 'FolderGrid';
FolderCard.displayName = 'FolderCard';
EmptyFoldersState.displayName = 'EmptyFoldersState';

export default React.memo(FolderSection);