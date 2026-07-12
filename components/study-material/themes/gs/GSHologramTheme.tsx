'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { Database, FolderTree } from 'lucide-react';

import { HologramBackground } from './HologramBackground';
import { HologramFolderCard } from './HologramFolderCard';
import { HologramViewerWrapper } from './HologramViewerWrapper';
import StatsBanner from '@/components/study-material/StatsBanner';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

type Props = {
  node: any; // Using any for simplicity since KDNode type is complex and we're passing it from page
  path: string[];
  subjectTitle: string;
  subjectSlug: string;
};

export function GSHologramTheme({ node, path, subjectTitle, subjectSlug }: Props) {
  return (
    <div className="min-h-screen bg-[#001010] text-cyan-50 pt-24 pb-12 px-4 md:pt-32 md:pb-16 md:px-8 relative overflow-hidden selection:bg-cyan-500/30 font-mono">
      
      {/* Ancient Hologram Background */}
      <HologramBackground />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Hologram Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-cyan-600/80 mb-8 border-b border-cyan-900/50 pb-4">
          <Link href="/study-material" className="hover:text-cyan-400 transition-colors whitespace-nowrap drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">Study Material</Link>
          <span className="text-cyan-800">&gt;</span>
          <Link href={`/study-material/${subjectSlug}`} className="hover:text-cyan-400 transition-colors whitespace-nowrap drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">{subjectTitle}</Link>
          {path.map((segment, index) => {
            const isLast = index === path.length - 1;
            const title = segment.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            
            if (isLast) {
              return (
                <span key={index} className="flex items-center gap-x-2">
                  <span className="text-cyan-800">&gt;</span>
                  <span className="text-cyan-300 truncate max-w-[200px] sm:max-w-none drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">{title}</span>
                </span>
              );
            }
            
            const href = `/study-material/${subjectSlug}/${path.slice(0, index + 1).join('/')}`;
            return (
              <span key={index} className="flex items-center gap-x-2">
                <span className="text-cyan-800">&gt;</span>
                <Link href={href} className="hover:text-cyan-400 transition-colors whitespace-nowrap drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">{title}</Link>
              </span>
            );
          })}
        </div>

        {/* Stats Banner overridden by CSS */}
        <div className="[&_.bg-white]:bg-cyan-950/20 [&_.text-gray-900]:text-cyan-100 [&_.text-gray-500]:text-cyan-500 [&_.border-gray-100]:border-cyan-900/50 mb-12">
          <StatsBanner stats={node.stats} subjectSlug={subjectSlug} label={`${node.title} Data`} />
        </div>

        <header className="mb-12 border-l-4 border-cyan-500 pl-6 py-2">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-100 to-cyan-500 tracking-tight drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] uppercase"
          >
            {node.title}
          </motion.h1>
          {node.children && node.children.length > 0 && !node.concept && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-cyan-600 max-w-3xl mt-2 flex items-center gap-2"
            >
              <Database className="w-4 h-4" /> Accessing sub-directories...
            </motion.p>
          )}
        </header>

        {/* Sub-directories (Folders) */}
        {node.children && node.children.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[200px] mb-12"
          >
            {node.children.map((child: any, i: number) => {
              const href = `/study-material/${subjectSlug}/${path.join('/')}/${child.slug}`;
              return (
                <motion.div key={child.slug} variants={itemVariants} className="h-full">
                  <Link href={href} className="block h-full outline-none group">
                    <HologramFolderCard>
                      
                      <div className="flex items-center gap-3 mb-6">
                        <FolderTree className="w-5 h-5 text-cyan-500" />
                        <span className="text-xs text-cyan-600 tracking-widest uppercase">DIR_{String(i + 1).padStart(3, '0')}</span>
                      </div>

                      <h2 className="text-2xl font-bold text-cyan-100 group-hover:text-white transition-colors duration-300 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
                        {child.title}
                      </h2>
                      
                      <div className="mt-auto flex flex-wrap gap-2 text-xs">
                        {child.stats.concepts > 0 && (
                          <span className="px-2 py-1 bg-cyan-900/40 text-cyan-300 border border-cyan-800/50">
                            {child.stats.concepts} Concepts
                          </span>
                        )}
                        {child.stats.quizzes > 0 && (
                          <span className="px-2 py-1 bg-emerald-900/30 text-emerald-300 border border-emerald-800/50">
                            {child.stats.quizzes} Quizzes
                          </span>
                        )}
                        {child.stats.questions > 0 && (
                          <span className="px-2 py-1 bg-blue-900/30 text-blue-300 border border-blue-800/50">
                            {child.stats.questions} Q's
                          </span>
                        )}
                        {child.stats.flashcards > 0 && (
                          <span className="px-2 py-1 bg-fuchsia-900/30 text-fuchsia-300 border border-fuchsia-800/50">
                            {child.stats.flashcards} Cards
                          </span>
                        )}
                      </div>

                    </HologramFolderCard>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* The Final Concept Data Viewer */}
        {node.concept && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto"
          >
            <HologramViewerWrapper concept={node.concept} />
          </motion.div>
        )}

      </div>
    </div>
  );
}
