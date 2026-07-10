'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function FloatingHomeButton() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="fixed top-4 left-4 z-[9999]"
    >
      <Link 
        href="/tools"
        className="group flex items-center gap-3 bg-black/60 backdrop-blur-xl border border-white/10 pr-4 pl-2 py-2 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:bg-black/80 hover:border-white/20 transition-all duration-300"
      >
        <div className="bg-white/10 rounded-full p-1.5 group-hover:bg-white/20 transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-300 group-hover:text-white" />
        </div>
        <div className="flex items-center gap-2">
          <img 
            src="/logo.jpg" 
            alt="TrickFunda Logo" 
            className="w-7 h-7 object-contain drop-shadow-[0_0_10px_rgba(255,215,0,0.3)] group-hover:scale-110 transition-transform duration-300" 
          />
          <span className="font-bold text-sm tracking-tight bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent drop-shadow-sm">
            TrickFunda
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
