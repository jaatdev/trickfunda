"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, Image as ImageIcon, FileText, Video, Trash2, 
  Copy, X, Check, Square, CheckSquare, Maximize2, Loader2, Folder
} from 'lucide-react';

interface MediaFile {
  url: string;
  name: string;
  size: number;
  type: string;
  folder: string;
}

const FOLDERS = ['uploads', 'figures', 'custom'];

export default function MediaManagerPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFolder, setActiveFolder] = useState(FOLDERS[0]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());
  
  const [previewItem, setPreviewItem] = useState<MediaFile | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch files
  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/upload?folder=${activeFolder}`);
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
      } else {
        setFiles([]);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [activeFolder]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFiles(e.target.files);
    }
  };

  const uploadFiles = async (fileList: FileList) => {
    setUploading(true);
    setUploadProgress(0);
    
    const totalFiles = fileList.length;
    let completed = 0;
    
    for (let i = 0; i < totalFiles; i++) {
      const file = fileList[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', activeFolder);
      
      try {
        await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });
      } catch (err) {
        console.error('Upload failed for', file.name, err);
      }
      
      completed++;
      setUploadProgress(Math.round((completed / totalFiles) * 100));
    }
    
    setUploading(false);
    setUploadProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    fetchFiles();
    showToast(`Uploaded ${totalFiles} file(s)`);
  };

  const handleDelete = async (url: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    try {
      await fetch('/api/admin/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      fetchFiles();
      showToast('File deleted');
      if (previewItem?.url === url) setPreviewItem(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUrls.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedUrls.size} files?`)) return;
    
    let deletedCount = 0;
    for (const url of selectedUrls) {
      try {
        await fetch('/api/admin/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });
        deletedCount++;
      } catch (err) {
        console.error(err);
      }
    }
    
    setSelectedUrls(new Set());
    setIsSelectMode(false);
    fetchFiles();
    showToast(`Deleted ${deletedCount} file(s)`);
  };

  const toggleSelection = (url: string) => {
    const next = new Set(selectedUrls);
    if (next.has(url)) next.delete(url);
    else next.add(url);
    setSelectedUrls(next);
  };

  const toggleSelectAll = () => {
    if (selectedUrls.size === files.length) {
      setSelectedUrls(new Set());
    } else {
      setSelectedUrls(new Set(files.map(f => f.url)));
    }
  };

  const copyUrl = (url: string) => {
    // try to get the full URL if it's relative
    const fullUrl = url.startsWith('http') ? url : window.location.origin + url;
    navigator.clipboard.writeText(fullUrl);
    showToast('URL copied to clipboard');
  };

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Media Manager
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Upload and manage your images, videos, and documents
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      <div 
        className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer min-h-[200px] bg-white/50 dark:bg-[#111111]/50 backdrop-blur admin-dropzone ${
          isDragging 
            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
            : 'border-gray-300 dark:border-white/10 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-gray-50 dark:hover:bg-white/5'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          multiple 
          accept="image/*,video/*,application/pdf" 
          onChange={handleFileInput}
        />
        
        {uploading ? (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
            <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
              Uploading... {uploadProgress}%
            </div>
            <div className="w-64 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-emerald-500" 
                initial={{ width: 0 }} 
                animate={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-4 text-emerald-600 dark:text-emerald-400">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Drop files here or click to upload
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Supports images, videos, and PDFs
            </p>
          </>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-2 shadow-sm">
        <div className="flex space-x-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-x-auto w-full sm:w-auto">
          {FOLDERS.map(folder => (
            <button
              key={folder}
              onClick={() => {
                setActiveFolder(folder);
                setIsSelectMode(false);
                setSelectedUrls(new Set());
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all whitespace-nowrap ${
                activeFolder === folder
                  ? 'bg-white dark:bg-[#222222] text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4" />
                {folder}
              </div>
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto px-2">
          {isSelectMode ? (
            <>
              <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                {selectedUrls.size} selected
              </span>
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {selectedUrls.size === files.length && files.length > 0 ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                Select All
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={selectedUrls.size === 0}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </button>
              <button
                onClick={() => {
                  setIsSelectMode(false);
                  setSelectedUrls(new Set());
                }}
                className="px-3 py-1.5 text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsSelectMode(true)}
              disabled={files.length === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <CheckSquare className="w-4 h-4" />
              Select Mode
            </button>
          )}
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        </div>
      ) : files.length === 0 ? (
        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-full mb-6">
            <ImageIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No media uploaded yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
            Upload files to the <strong>{activeFolder}</strong> folder to see them here.
          </p>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-500/20"
          >
            Upload Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <AnimatePresence>
            {files.map((file, index) => {
              const isImage = file.type.startsWith('image/') || file.url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i);
              const isVideo = file.type.startsWith('video/') || file.url.match(/\.(mp4|webm|ogg)$/i);
              const isPdf = file.type === 'application/pdf' || file.url.match(/\.pdf$/i);
              const isSelected = selectedUrls.has(file.url);
              
              return (
                <motion.div
                  key={file.url}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={`group relative aspect-square bg-gray-100 dark:bg-[#1a1a1a] rounded-2xl overflow-hidden border-2 transition-all ${
                    isSelected ? 'border-emerald-500 shadow-md' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => {
                    if (isSelectMode) toggleSelection(file.url);
                  }}
                >
                  {/* Thumbnail */}
                  <div className="w-full h-full flex items-center justify-center bg-white dark:bg-[#111111]">
                    {isImage ? (
                      <img src={file.url} alt={file.name} loading="lazy" className="w-full h-full object-cover" />
                    ) : isVideo ? (
                      <div className="w-full h-full relative">
                        <video src={file.url} className="w-full h-full object-cover opacity-70" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-black/50 p-3 rounded-full backdrop-blur-sm">
                            <Video className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-gray-400">
                        <FileText className="w-12 h-12 mb-2" />
                        <span className="text-xs uppercase font-bold tracking-wider">{file.url.split('.').pop()}</span>
                      </div>
                    )}
                  </div>

                  {/* Selection Checkbox (Select Mode) */}
                  {isSelectMode && (
                    <div className="absolute top-3 left-3 z-10">
                      <div className={`w-6 h-6 rounded flex items-center justify-center border-2 transition-colors ${
                        isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-white/50 bg-black/20 text-transparent'
                      }`}>
                        <Check className="w-4 h-4" />
                      </div>
                    </div>
                  )}

                  {/* Hover Overlay (Normal Mode) */}
                  {!isSelectMode && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4 backdrop-blur-[2px]">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); copyUrl(file.url); }}
                          className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                          title="Copy URL"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setPreviewItem(file); }}
                          className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                          title="Preview"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(file.url); }}
                          className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="text-white text-sm">
                        <p className="truncate font-medium drop-shadow-md">{file.name}</p>
                        <p className="text-xs text-gray-300 mt-1">{formatSize(file.size)}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* File Info Bar (Always visible at bottom when not hovering) */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent group-hover:opacity-0 transition-opacity">
                    <p className="text-white text-xs truncate font-medium drop-shadow-md">{file.name}</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {previewItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-sm"
            onClick={() => setPreviewItem(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-6xl w-full max-h-full flex flex-col items-center"
              onClick={e => e.stopPropagation()}
            >
              {/* Toolbar */}
              <div className="w-full flex justify-between items-center bg-black/50 p-4 rounded-t-2xl backdrop-blur-md">
                <div className="text-white">
                  <h3 className="font-medium text-lg truncate max-w-[200px] sm:max-w-md">{previewItem.name}</h3>
                  <p className="text-sm text-gray-400">{formatSize(previewItem.size)} • {previewItem.folder}</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => copyUrl(previewItem.url)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="hidden sm:inline text-sm font-medium">Copy URL</span>
                  </button>
                  <button 
                    onClick={() => {
                      handleDelete(previewItem.url);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline text-sm font-medium">Delete</span>
                  </button>
                  <button 
                    onClick={() => setPreviewItem(null)}
                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="w-full h-[70vh] bg-[#111111] rounded-b-2xl overflow-hidden flex items-center justify-center">
                {(previewItem.type.startsWith('image/') || previewItem.url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i)) ? (
                  <img 
                    src={previewItem.url} 
                    alt={previewItem.name} 
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (previewItem.type.startsWith('video/') || previewItem.url.match(/\.(mp4|webm|ogg)$/i)) ? (
                  <video 
                    src={previewItem.url} 
                    controls 
                    autoPlay 
                    className="max-w-full max-h-full"
                  />
                ) : (
                  <div className="text-center text-white p-8">
                    <FileText className="w-24 h-24 mx-auto mb-6 text-gray-500" />
                    <h4 className="text-xl mb-4">No preview available</h4>
                    <a 
                      href={previewItem.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl inline-block font-medium transition-colors"
                    >
                      Open in new tab
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-6 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl shadow-2xl"
          >
            <div className="bg-emerald-500/20 text-emerald-400 dark:text-emerald-500 p-1 rounded-full">
              <Check className="w-5 h-5" />
            </div>
            <p className="font-medium">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
