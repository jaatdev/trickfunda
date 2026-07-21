'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useVideoStore } from '@video-canvas/store/useVideoStore';

export const ToolbarToggle = () => {
  const isToolbarVisible = useVideoStore((state) => state.isToolbarVisible);
  const toggleToolbar = useVideoStore((state) => state.toggleToolbar);

  return (
    <motion.button
      onClick={toggleToolbar}
      className="fixed z-[99999] bottom-5 right-5 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white shadow-xl overflow-hidden group hover:bg-white/20 transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        scale: isToolbarVisible ? 1 : [1, 1.05, 1],
        boxShadow: isToolbarVisible 
          ? "0px 0px 0px rgba(0,0,0,0)" 
          : "0px 0px 20px rgba(255,255,255,0.1)"
      }}
      transition={{
        scale: {
          duration: 2,
          repeat: isToolbarVisible ? 0 : Infinity,
          repeatType: "reverse"
        }
      }}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isToolbarVisible ? 90 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative flex items-center justify-center w-full h-full"
      >
        {isToolbarVisible ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </motion.div>
    </motion.button>
  );
};
