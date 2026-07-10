'use client';

import React from 'react';
import { ConceptInteractiveViewer } from '@/components/kd-method/ConceptInteractiveViewer';
import { KDConcept } from '@/types/kdMethod';

type Props = {
  concept: KDConcept;
};

export function QuantumViewerWrapper({ concept }: Props) {
  return (
    <div className="
      quantum-viewer 
      font-sans
      [&_.bg-white]:!bg-[#120024]/80 
      [&_.dark\:bg-gray-900]:!bg-[#120024]/80 
      [&_.bg-gray-50]:!bg-[#1A0033]/90 
      [&_.dark\:bg-gray-950]:!bg-transparent
      [&_.border-gray-200]:!border-purple-900/50 
      [&_.dark\:border-gray-800]:!border-purple-900/50
      [&_.border-gray-100]:!border-purple-900/30 
      [&_.text-gray-900]:!text-fuchsia-50 
      [&_.text-gray-800]:!text-fuchsia-100 
      [&_.text-gray-700]:!text-purple-200 
      [&_.text-gray-600]:!text-purple-300 
      [&_.text-gray-500]:!text-purple-400 
      [&_.dark\:text-white]:!text-white
      [&_.dark\:text-gray-100]:!text-fuchsia-50
      [&_.dark\:text-gray-200]:!text-fuchsia-100
      [&_.dark\:text-gray-300]:!text-purple-200
      [&_.dark\:text-gray-400]:!text-purple-300
      [&_h1]:!text-fuchsia-300 [&_h1]:font-mono [&_h1]:drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]
      [&_h2]:!text-purple-300 [&_h2]:font-mono
      [&_h3]:!text-fuchsia-200 [&_h3]:font-mono
      [&_p]:!text-purple-100
      [&_span]:!text-purple-100
      [&_button:not([class*="quiz-status"])]:!border-purple-600/50 [&_button:not([class*="quiz-status"]):hover]:!border-fuchsia-500 [&_button:not([class*="quiz-status"])]:!bg-[#1A0033]/60 [&_button:not([class*="quiz-status"]):hover]:!bg-purple-900/80 [&_button:not([class*="quiz-status"])]:!text-fuchsia-200 [&_button:not([class*="quiz-status"])]:font-mono
      [&_.bg-emerald-500]:!bg-purple-700 [&_.bg-emerald-500:hover]:!bg-fuchsia-600 [&_.text-white]:!text-white
      [&_.prose-emerald]:!prose-fuchsia
      [&_.quiz-status-answered]:!bg-cyan-400/20 [&_.quiz-status-answered]:!border-cyan-400 [&_.quiz-status-answered]:!text-cyan-400
      [&_.quiz-status-marked]:!bg-fuchsia-400/20 [&_.quiz-status-marked]:!border-fuchsia-400 [&_.quiz-status-marked]:!text-fuchsia-400
      [&_.quiz-status-skipped]:!bg-rose-500/20 [&_.quiz-status-skipped]:!border-rose-500 [&_.quiz-status-skipped]:!text-rose-500
      [&_.quiz-status-unanswered]:!bg-slate-400/20 [&_.quiz-status-unanswered]:!border-slate-400 [&_.quiz-status-unanswered]:!text-slate-400
        ">
      <ConceptInteractiveViewer 
        title={concept.title}
        notesMarkdown={concept.notesMarkdown}
        noteBoxes={concept.noteBoxes}
        pdfUrl={concept.pdfUrl}
        youtubeUrls={concept.youtubeUrls}
        quizzes={concept.quizzes}
        slug={concept.slug}
      />
    </div>
  );
}
