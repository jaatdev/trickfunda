'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { ChevronRight, Feather } from 'lucide-react';

import { KDStats } from '@/types/kdMethod';
import { GoldenDustBackground } from './GoldenDustBackground';
import { ScholarlyCard } from './ScholarlyCard';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(5px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 200, damping: 20 } },
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

export function EnglishTheme({ subjectSlug, chapters, displayTitle }: Props) {
  if (chapters.length === 0) {
    return (
      <div className="py-12 text-center text-amber-500/50 font-serif">
        The archives are empty. Wait for the scribe.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040814] text-gray-100 pt-24 pb-12 px-4 md:pt-32 md:pb-16 md:px-8 relative overflow-hidden selection:bg-amber-500/30">
      
      {/* Immersive Magical Library Background */}
      <GoldenDustBackground />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Ornate Header */}
        <header className="mb-16 text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="inline-flex items-center gap-2 mb-6 opacity-80"
          >
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-500" />
            <Feather className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-500" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-200 to-amber-600 drop-shadow-sm tracking-wide"
          >
            {displayTitle}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-lg md:text-xl text-amber-200/60 max-w-2xl mx-auto font-serif italic"
          >
            "Master the structure of language, and the world bends to your voice."
          </motion.p>
        </header>

        {/* The Archive Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-[280px]"
        >
          {chapters.map((chapter, i) => (
            <motion.div key={chapter.slug} variants={itemVariants} className="h-full">
              <Link href={`/kd-method/${subjectSlug}/${chapter.slug}`} className="block h-full outline-none group">
                <ScholarlyCard>
                  
                  {/* Chapter Roman Numeral Header */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-serif text-3xl font-bold text-amber-500/20 group-hover:text-amber-400/40 transition-colors duration-500">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="w-8 h-8 rounded-full border border-amber-500/0 group-hover:border-amber-500/50 flex items-center justify-center transition-all duration-500">
                      <ChevronRight className="w-4 h-4 text-amber-500/0 group-hover:text-amber-400 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-500" />
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-serif text-amber-50 group-hover:text-amber-200 transition-colors duration-300 leading-tight">
                    {chapter.title}
                  </h2>
                  
                  {/* Metadata / Tags */}
                  <div className="mt-auto pt-6 flex flex-wrap gap-2 text-xs font-sans tracking-widest uppercase">
                    <span className="px-2 py-1 rounded bg-amber-950/40 text-amber-500 border border-amber-900/30">
                      {chapter.typesCount} Types
                    </span>
                    {chapter.stats.quizzes > 0 && (
                      <span className="px-2 py-1 rounded bg-blue-950/40 text-blue-400 border border-blue-900/30">
                        {chapter.stats.quizzes} Quizzes
                      </span>
                    )}
                    {chapter.stats.questions > 0 && (
                      <span className="px-2 py-1 rounded bg-rose-950/40 text-rose-400 border border-rose-900/30">
                        {chapter.stats.questions} Q's
                      </span>
                    )}
                  </div>

                </ScholarlyCard>
              </Link>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </div>
  );
}
