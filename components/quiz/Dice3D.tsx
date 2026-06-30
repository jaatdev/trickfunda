import React from 'react';

interface Dice3DProps {
  top?: string | null;
  front?: string | null;
  right?: string | null;
}

export const Dice3D: React.FC<Dice3DProps> = ({ top, front, right }) => {
  return (
    <div className="w-24 h-24 mx-4 my-8 relative flex items-center justify-center">
      <div 
        className="w-16 h-16 relative" 
        style={{
          transformStyle: 'preserve-3d',
          transform: 'rotateX(-35.264deg) rotateY(45deg)',
        }}
      >
        {/* Top Face */}
        <div 
          className="absolute w-full h-full border-2 border-gray-800 dark:border-gray-300 bg-white dark:bg-gray-800 flex items-center justify-center text-2xl font-black text-gray-900 dark:text-gray-100"
          style={{ transform: 'rotateX(90deg) translateZ(32px)' }}
        >
          <span style={{ transform: 'rotateZ(0deg)' }}>{top || ''}</span>
        </div>
        
        {/* Front Face */}
        <div 
          className="absolute w-full h-full border-2 border-gray-800 dark:border-gray-300 bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-2xl font-black text-gray-900 dark:text-gray-100 shadow-[inset_0_-8px_16px_rgba(0,0,0,0.1)]"
          style={{ transform: 'translateZ(32px)' }}
        >
          {front || ''}
        </div>
        
        {/* Right Face */}
        <div 
          className="absolute w-full h-full border-2 border-gray-800 dark:border-gray-300 bg-gray-100 dark:bg-gray-600 flex items-center justify-center text-2xl font-black text-gray-900 dark:text-gray-100 shadow-[inset_-8px_0_16px_rgba(0,0,0,0.05)]"
          style={{ transform: 'rotateY(90deg) translateZ(32px)' }}
        >
          <span style={{ transform: 'rotateZ(-90deg)' }}>{right || ''}</span>
        </div>
        
        {/* Hidden back faces just to close the shape visually if needed (optional) */}
        <div 
          className="absolute w-full h-full bg-gray-900 dark:bg-black border border-gray-900 opacity-20"
          style={{ transform: 'translateZ(-32px) rotateY(180deg)' }}
        />
        <div 
          className="absolute w-full h-full bg-gray-900 dark:bg-black border border-gray-900 opacity-20"
          style={{ transform: 'rotateY(-90deg) translateZ(32px)' }}
        />
        <div 
          className="absolute w-full h-full bg-gray-900 dark:bg-black border border-gray-900 opacity-20"
          style={{ transform: 'rotateX(-90deg) translateZ(32px)' }}
        />
      </div>
    </div>
  );
};
