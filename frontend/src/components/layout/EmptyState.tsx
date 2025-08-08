"use client";

import React from 'react';
import { getIcon } from '@/utils/getIcon';

interface EmptyStateProps {
  className?: string;
}

function EmptyState({ className = '' }: EmptyStateProps) {
  return (
    <section className={`text-center py-12 ${className}`} role="status">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        {getIcon('FileX', 32, 'text-gray-400')}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No files to configure</h3>
      <p className="text-gray-500 text-sm">
        Upload files in Step 1 before proceeding to metadata entry
      </p>
    </section>
  );
}

EmptyState.displayName = 'EmptyState';

export default React.memo(EmptyState);