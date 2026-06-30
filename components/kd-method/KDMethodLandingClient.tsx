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

const categories = [
  {
    href: '/kd-method/english-100-concepts',
    title: 'English 100 Concepts',
    description: 'Master the top 100 English grammar rules and concepts with our proven KD Method. Includes notes and targeted quizzes.',
    icon: BookOpen,
    color: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-500 dark:text-blue-400',
    hoverBorder: 'hover:border-blue-500/50 dark:hover:border-blue-500/50',
    hoverText: 'group-hover:text-blue-500 dark:group-hover:text-blue-400',
  },
  {
    href: '/kd-method/maths-trickfunda',
    title: 'Maths TrickFunda',
    description: 'Master essential mathematics concepts, chapter by chapter, with bilingual quizzes and interactive notes.',
    icon: Calculator,
    color: 'from-emerald-500/20 to-teal-500/20',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    hoverBorder: 'hover:border-emerald-500/50 dark:hover:border-emerald-500/50',
    hoverText: 'group-hover:text-emerald-500 dark:group-hover:text-emerald-400',
  },
  {
    href: '/kd-method/gs-trickfunda',
    title: 'GS TrickFunda',
    description: 'Master General Studies with tricks and mnemonics, structured by history, geography, and more.',
    icon: Globe,
    color: 'from-amber-500/20 to-orange-500/20',
    iconColor: 'text-amber-500 dark:text-amber-400',
    hoverBorder: 'hover:border-amber-500/50 dark:hover:border-amber-500/50',
    hoverText: 'group-hover:text-amber-500 dark:group-hover:text-amber-400',
  },
  {
    href: '/kd-method/reasoning-trickfunda',
    title: 'Reasoning TrickFunda',
    description: 'Solve logical puzzles in seconds with proven methods and daily practice quizzes.',
    icon: Brain,
    color: 'from-purple-500/20 to-pink-500/20',
    iconColor: 'text-purple-500 dark:text-purple-400',
    hoverBorder: 'hover:border-purple-500/50 dark:hover:border-purple-500/50',
    hoverText: 'group-hover:text-purple-500 dark:group-hover:text-purple-400',
  },
  {
    href: '/kd-method/vocab-trickfunda',
    title: 'Vocab TrickFunda',
    description: 'Memorize thousands of words effortlessly using visual cues, root words, and association tricks.',
    icon: SpellCheck,
    color: 'from-rose-500/20 to-red-500/20',
    iconColor: 'text-rose-500 dark:text-rose-400',
    hoverBorder: 'hover:border-rose-500/50 dark:hover:border-rose-500/50',
    hoverText: 'group-hover:text-rose-500 dark:group-hover:text-rose-400',
  },
];

export default function KDMethodLandingClient() {
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
          {categories.map((cat, index) => {
            const Icon = cat.icon;
            return (
              <motion.div key={cat.href} variants={itemVariants} className={index === 0 ? "md:col-span-2 lg:col-span-2" : ""}>
                <Link 
                  href={cat.href}
                  className={`group relative flex flex-col h-full p-8 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${cat.hoverBorder}`}
                >
                  {/* Subtle hover gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                  
                  <div className="relative z-10 flex flex-col h-full space-y-6">
                    <div className="flex items-start justify-between">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gray-50 dark:bg-gray-800 group-hover:scale-110 transition-transform duration-500 shadow-sm border border-gray-100 dark:border-gray-700`}>
                        <Icon className={`w-7 h-7 ${cat.iconColor}`} />
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                        <ArrowRight className={`w-5 h-5 ${cat.iconColor}`} />
                      </div>
                    </div>
                    
                    <div>
                      <h2 className={`text-2xl font-bold mb-3 transition-colors duration-300 ${cat.hoverText}`}>
                        {cat.title}
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                        {cat.description}
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
