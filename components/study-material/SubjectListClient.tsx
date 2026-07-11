'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { getSubjectTheme } from '@/utils/themeMapping';
import { ChevronRight } from 'lucide-react';
import { KDStats } from '@/types/studyMaterial';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
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
};

export default function SubjectListClient({ subjectSlug, chapters }: Props) {
  const theme = getSubjectTheme(subjectSlug);

  if (chapters.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        No chapters found for this subject yet. Add folders inside data/study-material/{subjectSlug}/
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {chapters.map((chapter, i) => (
        <motion.div key={chapter.slug} variants={itemVariants}>
          <Link 
            href={`/study-material/${subjectSlug}/${chapter.slug}`}
            className={`group relative flex flex-col h-full p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${theme.hoverBorder}`}
          >
            {/* Subtle hover gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none`} />
            
            {/* Decorative corner */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${theme.gradient} rounded-bl-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-110 opacity-50`}></div>
            
            <div className="flex items-start justify-between mb-6 relative z-10">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl ${theme.bgLight} ${theme.iconColor}`}>
                {i + 1}
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                <ChevronRight className={`w-5 h-5 ${theme.iconColor}`} />
              </div>
            </div>

            <h2 className={`text-2xl font-bold text-gray-900 dark:text-white mb-3 transition-colors duration-300 relative z-10 ${theme.hoverText}`}>
              {chapter.title}
            </h2>
            
            <div className="flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium relative z-10 mt-auto pt-4">
              <span className={`px-3 py-1 rounded-full ${theme.bgLight} ${theme.iconColor}`}>
                {chapter.typesCount} Type{chapter.typesCount !== 1 ? 's' : ''}
              </span>
              {chapter.stats.videos > 0 && (
                <span className="px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                  {chapter.stats.videos} Videos
                </span>
              )}
              {chapter.stats.quizzes > 0 && (
                <span className="px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                  {chapter.stats.quizzes} Quizzes
                </span>
              )}
              {chapter.stats.questions > 0 && (
                <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                  {chapter.stats.questions} Q's
                </span>
              )}
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
