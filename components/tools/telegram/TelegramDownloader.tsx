import React, { useState, useEffect, useRef } from 'react';
import { Download, Link as LinkIcon, LogOut, Check, Loader2, Terminal, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  username: string;
  onLogout: () => void;
}

export const TelegramDownloader: React.FC<Props> = ({ username, onLogout }) => {
  const [link, setLink] = useState('');
  const [status, setStatus] = useState<'idle' | 'fetching' | 'downloading' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState('');
  const logsEndRef = useRef<HTMLDivElement>(null);
  
  const addLog = (msg: string) => setLogs(p => [...p, msg]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleDownload = async () => {
    if (!link) return;
    setStatus('fetching');
    setError('');
    setProgress(0);
    setLogs([]);
    
    try {
      const res = await fetch('/api/tools/telegram/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link })
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Download request failed');
      }
      
      if (!res.body) throw new Error('No stream returned');
      
      setStatus('downloading');
      
      const reader = res.body.getReader();
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
          let data: any = '';
          
          for (const line of lines) {
            if (line.startsWith('event: ')) type = line.replace('event: ', '').trim();
            if (line.startsWith('data: ')) {
               try {
                 data = JSON.parse(line.replace('data: ', '').trim());
               } catch(e) {
                 data = line.replace('data: ', '').trim();
               }
            }
          }
          
          if (type === 'progress') {
             setProgress(data.percentage);
          } else if (type === 'info') {
             addLog(data);
          } else if (type === 'success') {
             addLog(data);
             setStatus('success');
             setTimeout(() => setStatus('idle'), 5000);
          } else if (type === 'error') {
             setError(data);
             setStatus('error');
          }
        }
      }
    } catch (err: any) {
      setError(err.message);
      setStatus('error');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/tools/telegram/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' })
    });
    onLogout();
  };

  return (
    <div className="max-w-3xl w-full mx-auto space-y-6">
      
      {/* Header Profile Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 flex items-center justify-between backdrop-blur-md"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg">
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-bold text-white">Connected as {username}</p>
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> MTProto API Active
            </p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-rose-400 transition-colors border border-white/10"
          title="Logout and clear session"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Main Downloader Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/[0.02] border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-50" />
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Restricted Media Downloader</h2>
          <p className="text-sm text-gray-400">
            Paste a link to any Telegram message (e.g. <code className="text-blue-400">https://t.me/c/12345/678</code>) to bypass saving restrictions.
          </p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
            <input
              type="text"
              value={link}
              onChange={e => setLink(e.target.value)}
              placeholder="https://t.me/c/..."
              className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-blue-500/50 transition-colors shadow-inner"
            />
          </div>

          <button
            onClick={handleDownload}
            disabled={status === 'fetching' || status === 'downloading' || !link}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl py-4 font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
          >
            {(status === 'fetching' || status === 'downloading') ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : status === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            {status === 'fetching' ? 'Connecting...' 
             : status === 'downloading' ? `Downloading ${progress}%` 
             : status === 'success' ? 'Download Complete!' 
             : 'Extract & Download Media'}
          </button>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        {/* Terminal Logs */}
        <AnimatePresence>
          {logs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-8 bg-[#0D1117] border border-white/10 rounded-xl overflow-hidden"
            >
              <div className="bg-black/40 px-4 py-2 border-b border-white/10 flex items-center gap-2 text-xs text-gray-400 font-mono">
                <Terminal className="w-3 h-3" />
                Extraction Progress
              </div>
              <div className="p-4 max-h-48 overflow-y-auto custom-scrollbar font-mono text-xs space-y-2">
                {logs.map((log, i) => (
                  <div key={i} className="text-gray-300 flex items-start gap-2">
                    <span className="text-blue-500 shrink-0">{'>'}</span>
                    <span>{log}</span>
                  </div>
                ))}
                {status === 'downloading' && (
                  <div className="text-emerald-400 flex items-center gap-2">
                    <span className="text-blue-500">{'>'}</span>
                    Streaming to disk...
                    <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden ml-2">
                      <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                    {progress}%
                  </div>
                )}
                <div ref={logsEndRef} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
};
