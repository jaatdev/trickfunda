'use client';

import React, { useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

export default function SyncDataButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSync = async () => {
    setIsSyncing(true);
    setStatus('idle');
    setMessage('');

    try {
      const response = await fetch('/api/admin/sync', {
        method: 'POST',
      });
      
      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Sync triggered successfully! Vercel is building the new changes. They will be live in ~2 minutes.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to trigger sync');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'An unexpected error occurred');
    } finally {
      setIsSyncing(false);
      
      // Clear status after 10 seconds if success
      if (status !== 'error') {
        setTimeout(() => {
          setStatus('idle');
        }, 10000);
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleSync}
        disabled={isSyncing}
        className={`flex items-center gap-4 p-3 rounded-xl transition-all border group relative overflow-hidden ${
          isSyncing 
            ? 'bg-emerald-500/10 border-emerald-500/20 cursor-not-allowed' 
            : 'bg-white/10 hover:bg-white/20 border-white/10'
        }`}
      >
        <div className={`w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center transition-transform ${isSyncing ? 'animate-pulse' : 'group-hover:scale-110'}`}>
          <RefreshCw className={`w-5 h-5 text-white ${isSyncing ? 'animate-spin' : ''}`} />
        </div>
        <div className="text-left flex-1">
          <div className="font-semibold text-white">
            {isSyncing ? 'Triggering Sync...' : 'Sync with Google Drive'}
          </div>
          <div className="text-xs text-emerald-100">
            {isSyncing ? 'Please wait' : 'Fetch latest changes (takes ~2m to go live)'}
          </div>
        </div>
      </button>

      {status === 'success' && (
        <div className="flex items-start gap-2 p-3 text-sm rounded-xl bg-emerald-500/20 text-emerald-100 border border-emerald-500/30 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{message}</p>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-start gap-2 p-3 text-sm rounded-xl bg-red-500/20 text-red-100 border border-red-500/30 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{message}</p>
        </div>
      )}
    </div>
  );
}
