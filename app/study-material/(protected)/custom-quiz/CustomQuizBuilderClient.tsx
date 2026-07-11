'use client';

import React, { useState, useEffect, useRef } from 'react';
import { QuizQuestion } from '@/lib/types';
import { QuizPanel } from '@/components/quiz/QuizPanel';
import { Loader2, Zap, Database, Terminal, X, ChevronRight, Activity } from 'lucide-react';
import { MathJaxContext } from 'better-react-mathjax';
import { QuizTreeItem } from '@/utils/studyMaterialParser';
import { useRouter } from 'next/navigation';
import { useFullscreen } from '@/lib/fullscreen-context';
import { motion, AnimatePresence } from 'framer-motion';

import { CyberBackground } from '@/components/study-material/custom-quiz/CyberBackground';
import { CyberViewerWrapper } from '@/components/study-material/custom-quiz/CyberViewerWrapper';

interface Props {
  quizTree: QuizTreeItem[];
}

export default function CustomQuizBuilderClient({ quizTree }: Props) {
  const router = useRouter();
  
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  
  const [questionCount, setQuestionCount] = useState<number>(25);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<{ id: string, title: string, questions: QuizQuestion[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isQuizComplete, setIsQuizComplete] = useState(false);

  // Live tech-jargon for the right panel
  const [logs, setLogs] = useState<string[]>([
    "INITIALIZING SYSTEM...",
    "ESTABLISHING NEURAL LINK...",
    "DATA FORGE STANDBY."
  ]);

  useEffect(() => {
    if (activeQuiz || isGenerating) return;
    const interval = setInterval(() => {
      const messages = [
        "Scanning grid...",
        `Memory optimized: ${Math.floor(Math.random() * 90 + 10)}%`,
        `Nodes active: ${selectedPaths.size}`,
        "Awaiting input...",
        `Entropy: 0.${Math.floor(Math.random() * 9999)}`,
        "Syncing remote datasets...",
      ];
      setLogs(prev => {
        const next = [...prev, messages[Math.floor(Math.random() * messages.length)]];
        if (next.length > 8) next.shift();
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [selectedPaths.size, activeQuiz, isGenerating]);

  const addLog = (msg: string) => {
    setLogs(prev => {
      const next = [...prev, msg];
      if (next.length > 8) next.shift();
      return next;
    });
  };

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

  const areAllDescendantsSelected = (node: QuizTreeItem): boolean => {
    if (!node.children || node.children.length === 0) return false;
    const allDescendants = getAllPaths(node).slice(1);
    return allDescendants.every(p => selectedPaths.has(p));
  };

  const toggleSelection = (node: QuizTreeItem) => {
    const newSelected = new Set(selectedPaths);
    const allPaths = getAllPaths(node);
    
    if (newSelected.has(node.path) || areAllDescendantsSelected(node)) {
      allPaths.forEach(p => newSelected.delete(p));
      let current = node.path;
      while (current.includes('/')) {
        current = current.substring(0, current.lastIndexOf('/'));
        newSelected.delete(current);
      }
      addLog(`NODE_DISENGAGED: ${node.title}`);
    } else {
      allPaths.forEach(p => newSelected.add(p));
      addLog(`NODE_LOCKED: ${node.title}`);
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
      <div className={`relative ${level > 0 ? 'ml-6 mt-2' : ''}`}>
        
        {/* SVG connection lines for children */}
        {level > 0 && (
          <div className="absolute top-0 bottom-0 left-[-16px] w-[2px] bg-[#00F0FF]/10 z-0">
            <motion.div 
              className="w-full bg-[#00F0FF]"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: '100%', opacity: 1 }}
              transition={{ duration: 0.5, ease: 'linear' }}
            />
          </div>
        )}

        <div className="space-y-2 relative z-10">
          {nodes.map((node, index) => {
            const hasChildren = node.children && node.children.length > 0;
            const isExpanded = expandedPaths.has(node.path);
            const checked = isSelected(node) || (hasChildren && areAllDescendantsSelected(node));

            return (
              <div key={node.path} className="relative">
                
                {/* Horizontal connection line to this node */}
                {level > 0 && (
                  <div className="absolute top-[18px] left-[-16px] w-[16px] h-[2px] bg-[#00F0FF]/10">
                    <motion.div 
                      className="h-full bg-[#00F0FF]"
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: '100%', opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    />
                  </div>
                )}

                <div className="flex items-center group">
                  {hasChildren ? (
                    <button 
                      onClick={() => toggleExpand(node.path)}
                      className="p-1 mr-2 text-[#00F0FF]/50 hover:text-[#00F0FF] rounded bg-[#00F0FF]/5 hover:bg-[#00F0FF]/20 border border-[#00F0FF]/20 hover:border-[#00F0FF] transition-all"
                    >
                      <motion.div animate={{ rotate: isExpanded ? 90 : 0 }}>
                        <ChevronRight className="w-4 h-4" />
                      </motion.div>
                    </button>
                  ) : (
                    <div className="w-8 mr-2" /> // spacer
                  )}
                  
                  <button 
                    onClick={() => toggleSelection(node)}
                    className={`
                      flex items-center gap-3 py-2 px-4 flex-1 rounded-sm border transition-all duration-300
                      ${checked 
                        ? 'bg-[#00F0FF]/10 border-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.2)]' 
                        : 'bg-[#050B14]/50 border-[#00F0FF]/20 hover:border-[#00F0FF]/50 hover:bg-[#00F0FF]/5'
                      }
                    `}
                  >
                    <div className={`
                      w-3 h-3 rounded-full border flex items-center justify-center transition-all duration-300
                      ${checked ? 'border-[#00F0FF] bg-[#00F0FF] shadow-[0_0_10px_#00F0FF]' : 'border-[#00F0FF]/50 bg-transparent'}
                    `} />
                    <span className={`font-mono text-sm tracking-wider uppercase transition-colors duration-300 ${checked ? 'text-[#00F0FF] text-shadow-neon' : 'text-[#80D8FF]'}`}>
                      {node.title}
                    </span>
                  </button>
                </div>
                
                <AnimatePresence>
                  {hasChildren && isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      {renderTree(node.children!, level + 1)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setIsQuizComplete(false);
    
    addLog("INITIATING CORE SYNTHESIS...");
    
    try {
      const subjects = Array.from(selectedPaths);
      
      const response = await fetch('/api/study-material/quiz/generate', {
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
        throw new Error('No questions found in the selected topics.');
      }

      // Fake delay for dramatic effect
      await new Promise(res => setTimeout(res, 1500));
      
      addLog("SYNTHESIS COMPLETE.");
      setActiveQuiz(data);
    } catch (err: any) {
      setError(err.message);
      addLog(`ERROR: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const { enterFullscreen, exitFullscreen } = useFullscreen();

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

  return (
    <MathJaxContext config={{ options: { enableMenu: false } }}>
      <div className="min-h-screen bg-[#050B14] flex flex-col items-center relative overflow-hidden font-mono text-[#E0F8FF] selection:bg-[#00F0FF]/30">
        
        {/* Animated Background */}
        <CyberBackground />

        {/* Radar Scanner Effect */}
        <motion.div 
          animate={{ top: ['-20%', '120%'] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          className="absolute left-0 right-0 h-[20vh] bg-gradient-to-b from-transparent via-[#00F0FF]/5 to-transparent pointer-events-none z-10"
        />

        {/* Main Content */}
        <div className="relative z-20 w-full h-full flex flex-col items-center">
          
          {activeQuiz ? (
            /* Quiz Session View wrapped in CyberViewerWrapper */
            <div className={`w-[95%] h-full max-w-none ${isQuizComplete ? 'pb-8 md:pb-12' : 'py-4 md:py-8'} animate-in fade-in zoom-in-95 duration-500 flex flex-col`}>
              <div className="mb-4 flex items-center justify-between shrink-0 p-4 border border-[#00F0FF]/30 bg-[#050B14]/80 backdrop-blur-md shadow-[0_0_20px_rgba(0,240,255,0.1)]">
                <div>
                  <h2 className="text-xl font-bold text-[#00F0FF] uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    {activeQuiz.title}
                  </h2>
                  <p className="text-sm text-[#80D8FF] mt-1 font-mono">
                    SYNTHESIZED_NODES: {activeQuiz.questions.length} | STATUS: ACTIVE
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveQuiz(null);
                    setIsQuizComplete(false);
                    exitFullscreen();
                  }}
                  className="group flex items-center gap-2 text-sm px-4 py-2 border border-[#00F0FF]/50 text-[#00F0FF] hover:bg-[#00F0FF]/10 transition-all uppercase tracking-widest"
                >
                  <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                  {isQuizComplete ? 'TERMINATE_SESSION' : 'ABORT'}
                </button>
              </div>
              
              <div className="flex-1 min-h-0 bg-[#050B14]/80 backdrop-blur-xl border border-[#00F0FF]/30 p-2 shadow-[inset_0_0_30px_rgba(0,240,255,0.05)] overflow-hidden">
                <CyberViewerWrapper>
                  <QuizPanel 
                    questions={activeQuiz.questions} 
                    topicId={`custom-quiz-${activeQuiz.id}`}
                    onComplete={() => setIsQuizComplete(true)}
                  />
                </CyberViewerWrapper>
              </div>
            </div>
          ) : (
            /* Command Center Configuration View */
            <div className="w-full max-w-7xl px-4 py-12 md:py-24 animate-in fade-in duration-1000 flex flex-col md:flex-row gap-8">
              
              {/* Left Column: Visual Node Map (Tree) */}
              <div className="flex-1 bg-[#0A1628]/80 backdrop-blur-xl border border-[#00F0FF]/30 shadow-[0_0_30px_rgba(0,240,255,0.1)] p-6 md:p-8 rounded-sm relative overflow-hidden flex flex-col">
                
                {/* Panel Decorative Corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#00F0FF]" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#00F0FF]" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#00F0FF]" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#00F0FF]" />

                <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#00F0FF]/20">
                  <h3 className="text-2xl font-black text-[#00F0FF] uppercase tracking-widest flex items-center gap-3 drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">
                    <Database className="w-6 h-6" />
                    Neural Node Map
                  </h3>
                  <button 
                    onClick={() => {
                      setSelectedPaths(new Set());
                      addLog("SYSTEM PURGE INITIATED.");
                    }}
                    className="text-xs font-bold text-[#80D8FF] hover:text-[#00F0FF] border border-[#00F0FF]/30 px-3 py-1 hover:bg-[#00F0FF]/10 transition-colors uppercase tracking-widest"
                  >
                    Purge All
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                  {renderTree(quizTree)}
                  {quizTree.length === 0 && (
                    <div className="flex items-center justify-center py-20 text-[#00F0FF] gap-3">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>ESTABLISHING CONNECTION...</span>
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-[#50C8FF] mt-6 flex items-center gap-2 uppercase tracking-widest border-t border-[#00F0FF]/20 pt-4">
                  <span className="w-2 h-2 bg-[#00F0FF] shadow-[0_0_5px_#00F0FF] animate-pulse"></span>
                  Leave unselected for global synthesis
                </p>
              </div>

              {/* Right Column: Configuration & Status */}
              <div className="w-full md:w-96 flex flex-col gap-8">
                
                {/* Header/Exit */}
                <div className="flex justify-end">
                  <button 
                    onClick={() => router.push('/study-material')}
                    className="group flex items-center gap-2 text-xs font-bold border border-red-500/50 text-red-500 hover:bg-red-500/10 px-4 py-2 transition-colors uppercase tracking-widest"
                  >
                    <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                    Disconnect
                  </button>
                </div>

                {/* System Diagnostics Terminal */}
                <div className="bg-[#050B14]/90 backdrop-blur-md border border-[#00F0FF]/30 p-4 h-48 overflow-hidden relative shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00F0FF]/50 to-transparent" />
                  <h4 className="text-[#00F0FF] text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2 opacity-50">
                    <Terminal className="w-3 h-3" />
                    Sys_Logs
                  </h4>
                  <div className="space-y-1 text-xs font-mono">
                    {logs.map((log, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-[#80D8FF]"
                      >
                        <span className="text-[#00F0FF]/50 mr-2">❯</span>{log}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Quantum Reactor Gauge (Slider) */}
                <div className="bg-[#0A1628]/80 backdrop-blur-xl border border-[#00F0FF]/30 p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)]">
                  <h3 className="text-sm font-bold text-[#00F0FF] uppercase tracking-widest mb-6 flex items-center justify-between">
                    <span>Reactor Output</span>
                    <span className="text-2xl font-black text-[#00F0FF] drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]">
                      {questionCount}
                    </span>
                  </h3>
                  
                  <div className="relative pt-4 pb-2">
                    {/* Custom Range Track */}
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#00F0FF]/20 -translate-y-1/2 rounded-full overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 bottom-0 bg-[#00F0FF] shadow-[0_0_10px_#00F0FF]"
                        style={{ width: `${((questionCount - 10) / (200 - 10)) * 100}%` }}
                      />
                    </div>
                    
                    <input 
                      type="range" 
                      min={10} 
                      max={200} 
                      step={5}
                      value={questionCount}
                      onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                      className="w-full relative z-10 opacity-0 cursor-pointer"
                    />
                    
                    {/* Custom Thumb Element (follows range value) */}
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-8 bg-[#00F0FF] border-2 border-white shadow-[0_0_15px_#00F0FF] pointer-events-none transition-transform"
                      style={{ 
                        left: `calc(${((questionCount - 10) / (200 - 10)) * 100}% - 8px)`,
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-[1px] h-4 bg-black/50" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-[10px] text-[#50C8FF] mt-2 uppercase tracking-widest font-bold">
                    <span>10 Min</span>
                    <span>200 Max</span>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-900/40 border border-red-500/50 text-red-400 text-xs font-mono uppercase tracking-widest flex items-start gap-2 animate-pulse">
                    <X className="w-4 h-4 shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                {/* Master Generate Button */}
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="group relative w-full h-20 bg-[#00F0FF]/10 border-2 border-[#00F0FF] hover:bg-[#00F0FF]/20 transition-all overflow-hidden shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:shadow-[0_0_40px_rgba(0,240,255,0.6)] disabled:opacity-50 disabled:pointer-events-none"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,240,255,0.1)_50%,transparent_75%)] bg-[length:10px_10px] opacity-50 group-hover:animate-pulse" />
                  
                  <div className="relative z-10 flex items-center justify-center gap-3 w-full h-full">
                    {isGenerating ? (
                      <Loader2 className="w-8 h-8 text-[#00F0FF] animate-spin" />
                    ) : (
                      <Zap className="w-8 h-8 text-[#00F0FF] group-hover:scale-110 transition-transform" />
                    )}
                    <span className="text-xl font-black text-[#00F0FF] uppercase tracking-[0.2em] drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">
                      {isGenerating ? 'Synthesizing...' : 'Engage'}
                    </span>
                  </div>

                  {/* Scanline hover effect */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-white opacity-0 group-hover:opacity-100 group-hover:animate-scanline" />
                </button>
                
              </div>
            </div>
          )}
        </div>
      </div>
    </MathJaxContext>
  );
}
