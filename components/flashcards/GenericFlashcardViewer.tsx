'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFullscreen } from '@/lib/fullscreen-context';
import { Maximize, Minimize, X, Sparkles, Brain, ArrowRight, ArrowLeft, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import type { SubjectFlashcard } from '@/lib/types';

interface Props {
  flashcards: SubjectFlashcard[];
  onFinish?: () => void;
  onClose?: () => void;
}

export default function GenericFlashcardViewer({ flashcards, onFinish, onClose }: Props) {
  const router = useRouter();
  const { isFullscreen, enterFullscreen, exitFullscreen } = useFullscreen();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  
  // 0 = Front
  // 1 = Back (Answer & Explanation)
  // 2 = Trick / Mnemonic (Special Reveal)
  const [flipState, setFlipState] = useState(0);
  const [direction, setDirection] = useState(1);
  const [showHint, setShowHint] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1080;
    }
    return false;
  });

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

  const hasTrick = !!currentCard?.trick || !!currentCard?.trick_hi || !!currentCard?.kdHack || !!currentCard?.kdHack_hi;
  
  const displayTrick = currentCard?.kdHack || currentCard?.trick;
  const displayTrickHi = currentCard?.kdHack_hi || currentCard?.trick_hi;

  const handleNextState = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (flipState === 0) {
      setFlipState(1);
    } else if (flipState === 1 && hasTrick) {
      setFlipState(2);
    } else {
      handleNextCard();
    }
  };

  const handleNextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
      setFlipState(0);
      setShowHint(false);
    } else {
      if (onFinish) {
        onFinish();
      } else {
        exitFullscreen();
        router.back();
      }
    }
  };

  const handlePrevCard = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
      setFlipState(0);
      setShowHint(false);
    }
  };

  const toggleFullscreen = async () => {
    if (isFullscreen) {
      await exitFullscreen();
    } else {
      await enterFullscreen();
    }
  };

  const handleClose = () => {
    exitFullscreen();
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  if (!currentCard || !mounted) return null;

  const cardVariants: import('framer-motion').Variants = {
    enter: (dir: number) => ({
      x: isMobile ? 0 : (dir > 0 ? '100%' : '-100%'),
      opacity: 0,
      scale: isMobile ? 1 : 0.8,
      rotateY: isMobile ? 0 : (dir > 0 ? 45 : -45),
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: { type: 'spring', stiffness: 200, damping: 25, duration: isMobile ? 0.2 : undefined }
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: isMobile ? 0 : (dir < 0 ? '100%' : '-100%'),
      opacity: 0,
      scale: isMobile ? 1 : 0.8,
      rotateY: isMobile ? 0 : (dir < 0 ? 45 : -45),
      transition: { duration: isMobile ? 0.2 : 0.4, ease: "easeInOut" }
    })
  };

  const content = (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-950 text-gray-100 overflow-hidden`}>
      {/* Deep Cyber Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0a0a] to-black opacity-80" />
      <div className="absolute top-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay" />
      <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] pointer-events-none" />

      {/* Top Header */}
      <div className="absolute top-0 w-full p-6 flex items-center justify-between z-50">
        <button onClick={handleClose} className="p-3 bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.5)] rounded-full hover:bg-white/10 hover:scale-110 transition-all">
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

      {/* Main Flashcard Container */}
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
            style={{ transformStyle: 'preserve-3d', WebkitTapHighlightColor: 'transparent' }}
          >
            {/* Front of Card */}
            <motion.div 
              className="absolute inset-0 w-full h-full rounded-[2.5rem] bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.15)] overflow-hidden"
              initial={false}
              animate={isMobile ? { zIndex: flipState === 0 ? 10 : 0, opacity: flipState === 0 ? 1 : 0 } : { rotateX: flipState > 0 ? 180 : 0, zIndex: flipState === 0 ? 10 : 0, opacity: flipState === 0 ? 1 : 0 }}
              transition={isMobile ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 20 }}
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            >
              <div className={`absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] ${isMobile ? '' : 'animate-[shimmer_3s_infinite]'} pointer-events-none`} />
              
              <div className="absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden scrollbar-hide p-8 md:p-12 flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10 gap-6">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-br from-white via-blue-100 to-blue-500/50 bg-clip-text text-transparent filter drop-shadow-[0_0_15px_rgba(59,130,246,0.3)] text-center break-words text-balance w-full max-w-4xl px-4 leading-relaxed md:leading-snug">
                    {currentCard.front}
                  </h1>
                  
                  {currentCard.front_hi && (
                    <h2 className="text-lg md:text-xl lg:text-2xl font-medium text-blue-200/70 text-center break-words text-balance w-full max-w-4xl px-4 mt-2 leading-relaxed">
                      {currentCard.front_hi}
                    </h2>
                  )}

                  {(currentCard.hint || currentCard.hint_hi) && (
                    <div className="mt-8 flex flex-col items-center w-full">
                      {!showHint ? (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setShowHint(true); }}
                          className="px-6 py-2.5 rounded-full border border-yellow-500/30 text-yellow-400/80 hover:bg-yellow-500/10 hover:text-yellow-400 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(234,179,8,0.1)]"
                        >
                          <Info className="w-4 h-4" /> Show Hint
                        </button>
                      ) : (
                        <div className="px-6 py-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-100/90 text-center text-sm md:text-base w-full max-w-lg shadow-[0_0_20px_rgba(234,179,8,0.15)] animate-in fade-in zoom-in-95 duration-300">
                          {currentCard.hint && <p className="font-medium">{currentCard.hint}</p>}
                          {currentCard.hint_hi && <p className="mt-2 text-yellow-200/70">{currentCard.hint_hi}</p>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className={`mt-8 text-blue-400/50 text-sm font-medium uppercase tracking-widest ${isMobile ? '' : 'animate-bounce'} flex items-center justify-center gap-2 relative z-10 shrink-0`}>
                  Tap to Flip <ArrowRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </motion.div>

            {/* Back of Card */}
            <motion.div 
              className="absolute inset-0 w-full h-full rounded-[2.5rem] bg-gradient-to-br from-[#111827] to-[#1f2937] border border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.15)] overflow-hidden"
              initial={false}
              animate={isMobile ? { zIndex: flipState === 0 ? 0 : 10, opacity: flipState === 1 ? 1 : 0 } : { rotateX: flipState === 0 ? -180 : 0, zIndex: flipState === 0 ? 0 : 10, opacity: flipState === 1 ? 1 : 0 }}
              transition={isMobile ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 20 }}
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: isMobile ? 'none' : 'rotateX(180deg)' }}
            >
              <div className="absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden scrollbar-hide p-8 md:p-12 flex flex-col">
                <div className="w-full flex-1 flex flex-col justify-center items-center gap-8 py-8">
                  
                  <div className="text-center w-full max-w-4xl space-y-6">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-md text-balance leading-relaxed">
                      {currentCard.back}
                    </h2>
                    {currentCard.back_hi && (
                      <h3 className="text-lg md:text-xl lg:text-2xl font-medium text-white/70 drop-shadow-md text-balance leading-relaxed">
                        {currentCard.back_hi}
                      </h3>
                    )}
                  </div>

                  {(currentCard.explanation || currentCard.explanation_hi) && (
                    <div className="w-full max-w-4xl mt-4 bg-black/40 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/10 shadow-lg text-center">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-purple-400 mb-4 flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4" /> Explanation
                      </h4>
                      {currentCard.explanation && (
                        <p className="text-gray-200 text-base md:text-lg leading-relaxed">{currentCard.explanation}</p>
                      )}
                      {currentCard.explanation_hi && (
                        <p className="text-gray-400 text-sm md:text-base mt-3 leading-relaxed">{currentCard.explanation_hi}</p>
                      )}
                    </div>
                  )}

                  {currentCard.lists && currentCard.lists.length > 0 && (
                    <div className={`grid grid-cols-1 ${currentCard.lists.length > 1 ? 'lg:grid-cols-2' : ''} gap-6 w-full max-w-5xl mt-6`}>
                      {currentCard.lists.map((list, idx) => {
                        const theme = list.colorTheme || (idx % 2 === 0 ? 'emerald' : 'rose');
                        let bgClass = "bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)] group-hover:border-emerald-500/40";
                        let titleClass = "text-emerald-400";
                        let blobClass = "bg-emerald-500/10";
                        let itemClass = "text-emerald-100 border-emerald-500/20";

                        if (theme === 'rose') {
                          bgClass = "bg-rose-500/10 border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.1)] group-hover:border-rose-500/40";
                          titleClass = "text-rose-400";
                          blobClass = "bg-rose-500/10";
                          itemClass = "text-rose-100 border-rose-500/20";
                        } else if (theme === 'blue') {
                          bgClass = "bg-blue-500/10 border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)] group-hover:border-blue-500/40";
                          titleClass = "text-blue-400";
                          blobClass = "bg-blue-500/10";
                          itemClass = "text-blue-100 border-blue-500/20";
                        } else if (theme === 'amber') {
                          bgClass = "bg-amber-500/10 border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.1)] group-hover:border-amber-500/40";
                          titleClass = "text-amber-400";
                          blobClass = "bg-amber-500/10";
                          itemClass = "text-amber-100 border-amber-500/20";
                        } else if (theme === 'purple') {
                          bgClass = "bg-purple-500/10 border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.1)] group-hover:border-purple-500/40";
                          titleClass = "text-purple-400";
                          blobClass = "bg-purple-500/10";
                          itemClass = "text-purple-100 border-purple-500/20";
                        }

                        return (
                          <div key={idx} className={`p-6 rounded-3xl border relative overflow-hidden transition-colors ${bgClass}`}>
                            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl -mr-16 -mt-16 ${blobClass}`} />
                            <div className="flex flex-col gap-1 mb-5 relative z-10">
                              <h3 className={`font-bold flex items-center gap-2 text-lg uppercase tracking-wider ${titleClass}`}>
                                <Info className="w-5 h-5" /> {list.title}
                              </h3>
                              {list.title_hi && (
                                <h4 className={`font-medium flex items-center gap-2 text-sm opacity-80 ${titleClass}`}>
                                  {list.title_hi}
                                </h4>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap gap-2.5 relative z-10">
                              {list.items.map((item, i) => (
                                <span key={i} className={`px-4 py-2.5 bg-black/50 backdrop-blur-md rounded-xl text-sm font-medium border shadow-[0_4px_12px_rgba(0,0,0,0.5)] break-words leading-relaxed ${itemClass}`}>
                                  {item}
                                  {list.items_hi && list.items_hi[i] && (
                                    <span className="block text-xs opacity-70 mt-1.5">{list.items_hi[i]}</span>
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                <div className="mt-4 text-purple-400/50 text-sm font-medium uppercase tracking-widest animate-bounce flex items-center justify-center gap-2 relative z-10 shrink-0">
                  {hasTrick ? (
                    <>Tap for KD Hack <Brain className="w-4 h-4" /></>
                  ) : (
                    <>Tap for Next Card <ArrowRight className="w-4 h-4" /></>
                  )}
                </div>
              </div>
            </motion.div>

            {/* KD Hack Overlay Layer (Slides UP from bottom when state is 2) */}
            {hasTrick && (
              <div className="absolute inset-0 w-full h-full rounded-[2.5rem] overflow-hidden z-20 pointer-events-none">
                <motion.div 
                  className="absolute inset-0 w-full h-full bg-gradient-to-b from-[#064e3b] to-[#022c22] border-2 border-emerald-400 shadow-[0_0_100px_rgba(52,211,153,0.3)] flex flex-col items-center overflow-hidden pointer-events-auto"
                  initial={isMobile ? { opacity: 0 } : { y: '100%', opacity: 0 }}
                  animate={isMobile ? { opacity: flipState === 2 ? 1 : 0 } : { y: flipState === 2 ? 0 : '100%', opacity: flipState === 2 ? 1 : 0 }}
                  transition={isMobile ? { duration: 0 } : { type: "spring", stiffness: 200, damping: 25 }}
                >
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay pointer-events-none" />
                  <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none" />

                  <div className="absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden scrollbar-hide p-8 md:p-12 flex flex-col">
                    <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center space-y-10 w-full max-w-4xl py-8">
                      <div className="flex flex-col items-center gap-4">
                        <motion.div 
                          initial={isMobile ? { opacity: 0 } : { scale: 0.5, rotate: -180 }}
                          animate={isMobile ? { opacity: flipState === 2 ? 1 : 0 } : { scale: flipState === 2 ? 1 : 0.5, rotate: flipState === 2 ? 0 : -180 }}
                          transition={isMobile ? { duration: 0 } : { type: "spring", stiffness: 200, delay: 0.2 }}
                          className="w-20 h-20 md:w-24 md:h-24 bg-emerald-400/20 border border-emerald-400/50 rounded-full flex shrink-0 items-center justify-center shadow-[0_0_50px_rgba(52,211,153,0.5)]"
                        >
                          <Brain className="w-10 h-10 md:w-12 md:h-12 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]" />
                        </motion.div>
                        
                        <h3 className="text-emerald-400 font-bold tracking-[0.3em] uppercase text-lg md:text-xl">KD Hack / Memory Trick</h3>
                      </div>
                      
                      <div className="space-y-6 w-full">
                        {displayTrick && (
                          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-relaxed md:leading-relaxed text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] text-balance break-words">
                            {displayTrick}
                          </h2>
                        )}
                        {displayTrickHi && (
                          <h2 className="text-xl md:text-2xl lg:text-3xl font-medium leading-relaxed md:leading-relaxed text-emerald-100/90 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] text-balance break-words">
                            {displayTrickHi}
                          </h2>
                        )}
                      </div>
                    </div>

                    <div className={`mt-8 text-emerald-400/70 text-sm font-medium uppercase tracking-widest ${isMobile ? '' : 'animate-pulse'} flex items-center justify-center gap-2 relative z-10 shrink-0`}>
                      Tap for Next Card <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
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
