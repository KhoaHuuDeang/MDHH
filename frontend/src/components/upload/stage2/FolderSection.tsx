"use client";

import React, { useCallback, useState, useMemo } from "react";
import { getIcon } from "@/utils/getIcon";
import { Folder, ClassificationLevel, Tag } from "@/types/FolderInterface";
import { FolderManagement } from "@/types/FileUploadInterface";
import ExistingFolderSelector from "./sub-components/FolderSection/ExistingFolderSelector";
import NewFolderForm from "./sub-components/FolderSection/NewFolderForm";

interface FolderSectionProps {
  folderManagement: FolderManagement;
  onFolderManagementChange: (data: Partial<FolderManagement>) => void;
  existingFolders: Folder[];
  classificationLevels: ClassificationLevel[];
  availableTags: Tag[];
  isLoadingFolders?: boolean;
  isLoadingClassifications?: boolean;
  isLoadingTags?: boolean;
  className?: string;
}

function FolderSection({
  folderManagement,
  onFolderManagementChange,
  existingFolders,
  classificationLevels,
  availableTags,
  isLoadingFolders = false,
  isLoadingClassifications = false,
  isLoadingTags = false,
  className = "",
}: FolderSectionProps) {
  const [localMode, setLocalMode] = useState<"select" | "create">("select");

  // Memoized folders
  const availableFolders = useMemo(() => existingFolders || [], [existingFolders]);

  // Handlers
  const handleModeChange = useCallback(
    (mode: "select" | "create") => {
      setLocalMode(mode);
      if (mode === "select") {
        onFolderManagementChange({ selectedFolderId: undefined, newFolderData: undefined });
      } else {
        onFolderManagementChange({
          selectedFolderId: undefined,
          newFolderData: { name: "", description: "", folderClassificationId: "", folderTagIds: [] },
        });
      }
    },
    [onFolderManagementChange]
  );

  const handleFolderSelect = useCallback(
    (folderId: string) => {
      const folder = availableFolders.find((f) => f.id === folderId);
      if (folder) {
        onFolderManagementChange({
          selectedFolderId: folderId,
          newFolderData: {
            name: folder.name,
            description: folder.description || "",
            folderClassificationId: folder.classification_level_id!,
            folderTagIds: folder.tags?.map((t) => t.id) || [],
          },
        });
      }
    },
    [availableFolders, onFolderManagementChange]
  );

  const handleNewFolderDataChange = useCallback(
    (field: string, value: any) => {
      onFolderManagementChange({ newFolderData: { ...folderManagement.newFolderData!, [field]: value } });
    },
    [folderManagement.newFolderData, onFolderManagementChange]
  );

  return (
    <section className={["space-y-6", className].join(" ")} aria-labelledby="folder-section-title">
      {/* Segmented control */}
      <div className="inline-flex rounded-2xl border border-gray-200 bg-white/90 backdrop-blur p-1 shadow-sm">
        <div className="relative grid grid-cols-2">
          {/* Sliding highlight */}
          <span
            className={[
              "absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] rounded-xl border",
              "border-[#6A994E]/30 bg-[#E8F5E9]",
              "transition-transform duration-300 ease-[cubic-bezier(.25,.8,.25,1)]",
              localMode === "create" ? "translate-x-full" : "translate-x-0",
            ].join(" ")}
            aria-hidden
          />

          <button
            type="button"
            onClick={() => handleModeChange("select")}
            aria-pressed={localMode === "select"}
            className={[
              "relative z-10 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium",
              "transition-all duration-200 ease-[cubic-bezier(.25,.8,.25,1)]",
              localMode === "select" ? "text-[#386641]" : "text-gray-600 hover:text-[#386641]",
            ].join(" ")}
          >
            {getIcon("FolderOpen", 16)}
            Select Existing
            <span className="ml-1 text-xs text-gray-400">({availableFolders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange("create")}
            aria-pressed={localMode === "create"}
            className={[
              "relative z-10 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium",
              "transition-all duration-200 ease-[cubic-bezier(.25,.8,.25,1)]",
              localMode === "create" ? "text-[#386641]" : "text-gray-600 hover:text-[#386641]",
            ].join(" ")}
          >
            {getIcon("FolderPlus", 16)}
            Create New
          </button>
        </div>
      </div>

      {/* Status strip */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white/80 px-2.5 py-1 text-gray-600">
          {getIcon("Folder", 14, "text-gray-500")} {isLoadingFolders ? "Loading folders…" : `${availableFolders.length} folder(s)`}
        </span>
      </div>

      {/* Body */}
      <div className="relative min-h-[60px]">
        {localMode === "select" ? (
          <div className="transition-all duration-300 ease-[cubic-bezier(.25,.8,.25,1)]">
            <ExistingFolderSelector
              folders={availableFolders}
              selectedFolderId={folderManagement.selectedFolderId}
              onFolderSelect={handleFolderSelect}
              isLoading={isLoadingFolders}
            />
          </div>
        ) : (
          <div className="transition-all duration-300 ease-[cubic-bezier(.25,.8,.25,1)]">
            <NewFolderForm
              folderData={folderManagement.newFolderData}
              onFolderDataChange={handleNewFolderDataChange}
              classificationLevels={classificationLevels}
              availableTags={availableTags}
              isLoadingClassifications={isLoadingClassifications}
              isLoadingTags={isLoadingTags}
            />
          </div>
        )}
      </div>

      {/* Hint */}
      <p className="text-xs text-gray-500">
        Tip: Chọn folder có sẵn để kế thừa classification/tags, hoặc tạo mới để đặt metadata riêng.
      </p>
    </section>
  );
}

FolderSection.displayName = "FolderSection";
export default React.memo(FolderSection);
