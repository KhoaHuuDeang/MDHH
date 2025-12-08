"use client";

import React, {
  ChangeEvent,
  useCallback,
  useDeferredValue,
  useEffect,
  useState,
} from "react";
import { getIcon } from "@/utils/getIcon";
import {
  FileMetadata,
  FileUploadInterface,
  VisibilityType,
} from "@/types/FileUploadInterface";

interface FileMetadataCardProps {
  file: FileUploadInterface;
  index: number;
  metadata: FileMetadata;
  onFieldChange: (
    fileId: string,
    field: keyof FileMetadata,
    val: string
  ) => void;
  maxDescriptionLength: number;
}

const VISIBILITY_OPTIONS = [
  {
    value: VisibilityType.PUBLIC,
    label: "🌐 Public",
    description: "Anyone can view and download",
    icon: "Globe",
  },
  {
    value: VisibilityType.PRIVATE,
    label: "🔒 Private",
    description: "Only you can access",
    icon: "Lock",
  },
] as const;

function FileMetadataCard({
  file,
  index,
  metadata,
  onFieldChange,
  maxDescriptionLength,
}: FileMetadataCardProps) {
  // Use local state for immediate UI updates without store subscriptions
  const [localTitle, setLocalTitle] = useState(metadata.title || "");
  const [localDescription, setLocalDescription] = useState(
    metadata.description || ""
  );

  // Debounced values to reduce store updates
  const deferredTitle = useDeferredValue(localTitle);
  const deferredDescription = useDeferredValue(localDescription);

  const isComplete = !!(metadata.title?.trim() && metadata.description?.trim());
  const descriptionLength = localDescription.length;

  // Sync local state when store metadata changes (from external updates)
  useEffect(() => {
    setLocalTitle(metadata.title || "");
  }, [metadata.title]);

  useEffect(() => {
    setLocalDescription(metadata.description || "");
  }, [metadata.description]);

  // Update store when deferred values change
  useEffect(() => {
    if (deferredTitle !== metadata.title) {
      onFieldChange(file.id, "title", deferredTitle);
    }
  }, [deferredTitle, metadata.title, file.id, onFieldChange]);

  useEffect(() => {
    if (deferredDescription !== metadata.description) {
      onFieldChange(file.id, "description", deferredDescription);
    }
  }, [deferredDescription, metadata.description, file.id, onFieldChange]);

  // Memoized event handlers to prevent unnecessary re-renders
  const handleTitleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setLocalTitle(e.target.value);
  }, []);

  const handleDescriptionChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setLocalDescription(e.target.value);
    },
    []
  );

  const handleVisibilityChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      onFieldChange(file.id, "visibility", e.target.value);
    },
    [file.id, onFieldChange]
  );

  return (
    <div
      className={`
        p-6 rounded-lg border-2 transition-all duration-200
        ${
          isComplete
            ? "border-green-200 bg-green-50/50"
            : "border-orange-200 bg-orange-50/30"
        }
      `}
      role="region"
      aria-labelledby={`file-header-${file.id}`}
    >
      {/* File header */}
      <div className="flex items-start gap-4 mb-6">
        <div
          className={`
          w-12 h-12 rounded-lg flex items-center justify-center
          ${isComplete ? "bg-green-100" : "bg-orange-100"}
        `}
        >
          {isComplete
            ? getIcon("CheckCircle", 24, "text-green-600")
            : getIcon("FileText", 24, "text-orange-600")}
        </div>
        <div className="flex-1">
          <h3
            id={`file-header-${file.id}`}
            className="font-semibold text-gray-900 mb-1"
          >
            File {index + 1}: {file.name}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{(file.size / (1024 * 1024)).toFixed(1)} MB</span>
            <span
              className={`
              px-2 py-1 rounded-full text-xs font-medium
              ${
                isComplete
                  ? "bg-green-100 text-green-700"
                  : "bg-orange-100 text-orange-700"
              }
            `}
            >
              {isComplete ? "Complete" : "Incomplete"}
            </span>
          </div>
        </div>
      </div>

      {/* Form fields */}
      <div className="grid grid-cols-1 gap-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tiêu đề *
          </label>
          <input
            type="text"
            value={localTitle}
            onChange={handleTitleChange}
            placeholder="Nhập tiêu đề tệp..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mô tả *
          </label>
          <textarea
            value={localDescription}
            onChange={handleDescriptionChange}
            placeholder="Mô tả nội dung, các chủ đề được đề cập, mục tiêu học tập..."
            maxLength={maxDescriptionLength}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20 resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            {descriptionLength}/{maxDescriptionLength} kí tự
          </p>
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hiển thị
          </label>
          <select
            value={metadata.visibility}
            onChange={handleVisibilityChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
          >
            {VISIBILITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Info message about classification inheritance */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-700">
            {getIcon("Info", 14, "text-blue-600 inline mr-1")}
            Lưu ý: Cấp độ phân loại của thư mục sẽ được áp dụng cho tất cả các
            tệp bên trong một cách tự động.
          </p>
        </div>
      </div>
    </div>
  );
}

FileMetadataCard.displayName = "FileMetadataCard";

function areEqual(
  prevProps: FileMetadataCardProps,
  nextProps: FileMetadataCardProps
) {
  return (
    prevProps.file.id === nextProps.file.id &&
    prevProps.metadata.title === nextProps.metadata.title &&
    prevProps.metadata.description === nextProps.metadata.description &&
    prevProps.metadata.visibility === nextProps.metadata.visibility &&
    prevProps.maxDescriptionLength === nextProps.maxDescriptionLength
  );
}
export default React.memo(FileMetadataCard, areEqual);
