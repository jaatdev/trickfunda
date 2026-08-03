'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DownloadCloud, Play, Square, FileVideo, Terminal, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function VideoDownloaderPage() {
  const [url, setUrl] = useState('');
  const [filename, setFilename] = useState('');
  const [status, setStatus] = useState<'idle' | 'downloading' | 'success' | 'error'>('idle');
  const [logs, setLogs] = useState<{type: string, message: string}[]>([]);
  const [downloadLink, setDownloadLink] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const terminalBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [logs]);

  const handleStartDownload = async () => {
    if (!url) return;

    setStatus('downloading');
    setLogs([]);
    setDownloadLink('');
    setErrorMessage('');
    
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const response = await fetch('/api/tools/video-downloader', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, filename }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to connect to the downloader service.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Parse SSE
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          if (!part.trim()) continue;
          
          const lines = part.split('\n');
          let type = 'log';
          let data = '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              type = line.replace('event: ', '').trim();
            } else if (line.startsWith('data: ')) {
              const rawData = line.replace('data: ', '').trim();
              try {
                data = JSON.parse(rawData);
              } catch (e) {
                data = rawData;
              }
            }
          }

          if (type === 'done') {
            setDownloadLink(data);
            setStatus('success');
          } else if (type === 'error') {
            setErrorMessage(data);
            setStatus('error');
          } else {
            setLogs((prev) => [...prev, { type, message: data }]);
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setLogs((prev) => [...prev, { type: 'error', message: 'Download aborted by user.' }]);
        setStatus('error');
      } else {
        setErrorMessage(err.message || 'An unexpected error occurred.');
        setStatus('error');
      }
    } finally {
      setAbortController(null);
    }
  };

  const handleStopDownload = () => {
    if (abortController) {
      abortController.abort();
    }
  };

  return (
    <div className="min-h-screen bg-[#030014] text-white relative overflow-hidden flex flex-col items-center pt-24 pb-12 px-4 selection:bg-indigo-500/30">
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] pointer-events-none mix-blend-overlay z-0" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none z-0" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl relative z-10 space-y-8"
      >
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-2">
            <DownloadCloud className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            Video Downloader
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Paste your m3u8, YouTube, or class video link below. We'll use yt-dlp to download and compile the fragments locally.
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 opacity-50" />
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Video URL <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://... (.m3u8, youtube, etc)"
                disabled={status === 'downloading'}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Output Filename (Optional)</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="my_class_video"
                  disabled={status === 'downloading'}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pr-16 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:opacity-50"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">.mp4</div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              {status === 'downloading' ? (
                <button
                  onClick={handleStopDownload}
                  className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl px-6 py-3 font-semibold transition-all"
                >
                  <Square className="w-5 h-5 fill-current" />
                  Stop Download
                </button>
              ) : (
                <button
                  onClick={handleStartDownload}
                  disabled={!url}
                  className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl px-8 py-3 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Start Download
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Terminal Output */}
        <AnimatePresence>
          {(status === 'downloading' || status === 'success' || status === 'error' || logs.length > 0) && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 32 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="bg-[#0D1117] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
            >
              {/* Terminal Header */}
              <div className="bg-[#161B22] border-b border-white/5 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Terminal className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-mono text-gray-400">yt-dlp output</span>
                </div>
                {status === 'downloading' && (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-3 h-3 text-indigo-400 animate-spin" />
                    <span className="text-xs font-mono text-indigo-400">Processing...</span>
                  </div>
                )}
              </div>

              {/* Terminal Body */}
              <div ref={terminalBodyRef} className="p-4 h-80 overflow-y-auto font-mono text-xs md:text-sm custom-scrollbar">
                {logs.length === 0 && status === 'downloading' && (
                  <div className="text-gray-500">Connecting to download server...</div>
                )}
                {logs.map((log, idx) => (
                  <div 
                    key={idx} 
                    className={`mb-1 ${
                      log.type === 'error' ? 'text-rose-400' : 
                      log.type === 'info' ? 'text-indigo-300' : 
                      log.type === 'success' ? 'text-emerald-400' : 
                      'text-gray-300'
                    }`}
                  >
                    <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString()}]</span>
                    {log.message}
                  </div>
                ))}
                
                {/* Result States inside terminal */}
                {status === 'error' && (
                  <div className="mt-4 flex items-center gap-2 text-rose-400 p-3 bg-rose-500/10 rounded border border-rose-500/20">
                    <AlertCircle className="w-4 h-4" />
                    <span>Download failed: {errorMessage}</span>
                  </div>
                )}
                
                {status === 'success' && downloadLink && (
                  <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-emerald-400">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-medium font-sans text-sm">Download completed successfully!</span>
                    </div>
                    <a 
                      href={downloadLink} 
                      download
                      className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-4 py-2 rounded-md font-sans text-sm font-semibold transition-colors flex items-center gap-2"
                    >
                      <FileVideo className="w-4 h-4" />
                      Save MP4 to Device
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>

      {/* Global CSS for scrollbar inside terminal */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0D1117; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #30363D; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #484F58; }
      `}} />
    </div>
  );
}
