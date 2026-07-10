'use client';

import React from 'react';

type Props = {
  children: React.ReactNode;
};

export function EnglishViewerWrapper({ children }: Props) {
  return (
    <div className="
      english-viewer 
      font-serif
      h-full w-full flex flex-col
      [&_.bg-white]:!bg-[#090C15]/90 
      [&_.dark\:bg-gray-900]:!bg-[#090C15]/90 
      [&_.bg-gray-50]:!bg-[#040814]
      [&_.dark\:bg-gray-950]:!bg-[#040814]
      [&_.border-gray-200]:!border-amber-900/30 
      [&_.dark\:border-gray-800]:!border-amber-900/30
      [&_.border-gray-100]:!border-amber-900/20 
      [&_.text-gray-900]:!text-amber-100 
      [&_.text-gray-800]:!text-amber-100/90 
      [&_.text-gray-700]:!text-amber-200/80 
      [&_.text-gray-600]:!text-amber-200/70 
      [&_.text-gray-500]:!text-amber-500/60 
      [&_.dark\:text-white]:!text-amber-50
      [&_.dark\:text-gray-100]:!text-amber-100
      [&_.dark\:text-gray-200]:!text-amber-200/90
      [&_.dark\:text-gray-300]:!text-amber-200/80
      [&_.dark\:text-gray-400]:!text-amber-500/70
      [&_h1]:!text-amber-400 [&_h1]:drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] [&_h1]:font-serif
      [&_h2]:!text-amber-300 [&_h2]:drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] [&_h2]:font-serif
      [&_h3]:!text-amber-200 [&_h3]:font-serif
      [&_p]:!text-amber-100/80 [&_p]:font-serif [&_p]:leading-relaxed
      [&_span]:!text-amber-100/80 [&_span]:font-serif
      [&_button]:!border-amber-700/50 [&_button:hover]:!border-amber-500 [&_button]:!bg-[#0B1021] [&_button:hover]:!bg-[#151C33] [&_button]:!text-amber-400 [&_button]:font-serif [&_button]:shadow-[0_4px_10px_rgba(0,0,0,0.5)]
      [&_.bg-emerald-500]:!bg-amber-700/40 [&_.bg-emerald-500:hover]:!bg-amber-600/50 [&_.bg-emerald-500]:!border [&_.bg-emerald-500]:!border-amber-500/50 [&_.text-white]:!text-amber-200
      [&_.prose-emerald]:!prose-amber [&_.prose]:!font-serif
      [&_a]:!text-amber-400 [&_a:hover]:!text-amber-300 [&_a]:underline-offset-4
    ">
      {children}
    </div>
  );
}
