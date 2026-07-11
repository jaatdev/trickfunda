'use client';

import { motion } from 'framer-motion';

export function ConstructorBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-[#0A1128]">
      
      {/* Drafting Grid */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(56, 189, 248, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(56, 189, 248, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
        }}
      />
      
      {/* Major Grid Lines */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(56, 189, 248, 0.6) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(56, 189, 248, 0.6) 1px, transparent 1px)
          `,
          backgroundSize: '150px 150px',
        }}
      />

      {/* Rotating Geometric Primitives */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 100, repeat: Infinity, ease: 'linear' }}
        className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] border-[1px] border-sky-400/10 rounded-full"
      />
      
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 150, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] border-[1px] border-blue-400/10 rounded-sm"
      />

      {/* Scanning laser line (Horizontal) */}
      <motion.div
        animate={{ y: ['-10%', '110%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        className="absolute top-0 left-0 right-0 h-[1px] bg-sky-400/50 shadow-[0_0_10px_rgba(56,189,248,0.8)] z-10"
      />

      {/* Screen Glare / Edge Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,17,40,0.8)_100%)]" />
    </div>
  );
}
