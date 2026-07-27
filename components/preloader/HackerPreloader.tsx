'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TOTAL_DURATION = 15000;

export default function HackerPreloader() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'spark' | 'revelation' | 'pillars' | 'core' | 'immersion' | 'done'>('idle');
  const scrollRef = useRef(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const [skipVisible, setSkipVisible] = useState(false);
  
  // Mouse parallax state
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Pillars state
  const [activePillar, setActivePillar] = useState(-1);
  const pillars = ["LEARN.", "MASTER.", "EXCEL."];

  useEffect(() => {
    // Force show in development for testing
    if (process.env.NODE_ENV === 'development') {
      sessionStorage.removeItem('tf_preloader_v10'); // bump version to force re-show
    }

    const hasSeen = sessionStorage.getItem('tf_preloader_v10');
    if (!hasSeen) {
      setIsActive(true);
      scrollRef.current = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollRef.current}px`;
      document.body.style.width = '100%';
    }
  }, []);

  const handleSkip = () => finishSequence();

  const finishSequence = () => {
    timersRef.current.forEach(clearTimeout);
    setPhase('done');
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollRef.current);
    sessionStorage.setItem('tf_preloader_v10', 'true');
    setIsActive(false);
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (e) {}
  };

  const handleStartSequence = () => {
    if (phase !== 'idle') return;
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (e) {}

    const t = (fn: () => void, ms: number) => {
      const id = setTimeout(fn, ms);
      timersRef.current.push(id);
      return id;
    };

    t(() => setSkipVisible(true), 3000);
    setPhase('spark');
    t(() => setPhase('revelation'), 3000);
    t(() => {
      setPhase('pillars');
      t(() => setActivePillar(0), 300); // 7.3s
      t(() => setActivePillar(1), 1600); // 8.6s
      t(() => setActivePillar(2), 2900); // 9.9s
    }, 7000);
    t(() => setPhase('core'), 11000);
    t(() => setPhase('immersion'), 13500); // Start curtain split
    t(() => finishSequence(), TOTAL_DURATION); // Exactly 15 seconds
  };

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const backParticles = useMemo(() => Array.from({ length: 80 }).map((_, i) => ({
    id: `b-${i}`, size: Math.random() * 2 + 1, x: Math.random() * 100, y: Math.random() * 100, 
    duration: Math.random() * 30 + 30, delay: Math.random() * 10
  })), []);
  
  const frontParticles = useMemo(() => Array.from({ length: 40 }).map((_, i) => ({
    id: `f-${i}`, size: Math.random() * 3 + 2, x: Math.random() * 100, y: Math.random() * 100, 
    duration: Math.random() * 15 + 15, delay: Math.random() * 5
  })), []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isActive) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 30;
    const y = (e.clientY / window.innerHeight - 0.5) * 30;
    setMousePos({ x, y });
  };

  if (!isActive) return null;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className={`fixed inset-0 z-[9999] bg-[#020202] flex items-center justify-center overflow-hidden select-none perspective-[1200px] ${phase === 'idle' ? 'cursor-pointer' : 'cursor-default'}`}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          onClick={phase === 'idle' ? handleStartSequence : undefined}
          onMouseMove={handleMouseMove}
        >
          {/* Phase 5 Immersion Curtain Effect - Renders behind everything until activated */}
          <AnimatePresence>
             {phase === 'immersion' && (
                <>
                  <motion.div 
                    initial={{ y: 0 }} animate={{ y: "-100%" }} transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1] }}
                    className="absolute top-0 left-0 right-0 h-1/2 bg-[#020202] z-[99999]"
                  />
                  <motion.div 
                    initial={{ y: 0 }} animate={{ y: "100%" }} transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1] }}
                    className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#020202] z-[99999]"
                  />
                  {/* Blinding flash in the center before split */}
                  <motion.div 
                    initial={{ scaleY: 0, opacity: 0 }} 
                    animate={{ scaleY: [0, 1, 0], opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                    className="absolute top-1/2 left-0 right-0 h-[2px] bg-white z-[100000] shadow-[0_0_50px_rgba(255,255,255,1)]"
                  />
                </>
             )}
          </AnimatePresence>

          {/* Deep Ambient Grid - always present but fades out in core */}
          <motion.div 
            className="absolute inset-0 z-0 opacity-20"
            animate={{ opacity: phase === 'core' || phase === 'immersion' ? 0.05 : 0.2 }}
            style={{
              backgroundImage: 'linear-gradient(rgba(212,175,55,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.1) 1px, transparent 1px)',
              backgroundSize: '50px 50px',
              transform: `perspective(1000px) rotateX(75deg) translateY(-200px) translateZ(-300px)`,
              transformOrigin: 'top center',
            }}
          />

          {/* Particles */}
          <motion.div 
            className="absolute inset-0 pointer-events-none z-0"
            animate={{ x: mousePos.x * -0.5, y: mousePos.y * -0.5 }}
            transition={{ type: 'spring', stiffness: 40, damping: 20 }}
          >
            {backParticles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute rounded-full bg-[#D4AF37]/10"
                style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
                animate={{ y: [0, -150, 0], opacity: [0, 0.3, 0] }}
                transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'linear' }}
              />
            ))}
          </motion.div>

          <motion.div 
            className="absolute inset-0 pointer-events-none z-20"
            animate={{ x: mousePos.x * -1.5, y: mousePos.y * -1.5 }}
            transition={{ type: 'spring', stiffness: 40, damping: 20 }}
          >
            {frontParticles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute rounded-full bg-[#D4AF37]/30"
                style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%`, boxShadow: '0 0 15px rgba(212,175,55,0.4)' }}
                animate={{ y: [0, -250, 0], opacity: [0, 0.6, 0], scale: [1, 2, 1] }}
                transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
              />
            ))}
          </motion.div>

          {/* Vignette */}
          <div className="absolute inset-0 pointer-events-none z-[10000]"
            style={{ background: 'radial-gradient(circle at center, transparent 0%, rgba(2,2,2,0.98) 100%)' }}
          />

          {/* Skip Button */}
          <AnimatePresence>
            {skipVisible && phase !== 'done' && phase !== 'immersion' && (
              <motion.button
                initial={{ opacity: 0, x: 20, backdropFilter: 'blur(0px)' }}
                animate={{ opacity: 1, x: 0, backdropFilter: 'blur(10px)' }}
                exit={{ opacity: 0, x: 20 }}
                onClick={handleSkip}
                className="absolute top-8 right-8 z-[10010] px-8 py-3 rounded-full border border-[#D4AF37]/20 text-[#D4AF37]/60 hover:text-[#D4AF37] hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/10 transition-all font-mono text-xs tracking-[0.4em] shadow-[0_0_30px_rgba(212,175,55,0)] hover:shadow-[0_0_30px_rgba(212,175,55,0.2)]"
              >
                SKIP INTRO
              </motion.button>
            )}
          </AnimatePresence>

          {/* ═══ PHASE: IDLE ═══ */}
          <AnimatePresence>
            {phase === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 2, filter: 'blur(30px)' }}
                transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1] }}
                className="absolute inset-0 flex flex-col items-center justify-center z-30"
              >
                <div className="relative group flex flex-col items-center justify-center cursor-pointer">
                  <motion.div
                    animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-32 h-32 rounded-full border-[1px] border-dashed border-[#D4AF37]/30 absolute"
                  />
                  <motion.div
                    animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="w-28 h-28 rounded-full border-[1px] border-[#D4AF37]/10 absolute"
                  />
                  <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-4 h-4 bg-[#D4AF37] rounded-full shadow-[0_0_40px_10px_rgba(212,175,55,0.8)]"
                  />
                  <div className="mt-24 font-mono text-[#D4AF37]/60 text-xs tracking-[0.6em] uppercase drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                    INITIATE
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══ PHASE: SPARK (0-3s) ═══ */}
          <AnimatePresence>
            {phase === 'spark' && (
              <motion.div
                key="spark"
                className="absolute inset-0 flex items-center justify-center z-30"
                initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
              >
                {/* Sacred Geometry SVG drawing */}
                <motion.svg width="400" height="400" viewBox="0 0 400 400" className="absolute opacity-50">
                   <motion.circle cx="200" cy="200" r="100" stroke="#D4AF37" strokeWidth="1" fill="none"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, ease: "easeInOut" }}
                   />
                   <motion.circle cx="200" cy="200" r="150" stroke="#D4AF37" strokeWidth="0.5" fill="none" strokeDasharray="5,5"
                      initial={{ pathLength: 0, rotate: -90 }} animate={{ pathLength: 1, rotate: 0 }} transition={{ duration: 2.5, ease: "easeOut" }}
                      style={{ originX: "200px", originY: "200px" }}
                   />
                   <motion.polygon points="200,50 330,275 70,275" stroke="#D4AF37" strokeWidth="1" fill="none"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                   />
                   <motion.polygon points="200,350 70,125 330,125" stroke="#D4AF37" strokeWidth="1" fill="none"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                   />
                </motion.svg>

                {/* The Spark */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1, 0.5, 40], opacity: [1, 1, 1, 0] }}
                  transition={{ duration: 2.8, times: [0, 0.3, 0.6, 1], ease: [0.8, 0, 0.2, 1] }}
                  className="w-3 h-3 rounded-full bg-white shadow-[0_0_100px_50px_rgba(255,255,255,1),_0_0_200px_100px_rgba(212,175,55,0.8)] z-10"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══ PHASE: REVELATION (3-7s) ═══ */}
          <AnimatePresence>
            {phase === 'revelation' && (
              <motion.div
                key="revelation"
                className="absolute inset-0 flex flex-col items-center justify-center z-30"
                initial={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }} transition={{ duration: 1.5 }}
              >
                <motion.div animate={{ x: mousePos.x, y: mousePos.y }} transition={{ type: 'spring', stiffness: 50, damping: 30 }} className="relative text-center">
                  
                  <motion.div initial={{ y: -20, opacity: 0, letterSpacing: '0em' }} animate={{ y: 0, opacity: 1, letterSpacing: '0.4em' }} transition={{ duration: 2, delay: 0.5, ease: "easeOut" }} className="text-xl sm:text-2xl font-light text-[#D4AF37]/80 mb-6 uppercase">
                    WELCOME TO
                  </motion.div>
                  
                  {/* Text Mask Reveal */}
                  <div className="relative overflow-hidden p-4">
                    <motion.div 
                      className="absolute inset-0 bg-[#D4AF37]/20 blur-[80px] rounded-full" 
                      initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 1, duration: 2 }} 
                    />
                    
                    <motion.h1 
                      className="text-6xl sm:text-8xl md:text-9xl font-black text-transparent bg-clip-text tracking-tighter relative z-10"
                      style={{ backgroundImage: 'linear-gradient(to right, #FFFFFF, #D4AF37, #FFFFFF)' }}
                      initial={{ clipPath: 'polygon(0 0, 0 0, 0 100%, 0% 100%)' }}
                      animate={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
                      transition={{ duration: 2, delay: 1, ease: [0.76, 0, 0.24, 1] }}
                    >
                      TRICKFUNDA
                    </motion.h1>
                    
                    {/* Sweeping Light line attached to mask edge */}
                    <motion.div
                      className="absolute top-0 bottom-0 w-2 bg-white blur-[2px] shadow-[0_0_20px_rgba(255,255,255,1)] z-20 mix-blend-overlay"
                      initial={{ left: '0%', opacity: 0 }}
                      animate={{ left: '100%', opacity: [0, 1, 1, 0] }}
                      transition={{ duration: 2, delay: 1, ease: [0.76, 0, 0.24, 1] }}
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══ PHASE: PILLARS (7-11s) ═══ */}
          <AnimatePresence>
            {phase === 'pillars' && (
              <motion.div key="pillars" className="absolute inset-0 flex items-center justify-center z-30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }} transition={{ duration: 1.5 }}>
                <div className="relative w-full h-full flex items-center justify-center perspective-[1500px]">
                  <AnimatePresence>
                    {activePillar >= 0 && (
                      <motion.div
                        key={activePillar}
                        initial={{ opacity: 0, filter: 'blur(20px)', scale: 0.95, z: -100 }}
                        animate={{ opacity: 1, filter: 'blur(0px)', scale: 1, z: 0 }}
                        exit={{ opacity: 0, filter: 'blur(20px)', scale: 1.05, z: 100 }}
                        transition={{ duration: 1.4, ease: [0.25, 1, 0.5, 1] }}
                        className="absolute flex flex-col items-center"
                      >
                        <div className="text-6xl sm:text-8xl md:text-[9rem] font-extralight tracking-[0.25em] text-white/90 drop-shadow-[0_10px_40px_rgba(255,255,255,0.3)]">
                          {pillars[activePillar]}
                        </div>
                        {/* Golden underline drawing itself */}
                        <motion.div
                          className="h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mt-4"
                          initial={{ width: '0%', opacity: 0 }}
                          animate={{ width: '80%', opacity: 1 }}
                          exit={{ width: '100%', opacity: 0 }}
                          transition={{ duration: 1.4, ease: [0.25, 1, 0.5, 1] }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══ PHASE: CORE (11-14s) ═══ */}
          <AnimatePresence>
            {phase === 'core' && (
              <motion.div
                key="core"
                className="absolute inset-0 flex flex-col items-center justify-center z-30"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1] }}
              >
                <motion.div animate={{ x: mousePos.x * 2, y: mousePos.y * 2 }} transition={{ type: 'spring', stiffness: 50, damping: 20 }} className="relative flex flex-col items-center justify-center">
                  
                  {/* The Mechanism Rings (Luxury Watch Style) */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.svg width="600" height="600" viewBox="0 0 600 600" className="absolute opacity-40">
                      <motion.circle cx="300" cy="300" r="220" stroke="#D4AF37" strokeWidth="1" fill="none" strokeDasharray="4 8"
                        animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} style={{ originX: "300px", originY: "300px" }}
                      />
                      <motion.circle cx="300" cy="300" r="250" stroke="#D4AF37" strokeWidth="0.5" fill="none" strokeDasharray="1 15"
                        animate={{ rotate: -360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} style={{ originX: "300px", originY: "300px" }}
                      />
                      <motion.circle cx="300" cy="300" r="280" stroke="#FFFFFF" strokeWidth="0.5" fill="none" opacity="0.2"
                        animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} style={{ originX: "300px", originY: "300px" }}
                      />
                    </motion.svg>
                  </div>

                  {/* Main Logo Container */}
                  <motion.div
                    className="relative z-10"
                    initial={{ scale: 0, rotateZ: -45, filter: 'blur(30px) brightness(5)' }}
                    animate={{ scale: 1, rotateZ: 0, filter: 'blur(0px) brightness(1)' }}
                    transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <motion.div className="absolute inset-0 rounded-[40px] bg-[#D4AF37]/20 blur-[50px]" animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />
                    <div className="relative rounded-[40px] p-[2px] bg-gradient-to-b from-white/30 via-[#D4AF37]/20 to-transparent shadow-[0_0_120px_rgba(212,175,55,0.4)] backdrop-blur-md">
                      <div className="rounded-[38px] bg-[#020202] p-2 flex items-center justify-center">
                        <img src="/logo.jpg" alt="TrickFunda" className="w-48 h-48 sm:w-64 sm:h-64 object-contain rounded-[32px] mix-blend-screen" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 30, letterSpacing: '0em' }}
                    animate={{ opacity: 1, y: 0, letterSpacing: '0.8em' }}
                    transition={{ delay: 1.5, duration: 2, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-16 font-mono text-[#D4AF37]/80 text-xs sm:text-sm uppercase drop-shadow-[0_0_15px_rgba(212,175,55,0.5)] z-10"
                  >
                    THE MECHANISM OF EXCELLENCE
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
