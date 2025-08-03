"use client";

import React from 'react';
import { getIcon } from '@/utils/getIcon';

interface ClassificationLevel {
  id: string;
  name: string;
  description: string;
}

interface ClassificationLevelSelectorProps {
  levels: ClassificationLevel[];
  selectedLevelId?: string;
  onLevelChange: (levelId: string) => void;
  isLoading: boolean;
}

const ClassificationLevelSelector: React.FC<ClassificationLevelSelectorProps> = ({
  levels,
  selectedLevelId,
  onLevelChange,
  isLoading
}) => {
  if (isLoading) {
    return (
      <section>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Classification Level *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-20 rounded-lg"></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        Classification Level *
      </label>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {levels.map(level => (
          <label
            key={level.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all duration-300 
                       hover:shadow-md hover:shadow-[#386641]/20 hover:scale-105 
                       focus:outline-none focus:ring-2 focus:ring-[#6A994E]/50 ${
              selectedLevelId === level.id
                ? 'border-[#6A994E] bg-green-50 shadow-md shadow-[#386641]/20'
                : 'border-gray-200 hover:border-[#6A994E]'
            }`}
          >
            <input
              type="radio"
              name="classificationLevel"
              value={level.id}
              checked={selectedLevelId === level.id}
              onChange={(e) => onLevelChange(e.target.value)}
              className="sr-only"
            />
            
            <div className="flex items-center gap-3 mb-2">
              {getIcon('GraduationCap', 20, selectedLevelId === level.id ? 'text-[#6A994E]' : 'text-gray-400')}
              <div className="font-medium text-gray-900">{level.name}</div>
            </div>
            
            <div className="text-sm text-gray-500">{level.description}</div>
            
            {selectedLevelId === level.id && (
              <div className="mt-2 flex items-center gap-1 text-[#6A994E] text-sm font-medium">
                {getIcon('Check', 16)}
                Selected
              </div>
            )}
          </label>
        ))}
      </div>
    </section>
  );
};

export default React.memo(ClassificationLevelSelector);