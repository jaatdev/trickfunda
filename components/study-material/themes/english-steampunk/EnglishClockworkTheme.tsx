'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { BookMarked, Key } from 'lucide-react';

import { ClockworkBackground } from './ClockworkBackground';
import { ClockworkFolderCard } from './ClockworkFolderCard';
import { ClockworkViewerWrapper } from './ClockworkViewerWrapper';
import StatsBanner from '@/components/study-material/StatsBanner';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

type Props = {
  node: any; // Using any for simplicity since KDNode type is complex and we're passing it from page
  path: string[];
  subjectTitle: string;
  subjectSlug: string;
};

export function EnglishClockworkTheme({ node, path, subjectTitle, subjectSlug }: Props) {
  return (
    <div className="min-h-screen bg-[#140F0A] text-[#FFF8E7] pt-24 pb-12 px-4 md:pt-32 md:pb-16 md:px-8 relative overflow-hidden selection:bg-[#B87333]/30 font-serif">
      
      {/* Clockwork Codex Background */}
      <ClockworkBackground />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Brass Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#A37B15] mb-8 border-b border-[#5C4B33] pb-4">
          <Link href="/study-material" className="hover:text-[#D4AF37] transition-colors whitespace-nowrap">Archives</Link>
          <span className="text-[#5C4B33]">/</span>
          <Link href={`/study-material/${subjectSlug}`} className="hover:text-[#D4AF37] transition-colors whitespace-nowrap">{subjectTitle}</Link>
          {path.map((segment, index) => {
            const isLast = index === path.length - 1;
            const title = segment.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            
            if (isLast) {
              return (
                <span key={index} className="flex items-center gap-x-2">
                  <span className="text-[#5C4B33]">/</span>
                  <span className="text-[#FCEABB] drop-shadow-[0_0_5px_rgba(212,175,55,0.4)]">{title}</span>
                </span>
              );
            }
            
            const href = `/study-material/${subjectSlug}/${path.slice(0, index + 1).join('/')}`;
            return (
              <span key={index} className="flex items-center gap-x-2">
                <span className="text-[#5C4B33]">/</span>
                <Link href={href} className="hover:text-[#D4AF37] transition-colors whitespace-nowrap">{title}</Link>
              </span>
            );
          })}
        </div>

        {/* Stats Banner overridden by CSS */}
        <div className="[&_.bg-white]:bg-[#1A1208]/80 [&_.text-gray-900]:text-[#E8D090] [&_.text-gray-500]:text-[#B87333] [&_.border-gray-100]:border-[#5C4B33] mb-12 shadow-[0_4px_15px_rgba(0,0,0,0.8)]">
          <StatsBanner stats={node.stats} subjectSlug={subjectSlug} label={`Codex: ${node.title}`} />
        </div>

        <header className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="flex justify-center mb-4"
          >
            <BookMarked className="w-12 h-12 text-[#B87333] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FCEABB] via-[#D4AF37] to-[#B87333] tracking-tight drop-shadow-lg"
          >
            {node.title}
          </motion.h1>
          {node.children && node.children.length > 0 && !node.concept && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-lg text-[#A37B15] max-w-3xl mx-auto mt-4 italic"
            >
              Unlock the inner mechanisms.
            </motion.p>
          )}
        </header>

        {/* Sub-directories (Folders) */}
        {node.children && node.children.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-[220px] mb-12"
          >
            {node.children.map((child: any, i: number) => {
              const href = `/study-material/${subjectSlug}/${path.join('/')}/${child.slug}`;
              return (
                <motion.div key={child.slug} variants={itemVariants} className="h-full">
                  <Link href={href} className="block h-full outline-none group">
                    <ClockworkFolderCard>
                      
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-2xl font-serif text-[#5C4B33] group-hover:text-[#B87333] transition-colors duration-500 italic">
                          Tome {i + 1}
                        </span>
                        <Key className="w-6 h-6 text-[#5C4B33] group-hover:text-[#D4AF37] transition-colors duration-500" />
                      </div>

                      <h2 className="text-2xl font-bold text-[#E8D090] group-hover:text-[#FFF8E7] transition-colors duration-500 mt-auto leading-tight">
                        {child.title}
                      </h2>
                      
                      <div className="mt-4 pt-4 border-t border-[#3A2A18] group-hover:border-[#5C4B33] transition-colors duration-500 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[#A37B15]">
                        {child.stats.concepts > 0 && (
                          <span>{child.stats.concepts} Pages</span>
                        )}
                        {child.stats.quizzes > 0 && (
                          <span>{child.stats.quizzes} Trials</span>
                        )}
                      </div>

                    </ClockworkFolderCard>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* The Final Concept Data Viewer */}
        {node.concept && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <ClockworkViewerWrapper concept={node.concept} />
          </motion.div>
        )}

      </div>
    </div>
  );
}
