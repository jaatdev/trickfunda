"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Folder, File, FileJson, FileText, Search, LayoutGrid, List,
  ChevronRight, Home, Plus, RefreshCw, Edit2, Trash2, X,
  FilePlus, FolderPlus, ArrowUp, AlertCircle, FileCode, Check
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Types
type FileItem = {
  name: string;
  isDirectory: boolean;
  path: string;
  type?: string;
  size?: number;
  mtime?: string;
};

type RootDir = 'root' | 'subjects' | 'study-material' | 'vocab';

const ROOTS: { id: RootDir; label: string }[] = [
  { id: 'root', label: 'All Data' },
  { id: 'subjects', label: 'Subjects' },
  { id: 'study-material', label: 'Study Material' },
  { id: 'vocab', label: 'Vocab' },
];

function formatBytes(bytes: number = 0, decimals = 2) {
  if (!+bytes) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function timeAgo(dateStr?: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + 'y ago';
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + 'mo ago';
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + 'd ago';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + 'h ago';
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + 'm ago';
  return Math.floor(seconds) + 's ago';
}

export default function ExplorerPage() {
  const router = useRouter();
  
  // State
  const [activeRoot, setActiveRoot] = useState<RootDir>('root');
  const [currentPath, setCurrentPath] = useState('');
  const [items, setItems] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Modals / Panels
  const [previewFile, setPreviewFile] = useState<{item: FileItem, content: string} | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  const [deleteItem, setDeleteItem] = useState<FileItem | null>(null);
  const [renameItem, setRenameItem] = useState<FileItem | null>(null);
  const [newName, setNewName] = useState('');
  const [isCreatingFile, setIsCreatingFile] = useState(false);

  // Fetch Items
  const fetchItems = useCallback(async (path = currentPath, root = activeRoot) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/fs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'readDir', targetPath: path, rootDir: root }),
      });
      const data = await res.json();
      if (data.items) {
        // Sort: directories first, then files
        const sorted = data.items.sort((a: FileItem, b: FileItem) => {
          if (a.isDirectory && !b.isDirectory) return -1;
          if (!a.isDirectory && b.isDirectory) return 1;
          return a.name.localeCompare(b.name);
        });
        setItems(sorted);
        setCurrentPath(data.currentPath || path);
      }
    } catch (err) {
      console.error('Error fetching directory:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPath, activeRoot]);

  useEffect(() => {
    fetchItems(currentPath, activeRoot);
  }, [activeRoot, currentPath, fetchItems]);

  // Handle Search
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    if (!searchQuery.trim()) {
      setIsSearching(false);
      fetchItems(currentPath, activeRoot);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      setLoading(true);
      try {
        const res = await fetch('/api/admin/fs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'search', query: searchQuery, rootDir: activeRoot }),
        });
        const data = await res.json();
        if (data.results) {
          setItems(data.results);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery, activeRoot]);

  // Actions
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      await fetch('/api/admin/fs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'mkdir', 
          targetPath: currentPath ? `${currentPath}/${newFolderName}` : newFolderName, 
          rootDir: activeRoot 
        }),
      });
      setNewFolderOpen(false);
      setNewFolderName('');
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateFile = async (template: string) => {
    setIsCreatingFile(false);
    const fileName = `new-${template.split('.')[0]}-${Date.now()}.${template.split('.')[1]}`;
    try {
      await fetch('/api/admin/fs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'createFromTemplate', 
          targetPath: currentPath ? `${currentPath}/${fileName}` : fileName,
          template: template,
          rootDir: activeRoot 
        }),
      });
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await fetch('/api/admin/fs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', targetPath: deleteItem.path, rootDir: activeRoot }),
      });
      setDeleteItem(null);
      if (previewFile?.item.path === deleteItem.path) setPreviewFile(null);
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameItem || !newName.trim()) return;
    
    // Construct new path by replacing the old name with the new name at the end
    const parts = renameItem.path.split(/[/\\]/);
    parts.pop();
    const basePath = parts.join('/');
    const newPath = basePath ? `${basePath}/${newName}` : newName;

    try {
      await fetch('/api/admin/fs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'rename', 
          targetPath: renameItem.path,
          newName: newPath,
          rootDir: activeRoot
        }),
      });
      setRenameItem(null);
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const loadPreview = async (item: FileItem) => {
    if (item.isDirectory) return;
    setPreviewLoading(true);
    setPreviewFile({ item, content: '' });
    try {
      const res = await fetch('/api/admin/fs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'readFile', targetPath: item.path, rootDir: activeRoot }),
      });
      const data = await res.json();
      if (data.content) {
        setPreviewFile({ item, content: data.content });
      } else {
        setPreviewFile({ item, content: 'Unable to preview this file.' });
      }
    } catch (err) {
      console.error(err);
      setPreviewFile({ item, content: 'Error loading preview.' });
    } finally {
      setPreviewLoading(false);
    }
  };

  const navigateUp = () => {
    if (!currentPath) return;
    const parts = currentPath.split('/');
    parts.pop();
    setCurrentPath(parts.join('/'));
  };
  
  const navigateBreadcrumb = (index: number) => {
    const parts = currentPath.split('/');
    const newPath = parts.slice(0, index + 1).join('/');
    setCurrentPath(newPath);
  };

  // UI Helpers
  const getFileIcon = (item: FileItem) => {
    if (item.isDirectory) return <Folder className="w-8 h-8 text-blue-500 flex-shrink-0" />;
    const ext = item.name.split('.').pop()?.toLowerCase();
    if (ext === 'json') return <FileJson className="w-8 h-8 text-amber-500 flex-shrink-0" />;
    if (ext === 'md' || ext === 'mdx') return <FileText className="w-8 h-8 text-purple-500 flex-shrink-0" />;
    return <File className="w-8 h-8 text-gray-500 flex-shrink-0" />;
  };

  const getSmallIcon = (item: FileItem) => {
    if (item.isDirectory) return <Folder className="w-5 h-5 text-blue-500 flex-shrink-0" />;
    const ext = item.name.split('.').pop()?.toLowerCase();
    if (ext === 'json') return <FileJson className="w-5 h-5 text-amber-500 flex-shrink-0" />;
    if (ext === 'md' || ext === 'mdx') return <FileText className="w-5 h-5 text-purple-500 flex-shrink-0" />;
    return <File className="w-5 h-5 text-gray-500 flex-shrink-0" />;
  };

  const breadcrumbParts = currentPath ? currentPath.split('/').filter(Boolean) : [];

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.20))] md:h-[calc(100vh-theme(spacing.16))] w-full animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex space-x-1 bg-gray-100/50 dark:bg-white/5 p-1 rounded-xl backdrop-blur-md overflow-x-auto w-full md:w-auto">
          {ROOTS.map((root) => (
            <button
              key={root.id}
              onClick={() => {
                setActiveRoot(root.id);
                setCurrentPath('');
                setSearchQuery('');
              }}
              className={`relative px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors z-10 ${
                activeRoot === root.id ? 'text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {activeRoot === root.id && (
                <motion.div
                  layoutId="activeRootTab"
                  className="absolute inset-0 bg-white dark:bg-[#222] shadow-sm rounded-lg -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {root.label}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <div className="flex bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl p-1 shrink-0">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-400'}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-400'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden flex flex-col relative">
        
        {/* Toolbar & Breadcrumbs */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/5">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => { setCurrentPath(''); setSearchQuery(''); }}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-500 transition-colors shrink-0"
            >
              <Home className="w-4 h-4" />
            </button>
            <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0" />
            
            <AnimatePresence mode="popLayout">
              {isSearching ? (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sm font-medium text-emerald-600 dark:text-emerald-400"
                >
                  Search Results for "{searchQuery}"
                </motion.span>
              ) : (
                breadcrumbParts.map((part, idx) => (
                  <React.Fragment key={`${part}-${idx}`}>
                    <motion.button
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`text-sm font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shrink-0 ${idx === breadcrumbParts.length - 1 ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}
                      onClick={() => navigateBreadcrumb(idx)}
                    >
                      {part}
                    </motion.button>
                    {idx < breadcrumbParts.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0" />
                    )}
                  </React.Fragment>
                ))
              )}
            </AnimatePresence>
            {!isSearching && breadcrumbParts.length === 0 && (
              <span className="text-sm font-medium text-gray-900 dark:text-white">Root</span>
            )}
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => fetchItems()} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="h-4 w-px bg-gray-200 dark:bg-white/10 mx-1"></div>
            <button 
              onClick={() => setNewFolderOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              <span className="hidden sm:inline">New Folder</span>
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsCreatingFile(!isCreatingFile)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm shadow-emerald-500/20"
              >
                <FilePlus className="w-4 h-4" />
                <span className="hidden sm:inline">New File</span>
              </button>
              
              <AnimatePresence>
                {isCreatingFile && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl z-20 overflow-hidden"
                  >
                    <div className="p-1">
                      <button onClick={() => handleCreateFile('content.json')} className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                        <FileJson className="w-4 h-4 text-amber-500" /> content.json
                      </button>
                      <button onClick={() => handleCreateFile('quiz.json')} className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                        <FileCode className="w-4 h-4 text-blue-500" /> quiz.json
                      </button>
                      <button onClick={() => handleCreateFile('notes.md')} className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                        <FileText className="w-4 h-4 text-purple-500" /> notes.md
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar relative">
          {loading && items.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : items.length === 0 && !loading ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-24 h-24 mb-6 relative">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse"></div>
                <Folder className="w-full h-full text-emerald-500 drop-shadow-lg relative z-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Folder is empty</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
                This directory doesn't have any files or folders yet. Create a new one to get started.
              </p>
              <button 
                onClick={() => setIsCreatingFile(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Create First File
              </button>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {/* Up directory button if not root */}
                  {currentPath && !isSearching && (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group cursor-pointer bg-gray-50/50 hover:bg-gray-100 dark:bg-white/[0.02] dark:hover:bg-white/[0.05] border border-transparent dark:border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all min-h-[140px]"
                      onClick={navigateUp}
                    >
                      <div className="w-12 h-12 rounded-full bg-gray-200/50 dark:bg-white/10 flex items-center justify-center mb-3 group-hover:-translate-y-1 transition-transform">
                        <ArrowUp className="w-6 h-6 text-gray-500" />
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Go Up</span>
                    </motion.div>
                  )}

                  {/* Items */}
                  <AnimatePresence>
                    {items.map((item, i) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: i * 0.02, duration: 0.2 }}
                        key={item.path}
                        className="group relative cursor-pointer bg-white dark:bg-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.05] border border-gray-200 dark:border-white/10 hover:border-emerald-500/30 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all hover:shadow-lg hover:shadow-emerald-500/5 min-h-[140px]"
                        onClick={() => item.isDirectory ? setCurrentPath(item.path) : loadPreview(item)}
                      >
                        {/* Hover Actions */}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); setRenameItem(item); setNewName(item.name); }} className="p-1.5 bg-white dark:bg-[#222] border border-gray-200 dark:border-white/10 text-gray-500 hover:text-emerald-500 rounded-lg shadow-sm">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setDeleteItem(item); }} className="p-1.5 bg-white dark:bg-[#222] border border-gray-200 dark:border-white/10 text-gray-500 hover:text-red-500 rounded-lg shadow-sm">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="mb-3 transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300">
                          {getFileIcon(item)}
                        </div>
                        
                        <div className="w-full">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate px-1" title={item.name}>
                            {item.name}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.isDirectory ? 'Folder' : formatBytes(item.size)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="min-w-full inline-block align-middle">
                  <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
                      <thead className="bg-gray-50 dark:bg-white/5">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modified</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-transparent divide-y divide-gray-200 dark:divide-white/5">
                        {currentPath && !isSearching && (
                          <tr 
                            onClick={navigateUp}
                            className="hover:bg-gray-50 dark:hover:bg-white/[0.02] cursor-pointer transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap" colSpan={4}>
                              <div className="flex items-center gap-3">
                                <ArrowUp className="w-5 h-5 text-gray-400" />
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">.. Go Up</span>
                              </div>
                            </td>
                          </tr>
                        )}
                        {items.map((item) => (
                          <tr 
                            key={item.path}
                            onClick={() => item.isDirectory ? setCurrentPath(item.path) : loadPreview(item)}
                            className="hover:bg-gray-50 dark:hover:bg-white/[0.02] cursor-pointer transition-colors group"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                {getSmallIcon(item)}
                                <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-sm">
                                  {item.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.isDirectory ? '-' : formatBytes(item.size)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {timeAgo(item.mtime)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setRenameItem(item); setNewName(item.name); }} 
                                  className="p-1.5 text-gray-400 hover:text-emerald-500 transition-colors bg-white dark:bg-[#111] shadow-sm border border-gray-200 dark:border-white/10 rounded-md"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setDeleteItem(item); }} 
                                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors bg-white dark:bg-[#111] shadow-sm border border-gray-200 dark:border-white/10 rounded-md"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Preview Panel Sidebar */}
      <AnimatePresence>
        {previewFile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewFile(null)}
              className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-full md:w-[450px] bg-white dark:bg-[#111] border-l border-gray-200 dark:border-white/10 shadow-2xl z-50 flex flex-col rounded-r-2xl"
            >
              <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
                <div className="flex items-center gap-3 overflow-hidden">
                  {getSmallIcon(previewFile.item)}
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {previewFile.item.name}
                  </h3>
                </div>
                <div className="flex items-center gap-2 pl-2 shrink-0">
                  <button
                    onClick={() => router.push(`/admin/editor?file=${encodeURIComponent(previewFile.item.path)}&root=${activeRoot}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Open Editor
                  </button>
                  <button onClick={() => setPreviewFile(null)} className="p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors text-gray-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-auto p-4 custom-scrollbar bg-[#fafafa] dark:bg-[#0a0a0a]">
                {previewLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                  </div>
                ) : (
                  <pre className="text-xs font-mono text-gray-800 dark:text-gray-300 whitespace-pre-wrap break-words">
                    {previewFile.content}
                  </pre>
                )}
              </div>
              
              <div className="p-3 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex justify-between text-xs text-gray-500">
                <span>{formatBytes(previewFile.item.size)}</span>
                <span>Modified: {previewFile.item.mtime ? new Date(previewFile.item.mtime).toLocaleDateString() : 'N/A'}</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {/* New Folder Modal */}
        {newFolderOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setNewFolderOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Create Folder</h3>
              <form onSubmit={handleCreateFolder}>
                <input 
                  autoFocus
                  type="text" 
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name"
                  className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-6 text-gray-900 dark:text-white"
                />
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setNewFolderOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Cancel</button>
                  <button type="submit" disabled={!newFolderName.trim()} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium shadow-sm transition-colors">Create</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Rename Modal */}
        {renameItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setRenameItem(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Rename</h3>
              <form onSubmit={handleRename}>
                <input 
                  autoFocus
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-6 text-gray-900 dark:text-white"
                />
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setRenameItem(null)} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Cancel</button>
                  <button type="submit" disabled={!newName.trim() || newName === renameItem.name} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium shadow-sm transition-colors">Save</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Delete Modal */}
        {deleteItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteItem(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-red-900/30 rounded-2xl shadow-xl p-6 w-full max-w-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete {deleteItem.isDirectory ? 'Folder' : 'File'}</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">"{deleteItem.name}"</span>? 
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDeleteItem(null)} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Cancel</button>
                <button onClick={handleDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium shadow-sm transition-colors">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
