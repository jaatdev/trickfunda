'use client';

import { motion } from 'framer-motion';

export function CyberBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-[#050B14]">
      
      {/* Heavy Cyber Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,11,20,0.95)_100%)] z-20" />

      {/* Cyber Grid Plane - Floor */}
      <div className="absolute inset-0" style={{ perspective: '1000px' }}>
        <motion.div 
          animate={{ backgroundPosition: ['0px 0px', '0px 100px'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-[-50%] left-[-50%] w-[200%] h-[150%] origin-top opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, #00F0FF 1px, transparent 1px),
              linear-gradient(to bottom, #00F0FF 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            transform: 'rotateX(75deg) translateZ(-200px)',
            maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)'
          }}
        />
      </div>

      {/* Falling Data Streams (Digital Rain approximation) */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-[-100%] w-[1px] bg-gradient-to-b from-transparent via-[#00F0FF] to-transparent"
            style={{ 
              left: `${Math.random() * 100}%`,
              height: `${Math.random() * 200 + 100}px`,
              filter: 'blur(1px)'
            }}
            animate={{ top: ['-100%', '200%'] }}
            transition={{ 
              duration: Math.random() * 5 + 5, 
              repeat: Infinity, 
              ease: 'linear',
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      {/* Ambient Neon Glows */}
      <motion.div
        animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#00F0FF]/10 blur-[120px] rounded-full mix-blend-screen"
      />
      
      <motion.div
        animate={{ opacity: [0.1, 0.15, 0.1], scale: [1, 1.2, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[#00F0FF]/10 blur-[150px] rounded-full mix-blend-screen"
      />

      {/* CRT Scanline */}
      <motion.div 
        animate={{ top: ['-10%', '110%'] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        className="absolute left-0 right-0 h-[2px] bg-[#00F0FF]/30 blur-[1px] z-30 pointer-events-none"
        style={{ boxShadow: '0 0 10px 2px rgba(0, 240, 255, 0.2)' }}
      />
    </div>
  );
}
