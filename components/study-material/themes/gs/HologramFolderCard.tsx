'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function HologramFolderCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`group relative h-full w-full bg-cyan-950/20 backdrop-blur-md border-2 border-cyan-800/30 transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-900/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] overflow-hidden rounded-xl ${className}`}>
      
      {/* HUD Corners */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500/50 group-hover:border-cyan-300 transition-colors duration-300" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500/50 group-hover:border-cyan-300 transition-colors duration-300" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500/50 group-hover:border-cyan-300 transition-colors duration-300" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500/50 group-hover:border-cyan-300 transition-colors duration-300" />

      {/* Hologram Flicker Effect on Hover */}
      <motion.div 
        className="absolute inset-0 bg-cyan-400/5 opacity-0 group-hover:opacity-100 pointer-events-none"
        animate={{ opacity: [0, 0.1, 0.05, 0.15, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />

      {/* Content wrapper */}
      <div className="relative z-10 p-6 h-full flex flex-col font-mono">
        {children}
      </div>
    </div>
  );
}
