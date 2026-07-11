'use client'

import { motion } from 'framer-motion'
import { KDStats } from '@/types/studyMaterial'
import { BookOpen, Video, FileText, HelpCircle, FileQuestion } from 'lucide-react'
import { getSubjectTheme } from '@/utils/themeMapping'
import AnimatedCounter from '@/components/shared/AnimatedCounter'

interface StatsBannerProps {
  stats: KDStats
  subjectSlug?: string
  label?: string
}

export default function StatsBanner({ stats, subjectSlug = 'default', label = 'Total Content' }: StatsBannerProps) {
  const theme = getSubjectTheme(subjectSlug)
  
  const statItems = [
    { label: 'Concepts', value: stats.concepts, icon: <BookOpen className="w-5 h-5" /> },
    { label: 'Videos', value: stats.videos, icon: <Video className="w-5 h-5" /> },
    { label: 'Quizzes', value: stats.quizzes, icon: <FileQuestion className="w-5 h-5" /> },
    { label: 'Questions', value: stats.questions, icon: <HelpCircle className="w-5 h-5" /> },
    { label: 'PDFs', value: stats.pdfs, icon: <FileText className="w-5 h-5" /> },
  ].filter(s => s.value > 0) // only show non-zero stats

  if (statItems.length === 0) return null

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`w-full py-4 px-6 rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-800/50 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 mb-8`}
    >
      <div className={`text-sm font-bold uppercase tracking-wider ${theme.primary}`}>
        {label}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
        {statItems.map((stat, i) => (
          <div key={stat.label} className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-800 ${theme.primary}`}>
              {stat.icon}
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900 dark:text-gray-100 leading-none flex items-center">
                <AnimatedCounter end={stat.value} duration={1.5} />
              </div>
              <div className="text-xs text-gray-500 font-medium">
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
