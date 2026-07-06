'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { BookOpen, Calculator, Globe, Brain, SpellCheck, ArrowRight } from 'lucide-react';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export type Category = {
  href: string;
  title: string;
  description: string;
  iconName: string; // passing icon as string to avoid passing full React component over network boundary
  color: string;
  iconColor: string;
  hoverBorder: string;
  hoverText: string;
};

// We import all potentially needed icons
import * as LucideIcons from 'lucide-react';

export default function KDMethodLandingClient({ categories }: { categories: Category[] }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pt-24 pb-12 px-4 md:pt-32 md:pb-16 md:px-8 relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-12 relative z-10">
        <header className="space-y-6 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <h1 className="text-5xl md:text-7xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-cyan-500 pb-2">
              KD Method
            </h1>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto md:mx-0"
          >
            A new way to quickly master concepts through notes and interactive quizzes.
          </motion.p>
        </header>

        <motion.section 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {categories.map((category) => {
              const Icon = (LucideIcons as any)[category.iconName] || LucideIcons.BookOpen;
              return (
                <motion.div key={category.href} variants={itemVariants}>
                  <Link href={category.href} className="group block h-full">
                    <div className={`h-full relative bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-800 ${category.hoverBorder} overflow-hidden flex flex-col`}>
                      
                      {/* Background Gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                      
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                          <div className={`p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 ${category.iconColor} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                            <Icon className="w-8 h-8" strokeWidth={1.5} />
                          </div>
                          <ArrowRight className={`w-6 h-6 text-gray-400 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ${category.hoverText}`} />
                        </div>
                        
                        <h3 className={`text-2xl font-bold text-gray-900 dark:text-white mb-4 ${category.hoverText} transition-colors duration-300`}>
                          {category.title}
                        </h3>
                        
                        <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed flex-grow">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
        </motion.section>
      </div>
    </div>
  );
}
