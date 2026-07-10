'use client';

import Link from 'next/link';
import { motion, useAnimationControls } from 'framer-motion';
import { useState } from 'react';

export default function FloatingHomeButton() {
  const [isHovered, setIsHovered] = useState(false);
  const textControls = useAnimationControls();

  const handleHoverStart = () => {
    setIsHovered(true);
    textControls.start({
      x: [0, -2, 2, -1, 1, 0],
      y: [0, 1, -1, 1, -1, 0],
      transition: { duration: 0.3 }
    });
  };

  const handleHoverEnd = () => {
    setIsHovered(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.8, type: 'spring', stiffness: 100 }}
      className="fixed top-4 right-4 z-[9990]"
    >
      <Link href="/tools">
        <motion.div 
          className="group relative flex items-center gap-3 bg-black/90 backdrop-blur-xl pl-2 pr-5 py-2 cursor-pointer overflow-hidden border-r-2 border-red-500/50"
          onHoverStart={handleHoverStart}
          onHoverEnd={handleHoverEnd}
          whileTap={{ scale: 0.95 }}
          style={{
            clipPath: 'polygon(10px 0, 100% 0, 100% 100%, 0 100%, 0 10px)'
          }}
        >
          {/* Cyber Top/Bottom borders */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

          {/* Animated Scanning Line */}
          <motion.div
            className="absolute top-0 left-0 w-full h-[2px] bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.8)] z-20"
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 4, ease: "linear", repeat: Infinity }}
            style={{ opacity: isHovered ? 1 : 0.3 }}
          />

          {/* Cyber Grid Background */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
               style={{ backgroundImage: 'linear-gradient(to right, #ef4444 1px, transparent 1px), linear-gradient(to bottom, #ef4444 1px, transparent 1px)', backgroundSize: '4px 4px' }} />

          {/* Logo with pulsing glow */}
          <div className="relative z-10 flex items-center justify-center">
            <motion.div
              className="absolute inset-0 rounded bg-red-500/20 blur-md"
              animate={{
                opacity: isHovered ? [0.4, 0.9, 0.4] : 0.2,
                scale: isHovered ? [1, 1.3, 1] : 1
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Hexagon wrapper for logo */}
            <div className="relative z-10 w-8 h-8 flex items-center justify-center bg-zinc-900 border border-red-500/30 overflow-hidden"
                 style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              <motion.img 
                src="/logo.jpg" 
                alt="TrickFunda Logo" 
                animate={{ 
                  scale: isHovered ? [1, 1.1, 1] : 1,
                  filter: isHovered ? ['hue-rotate(0deg)', 'hue-rotate(90deg)', 'hue-rotate(0deg)'] : 'grayscale(30%)'
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-[120%] h-[120%] object-cover opacity-90 mix-blend-screen" 
              />
            </div>
          </div>

          {/* Text with HUD styling */}
          <div className="relative z-10 flex flex-col justify-center">
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-[6px] font-mono text-red-500/70 tracking-[0.2em] leading-none mb-0.5"
            >
              SYS.MAIN
            </motion.div>
            <motion.span 
              animate={textControls}
              className="font-mono font-bold text-sm tracking-wider text-red-400 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]"
            >
              {isHovered ? 'TRICKFUNDA_' : 'TRICKFUNDA'}
            </motion.span>
          </div>

          {/* Glitch Overlay on Hover */}
          {isHovered && (
            <motion.div
              className="absolute inset-0 bg-red-500/10 mix-blend-overlay z-30 pointer-events-none"
              animate={{
                clipPath: [
                  'inset(20% 0 80% 0)',
                  'inset(60% 0 10% 0)',
                  'inset(10% 0 50% 0)',
                  'inset(80% 0 5% 0)',
                  'inset(0 0 0 0)'
                ],
                x: [-2, 2, -1, 1, 0]
              }}
              transition={{ duration: 0.2, repeat: Infinity, repeatType: "mirror" }}
            />
          )}
        </motion.div>
      </Link>
    </motion.div>
  );
}
