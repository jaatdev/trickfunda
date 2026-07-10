'use client';

import React from 'react';
import { ConceptInteractiveViewer } from '@/components/kd-method/ConceptInteractiveViewer';
import { KDConcept } from '@/types/kdMethod';

type Props = {
  concept: KDConcept;
};

export function ConstructorViewerWrapper({ concept }: Props) {
  return (
    <div className="
      constructor-viewer 
      font-mono
      [&_.bg-white]:!bg-[#0A1128]/80 
      [&_.dark\:bg-gray-900]:!bg-[#0A1128]/80 
      [&_.bg-gray-50]:!bg-[#0B1736]/90 
      [&_.dark\:bg-gray-950]:!bg-transparent
      [&_.border-gray-200]:!border-sky-900/50 
      [&_.dark\:border-gray-800]:!border-sky-900/50
      [&_.border-gray-100]:!border-sky-900/30 
      [&_.text-gray-900]:!text-sky-100 
      [&_.text-gray-800]:!text-sky-200 
      [&_.text-gray-700]:!text-sky-300 
      [&_.text-gray-600]:!text-sky-400 
      [&_.text-gray-500]:!text-sky-500 
      [&_.dark\:text-white]:!text-sky-50
      [&_.dark\:text-gray-100]:!text-sky-100
      [&_.dark\:text-gray-200]:!text-sky-200
      [&_.dark\:text-gray-300]:!text-sky-300
      [&_.dark\:text-gray-400]:!text-sky-400
      [&_h1]:!text-sky-300 [&_h1]:font-mono
      [&_h2]:!text-sky-200 [&_h2]:font-mono
      [&_h3]:!text-sky-100 [&_h3]:font-mono
      [&_p]:!text-sky-100 [&_p]:font-mono
      [&_span]:!text-sky-100 [&_span]:font-mono
      [&_button]:!border-sky-600/50 [&_button:hover]:!border-sky-400 [&_button]:!bg-sky-950/60 [&_button:hover]:!bg-sky-900/80 [&_button]:!text-sky-100 [&_button]:font-mono
      [&_.bg-emerald-500]:!bg-sky-700 [&_.bg-emerald-500:hover]:!bg-sky-600 [&_.text-white]:!text-white
      [&_.prose-emerald]:!prose-sky [&_.prose]:!font-mono
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
