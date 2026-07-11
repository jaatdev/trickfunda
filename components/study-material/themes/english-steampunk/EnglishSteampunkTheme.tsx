'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { Cog, Wrench } from 'lucide-react';

import { KDStats } from '@/types/studyMaterial';
import { SteampunkBackground } from './SteampunkBackground';
import { SteampunkCard } from './SteampunkCard';

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

export function EnglishSteampunkTheme({ subjectSlug, chapters, displayTitle }: Props) {
  if (chapters.length === 0) {
    return (
      <div className="py-12 text-center text-[#B87333] font-serif">
        Machinery error: No cogs found in this section.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1208] text-[#FCEABB] pt-24 pb-12 px-4 md:pt-32 md:pb-16 md:px-8 relative overflow-hidden selection:bg-[#D4AF37]/30 font-serif">
      
      {/* Brass & Steam Background */}
      <SteampunkBackground />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Machinery Header */}
        <header className="mb-20 space-y-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 mb-4 px-4 py-1 bg-[#2A1F13]/80 border border-[#5C4B33] text-[#D4AF37] text-sm uppercase tracking-widest shadow-[0_4px_10px_rgba(0,0,0,0.5)] rounded-sm"
          >
            <Cog className="w-4 h-4 animate-[spin_4s_linear_infinite]" />
            <span>ARCHIVE ENGINE ENGAGED</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FCEABB] via-[#D4AF37] to-[#B87333] tracking-tight uppercase drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]"
          >
            {displayTitle}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-lg md:text-xl text-[#B87333] max-w-2xl mx-auto tracking-widest mt-4 uppercase"
          >
            Select a mechanism to begin the analytical process.
          </motion.p>
        </header>

        {/* The Mechanism Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-[250px]"
        >
          {chapters.map((chapter, i) => (
            <motion.div key={chapter.slug} variants={itemVariants} className="h-full">
              <Link href={`/study-material/${subjectSlug}/${chapter.slug}`} className="block h-full outline-none group">
                <SteampunkCard>
                  
                  {/* Brass Plate Header */}
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#5C4B33] group-hover:border-[#D4AF37] transition-colors">
                    <div className="text-sm text-[#B87333] font-bold tracking-widest uppercase flex items-center gap-2 group-hover:text-[#D4AF37] transition-colors">
                      <Wrench className="w-4 h-4" />
                      GEAR_{String(i + 1).padStart(2, '0')}
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-bold text-[#E8D090] group-hover:text-[#FFF8E7] transition-colors duration-300 leading-tight">
                    {chapter.title}
                  </h2>
                  
                  {/* Metadata / Engravings */}
                  <div className="mt-auto flex flex-wrap gap-2 text-xs font-bold tracking-widest uppercase">
                    <span className="px-2 py-1 bg-[#1A1208] text-[#B87333] border border-[#5C4B33] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
                      {chapter.typesCount} PARTS
                    </span>
                    {chapter.stats.quizzes > 0 && (
                      <span className="px-2 py-1 bg-[#1A1208] text-[#D4AF37] border border-[#5C4B33] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
                        {chapter.stats.quizzes} TESTS
                      </span>
                    )}
                    {chapter.stats.questions > 0 && (
                      <span className="px-2 py-1 bg-[#1A1208] text-[#FCEABB] border border-[#5C4B33] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
                        {chapter.stats.questions} SPECS
                      </span>
                    )}
                  </div>

                </SteampunkCard>
              </Link>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </div>
  );
}
