'use client';

import React from 'react';
import { ConceptInteractiveViewer } from '@/components/kd-method/ConceptInteractiveViewer';
import { KDConcept } from '@/types/kdMethod';

type Props = {
  concept: KDConcept;
};

export function ClockworkViewerWrapper({ concept }: Props) {
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
      [&_span]:!text-[#E8D090] [&_span]:font-serif
      [&_button]:!border-[#5C4B33] [&_button:hover]:!border-[#D4AF37] [&_button]:!bg-[#2A1F13] [&_button:hover]:!bg-[#3A2A18] [&_button]:!text-[#D4AF37] [&_button]:font-serif [&_button]:shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.5)]
      [&_.bg-emerald-500]:!bg-[#8B7347] [&_.bg-emerald-500:hover]:!bg-[#B87333] [&_.text-white]:!text-[#FFF8E7]
      [&_.prose-emerald]:!prose-amber [&_.prose]:!font-serif
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
