"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Save, ArrowLeft, FileCode, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

import WysiwygEditor from '@/components/admin/WysiwygEditor';

function EditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const filePath = searchParams.get('file');

  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [viewMode, setViewMode] = useState<'code' | 'visual'>('code');

  useEffect(() => {
    if (!filePath) return;
    loadContent(filePath);
    
    // Auto-switch to visual if it's a markdown file
    if (filePath.endsWith('.md')) {
      setViewMode('visual');
    } else {
      setViewMode('code');
    }
  }, [filePath]);

  const loadContent = async (path: string) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/fs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'readFile', targetPath: path })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to read file');
      
      setContent(data.content);
      setOriginalContent(data.content);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!filePath) return;
    
    setIsSaving(true);
    setError('');
    setSaveSuccess(false);
    
    try {
      const res = await fetch('/api/admin/fs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'writeFile', targetPath: filePath, content })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to save file');
      
      setOriginalContent(content);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const isDirty = content !== originalContent;
  const isMarkdown = filePath?.endsWith('.md');

  if (!filePath) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 animate-in fade-in">
        <FileCode className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-700" />
        <h2 className="text-xl font-semibold mb-2">No File Selected</h2>
        <p className="mb-6 text-sm">Select a file from the Content Explorer to begin editing.</p>
        <Link 
          href="/admin/explorer"
          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
        >
          Go to Explorer
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/admin/explorer')}
            className="p-2 rounded-xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              Modular Editor
            </h1>
            <p className="text-sm font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
              {filePath}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isMarkdown && (
            <div className="bg-gray-100 dark:bg-white/5 p-1 rounded-xl flex items-center mr-2">
              <button
                onClick={() => setViewMode('visual')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'visual' ? 'bg-white dark:bg-white/10 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Visual
              </button>
              <button
                onClick={() => setViewMode('code')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'code' ? 'bg-white dark:bg-white/10 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Code
              </button>
            </div>
          )}

          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-500 animate-in fade-in slide-in-from-right-4">
              <CheckCircle2 className="w-4 h-4" />
              Saved
            </span>
          )}
          {error && (
            <span className="text-sm font-medium text-red-500">
              Error: {error}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving || isLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="flex-1 bg-[#1e1e1e] rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-sm relative flex flex-col">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm z-10">
            <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : viewMode === 'visual' ? (
          <WysiwygEditor content={content} onChange={setContent} />
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full p-6 bg-transparent text-gray-200 font-mono text-sm leading-relaxed resize-none focus:outline-none focus:ring-0"
            spellCheck={false}
            placeholder="File content..."
          />
        )}
      </div>
    </div>
  );
}

export default function ModularEditorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center animate-pulse">Loading editor...</div>}>
      <EditorContent />
    </Suspense>
  );
}
