/**
 * 🎯 ADVANCED QUIZ PANEL - World-Class Quiz System
 * Steps 11-15: One-Question-at-a-Time Quiz Interface
 * Combines best features from all 8 coders
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz } from '@/lib/quiz-state';
import { EnhancedQuizQuestion, QuestionStatus } from '@/lib/quiz-types';
import { QuizQuestion } from '@/lib/types';
import { MathJax } from 'better-react-mathjax';
import { getThemeById } from '@/lib/theme-variants';
import { QuizReview } from './QuizReview';
import { DiceLayoutRenderer } from './DiceLayoutRenderer';
import { useUser } from '@clerk/nextjs';
import CanvasOverlay from '../canvas/CanvasOverlay';

// Convert QuizQuestion to EnhancedQuizQuestion
function enhanceQuestions(questions: QuizQuestion[]): EnhancedQuizQuestion[] {
  return questions.map(q => ({
    ...q,
    difficulty: q.meta?.difficulty as 'easy' | 'medium' | 'hard' | undefined,
    tags: q.meta?.tags,
  }));
}

interface QuizPanelProps {
  questions: QuizQuestion[];
  topicId: string;
  onComplete?: (score: number) => void;
}

export function QuizPanel({ questions, topicId, onComplete }: QuizPanelProps) {
  const enhancedQuestions = enhanceQuestions(questions);
  const quiz = useQuiz(enhancedQuestions, {
    shuffleQuestions: false,
    shuffleOptions: true,
    showExplanations: true,
    allowReview: true,
    allowSkip: true,
    allowMarkForReview: true,
  });

  const [showSidebar, setShowSidebar] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<string>('all');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);

  const { user } = useUser();
  const isAdmin = user?.primaryEmailAddress?.emailAddress === 'kc90040@gmail.com';

  const hasHindi = enhancedQuestions.some(q => q.prompt_hi);

  // Get theme for this quiz
  const theme = getThemeById(topicId);

  // Start quiz on mount
  useEffect(() => {
    if (!quiz.session) {
      quiz.startQuiz();
    }
  }, []);

  // Handle quiz completion
  useEffect(() => {
    if (quiz.session?.state === 'finished' && quiz.session.score) {
      setShowResults(true);
      onComplete?.(quiz.session.score.percentage);
    }
  }, [quiz.session?.state]);



  // Keyboard navigation
  useEffect(() => {
    function handleKeyPress(e: KeyboardEvent) {
      if (showResults) return;

      switch (e.key) {
        case 'ArrowLeft':
          quiz.previousQuestion();
          break;
        case 'ArrowRight':
        case ' ':
          if (!quiz.currentQuestion?.selectedOptionId) return;
          quiz.nextQuestion();
          break;
        case 'm':
        case 'M':
          const current = quiz.currentQuestion;
          if (current?.status === 'marked' || current?.status === 'answered-marked') {
            quiz.unmarkQuestion();
          } else {
            quiz.markForReview();
          }
          break;
        case 's':
        case 'S':
          quiz.skipQuestion();
          break;
        case '1':
        case '2':
        case '3':
        case '4':
          const optionIndex = parseInt(e.key) - 1;
          const option = quiz.currentQuestion?.question.options[optionIndex];
          if (option) {
            const isAdmin = user?.primaryEmailAddress?.emailAddress === 'kc90040@gmail.com';
            const showAdminFeedback = isAdmin && quiz.currentQuestion?.selectedOptionId;
            if (!showAdminFeedback) {
              quiz.selectOption(option);
            }
          }
          break;
      }
    }

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [quiz, showResults, quiz.currentQuestion]);

  if (!quiz.session || !quiz.currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Loading quiz...</p>
        </div>
      </div>
    );
  }

  // Results view - Show detailed review
  if (showResults && quiz.session.score && quiz.session.questions) {
    // Convert quiz attempts to review format
    const attempts = quiz.session.questions.map((q) => {
      // Find the index of the selected option
      const selectedIndex = q.selectedOptionId
        ? q.question.options.indexOf(q.selectedOptionId)
        : -1;
      
      // Find the index of the correct option
      const correctIndex = q.question.answerIndex;

      return {
        questionId: q.question.id,
        prompt: q.question.prompt,
        options: q.question.options,
        selectedOptionId: selectedIndex >= 0 ? selectedIndex.toString() : null,
        correctOptionId: correctIndex.toString(),
        isCorrect: selectedIndex === correctIndex && q.status !== 'skipped' && q.selectedOptionId !== null,
        reason: q.question.reason,
        status: q.status,
        timeSpent: q.timeSpent,
        dice_layout: q.question.dice_layout,
        options_dice_layout: q.question.options_dice_layout,
      };
    });

    return (
      <QuizReview
        attempts={attempts}
        score={quiz.session.score}
        topicId={topicId}
        onClose={() => setShowResults(false)}
      />
    );
  }

  if (showReview && quiz.session) {
    return (
      <QuizReview
        attempts={quiz.session.questions.map(q => ({
          questionId: q.question.id,
          prompt: language === 'hi' && q.question.prompt_hi ? q.question.prompt_hi : q.question.prompt,
          options: language === 'hi' && q.question.options_hi ? q.question.options_hi : q.question.options,
          selectedOptionId: q.selectedOptionId ? q.question.options.indexOf(q.selectedOptionId).toString() : null,
          correctOptionId: q.question.answerIndex.toString(),
          isCorrect: q.selectedOptionId === q.question.options[q.question.answerIndex],
          reason: language === 'hi' && q.question.reason_hi ? q.question.reason_hi : q.question.reason,
          status: q.status,
          timeSpent: q.timeSpent,
          examTag: q.question.examTag,
          dice_layout: q.question.dice_layout,
          options_dice_layout: q.question.options_dice_layout,
        }))}
        score={quiz.session.score!}
        topicId={topicId}
        onClose={() => setShowReview(false)}
      />
    );
  }

  const currentAttempt = quiz.currentQuestion;
  const currentQuestion = currentAttempt.question;
  const isMarked = currentAttempt.status === 'marked' || currentAttempt.status === 'answered-marked';

  return (
    <div className="relative min-h-screen bg-linear-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <CanvasOverlay isOpen={isCanvasOpen} onClose={() => setIsCanvasOpen(false)} questionIndex={quiz.navigation.currentIndex} />
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {isAdmin && (
              <button
                onClick={() => setIsCanvasOpen(true)}
                className="px-3 py-1.5 md:px-4 md:py-2 bg-linear-to-r from-violet-600 to-fuchsia-600 text-white rounded-lg text-xs md:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span className="hidden sm:inline">Use Canvas</span>
              </button>
            )}
            <div>
              <h2 className="text-lg font-bold hidden sm:block">Quiz Session</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Question {quiz.navigation.currentIndex + 1} of {quiz.navigation.totalQuestions}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            {hasHindi && (
              <div className="flex bg-neutral-200 dark:bg-neutral-800 rounded-lg p-1 hidden sm:flex">
                <button 
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${language === 'en' ? 'bg-white dark:bg-neutral-700 shadow-[0_1px_3px_rgba(0,0,0,0.1)]' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'}`}
                >English</button>
                <button 
                  onClick={() => setLanguage('hi')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${language === 'hi' ? 'bg-white dark:bg-neutral-700 shadow-[0_1px_3px_rgba(0,0,0,0.1)]' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'}`}
                >हिंदी</button>
              </div>
            )}

            {/* Timer */}
            {quiz.timer.isRunning && (
              <div className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-full">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-mono font-medium">
                {formatTime(quiz.timer.timeElapsed)}
              </span>
            </div>
          )}
          </div>

          {/* Progress */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Answered</p>
              <p className="font-bold text-lg">{quiz.navigation.answeredCount}/{quiz.navigation.totalQuestions}</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-neutral-200 dark:bg-neutral-800">
          <motion.div
            className="h-full"
            style={{
              background: theme.gradient,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${((quiz.navigation.currentIndex + 1) / quiz.navigation.totalQuestions) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Question Sidebar */}
          <AnimatePresence>
            {showSidebar && (
              <>
                {/* Mobile Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowSidebar(false)}
                  className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                />
                
                {/* Sidebar Container */}
                <motion.aside
                  initial={{ x: -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  className="fixed lg:static top-0 left-0 h-full lg:h-auto w-72 lg:w-64 bg-white dark:bg-neutral-900 lg:bg-transparent z-50 lg:z-auto p-4 lg:p-0 overflow-y-auto lg:overflow-visible shadow-2xl lg:shadow-none shrink-0"
                >
                  <div className="flex justify-between items-center mb-6 lg:hidden pb-4 border-b border-neutral-200 dark:border-neutral-800">
                    <h3 className="font-bold text-lg">Questions</h3>
                    <button onClick={() => setShowSidebar(false)} className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  <QuizSidebar
                    questions={quiz.session.questions}
                    currentIndex={quiz.navigation.currentIndex}
                    onQuestionClick={(index: number) => {
                      quiz.goToQuestion(index);
                      if (typeof window !== 'undefined' && window.innerWidth < 1024) setShowSidebar(false);
                    }}
                    theme={theme}
                  />
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Main Question Area */}
          <div className="flex-1 max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={quiz.navigation.currentIndex}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl overflow-hidden"
                style={{
                  boxShadow: `0 10px 40px ${theme.glow}40`,
                }}
              >
                {/* Question Header */}
                <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full text-sm font-medium">
                          Question {quiz.navigation.currentIndex + 1}
                        </span>
                        {currentQuestion.examTag && (
                          <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm font-bold flex items-center gap-1 border border-yellow-200 dark:border-yellow-700/50">
                            🎓 {currentQuestion.examTag}
                          </span>
                        )}
                        {currentAttempt.question.meta?.difficulty && (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyClass(currentAttempt.question.meta.difficulty)}`}>
                            {currentAttempt.question.meta.difficulty}
                          </span>
                        )}
                        {/* Mobile Language Toggle */}
                        {hasHindi && (
                          <button 
                            onClick={() => setLanguage(l => l === 'en' ? 'hi' : 'en')}
                            className="sm:hidden px-2 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 ml-2"
                          >
                            {language === 'en' ? 'अ (Hindi)' : 'A (English)'}
                          </button>
                        )}
                      </div>
                      <h3 className="text-base md:text-xl font-bold leading-relaxed whitespace-pre-wrap break-words min-w-0">
                        <MathJax>{language === 'hi' && currentQuestion.prompt_hi ? currentQuestion.prompt_hi : currentQuestion.prompt}</MathJax>
                      </h3>
                      {currentQuestion.dice_layout && (
                        <DiceLayoutRenderer layout={currentQuestion.dice_layout} />
                      )}
                    </div>
                    
                    <button
                      onClick={isMarked ? quiz.unmarkQuestion : quiz.markForReview}
                      className={`p-2 rounded-lg transition-colors ${
                        isMarked 
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' 
                          : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                      title={isMarked ? 'Unmark' : 'Mark for review'}
                    >
                      <svg className="w-6 h-6" fill={isMarked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Options */}
                <div className="p-6 space-y-3">
                  {currentQuestion.options.map((originalOption, index) => {
                    const isSelected = currentAttempt.selectedOptionId === originalOption;
                    const isCorrect = index === currentQuestion.answerIndex;
                    const showAdminFeedback = isAdmin && currentAttempt.selectedOptionId;
                    const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
                    
                    const displayOptions = language === 'hi' && currentQuestion.options_hi ? currentQuestion.options_hi : currentQuestion.options;
                    const displayOption = displayOptions[index] || originalOption;

                    let buttonStyle = 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 bg-white dark:bg-neutral-800';
                    let letterStyle = 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300';
                    let textStyle = '';

                    if (showAdminFeedback) {
                      if (isCorrect) {
                        buttonStyle = 'border-transparent bg-linear-to-r from-green-500 to-emerald-600 text-white shadow-lg';
                        letterStyle = 'bg-white/20 text-white';
                      } else if (isSelected) {
                        buttonStyle = 'border-transparent bg-linear-to-r from-red-500 to-rose-600 text-white shadow-lg';
                        letterStyle = 'bg-white/20 text-white';
                      }
                    } else if (isSelected) {
                      buttonStyle = `border-transparent bg-linear-to-r ${theme.gradient} text-white shadow-lg`;
                      letterStyle = 'bg-white/20 text-white';
                    }

                    return (
                      <motion.button
                        key={index}
                        onClick={() => {
                          if (showAdminFeedback) return;
                          quiz.selectOption(originalOption);
                        }}
                        className={`
                          w-full p-3 md:p-4 rounded-xl border-2 text-left transition-all
                          flex items-start gap-3 md:gap-4
                          ${buttonStyle}
                          ${showAdminFeedback ? 'cursor-default' : ''}
                        `}
                      >
                        <span className={`
                          shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                          ${letterStyle}
                        `}>
                          {optionLetter}
                        </span>
                        <span className={`flex-1 pt-1 break-words min-w-0 text-sm md:text-base leading-relaxed pointer-events-none ${textStyle}`}>
                          <MathJax>{displayOption}</MathJax>
                          {currentQuestion.options_dice_layout?.[index] && (
                            <div className="mt-2 pointer-events-none">
                              <DiceLayoutRenderer layout={currentQuestion.options_dice_layout[index]} />
                            </div>
                          )}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="p-4 md:p-6 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-800">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex gap-2 flex-wrap">
                      {currentAttempt.selectedOptionId && !isAdmin && (
                        <button
                          onClick={quiz.clearAnswer}
                          className="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                        >
                          Clear
                        </button>
                      )}
                      <button
                        onClick={quiz.skipQuestion}
                        className="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                      >
                        Skip
                      </button>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {quiz.navigation.canGoPrevious && (
                        <button
                          onClick={quiz.previousQuestion}
                          className="px-4 py-1.5 md:px-6 md:py-2 text-sm md:text-base bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors font-medium"
                        >
                          ← Prev
                        </button>
                      )}
                      
                      {quiz.navigation.canGoNext ? (
                        <button
                          onClick={quiz.nextQuestion}
                          disabled={!currentAttempt.selectedOptionId}
                          className="px-4 py-1.5 md:px-6 md:py-2 text-sm md:text-base rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            background: currentAttempt.selectedOptionId ? theme.gradient : undefined,
                            color: currentAttempt.selectedOptionId ? 'white' : undefined,
                          }}
                        >
                          Next →
                        </button>
                      ) : (
                        <button
                          onClick={quiz.submitQuiz}
                          disabled={quiz.navigation.answeredCount === 0}
                          className="px-4 py-1.5 md:px-6 md:py-2 text-sm md:text-base rounded-lg font-medium bg-linear-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Submit
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Keyboard Shortcuts */}
                <div className="px-6 py-3 bg-neutral-100 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-800">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    <span className="font-medium">Shortcuts:</span>{' '}
                    <kbd className="px-2 py-1 bg-white dark:bg-neutral-800 rounded border border-neutral-300 dark:border-neutral-700 text-xs font-mono">1-4</kbd> Select option{' '}
                    <kbd className="px-2 py-1 bg-white dark:bg-neutral-800 rounded border border-neutral-300 dark:border-neutral-700 text-xs font-mono">←→</kbd> Navigate{' '}
                    <kbd className="px-2 py-1 bg-white dark:bg-neutral-800 rounded border border-neutral-300 dark:border-neutral-700 text-xs font-mono">M</kbd> Mark{' '}
                    <kbd className="px-2 py-1 bg-white dark:bg-neutral-800 rounded border border-neutral-300 dark:border-neutral-700 text-xs font-mono">S</kbd> Skip
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// Question Sidebar Component
function QuizSidebar({ questions, currentIndex, onQuestionClick, theme }: any) {
  return (
    <div className="sticky top-24 bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-4">
      <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
        All Questions
      </h3>
      <div className="grid grid-cols-5 gap-2">
        {questions.map((attempt: any, index: number) => {
          const isCurrent = index === currentIndex;
          const status = attempt.status;

          return (
            <motion.button
              key={index}
              onClick={() => onQuestionClick(index)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`
                aspect-square rounded-lg font-bold text-sm transition-all
                ${isCurrent ? 'ring-2 ring-offset-2' : ''}
                ${getStatusClass(status)}
              `}
              style={isCurrent ? { 
                background: theme.gradient,
                color: 'white',
              } : undefined}
            >
              {index + 1}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/30 border-2 border-green-500"></div>
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-500"></div>
          <span>Marked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-neutral-100 dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-700"></div>
          <span>Not Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-100 dark:bg-red-900/30 border-2 border-red-500"></div>
          <span>Skipped</span>
        </div>
      </div>
    </div>
  );
}

// Results Component
function QuizResults({ score, theme, onRestart, onReview }: any) {
  const validBreakdowns = score.breakdown.map((b: any, index: number) => ({ ...b, qIndex: index + 1 }));
  const fastest = validBreakdowns.length > 0 ? validBreakdowns.reduce((prev: any, curr: any) => (curr.timeSpent || 0) < (prev.timeSpent || 0) ? curr : prev) : null;
  const slowest = validBreakdowns.length > 0 ? validBreakdowns.reduce((prev: any, curr: any) => (curr.timeSpent || 0) > (prev.timeSpent || 0) ? curr : prev) : null;
  const averageTime = score.averageTimePerQuestion || 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center p-4 py-12">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-2xl w-full bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-8 text-center" style={{ background: theme.gradient }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <div className="w-24 h-24 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h2>
          <p className="text-white/80">Here's how you performed</p>
        </div>

        {/* Score */}
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="text-6xl font-bold mb-2" style={{ color: theme.accent }}>
              {Math.round(score.percentage)}%
            </div>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              {score.passed ? '🎉 Passed!' : 'Keep practicing!'}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatTime(score.totalTimeSpent)}</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Total Time</div>
            </div>
          </div>

          {/* Time Analytics */}
          <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-6 mb-8 border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span>⏱️</span> Time Analytics
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatTime(fastest?.timeSpent || 0)}</div>
                {fastest && <div className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">Q{fastest.qIndex}</div>}
                <div className="text-xs text-neutral-500 uppercase tracking-wider font-semibold mt-1">Fastest</div>
              </div>
              <div className="text-center border-l border-r border-neutral-200 dark:border-neutral-700">
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatTime(Math.round(averageTime))}</div>
                <div className="text-sm text-transparent select-none">-</div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider font-semibold mt-1">Average</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-rose-600 dark:text-rose-400">{formatTime(slowest?.timeSpent || 0)}</div>
                {slowest && <div className="text-sm text-rose-700 dark:text-rose-300 font-medium">Q{slowest.qIndex}</div>}
                <div className="text-xs text-neutral-500 uppercase tracking-wider font-semibold mt-1">Slowest</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mb-4">
            <button
              onClick={onReview}
              className="flex-1 px-6 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-xl font-bold transition-all hover:bg-neutral-50 dark:hover:bg-neutral-700"
            >
              Review Answers
            </button>
          </div>
          <div className="flex gap-4">
            <button
              onClick={onRestart}
              className="flex-1 px-6 py-3 rounded-lg font-medium text-white transition-all hover:shadow-lg"
              style={{ background: theme.gradient }}
            >
              Try Again
            </button>
            <button
              onClick={() => window.history.back()}
              className="flex-1 px-6 py-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              Back to Topic
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Utility Functions
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getStatusClass(status: QuestionStatus): string {
  switch (status) {
    case 'answered':
    case 'answered-marked':
      return 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500 text-green-700 dark:text-green-300';
    case 'marked':
      return 'bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-500 text-yellow-700 dark:text-yellow-300';
    case 'skipped':
      return 'bg-red-100 dark:bg-red-900/30 border-2 border-red-500 text-red-700 dark:text-red-300';
    default:
      return 'bg-neutral-100 dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-700';
  }
}

function getDifficultyClass(difficulty: string): string {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
    case 'medium':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
    case 'hard':
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
    default:
      return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300';
  }
}
