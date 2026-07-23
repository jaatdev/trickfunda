'use client';

import React from 'react';
import { ConceptInteractiveViewer } from '@/components/study-material/ConceptInteractiveViewer';
import { KDConcept } from '@/types/studyMaterial';

type Props = {
  concept: KDConcept;
  activeFilter?: string;
};

export function ClockworkViewerWrapper({ concept, activeFilter }: Props) {
  return (
    <div className="
      clockwork-viewer 
      font-serif
      [&_.bg-white]:!bg-[#1A1208]/90 
      [&_.dark\:bg-gray-900]:!bg-[#1A1208]/90 
      [&_.bg-gray-50]:!bg-[#2A1F13]/95 
      [&_.dark\:bg-gray-950]:!bg-transparent
      [&_.border-gray-200]:!border-[#5C4B33]/80 
      [&_.dark\:border-gray-800]:!border-[#5C4B33]/80
      [&_.border-gray-100]:!border-[#3A2A18]/80 
      [&_.text-gray-900]:!text-[#E8D090] 
      [&_.text-gray-800]:!text-[#D4AF37] 
      [&_.text-gray-700]:!text-[#C09621] 
      [&_.text-gray-600]:!text-[#B87333] 
      [&_.text-gray-500]:!text-[#A37B15] 
      [&_.dark\:text-white]:!text-[#FFF8E7]
      [&_.dark\:text-gray-100]:!text-[#E8D090]
      [&_.dark\:text-gray-200]:!text-[#D4AF37]
      [&_.dark\:text-gray-300]:!text-[#C09621]
      [&_.dark\:text-gray-400]:!text-[#B87333]
      [&_h1]:!text-[#D4AF37] [&_h1]:drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] [&_h1]:font-serif
      [&_h2]:!text-[#B87333] [&_h2]:font-serif
      [&_h3]:!text-[#E8D090] [&_h3]:font-serif
      [&_p]:!text-[#E8D090] [&_p]:font-serif
      [&_span:not([class*='mjx'])]:!text-[#E8D090] [&_span:not([class*='mjx'])]:font-serif
      [&_button:not([class*='quiz-status'])]:!border-[#5C4B33] [&_button:not([class*='quiz-status']):hover]:!border-[#D4AF37] [&_button:not([class*='quiz-status'])]:!bg-[#2A1F13] [&_button:not([class*='quiz-status']):hover]:!bg-[#3A2A18] [&_button:not([class*='quiz-status'])]:!text-[#D4AF37] [&_button:not([class*='quiz-status'])]:font-serif [&_button:not([class*='quiz-status'])]:shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.5)]
      [&_.bg-emerald-500]:!bg-[#8B7347] [&_.bg-emerald-500:hover]:!bg-[#B87333] [&_.text-white]:!text-[#FFF8E7]
      [&_.prose-emerald]:!prose-amber [&_.prose]:!font-serif
      [&_.quiz-status-answered]:!bg-emerald-600/20 [&_.quiz-status-answered]:!border-emerald-600 [&_.quiz-status-answered]:!text-emerald-600
      [&_.quiz-status-marked]:!bg-amber-500/20 [&_.quiz-status-marked]:!border-amber-500 [&_.quiz-status-marked]:!text-amber-500
      [&_.quiz-status-skipped]:!bg-rose-600/20 [&_.quiz-status-skipped]:!border-rose-600 [&_.quiz-status-skipped]:!text-rose-600
      [&_.quiz-status-unanswered]:!bg-stone-500/20 [&_.quiz-status-unanswered]:!border-stone-500 [&_.quiz-status-unanswered]:!text-stone-500
        ">
      <ConceptInteractiveViewer 
        title={concept.title}
        notesMarkdown={concept.notesMarkdown}
        noteBoxes={concept.noteBoxes}
        pdfUrl={concept.pdfUrl}
        pdfs={concept.pdfs}
        youtubeUrls={concept.youtubeUrls}
        quizzes={concept.quizzes}
        flashcardSets={concept.flashcardSets}
        slug={concept.slug}
        activeFilter={activeFilter}
      />
    </div>
  );
}
