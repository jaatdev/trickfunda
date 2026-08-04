'use client';

import React, { useState } from 'react';
import { SniffedUrl } from '../../../hooks/useVideoSniffer';
import { Copy, Download, ExternalLink, FileJson, Check, Terminal, Scan, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  url: SniffedUrl | null;
}

export const URLInspector: React.FC<Props> = ({ url }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'success' | 'error'>('idle');

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownload = async () => {
    if (!url || isDownloading) return;

    setIsDownloading(true);
    setDownloadStatus('downloading');

    try {
      const response = await fetch('/api/tools/video-sniffer/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.url,
          filename: url.domain.replace(/[^a-z0-9]/gi, '_') + '_' + Date.now(),
          headers: url.headers
        })
      });

      if (!response.ok || !response.body) {
        throw new Error('Download request failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          if (!part.trim()) continue;
          const lines = part.split('\n');
          let type = 'log';
          for (const line of lines) {
            if (line.startsWith('event: ')) type = line.replace('event: ', '').trim();
          }
          if (type === 'done') {
            setDownloadStatus('success');
          } else if (type === 'error') {
            setDownloadStatus('error');
          }
        }
      }
    } catch {
      setDownloadStatus('error');
    } finally {
      setIsDownloading(false);
      setTimeout(() => setDownloadStatus('idle'), 5000);
    }
  };

  if (!url) {
    return (
      <div className="h-full min-h-[500px] bg-white/[0.02] border border-white/10 rounded-3xl backdrop-blur-xl flex flex-col items-center justify-center text-gray-500 p-8 text-center">
        <Scan className="w-16 h-16 mb-4 opacity-50 text-indigo-400" />
        <h3 className="text-xl font-bold text-gray-300 mb-2">Inspector Ready</h3>
        <p className="text-sm max-w-sm">Select a URL from the feed to view its full details, headers, and extraction options.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      key={url.id}
      className="bg-white/[0.02] border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col h-[calc(100vh-200px)] max-h-[800px] sticky top-24"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50" />
      
      <div className="p-6 border-b border-white/10 bg-black/20 flex justify-between items-center shrink-0">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Terminal className="w-5 h-5 text-indigo-400" />
          Request Inspector
        </h3>
        <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded text-xs font-mono border border-indigo-500/30">
          ID: {url.id.substring(0,8)}
        </span>
      </div>

      <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
        
        {/* Full URL */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Full URL</h4>
            <button 
              onClick={() => handleCopy(url.url, 'full-url')}
              className="text-xs flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
            >
              {copiedKey === 'full-url' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedKey === 'full-url' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="bg-[#0D1117] border border-white/10 rounded-xl p-4 font-mono text-xs text-gray-300 break-all shadow-inner max-h-40 overflow-y-auto custom-scrollbar">
            {url.url}
          </div>
        </div>

        {/* Headers */}
        {Object.keys(url.headers || {}).length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Request Headers</h4>
            <div className="bg-[#0D1117] border border-white/10 rounded-xl overflow-hidden shadow-inner">
              {Object.entries(url.headers).map(([key, val], idx) => (
                <div key={key} className={`flex items-start p-3 text-xs font-mono ${idx !== 0 ? 'border-t border-white/5' : ''}`}>
                  <div className="w-1/3 text-indigo-300 shrink-0 font-bold pr-2 truncate" title={key}>{key}</div>
                  <div className="w-2/3 text-gray-400 break-all pr-8 relative group">
                    <span className="line-clamp-2 hover:line-clamp-none transition-all">{val}</span>
                    <button 
                      onClick={() => handleCopy(val, `hdr-${key}`)}
                      className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 p-1 bg-black/50 rounded text-gray-300 hover:text-white transition-all"
                    >
                      {copiedKey === `hdr-${key}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tokens */}
        {Object.keys(url.tokens || {}).length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Extracted Tokens</h4>
            <div className="bg-[#0D1117] border border-white/10 rounded-xl overflow-hidden shadow-inner">
              {Object.entries(url.tokens).map(([key, val], idx) => (
                <div key={key} className={`flex items-center p-3 text-xs font-mono ${idx !== 0 ? 'border-t border-white/5' : ''}`}>
                  <div className="w-1/3 text-emerald-400 shrink-0 font-bold pr-2 truncate">{key}</div>
                  <div className="w-2/3 text-gray-400 truncate pr-8 relative group">
                    {val}
                    <button 
                      onClick={() => handleCopy(val, `tok-${key}`)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 bg-black/50 rounded text-gray-300 hover:text-white transition-all"
                    >
                      {copiedKey === `tok-${key}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Actions */}
      <div className="p-6 border-t border-white/10 bg-black/20 shrink-0 grid grid-cols-2 gap-3">
        <button 
          onClick={() => handleCopy(url.url, 'btn-url')}
          className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 transition-colors text-gray-300 hover:text-white text-xs font-medium"
        >
          {copiedKey === 'btn-url' ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
          Copy URL
        </button>
        
        <button 
          onClick={() => handleCopy(JSON.stringify(url, null, 2), 'btn-json')}
          className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 transition-colors text-gray-300 hover:text-white text-xs font-medium"
        >
          {copiedKey === 'btn-json' ? <Check className="w-5 h-5 text-emerald-400" /> : <FileJson className="w-5 h-5" />}
          Copy JSON Data
        </button>
        
        <a 
          href={url.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 transition-colors text-gray-300 hover:text-white text-xs font-medium"
        >
          <ExternalLink className="w-5 h-5" />
          Open in New Tab
        </a>
        
        <button 
          onClick={handleDownload}
          disabled={isDownloading}
          className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-colors text-xs font-medium ${
            downloadStatus === 'success'
              ? 'bg-emerald-600/20 border-emerald-500/30 text-emerald-300'
              : downloadStatus === 'error'
              ? 'bg-rose-600/20 border-rose-500/30 text-rose-300'
              : 'bg-indigo-600/20 hover:bg-indigo-600/40 border-indigo-500/30 text-indigo-300 hover:text-indigo-100 shadow-[0_0_15px_rgba(79,70,229,0.15)]'
          } disabled:opacity-50`}
        >
          {isDownloading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : downloadStatus === 'success' ? (
            <Check className="w-5 h-5" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          {downloadStatus === 'success' ? 'Download Started!' : downloadStatus === 'error' ? 'Failed — Retry' : 'Send to Downloader'}
        </button>
      </div>

    </motion.div>
  );
};
