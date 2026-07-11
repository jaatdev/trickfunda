'use client';

import React from 'react';

type Props = {
  children: React.ReactNode;
};

export function CyberViewerWrapper({ children }: Props) {
  return (
    <div className="
      cyber-viewer 
      font-mono
      h-full w-full flex flex-col
      [&_.bg-white]:!bg-[#050B14]/80 
      [&_.dark\:bg-gray-900]:!bg-[#050B14]/80 
      [&_.bg-gray-50]:!bg-[#0A1628]/90 
      [&_.dark\:bg-gray-950]:!bg-transparent
      [&_.border-gray-200]:!border-[#00F0FF]/30 
      [&_.dark\:border-gray-800]:!border-[#00F0FF]/30
      [&_.border-gray-100]:!border-[#00F0FF]/20 
      [&_.text-gray-900]:!text-[#FFFFFF] 
      [&_.text-gray-800]:!text-[#E0F8FF] 
      [&_.text-gray-700]:!text-[#B0E8FF] 
      [&_.text-gray-600]:!text-[#80D8FF] 
      [&_.text-gray-500]:!text-[#50C8FF] 
      [&_.dark\:text-white]:!text-[#FFFFFF]
      [&_.dark\:text-gray-100]:!text-[#E0F8FF]
      [&_.dark\:text-gray-200]:!text-[#B0E8FF]
      [&_.dark\:text-gray-300]:!text-[#80D8FF]
      [&_.dark\:text-gray-400]:!text-[#50C8FF]
      [&_h1]:!text-[#00F0FF] [&_h1]:drop-shadow-[0_0_10px_rgba(0,240,255,0.8)] [&_h1]:font-mono [&_h1]:uppercase
      [&_h2]:!text-[#00F0FF] [&_h2]:drop-shadow-[0_0_8px_rgba(0,240,255,0.6)] [&_h2]:font-mono [&_h2]:uppercase
      [&_h3]:!text-[#E0F8FF] [&_h3]:font-mono [&_h3]:uppercase
      [&_p]:!text-[#B0E8FF] [&_p]:font-mono
      [&_span]:!text-[#B0E8FF] [&_span]:font-mono
      [&_button:not([class*='quiz-status'])]:!border-[#00F0FF]/50 [&_button:not([class*='quiz-status']):hover]:!border-[#00F0FF] [&_button:not([class*='quiz-status'])]:!bg-[#050B14] [&_button:not([class*='quiz-status']):hover]:!bg-[#0A1628] [&_button:not([class*='quiz-status'])]:!text-[#00F0FF] [&_button:not([class*='quiz-status'])]:font-mono [&_button:not([class*='quiz-status'])]:shadow-[inset_0_0_10px_rgba(0,240,255,0.1),0_0_15px_rgba(0,240,255,0.2)] [&_button:not([class*='quiz-status'])]:uppercase [&_button:not([class*='quiz-status'])]:tracking-widest
      [&_.bg-emerald-500]:!bg-[#00F0FF]/20 [&_.bg-emerald-500:hover]:!bg-[#00F0FF]/40 [&_.bg-emerald-500]:!border [&_.bg-emerald-500]:!border-[#00F0FF] [&_.text-white]:!text-[#00F0FF]
      [&_.prose-emerald]:!prose-cyan [&_.prose]:!font-mono
      [&_.quiz-status-answered]:!bg-cyan-400/20 [&_.quiz-status-answered]:!border-cyan-400 [&_.quiz-status-answered]:!text-cyan-400
      [&_.quiz-status-marked]:!bg-fuchsia-400/20 [&_.quiz-status-marked]:!border-fuchsia-400 [&_.quiz-status-marked]:!text-fuchsia-400
      [&_.quiz-status-skipped]:!bg-rose-500/20 [&_.quiz-status-skipped]:!border-rose-500 [&_.quiz-status-skipped]:!text-rose-500
      [&_.quiz-status-unanswered]:!bg-slate-500/20 [&_.quiz-status-unanswered]:!border-slate-500 [&_.quiz-status-unanswered]:!text-slate-500
        ">
      {children}
    </div>
  );
}
