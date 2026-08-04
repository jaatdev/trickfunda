import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Download } from 'lucide-react';

interface Props {
  isConnected: boolean;
}

export const ConnectionStatus: React.FC<Props> = ({ isConnected }) => {
  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {isConnected ? (
          <motion.div
            key="connected"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full w-fit mx-auto"
          >
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            <Wifi className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">Extension Connected (v1.0.0)</span>
          </motion.div>
        ) : (
          <motion.div
            key="disconnected"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-full w-fit mx-auto">
              <div className="relative flex h-3 w-3">
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </div>
              <WifiOff className="w-4 h-4 text-rose-400" />
              <span className="text-sm font-medium text-rose-400">Extension Not Detected</span>
            </div>
            
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl max-w-2xl text-left w-full relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-orange-500 opacity-50" />
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Download className="w-5 h-5 text-indigo-400" /> Setup Required
              </h3>
              <p className="text-gray-400 mb-6 text-sm">
                To intercept video streams (m3u8, mp4, ts), you need to install the TrickFunda Video Sniffer extension.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "1. Download the extension folder",
                  "2. Open chrome://extensions",
                  "3. Enable Developer Mode (top right)",
                  "4. Click 'Load Unpacked' & select folder"
                ].map((step, idx) => (
                  <div key={idx} className="bg-black/30 border border-white/5 p-4 rounded-xl flex items-start gap-3">
                    <span className="bg-indigo-500/20 text-indigo-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-gray-300">{step.substring(3)}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
