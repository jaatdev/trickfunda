'use client';

import { motion } from 'framer-motion';
import { getThemeById } from '@/lib/theme-variants';
import { MathJax } from 'better-react-mathjax';
import { DiceLayout } from '@/lib/types';
import { DiceLayoutRenderer } from './DiceLayoutRenderer';

interface QuizAttempt {
  questionId: string;
  prompt: string;
  options: string[];
  selectedOptionId: string | null;
  correctOptionId: string;
  isCorrect: boolean;
  reason?: string;
  status: string;
  timeSpent?: number;
  examTag?: string;
  dice_layout?: DiceLayout;
  options_dice_layout?: DiceLayout[];
}

interface QuizScore {
  correct: number;
  incorrect: number;
  unanswered: number;
  percentage: number;
  passed: boolean;
  totalTimeSpent: number;
  averageTimePerQuestion?: number;
}

interface QuizReviewProps {
  attempts: QuizAttempt[];
  score: QuizScore;
  topicId: string;
  onClose: () => void;
}

import { useState } from 'react';

export function QuizReview({ attempts, score, topicId, onClose }: QuizReviewProps) {
  const theme = getThemeById(topicId);
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect' | 'skipped' | 'time'>('all');

  // Compute Time Analytics
  const validBreakdowns = attempts.map((a, index) => ({ ...a, originalIndex: index + 1 }));
  const fastest = validBreakdowns.length > 0 ? validBreakdowns.reduce((prev, curr) => (curr.timeSpent || 0) < (prev.timeSpent || 0) ? curr : prev) : null;
  const slowest = validBreakdowns.length > 0 ? validBreakdowns.reduce((prev, curr) => (curr.timeSpent || 0) > (prev.timeSpent || 0) ? curr : prev) : null;
  const averageTime = score.averageTimePerQuestion || 0;

  // Filter and sort attempts
  let displayedAttempts = validBreakdowns;
  if (filter === 'correct') {
    displayedAttempts = validBreakdowns.filter(a => a.isCorrect);
  } else if (filter === 'incorrect') {
    displayedAttempts = validBreakdowns.filter(a => !a.isCorrect && a.status !== 'skipped' && a.status !== 'not-answered');
  } else if (filter === 'skipped') {
    displayedAttempts = validBreakdowns.filter(a => a.status === 'skipped' || a.status === 'not-answered');
  } else if (filter === 'time') {
    displayedAttempts = [...validBreakdowns].sort((a, b) => (b.timeSpent || 0) - (a.timeSpent || 0));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-8 mb-6"
        >
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">Quiz Review</h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Review your answers and learn from mistakes
            </p>
          </div>

          {/* Filters */}
          <div className="flex justify-center gap-2 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filter === 'all' ? 'bg-neutral-800 text-white dark:bg-white dark:text-neutral-900' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400'}`}
            >
              All Questions
            </button>
            <button
              onClick={() => setFilter('time')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filter === 'time' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400'}`}
            >
              Sort by Time
            </button>
          </div>

          {/* Score Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <button 
              onClick={() => setFilter(filter === 'correct' ? 'all' : 'correct')}
              className={`text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl transition-all hover:scale-105 ${filter === 'correct' ? 'ring-2 ring-green-500 ring-offset-2 dark:ring-offset-neutral-900' : ''}`}
            >
              <div className="text-xl font-bold text-green-600 dark:text-green-400">{score.correct}</div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">Correct</div>
            </button>
            <button 
              onClick={() => setFilter(filter === 'incorrect' ? 'all' : 'incorrect')}
              className={`text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-xl transition-all hover:scale-105 ${filter === 'incorrect' ? 'ring-2 ring-red-500 ring-offset-2 dark:ring-offset-neutral-900' : ''}`}
            >
              <div className="text-xl font-bold text-red-600 dark:text-red-400">{score.incorrect}</div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">Incorrect</div>
            </button>
            <button 
              onClick={() => setFilter(filter === 'skipped' ? 'all' : 'skipped')}
              className={`text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl transition-all hover:scale-105 ${filter === 'skipped' ? 'ring-2 ring-neutral-400 ring-offset-2 dark:ring-offset-neutral-900' : ''}`}
            >
              <div className="text-xl font-bold">{score.unanswered}</div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">Skipped</div>
            </button>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {Math.round(score.percentage)}%
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">Score</div>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {formatTime(score.totalTimeSpent)}
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">Total Time</div>
            </div>
          </div>

          {/* Time Analytics */}
          <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span>⏱️</span> Time Analytics
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatTime(fastest?.timeSpent || 0)}</div>
                {fastest && <div className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">Q{fastest.originalIndex}</div>}
                <div className="text-xs text-neutral-500 uppercase tracking-wider font-semibold mt-1">Fastest</div>
              </div>
              <div className="text-center border-l border-r border-neutral-200 dark:border-neutral-700">
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatTime(Math.round(averageTime))}</div>
                <div className="text-sm text-transparent select-none">-</div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider font-semibold mt-1">Average</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-rose-600 dark:text-rose-400">{formatTime(slowest?.timeSpent || 0)}</div>
                {slowest && <div className="text-sm text-rose-700 dark:text-rose-300 font-medium">Q{slowest.originalIndex}</div>}
                <div className="text-xs text-neutral-500 uppercase tracking-wider font-semibold mt-1">Slowest</div>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-6 w-full px-6 py-3 rounded-lg font-medium text-white transition-all hover:shadow-lg"
            style={{ background: theme.gradient }}
          >
            Back to Quiz
          </button>
        </motion.div>

        {/* Questions Review */}
        <div className="space-y-4">
          {displayedAttempts.map((attempt, index) => (
            <motion.div
              key={attempt.questionId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full text-sm font-medium">
                      Question {(attempt as any).originalIndex}
                    </span>
                    {attempt.examTag && (
                      <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm font-bold flex items-center gap-1 border border-yellow-200 dark:border-yellow-700/50">
                        🎓 {attempt.examTag}
                      </span>
                    )}
                    {attempt.isCorrect ? (
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                        ✓ Correct
                      </span>
                    ) : attempt.status === 'skipped' ? (
                      <span className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full text-sm font-medium">
                        Skipped
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm font-medium">
                        ✗ Incorrect
                      </span>
                    )}
                    {attempt.timeSpent !== undefined && (
                      <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium flex items-center gap-1">
                        <span>⏱️</span> {formatTime(attempt.timeSpent)}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold whitespace-pre-wrap break-words min-w-0">
                    <MathJax>{attempt.prompt}</MathJax>
                  </h3>
                  {attempt.dice_layout && (
                    <DiceLayoutRenderer layout={attempt.dice_layout} />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {attempt.options.map((option, optionIndex) => {
                  const isSelected = attempt.selectedOptionId === optionIndex.toString();
                  const isCorrect = attempt.correctOptionId === optionIndex.toString();
                  const optionLetter = String.fromCharCode(65 + optionIndex);

                  return (
                    <div
                      key={optionIndex}
                      className={`p-4 rounded-lg border-2 ${
                        isCorrect
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : isSelected
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : 'border-neutral-200 dark:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm font-bold">
                          {optionLetter}
                        </span>
                        <span className="flex-1">
                          <MathJax>{option}</MathJax>
                          {attempt.options_dice_layout?.[optionIndex] && (
                            <div className="mt-2">
                              <DiceLayoutRenderer layout={attempt.options_dice_layout[optionIndex]} />
                            </div>
                          )}
                        </span>
                        {isCorrect && (
                          <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                        )}
                        {isSelected && !isCorrect && (
                          <span className="text-red-600 dark:text-red-400 font-bold">✗</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {attempt.reason && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                    Explanation:
                  </div>
                  <div className="text-sm text-blue-800 dark:text-blue-400"><MathJax>{attempt.reason}</MathJax></div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Utility Functions
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
