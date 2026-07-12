'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function CTASection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.1),transparent_50%)]" />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-16 shadow-2xl overflow-hidden"
        >
          {/* Animated background pattern */}
          {mounted && (
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-32 h-32 bg-white/5 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.1, 0.3, 0.1],
                    x: [0, Math.random() * 50 - 25, 0],
                    y: [0, Math.random() * 50 - 25, 0],
                  }}
                  transition={{
                    duration: 5 + Math.random() * 5,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>
          )}

          <div className="relative z-10">
            <motion.h3 
              className="text-5xl md:text-6xl font-black mb-12 text-center text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              🚀 Ready to Ace Your Exam?
            </motion.h3>

            <div className="grid md:grid-cols-3 gap-12 mb-12">
              {[
                { icon: '📚', title: 'Comprehensive Notes', desc: 'Structured learning paths' },
                { icon: '🎯', title: 'Smart Practice', desc: 'Adaptive quizzes & flashcards' },
                { icon: '⚡', title: 'Track Progress', desc: 'Real-time analytics' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="text-center text-white"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.1, y: -5 }}
                >
                  <motion.div 
                    className="w-24 h-24 mx-auto mb-6 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center text-5xl border border-white/20"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    {item.icon}
                  </motion.div>
                  <h4 className="text-2xl font-black mb-4">{item.title}</h4>
                  <p className="opacity-90 text-lg">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <motion.a
                href="#subjects"
                className="inline-block px-16 py-6 bg-white text-purple-600 rounded-2xl font-black text-2xl shadow-2xl relative overflow-hidden group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-pink-500 to-violet-500 opacity-0 group-hover:opacity-10"
                  initial={false}
                />
                <span className="relative z-10">Start Learning Now - It's Free! 🎉</span>
              </motion.a>
              <p className="mt-4 text-white/80 text-sm">
                Join 10,000+ students • No credit card required • Cancel anytime
              </p>
            </motion.div>
          </div>

          {/* Floating particles */}
          {mounted && (
            <>
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </>
          )}
        </motion.div>
      </div>
    </section>
  )
}
