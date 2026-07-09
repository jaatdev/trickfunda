"use client";

import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, Copy, CheckCircle2, FileVideo } from 'lucide-react';

interface MediaFile {
  name: string;
  url: string;
  size: number;
  mtime: number;
}

export default function MediaManagerPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [folder, setFolder] = useState('uploads');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/upload?folder=${folder}`);
      const data = await res.json();
      if (res.ok) {
        setFiles(data.files || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [folder]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    formData.append('folder', folder);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (res.ok) {
        fetchFiles(); // Refresh list
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (e) {
      console.error(e);
      alert('Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (url: string) => {
    if (!confirm('Are you sure you want to delete this file? It will break any links pointing to it.')) return;
    
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      if (res.ok) {
        setFiles(files.filter(f => f.url !== url));
      } else {
        const data = await res.json();
        alert(data.error || 'Delete failed');
      }
    } catch (e) {
      console.error(e);
      alert('Delete failed');
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const isImage = (name: string) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name);

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Media Manager
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Upload and manage assets for your notes and quizzes.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-xl outline-none font-medium text-sm"
          >
            <option value="uploads">/uploads (General)</option>
            <option value="figures">/figures (Geometry)</option>
          </select>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            className="hidden"
            accept="image/*,video/*,.pdf"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {isUploading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <UploadCloud className="w-4 h-4" />
            )}
            Upload File
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm p-6 overflow-y-auto">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : files.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-gray-200 dark:border-white/10">
              <ImageIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Media Found</h3>
            <p className="text-gray-500 max-w-sm mb-6">You haven't uploaded any files to this directory yet. Upload an image to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {files.map((file) => (
              <div key={file.url} className="group relative bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden aspect-square flex flex-col">
                <div className="flex-1 relative overflow-hidden bg-black/5 dark:bg-black/20 flex items-center justify-center">
                  {isImage(file.name) ? (
                    <img 
                      src={file.url} 
                      alt={file.name}
                      className="w-full h-full object-contain p-2"
                      loading="lazy"
                    />
                  ) : (
                    <FileVideo className="w-10 h-10 text-gray-400" />
                  )}
                  
                  {/* Overlay actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                    <button
                      onClick={() => copyToClipboard(file.url)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm backdrop-blur-md transition-colors"
                    >
                      {copiedUrl === file.url ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      {copiedUrl === file.url ? 'Copied!' : 'Copy URL'}
                    </button>
                    <button
                      onClick={() => handleDelete(file.url)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg text-sm backdrop-blur-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="px-3 py-2 border-t border-gray-200 dark:border-white/5 bg-white dark:bg-[#1a1a1a]">
                  <p className="text-xs font-medium truncate text-gray-700 dark:text-gray-300" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {formatSize(file.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
