'use client';

import React, { useState } from 'react';
import { useFullscreen } from '@/lib/fullscreen-context';
import GenericFlashcardViewer from './GenericFlashcardViewer';
import GenericFlashcardSummary from './GenericFlashcardSummary';
import { Brain, ArrowRight, X } from 'lucide-react';
import type { SubjectFlashcard } from '@/lib/types';

interface Props {
  flashcards: SubjectFlashcard[];
  title: string;
  onClose: () => void;
}

export default function GenericFlashcardSession({ flashcards, title, onClose }: Props) {
  const { enterFullscreen, exitFullscreen } = useFullscreen();
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const handleStart = async () => {
    setIsStarted(true);
    await enterFullscreen();
  };

  const handleFinish = async () => {
    setIsFinished(true);
  };

  const handleClose = async () => {
    await exitFullscreen();
    onClose();
  };

  // 1. Session View (Fullscreen Cards)
  if (isStarted && !isFinished) {
    return (
      <GenericFlashcardViewer 
        flashcards={flashcards} 
        onFinish={handleFinish} 
        onClose={handleClose} 
      />
    );
  }

  // 2. Summary View
  if (isFinished) {
    return (
      <GenericFlashcardSummary 
        flashcards={flashcards} 
        title={title} 
        onClose={handleClose} 
      />
    );
  }

  // 3. Splash Screen (Not Started)
  return (
    <div className="fixed inset-0 z-[100] bg-gray-50/95 dark:bg-gray-950/95 backdrop-blur-md p-4 md:p-8 flex flex-col items-center justify-center">
      <button 
        onClick={handleClose}
        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="max-w-2xl w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl text-center space-y-8 animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(168,85,247,0.15)]">
          <Brain className="w-12 h-12 text-purple-500" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white capitalize">
            {title}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {flashcards.length} flashcards in this session.
          </p>
        </div>

        <button
          onClick={handleStart}
          className="w-full py-5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-purple-500/20"
        >
          Enter Fullscreen & Start <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
