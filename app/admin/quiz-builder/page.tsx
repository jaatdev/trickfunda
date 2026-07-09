"use client";

import React, { useState } from 'react';
import { Plus, Trash2, Save, Upload, Code2, LayoutList, ChevronDown, ChevronUp } from 'lucide-react';
import { QuizQuestion } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuizBuilderPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual');
  const [rawJson, setRawJson] = useState('[]');
  
  const handleAddQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: crypto.randomUUID(),
      question: "New Question Text",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correct_answer: "Option A",
      explanation: "Explanation goes here",
      layout_type: "default"
    };
    setQuestions([...questions, newQuestion]);
    setExpandedIndex(questions.length);
  };

  const handleUpdateQuestion = (index: number, updates: Partial<QuizQuestion>) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], ...updates };
    setQuestions(newQuestions);
  };

  const handleUpdateOption = (qIndex: number, optIndex: number, value: string) => {
    const newQuestions = [...questions];
    const newOptions = [...newQuestions[qIndex].options];
    newOptions[optIndex] = value;
    newQuestions[qIndex].options = newOptions;
    
    // Update correct answer if it matched the old option
    if (newQuestions[qIndex].correct_answer === questions[qIndex].options[optIndex]) {
      newQuestions[qIndex].correct_answer = value;
    }
    
    setQuestions(newQuestions);
  };

  const handleDeleteQuestion = (index: number) => {
    if (!confirm('Delete this question?')) return;
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
    if (expandedIndex === index) setExpandedIndex(null);
  };

  const syncToCode = () => setRawJson(JSON.stringify(questions, null, 2));
  const syncToVisual = () => {
    try {
      const parsed = JSON.parse(rawJson);
      if (Array.isArray(parsed)) {
        setQuestions(parsed);
        setViewMode('visual');
      } else {
        alert("Root must be a JSON array.");
      }
    } catch (e) {
      alert("Invalid JSON format");
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Quiz Builder
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Construct complex quiz JSON files visually.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 dark:bg-white/5 p-1 rounded-xl flex items-center">
            <button
              onClick={() => { setViewMode('visual'); syncToVisual(); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'visual' ? 'bg-white dark:bg-white/10 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <LayoutList className="w-4 h-4" />
              Visual
            </button>
            <button
              onClick={() => { setViewMode('code'); syncToCode(); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'code' ? 'bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Code2 className="w-4 h-4" />
              Code
            </button>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-500/20">
            <Save className="w-4 h-4" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {viewMode === 'code' ? (
          <div className="flex-1 flex flex-col">
            <div className="p-4 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/5 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Edit JSON directly</span>
              <button onClick={syncToVisual} className="text-sm text-blue-500 hover:underline">Apply to Visual Editor</button>
            </div>
            <textarea
              value={rawJson}
              onChange={(e) => setRawJson(e.target.value)}
              className="flex-1 w-full p-6 bg-[#1e1e1e] text-gray-200 font-mono text-sm leading-relaxed focus:outline-none resize-none"
              spellCheck={false}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 bg-gray-50/50 dark:bg-black/20">
            
            {questions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4">
                  <LayoutList className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Questions Yet</h3>
                <p className="text-gray-500 max-w-sm mb-6">Start building your quiz by adding your first question, or switch to Code view to paste an existing JSON array.</p>
                <button
                  onClick={handleAddQuestion}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-500/20"
                >
                  <Plus className="w-5 h-5" />
                  Add First Question
                </button>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-4 pb-24">
                {questions.map((q, index) => (
                  <div key={q.id || index} className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm transition-all hover:border-emerald-500/30">
                    {/* Question Header */}
                    <button
                      onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5"
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                          Q{index + 1}
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
                          {q.question.replace(/<[^>]+>/g, '') || "Empty Question"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div onClick={(e) => { e.stopPropagation(); handleDeleteQuestion(index); }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </div>
                        {expandedIndex === index ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                      </div>
                    </button>

                    {/* Question Body */}
                    <AnimatePresence>
                      {expandedIndex === index && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-6 space-y-6">
                            
                            {/* Question Text */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Question Text (HTML/MathJax Supported)
                              </label>
                              <textarea
                                value={q.question}
                                onChange={(e) => handleUpdateQuestion(index, { question: e.target.value })}
                                className="w-full p-4 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all min-h-[100px]"
                              />
                            </div>

                            {/* Options */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Options
                              </label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {q.options.map((opt, optIndex) => (
                                  <div key={optIndex} className={`flex items-center gap-3 p-2 rounded-xl border ${q.correct_answer === opt ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/50'}`}>
                                    <input
                                      type="radio"
                                      name={`correct-${index}`}
                                      checked={q.correct_answer === opt}
                                      onChange={() => handleUpdateQuestion(index, { correct_answer: opt })}
                                      className="w-4 h-4 text-emerald-500 focus:ring-emerald-500 ml-2"
                                    />
                                    <input
                                      type="text"
                                      value={opt}
                                      onChange={(e) => handleUpdateOption(index, optIndex, e.target.value)}
                                      className="flex-1 bg-transparent border-none focus:ring-0 outline-none p-2 text-sm"
                                      placeholder={`Option ${optIndex + 1}`}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Explanation */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Explanation
                              </label>
                              <textarea
                                value={q.explanation}
                                onChange={(e) => handleUpdateQuestion(index, { explanation: e.target.value })}
                                className="w-full p-4 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all min-h-[80px]"
                              />
                            </div>
                            
                            {/* Layout Settings */}
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Layout Type</label>
                                <select 
                                  value={q.layout_type || 'default'}
                                  onChange={(e) => handleUpdateQuestion(index, { layout_type: e.target.value as any })}
                                  className="w-full p-2.5 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-lg outline-none text-sm"
                                >
                                  <option value="default">Default</option>
                                  <option value="dice">Dice Visualization</option>
                                  <option value="geometry">Geometry SVG</option>
                                </select>
                              </div>
                            </div>

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                <button
                  onClick={handleAddQuestion}
                  className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-white/10 hover:border-emerald-500 dark:hover:border-emerald-500 text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors group bg-white/50 dark:bg-black/20 hover:bg-emerald-50 dark:hover:bg-emerald-500/5"
                >
                  <Plus className="w-6 h-6" />
                  <span className="font-medium">Add Another Question</span>
                </button>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
