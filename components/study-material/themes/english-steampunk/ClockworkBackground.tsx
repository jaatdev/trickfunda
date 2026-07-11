'use client';

import { motion } from 'framer-motion';

export function ClockworkBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-[#140F0A]">
      
      {/* Dark Leather Texture Approximation */}
      <div 
        className="absolute inset-0 opacity-40 mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Brass Edge Framing */}
      <div className="absolute inset-4 border-[4px] border-[#5C4B33] rounded-sm opacity-30 shadow-[inset_0_0_20px_rgba(0,0,0,1)]" />
      <div className="absolute inset-6 border border-[#D4AF37]/20 rounded-sm" />

      {/* Ticking Clockwork Mechanisms in Corners */}
      <motion.div
        animate={{ rotate: [0, 15, 15, 30, 30, 45, 45, 60, 60, 75, 75, 90] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        className="absolute top-10 left-10 w-32 h-32 border-4 border-[#B87333]/10 border-dashed rounded-full"
      />
      <motion.div
        animate={{ rotate: [0, -15, -15, -30, -30, -45, -45, -60, -60, -75, -75, -90] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-10 right-10 w-48 h-48 border-4 border-[#D4AF37]/10 border-dashed rounded-full"
      />

      {/* Warm Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_60%)] mix-blend-screen" />
    </div>
  );
}
