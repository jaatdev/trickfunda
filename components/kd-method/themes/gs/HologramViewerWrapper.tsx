'use client';

import React from 'react';
import { ConceptInteractiveViewer } from '@/components/kd-method/ConceptInteractiveViewer';
import { KDConcept } from '@/types/kdMethod';

type Props = {
  concept: KDConcept;
};

export function HologramViewerWrapper({ concept }: Props) {
  return (
    <div className="
      hologram-viewer 
      [&_.bg-white]:!bg-cyan-950/20 
      [&_.dark\:bg-gray-900]:!bg-cyan-950/20 
      [&_.bg-gray-50]:!bg-cyan-950/40 
      [&_.dark\:bg-gray-950]:!bg-transparent
      [&_.border-gray-200]:!border-cyan-800/50 
      [&_.dark\:border-gray-800]:!border-cyan-800/50
      [&_.border-gray-100]:!border-cyan-800/30 
      [&_.text-gray-900]:!text-cyan-100 
      [&_.text-gray-800]:!text-cyan-200 
      [&_.text-gray-700]:!text-cyan-300 
      [&_.text-gray-600]:!text-cyan-400 
      [&_.text-gray-500]:!text-cyan-500 
      [&_.dark\:text-white]:!text-cyan-50
      [&_.dark\:text-gray-100]:!text-cyan-100
      [&_.dark\:text-gray-200]:!text-cyan-200
      [&_.dark\:text-gray-300]:!text-cyan-300
      [&_.dark\:text-gray-400]:!text-cyan-400
      [&_h1]:!text-cyan-300 [&_h1]:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]
      [&_h2]:!text-cyan-200
      [&_h3]:!text-cyan-100
      [&_p]:!text-cyan-100
      [&_span]:!text-cyan-100
      [&_button]:!border-cyan-500/50 [&_button:hover]:!border-cyan-400 [&_button]:!bg-cyan-900/40 [&_button:hover]:!bg-cyan-800/60 [&_button]:!text-cyan-100
      [&_.bg-emerald-500]:!bg-cyan-600 [&_.bg-emerald-500:hover]:!bg-cyan-500 [&_.text-white]:!text-white
      [&_.prose-emerald]:!prose-cyan
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
