'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IframeWrapperProps {
  src: string;
  title: string;
  allow?: string;
}

export default function IframeWrapper({ src, title, allow }: IframeWrapperProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Loading Skeleton Overlay */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black backdrop-blur-3xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-blue-600/10 pointer-events-none" />
            
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="flex flex-col items-center gap-6"
            >
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
                <div className="absolute inset-0 border-4 border-t-yellow-400 border-r-amber-400 border-b-transparent border-l-transparent rounded-full animate-spin" />
                <img src="/logo.jpg" alt="TrickFunda Logo" className="absolute inset-2 w-16 h-16 object-contain rounded-full opacity-80" />
              </div>
              <div className="space-y-2 text-center">
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                  Loading Workspace...
                </h3>
                <p className="text-sm text-gray-400 font-medium tracking-wide">
                  Preparing your tools
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The actual iframe */}
      <motion.iframe
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 1 }}
        src={src}
        className="w-full h-screen block border-none m-0 p-0 overflow-hidden"
        style={{ minHeight: '100dvh' }}
        title={title}
        allow={allow}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
}
