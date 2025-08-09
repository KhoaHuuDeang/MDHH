import React from 'react';

interface ProgressBarProps { 
  current: number; 
  max: number; 
  className?: string; 
}

function ProgressBar({ current, max, className = '' }: ProgressBarProps) {
  const percentage = Math.round((current / max) * 100);
  
  return (
    <div className={`w-full ${className}`}>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-[#6A994E] h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

ProgressBar.displayName = 'ProgressBar';

export default React.memo(ProgressBar);