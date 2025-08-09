import React from 'react';
import { Tag } from '@/types/FolderInterface.js';
import TagCard from './TagCard';


export interface TagsGridProps {
    tags: Tag[];
    selectedTags: string[];
    onTagToggle: (tagId: string) => void;
    isMaxReached: boolean;
}

function TagsGrid({
    tags,
    selectedTags,
    onTagToggle,
    isMaxReached
}: TagsGridProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {tags.map(tag => {
                const isSelected = selectedTags.includes(tag.id);
                const isDisabled = !isSelected && isMaxReached;

                return (
                    <TagCard
                        key={tag.id}
                        tag={tag}
                        isSelected={isSelected}
                        isDisabled={isDisabled}
                        onToggle={() => onTagToggle(tag.id)}
                    />
                );
            })}
        </div>
    );
}

TagsGrid.displayName = 'TagsGrid';

export default React.memo(TagsGrid);