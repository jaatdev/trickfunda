'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Radar, Search, Filter, Trash2, FileJson } from 'lucide-react';

import { useVideoSniffer, FilterType } from '../../../hooks/useVideoSniffer';
import { ConnectionStatus } from '../../../components/tools/video-sniffer/ConnectionStatus';
import { RadarAnimation } from '../../../components/tools/video-sniffer/RadarAnimation';
import { SnifferFeed } from '../../../components/tools/video-sniffer/SnifferFeed';
import { URLInspector } from '../../../components/tools/video-sniffer/URLInspector';

export default function VideoSnifferPage() {
  const {
    sniffedUrls,
    filteredUrls,
    isConnected,
    isScanning,
    selectedUrl,
    selectedId,
    filters,
    clearResults,
    toggleSniffer,
    selectUrl,
    setFilter
  } = useVideoSniffer();

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sniffedUrls, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", `sniffer_export_${new Date().toISOString()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const domainCount = new Set(sniffedUrls.map(u => u.domain)).size;

  return (
    <div className="min-h-screen bg-[#030014] text-white relative overflow-hidden flex flex-col items-center pt-24 pb-12 px-4 selection:bg-indigo-500/30">
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] pointer-events-none mix-blend-overlay z-0" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none z-0" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-7xl relative z-10 space-y-8"
      >
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-2">
            <Radar className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            Video Sniffer
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            1DM-style network interception. Detect hidden video streams from any website.
          </p>
        </div>

        {/* Connection Status */}
        <ConnectionStatus isConnected={isConnected} />

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
          
          {/* Left Column: Feed & Controls */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Top Stats & Radar Row */}
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-center gap-8 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-cyan-500 opacity-50" />
               <div className="shrink-0 scale-75 sm:scale-100">
                 <RadarAnimation isScanning={isScanning && isConnected} count={sniffedUrls.length} />
               </div>
               
               <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                 <div className="bg-black/20 border border-white/5 p-4 rounded-2xl">
                   <div className="text-sm text-gray-400 mb-1">Total URLs</div>
                   <div className="text-2xl font-bold text-white">{sniffedUrls.length}</div>
                 </div>
                 <div className="bg-black/20 border border-white/5 p-4 rounded-2xl">
                   <div className="text-sm text-gray-400 mb-1">Unique Domains</div>
                   <div className="text-2xl font-bold text-white">{domainCount}</div>
                 </div>
                 <button 
                   onClick={toggleSniffer}
                   disabled={!isConnected}
                   className={`col-span-2 p-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                     !isConnected ? 'bg-gray-800 text-gray-500 cursor-not-allowed' :
                     isScanning 
                       ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20' 
                       : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                   }`}
                 >
                   {isScanning ? 'Pause Interception' : 'Resume Interception'}
                 </button>
               </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Search URLs or Domains..."
                  value={filters.bySearch}
                  onChange={(e) => setFilter('bySearch', e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto custom-scrollbar pb-2 sm:pb-0">
                <Filter className="w-4 h-4 text-gray-500 shrink-0" />
                {(['all', 'm3u8', 'mp4', 'ts', 'mpd'] as FilterType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => setFilter('byType', type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider shrink-0 transition-colors ${
                      filters.byType === type 
                        ? 'bg-indigo-500 text-white' 
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Feed */}
            <SnifferFeed 
              urls={filteredUrls} 
              onSelect={selectUrl} 
              selectedId={selectedId} 
            />

            {/* Batch Actions */}
            <div className="flex justify-between items-center bg-white/[0.02] border border-white/10 rounded-xl p-2 backdrop-blur-sm">
              <button 
                onClick={clearResults}
                className="flex items-center gap-2 px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Clear All
              </button>
              <button 
                onClick={handleExportJson}
                disabled={sniffedUrls.length === 0}
                className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileJson className="w-4 h-4" /> Export JSON
              </button>
            </div>

          </div>

          {/* Right Column: Inspector */}
          <div className="lg:col-span-5 relative">
            <URLInspector url={selectedUrl} />
          </div>

        </div>

      </motion.div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}} />
    </div>
  );
}
