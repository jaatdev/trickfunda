'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useMotionTemplate } from 'framer-motion';
import { useFullscreen } from '@/lib/fullscreen-context';
import { Maximize, Minimize, X, Sparkles, Brain, ArrowRight, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import AnimatedBackground from '../flashcards/AnimatedBackground';

export interface Flashcard {
  id: string;
  type: string;
  word: string;
  meaning: string;
  synonyms?: string[];
  antonyms?: string[];
  kdKey?: string;
  kdHack: string;
}

interface Props {
  flashcards: Flashcard[];
  onFinish?: () => void;
}

export default function FlashcardViewer({ flashcards, onFinish }: Props) {
  const router = useRouter();
  const { isFullscreen, enterFullscreen, exitFullscreen } = useFullscreen();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  
  // 0 = Front (Word)
  // 1 = Back (Meaning + Synonyms)
  // 2 = KD Hack (Special Reveal)
  const [flipState, setFlipState] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1080;
    }
    return false;
  });

  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useTransform(tiltY, [-100, 100], [10, -10]);
  const rotateY = useTransform(tiltX, [-100, 100], [-10, 10]);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (isMobile) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const clientX = event.clientX - rect.left;
    const clientY = event.clientY - rect.top;
    
    mouseX.set(clientX);
    mouseY.set(clientY);

    const xPct = clientX / width - 0.5;
    const yPct = clientY / height - 0.5;
    tiltX.set(xPct * 200);
    tiltY.set(yPct * 200);
  };

  const handleMouseLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  const spotlightFront = useMotionTemplate`
    radial-gradient(
      800px circle at ${mouseX}px ${mouseY}px,
      rgba(255,255,255,0.1),
      transparent 80%
    )
  `;

  const spotlightBack = useMotionTemplate`
    radial-gradient(
      800px circle at ${mouseX}px ${mouseY}px,
      rgba(168,85,247,0.1),
      transparent 80%
    )
  `;

  const spotlightKDHack = useMotionTemplate`
    radial-gradient(
      800px circle at ${mouseX}px ${mouseY}px,
      rgba(52,211,153,0.15),
      transparent 80%
    )
  `;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1080);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setMounted(true);
    // Hide scrollbar on body while flashcard viewer is open
    const originalStyle = window.getComputedStyle(document.body).overflow;  
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const currentCard = flashcards[currentIndex];

  const handleNextState = () => {
    if (flipState < 2) {
      setFlipState(prev => prev + 1);
    } else {
      handleNextCard();
    }
  };

  const handleNextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
      setFlipState(0);
    } else {
      if (onFinish) {
        onFinish();
      } else {
        exitFullscreen();
        router.push('/study-material');
      }
    }
  };

  const handlePrevCard = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
      setFlipState(0);
    }
  };

  const toggleFullscreen = async () => {
    if (isFullscreen) {
      await exitFullscreen();
    } else {
      await enterFullscreen();
    }
  };

  if (!currentCard || !mounted) return null;

  const cardVariants: import('framer-motion').Variants = {
    enter: (dir: number) => ({
      zIndex: 0,
      opacity: 0,
      scale: isMobile ? 1 : 1.05,
      filter: isMobile ? 'blur(0px)' : 'blur(20px)',
    }),
    center: {
      zIndex: 1,
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      transition: { duration: isMobile ? 0.2 : 0.5, ease: "easeOut" }
    },
    exit: (dir: number) => ({
      zIndex: 0,
      opacity: 0,
      scale: isMobile ? 1 : 1.05,
      filter: isMobile ? 'blur(0px)' : 'blur(20px)',
      transition: { duration: isMobile ? 0.2 : 0.5, ease: "easeIn" }
    })
  };

  const content = (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-950 text-gray-100 overflow-hidden`}>
      <AnimatedBackground />

      {/* Top Header */}
      <div className="absolute top-0 w-full p-6 flex items-center justify-between z-50">
        <button onClick={() => { exitFullscreen(); router.push('/study-material'); }} className="p-3 bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.5)] rounded-full hover:bg-white/10 hover:scale-110 transition-all">
          <X className="w-6 h-6 text-white/70" />
        </button>

        <div className="flex items-center gap-4 bg-white/5 border border-white/10 backdrop-blur-md px-6 py-3 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.15)] font-bold text-lg text-white">
          <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
          <span className="tracking-widest uppercase text-sm">Card {currentIndex + 1} <span className="text-white/30">/</span> {flashcards.length}</span>
        </div>

        <button onClick={toggleFullscreen} className="p-3 bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.5)] rounded-full hover:bg-white/10 hover:scale-110 transition-all">
          {isFullscreen ? <Minimize className="w-6 h-6 text-white/70" /> : <Maximize className="w-6 h-6 text-white/70" />}
        </button>
      </div>

      {/* Main Flashcard Container - Wider and taller to accommodate more text */}
      <div className="relative w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] h-[70vh] md:h-[75vh] min-h-[500px] flex items-center justify-center perspective-[2000px] z-40">
        <AnimatePresence custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full cursor-pointer group"
            onClick={handleNextState}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ transformStyle: 'preserve-3d', WebkitTapHighlightColor: 'transparent' }}
          >
            <motion.div 
              className="w-full h-full relative"
              style={{
                transformStyle: 'preserve-3d',
                rotateX: isMobile ? 0 : rotateX,
                rotateY: isMobile ? 0 : rotateY
              }}
            >
            {/* Animated Neon Border */}
            <div className="absolute inset-[-2px] rounded-[2.6rem] overflow-hidden opacity-50 md:opacity-80 -z-10 bg-white/5">
                <div className="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,transparent_0_280deg,rgba(59,130,246,1)_360deg)] animate-[spin_4s_linear_infinite]" />
            </div>

            {/* Front of Card (Word) */}
            <motion.div 
              className="absolute inset-0 w-full h-full rounded-[2.5rem] bg-white/5 backdrop-blur-3xl border border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.3)] overflow-hidden"
              initial={false}
              animate={isMobile ? { zIndex: flipState === 0 ? 10 : 0, opacity: flipState === 0 ? 1 : 0 } : { rotateX: flipState > 0 ? 180 : 0, zIndex: flipState === 0 ? 10 : 0, opacity: flipState === 0 ? 1 : 0 }}
              transition={isMobile ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 20 }}
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            >
              {/* Cursor Spotlight */}
              <motion.div
                className="pointer-events-none absolute -inset-px rounded-[2.5rem] opacity-0 transition duration-300 group-hover:opacity-100 z-0"
                style={{ background: spotlightFront }}
              />
              <div className={`absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] ${isMobile ? '' : 'animate-[shimmer_3s_infinite]'} pointer-events-none z-0`} />
              
              <div className="absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden scrollbar-hide p-8 md:p-12 flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10">
                  <span className="px-6 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-bold uppercase tracking-[0.2em] mb-8 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                    {currentCard.type}
                  </span>
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-black bg-gradient-to-br from-white via-blue-100 to-blue-500/50 bg-clip-text text-transparent filter drop-shadow-[0_0_20px_rgba(59,130,246,0.3)] text-center break-words text-balance w-full px-4">
                    {currentCard.word}
                  </h1>
                </div>
                
                <div className={`mt-8 text-blue-400/50 text-sm font-medium uppercase tracking-widest ${isMobile ? '' : 'animate-bounce'} flex items-center justify-center gap-2 relative z-10 shrink-0`}>
                  Tap to Flip <ArrowRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </motion.div>

            {/* Back of Card (Meaning & Synonyms) */}
            <motion.div 
              className="absolute inset-0 w-full h-full rounded-[2.5rem] bg-white/5 backdrop-blur-3xl border border-white/10 shadow-[0_0_50px_rgba(168,85,247,0.3)] overflow-hidden"
              initial={false}
              animate={isMobile ? { zIndex: flipState === 0 ? 0 : 10, opacity: flipState === 1 ? 1 : 0 } : { rotateX: flipState === 0 ? -180 : 0, zIndex: flipState === 0 ? 0 : 10, opacity: flipState === 1 ? 1 : 0 }}
              transition={isMobile ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 20 }}
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: isMobile ? 'none' : 'rotateX(180deg)' }}
            >
              {/* Cursor Spotlight */}
              <motion.div
                className="pointer-events-none absolute -inset-px rounded-[2.5rem] opacity-0 transition duration-300 group-hover:opacity-100 z-0"
                style={{ background: spotlightBack }}
              />
              <div className="absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden scrollbar-hide p-8 md:p-12 flex flex-col">
                <div className="w-full flex-1 flex flex-col justify-center items-center gap-8 py-8 relative z-10">
                  <div className="text-center space-y-6 flex-1 flex flex-col justify-center">
                    <h2 className="text-2xl font-black text-white/20 uppercase tracking-widest break-words">{currentCard.word}</h2>
                    <p className="text-2xl md:text-3xl lg:text-4xl font-medium leading-relaxed text-white drop-shadow-md text-balance">
                      "{currentCard.meaning}"
                    </p>
                  </div>

                  {( (currentCard.synonyms && currentCard.synonyms.length > 0) || (currentCard.antonyms && currentCard.antonyms.length > 0) ) && (
                    <div className={`grid grid-cols-1 ${(currentCard.synonyms && currentCard.synonyms.length > 0) && (currentCard.antonyms && currentCard.antonyms.length > 0) ? 'lg:grid-cols-2' : ''} gap-6 w-full mt-10`}>
                      
                      {(currentCard.synonyms && currentCard.synonyms.length > 0) && (
                        <div className="bg-emerald-500/10 p-6 rounded-3xl border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)] relative overflow-hidden group-hover:border-emerald-500/40 transition-colors">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-16 -mt-16" />
                          <h3 className="font-bold text-emerald-400 mb-4 flex items-center gap-2 text-lg uppercase tracking-wider relative z-10">
                            <Sparkles className="w-5 h-5" /> Synonyms
                          </h3>
                          <div className="flex flex-wrap gap-2 relative z-10">
                            {currentCard.synonyms.map((syn, idx) => (
                              <span key={idx} className="px-4 py-2 bg-black/40 backdrop-blur-md rounded-xl text-sm font-medium text-emerald-100 border border-emerald-500/20 shadow-[0_4px_12px_rgba(0,0,0,0.5)] break-words">
                                {syn}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {(currentCard.antonyms && currentCard.antonyms.length > 0) && (
                        <div className="bg-rose-500/10 p-6 rounded-3xl border border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.1)] relative overflow-hidden group-hover:border-rose-500/40 transition-colors">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl -mr-16 -mt-16" />
                          <h3 className="font-bold text-rose-400 mb-4 flex items-center gap-2 text-lg uppercase tracking-wider relative z-10">
                            <X className="w-5 h-5" /> Antonyms
                          </h3>
                          <div className="flex flex-wrap gap-2 relative z-10">
                            {currentCard.antonyms.map(ant => (
                              <span key={ant} className="px-4 py-2 bg-black/40 backdrop-blur-md rounded-xl text-sm font-medium text-rose-100 border border-rose-500/20 shadow-[0_4px_12px_rgba(0,0,0,0.5)] break-words">{ant}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                    </div>
                  )}
                </div>
                
                <div className={`mt-8 text-purple-400/50 text-sm font-medium uppercase tracking-widest ${isMobile ? '' : 'animate-bounce'} flex items-center justify-center gap-2 relative z-10 shrink-0`}>
                  Tap for KD Hack <Brain className="w-4 h-4" />
                </div>
              </div>
            </motion.div>

            {/* KD Hack Overlay Layer (Slides UP from bottom when state is 2) */}
            <div className="absolute inset-0 w-full h-full rounded-[2.5rem] overflow-hidden z-20 pointer-events-none">
              <motion.div 
                className="absolute inset-0 w-full h-full bg-emerald-950/40 backdrop-blur-3xl border-2 border-emerald-400/30 shadow-[0_0_100px_rgba(52,211,153,0.5)] flex flex-col items-center overflow-hidden pointer-events-auto"
                initial={isMobile ? { opacity: 0 } : { y: '100%', opacity: 0 }}
                animate={isMobile ? { opacity: flipState === 2 ? 1 : 0 } : { y: flipState === 2 ? 0 : '100%', opacity: flipState === 2 ? 1 : 0 }}
                transition={isMobile ? { duration: 0 } : { type: "spring", damping: 25, stiffness: 200 }}
              >
                <div className="absolute top-0 right-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(52,211,153,0.3)_360deg)] animate-[spin_3s_linear_infinite] pointer-events-none z-0 mix-blend-overlay" />
                
                {/* Cursor Spotlight */}
                <motion.div
                  className="pointer-events-none absolute -inset-px rounded-[2.5rem] opacity-0 transition duration-300 group-hover:opacity-100 z-0"
                  style={{ background: spotlightKDHack }}
                />

                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay pointer-events-none z-0" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none" />

                <div className="absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden scrollbar-hide p-8 md:p-12 flex flex-col">
                  <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center space-y-8 w-full">
                    <motion.div 
                      initial={isMobile ? { opacity: 0 } : { scale: 0.5, rotate: -180 }}
                      animate={isMobile ? { opacity: flipState === 2 ? 1 : 0 } : { scale: flipState === 2 ? 1 : 0.5, rotate: flipState === 2 ? 0 : -180 }}
                      transition={isMobile ? { duration: 0 } : { type: "spring", stiffness: 200, delay: 0.2 }}
                      className="w-20 h-20 md:w-24 md:h-24 bg-emerald-400/20 border border-emerald-400/50 rounded-full flex shrink-0 items-center justify-center shadow-[0_0_50px_rgba(52,211,153,0.5)]"
                    >
                      <Brain className="w-10 h-10 md:w-12 md:h-12 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]" />
                    </motion.div>
                    
                    <h3 className="text-emerald-400 font-bold tracking-[0.3em] uppercase text-lg md:text-xl">KD Hack Unlocked</h3>
                    
                    {currentCard.kdKey && (
                      <div className="bg-emerald-500/20 px-6 py-3 rounded-full border border-emerald-400/30 flex items-center gap-3 shadow-[0_0_20px_rgba(52,211,153,0.15)]">
                        <span className="text-emerald-300 font-bold uppercase tracking-wider text-sm">Key:</span>
                        <span className="text-white font-black text-2xl drop-shadow-md">{currentCard.kdKey}</span>
                      </div>
                    )}
                    
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-black leading-relaxed md:leading-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] text-balance break-words">
                      {currentCard.kdHack}
                    </h2>
                  </div>

                  <div className="mt-8 text-emerald-400/70 text-sm font-medium uppercase tracking-widest animate-pulse flex items-center justify-center gap-2 relative z-10 shrink-0">
                    Tap for Next Card <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </motion.div>
            </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-12 flex gap-6 z-50">
         <button 
            onClick={(e) => { e.stopPropagation(); handlePrevCard(); }}
            disabled={currentIndex === 0}
            className="px-8 py-4 bg-black/50 backdrop-blur-md border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] rounded-2xl hover:bg-white/10 hover:scale-105 disabled:opacity-30 disabled:hover:scale-100 disabled:hover:bg-black/50 transition-all font-bold flex items-center gap-3 text-white uppercase tracking-wider text-sm"
          >
            <ArrowLeft className="w-5 h-5" /> Prev
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); handleNextCard(); }}
            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_10px_40px_rgba(16,185,129,0.4)] rounded-2xl hover:scale-105 transition-all font-bold flex items-center gap-3 uppercase tracking-wider text-sm"
          >
            {currentIndex === flashcards.length - 1 ? 'Finish Session' : 'Next Card'} <ArrowRight className="w-5 h-5" />
          </button>
      </div>

    </div>
  );

  return createPortal(content, document.body);
}
