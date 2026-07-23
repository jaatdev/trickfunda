'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import { QuizPanel } from '@/components/quiz/QuizPanel';
import { QuizConfigurator } from '@/components/quiz/QuizConfigurator';
import { QuizQuestion } from '@/lib/types';
import { useFullscreen } from '@/lib/fullscreen-context';
import { NoteBox } from '@/lib/admin-types';
import NoteBoxRenderer from '@/components/NoteBoxRenderer';
import { useUser } from '@clerk/nextjs';
import { KDQuiz, KDFlashcardSet } from '@/types/studyMaterial';
import { MathJaxContext } from 'better-react-mathjax';
import CanvasOverlay from '../canvas/CanvasOverlay';
import GenericFlashcardSession from '../flashcards/GenericFlashcardSession';

interface Props {
  title: string;
  notesMarkdown: string | null;
  noteBoxes: NoteBox[] | null;
  pdfUrl: string | null;
  pdfs?: { id: string; title: string; url: string }[];
  youtubeUrls: string[] | null;
  quizzes: KDQuiz[];
  flashcardSets?: KDFlashcardSet[];
  slug: string;
  activeFilter?: string;
}

export function ConceptInteractiveViewer({ title, notesMarkdown, noteBoxes, pdfUrl, pdfs, youtubeUrls, quizzes, flashcardSets, slug, activeFilter = 'all' }: Props) {
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [activeFlashcardId, setActiveFlashcardId] = useState<string | null>(null);
  const [quizQuestionCount, setQuizQuestionCount] = useState<number | null>(null);
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [fullscreenMode, setFullscreenMode] = useState<'none' | 'pdf' | 'canvas'>('none');
  const { enterFullscreen, exitFullscreen } = useFullscreen();
  const { user, isSignedIn } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  const allowList = (process.env.NEXT_PUBLIC_ADMIN_USERS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const isAdmin = isSignedIn && (!allowList.length || (userEmail && allowList.includes(userEmail.toLowerCase())));

  const hasPdf = (pdfs && pdfs.length > 0) || !!pdfUrl;
  const hasNoteboxes = !!(noteBoxes && noteBoxes.length > 0);
  const hasMarkdown = !!notesMarkdown;

  const [activeTab, setActiveTab] = useState<'noteboxes' | 'markdown'>(() => {
    if (hasNoteboxes) return 'noteboxes';
    return 'markdown';
  });

  const tabs = [];
  if (hasNoteboxes) tabs.push({ id: 'noteboxes', label: '📦 Interactive Notes' });
  if (hasMarkdown) tabs.push({ id: 'markdown', label: '📝 Text Notes' });

  useEffect(() => {
    if (activeQuizId || activeFlashcardId || fullscreenMode !== 'none') {
      document.documentElement.setAttribute('data-page-type', 'notes');
      enterFullscreen();
    } else {
      document.documentElement.removeAttribute('data-page-type');
      exitFullscreen();
    }

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setFullscreenMode('none');
        setActiveQuizId(null);
        setActiveFlashcardId(null);
      }
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.documentElement.removeAttribute('data-page-type');
      exitFullscreen();
    };
  }, [activeQuizId, activeFlashcardId, fullscreenMode, enterFullscreen, exitFullscreen]);

  const activeQuiz = quizzes?.find((q) => q.id === activeQuizId);
  const activeQuestions = activeQuiz && quizQuestionCount 
    ? (quizQuestionCount >= activeQuiz.questions.length 
        ? [...activeQuiz.questions].slice(0, quizQuestionCount)
        : [...activeQuiz.questions].sort(() => Math.random() - 0.5).slice(0, quizQuestionCount))
    : [];

  const mathJaxConfig = {
    loader: { load: ["input/tex", "output/chtml"] },
    tex: {
      inlineMath: [['$', '$'], ['\\(', '\\)']],
      displayMath: [['$$', '$$'], ['\\[', '\\]']],
      processEscapes: true,
      processEnvironments: true
    },
    options: {
      enableMenu: false,
    }
  };

  return (
    <MathJaxContext config={mathJaxConfig}>
      <div className="space-y-6 relative">
        <CanvasOverlay isOpen={isCanvasOpen} onClose={() => setIsCanvasOpen(false)} />
        {/* Notes View */}
      <div className={activeQuizId ? 'hidden' : 'block'}>
        
        {/* Render YouTube Videos if present */}
        {(activeFilter === 'all' || activeFilter === 'videos') && youtubeUrls && youtubeUrls.length > 0 && (
          <div className="flex flex-col gap-6 mb-8">
            {youtubeUrls.map((url, idx) => (
              <div key={idx} className="w-full aspect-video animate-in fade-in duration-500 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm bg-black">
                <iframe
                  src={url}
                  className="w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`Video Lesson ${idx + 1} for ${title}`}
                />
              </div>
            ))}
          </div>
        )}

        {/* Tab Switcher if multiple sources exist */}
        {/* Tab Switcher if multiple sources exist */}
        {tabs.length > 1 && (activeFilter === 'all' || activeFilter === 'notes') && (
          <div className="flex space-x-2 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'noteboxes' | 'markdown')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Render JSON Noteboxes if active */}
        {(activeFilter === 'all' || activeFilter === 'notes') && activeTab === 'noteboxes' && noteBoxes && noteBoxes.length > 0 && (
          <div className="flex flex-col gap-6 mb-8 animate-in fade-in duration-500">
            {noteBoxes.map((note, index) => (
              <NoteBoxRenderer key={note.id || index} note={note} index={index} />
            ))}
          </div>
        )}

        {/* Render Markdown if active */}
        {(activeFilter === 'all' || activeFilter === 'notes') && activeTab === 'markdown' && notesMarkdown && (
          <section className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 animate-in fade-in duration-500 mb-8">
            <div className="prose prose-slate dark:prose-invert max-w-none prose-emerald">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw as any, rehypeHighlight as any]}
              >
                {notesMarkdown}
              </ReactMarkdown>
            </div>
          </section>
        )}

        {/* PDF Buttons */}
        {(activeFilter === 'all' || activeFilter === 'pdfs') && hasPdf && (
          <section className="pt-6 pb-4 flex flex-col items-center justify-center gap-6">
            {(pdfs || (pdfUrl ? [{ id: 'notes', title: 'PDF Notes', url: pdfUrl }] : [])).map((p) => (
              <div key={p.id} className="flex flex-col sm:flex-row items-center gap-4">
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-10 py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-xl transition-all duration-300 shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_30px_rgba(244,63,94,0.5)] hover:-translate-y-1 active:translate-y-0"
                >
                  <div className="flex flex-col items-center">
                    <span>Open {p.title}</span>
                    <span className="text-xs font-normal opacity-90 mt-1 bg-black/20 px-2 py-0.5 rounded-full">
                      PDF Document
                    </span>
                  </div>
                </a>

                {isAdmin && (
                  <a
                    href={`/canvas?pdfUrl=${encodeURIComponent(p.url)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-10 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xl transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:-translate-y-1 active:translate-y-0"
                  >
                    <div className="flex flex-col items-center">
                      <span>Present {p.title}</span>
                      <span className="text-xs font-normal opacity-90 mt-1 bg-black/20 px-2 py-0.5 rounded-full">
                        Canvas View
                      </span>
                    </div>
                  </a>
                )}
              </div>
            ))}
          </section>
        )}

        {(activeFilter === 'all' || activeFilter === 'flashcards') && flashcardSets && flashcardSets.length > 0 && (
          <section className="pt-6 pb-4 flex flex-wrap justify-center gap-4">
            {flashcardSets.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFlashcardId(f.id)}
                className="px-10 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xl transition-all duration-300 shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] hover:-translate-y-1 active:translate-y-0"
              >
                <div className="flex flex-col items-center">
                  <span>Open {f.title}</span>
                  <span className="text-xs font-normal opacity-90 mt-1 bg-black/20 px-2 py-0.5 rounded-full">
                    {f.flashcards.length} Card{f.flashcards.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </button>
            ))}
          </section>
        )}

        {(activeFilter === 'all' || activeFilter === 'quizzes') && quizzes && quizzes.length > 0 && (
          <section className="pt-4 pb-12 flex flex-wrap justify-center gap-4">
            {quizzes.map((q) => (
              <button
                key={q.id}
                onClick={() => setActiveQuizId(q.id)}
                className="px-10 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xl transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:-translate-y-1 active:translate-y-0"
              >
                <div className="flex flex-col items-center">
                  <span>Join {q.title}</span>
                  <span className="text-xs font-normal opacity-90 mt-1 bg-black/20 px-2 py-0.5 rounded-full">
                    {q.questions.length} Question{q.questions.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </button>
            ))}
          </section>
        )}
      </div>

      {/* Flashcard Session Fullscreen View */}
      {activeFlashcardId && flashcardSets && (
        <GenericFlashcardSession 
          flashcards={flashcardSets.find(f => f.id === activeFlashcardId)?.flashcards || []}
          title={flashcardSets.find(f => f.id === activeFlashcardId)?.title || 'Flashcards'}
          onClose={() => setActiveFlashcardId(null)}
        />
      )}

      {/* Quiz Session Fullscreen View */}
      {activeQuiz && (
        <div className="fixed inset-0 z-[100] bg-gray-50 dark:bg-gray-950 overflow-y-auto flex items-center justify-center">
          
          {quizQuestionCount === null ? (
            <div className="w-full px-4">
              <QuizConfigurator
                quizTitle={activeQuiz.title}
                totalAvailable={activeQuiz.questions.length}
                onStart={(count) => setQuizQuestionCount(count)}
                onCancel={() => setActiveQuizId(null)}
                isAdmin={!!isAdmin}
                questions={activeQuiz.questions}
              />
            </div>
          ) : (
            <div className="w-[95%] h-full max-w-none py-4 md:py-8 animate-in fade-in slide-in-from-bottom-8 duration-500 flex flex-col">
              <div className="mb-6 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{activeQuiz.title}</h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">Test your understanding of {title}.</p>
                </div>
                <button
                  onClick={() => {
                    setActiveQuizId(null);
                    setQuizQuestionCount(null);
                  }}
                  className="text-sm px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-gray-900 shadow-sm"
                >
                  ← Exit Quiz
                </button>
              </div>
              
              <div className="flex-1 min-h-0">
                <QuizPanel 
                  questions={activeQuestions} 
                  topicId={`kd-english-${slug}-${activeQuiz.id}`} 
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    </MathJaxContext>
  );
}
