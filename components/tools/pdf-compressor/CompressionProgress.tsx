import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { CompressionProgress as CompressionProgressType } from '@/lib/pdf-compressor/types';

interface CompressionProgressProps {
  progress: CompressionProgressType;
  onCancel: () => void;
}

export default function CompressionProgress({ progress, onCancel }: CompressionProgressProps) {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((progress.percentage || 0) / 100) * circumference;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center space-y-8 p-8 max-w-xl mx-auto bg-white/[0.02] border border-white/10 rounded-3xl backdrop-blur-xl"
    >
      {/* Circular Progress */}
      <div className="relative w-[200px] h-[200px] flex items-center justify-center">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-[40px] animate-pulse" />
        
        <svg className="w-full h-full -rotate-90 transform relative z-10">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-white/10"
          />
          {/* Progress circle */}
          <motion.circle
            cx="100"
            cy="100"
            r={radius}
            stroke="url(#gradient)"
            strokeWidth="8"
            fill="transparent"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            strokeDasharray={circumference}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>

        {/* Percentage Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-white">
          <span className="text-4xl font-black tabular-nums tracking-tighter">
            {Math.round(progress.percentage || 0)}%
          </span>
        </div>
      </div>

      {/* Operation Text */}
      <div className="text-center space-y-2">
        <motion.h3 
          key={progress.phase}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400"
        >
          {progress.currentOperation || 'Compressing...'}
        </motion.h3>
        
        <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Pages</span>
            <span className="font-mono">{progress.pagesProcessed}/{progress.totalPages}</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Saved</span>
            <span className="font-mono">{(progress.bytesSaved / (1024 * 1024)).toFixed(1)} MB</span>
          </div>
          {progress.estimatedTimeRemaining > 0 && (
            <>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Time left</span>
                <span className="font-mono">{Math.ceil(progress.estimatedTimeRemaining / 1000)}s</span>
              </div>
            </>
          )}
        </div>
      </div>

      <button
        onClick={onCancel}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
        <span className="text-sm font-medium">Cancel</span>
      </button>
    </motion.div>
  );
}
