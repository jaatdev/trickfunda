'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function LexiconFolderCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`group relative h-full w-full bg-[#1A1208]/80 backdrop-blur-md border border-[#3A2A18] transition-all duration-500 hover:border-[#D4AF37]/50 hover:bg-[#251A0C]/90 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] overflow-hidden rounded-sm ${className}`}>
      
      {/* Ornate corner flourishes */}
      <div className="absolute top-2 left-2 w-6 h-6 border-t border-l border-[#5C4B33] group-hover:border-[#D4AF37] transition-colors duration-500 rounded-tl-lg" />
      <div className="absolute top-2 right-2 w-6 h-6 border-t border-r border-[#5C4B33] group-hover:border-[#D4AF37] transition-colors duration-500 rounded-tr-lg" />
      <div className="absolute bottom-2 left-2 w-6 h-6 border-b border-l border-[#5C4B33] group-hover:border-[#D4AF37] transition-colors duration-500 rounded-bl-lg" />
      <div className="absolute bottom-2 right-2 w-6 h-6 border-b border-r border-[#5C4B33] group-hover:border-[#D4AF37] transition-colors duration-500 rounded-br-lg" />

      {/* Floating dust glow on hover */}
      <motion.div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.1)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-700"
      />

      {/* Content wrapper */}
      <div className="relative z-10 p-8 h-full flex flex-col font-serif">
        {children}
      </div>
    </div>
  );
}
