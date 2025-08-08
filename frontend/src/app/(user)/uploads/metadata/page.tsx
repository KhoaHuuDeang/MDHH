"use client";

import React, { useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUploadStore } from "@/store/uploadStore";
import UploadStepper from "@/components/layout/user/uploads/UploadStepper";
import FolderSection from "@/components/upload/stage2/FolderSection";
import FileMetadataEditor from "@/components/upload/stage2/FileMetadataEditor";
import { getIcon } from "@/utils/getIcon";

/**
 * MetadataPage (UI Pass)
 * - Follows Design UI Convention: brand greens, neutral grays, rounded-2xl cards
 * - Subtle Tailwind animations only (no custom keyframes): transitions, hover scale, ring
 * - Skeleton-only frame: keeps logic + layout but upgrades visuals/accessibility
 */

function MetadataPage() {
  const router = useRouter();

  // Store selectors (kept granular to avoid over-renders)
  const files = useUploadStore((s) => s.files);
  const fileMetadata = useUploadStore((s) => s.fileMetadata);
  const folderManagement = useUploadStore((s) => s.folderManagement);
  const isSubmitting = useUploadStore((s) => s.isSubmitting);
  const classificationLevels = useUploadStore((s) => s.classificationLevels);
  const availableTags = useUploadStore((s) => s.availableTags);
  const folders = useUploadStore((s) => s.folders);
  const isLoadingClassifications = useUploadStore((s) => s.isLoadingClassifications);
  const isLoadingTags = useUploadStore((s) => s.isLoadingTags);
  const isLoadingFolders = useUploadStore((s) => s.isLoadingFolders);

  // Actions
  const fetchClassificationLevels = useUploadStore((s) => s.fetchClassificationLevels);
  const fetchUserFolders = useUploadStore((s) => s.fetchUserFolders);
  const fetchTagsByLevel = useUploadStore((s) => s.fetchTagsByLevel);
  const updateFolderManagement = useUploadStore((s) => s.updateFolderManagement);
  const updateFileMetadata = useUploadStore((s) => s.updateFileMetadata);
  const submitUpload = useUploadStore((s) => s.submitUpload);
  const setCurrentStep = useUploadStore((s) => s.setCurrentStep);
  const setValidationErrors = useUploadStore((s) => s.setValidationErrors);

  // Step management
  useEffect(() => {
    setCurrentStep(2);
  }, [setCurrentStep]);

  // Load base data
  useEffect(() => {
    fetchClassificationLevels();
    fetchUserFolders();
  }, [fetchClassificationLevels, fetchUserFolders]);

  // Load tags for NEW folder path
  useEffect(() => {
    if (folderManagement.newFolderData?.folderClassificationId) {
      fetchTagsByLevel(folderManagement.newFolderData.folderClassificationId);
    }
  }, [folderManagement.newFolderData?.folderClassificationId, fetchTagsByLevel]);

  const completedFiles = useMemo(() => files.filter((f) => f.status === "completed"), [files]);

  // Validation summary (unchanged logic, presented nicer)
  const validationState = useMemo(() => {
    const missing: string[] = [];

    if (!folderManagement.selectedFolderId && !folderManagement.newFolderData) {
      missing.push("Select or create a folder");
    }

    if (folderManagement.newFolderData) {
      if (!folderManagement.newFolderData.name?.trim()) missing.push("Folder name");
      if (!folderManagement.newFolderData.folderClassificationId) missing.push("Folder classification");
    }

    const incomplete = completedFiles.filter((f) => {
      const meta = fileMetadata[f.id];
      return !meta?.title?.trim() || !meta?.description?.trim();
    });
    if (incomplete.length > 0) missing.push(`${incomplete.length} file(s) need metadata`);

    return {
      isValid: missing.length === 0,
      missing,
      canSubmit: missing.length === 0 && !isSubmitting,
      incompleteFiles: incomplete.length,
    };
  }, [folderManagement, completedFiles, fileMetadata, isSubmitting]);

  const handleSubmit = useCallback(async () => {
    if (!validationState.canSubmit) {
      if (validationState.missing.length > 0) setValidationErrors("submit", validationState.missing);
      return;
    }
    try {
      await submitUpload();
      router.push("/uploads/success");
    } catch (e) {
      setValidationErrors("submit", ["Failed to complete upload. Please try again."]);
    }
  }, [validationState, submitUpload, router, setValidationErrors]);

  const handleBack = useCallback(() => {
    router.push("/uploads");
  }, [router]);

  // --- UI helpers
  const cardClass =
    "bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all duration-300 ease-[cubic-bezier(.25,.8,.25,1)] hover:border-[#386641]/30";

  const sectionHeaderClass = "flex items-center justify-between mb-5";

  const headerTitle = (icon: string, text: string) => (
    <div className="flex items-center gap-2">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#386641]/20 bg-[#F8F9FA] text-[#386641] transition-transform duration-300 group-hover:scale-105">
        {getIcon(icon, 18)}
      </span>
      <h2 className="text-xl font-semibold text-gray-900">{text}</h2>
    </div>
  );

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 space-y-8 bg-[#F8F9FA]" role="main">
      {/* Stepper */}
      <nav aria-label="Upload progress" className="mb-2">
        <UploadStepper />
      </nav>

      {/* Page header */}
      <header className="rounded-2xl border border-[#386641]/20 bg-white/90 backdrop-blur p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Document Organization</h1>
            <p className="mt-1 text-sm text-gray-600">
              Step 1: Folder organization • Step 2: File details • Submit when complete
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[#6A994E]">
            {getIcon("CheckCircle", 18, "text-[#6A994E]")}
            <span className="text-xs">Brand UI applied</span>
          </div>
        </div>
      </header>

      {/* Folder Section */}
      <section className={`group ${cardClass} p-6`}>
        <div className={sectionHeaderClass}>
          {headerTitle("Folder", "Step 1: Folder Management")}
          <span className="text-sm text-gray-500">
            {folderManagement.selectedFolderId ? "Folder selected" : "Choose destination"}
          </span>
        </div>
        <FolderSection
          folderManagement={folderManagement}
          onFolderManagementChange={updateFolderManagement}
          existingFolders={folders}
          classificationLevels={classificationLevels}
          availableTags={availableTags}
          isLoadingFolders={isLoadingFolders}
          isLoadingClassifications={isLoadingClassifications}
          isLoadingTags={isLoadingTags}
        />
      </section>

      {/* File Metadata Section */}
      <section className={`group ${cardClass} p-6`}>
        <div className={sectionHeaderClass}>
          {headerTitle("FileText", `Step 2: File Information (${completedFiles.length})`)}
          <span className="text-sm text-gray-500">
            {completedFiles.length === 0 ? "No files uploaded yet" : `${completedFiles.length} file(s) ready`}
          </span>
        </div>
        {completedFiles.length > 0 ? (
          <FileMetadataEditor
            files={completedFiles}
            fileMetadata={fileMetadata}
            onFileMetadataChange={updateFileMetadata}
            showCompletionStatus
            maxDescriptionLength={500}
          />
        ) : (
          <div className="text-center py-10 text-gray-500">
            <div className="flex flex-col items-center gap-3">
              {getIcon("Upload", 48, "text-gray-400")}
              <p className="text-sm">Go back to upload files first</p>
            </div>
          </div>
        )}
      </section>

      {/* Validation + Actions */}
      <section className="flex flex-col-reverse md:flex-row md:items-start md:justify-between gap-6">
        <div className="flex-1">
          {!validationState.isValid ? (
            <div
              className="p-4 bg-red-100 border border-red-400 rounded-xl text-sm text-[#BC4749] shadow-sm"
              role="alert"
            >
              <div className="flex items-center gap-2 font-medium mb-1">
                {getIcon("AlertCircle", 18, "text-[#BC4749]")}
                Missing requirements
              </div>
              <ul className="list-disc ml-5 space-y-0.5">
                {validationState.missing.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2 shadow-sm">
              {getIcon("CheckCircle", 18, "text-green-600")}
              All metadata complete. Ready to submit!
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="px-5 py-2 rounded-lg text-sm font-medium bg-gray-50 text-gray-700 border border-gray-200 transition-all duration-200 hover:bg-[#6A994E] hover:text-white hover:border-[#6A994E] focus:outline-none focus:ring-2 focus:ring-[#6A994E]/40"
          >
            Back
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!validationState.canSubmit}
            className={`px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#6A994E]/50 disabled:opacity-60 disabled:cursor-not-allowed ${
              validationState.canSubmit
                ? "bg-[#386641] text-white hover:bg-[#2d4f31] shadow-md hover:shadow-lg"
                : "bg-gray-300 text-white"
            }`}
          >
            {isSubmitting ? (
              <>
                {getIcon("Loader2", 16, "animate-spin")}
                Submitting...
              </>
            ) : (
              <>
                Complete Upload
                {getIcon("ChevronRight", 16)}
              </>
            )}
          </button>
        </div>
      </section>
    </main>
  );
}

MetadataPage.displayName = "MetadataPage";
export default MetadataPage;
