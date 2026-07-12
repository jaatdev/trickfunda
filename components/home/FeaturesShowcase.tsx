'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

const features = [
  {
    icon: '🎯',
    title: 'Spaced Repetition',
    description: 'SM-2 algorithm ensures optimal retention and long-term memory',
    color: 'from-violet-500 to-purple-500',
    stats: '95% retention rate'
  },
  {
    icon: '🏆',
    title: 'Achievement System',
    description: '10 badges tracking your learning journey and milestones',
    color: 'from-amber-500 to-orange-500',
    stats: '10+ achievements'
  },
  {
    icon: '⚡',
    title: 'Lightning Fast',
    description: 'PWA with offline support and optimized loading',
    color: 'from-cyan-500 to-blue-500',
    stats: '<2.5s load time'
  },
  {
    icon: '🎨',
    title: 'Beautiful Design',
    description: 'Dark theme optimized for reading and studying',
    color: 'from-pink-500 to-rose-500',
    stats: '100% accessible'
  },
  {
    icon: '📱',
    title: 'Mobile Ready',
    description: 'Responsive design works perfectly on all devices',
    color: 'from-emerald-500 to-teal-500',
    stats: 'All devices'
  },
  {
    icon: '🔍',
    title: 'Smart Search',
    description: 'Command palette with fuzzy search (Cmd/Ctrl+K)',
    color: 'from-indigo-500 to-blue-500',
    stats: 'Instant results'
  },
]

export default function FeaturesShowcase() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section id="features" className="py-24 bg-white dark:bg-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(236,72,153,0.1),transparent_50%)]" />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent px-2">
            ✨ Powerful Features
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 px-4">Everything you need to ace your exams</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              onHoverStart={() => setHoveredIndex(idx)}
              onHoverEnd={() => setHoveredIndex(null)}
              className="relative group"
            >
              <motion.div
                className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/20 shadow-xl overflow-hidden"
                whileHover={{ 
                  scale: 1.05,
                  rotateY: 5,
                  rotateX: 5,
                  transition: { duration: 0.3 }
                }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Gradient background on hover */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                  initial={false}
                />

                {/* Animated border */}
                <motion.div
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    background: `linear-gradient(135deg, ${feature.color.includes('violet') ? '#8b5cf6' : feature.color.includes('amber') ? '#f59e0b' : feature.color.includes('cyan') ? '#06b6d4' : feature.color.includes('pink') ? '#ec4899' : feature.color.includes('emerald') ? '#10b981' : '#6366f1'}, transparent)`,
                    padding: '2px',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                    opacity: hoveredIndex === idx ? 1 : 0,
                  }}
                  animate={{
                    opacity: hoveredIndex === idx ? [0, 1, 0] : 0,
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />

                <div className="relative" style={{ transform: 'translateZ(30px)' }}>
                  <motion.div
                    className="text-6xl mb-4"
                    animate={hoveredIndex === idx ? {
                      rotate: [0, 360],
                      scale: [1, 1.2, 1],
                    } : {}}
                    transition={{ duration: 0.6 }}
                  >
                    {feature.icon}
                  </motion.div>

                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {feature.description}
                  </p>

                  <motion.div
                    className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${feature.color} text-white font-bold text-sm`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {feature.stats}
                  </motion.div>
                </div>

                {/* Particle effect on hover */}
                {hoveredIndex === idx && (
                  <>
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-white rounded-full"
                        initial={{ 
                          x: '50%', 
                          y: '50%',
                          opacity: 1,
                          scale: 0
                        }}
                        animate={{
                          x: `${50 + (Math.random() - 0.5) * 100}%`,
                          y: `${50 + (Math.random() - 0.5) * 100}%`,
                          opacity: 0,
                          scale: 1
                        }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                      />
                    ))}
                  </>
                )}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
