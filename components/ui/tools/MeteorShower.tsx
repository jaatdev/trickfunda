'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Meteor {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

export function MeteorShower() {
  const [meteors, setMeteors] = useState<Meteor[]>([]);

  useEffect(() => {
    // Generate static random positions on client side to avoid hydration mismatch
    const newMeteors = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.floor(Math.random() * window.innerWidth),
      y: Math.floor(Math.random() * window.innerHeight) - window.innerHeight,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 5 + 0.5,
      duration: Math.random() * 2 + 2,
    }));
    setMeteors(newMeteors);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
      {meteors.map((meteor) => (
        <motion.div
          key={meteor.id}
          initial={{
            opacity: 0,
            x: meteor.x,
            y: meteor.y,
            scale: 0,
          }}
          animate={{
            opacity: [0, 1, 0],
            x: meteor.x + 800, // Move diagonally down-right
            y: meteor.y + 800,
            scale: [0, meteor.size, 0],
          }}
          transition={{
            duration: meteor.duration,
            repeat: Infinity,
            delay: meteor.delay,
            ease: 'linear',
          }}
          className="absolute w-[2px] bg-slate-200 rotate-[45deg] blur-[1px]"
          style={{ height: `${meteor.size * 50}px` }}
        >
          {/* Meteor Glow Head */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[4px] h-[4px] rounded-full bg-white shadow-[0_0_10px_2px_rgba(255,255,255,0.8)]" />
        </motion.div>
      ))}
    </div>
  );
}
