import { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { FileDigit, Image as ImageIcon, Activity } from 'lucide-react';
import type { CompressionResult } from '@/lib/pdf-compressor/types';

export default function ResultsDashboard({ result }: { result: CompressionResult }) {
  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#8b5cf6', '#3b82f6', '#06b6d4']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#8b5cf6', '#3b82f6', '#06b6d4']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const savedPercent = Math.round(result.compressionRatio * 100);
  
  const formatSize = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  
  const stats = [
    { label: 'Original', value: formatSize(result.originalSize), icon: FileDigit },
    { label: 'Compressed', value: formatSize(result.compressedSize), icon: Activity },
    { label: 'Time', value: `${(result.timeTaken / 1000).toFixed(1)}s`, icon: Activity },
    { label: 'Images Optimized', value: result.imagesCompressed.toString(), icon: ImageIcon },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto space-y-8"
    >
      <div className="text-center space-y-2 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-500/20 blur-[100px] -z-10 rounded-full pointer-events-none" />
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.6, delay: 0.2 }}
        >
          <h2 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-emerald-400 tracking-tighter drop-shadow-lg">
            -{savedPercent}%
          </h2>
        </motion.div>
        <p className="text-xl text-gray-400 font-medium">Space Saved Successfully</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md flex flex-col items-center text-center space-y-2"
            >
              <div className="p-2 rounded-full bg-white/5">
                <Icon className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Visual Size Comparison */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4"
      >
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Before: {formatSize(result.originalSize)}</span>
          <span className="text-emerald-400 font-bold">After: {formatSize(result.compressedSize)}</span>
        </div>
        <div className="relative h-6 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: "100%" }}
            animate={{ width: `${100 - savedPercent}%` }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 1 }}
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
