'use client';

import { motion } from 'framer-motion';

export function SteampunkBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-[#1A1208]">
      
      {/* Heavy Brass Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(15,10,5,0.9)_100%)] z-20" />

      {/* Steam Overlays */}
      <motion.div
        animate={{ y: [-20, 20], x: [-10, 10], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 15, repeat: Infinity, repeatType: "mirror", ease: 'easeInOut' }}
        className="absolute bottom-0 left-[-10%] w-[120vw] h-[50vh] bg-white/5 blur-[80px] mix-blend-screen z-10"
      />
      <motion.div
        animate={{ y: [20, -20], x: [10, -10], opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 12, repeat: Infinity, repeatType: "mirror", ease: 'easeInOut' }}
        className="absolute top-0 right-[-10%] w-[120vw] h-[50vh] bg-amber-500/5 blur-[100px] mix-blend-screen z-10"
      />

      {/* Giant Rotating Brass Gears */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
        className="absolute top-[-20vw] right-[-20vw] w-[60vw] h-[60vw] border-[20px] border-[#D4AF37]/5 border-dashed rounded-full"
      />
      
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-[-15vw] left-[-15vw] w-[40vw] h-[40vw] border-[15px] border-[#B87333]/5 border-dashed rounded-full"
      />

      {/* Subtle Mechanical Grid */}
      <div 
        className="absolute inset-0 opacity-[0.03] z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #D4AF37 1px, transparent 1px),
            linear-gradient(to bottom, #D4AF37 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  );
}
