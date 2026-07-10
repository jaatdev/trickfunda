'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Boot Sequence Messages ─────────────────────────────────────
const BOOT_SEQUENCE = [
  { text: '> INIT SYSTEM KERNEL v4.2.1...', delay: 0 },
  { text: '> Loading neural pathways...', delay: 800 },
  { text: '> Connecting to TrickFunda mainframe...', delay: 1600 },
  { text: '> Establishing encrypted tunnel... ████████ OK', delay: 2400 },
  { text: '> Decrypting knowledge modules...', delay: 3200 },
  { text: '> Subjects loaded: [POLITY] [HISTORY] [HINDI] [REASONING]', delay: 4000 },
  { text: '> Mounting quiz engine...', delay: 5000 },
  { text: '> KD Method framework: ONLINE', delay: 5800 },
  { text: '> Spaced repetition algorithm: ACTIVE', delay: 6600 },
  { text: '> Flashcard renderer: COMPILED', delay: 7200 },
  { text: '> Loading UI assets [████████████████████] 100%', delay: 7800 },
  { text: '> Verifying user credentials...', delay: 8600 },
  { text: '> SECURITY CLEARANCE: GRANTED', delay: 9200 },
  { text: '> ALL SYSTEMS NOMINAL', delay: 10000 },
  { text: '> WELCOME TO TRICKFUNDA', delay: 11000 },
];

// ─── Matrix Rain Character Set ──────────────────────────────────
const MATRIX_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// ─── Matrix Rain Column ────────────────────────────────────────
const MatrixColumn = ({ index, totalColumns }: { index: number; totalColumns: number }) => {
  const [chars, setChars] = useState<string[]>([]);
  const speed = useRef(30 + Math.random() * 70);
  const columnHeight = useRef(8 + Math.floor(Math.random() * 15));

  useEffect(() => {
    const interval = setInterval(() => {
      setChars(prev => {
        const newChar = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
        const next = [...prev, newChar];
        if (next.length > columnHeight.current) next.shift();
        return next;
      });
    }, speed.current);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="absolute top-0 flex flex-col items-center text-xs sm:text-sm font-mono select-none pointer-events-none"
      style={{
        left: `${(index / totalColumns) * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
      }}
    >
      <motion.div
        initial={{ y: -200 }}
        animate={{ y: typeof window !== 'undefined' ? window.innerHeight + 200 : 1200 }}
        transition={{
          duration: 4 + Math.random() * 6,
          repeat: Infinity,
          delay: Math.random() * 5,
          ease: 'linear',
        }}
        className="flex flex-col items-center"
      >
        {chars.map((char, i) => (
          <span
            key={i}
            className={i === chars.length - 1 ? 'text-white font-bold' : 'text-green-500'}
            style={{ opacity: 0.1 + (i / chars.length) * 0.9 }}
          >
            {char}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

// ─── Glitch Text Effect ────────────────────────────────────────
const GlitchText = ({ text, className = '' }: { text: string; className?: string }) => {
  return (
    <div className={`relative ${className}`}>
      <span className="relative z-10">{text}</span>
      <span
        className="absolute top-0 left-0 z-0 text-cyan-400 animate-glitch-1"
        aria-hidden="true"
      >
        {text}
      </span>
      <span
        className="absolute top-0 left-0 z-0 text-red-500 animate-glitch-2"
        aria-hidden="true"
      >
        {text}
      </span>
    </div>
  );
};

// ─── Scan Line Effect ──────────────────────────────────────────
const ScanLines = () => (
  <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden mix-blend-overlay">
    <div
      className="w-full h-full"
      style={{
        background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 3px)',
      }}
    />
    <motion.div
      className="absolute left-0 w-full h-[2px] bg-green-400/30"
      animate={{ top: ['0%', '100%'] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
    />
  </div>
);

// ─── Heartbeat Line ────────────────────────────────────────────
const HeartbeatLine = () => (
  <svg
    viewBox="0 0 600 100"
    className="w-full max-w-md h-16 text-green-400"
    preserveAspectRatio="none"
  >
    <motion.path
      d="M0,50 L100,50 L120,50 L140,20 L160,80 L180,10 L200,90 L220,50 L240,50 L350,50 L370,50 L390,25 L410,75 L430,15 L450,85 L470,50 L490,50 L600,50"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
    />
  </svg>
);

// ─── Main Preloader Component ──────────────────────────────────
export default function HackerPreloader() {
  const [isActive, setIsActive] = useState(false);
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'matrix' | 'boot' | 'logo' | 'done'>('matrix');
  const [showLogoReveal, setShowLogoReveal] = useState(false);
  const timerRef = useRef<NodeJS.Timeout[]>([]);
  const scrollRef = useRef(0);
  
  const TOTAL_DURATION = 15000; // 15 seconds

  // Check if user has seen the preloader
  useEffect(() => {
    const hasSeen = sessionStorage.getItem('tf_preloader_seen');
    if (!hasSeen) {
      setIsActive(true);
      // Lock scroll
      scrollRef.current = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollRef.current}px`;
      document.body.style.width = '100%';
    }
  }, []);

  // Boot sequence
  useEffect(() => {
    if (!isActive) return;

    // Phase transitions
    const t1 = setTimeout(() => setPhase('boot'), 2000);
    const t2 = setTimeout(() => setPhase('logo'), 12000);
    const t3 = setTimeout(() => {
      setShowLogoReveal(true);
    }, 12500);
    const t4 = setTimeout(() => {
      setPhase('done');
      // Unlock scroll
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollRef.current);
      sessionStorage.setItem('tf_preloader_seen', 'true');
      setIsActive(false);
    }, TOTAL_DURATION);

    timerRef.current.push(t1, t2, t3, t4);

    // Boot lines
    BOOT_SEQUENCE.forEach(({ text, delay }) => {
      const t = setTimeout(() => {
        setBootLines(prev => [...prev, text]);
      }, delay + 2000); // offset by matrix phase
      timerRef.current.push(t);
    });

    // Progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + (100 / (TOTAL_DURATION / 100));
      });
    }, 100);

    return () => {
      timerRef.current.forEach(clearTimeout);
      clearInterval(progressInterval);
    };
  }, [isActive]);

  // Matrix columns (responsive)
  const columnCount = typeof window !== 'undefined' ? Math.floor(window.innerWidth / 25) : 40;

  if (!isActive) return null;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden cursor-default select-none"
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          {/* Scan Lines Overlay */}
          <ScanLines />

          {/* Matrix Rain Background */}
          <div className="absolute inset-0 opacity-30 overflow-hidden">
            {Array.from({ length: columnCount }, (_, i) => (
              <MatrixColumn key={i} index={i} totalColumns={columnCount} />
            ))}
          </div>

          {/* Vignette */}
          <div
            className="absolute inset-0 pointer-events-none z-[9997]"
            style={{
              background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.8) 100%)',
            }}
          />

          {/* Main Content Container */}
          <div className="relative z-[9998] w-full max-w-3xl mx-auto px-6 flex flex-col items-center justify-center">

            {/* Phase 1 & 2: Boot Terminal */}
            <AnimatePresence mode="wait">
              {(phase === 'matrix' || phase === 'boot') && (
                <motion.div
                  key="terminal"
                  className="w-full"
                  exit={{ opacity: 0, y: -30, filter: 'blur(10px)' }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Terminal Header */}
                  <div className="bg-gray-900/80 backdrop-blur border border-green-500/30 rounded-t-lg px-4 py-2 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="ml-4 text-green-400/70 text-xs font-mono">trickfunda@mainframe:~$</span>
                  </div>

                  {/* Terminal Body */}
                  <div className="bg-black/90 backdrop-blur border border-green-500/20 border-t-0 rounded-b-lg p-4 sm:p-6 h-[300px] sm:h-[350px] overflow-hidden">
                    <div className="font-mono text-xs sm:text-sm space-y-1">
                      {/* Initial Matrix Phase Text */}
                      {phase === 'matrix' && (
                        <motion.div
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="text-green-400"
                        >
                          {'> Initializing TrickFunda Operating System...'}
                        </motion.div>
                      )}

                      {/* Boot Lines */}
                      {bootLines.map((line, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                          className={
                            line.includes('GRANTED') || line.includes('NOMINAL') || line.includes('WELCOME')
                              ? 'text-green-300 font-bold'
                              : line.includes('100%') || line.includes('ONLINE') || line.includes('ACTIVE') || line.includes('COMPILED')
                                ? 'text-cyan-400'
                                : 'text-green-500/80'
                          }
                        >
                          {line}
                        </motion.div>
                      ))}

                      {/* Blinking Cursor */}
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                        className="inline-block w-2 h-4 bg-green-400 mt-1"
                      />
                    </div>
                  </div>

                  {/* Heartbeat Line */}
                  <div className="mt-6 flex justify-center">
                    <HeartbeatLine />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Phase 3: Logo Reveal */}
            <AnimatePresence>
              {phase === 'logo' && (
                <motion.div
                  key="logo"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.5, filter: 'blur(20px)' }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className="flex flex-col items-center gap-6"
                >
                  {/* Glowing Logo */}
                  <motion.div
                    className="relative"
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(255,215,0,0.3)',
                        '0 0 60px rgba(255,215,0,0.6)',
                        '0 0 20px rgba(255,215,0,0.3)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <motion.img
                      src="/logo.jpg"
                      alt="TrickFunda"
                      className="w-28 h-28 sm:w-36 sm:h-36 object-contain rounded-3xl"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </motion.div>

                  {/* Glitch Title */}
                  {showLogoReveal && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <GlitchText
                        text="TRICKFUNDA"
                        className="text-4xl sm:text-6xl font-black text-white tracking-widest"
                      />
                      <motion.p
                        className="text-center text-green-400 font-mono text-sm mt-4 tracking-[0.3em]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        LEARN · MASTER · EXCEL
                      </motion.p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 z-[9999]">
            {/* Progress Text */}
            <div className="flex justify-between items-center px-6 pb-2">
              <span className="font-mono text-[10px] text-green-500/60 tracking-wider">
                SYS.BOOT
              </span>
              <span className="font-mono text-[10px] text-green-500/60 tracking-wider">
                {Math.min(Math.round(progress), 100)}%
              </span>
            </div>
            {/* The Bar */}
            <div className="h-[2px] bg-green-900/50 w-full">
              <motion.div
                className="h-full bg-gradient-to-r from-green-600 via-green-400 to-cyan-400"
                style={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>

          {/* Corner HUD Elements */}
          <div className="absolute top-4 left-4 font-mono text-[10px] text-green-500/40 z-[9998] hidden sm:block">
            <div>PROTOCOL: HTTPS/TLS 1.3</div>
            <div>ENCRYPTION: AES-256</div>
            <div>NODE: TRICKFUNDA-MAIN</div>
          </div>
          <div className="absolute top-4 right-4 font-mono text-[10px] text-green-500/40 z-[9998] hidden sm:block text-right">
            <div>LAT: 28.6139°N</div>
            <div>LON: 77.2090°E</div>
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              STATUS: ACTIVE
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
