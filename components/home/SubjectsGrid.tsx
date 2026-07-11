'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { brandMap, type BrandKey } from '@/lib/brand'
import type { Subject } from '@/lib/types'

interface SubjectsGridProps {
  subjects: Subject[]
}

export default function SubjectsGrid({ subjects }: SubjectsGridProps) {
  return (
    <section id="subjects" className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(139,92,246,0.1),transparent_50%)]" />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
            📖 Explore Subjects
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">Choose from our comprehensive collection</p>
        </motion.div>

        <div className="relative mb-12">
          {/* Horizontal scrollable container */}
          <div className="flex gap-8 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {subjects.slice(0, 6).map((subject, idx) => {
            const brand = brandMap[subject.brandColor as BrandKey] || brandMap.emerald
            
            return (
              <motion.div
                key={subject.slug}
                initial={{ opacity: 0, y: 50, rotateX: -20 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.6, 
                  delay: idx * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
              >
                <Link href={`/study-material/${subject.slug}`}>
                  <motion.div
                    className="group relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-10 rounded-3xl border border-white/20 shadow-xl overflow-hidden min-w-[350px] snap-center"
                    whileHover={{ 
                      scale: 1.05,
                      y: -10,
                      rotateY: 5,
                      transition: { duration: 0.3 }
                    }}
                    whileTap={{ scale: 0.98 }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Animated gradient background */}
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        background: `radial-gradient(circle at 50% 50%, ${brand.bg.replace('bg-', 'rgba(')}20, transparent 70%)`
                      }}
                    />

                    {/* Glowing border effect */}
                    <motion.div
                      className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100"
                      style={{
                        boxShadow: `0 0 30px ${brand.text.replace('text-', 'rgba(')}30`,
                      }}
                      animate={{
                        boxShadow: [
                          `0 0 20px ${brand.text.replace('text-', 'rgba(')}20`,
                          `0 0 40px ${brand.text.replace('text-', 'rgba(')}40`,
                          `0 0 20px ${brand.text.replace('text-', 'rgba(')}20`,
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />

                    <div className="relative" style={{ transform: 'translateZ(40px)' }}>
                      <motion.div 
                        className="text-7xl mb-6"
                        whileHover={{ 
                          rotate: [0, -10, 10, -10, 0],
                          scale: [1, 1.2, 1.2, 1.2, 1],
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        {subject.emoji}
                      </motion.div>

                      <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r transition-all"
                        style={{
                          backgroundImage: `linear-gradient(135deg, ${brand.text.replace('text-', '')}, ${brand.bg.replace('bg-', '')})`
                        }}
                      >
                        {subject.title}
                      </h3>

                      <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-2">
                        {subject.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <motion.span 
                          className={`px-5 py-2 rounded-full ${brand.bg} ${brand.text} font-bold shadow-lg`}
                          whileHover={{ scale: 1.1 }}
                        >
                          {subject.topics.length} Topics
                        </motion.span>
                        
                        <motion.span 
                          className="text-pink-600 dark:text-pink-400 font-black flex items-center gap-2"
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          Start →
                        </motion.span>
                      </div>
                    </div>

                    {/* Shine effect */}
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                      }}
                      animate={{
                        x: ['-100%', '200%'],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 2,
                      }}
                    />
                  </motion.div>
                </Link>
              </motion.div>
            )
          })}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link href="/study-material">
            <motion.button
              className="px-12 py-6 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 text-white rounded-2xl font-black text-xl shadow-2xl relative overflow-hidden"
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 20px 60px rgba(236, 72, 153, 0.5)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute inset-0 bg-white"
                initial={{ x: '-100%', opacity: 0.3 }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
              <span className="relative z-10">Show All {subjects.length} Subjects →</span>
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
