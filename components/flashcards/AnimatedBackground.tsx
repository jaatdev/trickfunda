'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  size: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
}

export default function AnimatedBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate particles on client to avoid hydration mismatch
    const generated = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      size: Math.random() * 3 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 30 + 15,
      delay: Math.random() * -30, // Negative delay so they start already moving
    }));
    setParticles(generated);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Deep Space Base */}
      <div className="absolute inset-0 bg-[#050510] z-0" />
      
      {/* Animated Aurora Orbs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
          x: [0, 100, 0],
          y: [0, -50, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-blue-900/40 blur-[120px] mix-blend-screen z-10"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.5, 0.2],
          x: [0, -100, 0],
          y: [0, 100, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-[20%] right-[10%] w-[60vw] h-[60vw] rounded-full bg-purple-900/40 blur-[100px] mix-blend-screen z-10"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.4, 0.1],
          x: [0, 50, 0],
          y: [0, 100, 0]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        className="absolute -bottom-[20%] left-[20%] w-[80vw] h-[80vw] rounded-full bg-emerald-900/30 blur-[150px] mix-blend-screen z-10"
      />

      {/* Grid Overlay for Cyberpunk/Technical feel */}
      <div 
        className="absolute inset-0 z-20 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />

      {/* Drifting Geometric Particles */}
      <div className="absolute inset-0 z-20 overflow-hidden">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute bg-white/70 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              bottom: `-5%`,
            }}
            animate={{
              y: ["0vh", "-110vh"],
              opacity: [0, 1, 0.5, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "linear",
              delay: p.delay,
            }}
          />
        ))}
      </div>

      {/* Starfield / Particles Effect */}
      <div className="absolute inset-0 z-20 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

      {/* Vignette Edge Shadow */}
      <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,0.9)] z-30" />
    </div>
  );
}
