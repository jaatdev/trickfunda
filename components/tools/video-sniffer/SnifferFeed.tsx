import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SniffedUrl } from '../../../hooks/useVideoSniffer';
import { Radio } from 'lucide-react';

interface Props {
  urls: SniffedUrl[];
  onSelect: (id: string) => void;
  selectedId: string | null;
}

export const SnifferFeed: React.FC<Props> = ({ urls, onSelect, selectedId }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto scroll to top (latest) since we prepend
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [urls.length]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'm3u8': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case 'mp4': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'ts': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'mpd': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case '4K': return 'bg-purple-500/20 text-purple-400';
      case 'HD': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div 
      ref={containerRef}
      className="flex-1 bg-black/20 border border-white/5 rounded-2xl overflow-y-auto custom-scrollbar max-h-[600px] relative min-h-[300px] p-4"
    >
      {urls.length === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
          <Radio className="w-12 h-12 mb-4 opacity-50" />
          <p>No media URLs detected yet.</p>
          <p className="text-sm">Browse a video page to start sniffing.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {urls.map((item) => {
              const isSelected = selectedId === item.id;
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => onSelect(item.id)}
                  className={`cursor-pointer p-4 rounded-xl border transition-all ${
                    isSelected 
                      ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Badge */}
                    <div className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase border ${getTypeColor(item.type)}`}>
                      {item.type}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-mono text-gray-300 truncate mb-1" title={item.url}>
                        {item.url}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="truncate max-w-[150px]">{item.domain}</span>
                        <span>•</span>
                        <span className="truncate">{item.tabTitle}</span>
                      </div>
                    </div>
                    
                    {/* Right Meta */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${getQualityColor(item.quality)}`}>
                        {item.quality}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {formatTime(item.timestamp)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
