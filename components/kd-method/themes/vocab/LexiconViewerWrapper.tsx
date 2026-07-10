'use client';

import React from 'react';
import { ConceptInteractiveViewer } from '@/components/kd-method/ConceptInteractiveViewer';
import { KDConcept } from '@/types/kdMethod';

type Props = {
  concept: KDConcept;
};

export function LexiconViewerWrapper({ concept }: Props) {
  return (
    <div className="
      lexicon-viewer 
      font-serif
      [&_.bg-white]:!bg-[#1A1208]/60 
      [&_.dark\:bg-gray-900]:!bg-[#1A1208]/60 
      [&_.bg-gray-50]:!bg-[#251A0C]/80 
      [&_.dark\:bg-gray-950]:!bg-transparent
      [&_.border-gray-200]:!border-[#5C4B33]/50 
      [&_.dark\:border-gray-800]:!border-[#5C4B33]/50
      [&_.border-gray-100]:!border-[#3A2A18]/50 
      [&_.text-gray-900]:!text-[#FCEABB] 
      [&_.text-gray-800]:!text-[#E8D090] 
      [&_.text-gray-700]:!text-[#D4AF37] 
      [&_.text-gray-600]:!text-[#C09621] 
      [&_.text-gray-500]:!text-[#A37B15] 
      [&_.dark\:text-white]:!text-[#FFF8E7]
      [&_.dark\:text-gray-100]:!text-[#FCEABB]
      [&_.dark\:text-gray-200]:!text-[#E8D090]
      [&_.dark\:text-gray-300]:!text-[#D4AF37]
      [&_.dark\:text-gray-400]:!text-[#C09621]
      [&_h1]:!text-[#FCEABB] [&_h1]:drop-shadow-[0_0_8px_rgba(212,175,55,0.4)] [&_h1]:font-serif
      [&_h2]:!text-[#D4AF37] [&_h2]:font-serif
      [&_h3]:!text-[#E8D090] [&_h3]:font-serif
      [&_p]:!text-[#FCEABB] [&_p]:font-serif
      [&_span]:!text-[#FCEABB] [&_span]:font-serif
      [&_button:not([class*='quiz-status'])]:!border-[#5C4B33]/50 [&_button:not([class*='quiz-status']):hover]:!border-[#D4AF37]/80 [&_button:not([class*='quiz-status'])]:!bg-[#251A0C]/60 [&_button:not([class*='quiz-status']):hover]:!bg-[#3A2A18]/80 [&_button:not([class*='quiz-status'])]:!text-[#FCEABB] [&_button:not([class*='quiz-status'])]:font-serif
      [&_.bg-emerald-500]:!bg-[#5C4B33] [&_.bg-emerald-500:hover]:!bg-[#8B7347] [&_.text-white]:!text-[#FFF8E7]
      [&_.prose-emerald]:!prose-yellow [&_.prose]:!font-serif
      [&_.quiz-status-answered]:!bg-emerald-500/20 [&_.quiz-status-answered]:!border-emerald-500 [&_.quiz-status-answered]:!text-emerald-500
      [&_.quiz-status-marked]:!bg-amber-400/20 [&_.quiz-status-marked]:!border-amber-400 [&_.quiz-status-marked]:!text-amber-400
      [&_.quiz-status-skipped]:!bg-rose-500/20 [&_.quiz-status-skipped]:!border-rose-500 [&_.quiz-status-skipped]:!text-rose-500
      [&_.quiz-status-unanswered]:!bg-stone-400/20 [&_.quiz-status-unanswered]:!border-stone-400 [&_.quiz-status-unanswered]:!text-stone-400
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
