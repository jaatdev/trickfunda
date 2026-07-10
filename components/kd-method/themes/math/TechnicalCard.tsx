'use client';

import React from 'react';

export function TechnicalCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`group relative h-full w-full bg-[#001428] border border-blue-900/40 transition-all duration-300 hover:border-blue-500/80 hover:bg-[#001A33] hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] overflow-hidden ${className}`}>
      
      {/* Blueprint Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Technical corner markers */}
      <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-blue-400/50" />
      <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-blue-400/50" />
      <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-blue-400/50" />
      <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-blue-400/50" />
      
      {/* Axis crosshairs appearing on hover */}
      <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-blue-500/10 scale-y-0 group-hover:scale-y-100 transition-transform duration-700 pointer-events-none" />
      <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-blue-500/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 pointer-events-none" />

      {/* Content wrapper */}
      <div className="relative z-10 p-6 h-full flex flex-col font-sans">
        {children}
      </div>
    </div>
  );
}
