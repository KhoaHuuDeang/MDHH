"use client";

import React, { useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUploadStore } from '@/store/uploadStore';
import UploadStepper from '@/components/upload/UploadStepper';
import TagSelector from '@/components/upload/TagSelector';
import { getIcon } from '@/utils/getIcon';

export default function MetadataPage() {
  const router = useRouter();
  const {
    metadata,
    updateMetadata,
    nextStep,
    prevStep,
    files,
    fileMetadata,
    classificationLevels,
    availableTags,
    isLoadingClassifications,
    isLoadingTags,
    fetchClassificationLevels,
    fetchTagsByLevel,
    updateFileMetadata,
    validateMetadataCompletion,
    setError,
    clearAllErrors,
  } = useUploadStore();

  // Load initial data
  useEffect(() => {
    fetchClassificationLevels();
    clearAllErrors();
  }, [fetchClassificationLevels, clearAllErrors]);

  // Load tags when classification changes
  useEffect(() => {
    if (metadata.classificationLevelId) {
      fetchTagsByLevel(metadata.classificationLevelId);
    }
  }, [metadata.classificationLevelId, fetchTagsByLevel]);

  const completedFiles = useMemo(() => 
    files.filter(f => f.status === 'completed'), 
    [files]
  );

  // Validation state với useMemo để tối ưu performance
  const validationState = useMemo(() => {
    const isValid = validateMetadataCompletion();
    const missingFields = [];

    if (!metadata.classificationLevelId) missingFields.push('Classification Level');
    if (!metadata.title?.trim()) missingFields.push('Folder Title');
    if (!metadata.description?.trim()) missingFields.push('Folder Description');
    
    // Check individual file metadata
    const incompleteFiles = completedFiles.filter(file => {
      const fileMeta = fileMetadata[file.id];
      return !fileMeta?.title?.trim() || !fileMeta?.description?.trim() || !fileMeta?.category;
    });

    return {
      isValid,
      missingFields,
      incompleteFiles,
      canProceed: isValid && completedFiles.length > 0
    };
  }, [metadata, fileMetadata, completedFiles, validateMetadataCompletion]);

  // Handlers với useCallback để tránh re-render
  const handleNext = useCallback(() => {
    if (!validationState.canProceed) {
      setError('validation', 'Please complete all required metadata fields');
      return;
    }

    nextStep();
    router.push('/uploads/review');
  }, [validationState.canProceed, nextStep, router, setError]);

  const handleBack = useCallback(() => {
    prevStep();
    router.push('/uploads');
  }, [prevStep, router]);

  const handleClassificationChange = useCallback((levelId: string) => {
    updateMetadata({ 
      classificationLevelId: levelId,
      tags: [] // Clear tags when level changes
    });
  }, [updateMetadata]);

  if (completedFiles.length === 0) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12" role="main">
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            {getIcon('AlertTriangle', 48, 'text-red-600')}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Files Available</h1>
          <p className="text-gray-600 mb-8">
            Please complete file upload in Step 1 before proceeding to metadata collection.
          </p>
          <button
            onClick={() => router.push('/uploads')}
            className="bg-[#386641] text-white px-8 py-3 font-semibold rounded-lg hover:bg-[#2d4f31] transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#386641] focus:ring-offset-2"
          >
            {getIcon('ChevronLeft', 18, 'mr-2')}
            Back to Upload
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-12" role="main">
      {/* Progress Stepper */}
      <nav aria-label="Upload progress" className="mb-8">
        <UploadStepper />
      </nav>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <header className="bg-gradient-to-r from-[#F0F7F4] to-[#E8F5E8] px-8 py-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Folder Information {/* ✅ Updated from "Document Information" */}
          </h1>
          <p className="text-gray-600">
            Organize your educational materials with proper classification and metadata
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
            {getIcon('FileText', 16)}
            <span>{completedFiles.length} files ready for metadata</span>
          </div>
        </header>

        <div className="p-8">
          <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
            {/* 1. Classification Level Selection */}
            <ClassificationLevelSelector
              levels={classificationLevels}
              selectedLevelId={metadata.classificationLevelId}
              onLevelChange={handleClassificationChange}
              isLoading={isLoadingClassifications}
            />

            {/* 2. Tags Selection (dependent on classification) */}
            {metadata.classificationLevelId && (
              <TagSelector
                tags={availableTags}
                selectedTags={metadata.tags || []}
                onTagsChange={(tags) => updateMetadata({ tags })}
                isLoading={isLoadingTags}
                className="transition-all duration-300 ease-in-out"
              />
            )}

            {/* 3. Folder-level Metadata */}
            <FolderMetadataSection
              title={metadata.title || ''}
              description={metadata.description || ''}
              visibility={metadata.visibility || 'public'}
              onFieldChange={(field, value) => updateMetadata({ [field]: value })}
            />

            {/* 4. Individual Files Metadata */}
            <FileMetadataEditor
              files={completedFiles}
              fileMetadata={fileMetadata}
              onFileMetadataChange={updateFileMetadata}
            />
          </form>

          {/* Validation Summary */}
          {(!validationState.isValid || validationState.incompleteFiles.length > 0) && (
            <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-lg" role="alert">
              <div className="flex items-start gap-4">
                {getIcon('AlertCircle', 24, 'text-red-600 mt-0.5 flex-shrink-0')}
                <div className="flex-1">
                  <h3 className="font-semibold text-red-800 mb-2">
                    Please complete the following requirements:
                  </h3>
                  
                  {validationState.missingFields.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm text-red-700 font-medium mb-1">Missing folder information:</p>
                      <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
                        {validationState.missingFields.map(field => (
                          <li key={field}>{field}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {validationState.incompleteFiles.length > 0 && (
                    <div>
                      <p className="text-sm text-red-700 font-medium mb-1">
                        Files missing metadata ({validationState.incompleteFiles.length}):
                      </p>
                      <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
                        {validationState.incompleteFiles.map(file => (
                          <li key={file.id}>{file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <footer className="flex justify-between items-center mt-10 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              {getIcon('ChevronLeft', 18)}
              Back to Upload
            </button>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  {completedFiles.length} files • Step 2 of 3
                </div>
                {validationState.isValid && (
                  <div className="text-sm text-green-600 font-medium">
                    ✓ All metadata complete
                  </div>
                )}
              </div>
              
              <button
                type="button"
                onClick={handleNext}
                disabled={!validationState.canProceed}
                className="flex items-center gap-2 px-8 py-3 bg-[#386641] text-white rounded-lg hover:bg-[#2d4f31] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#386641] focus:ring-offset-2"
                aria-describedby="next-help"
              >
                Continue to Review
                {getIcon('ChevronRight', 18)}
              </button>
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
}