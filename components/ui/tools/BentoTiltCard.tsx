'use client';

import React, { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion';

export function BentoTiltCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Add spring physics to smooth out the tracking
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  // Map mouse coordinates to rotation
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7deg', '-7deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7deg', '7deg']);

  // Dynamic glare based on rotation
  const glareOpacity = useTransform(mouseYSpring, [-0.5, 0.5], [0, 0.15]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ['0%', '100%']);
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={`relative h-full w-full rounded-[2rem] bg-white/[0.02] border border-white/5 transition-colors duration-500 hover:border-white/20 hover:bg-white/[0.04] shadow-2xl ${className}`}
    >
      {/* 3D Content Container */}
      <div 
        style={{ transform: 'translateZ(50px)' }}
        className="absolute inset-0 p-8 flex flex-col pointer-events-none"
      >
        {children}
      </div>

      {/* Dynamic Glare Effect */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[2rem]"
        style={{
          opacity: glareOpacity,
          background: useMotionTemplate`radial-gradient(
            farthest-corner circle at ${glareX} ${glareY},
            rgba(255, 255, 255, 0.8) 10%,
            rgba(255, 255, 255, 0.1) 40%,
            transparent 80%
          )`,
        }}
      />
    </motion.div>
  );
}
