'use client';

import { motion } from 'framer-motion';
import { getThemeById } from '@/lib/theme-variants';
import { MathJax } from 'better-react-mathjax';

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
}

interface QuizScore {
  correct: number;
  incorrect: number;
  unanswered: number;
  percentage: number;
  passed: boolean;
  totalTimeSpent: number;
}

interface QuizReviewProps {
  attempts: QuizAttempt[];
  score: QuizScore;
  topicId: string;
  onClose: () => void;
}

export function QuizReview({ attempts, score, topicId, onClose }: QuizReviewProps) {
  const theme = getThemeById(topicId);

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

          {/* Score Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{score.correct}</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Correct</div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{score.incorrect}</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Incorrect</div>
            </div>
            <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
              <div className="text-2xl font-bold">{score.unanswered}</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Skipped</div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {Math.round(score.percentage)}%
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Score</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-6 w-full px-6 py-3 rounded-lg font-medium text-white transition-all"
            style={{ background: theme.gradient }}
          >
            Back to Quiz
          </button>
        </motion.div>

        {/* Questions Review */}
        <div className="space-y-4">
          {attempts.map((attempt, index) => (
            <motion.div
              key={attempt.questionId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full text-sm font-medium">
                      Question {index + 1}
                    </span>
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
                  </div>
                  <h3 className="text-lg font-semibold"><MathJax>{attempt.prompt}</MathJax></h3>
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
                        <span className="flex-1"><MathJax>{option}</MathJax></span>
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
