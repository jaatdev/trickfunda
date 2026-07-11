'use client';

import React from 'react';

export function QuantumFolderCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`group relative h-full w-full bg-[#120024]/80 backdrop-blur-md border border-purple-900/50 transition-all duration-300 hover:border-fuchsia-500 hover:bg-[#1A0033] hover:shadow-[0_0_30px_rgba(217,70,239,0.2)] overflow-hidden rounded-[2rem] rounded-tr-none ${className}`}>
      
      {/* Cybernetic Accent Lines */}
      <div className="absolute top-0 right-0 w-12 h-[2px] bg-purple-500/30 group-hover:bg-fuchsia-400 transition-colors" />
      <div className="absolute top-0 right-0 w-[2px] h-12 bg-purple-500/30 group-hover:bg-fuchsia-400 transition-colors" />

      {/* Pulsing Node */}
      <div className="absolute bottom-6 right-6 w-2 h-2 rounded-full bg-purple-700 group-hover:bg-fuchsia-400 group-hover:shadow-[0_0_10px_rgba(217,70,239,0.8)] transition-all duration-300" />

      {/* Content wrapper */}
      <div className="relative z-10 p-8 h-full flex flex-col font-mono">
        {children}
      </div>
    </div>
  );
}
