'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { DraftingCompass, Layers } from 'lucide-react';

import { ConstructorBackground } from './ConstructorBackground';
import { ConstructorFolderCard } from './ConstructorFolderCard';
import { ConstructorViewerWrapper } from './ConstructorViewerWrapper';
import FolderContentSwitcher from '@/components/study-material/FolderContentSwitcher';
import StatsBanner from '@/components/study-material/StatsBanner';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};

type Props = {
  node: any; // Using any for simplicity since KDNode type is complex and we're passing it from page
  path: string[];
  subjectTitle: string;
  subjectSlug: string;
};

export function MathConstructorTheme({ node, path, subjectTitle, subjectSlug }: Props) {
  return (
    <div className="min-h-screen bg-[#0A1128] text-sky-50 pt-24 pb-12 px-4 md:pt-32 md:pb-16 md:px-8 relative overflow-hidden selection:bg-sky-500/30 font-mono">
      
      {/* Geometric Constructor Background */}
      <ConstructorBackground />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Drafting Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-sky-600 mb-8 border-b border-sky-900/50 pb-4">
          <Link href="/study-material" className="hover:text-sky-400 transition-colors whitespace-nowrap">ROOT</Link>
          <span className="text-sky-800">/</span>
          <Link href={`/study-material/${subjectSlug}`} className="hover:text-sky-400 transition-colors whitespace-nowrap uppercase">{subjectTitle}</Link>
          {path.map((segment, index) => {
            const isLast = index === path.length - 1;
            const title = segment.toUpperCase();
            
            if (isLast) {
              return (
                <span key={index} className="flex items-center gap-x-2">
                  <span className="text-sky-800">/</span>
                  <span className="text-sky-300 font-bold tracking-widest">{title}</span>
                </span>
              );
            }
            
            const href = `/study-material/${subjectSlug}/${path.slice(0, index + 1).join('/')}`;
            return (
              <span key={index} className="flex items-center gap-x-2">
                <span className="text-sky-800">/</span>
                <Link href={href} className="hover:text-sky-400 transition-colors whitespace-nowrap tracking-widest">{title}</Link>
              </span>
            );
          })}
        </div>

        {/* Stats Banner overridden by CSS */}
        <div className="[&_.bg-white]:bg-[#0A1128]/80 [&_.text-gray-900]:text-sky-200 [&_.text-gray-500]:text-sky-500 [&_.border-gray-100]:border-sky-900/50 mb-12 backdrop-blur-sm border border-sky-900/50">
          <StatsBanner stats={node.stats} subjectSlug={subjectSlug} label={`ARCH_${node.slug.toUpperCase()}`} />
        </div>

        <header className="mb-12 text-center uppercase tracking-widest">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="flex justify-center mb-4"
          >
            <DraftingCompass className="w-12 h-12 text-sky-400" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl md:text-5xl font-black text-sky-300 tracking-[0.2em]"
          >
            {node.title}
          </motion.h1>
          {node.children && node.children.length > 0 && !node.concept && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-sm text-sky-500 max-w-3xl mx-auto mt-4"
            >
              SELECT SUB-STRUCTURE FOR ASSEMBLY
            </motion.p>
          )}
        </header>

        <FolderContentSwitcher 
          node={node}
          subjectSlug={subjectSlug}
          baseRoute={`/study-material/${subjectSlug}/${path.join('/')}`}
          renderFolders={() => (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-[220px] mb-12"
            >
              {node.children!.map((child: any, i: number) => {
                const href = `/study-material/${subjectSlug}/${path.join('/')}/${child.slug}`;
                return (
                  <motion.div key={child.slug} variants={itemVariants} className="h-full">
                    <Link href={href} className="block h-full outline-none group">
                      <ConstructorFolderCard>
                        
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-xl font-bold text-sky-700 group-hover:text-sky-400 transition-colors duration-300">
                            SEQ_{String(i + 1).padStart(2, '0')}
                          </span>
                          <Layers className="w-6 h-6 text-sky-800 group-hover:text-sky-400 transition-colors duration-300" />
                        </div>

                        <h2 className="text-xl font-bold text-sky-200 group-hover:text-white transition-colors duration-300 mt-auto uppercase tracking-widest">
                          {child.title}
                        </h2>
                        
                        <div className="mt-4 pt-4 border-t border-sky-900/50 group-hover:border-sky-500/50 transition-colors duration-300 flex flex-wrap gap-x-4 gap-y-2 text-xs font-bold text-sky-600 uppercase">
                          {child.stats.concepts > 0 && (
                            <span>C:{child.stats.concepts}</span>
                          )}
                          {child.stats.quizzes > 0 && (
                            <span>Q:{child.stats.quizzes}</span>
                          )}
                        </div>

                      </ConstructorFolderCard>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
          renderConcept={(activeFilter) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto"
            >
              <ConstructorViewerWrapper concept={node.concept!} activeFilter={activeFilter} />
            </motion.div>
          )}
        />

      </div>
    </div>
  );
}
