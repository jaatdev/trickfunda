import React, { useState } from 'react';
import { QuizQuestion } from '@/lib/types';
import { Settings2, PlayCircle, Loader2 } from 'lucide-react';

interface QuizConfiguratorProps {
  quizTitle: string;
  totalAvailable: number;
  onStart: (count: number) => void;
  onCancel: () => void;
  isGenerating?: boolean;
  isAdmin?: boolean;
  questions?: QuizQuestion[];
}

import dynamic from 'next/dynamic';
const KDStylePDFGenerator = dynamic(() => import('./KDStylePDFGenerator'), { ssr: false });

export const QuizConfigurator: React.FC<QuizConfiguratorProps> = ({ 
  quizTitle, 
  totalAvailable, 
  onStart, 
  onCancel,
  isGenerating = false,
  isAdmin = false,
  questions = []
}) => {
  // If the total available is less than 5, the minimum is the total available.
  // Otherwise, the minimum is 5.
  const minQuestions = Math.min(5, totalAvailable);
  const [selectedCount, setSelectedCount] = useState<number>(minQuestions);

  const handleStart = () => {
    onStart(selectedCount);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8 max-w-lg w-full mx-auto animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
          <Settings2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Configure Quiz</h2>
          <p className="text-gray-500 dark:text-gray-400">{quizTitle}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="flex justify-between items-end mb-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Number of Questions</span>
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{selectedCount}</span>
          </label>
          
          <input 
            type="range" 
            min={minQuestions} 
            max={totalAvailable} 
            value={selectedCount}
            onChange={(e) => setSelectedCount(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-emerald-500"
            disabled={totalAvailable <= minQuestions}
          />
          
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Min: {minQuestions}</span>
            <span>Max: {totalAvailable}</span>
          </div>
        </div>

        {totalAvailable < 5 && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-xl text-sm border border-blue-100 dark:border-blue-800/30">
            This quiz has fewer than 5 questions available. The question count is fixed to the maximum available.
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <button 
            onClick={onCancel}
            disabled={isGenerating}
            className="flex-1 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleStart}
            disabled={isGenerating}
            className="flex-[2] flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <PlayCircle className="w-5 h-5" />
            )}
            {isGenerating ? 'Preparing...' : 'Start Quiz'}
          </button>
        </div>

        {isAdmin && questions.length > 0 && (
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <KDStylePDFGenerator questions={questions} title={quizTitle} />
          </div>
        )}
      </div>
    </div>
  );
};
