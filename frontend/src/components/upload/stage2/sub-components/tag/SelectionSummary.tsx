import React from 'react';
import { getIcon } from '@/utils/getIcon';
import { Tag } from '@/types/FolderInterface';
import SelectedTagChip from './SelectedTagChip';

export interface SelectionSummaryProps {
  selectedTags: Tag[];
  onRemoveTag: (tagId: string) => void;
  className?: string;
}

function SelectionSummary({ 
  selectedTags, 
  onRemoveTag, 
  className = '' 
}: SelectionSummaryProps) {
  return (
    <div className={`p-4 bg-green-50 border border-green-200 rounded-lg ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        {getIcon('CheckCircle', 16, 'text-green-600')}
        <span className="text-sm font-medium text-green-800">
          Selected Tags ({selectedTags.length})
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {selectedTags.map(tag => (
          <SelectedTagChip
            key={tag.id}
            tag={tag}
            onRemove={() => onRemoveTag(tag.id)}
          />
        ))}
      </div>
    </div>
  );
}

SelectionSummary.displayName = 'SelectionSummary';

export default React.memo(SelectionSummary);