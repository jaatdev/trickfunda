'use client';

import React from 'react';

export function TimelineCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`group relative h-full w-full bg-slate-900/50 backdrop-blur-xl border border-slate-800 transition-all duration-700 hover:border-amber-500/50 hover:bg-slate-900/80 hover:shadow-[0_0_40px_rgba(251,191,36,0.15)] overflow-hidden rounded-2xl ${className}`}>
      
      {/* Starfield overlay inside the card */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMC41IiBmaWxsPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSkiLz48Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSIwLjUiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNSkiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIxIiBmaWxsPSJyZ2JhKDI1MSwgMTkxLCAzNiwgMC4wNykiLz48L3N2Zz4=')] opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
      
      {/* Glowing planetary orbit curve */}
      <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full border border-amber-500/20 group-hover:border-amber-400/40 group-hover:scale-150 transition-transform duration-1000 ease-out" />
      <div className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full border border-indigo-500/20 group-hover:border-indigo-400/30 group-hover:scale-125 transition-transform duration-700 ease-out delay-75" />

      {/* Content wrapper */}
      <div className="relative z-10 p-8 h-full flex flex-col font-sans">
        {children}
      </div>
    </div>
  );
}
