'use client';

import { useState } from 'react';
import ChapterTypesClient from './ChapterTypesClient';
import { ConceptInteractiveViewer } from './ConceptInteractiveViewer';
import { KDNode } from '@/types/studyMaterial';

type Props = {
  node: KDNode;
  subjectSlug: string;
  baseRoute: string;
  renderFolders?: () => React.ReactNode;
  renderConcept?: (activeTab: string) => React.ReactNode;
};

export default function FolderContentSwitcher({ node, subjectSlug, baseRoute, renderFolders, renderConcept }: Props) {
  const hasFolders = node.children && node.children.length > 0;
  const hasPdfs = (node.concept?.pdfs && node.concept.pdfs.length > 0) || !!node.concept?.pdfUrl;
  const hasVideos = node.concept?.youtubeUrls && node.concept.youtubeUrls.length > 0;
  const hasQuizzes = node.concept?.quizzes && node.concept.quizzes.length > 0;
  const hasFlashcards = node.concept?.flashcardSets && node.concept.flashcardSets.length > 0;
  const hasNotes = !!node.concept?.notesMarkdown || (node.concept?.noteBoxes && node.concept.noteBoxes.length > 0);

  const tabs = [
    { id: 'all', label: 'All', show: true },
    { id: 'folders', label: 'Folders 📁', show: hasFolders },
    { id: 'pdfs', label: 'PDFs 📄', show: hasPdfs },
    { id: 'videos', label: 'Videos 🎥', show: hasVideos },
    { id: 'quizzes', label: 'Quizzes 🧠', show: hasQuizzes },
    { id: 'flashcards', label: 'Flashcards 🎴', show: hasFlashcards },
    { id: 'notes', label: 'Notes 📝', show: hasNotes },
  ].filter(t => t.show);

  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="w-full">
      {tabs.length > 2 && (
        <div className="flex space-x-2 mb-8 p-1 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl overflow-x-auto no-scrollbar max-w-fit mx-auto border border-gray-200 dark:border-gray-800 shadow-sm">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-6 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-white shadow-md transform scale-105'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-12">
        {hasFolders && (activeTab === 'all' || activeTab === 'folders') && (
          <div>
            {activeTab === 'all' && tabs.length > 2 && <h3 className="text-2xl font-black mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2 inline-block">Folders</h3>}
            {renderFolders ? renderFolders() : (
              <ChapterTypesClient 
                subjectSlug={subjectSlug} 
                baseRoute={baseRoute} 
                types={node.children!} 
              />
            )}
          </div>
        )}

        {node.concept && (
          renderConcept ? renderConcept(activeTab) : (
            <ConceptInteractiveViewer 
              title={node.title}
              notesMarkdown={node.concept.notesMarkdown}
              noteBoxes={node.concept.noteBoxes}
              pdfUrl={node.concept.pdfUrl}
              pdfs={node.concept.pdfs}
              youtubeUrls={node.concept.youtubeUrls}
              quizzes={node.concept.quizzes}
              flashcardSets={node.concept.flashcardSets}
              slug={node.concept.slug}
              activeFilter={activeTab}
            />
          )
        )}
      </div>
    </div>
  );
}
