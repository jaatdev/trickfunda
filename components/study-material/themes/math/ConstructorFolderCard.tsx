'use client';

import React from 'react';

export function ConstructorFolderCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`group relative h-full w-full bg-[#0A1128]/80 backdrop-blur-md border border-sky-900/50 transition-all duration-300 hover:border-sky-400 hover:bg-[#0A1128] hover:shadow-[0_0_30px_rgba(56,189,248,0.2)] overflow-hidden rounded-none ${className}`}>
      
      {/* Drafting Crosshairs */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-sky-500/30 group-hover:border-sky-400 transition-colors" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-sky-500/30 group-hover:border-sky-400 transition-colors" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-sky-500/30 group-hover:border-sky-400 transition-colors" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-sky-500/30 group-hover:border-sky-400 transition-colors" />

      {/* Blueprint lines */}
      <div className="absolute top-0 bottom-0 left-8 w-[1px] bg-sky-900/30 group-hover:bg-sky-500/20 transition-colors" />
      <div className="absolute left-0 right-0 top-8 h-[1px] bg-sky-900/30 group-hover:bg-sky-500/20 transition-colors" />

      {/* Content wrapper */}
      <div className="relative z-10 p-8 h-full flex flex-col font-mono">
        {children}
      </div>
    </div>
  );
}
