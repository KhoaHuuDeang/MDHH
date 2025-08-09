"use client";

import React from 'react';
import { getIcon } from '@/utils/getIcon';

interface CompletionBadgeProps {
  completed: number;
  total: number;
  percentage: number;
}

function CompletionBadge({ completed, total, percentage }: CompletionBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={`
        px-3 py-1 rounded-full text-sm font-medium
        ${percentage === 100
          ? 'bg-green-100 text-green-800'
          : percentage > 0
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-gray-100 text-gray-600'
        }
      `}>
        {completed}/{total} Complete ({percentage}%)
      </div>
      {percentage === 100 && getIcon('CheckCircle', 16, 'text-green-600')}
    </div>
  );
}

CompletionBadge.displayName = 'CompletionBadge';

export default React.memo(CompletionBadge);