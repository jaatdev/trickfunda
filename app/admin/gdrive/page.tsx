"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cloud,
  Folder,
  File,
  FileJson,
  FileText,
  FileImage,
  ArrowRight,
  CheckSquare,
  Square,
  Search,
  RefreshCw,
  Eye,
  DownloadCloud,
  Clock,
  Trash2,
  X,
  ChevronRight,
  HardDrive,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

// Types
interface DriveItem {
  id: string;
  name: string;
  isFolder: boolean;
  mimeType: string;
  size?: number;
  modifiedTime?: string;
}

interface SyncHistoryItem {
  id: string;
  timestamp: number;
  driveUrl: string;
  targetPath: string;
  fileCount: number;
}

// Utility: format bytes
function formatBytes(bytes: number = 0, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default function GDriveManagerPage() {
  // Input State
  const [driveUrl, setDriveUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Drive Browsing State
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderHistory, setFolderHistory] = useState<{id: string, name: string}[]>([]);
  const [items, setItems] = useState<DriveItem[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  // Sync State
  const [targetPathSelect, setTargetPathSelect] = useState("subjects/");
  const [customPath, setCustomPath] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLog, setSyncLog] = useState<{msg: string, isError?: boolean}[]>([]);
  const [syncSuccess, setSyncSuccess] = useState<boolean | null>(null);
  
  // History State
  const [syncHistory, setSyncHistory] = useState<SyncHistoryItem[]>([]);

  // Preview State
  const [previewFile, setPreviewFile] = useState<DriveItem | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Load History on Mount
  useEffect(() => {
    try {
      const history = localStorage.getItem("gdrive_sync_history");
      if (history) setSyncHistory(JSON.parse(history));
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  // Save History
  const saveHistory = (newHistory: SyncHistoryItem[]) => {
    setSyncHistory(newHistory);
    localStorage.setItem("gdrive_sync_history", JSON.stringify(newHistory));
  };

  const getTargetFullPath = () => {
    return targetPathSelect === "Custom..." ? customPath : targetPathSelect;
  };

  const handleBrowse = async (urlOrId: string, folderName: string = "Root") => {
    if (!urlOrId.trim()) return;
    setIsLoading(true);
    setError(null);
    setItems([]);
    
    try {
      const isUrl = urlOrId.includes("drive.google.com");
      const payload = isUrl ? { action: "browse", url: urlOrId } : { action: "browse", folderId: urlOrId };
      
      const res = await fetch("/api/admin/gdrive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch drive contents");
      
      setItems(data.items || []);
      setCurrentFolderId(data.folderId || (isUrl ? null : urlOrId));
      
      if (isUrl) {
        setFolderHistory([{ id: data.folderId || "root", name: "Root" }]);
      } else {
        const existingIndex = folderHistory.findIndex(h => h.id === urlOrId);
        if (existingIndex >= 0) {
          setFolderHistory(folderHistory.slice(0, existingIndex + 1));
        } else {
          setFolderHistory([...folderHistory, { id: urlOrId, name: folderName }]);
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    const next = new Set(selectedItemIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedItemIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedItemIds.size === items.length && items.length > 0) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(items.map(i => i.id)));
    }
  };

  const handlePreview = async (item: DriveItem) => {
    setPreviewFile(item);
    setIsPreviewLoading(true);
    setPreviewContent(null);
    
    try {
      const res = await fetch("/api/admin/gdrive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "preview", fileId: item.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to preview");
      setPreviewContent(typeof data.content === 'object' ? JSON.stringify(data.content, null, 2) : data.content);
    } catch (err: any) {
      setPreviewContent(`Error: ${err.message}`);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [syncLog]);

  const handleSync = async () => {
    if (selectedItemIds.size === 0 || !currentFolderId) return;
    
    setIsSyncing(true);
    setSyncSuccess(null);
    setSyncLog([{ msg: "Initializing sync..." }]);
    
    const targetPath = getTargetFullPath();
    if (!targetPath) {
      setSyncLog(prev => [...prev, { msg: "Error: Target path cannot be empty", isError: true }]);
      setIsSyncing(false);
      return;
    }

    try {
      const selectedFiles = Array.from(selectedItemIds);
      
      const res = await fetch("/api/admin/gdrive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "sync", 
          folderId: currentFolderId, 
          targetPath, 
          selectedFiles 
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Sync failed");
      
      setSyncLog(prev => [...prev, ...data.log.map((msg: string) => ({ msg }))]);
      setSyncSuccess(data.success);
      
      if (data.success) {
        setSyncLog(prev => [...prev, { msg: "✨ Sync completed successfully!" }]);
        
        // Add to history
        const newHistoryItem: SyncHistoryItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          driveUrl: folderHistory[0]?.id || "unknown",
          targetPath,
          fileCount: selectedFiles.length
        };
        saveHistory([newHistoryItem, ...syncHistory].slice(0, 5));
      } else {
        setSyncLog(prev => [...prev, { msg: "❌ Sync finished with errors.", isError: true }]);
      }
      
    } catch (err: any) {
      setSyncLog(prev => [...prev, { msg: `Error: ${err.message}`, isError: true }]);
      setSyncSuccess(false);
    } finally {
      setIsSyncing(false);
    }
  };

  const getFileIcon = (item: DriveItem) => {
    if (item.isFolder) return <Folder className="w-5 h-5 text-blue-500 fill-blue-500/20" />;
    if (item.mimeType.includes("json")) return <FileJson className="w-5 h-5 text-amber-500" />;
    if (item.mimeType.includes("pdf")) return <FileText className="w-5 h-5 text-red-500" />;
    if (item.mimeType.includes("image")) return <FileImage className="w-5 h-5 text-pink-500" />;
    if (item.mimeType.includes("markdown") || item.name.endsWith('.md')) return <FileText className="w-5 h-5 text-purple-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const selectedSize = items
    .filter(i => selectedItemIds.has(i.id))
    .reduce((acc, curr) => acc + (curr.size || 0), 0);

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-emerald-500 to-amber-500 dark:from-blue-400 dark:via-emerald-400 dark:to-amber-400 flex items-center gap-3">
            <HardDrive className="w-8 h-8 text-blue-500" />
            Google Drive Sync
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Import study materials, subjects, and vocab directly from Google Drive.
          </p>
        </div>
      </div>

      {/* URL Input Bar */}
      <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm p-4">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleBrowse(driveUrl); }}
          className="relative flex items-center"
        >
          <div className="absolute left-4 text-gray-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={driveUrl}
            onChange={(e) => setDriveUrl(e.target.value)}
            placeholder="Paste a Google Drive folder URL or ID..."
            className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl py-4 pl-12 pr-32 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !driveUrl.trim()}
            className="absolute right-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg font-medium transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Browse"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-red-500 text-sm flex items-center gap-2 px-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </motion.div>
        )}
      </div>

      {/* Split Panel View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Panel: Drive Tree */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[600px]">
          {/* Tree Header / Breadcrumbs */}
          <div className="p-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 overflow-x-auto whitespace-nowrap hide-scrollbar">
              {folderHistory.length === 0 ? (
                <span className="flex items-center gap-2"><Cloud className="w-4 h-4" /> No folder loaded</span>
              ) : (
                folderHistory.map((hist, idx) => (
                  <React.Fragment key={hist.id}>
                    <button
                      onClick={() => handleBrowse(hist.id, hist.name)}
                      className="hover:text-blue-500 transition-colors truncate max-w-[150px]"
                    >
                      {hist.name}
                    </button>
                    {idx < folderHistory.length - 1 && <ChevronRight className="w-4 h-4 shrink-0" />}
                  </React.Fragment>
                ))
              )}
            </div>
            
            <button
              onClick={toggleSelectAll}
              disabled={items.length === 0}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50"
            >
              {selectedItemIds.size === items.length && items.length > 0 ? (
                <><CheckSquare className="w-4 h-4 text-blue-500" /> Unselect All</>
              ) : (
                <><Square className="w-4 h-4" /> Select All</>
              )}
            </button>
          </div>

          {/* Tree Content */}
          <div className="flex-1 overflow-y-auto p-2">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
                <p>Loading folder contents...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Cloud className="w-16 h-16 mb-4 opacity-20" />
                <p>Enter a URL to browse Google Drive</p>
              </div>
            ) : (
              <div className="space-y-1">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`group flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer ${
                      selectedItemIds.has(item.id) ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                    }`}
                    onClick={() => {
                      if (item.isFolder) handleBrowse(item.id, item.name);
                      else toggleSelection(item.id);
                    }}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSelection(item.id); }}
                        className="shrink-0 text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        {selectedItemIds.has(item.id) ? (
                          <CheckSquare className="w-5 h-5 text-blue-500" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                      <div className="shrink-0">{getFileIcon(item)}</div>
                      <span className="truncate font-medium text-gray-700 dark:text-gray-200 text-sm">
                        {item.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 pl-4">
                      {!item.isFolder && item.size !== undefined && (
                        <span className="text-xs text-gray-400 bg-gray-100 dark:bg-[#1a1a1a] px-2 py-1 rounded-md">
                          {formatBytes(item.size)}
                        </span>
                      )}
                      {!item.isFolder && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handlePreview(item); }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/20 rounded-md transition-all"
                          title="Preview File"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Sync Config */}
        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm p-6 flex flex-col h-[600px]">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <DownloadCloud className="w-5 h-5 text-emerald-500" /> Sync Configuration
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Target Directory</label>
              <select
                value={targetPathSelect}
                onChange={(e) => setTargetPathSelect(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="subjects/">subjects/</option>
                <option value="study-material/">study-material/</option>
                <option value="vocab/">vocab/</option>
                <option value="vocab-trickfunda/">vocab-trickfunda/</option>
                <option value="Custom...">Custom...</option>
              </select>
              
              {targetPathSelect === "Custom..." && (
                <motion.input
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  type="text"
                  value={customPath}
                  onChange={(e) => setCustomPath(e.target.value)}
                  placeholder="e.g. data/custom-folder"
                  className="w-full mt-3 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              )}
            </div>

            <div className="bg-gray-50 dark:bg-white/[0.02] rounded-xl p-4 border border-gray-100 dark:border-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">Selected Items</span>
                <span className="font-semibold text-gray-900 dark:text-white">{selectedItemIds.size}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Total Size</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatBytes(selectedSize)}</span>
              </div>
            </div>

            <button
              onClick={handleSync}
              disabled={isSyncing || selectedItemIds.size === 0}
              className="w-full relative overflow-hidden group bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold py-4 rounded-xl shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isSyncing ? (
                <><RefreshCw className="w-5 h-5 animate-spin" /> Syncing...</>
              ) : (
                <><DownloadCloud className="w-5 h-5" /> Start Sync</>
              )}
              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]" />
            </button>
          </div>

          {/* Sync Log */}
          <div className="mt-6 flex-1 flex flex-col min-h-0 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-[#0d1117]">
            <div className="px-3 py-2 bg-[#161b22] text-xs font-mono text-gray-400 border-b border-gray-700 flex justify-between items-center">
              <span>Terminal Log</span>
              {syncSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            </div>
            <div ref={logRef} className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1">
              {syncLog.length === 0 ? (
                <div className="text-gray-600 text-center mt-10">No sync activity yet.</div>
              ) : (
                syncLog.map((log, i) => (
                  <div key={i} className={`${log.isError ? 'text-red-400' : 'text-gray-300'}`}>
                    <span className="text-gray-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                    {log.msg}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Sync History */}
      {syncHistory.length > 0 && (
        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" /> Recent Syncs
            </h2>
            <button
              onClick={() => saveHistory([])}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" /> Clear History
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {syncHistory.map((hist) => (
              <div key={hist.id} className="p-4 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
                <div className="text-xs text-gray-400 mb-2">
                  {new Date(hist.timestamp).toLocaleString()}
                </div>
                <div className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate mb-1">
                  Folder: {hist.driveUrl}
                </div>
                <div className="text-sm text-gray-500 truncate mb-3">
                  Target: <span className="text-emerald-500">{hist.targetPath}</span>
                </div>
                <div className="text-xs font-medium bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 inline-flex px-2 py-1 rounded-md">
                  {hist.fileCount} items synced
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {previewFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewFile(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[85vh] bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/10">
                <div className="flex items-center gap-3">
                  {getFileIcon(previewFile)}
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate max-w-md">
                    {previewFile.name}
                  </h3>
                </div>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-auto bg-gray-50 dark:bg-[#0a0a0a] p-6 relative">
                {isPreviewLoading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
                    <p>Loading preview...</p>
                  </div>
                ) : (
                  <pre className="text-sm font-mono text-gray-800 dark:text-gray-300 whitespace-pre-wrap break-words">
                    {previewContent}
                  </pre>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
