'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function MatrixCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`group relative h-full w-full bg-black/80 backdrop-blur-sm border border-green-900/50 transition-all duration-300 hover:border-green-400 hover:bg-green-950/20 hover:shadow-[0_0_20px_rgba(74,222,128,0.2)] overflow-hidden rounded-none ${className}`}>
      
      {/* Glitch Overlay on Hover */}
      <motion.div 
        className="absolute inset-0 bg-green-500/10 opacity-0 group-hover:opacity-100 pointer-events-none mix-blend-overlay"
        animate={{ x: [-2, 2, -1, 3, 0], y: [1, -2, 2, -1, 0] }}
        transition={{ duration: 0.2, repeat: Infinity, repeatType: "mirror" }}
      />

      {/* Cyberpunk Corners */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-green-500/30 group-hover:border-green-400 transition-colors" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-green-500/30 group-hover:border-green-400 transition-colors" />

      {/* Hacker Data Strip */}
      <div className="absolute top-0 right-4 w-12 h-1 bg-green-900/50 group-hover:bg-green-400 transition-colors duration-500" />
      <div className="absolute bottom-0 left-4 w-20 h-1 bg-green-900/50 group-hover:bg-green-400 transition-colors duration-500 delay-100" />

      {/* Content wrapper */}
      <div className="relative z-10 p-8 h-full flex flex-col font-mono">
        {children}
      </div>
    </div>
  );
}
