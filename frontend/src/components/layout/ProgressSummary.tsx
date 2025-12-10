"use client";

import React from "react";

interface ProgressSummaryProps {
  stats: { completed: number; total: number; percentage: number };
}

function ProgressSummary({ stats }: ProgressSummaryProps) {
  return (
    <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Độ tiến tải lên
        </span>
        <span className="text-sm text-gray-600">
          {stats.completed}/{stats.total} tệp
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-green-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${stats.percentage}%` }}
        />
      </div>
    </div>
  );
}

ProgressSummary.displayName = "ProgressSummary";

export default React.memo(ProgressSummary);
