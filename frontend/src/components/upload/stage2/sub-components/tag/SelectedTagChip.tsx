import React from 'react';
import { getIcon } from '@/utils/getIcon';
import { Tag } from '@/types/FolderInterface';

export interface SelectedTagChipProps {
  tag: Tag;
  onRemove: () => void;
}

function SelectedTagChip({ tag, onRemove }: SelectedTagChipProps) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 
                     text-xs rounded-full border border-green-200">
      {tag.name}
      <button
        type="button"
        onClick={onRemove}
        className="ml-1 hover:bg-green-200 rounded-full p-0.5 transition-colors duration-150"
        title={`Remove ${tag.name}`}
      >
        {getIcon('X', 10, 'text-green-600')}
      </button>
    </span>
  );
}

SelectedTagChip.displayName = 'SelectedTagChip';

export default React.memo(SelectedTagChip);