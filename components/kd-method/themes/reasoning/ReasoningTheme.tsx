'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { BrainCircuit, Hexagon } from 'lucide-react';

import { KDStats } from '@/types/kdMethod';
import { NeuralMazeBackground } from './NeuralMazeBackground';
import { PuzzleCard } from './PuzzleCard';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, rotateX: 10 },
  show: { opacity: 1, scale: 1, rotateX: 0, transition: { duration: 0.5, ease: 'easeOut' } },
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

export function ReasoningTheme({ subjectSlug, chapters, displayTitle }: Props) {
  if (chapters.length === 0) {
    return (
      <div className="py-12 text-center text-violet-500/50 font-mono">
        Neural pathways unmapped. No logic found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0514] text-violet-50 pt-24 pb-12 px-4 md:pt-32 md:pb-16 md:px-8 relative overflow-hidden selection:bg-violet-500/30">
      
      {/* Immersive Neural Synapse Background */}
      <NeuralMazeBackground />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Logic Header */}
        <header className="mb-16 border-t border-violet-900/50 pt-8 relative">
          {/* Top-left node accent */}
          <div className="absolute top-[-4px] left-0 w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-4 bg-violet-950/40 border border-violet-900/40 px-3 py-1 rounded-full"
          >
            <BrainCircuit className="w-4 h-4 text-fuchsia-400" />
            <span className="text-xs font-mono tracking-widest text-fuchsia-300 uppercase">
              Synaptic Network Active
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-violet-100 via-fuchsia-200 to-violet-500 tracking-tight"
          >
            {displayTitle}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-lg md:text-xl text-violet-300/70 max-w-2xl mt-4 leading-relaxed"
          >
            Navigate the maze of logic. Every node connects to a deeper understanding. Select a pathway to begin.
          </motion.p>
        </header>

        {/* The Node Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[220px]"
        >
          {chapters.map((chapter, i) => (
            <motion.div key={chapter.slug} variants={itemVariants} className="h-full">
              <Link href={`/kd-method/${subjectSlug}/${chapter.slug}`} className="block h-full outline-none group">
                <PuzzleCard>
                  
                  {/* Hexagon Node Index */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="relative flex items-center justify-center w-8 h-8">
                      <Hexagon className="absolute w-full h-full text-violet-900/60 group-hover:text-violet-500/40 transition-colors duration-500" strokeWidth={1.5} />
                      <span className="font-mono text-xs font-bold text-violet-300 relative z-10">
                        {i + 1}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-bold text-violet-50 group-hover:text-white transition-colors duration-300 tracking-tight mb-2">
                    {chapter.title}
                  </h2>
                  
                  {/* Node Stats */}
                  <div className="mt-auto flex flex-wrap gap-2 text-xs font-medium">
                    <span className="px-2.5 py-1 rounded bg-violet-900/30 text-violet-300 border border-violet-800/50">
                      {chapter.typesCount} Nodes
                    </span>
                    {chapter.stats.quizzes > 0 && (
                      <span className="px-2.5 py-1 rounded bg-fuchsia-900/20 text-fuchsia-300 border border-fuchsia-900/30">
                        {chapter.stats.quizzes} Puzzles
                      </span>
                    )}
                    {chapter.stats.questions > 0 && (
                      <span className="px-2.5 py-1 rounded bg-indigo-900/20 text-indigo-300 border border-indigo-900/30">
                        {chapter.stats.questions} Q's
                      </span>
                    )}
                  </div>

                </PuzzleCard>
              </Link>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </div>
  );
}
