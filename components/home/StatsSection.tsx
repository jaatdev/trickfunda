'use client'

import { motion } from 'framer-motion'
import AnimatedCounter from '@/components/shared/AnimatedCounter'

interface StatsSectionProps {
  subjects: number
  concepts: number
  videos: number
  quizzes: number
  questions: number
  flashcards: number
}

export default function StatsSection({ subjects, concepts, videos, quizzes, questions, flashcards }: StatsSectionProps) {
  const stats = [
    { value: subjects, label: 'Subjects', gradient: 'from-indigo-600 to-indigo-400', icon: '📚' },
    { value: concepts, label: 'Concepts & Types', gradient: 'from-emerald-600 to-emerald-400', icon: '📖' },
    { value: questions, label: 'Quiz Questions', gradient: 'from-amber-600 to-amber-400', icon: '❓' },
    { value: flashcards, label: 'Flashcards', gradient: 'from-fuchsia-600 to-fuchsia-400', icon: '🃏' },
    { value: videos, label: 'Video Lessons', gradient: 'from-pink-600 to-pink-400', icon: '🎥' },
  ]

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.1),transparent_50%)]" />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent px-2">
            By The Numbers
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">Real results from real students</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 justify-center">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.5, rotateY: -90 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.6, 
                delay: idx * 0.1,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                scale: 1.05, 
                y: -10,
                rotateY: 5,
                transition: { duration: 0.3 }
              }}
              className="group relative bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl border border-white/20 shadow-xl hover:shadow-2xl transition-all"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 rounded-2xl md:rounded-3xl transition-opacity"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${stat.gradient.includes('indigo') ? 'rgba(99, 102, 241, 0.2)' : stat.gradient.includes('emerald') ? 'rgba(16, 185, 129, 0.2)' : stat.gradient.includes('amber') ? 'rgba(245, 158, 11, 0.2)' : stat.gradient.includes('fuchsia') ? 'rgba(217, 70, 239, 0.2)' : 'rgba(236, 72, 153, 0.2)'}, transparent)`
                }}
              />
              
              <div className="relative flex flex-col items-center text-center" style={{ transform: 'translateZ(20px)' }}>
                <motion.div 
                  className="text-3xl md:text-5xl mb-2 md:mb-4"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    delay: idx * 0.2
                  }}
                >
                  {stat.icon}
                </motion.div>
                
                <div className={`text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent mb-1 md:mb-2`}>
                  <AnimatedCounter end={stat.value} duration={2.5} />
                </div>
                
                <div className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 leading-tight">{stat.label}</div>
              </div>

              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                }}
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
