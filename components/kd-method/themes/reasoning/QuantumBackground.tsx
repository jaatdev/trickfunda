'use client';

import { motion } from 'framer-motion';

export function QuantumBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-[#0A0014]">
      
      {/* Pulsing Quantum Field */}
      <motion.div 
        animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15)_0%,transparent_70%)] blur-[50px] mix-blend-screen"
      />

      {/* Rotating Energy Rings */}
      <motion.div
        animate={{ rotate: 360, scale: [1, 1.05, 1] }}
        transition={{ rotate: { duration: 20, repeat: Infinity, ease: 'linear' }, scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] border-[1px] border-fuchsia-500/20 rounded-full border-dashed"
      />
      
      <motion.div
        animate={{ rotate: -360, scale: [1, 1.1, 1] }}
        transition={{ rotate: { duration: 30, repeat: Infinity, ease: 'linear' }, scale: { duration: 6, repeat: Infinity, ease: 'easeInOut' } }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[700px] max-h-[700px] border-[1px] border-purple-500/10 rounded-full"
      />

      {/* Cyber Hex Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-rule='evenodd' stroke='%23a855f7' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}
      />
    </div>
  );
}
