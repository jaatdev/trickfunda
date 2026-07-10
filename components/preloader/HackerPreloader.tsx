'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Constants ──────────────────────────────────────────────────
const MATRIX_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
const HEX_CHARS = '0123456789ABCDEF';
const TOTAL_DURATION = 15000;

// ─── Boot Messages ─────────────────────────────────────────────
const BOOT_LINES = [
  { t: 0, text: '> BIOS POST... OK', type: 'ok' },
  { t: 400, text: '> CPU: TrickFunda Neural Core v4.2.1 @ 4.8GHz', type: 'info' },
  { t: 800, text: '> RAM: 128TB Knowledge Matrix... Initialized', type: 'info' },
  { t: 1200, text: '> GPU: Rendering Pipeline... ACTIVE', type: 'ok' },
  { t: 1800, text: '> NET: Establishing encrypted tunnel...', type: 'info' },
  { t: 2400, text: '> NET: TLS 1.3 handshake ████████████████ COMPLETE', type: 'ok' },
  { t: 3000, text: '> LOAD: quiz_engine.mod ............... [OK]', type: 'ok' },
  { t: 3400, text: '> LOAD: kd_method_framework.mod ....... [OK]', type: 'ok' },
  { t: 3800, text: '> LOAD: spaced_repetition.mod ......... [OK]', type: 'ok' },
  { t: 4200, text: '> LOAD: flashcard_renderer.mod ........ [OK]', type: 'ok' },
  { t: 4600, text: '> MOUNT: /subjects/polity ............. [OK]', type: 'ok' },
  { t: 4800, text: '> MOUNT: /subjects/history ............ [OK]', type: 'ok' },
  { t: 5000, text: '> MOUNT: /subjects/reasoning .......... [OK]', type: 'ok' },
  { t: 5200, text: '> MOUNT: /subjects/hindi .............. [OK]', type: 'ok' },
  { t: 5600, text: '> SECURITY: Firewall .................. ARMED', type: 'warn' },
  { t: 6000, text: '> SECURITY: Biometric scan ............ READY', type: 'warn' },
  { t: 6400, text: '> VERIFY: System integrity ............ PASSED', type: 'ok' },
  { t: 6800, text: '> STATUS: All 247 modules loaded successfully', type: 'ok' },
  { t: 7200, text: '> ═══════════════════════════════════════════', type: 'divider' },
  { t: 7600, text: '> CLEARANCE LEVEL: ████ GRANTED ████', type: 'access' },
  { t: 8000, text: '> WELCOME, OPERATOR.', type: 'welcome' },
];

// ─── Utility: generate hex stream ───────────────────────────────
const randomHex = (len: number) =>
  Array.from({ length: len }, () => HEX_CHARS[Math.floor(Math.random() * 16)]).join('');

// ─── Typing Text (character by character) ───────────────────────
const TypeWriter = ({ text, speed = 30, onDone }: { text: string; speed?: number; onDone?: () => void }) => {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      setDisplayed(text.slice(0, ++i));
      if (i >= text.length) { clearInterval(iv); onDone?.(); }
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed, onDone]);
  return <>{displayed}</>;
};

// ─── Scramble Text (random chars → real text) ───────────────────
const ScrambleText = ({ text, delay = 0, className = '' }: { text: string; delay?: number; className?: string }) => {
  const [output, setOutput] = useState(text.replace(/[^ ]/g, '█'));
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let iteration = 0;
    const maxIterations = 15;
    const iv = setInterval(() => {
      setOutput(
        text
          .split('')
          .map((char, i) => {
            if (char === ' ') return ' ';
            if (iteration / maxIterations > i / text.length) return char;
            return MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
          })
          .join('')
      );
      iteration++;
      if (iteration > maxIterations) clearInterval(iv);
    }, 40);
    return () => clearInterval(iv);
  }, [started, text]);

  return <span className={className}>{output}</span>;
};

// ─── Binary Stream (sidebar decoration) ─────────────────────────
const BinaryStream = ({ side }: { side: 'left' | 'right' }) => {
  const [lines, setLines] = useState<string[]>(Array(30).fill(''));

  useEffect(() => {
    const iv = setInterval(() => {
      setLines(prev => {
        const next = [...prev];
        next.shift();
        next.push(randomHex(8) + ' ' + randomHex(8));
        return next;
      });
    }, 80);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className={`fixed top-0 ${side === 'left' ? 'left-2' : 'right-2'} h-full z-[10001] pointer-events-none hidden lg:flex flex-col justify-center gap-0 font-mono text-[9px] tracking-wider leading-tight`}>
      {lines.map((line, i) => (
        <div key={i} className="text-green-500/20" style={{ opacity: 0.1 + (i / lines.length) * 0.3 }}>
          {line}
        </div>
      ))}
    </div>
  );
};

// ─── Radar Sweep ────────────────────────────────────────────────
const RadarSweep = () => (
  <div className="relative w-40 h-40 sm:w-48 sm:h-48">
    {/* Concentric rings */}
    {[1, 2, 3].map(r => (
      <div key={r} className="absolute inset-0 rounded-full border border-green-500/20" style={{ margin: `${r * 14}px` }} />
    ))}
    {/* Cross hairs */}
    <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-green-500/15" />
    <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-green-500/15" />
    {/* Sweep line */}
    <motion.div
      className="absolute top-1/2 left-1/2 w-1/2 h-[1px] origin-left"
      style={{ background: 'linear-gradient(90deg, rgba(34,197,94,0.8), transparent)' }}
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
    />
    {/* Sweep trail (cone) */}
    <motion.div
      className="absolute top-1/2 left-1/2 w-full h-full origin-top-left"
      style={{
        background: 'conic-gradient(from 0deg, rgba(34,197,94,0.15) 0deg, transparent 40deg)',
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)',
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
    />
    {/* Blips */}
    {[{ x: 30, y: -20, d: 0.5 }, { x: -15, y: 25, d: 1.2 }, { x: 40, y: 35, d: 2.0 }].map((blip, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 bg-green-400 rounded-full"
        style={{ left: `calc(50% + ${blip.x}px)`, top: `calc(50% + ${blip.y}px)` }}
        animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: blip.d }}
      />
    ))}
    {/* Center label */}
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="text-green-400 font-mono text-[10px] tracking-widest">SCAN</span>
    </div>
  </div>
);

// ─── Fingerprint Scanner ────────────────────────────────────────
const FingerprintScan = ({ onComplete }: { onComplete: () => void }) => {
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => {
      setScanProgress(p => {
        if (p >= 100) { clearInterval(iv); onComplete(); return 100; }
        return p + 2;
      });
    }, 30);
    return () => clearInterval(iv);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-24 h-32 border border-green-500/50 rounded-lg overflow-hidden bg-black/50">
        {/* Fingerprint SVG lines */}
        <svg viewBox="0 0 60 80" className="w-full h-full text-green-500/30 p-2">
          {Array.from({ length: 12 }, (_, i) => (
            <ellipse
              key={i}
              cx="30" cy="45"
              rx={6 + i * 2} ry={8 + i * 2.5}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
              opacity={0.3 + (i / 12) * 0.4}
            />
          ))}
        </svg>
        {/* Scan line */}
        <motion.div
          className="absolute left-0 right-0 h-[2px] bg-green-400"
          style={{ boxShadow: '0 0 10px rgba(34,197,94,0.8), 0 0 30px rgba(34,197,94,0.4)' }}
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
        {/* Fill from bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-green-500/10 transition-all duration-100"
          style={{ height: `${scanProgress}%` }}
        />
      </div>
      <div className="font-mono text-xs text-green-400 tracking-widest">
        {scanProgress < 100 ? `SCANNING... ${scanProgress}%` : '✓ IDENTITY VERIFIED'}
      </div>
    </div>
  );
};

// ─── Particle Burst (on logo reveal) ────────────────────────────
const ParticleBurst = ({ active }: { active: boolean }) => {
  const particles = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        angle: (i / 60) * 360,
        distance: 100 + Math.random() * 200,
        size: 2 + Math.random() * 3,
        duration: 0.8 + Math.random() * 0.6,
      })),
    []
  );

  if (!active) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute w-1 h-1 bg-yellow-400 rounded-full"
          style={{ width: p.size, height: p.size }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
            y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
            opacity: 0,
            scale: 0,
          }}
          transition={{ duration: p.duration, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
};

// ─── Static Noise Transition ────────────────────────────────────
const StaticNoise = ({ visible }: { visible: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!visible || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    let frameId: number;
    const draw = () => {
      const w = canvasRef.current!.width;
      const h = canvasRef.current!.height;
      const imgData = ctx.createImageData(w, h);
      for (let i = 0; i < imgData.data.length; i += 4) {
        const v = Math.random() * 255;
        imgData.data[i] = v;
        imgData.data[i + 1] = v;
        imgData.data[i + 2] = v;
        imgData.data[i + 3] = 40;
      }
      ctx.putImageData(imgData, 0, 0);
      frameId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frameId);
  }, [visible]);

  if (!visible) return null;

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={150}
      className="absolute inset-0 w-full h-full z-[10005] pointer-events-none"
    />
  );
};

// ─── Glitch Text ────────────────────────────────────────────────
const GlitchText = ({ text, className = '' }: { text: string; className?: string }) => (
  <div className={`relative ${className}`}>
    <span className="relative z-10">{text}</span>
    <span className="absolute top-0 left-0 animate-glitch-1 text-cyan-400" aria-hidden>{text}</span>
    <span className="absolute top-0 left-0 animate-glitch-2 text-red-500" aria-hidden>{text}</span>
  </div>
);

// ─── CRT Scan Lines ─────────────────────────────────────────────
const ScanLines = () => (
  <div className="fixed inset-0 pointer-events-none z-[10004] mix-blend-overlay">
    <div className="w-full h-full" style={{
      background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 3px)',
    }} />
    <motion.div
      className="absolute left-0 w-full h-[2px] bg-green-400/20"
      animate={{ top: ['0%', '100%'] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
    />
  </div>
);

// ═══════════════════════════════════════════════════════════════
// ─── MAIN PRELOADER ────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
export default function HackerPreloader() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'poweron' | 'boot' | 'scan' | 'access' | 'logo' | 'done'>('idle');
  const [bootLines, setBootLines] = useState<typeof BOOT_LINES>([]);
  const [progress, setProgress] = useState(0);
  const [showStatic, setShowStatic] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [flickerCount, setFlickerCount] = useState(0);
  const [accessText, setAccessText] = useState('');
  const scrollRef = useRef(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  // ─── Init ───────────────────────────────────────────────────
  useEffect(() => {
    const hasSeen = sessionStorage.getItem('tf_preloader_v3');
    if (!hasSeen) {
      setIsActive(true);
      scrollRef.current = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollRef.current}px`;
      document.body.style.width = '100%';
    }
  }, []);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleStartSequence = () => {
    if (phase !== 'idle') return;
    setPhase('poweron');

    const t = (fn: () => void, ms: number) => {
      const id = setTimeout(fn, ms);
      timersRef.current.push(id);
      return id;
    };

    // Phase 1: Power On Flicker (0-2s)
    t(() => setFlickerCount(1), 300);
    t(() => setFlickerCount(2), 600);
    t(() => setFlickerCount(3), 900);

    // Phase 2: Boot (2-10s)
    t(() => setPhase('boot'), 1500);
    BOOT_LINES.forEach(({ text, type, t: delay }) => {
      t(() => setBootLines(prev => [...prev, { text, type, t: delay }]), delay + 2000);
    });

    // Static burst transition
    t(() => setShowStatic(true), 9800);
    t(() => setShowStatic(false), 10200);

    // Phase 3: Scan (10-11.5s)
    t(() => setPhase('scan'), 10200);

    // Static burst transition
    t(() => setShowStatic(true), 11300);
    t(() => setShowStatic(false), 11600);

    // Phase 4: Access Granted (11.5-12.5s)
    t(() => { setPhase('access'); setAccessText('ACCESS GRANTED'); }, 11600);

    // Phase 5: Logo (12.5-15s)
    t(() => setPhase('logo'), 12500);
    t(() => setShowParticles(true), 12600);

    // End
    t(() => {
      setPhase('done');
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollRef.current);
      sessionStorage.setItem('tf_preloader_v3', 'true');
      setIsActive(false);
    }, TOTAL_DURATION);

    // Progress bar
    intervalRef.current = setInterval(() => {
      setProgress(p => Math.min(p + 100 / (TOTAL_DURATION / 100), 100));
    }, 100);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (!isActive) return null;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden select-none ${phase === 'idle' ? 'cursor-pointer' : 'cursor-default'}`}
          exit={{ opacity: 0, scale: 1.1, filter: 'blur(12px)' }}
          transition={{ duration: 0.6 }}
          onClick={handleStartSequence}
        >
          {/* CRT Scan Lines */}
          <ScanLines />

          {/* Static Noise Bursts */}
          <StaticNoise visible={showStatic} />

          {/* Hex data streams on sides */}
          <BinaryStream side="left" />
          <BinaryStream side="right" />

          {/* Vignette */}
          <div className="absolute inset-0 pointer-events-none z-[10003]"
            style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.85) 100%)' }}
          />

          {/* HUD Corner Elements */}
          <div className="absolute top-4 left-4 font-mono text-[9px] text-green-500/40 z-[10003] hidden sm:block space-y-0.5">
            <div>PROTOCOL: HTTPS/TLS 1.3</div>
            <div>CIPHER: AES-256-GCM</div>
            <div>NODE: TF-MAINFRAME-01</div>
            <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>
              UPTIME: {Math.round(progress / 100 * 15)}s
            </motion.div>
          </div>
          <div className="absolute top-4 right-4 font-mono text-[9px] text-green-500/40 z-[10003] hidden sm:block text-right space-y-0.5">
            <div>LAT: 28.6139°N</div>
            <div>LON: 77.2090°E</div>
            <div>PID: {Math.floor(Math.random() * 9000 + 1000)}</div>
            <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
              ● LIVE
            </motion.div>
          </div>

          {/* ═══ PHASE: IDLE (WAITING FOR CLICK) ═══ */}
          <AnimatePresence>
            {phase === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 flex items-center justify-center z-[10005] bg-black/60 backdrop-blur-sm"
              >
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border border-red-500/50 flex items-center justify-center mb-6"
                  >
                    <div className="w-4 h-4 sm:w-6 sm:h-6 bg-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.8)]" />
                  </motion.div>
                  <ScrambleText
                    text="SYSTEM OVERRIDE REQUIRED"
                    className="font-mono text-xl sm:text-3xl font-black text-red-500 tracking-[0.3em] mb-4 text-center"
                  />
                  <motion.div
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    className="font-mono text-green-400 text-xs sm:text-sm tracking-[0.5em] text-center"
                  >
                    [ CLICK ANYWHERE TO INITIALIZE ]
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══ PHASE: POWER ON ═══ */}
          <AnimatePresence mode="wait">
            {phase === 'poweron' && (
              <motion.div
                key="poweron"
                className="absolute inset-0 flex items-center justify-center z-[10002]"
                exit={{ opacity: 0 }}
              >
                <motion.div
                  animate={{
                    opacity: flickerCount >= 1 ? [0, 1, 0, 1, 0.5, 1] : 0,
                  }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <div className="font-mono text-green-500 text-sm tracking-[0.5em]">
                    TRICKFUNDA OS
                  </div>
                  <div className="font-mono text-green-500/50 text-[10px] mt-2 tracking-widest">
                    INITIALIZING...
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* ═══ PHASE: BOOT TERMINAL ═══ */}
            {phase === 'boot' && (
              <motion.div
                key="boot"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="relative z-[10002] w-full max-w-2xl mx-4"
              >
                <div className="flex items-center gap-4 mb-4">
                  {/* Radar */}
                  <div className="hidden sm:block flex-shrink-0">
                    <RadarSweep />
                  </div>
                  {/* Terminal */}
                  <div className="flex-1 min-w-0">
                    {/* Terminal chrome */}
                    <div className="bg-gray-900/90 backdrop-blur-md border border-green-500/30 rounded-t-lg px-4 py-2 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                      <span className="ml-3 text-green-500/50 text-[10px] font-mono truncate">root@trickfunda-mainframe:~#</span>
                    </div>
                    {/* Terminal body */}
                    <div className="bg-black/95 border border-green-500/15 border-t-0 rounded-b-lg p-4 h-[280px] sm:h-[320px] overflow-hidden relative">
                      {/* Subtle grid */}
                      <div className="absolute inset-0 opacity-[0.03]" style={{
                        backgroundImage: 'linear-gradient(rgba(34,197,94,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.5) 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                      }} />
                      <div className="relative z-10 font-mono text-[11px] sm:text-xs space-y-[3px] leading-relaxed">
                        {bootLines.map((line, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.15 }}
                            className={
                              line.type === 'access' ? 'text-yellow-300 font-bold text-sm' :
                              line.type === 'welcome' ? 'text-green-300 font-bold text-sm' :
                              line.type === 'warn' ? 'text-yellow-500/90' :
                              line.type === 'ok' ? 'text-green-500/90' :
                              line.type === 'divider' ? 'text-green-700/60' :
                              'text-green-500/70'
                            }
                          >
                            {line.text}
                          </motion.div>
                        ))}
                        <motion.span
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                          className="inline-block w-2 h-3.5 bg-green-400 mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Heartbeat EKG */}
                <svg viewBox="0 0 600 60" className="w-full h-10 text-green-400/60 mt-2" preserveAspectRatio="none">
                  <motion.path
                    d="M0,30 L150,30 L170,30 L185,8 L200,52 L215,5 L230,55 L245,30 L260,30 L400,30 L420,30 L435,12 L450,48 L465,8 L480,52 L495,30 L510,30 L600,30"
                    fill="none" stroke="currentColor" strokeWidth="1.5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  />
                </svg>
              </motion.div>
            )}

            {/* ═══ PHASE: BIOMETRIC SCAN ═══ */}
            {phase === 'scan' && (
              <motion.div
                key="scan"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative z-[10002] flex flex-col items-center"
              >
                <div className="font-mono text-green-500/60 text-xs tracking-[0.3em] mb-6">BIOMETRIC VERIFICATION</div>
                <FingerprintScan onComplete={() => {}} />
              </motion.div>
            )}

            {/* ═══ PHASE: ACCESS GRANTED ═══ */}
            {phase === 'access' && (
              <motion.div
                key="access"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 2, filter: 'blur(20px)' }}
                transition={{ duration: 0.4 }}
                className="relative z-[10002] flex flex-col items-center"
              >
                <motion.div
                  className="w-20 h-20 rounded-full border-2 border-green-400 flex items-center justify-center mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.svg
                    viewBox="0 0 24 24"
                    className="w-10 h-10 text-green-400"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                  >
                    <motion.path
                      d="M5 13l4 4L19 7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                    />
                  </motion.svg>
                </motion.div>
                <ScrambleText
                  text="ACCESS GRANTED"
                  className="font-mono text-2xl sm:text-3xl font-black text-green-400 tracking-[0.4em]"
                />
              </motion.div>
            )}

            {/* ═══ PHASE: LOGO REVEAL ═══ */}
            {phase === 'logo' && (
              <motion.div
                key="logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.3, filter: 'blur(30px)' }}
                transition={{ duration: 0.5 }}
                className="relative z-[10002] flex flex-col items-center"
              >
                {/* Particle Burst */}
                <ParticleBurst active={showParticles} />

                {/* Logo with glow rings */}
                <motion.div
                  className="relative mb-8"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  {/* Pulsing rings */}
                  {[1, 2, 3].map(r => (
                    <motion.div
                      key={r}
                      className="absolute rounded-full border border-yellow-400/30"
                      style={{ inset: `-${r * 12}px` }}
                      animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.1, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity, delay: r * 0.3 }}
                    />
                  ))}
                  <motion.div
                    animate={{
                      boxShadow: [
                        '0 0 30px rgba(255,215,0,0.3), 0 0 60px rgba(255,215,0,0.1)',
                        '0 0 50px rgba(255,215,0,0.5), 0 0 100px rgba(255,215,0,0.2)',
                        '0 0 30px rgba(255,215,0,0.3), 0 0 60px rgba(255,215,0,0.1)',
                      ],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="rounded-3xl"
                  >
                    <img
                      src="/logo.jpg"
                      alt="TrickFunda"
                      className="w-28 h-28 sm:w-36 sm:h-36 object-contain rounded-3xl"
                    />
                  </motion.div>
                </motion.div>

                {/* Glitch Title */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <GlitchText
                    text="TRICKFUNDA"
                    className="text-4xl sm:text-6xl font-black text-white tracking-[0.15em]"
                  />
                </motion.div>

                {/* Tagline */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-4 font-mono text-green-400/80 text-sm tracking-[0.5em]"
                >
                  LEARN · MASTER · EXCEL
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Bottom Progress Bar ─────────────────────────── */}
          <div className="absolute bottom-0 left-0 right-0 z-[10005]">
            <div className="flex justify-between items-center px-4 sm:px-6 pb-1.5">
              <span className="font-mono text-[9px] text-green-500/50 tracking-wider">
                SYS.BOOT v4.2.1
              </span>
              <span className="font-mono text-[9px] text-green-500/50 tracking-wider">
                {Math.min(Math.round(progress), 100)}%
              </span>
            </div>
            <div className="h-[2px] bg-green-900/30 w-full relative overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-600 via-green-400 to-cyan-400 relative"
                style={{ width: `${Math.min(progress, 100)}%` }}
              >
                {/* Shimmer on progress bar */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_1.5s_infinite]" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
