'use client';

import React, { useState, useMemo } from 'react';
import { QuizQuestion } from '@/lib/types';
import { QuizPanel } from '@/components/quiz/QuizPanel';
import { Loader2, PlayCircle, BookOpen, Settings2, ChevronDown, ChevronRight, X } from 'lucide-react';
import { MathJaxContext } from 'better-react-mathjax';
import { QuizTreeItem } from '@/utils/kdMethodParser';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFullscreen } from '@/lib/fullscreen-context';

interface Props {
  quizTree: QuizTreeItem[];
}

export default function CustomQuizBuilderClient({ quizTree }: Props) {
  const router = useRouter();
  
  // Track selected paths. If a parent is selected, it implies all children are selected.
  // Actually, standard practice for tree checkboxes:
  // We keep a Set of exact selected paths.
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  
  const [questionCount, setQuestionCount] = useState<number>(25);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<{ id: string, title: string, questions: QuizQuestion[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isQuizComplete, setIsQuizComplete] = useState(false);

  // ... (keep helper methods the same)
  // Helper to get all descendant paths of a node (including the node itself)
  const getAllPaths = (node: QuizTreeItem): string[] => {
    let paths = [node.path];
    if (node.children) {
      node.children.forEach(child => {
        paths = [...paths, ...getAllPaths(child)];
      });
    }
    return paths;
  };

  const isSelected = (node: QuizTreeItem): boolean => {
    return selectedPaths.has(node.path);
  };

  const isIndeterminate = (node: QuizTreeItem): boolean => {
    if (isSelected(node) || !node.children || node.children.length === 0) return false;
    const allDescendants = getAllPaths(node).slice(1); // excluding self
    const selectedDescendants = allDescendants.filter(p => selectedPaths.has(p));
    return selectedDescendants.length > 0 && selectedDescendants.length < allDescendants.length;
  };

  const areAllDescendantsSelected = (node: QuizTreeItem): boolean => {
    if (!node.children || node.children.length === 0) return false;
    const allDescendants = getAllPaths(node).slice(1);
    return allDescendants.every(p => selectedPaths.has(p));
  };

  const toggleSelection = (node: QuizTreeItem) => {
    const newSelected = new Set(selectedPaths);
    const allPaths = getAllPaths(node);
    
    // If it's already selected (or all descendants are selected), unselect all
    if (newSelected.has(node.path) || areAllDescendantsSelected(node)) {
      allPaths.forEach(p => newSelected.delete(p));
      
      // Also unselect all ancestors because they are no longer fully selected
      let current = node.path;
      while (current.includes('/')) {
        current = current.substring(0, current.lastIndexOf('/'));
        newSelected.delete(current);
      }
    } else {
      // Select this node and all descendants
      allPaths.forEach(p => newSelected.add(p));
    }
    
    setSelectedPaths(newSelected);
  };

  const toggleExpand = (path: string) => {
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedPaths(newExpanded);
  };

  const renderTree = (nodes: QuizTreeItem[], level: number = 0) => {
    return (
      <div className={`space-y-1 ${level > 0 ? 'ml-6 mt-1 border-l-2 border-gray-100 dark:border-gray-800 pl-4' : ''}`}>
        {nodes.map(node => {
          const hasChildren = node.children && node.children.length > 0;
          const isExpanded = expandedPaths.has(node.path);
          const checked = isSelected(node) || (hasChildren && areAllDescendantsSelected(node));
          const indeterminate = isIndeterminate(node);

          return (
            <div key={node.path}>
              <div className="flex items-center group">
                {hasChildren ? (
                  <button 
                    onClick={() => toggleExpand(node.path)}
                    className="p-1 text-gray-400 hover:text-emerald-500 rounded transition-colors"
                  >
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                ) : (
                  <div className="w-6" /> // spacer
                )}
                
                <label className="flex items-center gap-3 py-2 cursor-pointer flex-1 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50 px-2 transition-colors">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox"
                      className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 cursor-pointer"
                      checked={checked}
                      onChange={() => toggleSelection(node)}
                      ref={input => {
                        if (input) input.indeterminate = indeterminate;
                      }}
                    />
                  </div>
                  <span className={`font-medium ${level === 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {node.title}
                  </span>
                </label>
              </div>
              
              {hasChildren && isExpanded && (
                <div>{renderTree(node.children!, level + 1)}</div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setIsQuizComplete(false);
    try {
      const subjects = Array.from(selectedPaths);
      
      const response = await fetch('/api/kd-method/quiz/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paths: subjects,
          questionCount: questionCount
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quiz');
      }

      if (data.questions.length === 0) {
        throw new Error('No questions found in the selected topics. Try selecting more topics.');
      }

      setActiveQuiz(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const { enterFullscreen, exitFullscreen } = useFullscreen();

  // Enter fullscreen mode when activeQuiz is set (hide header/footer)
  React.useEffect(() => {
    if (activeQuiz && !isQuizComplete) {
      document.documentElement.setAttribute('data-page-type', 'notes');
      enterFullscreen();
    } else {
      document.documentElement.removeAttribute('data-page-type');
      exitFullscreen();
    }
    
    return () => {
      document.documentElement.removeAttribute('data-page-type');
      exitFullscreen();
    };
  }, [activeQuiz, isQuizComplete, enterFullscreen, exitFullscreen]);

  const mathJaxConfig = {
    options: {
      enableMenu: false,
    }
  };

  return (
    <MathJaxContext config={mathJaxConfig}>
      {/* We don't use fixed inset-0 here because main is relative z-0 and it traps the stacking context.
          Instead, we just use a normal full-page layout. The header/footer are hidden via data-page-type. */}
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center">
        
        {/* Quiz Session View */}
        {activeQuiz ? (
          <div className={`w-[95%] h-full max-w-none ${isQuizComplete ? 'pt-24 pb-8 md:pt-32 md:pb-12' : 'py-4 md:py-8'} animate-in fade-in slide-in-from-bottom-8 duration-500 flex flex-col`}>
            <div className="mb-6 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{activeQuiz.title}</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  A custom quiz generated with {activeQuiz.questions.length} questions.
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveQuiz(null);
                  setIsQuizComplete(false);
                  exitFullscreen();
                }}
                className="text-sm px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-gray-900 shadow-sm"
              >
                ← {isQuizComplete ? 'Back to Quiz Builder' : 'Exit Quiz'}
              </button>
            </div>
            
            <div className="flex-1 min-h-0">
              <QuizPanel 
                questions={activeQuiz.questions} 
                topicId={`custom-quiz-${activeQuiz.id}`}
                onComplete={() => setIsQuizComplete(true)}
              />
            </div>
          </div>
        ) : (
          /* Builder Configuration View */
          <div className="w-full max-w-4xl px-4 pt-24 pb-8 md:pt-32 animate-in fade-in slide-in-from-bottom-8 duration-500">
            
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">
                  Custom Quiz Builder
                </h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-2xl">
                  Build your own all-in-one quiz. Select the exact chapters and topics you want to include, choose the number of questions, and generate a randomized test.
                </p>
              </div>
              <button 
                onClick={() => router.push('/kd-method')}
                className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                title="Close Builder"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-white dark:bg-gray-900/50 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 md:p-8">
              
              {/* Tree Selector */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-emerald-500" />
                    1. Select Topics
                  </h3>
                  <button 
                    onClick={() => setSelectedPaths(new Set())}
                    className="text-sm font-medium text-gray-500 hover:text-emerald-500 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-4 md:p-6 max-h-[40vh] overflow-y-auto">
                  {renderTree(quizTree)}
                  {quizTree.length === 0 && (
                    <p className="text-gray-500 text-center py-4">Loading topics...</p>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  Leave all unchecked to include questions from the entire KD-Method.
                </p>
              </div>

              {/* Slider */}
              <div className="mb-10">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Settings2 className="w-6 h-6 text-emerald-500" />
                  2. Number of Questions
                </h3>
                <div className="max-w-md bg-gray-50 dark:bg-gray-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Target Count</span>
                    <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{questionCount}</span>
                  </div>
                  <input 
                    type="range" 
                    min={10} 
                    max={200} 
                    step={5}
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-emerald-500"
                  />
                  <div className="flex justify-between text-xs font-medium text-gray-400 mt-3">
                    <span>10</span>
                    <span>200 max</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800 text-sm font-medium flex items-center gap-2">
                  <X className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}

              {/* Generate Button */}
              <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full md:w-auto flex items-center justify-center gap-3 py-4 px-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {isGenerating ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <PlayCircle className="w-6 h-6" />
                  )}
                  {isGenerating ? 'Generating Quiz...' : 'Generate & Start Quiz'}
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </MathJaxContext>
  );
}
