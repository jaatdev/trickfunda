'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { Compass, Telescope, Star } from 'lucide-react';

import { KDStats } from '@/types/kdMethod';
import { CosmicBackground } from './CosmicBackground';
import { TimelineCard } from './TimelineCard';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: 'easeOut' } },
};

type Chapter = {
  title: string;
  slug: string;
  typesCount: number;
  stats: KDStats;
};

type Props = {
  subjectSlug: string;
  chapters: Chapter[];
  displayTitle: string;
};

export function GSCosmicTheme({ subjectSlug, chapters, displayTitle }: Props) {
  if (chapters.length === 0) {
    return (
      <div className="py-12 text-center text-amber-500/50 font-serif">
        The cosmos is vast and empty.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 pt-24 pb-12 px-4 md:pt-32 md:pb-16 md:px-8 relative overflow-hidden selection:bg-amber-500/30">
      
      {/* Immersive Cosmic Background */}
      <CosmicBackground />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Stellar Header */}
        <header className="mb-20 text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="inline-flex items-center gap-2 mb-6"
          >
            <Star className="w-4 h-4 text-amber-400 opacity-60" />
            <Telescope className="w-6 h-6 text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.8)] mx-2" />
            <Star className="w-4 h-4 text-amber-400 opacity-60" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-indigo-100 to-amber-100 tracking-tighter drop-shadow-lg uppercase"
          >
            {displayTitle}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-lg md:text-2xl text-indigo-200/60 max-w-2xl mx-auto font-light tracking-wide mt-6"
          >
            Journey through the cosmos of human history, polity, and geography. Select an epoch to explore.
          </motion.p>
        </header>

        {/* The Timeline Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-[300px]"
        >
          {chapters.map((chapter, i) => (
            <motion.div key={chapter.slug} variants={itemVariants} className="h-full">
              <Link href={`/kd-method/${subjectSlug}/${chapter.slug}`} className="block h-full outline-none group">
                <TimelineCard>
                  
                  {/* Chapter Navigation Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="px-3 py-1 bg-slate-950/80 rounded border border-slate-800 text-xs text-slate-400 tracking-widest uppercase flex items-center gap-2">
                      <Compass className="w-3 h-3 text-amber-500" />
                      Sector {String(i + 1).padStart(2, '0')}
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-3xl font-bold text-slate-50 group-hover:text-amber-100 transition-colors duration-300 leading-tight">
                    {chapter.title}
                  </h2>
                  
                  {/* Metadata / Tags */}
                  <div className="mt-auto flex flex-wrap gap-2 text-xs font-medium tracking-wide">
                    <span className="px-3 py-1.5 rounded bg-slate-800/80 text-amber-100 border border-amber-900/50 backdrop-blur-md">
                      {chapter.typesCount} Epochs
                    </span>
                    {chapter.stats.quizzes > 0 && (
                      <span className="px-3 py-1.5 rounded bg-indigo-900/40 text-indigo-200 border border-indigo-800/50 backdrop-blur-md">
                        {chapter.stats.quizzes} Quizzes
                      </span>
                    )}
                    {chapter.stats.questions > 0 && (
                      <span className="px-3 py-1.5 rounded bg-teal-900/40 text-teal-200 border border-teal-800/50 backdrop-blur-md">
                        {chapter.stats.questions} Q's
                      </span>
                    )}
                  </div>

                </TimelineCard>
              </Link>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </div>
  );
}
