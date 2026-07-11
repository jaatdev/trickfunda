'use client';

import React from 'react';

export function PuzzleCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`group relative h-full w-full bg-[#110B24] border border-violet-900/50 transition-all duration-500 hover:border-violet-500 hover:bg-[#160E30] hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] overflow-hidden rounded-xl ${className}`}>
      
      {/* Maze Path Overlay (Revealed on hover) */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="maze" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 0 10 L 20 10 L 20 30 L 40 30" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="square" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#maze)" />
        </svg>
      </div>

      {/* Cybernetic glowing edge accents */}
      <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-violet-500/0 to-transparent group-hover:via-violet-400/80 transition-all duration-700" />
      <div className="absolute bottom-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-violet-500/0 to-transparent group-hover:via-fuchsia-400/80 transition-all duration-700" />
      
      {/* Interlocking "puzzle" node (dot in top right) */}
      <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-violet-900 group-hover:bg-violet-400 group-hover:shadow-[0_0_10px_rgba(139,92,246,0.8)] transition-all duration-300" />
      <div className="absolute top-[19px] right-2 w-4 h-[1px] bg-violet-900/50 group-hover:bg-violet-400/50 transition-colors duration-300" />

      {/* Content wrapper */}
      <div className="relative z-10 p-7 h-full flex flex-col font-sans">
        {children}
      </div>
    </div>
  );
}
