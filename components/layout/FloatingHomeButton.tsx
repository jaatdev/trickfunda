'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function FloatingHomeButton() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, duration: 0.5, type: 'spring', stiffness: 200, damping: 15 }}
      className="fixed top-4 right-4 z-[9999]"
    >
      <Link href="/tools">
        <motion.div 
          className="group flex items-center gap-3 bg-black/80 backdrop-blur-xl border border-amber-500/30 pl-2 pr-5 py-2 rounded-full overflow-hidden relative cursor-pointer"
          whileHover={{ scale: 1.05, borderColor: "rgba(245, 158, 11, 0.6)" }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: [
              "0 4px 20px rgba(0,0,0,0.5), inset 0 0 0px rgba(245, 158, 11, 0)",
              "0 4px 25px rgba(245,158,11,0.3), inset 0 0 12px rgba(245, 158, 11, 0.2)",
              "0 4px 20px rgba(0,0,0,0.5), inset 0 0 0px rgba(245, 158, 11, 0)"
            ],
            y: [0, -3, 0]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Animated sheen effect */}
          <motion.div
            className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent skew-x-[-45deg]"
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 1
            }}
          />

          {/* Logo with pulsing glow */}
          <div className="relative z-10 flex items-center justify-center">
            <motion.div
              className="absolute inset-0 rounded-lg bg-amber-500/40 blur-md"
              animate={{
                opacity: [0.4, 0.8, 0.4],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.img 
              src="/logo.jpg" 
              alt="TrickFunda Logo" 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-8 h-8 object-contain rounded-lg relative z-10 shadow-[0_0_10px_rgba(0,0,0,0.5)]" 
            />
          </div>

          <span className="font-extrabold text-base tracking-wide bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] relative z-10">
            TrickFunda
          </span>
        </motion.div>
      </Link>
    </motion.div>
  );
}
