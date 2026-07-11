'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function ScholarlyCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`group relative h-full w-full overflow-hidden rounded-sm bg-[#ffffff05] border border-amber-900/30 backdrop-blur-md transition-all duration-500 hover:border-amber-500/50 hover:shadow-[0_0_40px_rgba(245,158,11,0.15)] hover:-translate-y-1 ${className}`}>
      
      {/* Book spine accent */}
      <div className="absolute top-0 left-0 bottom-0 w-[6px] bg-gradient-to-b from-amber-600 via-yellow-500 to-amber-700 shadow-[2px_0_10px_rgba(0,0,0,0.5)] z-20" />
      
      {/* Ornate corners */}
      <div className="absolute top-2 left-3 w-4 h-4 border-t border-l border-amber-500/30 group-hover:border-amber-400/80 transition-colors duration-500" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-amber-500/30 group-hover:border-amber-400/80 transition-colors duration-500" />
      <div className="absolute bottom-2 left-3 w-4 h-4 border-b border-l border-amber-500/30 group-hover:border-amber-400/80 transition-colors duration-500" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-amber-500/30 group-hover:border-amber-400/80 transition-colors duration-500" />

      {/* Frosted interior glass */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10 pointer-events-none" />

      {/* Content wrapper */}
      <div className="relative z-10 p-8 h-full flex flex-col pl-10">
        {children}
      </div>
    </div>
  );
}
