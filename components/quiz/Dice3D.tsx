import React from 'react';

interface Dice3DProps {
  top?: string | null;
  front?: string | null;
  right?: string | null;
}

export const Dice3D: React.FC<Dice3DProps> = ({ top, front, right }) => {
  return (
    <div className="w-24 h-24 mx-2 my-2 relative flex items-center justify-center">
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 100 100" 
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-md"
      >
        {/* Top Face */}
        <polygon 
          points="50,10 85,30 50,50 15,30" 
          className="fill-white dark:fill-gray-800 stroke-gray-900 dark:stroke-gray-300" 
          strokeWidth="2" 
          strokeLinejoin="round" 
        />
        <text 
          x="50" 
          y="36" 
          fontFamily="Arial, sans-serif" 
          fontSize="18" 
          fontWeight="bold" 
          textAnchor="middle" 
          className="fill-gray-900 dark:fill-gray-100"
        >
          {top || ''}
        </text>

        {/* Front Face (Left side of the 2D projection) */}
        <polygon 
          points="15,30 50,50 50,90 15,70" 
          className="fill-gray-100 dark:fill-gray-700 stroke-gray-900 dark:stroke-gray-300" 
          strokeWidth="2" 
          strokeLinejoin="round" 
        />
        <text 
          x="32.5" 
          y="66" 
          fontFamily="Arial, sans-serif" 
          fontSize="18" 
          fontWeight="bold" 
          textAnchor="middle" 
          className="fill-gray-900 dark:fill-gray-100"
        >
          {front || ''}
        </text>

        {/* Right Face (Right side of the 2D projection) */}
        <polygon 
          points="50,50 85,30 85,70 50,90" 
          className="fill-gray-200 dark:fill-gray-600 stroke-gray-900 dark:stroke-gray-300" 
          strokeWidth="2" 
          strokeLinejoin="round" 
        />
        <text 
          x="67.5" 
          y="66" 
          fontFamily="Arial, sans-serif" 
          fontSize="18" 
          fontWeight="bold" 
          textAnchor="middle" 
          className="fill-gray-900 dark:fill-gray-100"
        >
          {right || ''}
        </text>
      </svg>
    </div>
  );
};
