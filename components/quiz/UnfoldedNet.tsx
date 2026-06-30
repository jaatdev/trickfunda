import React from 'react';

interface UnfoldedNetProps {
  gridMatrix: (string | null)[][];
}

export const UnfoldedNet: React.FC<UnfoldedNetProps> = ({ gridMatrix }) => {
  if (!gridMatrix || gridMatrix.length === 0) return null;

  const cols = gridMatrix[0].length;

  return (
    <div className="flex justify-center items-center my-6">
      <div 
        className="grid gap-0" 
        style={{ 
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          border: '1px solid transparent' // prevents collapsing
        }}
      >
        {gridMatrix.map((row, rIdx) => 
          row.map((cell, cIdx) => (
            <div 
              key={`${rIdx}-${cIdx}`}
              className={`w-12 h-12 md:w-16 md:h-16 flex items-center justify-center text-xl md:text-2xl font-black ${
                cell 
                  ? 'border-2 border-gray-900 dark:border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'bg-transparent'
              }`}
            >
              {cell || ''}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
