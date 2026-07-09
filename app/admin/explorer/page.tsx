"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, File, ChevronRight, Home, Plus, Trash2, Edit3, ArrowUpCircle } from 'lucide-react';
import Link from 'next/link';

interface FSItem {
  name: string;
  isDirectory: boolean;
  path: string;
}

export default function ContentExplorer() {
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [items, setItems] = useState<FSItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // New Folder Modal State
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const loadDirectory = async (pathArray: string[]) => {
    setIsLoading(true);
    setError('');
    try {
      const targetPath = pathArray.join('/');
      const res = await fetch('/api/admin/fs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'readDir', targetPath })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to load directory');
      
      // Sort: Directories first, then files, both alphabetically
      const sorted = data.items.sort((a: FSItem, b: FSItem) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
      
      setItems(sorted);
      setCurrentPath(pathArray);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDirectory([]);
  }, []);

  const handleNavigate = (folderName: string) => {
    loadDirectory([...currentPath, folderName]);
  };

  const handleNavigateUp = () => {
    if (currentPath.length === 0) return;
    loadDirectory(currentPath.slice(0, -1));
  };

  const handleBreadcrumbClick = (index: number) => {
    loadDirectory(currentPath.slice(0, index + 1));
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    
    try {
      const targetPath = [...currentPath, newFolderName.trim().replace(/[^a-zA-Z0-9-]/g, '-')].join('/');
      const res = await fetch('/api/admin/fs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mkdir', targetPath })
      });
      if (!res.ok) throw new Error('Failed to create folder');
      
      setNewFolderName('');
      setIsNewFolderOpen(false);
      loadDirectory(currentPath);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (item: FSItem) => {
    if (!confirm(`Are you sure you want to delete ${item.name}? This cannot be undone.`)) return;
    
    try {
      const res = await fetch('/api/admin/fs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', targetPath: item.path })
      });
      if (!res.ok) throw new Error('Failed to delete item');
      
      loadDirectory(currentPath);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Content Explorer
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage the KD Method file structure directly on the server.
          </p>
        </div>
        <button
          onClick={() => setIsNewFolderOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          New Folder
        </button>
      </div>

      <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col min-h-[500px]">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 px-6 py-4 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/5 overflow-x-auto">
          <button 
            onClick={() => loadDirectory([])}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <Home className="w-4 h-4" />
          </button>
          
          {currentPath.map((segment, index) => (
            <React.Fragment key={index}>
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className="px-2 py-1 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors whitespace-nowrap"
              >
                {segment}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center text-red-500">
              {error}
            </div>
          ) : items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 gap-4">
              <Folder className="w-12 h-12 text-gray-300 dark:text-gray-600" />
              <p>This folder is empty.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {currentPath.length > 0 && (
                <button
                  onClick={handleNavigateUp}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-white/10 text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-white/20 transition-colors">
                    <ArrowUpCircle className="w-5 h-5 text-gray-500" />
                  </div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">.. (Up a level)</span>
                </button>
              )}
              
              {items.map((item) => (
                <div
                  key={item.path}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-white/10 group relative"
                >
                  <button
                    onClick={() => item.isDirectory ? handleNavigate(item.name) : null}
                    className="flex items-center gap-3 flex-1 text-left overflow-hidden"
                  >
                    <div className={`w-10 h-10 flex-shrink-0 rounded-lg flex items-center justify-center ${
                      item.isDirectory 
                        ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-500' 
                        : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {item.isDirectory ? <Folder className="w-5 h-5" /> : <File className="w-5 h-5" />}
                    </div>
                    <span className="font-medium truncate text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {item.name}
                    </span>
                  </button>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!item.isDirectory && (
                      <Link
                        href={`/admin/editor?file=${encodeURIComponent(item.path)}`}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                    )}
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Folder Modal */}
      <AnimatePresence>
        {isNewFolderOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewFolderOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <h2 className="text-xl font-bold mb-4">Create New Folder</h2>
              <form onSubmit={handleCreateFolder}>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. geometry, chapter-1"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                />
                <p className="text-xs text-gray-500 mt-2 mb-6">
                  Use lowercase letters and hyphens for best compatibility.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsNewFolderOpen(false)}
                    className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newFolderName.trim()}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Folder
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
