'use client';

import React from 'react';
import { motion } from 'framer-motion';

// Static color maps for Tailwind CSS
const colorMaps: Record<string, any> = {
  emerald: {
    borderHover: 'hover:border-emerald-500/50',
    shadowHover: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]',
    bg: 'bg-emerald-400',
    border: 'border-emerald-500/80',
    borderBase: 'border-emerald-500/0'
  },
  cyan: {
    borderHover: 'hover:border-cyan-500/50',
    shadowHover: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]',
    bg: 'bg-cyan-400',
    border: 'border-cyan-500/80',
    borderBase: 'border-cyan-500/0'
  },
  violet: {
    borderHover: 'hover:border-violet-500/50',
    shadowHover: 'hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]',
    bg: 'bg-violet-400',
    border: 'border-violet-500/80',
    borderBase: 'border-violet-500/0'
  },
  rose: {
    borderHover: 'hover:border-rose-500/50',
    shadowHover: 'hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]',
    bg: 'bg-rose-400',
    border: 'border-rose-500/80',
    borderBase: 'border-rose-500/0'
  },
  amber: {
    borderHover: 'hover:border-amber-500/50',
    shadowHover: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]',
    bg: 'bg-amber-400',
    border: 'border-amber-500/80',
    borderBase: 'border-amber-500/0'
  }
};

export function ScannerCard({
  children,
  className = '',
  color = 'emerald',
}: {
  children: React.ReactNode;
  className?: string;
  color?: string;
}) {
  const style = colorMaps[color] || colorMaps.emerald;
  
  return (
    <div className={`group relative h-full w-full overflow-hidden rounded-xl bg-slate-900/40 border border-slate-700/50 backdrop-blur-sm transition-all duration-300 ${style.borderHover} ${style.shadowHover} ${className}`}>
      
      {/* Laser Scanline */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${style.bg} shadow-[0_0_10px_2px_currentColor] opacity-0 group-hover:opacity-100 group-hover:animate-scanline z-20 pointer-events-none`} />

      {/* Cybernetic grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Corner Brackets */}
      <div className={`absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 ${style.borderBase} group-hover:${style.border} transition-colors duration-300 rounded-tl-lg`} />
      <div className={`absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 ${style.borderBase} group-hover:${style.border} transition-colors duration-300 rounded-tr-lg`} />
      <div className={`absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 ${style.borderBase} group-hover:${style.border} transition-colors duration-300 rounded-bl-lg`} />
      <div className={`absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 ${style.borderBase} group-hover:${style.border} transition-colors duration-300 rounded-br-lg`} />

      <div className="relative z-10 p-6 h-full flex flex-col">
        {children}
      </div>
    </div>
  );
}
