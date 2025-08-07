"use client";

import React, { useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUploadStore } from '@/store/uploadStore';
import UploadStepper from '@/components/upload/UploadStepper';
import ClassificationLevelSelector from '@/components/upload/ClassificationLevelSelector';
import TagSelector from '@/components/upload/TagSelector';
import FolderSection from '@/components/upload/FolderSection';
import FileMetadataEditor from '@/components/upload/FileMetadataEditor';
// import ValidationErrors from '@/components/upload/ValidationErrors';
import { getIcon } from '@/utils/getIcon';
import { DocumentCategory } from '@/types/FileUploadInterface';

const DOCUMENT_CATEGORIES = [
  { value: DocumentCategory.LECTURE, label: 'Lecture', icon: 'BookOpen' },
  { value: DocumentCategory.EXAM, label: 'Exam', icon: 'FileText' },
  { value: DocumentCategory.EXERCISE, label: 'Exercise', icon: 'PenTool' },
  { value: DocumentCategory.REFERENCE, label: 'Reference', icon: 'Book' },
] as const;

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Công khai', description: 'Mọi người có thể xem và tải về' },
  { value: 'private', label: 'Riêng tư', description: 'Chỉ bạn có thể xem' },
] as const;

export default function MetadataPage() {
  const metadata = useUploadStore(state => state.metadata);
  const updateMetadata = useUploadStore(state => state.updateMetadata);
  const prevStep = useUploadStore(state => state.prevStep);
  const validateStep = useUploadStore(state => state.validateStep);
  const files = useUploadStore(state => state.files);
  const fileMetadata = useUploadStore(state => state.fileMetadata);
  const submitUpload = useUploadStore(state => state.submitUpload);
  const isSubmitting = useUploadStore(state => state.isSubmitting);
  const folderManagement = useUploadStore(state => state.folderManagement);
  const updateFolderManagement = useUploadStore(state => state.updateFolderManagement);
  const classificationLevels = useUploadStore(state => state.classificationLevels);
  const availableTags = useUploadStore(state => state.availableTags);
  const folders = useUploadStore(state => state.folders);
  const isLoadingTags = useUploadStore(state => state.isLoadingTags);
  const isLoadingFolders = useUploadStore(state => state.isLoadingFolders);
  const fetchClassificationLevels = useUploadStore(state => state.fetchClassificationLevels);
  const fetchTagsByLevel = useUploadStore(state => state.fetchTagsByLevel);
  const fetchUserFolders = useUploadStore(state => state.fetchUserFolders);
  const updateFileMetadata = useUploadStore(state => state.updateFileMetadata);
  const createFolder = useUploadStore(state => state.createFolder);
  const setValidationErrors = useUploadStore(state => state.setValidationErrors);
  const setCurrentStep = useUploadStore(state => state.setCurrentStep);
  const router = useRouter();


  useEffect(() => {
    setCurrentStep(2); // Set step 2 for metadata page
  }, [setCurrentStep]);

  useEffect(() => {
    if (classificationLevels.length === 0) {
      fetchClassificationLevels();
    }
    fetchUserFolders();
  }, [classificationLevels.length, fetchClassificationLevels, fetchUserFolders]);

  useEffect(() => {
    if (metadata.resourceClassificationId) {
      fetchTagsByLevel(metadata.resourceClassificationId);
    }
  }, [metadata.resourceClassificationId, fetchTagsByLevel]);

  const validationState = useMemo(() => {
    const isValid = validateStep(2);
    const missingFields = [];

    // Resource metadata validation
    if (!metadata.title?.trim()) missingFields.push('Resource title');
    if (!metadata.category) missingFields.push('Document category');
    if (!metadata.description?.trim()) missingFields.push('Resource description');
    if (!metadata.resourceClassificationId) missingFields.push('Classification level');

    // Folder validation
    if (!folderManagement?.selectedFolderId && !folderManagement?.newFolderData) {
      missingFields.push('Folder selection or creation');
    }

    // Individual file metadata validation
    const completedFiles = files.filter(f => f.status === 'completed');
    const incompleteFiles = completedFiles.filter(file => {
      const fileMeta = fileMetadata[file.id];
      return !fileMeta?.title?.trim() ||
        !fileMeta?.description?.trim() ||
        !fileMeta?.category;
    });

    if (incompleteFiles.length > 0) {
      missingFields.push(`${incompleteFiles.length} file(s) need complete metadata`);
    }

    return {
      isValid: isValid &&
        incompleteFiles.length === 0 &&
        (folderManagement?.selectedFolderId || folderManagement?.newFolderData),
      missingFields,
      canProceed: isValid &&
        completedFiles.length > 0 &&
        incompleteFiles.length === 0 &&
        (folderManagement?.selectedFolderId || folderManagement?.newFolderData) &&
        !isSubmitting,
      incompleteFileCount: incompleteFiles.length
    };
  }, [metadata, folderManagement, validateStep, files, fileMetadata, isSubmitting]);


  const handleNext = useCallback(async () => {
    if (!validationState.canProceed) {
      // Show specific validation errors
      if (validationState.missingFields.length > 0) {
        setValidationErrors('submit', validationState.missingFields);
      }
      return;
    }

    try {
      await submitUpload();
      router.push('/uploads/success');
    } catch (error) {
      console.error('Upload submission failed:', error);
      setValidationErrors('submit', ['Failed to complete upload. Please try again.']);
    }
  }, [validationState.canProceed, validationState.missingFields, submitUpload, router, setValidationErrors]);

  const handleBack = useCallback(() => {
    prevStep();
    router.push('/uploads');
  }, [prevStep, router]);

  const handleFieldChange = useCallback((field: string, value: any) => {
    updateMetadata({ [field]: value });
  }, [updateMetadata]);


  const handleTagsChange = useCallback((tagIds: string[]) => {
    const selectedTagObjects = availableTags.filter(tag => tagIds.includes(tag.id));
    updateMetadata({ resourceTagIds: selectedTagObjects });
  }, [availableTags, updateMetadata]);


  const handleFolderSelect = useCallback((folderId: string) => {
    updateFolderManagement({
      selectedFolderId: folderId,
      newFolderData: undefined
    });
  }, [updateFolderManagement]);

  const handleCreateNewFolder = useCallback(async (folderName: string) => {
    if (!metadata.resourceClassificationId) {
      setValidationErrors('folder', ['Please select classification level first']);
      return;
    }

    if (!folderName.trim()) {
      setValidationErrors('folder', ['Folder name is required']);
      return;
    }

    try {
      const folderId = await createFolder(
        folderName.trim(),
        metadata.resourceClassificationId,
        metadata.resourceTagIds?.map(tag => tag.id) || []
      );

      updateFolderManagement({
        selectedFolderId: folderId,
        newFolderData: undefined
      });

    } catch (error) {
      setValidationErrors('folder', ['Failed to create folder. Please try again.']);
    }
  }, [metadata.resourceClassificationId, metadata.resourceTagIds, createFolder, updateFolderManagement, setValidationErrors]);
  const completedFiles = files.filter(f => f.status === 'completed');

  return (
    <main className="max-w-4xl mx-auto px-4 py-12" role="main">
      <nav aria-label="Upload progress" className="mb-8">
        <UploadStepper />
      </nav>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Resource Information
          </h1>
          <p className="text-gray-600">
            Organize your educational materials with proper classification and metadata
          </p>
        </header>

  
        {/* <ValidationErrors
          errors={validationErrors}
          className="mb-6"
        /> */}

        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          {/* ✅ Title Field */}
          <section>
            <label htmlFor="document-title" className="block text-sm font-semibold text-gray-700 mb-3">
              Resource Title *
            </label>
            <input
              id="document-title"
              type="text"
              value={metadata.title || ''}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#6A994E] focus:border-transparent ${!metadata.title?.trim() ? 'border-red-300' : 'border-gray-300 hover:border-[#6A994E]'}`}
              placeholder="Ví dụ: Bài giảng Chương 1 - Giới thiệu về CSDL"
              required
            />
          </section>

          <section>
            <fieldset>
              <legend className="block text-sm font-semibold text-gray-700 mb-3">
                Primary Category *
              </legend>
              <div className="space-y-3">
                {DOCUMENT_CATEGORIES.map(category => (
                  <label key={category.value} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:border-[#6A994E] ${metadata.category === category.value ? 'border-[#6A994E] bg-green-50' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      name="category"
                      value={category.value}
                      checked={metadata.category === category.value}
                      onChange={(e) => handleFieldChange('category', e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${metadata.category === category.value ? 'border-[#6A994E] bg-[#6A994E]' : 'border-gray-300'}`}>
                      {metadata.category === category.value && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {getIcon(category.icon, 20, 'text-[#6A994E]')}
                      <span className="font-medium text-gray-900">{category.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </fieldset>
          </section>

          {/* Classification Level Selector */}
          <section>
            <ClassificationLevelSelector
              levels={classificationLevels}
              selectedLevelId={metadata.resourceClassificationId}
              onLevelChange={(levelId: string) => handleFieldChange('resourceClassificationId', levelId)}
              isLoading={false}
            />
          </section>
          <section>
            <TagSelector
              tags={availableTags}
              selectedTags={metadata.resourceTagIds?.map(tag => tag.id) || []}
              onTagsChange={handleTagsChange}
              disabled={!metadata.resourceClassificationId}
              isLoading={isLoadingTags}
              maxSelection={8}
              showSelectionCount={true}
              className="transition-all duration-300 ease-in-out"
            />
          </section>

          <section>
            <FolderSection
              existingFolders={folders.filter(folder =>
                folder.classification_level_id === metadata.resourceClassificationId
              )}
              selectedFolderId={folderManagement?.selectedFolderId}
              onFolderSelect={handleFolderSelect}
              onCreateNewFolder={handleCreateNewFolder}
              classificationLevelId={metadata.resourceClassificationId}
              isLoading={isLoadingFolders}
            />
          </section>

          {/* ✅ Description */}
          <section>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-3">
              Resource Description *
            </label>
            <textarea
              id="description"
              value={metadata.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#6A994E] resize-vertical ${!metadata.description?.trim() ? 'border-red-300' : 'border-gray-300 hover:border-[#6A994E]'}`}
              placeholder="Mô tả nội dung chính, chương trình liên quan, độ khó..."
              required
            />
          </section>

          {/* ✅ Visibility */}
          <section>
            <fieldset>
              <legend className="block text-sm font-semibold text-gray-700 mb-3">
                Quyền truy cập
              </legend>
              <div className="space-y-3">
                {VISIBILITY_OPTIONS.map(option => (
                  <label key={option.value} className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:border-[#6A994E] ${metadata.visibility === option.value ? 'border-[#6A994E] bg-green-50' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      name="visibility"
                      value={option.value}
                      checked={metadata.visibility === option.value}
                      onChange={(e) => handleFieldChange('visibility', e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 mr-3 mt-0.5 flex items-center justify-center ${metadata.visibility === option.value ? 'border-[#6A994E] bg-[#6A994E]' : 'border-gray-300'}`}>
                      {metadata.visibility === option.value && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-500 mt-1">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </fieldset>
          </section>
        </form>

        {/* ✅ Individual File Metadata Section */}
        {completedFiles.length > 0 && (
          <section className="border-t border-gray-200 pt-8 mt-8">
            <FileMetadataEditor
              files={completedFiles}
              fileMetadata={fileMetadata}
              onFileMetadataChange={updateFileMetadata}
              showCompletionStatus={true}
              maxDescriptionLength={500}
            />
          </section>
        )}

        {/* ✅ Validation Summary */}
        {validationState.missingFields.length > 0 && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
            <div className="flex items-start gap-3">
              {getIcon('AlertCircle', 20, 'text-red-600 mt-0.5')}
              <div>
                <h3 className="font-medium text-red-800">Vui lòng hoàn thiện thông tin</h3>
                <p className="text-sm text-red-700 mt-1">
                  Còn thiếu: {validationState.missingFields.join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ✅ Navigation */}
        <footer className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-gray-700"
          >
            {getIcon('ChevronLeft', 18)}
            Quay lại
          </button>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {completedFiles.length} file đã sẵn sàng
            </span>
            <button
              type="button"
              onClick={handleNext}
              disabled={!validationState.canProceed || isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-[#386641] text-white rounded-lg hover:bg-[#2d4f31] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#386641] focus:ring-offset-2"
            >
              {isSubmitting ? (
                <>
                  {getIcon('Loader2', 18, 'animate-spin')}
                  Processing...
                </>
              ) : (
                <>
                  Complete Upload
                  {getIcon('ChevronRight', 18)}
                </>
              )}
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}