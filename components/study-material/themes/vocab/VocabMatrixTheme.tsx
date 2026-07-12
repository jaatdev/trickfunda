'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { Terminal, Code, Cpu } from 'lucide-react';

import { KDStats } from '@/types/studyMaterial';
import { MatrixBackground } from './MatrixBackground';
import { MatrixCard } from './MatrixCard';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, filter: 'blur(5px)' },
  show: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.4 } },
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

export function VocabMatrixTheme({ subjectSlug, chapters, displayTitle }: Props) {
  if (chapters.length === 0) {
    return (
      <div className="py-12 text-center text-green-500/50 font-mono">
        System error: No data found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-50 pt-24 pb-12 px-4 md:pt-32 md:pb-16 md:px-8 relative overflow-hidden selection:bg-green-500/30 font-mono">
      
      {/* Digital Rain Background */}
      <MatrixBackground />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Terminal Header */}
        <header className="mb-20 space-y-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 mb-4 px-4 py-1 bg-green-950/50 border border-green-800/50 text-green-400 text-sm"
          >
            <Terminal className="w-4 h-4" />
            <span>SYS.INIT // VOCABULARY_DB</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-black text-green-400 tracking-tighter uppercase drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]"
          >
            {displayTitle}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-lg md:text-xl text-green-600/80 max-w-2xl mx-auto tracking-widest mt-4 uppercase"
          >
            Decrypt the lexical matrix. Select a root cluster to inject knowledge.
          </motion.p>
        </header>

        {/* The Matrix Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px]"
        >
          {chapters.map((chapter, i) => (
            <motion.div key={chapter.slug} variants={itemVariants} className="h-full">
              <Link href={`/study-material/${subjectSlug}/${chapter.slug}`} className="block h-full outline-none group">
                <MatrixCard>
                  
                  {/* Cyber Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="text-xs text-green-700 font-bold tracking-widest uppercase flex items-center gap-2">
                      <Code className="w-4 h-4 text-green-500" />
                      BLOCK_{String(i + 1).padStart(2, '0')}
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-bold text-green-100 group-hover:text-white transition-colors duration-300 leading-tight drop-shadow-[0_0_5px_rgba(74,222,128,0.3)]">
                    {chapter.title}
                  </h2>
                  
                  {/* Metadata / Tags */}
                  <div className="mt-auto flex flex-wrap gap-2 text-xs font-bold tracking-widest">
                    <span className="px-2 py-1 bg-green-950 text-green-400 border border-green-800/50">
                      {chapter.typesCount} FILES
                    </span>
                    {chapter.stats.quizzes > 0 && (
                      <span className="px-2 py-1 bg-teal-950 text-teal-400 border border-teal-800/50">
                        {chapter.stats.quizzes} EXECS
                      </span>
                    )}
                    {chapter.stats.questions > 0 && (
                      <span className="px-2 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                        {chapter.stats.questions} BYTES
                      </span>
                    )}
                    {chapter.stats.flashcards > 0 && (
                      <span className="px-2 py-1 bg-pink-950 text-pink-400 border border-pink-800/50">
                        {chapter.stats.flashcards} CARDS
                      </span>
                    )}
                  </div>

                </MatrixCard>
              </Link>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </div>
  );
}
