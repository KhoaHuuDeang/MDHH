import React from 'react';
import { getIcon } from '@/utils/getIcon';

export const DisabledTagsState = React.memo<{ message: string; className?: string }>(({ 
  message, 
  className = '' 
}) => (
  <section className={`opacity-50 ${className}`}>
    <div className="p-6 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
      <div className="text-center">
        {getIcon('Lock', 32, 'text-gray-400 mx-auto mb-3')}
        <p className="text-gray-500 text-sm">{message}</p>
      </div>
    </div>
  </section>
));
DisabledTagsState.displayName = 'DisabledTagsState';

export const LoadingTagsState = React.memo(() => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
    {Array.from({ length: 8 }, (_, i) => (
      <div key={i} className="animate-pulse bg-gray-200 h-16 rounded-lg" />
    ))}
  </div>
));
LoadingTagsState.displayName = 'LoadingTagsState';

export const EmptyTagsState = React.memo(() => (
  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
    {getIcon('Tag', 48, 'text-gray-300 mx-auto mb-4')}
    <h4 className="text-lg font-medium text-gray-900 mb-2">No tags available</h4>
    <p className="text-gray-500 text-sm">
      No tags found for this classification level
    </p>
  </div>
));
EmptyTagsState.displayName = 'EmptyTagsState';