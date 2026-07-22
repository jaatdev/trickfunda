"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, 
  LayoutTemplate, 
  ArrowLeft, 
  SplitSquareHorizontal, 
  Square, 
  Check, 
  X, 
  AlertCircle,
  Undo2,
  Braces,
  Lightbulb,
  BookOpen,
  BrainCircuit,
  MessageSquare,
  AlertTriangle,
  Repeat,
  Sparkles,
  Layers,
  FileCode2,
  Eye,
  FileText
} from 'lucide-react';

const TEMPLATES = [
  {
    id: 'big-notes',
    name: 'Big Notes',
    icon: BookOpen,
    desc: 'Main topic explanation with bullet points',
    scaffold: `{\n  "type": "big-notes",\n  "data": {\n    "title": "Topic Title",\n    "points": [\n      "First important point",\n      "Second important point"\n    ]\n  }\n}`
  },
  {
    id: 'small-notes',
    name: 'Small Notes',
    icon: MessageSquare,
    desc: 'Brief contextual note',
    scaffold: `{\n  "type": "small-notes",\n  "data": {\n    "content": "A brief note here"\n  }\n}`
  },
  {
    id: 'mnemonic-magic',
    name: 'Mnemonic Magic',
    icon: BrainCircuit,
    desc: 'Memory aid or acronym',
    scaffold: `{\n  "type": "mnemonic-magic",\n  "data": {\n    "mnemonic": "ROYGBIV",\n    "explanation": "Red, Orange, Yellow, Green, Blue, Indigo, Violet"\n  }\n}`
  },
  {
    id: 'flashcard',
    name: 'Flashcard',
    icon: Layers,
    desc: 'Front and back card',
    scaffold: `{\n  "type": "flashcard",\n  "data": {\n    "front": "Question here",\n    "back": "Answer here"\n  }\n}`
  },
  {
    id: 'right-wrong',
    name: 'Right/Wrong',
    icon: Check,
    desc: 'Comparison of correct vs incorrect',
    scaffold: `{\n  "type": "right-wrong",\n  "data": {\n    "right": "Do this",\n    "wrong": "Don't do this"\n  }\n}`
  },
  {
    id: 'quick-reference',
    name: 'Quick Ref',
    icon: Lightbulb,
    desc: 'Fast lookup info',
    scaffold: `{\n  "type": "quick-reference",\n  "data": {\n    "title": "Formula",\n    "content": "E = mc^2"\n  }\n}`
  },
  {
    id: 'analogy-box',
    name: 'Analogy',
    icon: Repeat,
    desc: 'Explain using a metaphor',
    scaffold: `{\n  "type": "analogy-box",\n  "data": {\n    "analogy": "The mitochondria is like the powerhouse of the cell."\n  }\n}`
  },
  {
    id: 'pattern-box',
    name: 'Pattern',
    icon: Sparkles,
    desc: 'Highlighting a common pattern',
    scaffold: `{\n  "type": "pattern-box",\n  "data": {\n    "pattern": "Prefix 'un-' means 'not'"\n  }\n}`
  },
  {
    id: 'warning-box',
    name: 'Warning',
    icon: AlertTriangle,
    desc: 'Important caution',
    scaffold: `{\n  "type": "warning-box",\n  "data": {\n    "warning": "Pay attention to the signs"\n  }\n}`
  }
];

function EditorContent() {
  const searchParams = useSearchParams();
  const file = searchParams.get('file');
  const router = useRouter();

  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [jsonError, setJsonError] = useState('');
  
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [previewTab, setPreviewTab] = useState<'preview' | 'raw'>('preview');
  
  const [showTemplates, setShowTemplates] = useState(false);
  const [splitRatio, setSplitRatio] = useState(50);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    if (!file) {
      setLoading(false);
      return;
    }

    const loadFile = async () => {
      try {
        const res = await fetch('/api/admin/fs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'readFile', targetPath: file })
        });
        const data = await res.json();
        if (data.content !== undefined) {
          setContent(data.content);
          setOriginalContent(data.content);
          validateJson(data.content);
        }
      } catch (error) {
        console.error("Failed to load file", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadFile();
  }, [file]);

  const validateJson = (val: string) => {
    if (file?.endsWith('.json')) {
      try {
        JSON.parse(val);
        setJsonError('');
      } catch (e: any) {
        setJsonError(e.message);
      }
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    validateJson(val);
    if (saveStatus === 'saved') setSaveStatus('idle');
  };

  const handleSave = async () => {
    if (!file) return;
    setSaveStatus('saving');
    try {
      const res = await fetch('/api/admin/fs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'writeFile', targetPath: file, content })
      });
      if (res.ok) {
        setSaveStatus('saved');
        setOriginalContent(content);
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    }
  };

  const handleFormat = () => {
    if (!file?.endsWith('.json')) return;
    try {
      const obj = JSON.parse(content);
      const formatted = JSON.stringify(obj, null, 2);
      setContent(formatted);
      setJsonError('');
    } catch {
      // Ignore format if invalid
    }
  };

  const handleUndo = () => {
    document.execCommand('undo');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if (e.ctrlKey && e.shiftKey && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        handleFormat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, file]);

  const insertTemplate = (scaffold: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const newContent = content.substring(0, start) + scaffold + content.substring(end);
    setContent(newContent);
    validateJson(newContent);
    
    // Focus back and move cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + scaffold.length, start + scaffold.length);
    }, 0);
  };

  const onDragStart = () => {
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
  };

  const onDragMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    const newRatio = (e.clientX / window.innerWidth) * 100;
    if (newRatio > 20 && newRatio < 80) {
      setSplitRatio(newRatio);
    }
  };

  const onDragEnd = () => {
    isDragging.current = false;
    document.body.style.cursor = 'default';
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
  };

  const isUnsaved = content !== originalContent;

  if (loading) {
    return <div className="h-screen flex items-center justify-center text-gray-500">Loading editor...</div>;
  }

  if (!file) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center p-6 bg-gray-50 dark:bg-black">
        <FileCode2 className="w-16 h-16 text-emerald-500 mb-4 opacity-50" />
        <h2 className="text-2xl font-bold mb-2">No File Selected</h2>
        <p className="text-gray-500 mb-6">Select a file from the explorer to start editing.</p>
        <button 
          onClick={() => router.push('/admin/explorer')}
          className="px-6 py-2 bg-emerald-500 text-white rounded-xl shadow-sm hover:bg-emerald-600 transition-colors"
        >
          Go to Explorer
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 overflow-hidden animate-in fade-in duration-500">
      {/* Toolbar */}
      <header className="flex-none h-14 border-b border-gray-200 dark:border-white/10 bg-white/50 dark:bg-[#111111]/80 backdrop-blur-md flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/admin/explorer')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{file.split(/[/\\]/).pop()}</span>
            <span className="text-xs text-gray-500 truncate max-w-[200px] md:max-w-md" title={file}>
              {file}
            </span>
          </div>
          {isUnsaved && <span className="w-2 h-2 rounded-full bg-emerald-500 ml-2 animate-pulse" />}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-lg p-1 mr-2">
            <button
              onClick={() => setViewMode('editor')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'editor' ? 'bg-white dark:bg-white/10 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-white/5'}`}
              title="Editor Only"
            >
              <Square size={16} />
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'split' ? 'bg-white dark:bg-white/10 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-white/5'}`}
              title="Split View"
            >
              <SplitSquareHorizontal size={16} />
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'preview' ? 'bg-white dark:bg-white/10 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-white/5'}`}
              title="Preview Only"
            >
              <Eye size={16} />
            </button>
          </div>

          <button 
            onClick={() => setShowTemplates(!showTemplates)}
            className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${showTemplates ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'hover:bg-gray-100 dark:hover:bg-white/5'}`}
            title="NoteBox Templates"
          >
            <LayoutTemplate size={18} />
            <span className="text-sm hidden sm:inline">Templates</span>
          </button>
          
          <button 
            onClick={handleUndo}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={18} />
          </button>
          
          {file.endsWith('.json') && (
            <button 
              onClick={handleFormat}
              className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
              title="Format JSON (Ctrl+Shift+F)"
            >
              <Braces size={18} />
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="flex items-center gap-2 ml-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            {saveStatus === 'saving' ? (
              <span className="animate-spin text-lg">↻</span>
            ) : saveStatus === 'saved' ? (
              <Check size={16} />
            ) : (
              <Save size={16} />
            )}
            <span className="text-sm font-medium hidden sm:inline">Save</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Code Editor Panel */}
        {(viewMode === 'split' || viewMode === 'editor') && (
          <div 
            className="flex flex-col bg-[#0d1117] relative"
            style={{ width: viewMode === 'split' ? `\${splitRatio}%` : '100%' }}
          >
            <div className="flex-1 overflow-auto relative">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleContentChange}
                spellCheck={false}
                className="absolute inset-0 w-full h-full bg-transparent text-gray-300 font-mono text-[14px] leading-relaxed p-4 pl-12 resize-none focus:outline-none focus:ring-0"
                style={{ tabSize: 2 }}
              />
              {/* Line Numbers Fake Gutter */}
              <div className="absolute top-0 left-0 bottom-0 w-10 bg-[#0d1117] border-r border-gray-800 text-right pr-2 py-4 select-none pointer-events-none text-gray-600 font-mono text-[14px] leading-relaxed overflow-hidden">
                {content.split('\n').map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
            </div>
            {/* Editor Footer / Error Indicator */}
            {jsonError && (
              <div className="flex-none bg-red-500/10 border-t border-red-500/20 text-red-400 p-2 text-xs flex items-center gap-2 font-mono">
                <AlertCircle size={14} />
                <span>{jsonError}</span>
              </div>
            )}
            {!jsonError && file.endsWith('.json') && (
              <div className="flex-none bg-[#0d1117] border-t border-gray-800 text-gray-500 p-2 text-xs flex items-center gap-2 font-mono">
                <Check size={14} className="text-emerald-500" />
                <span>Valid JSON</span>
              </div>
            )}
          </div>
        )}

        {/* Resizer */}
        {viewMode === 'split' && (
          <div 
            className="w-1 bg-gray-200 dark:bg-white/5 hover:bg-emerald-500 dark:hover:bg-emerald-500 cursor-col-resize transition-colors z-10 flex-none"
            onMouseDown={onDragStart}
          />
        )}

        {/* Preview Panel */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div 
            className="flex flex-col bg-white dark:bg-[#111111] overflow-hidden"
            style={{ width: viewMode === 'split' ? `\${100 - splitRatio}%` : '100%' }}
          >
            <div className="flex-none h-10 border-b border-gray-200 dark:border-white/5 flex items-center px-2 bg-gray-50 dark:bg-[#0a0a0a]">
              <button 
                onClick={() => setPreviewTab('preview')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors \${previewTab === 'preview' ? 'bg-white dark:bg-white/10 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
              >
                Preview
              </button>
              <button 
                onClick={() => setPreviewTab('raw')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors \${previewTab === 'raw' ? 'bg-white dark:bg-white/10 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
              >
                Raw
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6 bg-gray-50/50 dark:bg-transparent">
              {previewTab === 'raw' ? (
                <pre className="whitespace-pre-wrap font-mono text-sm">{content}</pre>
              ) : (
                <div className="max-w-3xl mx-auto">
                  {file.endsWith('.json') ? (
                    (() => {
                      try {
                        const data = JSON.parse(content);
                        const items = Array.isArray(data) ? data : [data];
                        return (
                          <div className="space-y-4">
                            {items.map((item, idx) => (
                              <div key={idx} className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-full uppercase tracking-wider">
                                    {item.type || 'Unknown Type'}
                                  </span>
                                  {item.id && <span className="text-xs text-gray-400 font-mono">#{item.id}</span>}
                                </div>
                                <pre className="text-sm bg-gray-50 dark:bg-black/50 p-3 rounded-lg overflow-x-auto border border-gray-100 dark:border-white/5">
                                  {JSON.stringify(item.data || item, null, 2)}
                                </pre>
                              </div>
                            ))}
                          </div>
                        )
                      } catch (e) {
                        return <div className="text-red-500 flex items-center gap-2"><AlertCircle /> Invalid JSON for preview</div>
                      }
                    })()
                  ) : file.endsWith('.md') ? (
                    <div className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none">
                      {/* Very basic markdown rendering for preview */}
                      {content.split('\n\n').map((para, i) => {
                        if (para.startsWith('# ')) return <h1 key={i}>{para.replace('# ', '')}</h1>;
                        if (para.startsWith('## ')) return <h2 key={i}>{para.replace('## ', '')}</h2>;
                        if (para.startsWith('### ')) return <h3 key={i}>{para.replace('### ', '')}</h3>;
                        if (para.startsWith('- ')) {
                          return <ul key={i}>{para.split('\n').map((li, j) => <li key={j}>{li.replace('- ', '')}</li>)}</ul>
                        }
                        return <p key={i}>{para}</p>
                      })}
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap">{content}</pre>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Template Drawer */}
        <AnimatePresence>
          {showTemplates && (
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-[#111111] border-l border-gray-200 dark:border-white/5 shadow-2xl flex flex-col z-20"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/5">
                <h3 className="font-semibold flex items-center gap-2">
                  <LayoutTemplate size={18} className="text-emerald-500" />
                  NoteBox Templates
                </h3>
                <button onClick={() => setShowTemplates(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded-md text-gray-500">
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {TEMPLATES.map(tpl => (
                  <button
                    key={tpl.id}
                    onClick={() => insertTemplate(tpl.scaffold)}
                    className="w-full text-left p-3 rounded-xl border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#0a0a0a] hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <div className="p-1.5 bg-white dark:bg-[#111111] rounded-lg shadow-sm border border-gray-100 dark:border-white/5 group-hover:text-emerald-500 transition-colors">
                        <tpl.icon size={16} />
                      </div>
                      <span className="font-medium text-sm">{tpl.name}</span>
                    </div>
                    <p className="text-xs text-gray-500 ml-10">{tpl.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading editor...</div>}>
      <EditorContent />
    </Suspense>
  );
}
