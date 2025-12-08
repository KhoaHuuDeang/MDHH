import React from "react";
import { getIcon } from "@/utils/getIcon";
import { ClassificationLevel } from "@/types/FolderInterface";

interface ClassificationLevelSelectorProps {
  levels: ClassificationLevel[];
  selectedLevelId?: string;
  onLevelChange: (levelId: string) => void;
  isLoading: boolean;
}

function ClassificationLevelSelector({
  levels,
  selectedLevelId,
  onLevelChange,
  isLoading,
}: ClassificationLevelSelectorProps) {
  return (
    <section className="space-y-4" aria-labelledby="classification-title">
      <div className="flex items-center gap-3">
        {getIcon("BookOpen", 24, "text-[#6A994E]")}
        <h2
          id="classification-title"
          className="text-xl font-semibold text-gray-900"
        >
          Cấp độ
        </h2>
        <span className="text-red-500" aria-label="required">
          *
        </span>
      </div>

      <p className="text-gray-600 text-sm">
        Chọn cấp độ phù hợp với nội dung các tệp trong thư mục này
      </p>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin h-8 w-8 border-2 border-[#6A994E] border-t-transparent rounded-full" />
          <span className="ml-3 text-gray-600">
            Đang tải cấp độ phân loại...
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {levels.map((level) => (
            <button
              key={level.id}
              type="button"
              onClick={() => onLevelChange(level.id)}
              className={`
                p-4 rounded-lg border-2 text-left transition-all duration-200
                hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#6A994E]/50
                ${
                  selectedLevelId === level.id
                    ? "border-[#6A994E] bg-[#F0F7F4] shadow-lg shadow-[#6A994E]/20"
                    : "border-gray-200 bg-white hover:border-[#6A994E]/50"
                }
              `}
              aria-pressed={selectedLevelId === level.id}
              aria-describedby={`level-desc-${level.id}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`
                  w-3 h-3 rounded-full mt-2 transition-colors duration-200
                  ${
                    selectedLevelId === level.id
                      ? "bg-[#6A994E]"
                      : "bg-gray-300"
                  }
                `}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {level.name}
                  </h3>
                  <p
                    id={`level-desc-${level.id}`}
                    className="text-sm text-gray-600"
                  >
                    {level.description}
                  </p>
                  {level.tags && level.tags.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      {level.tags.length} available tags
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export default React.memo(ClassificationLevelSelector);
