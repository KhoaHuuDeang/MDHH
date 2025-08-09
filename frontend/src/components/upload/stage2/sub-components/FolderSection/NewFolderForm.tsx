"use client";

import React, { useMemo } from "react";
import { getIcon } from "@/utils/getIcon";
import { ClassificationLevel, Tag } from "@/types/FolderInterface";
import ClassificationLevelSelector from "../../ClassificationLevelSelector";
import TagSelector from "../../TagSelector";

interface NewFolderFormProps {
  folderData?: {
    name: string;
    description?: string;
    folderClassificationId: string;
    folderTagIds?: string[];
  };
  onFolderDataChange: (field: string, value: any) => void;
  classificationLevels: ClassificationLevel[];
  availableTags: Tag[];
  isLoadingClassifications: boolean;
  isLoadingTags: boolean;
}

function NewFolderForm({
  folderData,
  onFolderDataChange,
  classificationLevels,
  availableTags,
  isLoadingClassifications,
  isLoadingTags,
}: NewFolderFormProps) {
  const nameLen = folderData?.name?.length ?? 0;
  const descLen = folderData?.description?.length ?? 0;

  const nameHelp = useMemo(() => {
    if (nameLen === 0) return "Tên ngắn gọn, dễ tìm lại.";
    if (nameLen < 3) return "Tên hơi ngắn — cân nhắc mô tả rõ hơn.";
    return "Looks good.";
  }, [nameLen]);

  return (
    <div className="group space-y-6 rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-sm transition-all duration-300 ease-[cubic-bezier(.25,.8,.25,1)] hover:shadow-md">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#386641]/20 bg-[#F0F8F2] text-[#386641] transition-transform duration-300 group-hover:scale-105">
          {getIcon("FolderPlus", 18)}
        </span>
        <h4 className="text-base font-semibold text-gray-900">Create New Folder</h4>
      </div>

      {/* Folder Name */}
      <div>
        <label htmlFor="folder-name" className="mb-2 block text-sm font-medium text-gray-700">
          Folder Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="folder-name"
            type="text"
            value={folderData?.name || ""}
            onChange={(e) => onFolderDataChange("name", e.target.value)}
            placeholder="Enter folder name..."
            aria-required
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-xs focus:border-[#6A994E] focus:ring-2 focus:ring-[#6A994E]/40 transition-all"
          />
          <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
            <span>{nameHelp}</span>
            <span className="tabular-nums">{nameLen}</span>
          </div>
        </div>
      </div>

      {/* Folder Description */}
      <div>
        <label htmlFor="folder-desc" className="mb-2 block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="folder-desc"
          value={folderData?.description || ""}
          onChange={(e) => onFolderDataChange("description", e.target.value)}
          placeholder="Describe the folder content..."
          rows={3}
          className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-xs focus:border-[#6A994E] focus:ring-2 focus:ring-[#6A994E]/40 transition-all"
        />
        <div className="mt-1 text-right text-xs text-gray-500 tabular-nums">{descLen}</div>
      </div>

      {/* Classification Level */}
      <div className="rounded-xl border border-gray-100 bg-white/70 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
          {getIcon("Layers", 16, "text-gray-500")} <span>Classification Level</span>
        </div>
        <div className={isLoadingClassifications ? "animate-pulse" : ""}>
          <ClassificationLevelSelector
            levels={classificationLevels}
            selectedLevelId={folderData?.folderClassificationId}
            onLevelChange={(levelId) => onFolderDataChange("folderClassificationId", levelId)}
            isLoading={isLoadingClassifications}
          />
        </div>
      </div>

      {/* Tags */}
      <div className="rounded-xl border border-gray-100 bg-white/70 p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            {getIcon("Tags", 16, "text-gray-500")} <span>Tags</span>
          </div>
          <span className="text-xs text-gray-500">{folderData?.folderTagIds?.length ?? 0} selected</span>
        </div>
        <div className={isLoadingTags ? "animate-pulse" : ""}>
          <TagSelector
            tags={availableTags}
            selectedTags={folderData?.folderTagIds || []}
            onTagsChange={(tagIds) => onFolderDataChange("folderTagIds", tagIds)}
            disabled={!folderData?.folderClassificationId}
            isLoading={isLoadingTags}
            maxSelection={8}
            showSelectionCount
          />
        </div>
        {!folderData?.folderClassificationId && (
          <p className="mt-2 text-xs text-amber-600">Select a classification to load related tags.</p>
        )}
      </div>

      {/* Footer hint */}
      <p className="text-xs text-gray-500">
        Tip: Đặt tên folder ngắn gọn, sau đó dùng tags để lọc và tìm nhanh trong dashboard.
      </p>
    </div>
  );
}

NewFolderForm.displayName = "NewFolderForm";
export default React.memo(NewFolderForm);
