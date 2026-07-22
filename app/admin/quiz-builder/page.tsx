"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileJson, Folder, ChevronRight, Download, Upload, Save,
  Plus, Trash2, Check, Eye, Code, ChevronDown, ChevronUp,
  Link as LinkIcon, RefreshCw, X, File, AlertCircle, PlayCircle, Loader2, FileText
} from 'lucide-react';
import { QuizQuestion } from '@/lib/types';

// Utility to generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 9);

type FsItem = {
  name: string;
  isDirectory: boolean;
  path: string;
  type?: string;
  size?: number;
  mtime?: string;
};

export default function QuizBuilderPage() {
  // State
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [filePath, setFilePath] = useState<string>('');
  const [viewMode, setViewMode] = useState<'visual' | 'json'>('visual');
  const [rawJson, setRawJson] = useState<string>('[]');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  // Status State
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals State
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [isGDriveModalOpen, setIsGDriveModalOpen] = useState(false);

  // File Browser State
  const [fsItems, setFsItems] = useState<FsItem[]>([]);
  const [currentFsPath, setCurrentFsPath] = useState<string>('');
  const [isFsLoading, setIsFsLoading] = useState(false);

  // GDrive State
  const [gdriveUrl, setGdriveUrl] = useState('');
  const [isGDriveLoading, setIsGDriveLoading] = useState(false);

  // Paste JSON State
  const [pasteContent, setPasteContent] = useState('');

  // Derived Stats
  const stats = {
    total: questions.length,
    easy: questions.filter(q => q.difficulty === 'easy').length,
    medium: questions.filter(q => q.difficulty === 'medium').length,
    hard: questions.filter(q => q.difficulty === 'hard').length,
  };

  const showNotification = (msg: string, type: 'error' | 'success' = 'success') => {
    if (type === 'error') setError(msg);
    else setSuccessMsg(msg);
    setTimeout(() => {
      setError(null);
      setSuccessMsg(null);
    }, 4000);
  };

  // Switch between Visual & JSON modes
  const handleViewToggle = (mode: 'visual' | 'json') => {
    if (mode === 'json') {
      setRawJson(JSON.stringify(questions, null, 2));
    } else {
      try {
        const parsed = JSON.parse(rawJson);
        if (Array.isArray(parsed)) {
          setQuestions(parsed);
        } else {
          showNotification('Invalid JSON: Must be an array of questions', 'error');
          return;
        }
      } catch (err) {
        showNotification('Invalid JSON format', 'error');
        return;
      }
    }
    setViewMode(mode);
  };

  // --- API Integrations ---

  const loadFileBrowser = async (path: string = '') => {
    setIsFsLoading(true);
    try {
      const res = await fetch('/api/admin/fs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'readDir', path, rootDir: 'root' })
      });
      const data = await res.json();
      if (data.items) {
        setFsItems(data.items);
        setCurrentFsPath(data.currentPath || path);
      } else {
        throw new Error(data.error || 'Failed to load directory');
      }
    } catch (err: any) {
      showNotification(err.message, 'error');
    } finally {
      setIsFsLoading(false);
    }
  };

  const loadQuizFile = async (path: string) => {
    if (!path) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/fs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'readFile', path, rootDir: 'root' })
      });
      const data = await res.json();
      if (data.content) {
        const parsed = JSON.parse(data.content);
        if (Array.isArray(parsed)) {
          setQuestions(parsed);
          setFilePath(path);
          if (viewMode === 'json') setRawJson(JSON.stringify(parsed, null, 2));
          showNotification('File loaded successfully');
        } else {
          throw new Error('File content is not an array of questions');
        }
      } else {
        throw new Error(data.error || 'Failed to read file');
      }
    } catch (err: any) {
      showNotification(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const saveQuizFile = async () => {
    if (!filePath) {
      showNotification('Please specify a file path', 'error');
      return;
    }
    setIsSaving(true);
    
    // Sync JSON -> Visual if we are in JSON mode before saving
    let qsToSave = questions;
    if (viewMode === 'json') {
      try {
        qsToSave = JSON.parse(rawJson);
      } catch (e) {
        showNotification('Cannot save: Invalid JSON format', 'error');
        setIsSaving(false);
        return;
      }
    }

    try {
      const res = await fetch('/api/admin/fs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'writeFile', 
          path: filePath, 
          content: JSON.stringify(qsToSave, null, 2),
          rootDir: 'root' 
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotification('File saved successfully!');
      } else {
        throw new Error(data.error || 'Failed to save file');
      }
    } catch (err: any) {
      showNotification(err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const importFromGDrive = async () => {
    if (!gdriveUrl) return;
    setIsGDriveLoading(true);
    try {
      // Extract File ID from standard Drive URL
      const match = gdriveUrl.match(/[-\w]{25,}/);
      const fileId = match ? match[0] : gdriveUrl;

      const res = await fetch('/api/admin/gdrive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'preview', fileId })
      });
      const data = await res.json();
      
      if (data.content) {
        const parsed = JSON.parse(data.content);
        if (Array.isArray(parsed)) {
          setQuestions(parsed);
          if (viewMode === 'json') setRawJson(JSON.stringify(parsed, null, 2));
          setIsGDriveModalOpen(false);
          setGdriveUrl('');
          showNotification('Questions imported from Google Drive');
        } else {
          throw new Error('GDrive file is not a valid JSON array');
        }
      } else {
        throw new Error(data.error || 'Failed to fetch from Google Drive');
      }
    } catch (err: any) {
      showNotification(err.message, 'error');
    } finally {
      setIsGDriveLoading(false);
    }
  };

  const handlePasteImport = () => {
    try {
      const parsed = JSON.parse(pasteContent);
      if (Array.isArray(parsed)) {
        setQuestions(parsed);
        if (viewMode === 'json') setRawJson(JSON.stringify(parsed, null, 2));
        setIsPasteModalOpen(false);
        setPasteContent('');
        showNotification('JSON imported successfully');
      } else {
        throw new Error('Must be a JSON array');
      }
    } catch (err: any) {
      showNotification('Invalid JSON: ' + err.message, 'error');
    }
  };

  const exportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(questions, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    const fileName = filePath ? filePath.split('/').pop() || 'quiz.json' : 'quiz.json';
    downloadAnchorNode.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // --- Question Manipulation ---

  const addQuestion = () => {
    const newQ: QuizQuestion = {
      id: generateId(),
      prompt: '',
      options: ['', '', '', ''],
      answerIndex: 0,
      reason: '',
      difficulty: 'medium',
      tags: []
    };
    setQuestions([...questions, newQ]);
    setExpandedQuestionId(newQ.id);
  };

  const updateQuestion = (id: string, field: keyof QuizQuestion, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const updateOption = (id: string, index: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        const newOptions = [...q.options];
        newOptions[index] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const deleteQuestion = (id: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      setQuestions(questions.filter(q => q.id !== id));
      if (expandedQuestionId === id) setExpandedQuestionId(null);
    }
  };

  const getDifficultyColor = (diff?: string) => {
    switch (diff) {
      case 'easy': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'hard': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 p-6 pt-8 pb-24 font-sans selection:bg-emerald-500/30">
      
      {/* Top Notifications */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-red-100 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-2 rounded-xl shadow-lg backdrop-blur-md"
          >
            <AlertCircle size={18} />
            <span className="text-sm font-medium">{error}</span>
          </motion.div>
        )}
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-4 py-2 rounded-xl shadow-lg backdrop-blur-md"
          >
            <Check size={18} />
            <span className="text-sm font-medium">{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header / File Picker Bar */}
        <header className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm p-4 flex flex-col md:flex-row gap-4 justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
          
          <div className="flex-1 w-full flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500">
              <FileJson size={24} />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                Premium Quiz Builder
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <input 
                  type="text"
                  placeholder="e.g. data/quizzes/math.json"
                  value={filePath}
                  onChange={(e) => setFilePath(e.target.value)}
                  className="bg-gray-100 dark:bg-white/5 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-[#1a1a1a] rounded-lg px-3 py-1 text-sm w-full max-w-[300px] outline-none transition-all"
                />
                <button 
                  onClick={() => { setIsBrowserOpen(true); loadFileBrowser(); }}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors border border-gray-200 dark:border-white/5"
                >
                  Browse
                </button>
                <button 
                  onClick={() => loadQuizFile(filePath)}
                  disabled={!filePath || isLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 hover:bg-emerald-200 dark:hover:bg-emerald-500/20 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                  Load
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Stats */}
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-black/50 p-2 rounded-xl border border-gray-100 dark:border-white/5">
              <div className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-white/10 text-xs font-bold">
                {stats.total} Qs
              </div>
              <div className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-bold">
                {stats.easy} E
              </div>
              <div className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-bold">
                {stats.medium} M
              </div>
              <div className="px-3 py-1 rounded-lg bg-red-500/10 text-red-500 text-xs font-bold">
                {stats.hard} H
              </div>
            </div>

            <button 
              onClick={saveQuizFile}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 font-medium transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save File
            </button>
          </div>
        </header>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-white dark:bg-[#111111] p-1.5 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm">
            <button
              onClick={() => setIsGDriveModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.71 3.5L1.15 15l3.43 6l6.55-11.5M9.73 3.5h13.12L16.3 15H3.18M17.45 16.5H4.32l3.43 6h13.12" />
              </svg>
              Drive Import
            </button>
            <div className="w-px h-6 bg-gray-200 dark:bg-white/10"></div>
            <button
              onClick={() => setIsPasteModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              <FileText size={16} />
              Paste JSON
            </button>
            <div className="w-px h-6 bg-gray-200 dark:bg-white/10"></div>
            <button
              onClick={exportJson}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              <Download size={16} />
              Export
            </button>
          </div>

          <div className="flex items-center gap-1 bg-white dark:bg-[#111111] p-1.5 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm">
            <button
              onClick={() => handleViewToggle('visual')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                viewMode === 'visual' 
                ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Eye size={16} /> Visual
            </button>
            <button
              onClick={() => handleViewToggle('json')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                viewMode === 'json' 
                ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Code size={16} /> JSON Code
            </button>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="min-h-[500px]">
          {viewMode === 'json' ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-[#1e1e1e] rounded-2xl border border-gray-800 shadow-xl overflow-hidden h-[600px] flex flex-col"
            >
              <div className="bg-[#2d2d2d] px-4 py-2 border-b border-gray-800 flex items-center justify-between">
                <span className="text-gray-300 text-sm font-mono flex items-center gap-2"><FileJson size={16} /> raw_data.json</span>
              </div>
              <textarea
                value={rawJson}
                onChange={(e) => setRawJson(e.target.value)}
                className="flex-1 w-full bg-transparent text-gray-300 p-4 font-mono text-sm focus:outline-none resize-none leading-relaxed"
                spellCheck="false"
              />
            </motion.div>
          ) : (
            <div className="space-y-4">
              {questions.length === 0 ? (
                <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-4">
                    <Plus size={32} />
                  </div>
                  <h3 className="text-lg font-bold mb-2">No Questions Yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
                    Load a file, import from Google Drive, paste JSON, or start adding questions manually to build your quiz.
                  </p>
                  <button 
                    onClick={addQuestion}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium hover:scale-105 transition-transform"
                  >
                    <Plus size={18} /> Add First Question
                  </button>
                </div>
              ) : (
                <div className="space-y-4 pb-8">
                  <AnimatePresence>
                    {questions.map((q, index) => {
                      const isExpanded = expandedQuestionId === q.id;
                      return (
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0, scale: 0.95 }}
                          key={q.id}
                          className={`bg-white dark:bg-[#111111] border rounded-2xl overflow-hidden shadow-sm transition-colors duration-300 ${
                            isExpanded ? 'border-emerald-500/50 dark:border-emerald-500/30 ring-4 ring-emerald-500/10' : 'border-gray-200 dark:border-white/5 hover:border-emerald-500/30'
                          }`}
                        >
                          {/* Accordion Header */}
                          <div 
                            onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                            className="flex items-center gap-4 p-4 cursor-pointer select-none"
                          >
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                                {q.prompt ? q.prompt.replace(/<[^>]*>?/gm, '') : 'Empty Question Prompt'}
                              </h4>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                <span className={`px-2 py-0.5 rounded border font-medium ${getDifficultyColor(q.difficulty)}`}>
                                  {q.difficulty || 'medium'}
                                </span>
                                {q.tags && q.tags.length > 0 && (
                                  <span className="truncate">Tags: {q.tags.join(', ')}</span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              {!isExpanded && q.options[q.answerIndex] && (
                                <div className="hidden md:flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                                  <Check size={14} /> Answer set
                                </div>
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteQuestion(q.id); }}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                              <div className="p-1 text-gray-400">
                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                              </div>
                            </div>
                          </div>

                          {/* Accordion Body */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-gray-100 dark:border-white/5"
                              >
                                <div className="p-6 space-y-6">
                                  
                                  {/* Prompt */}
                                  <div>
                                    <label className="block text-sm font-medium mb-2">Question Prompt (HTML allowed)</label>
                                    <textarea
                                      value={q.prompt}
                                      onChange={(e) => updateQuestion(q.id, 'prompt', e.target.value)}
                                      className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px]"
                                      placeholder="What is the capital of France?"
                                    />
                                  </div>

                                  {/* Options */}
                                  <div>
                                    <label className="block text-sm font-medium mb-3 flex items-center justify-between">
                                      <span>Options & Correct Answer</span>
                                      <span className="text-xs text-gray-500 font-normal">Select the radio button to mark correct</span>
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {[0, 1, 2, 3].map((optIndex) => {
                                        const isCorrect = q.answerIndex === optIndex;
                                        return (
                                          <div 
                                            key={optIndex}
                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                              isCorrect 
                                                ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500/30' 
                                                : 'bg-white dark:bg-black/20 border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                                            }`}
                                          >
                                            <input
                                              type="radio"
                                              name={`correct-${q.id}`}
                                              checked={isCorrect}
                                              onChange={() => updateQuestion(q.id, 'answerIndex', optIndex)}
                                              className="w-5 h-5 text-emerald-500 bg-gray-100 border-gray-300 focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                                            />
                                            <div className="font-bold text-gray-400 select-none w-4">{String.fromCharCode(65 + optIndex)}</div>
                                            <input
                                              type="text"
                                              value={q.options[optIndex] || ''}
                                              onChange={(e) => updateOption(q.id, optIndex, e.target.value)}
                                              placeholder={`Option ${optIndex + 1}`}
                                              className="flex-1 bg-transparent border-none focus:ring-0 text-sm outline-none w-full"
                                            />
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>

                                  {/* Explanation & Metadata */}
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2">
                                      <label className="block text-sm font-medium mb-2">Explanation (Reason)</label>
                                      <textarea
                                        value={q.reason || ''}
                                        onChange={(e) => updateQuestion(q.id, 'reason', e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-24"
                                        placeholder="Explain why the answer is correct..."
                                      />
                                    </div>
                                    <div className="space-y-4">
                                      <div>
                                        <label className="block text-sm font-medium mb-2">Difficulty</label>
                                        <select
                                          value={q.difficulty || 'medium'}
                                          onChange={(e) => updateQuestion(q.id, 'difficulty', e.target.value)}
                                          className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                                        >
                                          <option value="easy">Easy</option>
                                          <option value="medium">Medium</option>
                                          <option value="hard">Hard</option>
                                        </select>
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
                                        <input
                                          type="text"
                                          value={(q.tags || []).join(', ')}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            updateQuestion(q.id, 'tags', val ? val.split(',').map(t => t.trim()).filter(Boolean) : []);
                                          }}
                                          className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                          placeholder="math, algebra"
                                        />
                                      </div>
                                    </div>
                                  </div>

                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>

                  <motion.button
                    layout
                    onClick={addQuestion}
                    className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-white/10 rounded-2xl text-gray-500 dark:text-gray-400 font-medium hover:border-emerald-500 hover:text-emerald-500 dark:hover:border-emerald-400 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={20} /> Add New Question
                  </motion.button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* File Browser Modal */}
      <AnimatePresence>
        {isBrowserOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsBrowserOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50 dark:bg-black/20">
                <h3 className="font-semibold flex items-center gap-2"><Folder size={18} className="text-emerald-500" /> File Browser</h3>
                <button onClick={() => setIsBrowserOpen(false)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white"><X size={20} /></button>
              </div>
              <div className="px-5 py-2 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/40 text-sm font-mono text-gray-600 dark:text-gray-400 flex items-center gap-2 overflow-x-auto">
                <button onClick={() => loadFileBrowser('')} className="hover:text-emerald-500">root</button>
                {currentFsPath.split('/').filter(Boolean).map((part, i, arr) => (
                  <React.Fragment key={i}>
                    <ChevronRight size={14} className="opacity-50" />
                    <button onClick={() => loadFileBrowser(arr.slice(0, i + 1).join('/'))} className="hover:text-emerald-500">{part}</button>
                  </React.Fragment>
                ))}
              </div>
              <div className="p-2 overflow-y-auto flex-1 min-h-[300px]">
                {isFsLoading ? (
                  <div className="flex items-center justify-center h-40 text-emerald-500"><Loader2 className="animate-spin" size={24} /></div>
                ) : (
                  <div className="space-y-1">
                    {currentFsPath && (
                      <button 
                        onClick={() => {
                          const parent = currentFsPath.split('/').slice(0, -1).join('/');
                          loadFileBrowser(parent);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-left"
                      >
                        <Folder size={18} className="text-emerald-500/70" />
                        <span>..</span>
                      </button>
                    )}
                    {fsItems.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          if (item.isDirectory) {
                            loadFileBrowser(item.path);
                          } else if (item.name.endsWith('.json')) {
                            setFilePath(item.path);
                            setIsBrowserOpen(false);
                            loadQuizFile(item.path);
                          }
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg text-left group ${
                          !item.isDirectory && !item.name.endsWith('.json') ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer'
                        }`}
                        disabled={!item.isDirectory && !item.name.endsWith('.json')}
                      >
                        <div className="flex items-center gap-3">
                          {item.isDirectory ? <Folder size={18} className="text-emerald-500" /> : <FileJson size={18} className="text-blue-500" />}
                          <span className="group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{item.name}</span>
                        </div>
                        {item.size && <span className="text-xs text-gray-400">{(item.size / 1024).toFixed(1)} KB</span>}
                      </button>
                    ))}
                    {fsItems.length === 0 && (
                      <div className="text-center py-10 text-gray-500 text-sm">Empty directory</div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Paste JSON Modal */}
      <AnimatePresence>
        {isPasteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsPasteModalOpen(false)} />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="relative w-full max-w-3xl bg-white dark:bg-[#111111] rounded-2xl shadow-2xl p-6 flex flex-col h-[70vh]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Paste JSON Data</h3>
                <button onClick={() => setIsPasteModalOpen(false)} className="text-gray-500"><X size={24} /></button>
              </div>
              <textarea
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                className="flex-1 w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl p-4 font-mono text-sm focus:outline-none focus:border-emerald-500 resize-none"
                placeholder="[\n  {\n    'prompt': '...',\n    'options': ['A','B','C','D'],\n    'answerIndex': 0\n  }\n]"
              />
              <div className="mt-4 flex justify-end gap-3">
                <button onClick={() => setIsPasteModalOpen(false)} className="px-4 py-2 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-white/5">Cancel</button>
                <button onClick={handlePasteImport} disabled={!pasteContent.trim()} className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium disabled:opacity-50">Import JSON</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GDrive Modal */}
      <AnimatePresence>
        {isGDriveModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsGDriveModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white dark:bg-[#111111] rounded-2xl shadow-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#0087F5]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.71 3.5L1.15 15l3.43 6l6.55-11.5M9.73 3.5h13.12L16.3 15H3.18M17.45 16.5H4.32l3.43 6h13.12" />
                  </svg>
                  Import from Google Drive
                </h3>
                <button onClick={() => setIsGDriveModalOpen(false)} className="text-gray-500"><X size={20} /></button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Google Drive File URL</label>
                  <input
                    type="text"
                    value={gdriveUrl}
                    onChange={(e) => setGdriveUrl(e.target.value)}
                    placeholder="https://docs.google.com/document/d/..."
                    className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Paste a link to a JSON file hosted on Google Drive. The file must be publicly readable or shared with the service account.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
                  <button onClick={() => setIsGDriveModalOpen(false)} className="px-4 py-2 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-white/5">Cancel</button>
                  <button 
                    onClick={importFromGDrive} 
                    disabled={!gdriveUrl.trim() || isGDriveLoading} 
                    className="flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {isGDriveLoading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    Import File
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
