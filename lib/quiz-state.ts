/**
 * 🎮 QUIZ STATE MANAGEMENT - World-Class Quiz System
 * Steps 9-10: Quiz Reducer & Hooks (Best from Coder B + E)
 * Complete state management with React hooks
 */

import { useReducer, useEffect, useCallback, useRef } from 'react';
import {
  QuizReducerState,
  QuizAction,
  QuizSession,
  QuizAttemptState,
  QuizScore,
  QuizNavigation,
  TimerState,
  QuizSettings,
  QuestionStatus,
  EnhancedQuizQuestion,
} from './quiz-types';

// Default Quiz Settings
export const DEFAULT_QUIZ_SETTINGS: QuizSettings = {
  shuffleQuestions: false,
  shuffleOptions: true,
  showExplanations: true,
  allowReview: true,
  allowSkip: true,
  allowMarkForReview: true,
  negativeMarking: false,
  negativeMarkValue: -0.25,
  passingPercentage: 60,
  questionsPerSession: 10,
};

// Initial State
const initialState: QuizReducerState = {
  session: null,
  navigation: {
    canGoNext: false,
    canGoPrevious: false,
    canSubmit: false,
    currentIndex: 0,
    totalQuestions: 0,
    answeredCount: 0,
    markedCount: 0,
    skippedCount: 0,
  },
  timer: {
    isRunning: false,
    isPaused: false,
    timeElapsed: 0,
    warningThreshold: 300, // 5 minutes
    criticalThreshold: 60, // 1 minute
  },
  isLoading: false,
  error: null,
};

// Calculate navigation state
function calculateNavigation(session: QuizSession | null): QuizNavigation {
  if (!session) {
    return initialState.navigation;
  }

  const { currentQuestionIndex, questions } = session;
  const totalQuestions = questions.length;
  const answeredCount = questions.filter(q => q.status === 'answered' || q.status === 'answered-marked').length;
  const markedCount = questions.filter(q => q.status === 'marked' || q.status === 'answered-marked').length;
  const skippedCount = questions.filter(q => q.status === 'skipped').length;

  return {
    canGoNext: currentQuestionIndex < totalQuestions - 1,
    canGoPrevious: currentQuestionIndex > 0,
    canSubmit: session.state === 'active' && answeredCount > 0,
    currentIndex: currentQuestionIndex,
    totalQuestions,
    answeredCount,
    markedCount,
    skippedCount,
  };
}

// Quiz history entry type
export interface QuizHistoryEntry {
  id: string;
  subjectId: string;
  subjectName: string;
  score: {
    obtained: number;
    total: number;
    percentage: number;
  };
  questions: {
    questionId: string;
    topic: string;
    isCorrect: boolean;
    timeSpent: number;
  }[];
  completedAt: number;
}

// Get quiz history from localStorage
export function getQuizHistory(): QuizHistoryEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const allEntries: QuizHistoryEntry[] = [];
    
    // Get all quiz analytics from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('quiz-analytics-')) {
        const data = localStorage.getItem(key);
        if (data) {
          const analytics = JSON.parse(data);
          if (analytics.attempts && Array.isArray(analytics.attempts)) {
            allEntries.push(...analytics.attempts);
          }
        }
      }
    }
    
    // Sort by timestamp descending
    return allEntries.sort((a, b) => b.completedAt - a.completedAt);
  } catch (error) {
    console.error('Failed to load quiz history:', error);
    return [];
  }
}

// Clear quiz history
export function clearQuizHistory(subjectId?: string) {
  if (typeof window === 'undefined') return;

  try {
    if (subjectId) {
      localStorage.removeItem(`quiz-analytics-${subjectId}`);
    } else {
      // Clear all quiz analytics
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('quiz-analytics-')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  } catch (error) {
    console.error('Failed to clear quiz history:', error);
  }
}

// Save quiz analytics to localStorage
function saveQuizAnalytics(session: QuizSession) {
  if (typeof window === 'undefined') return;

  const score = calculateScore(session);
  const timestamp = Date.now();
  
  // Extract topic data from questions
  const questionData = session.questions.map(attempt => {
    const correctOptionId = attempt.question.options[attempt.question.answerIndex];
    const isCorrect = attempt.selectedOptionId === correctOptionId;
    
    return {
      questionId: attempt.question.id,
      topic: 'General', // Can be enhanced with topic data from question
      isCorrect,
      timeSpent: attempt.timeSpent,
    };
  });
  
  // Create analytics entry
  const analyticsEntry: QuizHistoryEntry = {
    id: session.id,
    subjectId: session.subjectSlug || 'general',
    subjectName: session.subjectSlug || 'Quiz',
    score: {
      obtained: score.correct,
      total: score.total,
      percentage: score.percentage,
    },
    questions: questionData,
    completedAt: timestamp,
  };

  try {
    // Get existing analytics
    const key = `quiz-analytics-${session.subjectSlug || 'all'}`;
    const existing = localStorage.getItem(key);
    const analytics = existing ? JSON.parse(existing) : { attempts: [] };
    
    // Add new attempt
    analytics.attempts = analytics.attempts || [];
    analytics.attempts.push(analyticsEntry);
    
    // Keep last 50 attempts
    if (analytics.attempts.length > 50) {
      analytics.attempts = analytics.attempts.slice(-50);
    }
    
    // Calculate overall stats
    const attempts = analytics.attempts;
    const totalScore = attempts.reduce((sum: number, a: any) => sum + a.percentage, 0);
    const averageScore = totalScore / attempts.length;
    const bestScore = Math.max(...attempts.map((a: any) => a.percentage));
    const totalTime = attempts.reduce((sum: number, a: any) => sum + a.timeSpent, 0);
    
    // Calculate improvement rate
    if (attempts.length >= 4) {
      const firstHalf = attempts.slice(0, Math.floor(attempts.length / 2));
      const secondHalf = attempts.slice(Math.floor(attempts.length / 2));
      const firstAvg = firstHalf.reduce((sum: number, a: any) => sum + a.percentage, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum: number, a: any) => sum + a.percentage, 0) / secondHalf.length;
      const improvementRate = ((secondAvg - firstAvg) / firstAvg) * 100;
      
      analytics.overallStats = {
        totalAttempts: attempts.length,
        averageScore,
        bestScore,
        totalTimeSpent: totalTime,
        improvementRate,
      };
    } else {
      analytics.overallStats = {
        totalAttempts: attempts.length,
        averageScore,
        bestScore,
        totalTimeSpent: totalTime,
        improvementRate: 0,
      };
    }
    
    // Save back to localStorage
    localStorage.setItem(key, JSON.stringify(analytics));
  } catch (error) {
    console.error('Failed to save quiz analytics:', error);
  }
}

// Calculate quiz score
function calculateScore(session: QuizSession): QuizScore {
  const { questions, settings, startedAt } = session;
  const finishedAt = Date.now();
  const totalTimeSpent = Math.floor((finishedAt - startedAt) / 1000);

  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;
  let skipped = 0;
  let marked = 0;

  const breakdown = questions.map(attempt => {
    const correctOptionId = attempt.question.options[attempt.question.answerIndex];
    const isCorrect = attempt.selectedOptionId === correctOptionId;
    
    if (attempt.status === 'skipped') {
      skipped++;
    } else if (!attempt.selectedOptionId) {
      unanswered++;
    } else if (isCorrect) {
      correct++;
    } else {
      incorrect++;
    }

    if (attempt.status === 'marked' || attempt.status === 'answered-marked') {
      marked++;
    }

    return {
      questionId: attempt.question.id,
      questionText: attempt.question.prompt,
      userAnswer: attempt.selectedOptionId || null,
      correctAnswer: correctOptionId,
      isCorrect,
      timeSpent: attempt.timeSpent,
      status: attempt.status,
      explanation: attempt.question.reason,
    };
  });

  // Calculate total score with negative marking
  let totalScore = correct;
  if (settings.negativeMarking) {
    totalScore += incorrect * settings.negativeMarkValue;
  }

  const maxScore = questions.length;
  const percentage = (totalScore / maxScore) * 100;
  const passed = percentage >= settings.passingPercentage;

  return {
    total: questions.length,
    correct,
    incorrect,
    unanswered,
    skipped,
    marked,
    percentage: Math.max(0, percentage),
    passed,
    totalTimeSpent,
    averageTimePerQuestion: totalTimeSpent / questions.length,
    breakdown,
  };
}

// Quiz Reducer
function quizReducer(state: QuizReducerState, action: QuizAction): QuizReducerState {
  switch (action.type) {
    case 'START_QUIZ': {
      return {
        ...state,
        session: action.payload,
        navigation: calculateNavigation(action.payload),
        timer: {
          ...state.timer,
          isRunning: true,
          isPaused: false,
          timeElapsed: 0,
          timeRemaining: action.payload.totalTimeLimit,
        },
        isLoading: false,
        error: null,
      };
    }

    case 'SELECT_OPTION': {
      if (!state.session) return state;

      const { questionIndex, optionId } = action.payload;
      const updatedQuestions = [...state.session.questions];
      const currentAttempt = updatedQuestions[questionIndex];

      // Update status
      let newStatus: QuestionStatus;
      if (currentAttempt.status === 'marked') {
        newStatus = 'answered-marked';
      } else {
        newStatus = 'answered';
      }

      updatedQuestions[questionIndex] = {
        ...currentAttempt,
        selectedOptionId: optionId,
        status: newStatus,
        answeredAt: Date.now(),
        attempts: currentAttempt.attempts + 1,
      };

      const updatedSession = {
        ...state.session,
        questions: updatedQuestions,
      };

      return {
        ...state,
        session: updatedSession,
        navigation: calculateNavigation(updatedSession),
      };
    }

    case 'MARK_FOR_REVIEW': {
      if (!state.session) return state;

      const { questionIndex } = action.payload;
      const updatedQuestions = [...state.session.questions];
      const currentAttempt = updatedQuestions[questionIndex];

      let newStatus: QuestionStatus;
      if (currentAttempt.status === 'answered') {
        newStatus = 'answered-marked';
      } else {
        newStatus = 'marked';
      }

      updatedQuestions[questionIndex] = {
        ...currentAttempt,
        status: newStatus,
        markedAt: Date.now(),
      };

      const updatedSession = {
        ...state.session,
        questions: updatedQuestions,
      };

      return {
        ...state,
        session: updatedSession,
        navigation: calculateNavigation(updatedSession),
      };
    }

    case 'UNMARK_QUESTION': {
      if (!state.session) return state;

      const { questionIndex } = action.payload;
      const updatedQuestions = [...state.session.questions];
      const currentAttempt = updatedQuestions[questionIndex];

      let newStatus: QuestionStatus;
      if (currentAttempt.status === 'answered-marked') {
        newStatus = 'answered';
      } else {
        newStatus = currentAttempt.selectedOptionId ? 'answered' : 'not-answered';
      }

      updatedQuestions[questionIndex] = {
        ...currentAttempt,
        status: newStatus,
        markedAt: undefined,
      };

      const updatedSession = {
        ...state.session,
        questions: updatedQuestions,
      };

      return {
        ...state,
        session: updatedSession,
        navigation: calculateNavigation(updatedSession),
      };
    }

    case 'SKIP_QUESTION': {
      if (!state.session) return state;

      const { questionIndex } = action.payload;
      const updatedQuestions = [...state.session.questions];

      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        status: 'skipped',
      };

      const updatedSession = {
        ...state.session,
        questions: updatedQuestions,
      };

      return {
        ...state,
        session: updatedSession,
        navigation: calculateNavigation(updatedSession),
      };
    }

    case 'CLEAR_ANSWER': {
      if (!state.session) return state;

      const { questionIndex } = action.payload;
      const updatedQuestions = [...state.session.questions];
      const currentAttempt = updatedQuestions[questionIndex];

      updatedQuestions[questionIndex] = {
        ...currentAttempt,
        selectedOptionId: null,
        status: currentAttempt.status === 'answered-marked' ? 'marked' : 'not-answered',
        answeredAt: undefined,
      };

      const updatedSession = {
        ...state.session,
        questions: updatedQuestions,
      };

      return {
        ...state,
        session: updatedSession,
        navigation: calculateNavigation(updatedSession),
      };
    }

    case 'NEXT_QUESTION': {
      if (!state.session || !state.navigation.canGoNext) return state;

      const updatedSession = {
        ...state.session,
        currentQuestionIndex: state.session.currentQuestionIndex + 1,
      };

      return {
        ...state,
        session: updatedSession,
        navigation: calculateNavigation(updatedSession),
      };
    }

    case 'PREVIOUS_QUESTION': {
      if (!state.session || !state.navigation.canGoPrevious) return state;

      const updatedSession = {
        ...state.session,
        currentQuestionIndex: state.session.currentQuestionIndex - 1,
      };

      return {
        ...state,
        session: updatedSession,
        navigation: calculateNavigation(updatedSession),
      };
    }

    case 'GO_TO_QUESTION': {
      if (!state.session) return state;

      const { index } = action.payload;
      if (index < 0 || index >= state.session.questions.length) return state;

      const updatedSession = {
        ...state.session,
        currentQuestionIndex: index,
      };

      return {
        ...state,
        session: updatedSession,
        navigation: calculateNavigation(updatedSession),
      };
    }

    case 'PAUSE_QUIZ': {
      if (!state.session) return state;

      return {
        ...state,
        session: {
          ...state.session,
          state: 'paused',
        },
        timer: {
          ...state.timer,
          isRunning: false,
          isPaused: true,
        },
      };
    }

    case 'RESUME_QUIZ': {
      if (!state.session) return state;

      return {
        ...state,
        session: {
          ...state.session,
          state: 'active',
        },
        timer: {
          ...state.timer,
          isRunning: true,
          isPaused: false,
        },
      };
    }

    case 'SUBMIT_QUIZ': {
      if (!state.session) return state;

      const score = calculateScore(state.session);

      const updatedSession = {
        ...state.session,
        state: 'finished' as const,
        finishedAt: Date.now(),
        score,
      };

      return {
        ...state,
        session: updatedSession,
        timer: {
          ...state.timer,
          isRunning: false,
        },
      };
    }

    case 'FINISH_QUIZ': {
      if (!state.session) return state;

      return {
        ...state,
        session: {
          ...state.session,
          state: 'finished',
          finishedAt: Date.now(),
          score: action.payload,
        },
        timer: {
          ...state.timer,
          isRunning: false,
        },
      };
    }

    case 'UPDATE_TIMER': {
      if (!state.session) return state;

      const { elapsed, remaining } = action.payload;
      
      const previousElapsed = state.timer.timeElapsed || 0;
      const timeDiff = Math.max(0, elapsed - previousElapsed);

      // Update time spent on current question
      const updatedQuestions = [...state.session.questions];
      const currentIndex = state.session.currentQuestionIndex;
      updatedQuestions[currentIndex] = {
        ...updatedQuestions[currentIndex],
        timeSpent: (updatedQuestions[currentIndex].timeSpent || 0) + timeDiff,
      };

      return {
        ...state,
        session: {
          ...state.session,
          questions: updatedQuestions,
          timeRemaining: remaining,
        },
        timer: {
          ...state.timer,
          timeElapsed: elapsed,
          timeRemaining: remaining,
        },
      };
    }

    default:
      return state;
  }
}

// Main Quiz Hook
export function useQuiz(questions: EnhancedQuizQuestion[], settings: Partial<QuizSettings> = {}) {
  const [state, dispatch] = useReducer(quizReducer, initialState);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const mergedSettings = { ...DEFAULT_QUIZ_SETTINGS, ...settings };

  // Start quiz
  const startQuiz = useCallback(() => {
    const session: QuizSession = {
      id: `quiz-${Date.now()}`,
      subjectSlug: '',
      topicId: '',
      mode: 'practice',
      state: 'active',
      questions: questions.map(q => ({
        question: q,
        status: 'not-answered' as QuestionStatus,
        selectedOptionId: null,
        timeSpent: 0,
        attempts: 0,
      })),
      currentQuestionIndex: 0,
      startedAt: Date.now(),
      settings: mergedSettings,
    };

    dispatch({ type: 'START_QUIZ', payload: session });
  }, [questions, mergedSettings]);

  // Timer effect
  useEffect(() => {
    if (state.timer.isRunning && state.session) {
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - state.session!.startedAt) / 1000);
        const remaining = state.session!.totalTimeLimit 
          ? state.session!.totalTimeLimit - elapsed 
          : undefined;

        dispatch({ type: 'UPDATE_TIMER', payload: { elapsed, remaining } });

        // Auto-submit if time runs out
        if (remaining !== undefined && remaining <= 0) {
          dispatch({ type: 'SUBMIT_QUIZ' });
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state.timer.isRunning, state.session]);

  // Quiz actions
  const selectOption = useCallback((optionId: string) => {
    dispatch({
      type: 'SELECT_OPTION',
      payload: { questionIndex: state.navigation.currentIndex, optionId },
    });
  }, [state.navigation.currentIndex]);

  const markForReview = useCallback(() => {
    dispatch({ type: 'MARK_FOR_REVIEW', payload: { questionIndex: state.navigation.currentIndex } });
  }, [state.navigation.currentIndex]);

  const unmarkQuestion = useCallback(() => {
    dispatch({ type: 'UNMARK_QUESTION', payload: { questionIndex: state.navigation.currentIndex } });
  }, [state.navigation.currentIndex]);

  const skipQuestion = useCallback(() => {
    dispatch({ type: 'SKIP_QUESTION', payload: { questionIndex: state.navigation.currentIndex } });
    if (state.navigation.canGoNext) {
      dispatch({ type: 'NEXT_QUESTION' });
    }
  }, [state.navigation.currentIndex, state.navigation.canGoNext]);

  const clearAnswer = useCallback(() => {
    dispatch({ type: 'CLEAR_ANSWER', payload: { questionIndex: state.navigation.currentIndex } });
  }, [state.navigation.currentIndex]);

  const nextQuestion = useCallback(() => {
    dispatch({ type: 'NEXT_QUESTION' });
  }, []);

  const previousQuestion = useCallback(() => {
    dispatch({ type: 'PREVIOUS_QUESTION' });
  }, []);

  const goToQuestion = useCallback((index: number) => {
    dispatch({ type: 'GO_TO_QUESTION', payload: { index } });
  }, []);

  const pauseQuiz = useCallback(() => {
    dispatch({ type: 'PAUSE_QUIZ' });
  }, []);

  const resumeQuiz = useCallback(() => {
    dispatch({ type: 'RESUME_QUIZ' });
  }, []);

  const submitQuiz = useCallback(() => {
    dispatch({ type: 'SUBMIT_QUIZ' });
    
    // Save analytics data after submission
    if (state.session) {
      saveQuizAnalytics(state.session);
    }
  }, [state.session]);

  return {
    // State
    session: state.session,
    navigation: state.navigation,
    timer: state.timer,
    isLoading: state.isLoading,
    error: state.error,
    
    // Current question
    currentQuestion: state.session?.questions[state.navigation.currentIndex],
    
    // Actions
    startQuiz,
    selectOption,
    markForReview,
    unmarkQuestion,
    skipQuestion,
    clearAnswer,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    pauseQuiz,
    resumeQuiz,
    submitQuiz,
  };
}
