'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { Ruler, ArrowUpRight } from 'lucide-react';

import { KDStats } from '@/types/kdMethod';
import { BlueprintBackground } from './BlueprintBackground';
import { TechnicalCard } from './TechnicalCard';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
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

export function MathTheme({ subjectSlug, chapters, displayTitle }: Props) {
  if (chapters.length === 0) {
    return (
      <div className="py-12 text-center text-blue-500/50 font-mono">
        Blueprint uninitialized. No data found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#001021] text-blue-50 pt-24 pb-12 px-4 md:pt-32 md:pb-16 md:px-8 relative overflow-hidden selection:bg-blue-500/30">
      
      {/* Immersive Blueprint Background */}
      <BlueprintBackground />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Technical Header */}
        <header className="mb-16 border-l-4 border-blue-500 pl-6 py-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <Ruler className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-mono tracking-[0.2em] text-blue-400 uppercase">
              Geometry & Logic Matrix
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-blue-500 tracking-tighter uppercase"
          >
            {displayTitle}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-lg md:text-xl text-blue-300/70 max-w-2xl font-mono mt-4"
          >
            > Establishing multidimensional parameters...
            <br />
            > Select a theorem to expand.
          </motion.p>
        </header>

        {/* The Blueprint Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px]"
        >
          {chapters.map((chapter, i) => (
            <motion.div key={chapter.slug} variants={itemVariants} className="h-full">
              <Link href={`/kd-method/${subjectSlug}/${chapter.slug}`} className="block h-full outline-none group">
                <TechnicalCard>
                  
                  {/* Technical Index */}
                  <div className="flex items-center justify-between mb-auto border-b border-blue-900/40 pb-4">
                    <span className="font-mono text-sm font-bold text-blue-500">
                      SEC_{String(i + 1).padStart(2, '0')}
                    </span>
                    <ArrowUpRight className="w-5 h-5 text-blue-700 group-hover:text-blue-400 transition-colors duration-300" />
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-bold text-blue-100 group-hover:text-white transition-colors duration-300 tracking-tight my-4">
                    {chapter.title}
                  </h2>
                  
                  {/* Technical Stats */}
                  <div className="mt-auto grid grid-cols-2 gap-2 text-[10px] font-mono tracking-widest uppercase">
                    <div className="bg-[#002244] border border-blue-900/50 px-2 py-1.5 text-blue-300 flex justify-between">
                      <span>Types</span>
                      <span className="font-bold text-blue-400">{chapter.typesCount}</span>
                    </div>
                    {chapter.stats.quizzes > 0 ? (
                      <div className="bg-[#002244] border border-blue-900/50 px-2 py-1.5 text-blue-300 flex justify-between">
                        <span>Quizzes</span>
                        <span className="font-bold text-blue-400">{chapter.stats.quizzes}</span>
                      </div>
                    ) : (
                      <div className="bg-[#001122] border border-blue-900/20 px-2 py-1.5 text-blue-800 flex justify-between">
                        <span>Quizzes</span>
                        <span>0</span>
                      </div>
                    )}
                  </div>

                </TechnicalCard>
              </Link>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </div>
  );
}
