'use client';

import React from 'react';

export function SteampunkCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`group relative h-full w-full bg-[#2A1F13]/90 backdrop-blur-sm border border-[#5C4B33] transition-all duration-300 hover:border-[#D4AF37] hover:bg-[#3A2A18] hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] overflow-hidden rounded-sm ${className}`}>
      
      {/* Brass Rivets */}
      <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-[#5C4B33] group-hover:bg-[#D4AF37] shadow-[inset_0_-1px_1px_rgba(0,0,0,0.5)] transition-colors" />
      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#5C4B33] group-hover:bg-[#D4AF37] shadow-[inset_0_-1px_1px_rgba(0,0,0,0.5)] transition-colors" />
      <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-[#5C4B33] group-hover:bg-[#D4AF37] shadow-[inset_0_-1px_1px_rgba(0,0,0,0.5)] transition-colors" />
      <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-[#5C4B33] group-hover:bg-[#D4AF37] shadow-[inset_0_-1px_1px_rgba(0,0,0,0.5)] transition-colors" />

      {/* Mechanical Accent Lines */}
      <div className="absolute top-8 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#5C4B33] group-hover:via-[#D4AF37] to-transparent transition-colors" />
      <div className="absolute bottom-8 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#5C4B33] group-hover:via-[#D4AF37] to-transparent transition-colors" />

      {/* Content wrapper */}
      <div className="relative z-10 p-8 h-full flex flex-col font-serif">
        {children}
      </div>
    </div>
  );
}
