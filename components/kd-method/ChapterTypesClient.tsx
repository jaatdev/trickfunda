'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { getSubjectTheme } from '@/utils/themeMapping';
import { ChevronRight } from 'lucide-react';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

type Type = {
  title: string;
  slug: string;
  youtubeUrls?: string[];
  pdfUrl?: string;
  noteBoxes?: any[];
  notesMarkdown?: string;
  quizzes?: any[];
};

type Props = {
  subjectSlug: string;
  chapterSlug: string;
  types: Type[];
};

export default function ChapterTypesClient({ subjectSlug, chapterSlug, types }: Props) {
  const theme = getSubjectTheme(subjectSlug);

  if (types.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        No types found for this chapter yet. Add folders inside data/kd-method/{subjectSlug}/{chapterSlug}/
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
      {types.map((type, i) => (
        <motion.div key={type.slug} variants={itemVariants}>
          <Link 
            href={`/kd-method/${subjectSlug}/${chapterSlug}/${type.slug}`}
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
              {type.title}
            </h2>
            
            <div className="flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium relative z-10 mt-auto pt-4">
              {type.youtubeUrls && type.youtubeUrls.length > 0 && <span className={`px-2 py-1 rounded-md ${theme.bgLight} ${theme.iconColor}`}>📺 {type.youtubeUrls.length} Video{type.youtubeUrls.length !== 1 ? 's' : ''}</span>}
              {type.pdfUrl && <span className={`px-2 py-1 rounded-md ${theme.bgLight} ${theme.iconColor}`}>📄 PDF Notes</span>}
              {!type.pdfUrl && type.noteBoxes && type.noteBoxes.length > 0 && <span className={`px-2 py-1 rounded-md ${theme.bgLight} ${theme.iconColor}`}>📦 Noteboxes</span>}
              {!type.pdfUrl && (!type.noteBoxes || type.noteBoxes.length === 0) && type.notesMarkdown && <span className={`px-2 py-1 rounded-md ${theme.bgLight} ${theme.iconColor}`}>📝 Notes</span>}
              {type.quizzes && type.quizzes.length > 0 && (
                <span className={`px-2 py-1 rounded-md ${theme.bgLight} ${theme.iconColor}`}>🎯 {type.quizzes.reduce((acc, q) => acc + q.questions.length, 0)} Question{type.quizzes.reduce((acc, q) => acc + q.questions.length, 0) !== 1 ? 's' : ''} {type.quizzes.length > 1 ? `(${type.quizzes.length} Quizzes)` : ''}</span>
              )}
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
