'use client';

import { motion } from 'framer-motion';

export function LexiconBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-[#0A0500]">
      
      {/* Soft ethereal dust particles */}
      <div className="absolute inset-0 opacity-40 mix-blend-screen"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.1) 0%, transparent 60%)',
          backgroundSize: '100% 100%'
        }}
      />

      {/* Elegant floating orbs */}
      <motion.div
        animate={{ y: [-20, 20], x: [-10, 10], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "mirror" }}
        className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-amber-900/20 rounded-full blur-[100px] mix-blend-screen"
      />
      
      <motion.div
        animate={{ y: [20, -20], x: [10, -10], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 15, repeat: Infinity, repeatType: "mirror" }}
        className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] bg-yellow-900/10 rounded-full blur-[80px] mix-blend-screen"
      />

      {/* Subtle manuscript texture */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxjaXJjbGUgY3g9IjEiIGN5PSIxIiByPSIxIiBmaWxsPSJyZ2JhKDIxMiwgMTc1LCA1NSwgMC4wNSkiLz48L3N2Zz4=')] opacity-20 mix-blend-overlay" />
    </div>
  );
}
