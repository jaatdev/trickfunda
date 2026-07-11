'use client';

import { motion } from 'framer-motion';

export function HologramBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-[#001010]">
      
      {/* Laser Scanning Line */}
      <motion.div
        animate={{ y: ['-10%', '110%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        className="absolute top-0 left-0 right-0 h-1 bg-cyan-400/30 shadow-[0_0_20px_rgba(34,211,238,0.8)] z-10"
      />

      {/* Hologram Grid */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(34, 211, 238, 0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(34, 211, 238, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          transform: 'perspective(1000px) rotateX(60deg) scale(2.5) translateY(-20%)',
          transformOrigin: 'top center',
        }}
      />

      {/* Deep Holographic Glow */}
      <div className="absolute top-[20%] left-[20%] w-[60%] h-[60%] bg-cyan-900/20 rounded-full blur-[150px] mix-blend-screen" />
      <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-emerald-900/20 rounded-full blur-[120px] mix-blend-screen" />
      
      {/* CRT Scanline effect */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjEiIGZpbGw9InJnYmEoMCwgMCwgMCwgMC4yKSIvPjwvc3ZnPg==')] opacity-40 mix-blend-overlay" />
    </div>
  );
}
