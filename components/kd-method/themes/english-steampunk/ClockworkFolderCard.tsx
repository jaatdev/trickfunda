'use client';

import React from 'react';

export function ClockworkFolderCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`group relative h-full w-full bg-[#1A1208]/90 backdrop-blur-md border-[2px] border-[#3A2A18] transition-all duration-300 hover:border-[#D4AF37] hover:bg-[#2A1F13] hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] overflow-hidden rounded-sm ${className}`}>
      
      {/* Brass Corner Plates */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#5C4B33] group-hover:border-[#D4AF37] transition-colors" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#5C4B33] group-hover:border-[#D4AF37] transition-colors" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#5C4B33] group-hover:border-[#D4AF37] transition-colors" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#5C4B33] group-hover:border-[#D4AF37] transition-colors" />

      {/* Ticking indicator */}
      <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#3A2A18] group-hover:bg-[#B87333] transition-colors duration-1000 group-hover:animate-pulse" />

      {/* Content wrapper */}
      <div className="relative z-10 p-8 h-full flex flex-col font-serif">
        {children}
      </div>
    </div>
  );
}
