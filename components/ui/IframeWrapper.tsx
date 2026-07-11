'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, AlertCircle } from 'lucide-react';

interface IframeWrapperProps {
  src: string;
  title: string;
  allow?: string;
}

export default function IframeWrapper({ src, title, allow }: IframeWrapperProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSlowNetwork, setIsSlowNetwork] = useState(false);

  // If the iframe takes more than 5 seconds to trigger onLoad, show a slow network warning
  useEffect(() => {
    const timer = setTimeout(() => setIsSlowNetwork(true), 5000);
    return () => clearTimeout(timer);
  }, []);

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
                
                <AnimatePresence>
                  {isSlowNetwork && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 flex flex-col items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
                    >
                      <div className="flex items-center gap-2 text-red-400">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-medium text-sm">Taking too long?</span>
                      </div>
                      <p className="text-xs text-red-400/80 max-w-[250px]">
                        Your VPN or ISP might be blocking embedded tools. Click the button in the top right to open in a new tab.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
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

      {/* Persistent Pop-out Button for VPN/Network issues */}
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-4 right-4 z-40 flex items-center gap-2 px-4 py-2.5 bg-black/50 hover:bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl transition-all shadow-xl hover:scale-105 group"
        title="Open in new tab (Use this if the tool fails to load)"
      >
        <span className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">
          Open in New Tab
        </span>
        <ExternalLink className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
      </a>
    </div>
  );
}
