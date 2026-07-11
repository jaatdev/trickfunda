'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import AnimatedCounter from '@/components/shared/AnimatedCounter'

export default function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: '20%', left: '10%' }}
        />
        <motion.div 
          className="absolute w-96 h-96 bg-fuchsia-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: '40%', right: '10%' }}
        />
        <motion.div 
          className="absolute w-96 h-96 bg-violet-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70"
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          style={{ bottom: '-10%', left: '50%' }}
        />
      </div>

      {/* Parallax effect */}
      <motion.div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"
        style={{
          x: mousePosition.x / 50,
          y: mousePosition.y / 50,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 text-center text-white pt-32 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-block px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8 shadow-2xl"
        >
          <span className="text-sm font-bold">🚀 World's Most Advanced Learning Platform</span>
        </motion.div>

        <motion.h1 
          className="text-7xl md:text-9xl font-black mb-6 leading-tight drop-shadow-2xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.span
            className="inline-block"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 5, repeat: Infinity }}
            style={{
              backgroundImage: 'linear-gradient(90deg, #fff, #ffd700, #fff)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Ace Your
          </motion.span>
          <br/>
          <motion.span
            className="inline-block"
            animate={{ 
              rotate: [0, 2, -2, 0],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Dream Exam
          </motion.span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full max-w-3xl mx-auto mb-8 rounded-3xl overflow-hidden shadow-2xl border border-white/20"
        >
          {/* BANNER IMAGE ADDED HERE */}
          <img src="/banner.jpg" alt="TrickFunda Banner" className="w-full h-auto object-contain bg-black/40 backdrop-blur-sm" />
        </motion.div>

        <motion.p 
          className="text-xl md:text-2xl mb-12 opacity-95 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          AI-powered notes • Smart flashcards • Adaptive quizzes • Spaced repetition
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <motion.a 
            href="/study-material" 
            className="group px-12 py-6 bg-white text-violet-600 rounded-2xl font-black text-xl shadow-2xl relative overflow-hidden"
            whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(236, 72, 153, 0.5)' }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-pink-500 to-violet-500 opacity-0 group-hover:opacity-10"
              initial={false}
            />
            <span className="relative z-10">Start Learning Free →</span>
            <span className="block text-xs font-normal mt-1 opacity-70">No credit card required</span>
          </motion.a>
          
          <motion.a 
            href="#features" 
            className="px-12 py-6 bg-white/10 backdrop-blur-md text-white rounded-2xl font-black text-xl border-2 border-white/30 shadow-2xl"
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            whileTap={{ scale: 0.95 }}
          >
            See Features ✨
          </motion.a>
        </motion.div>

        <motion.div 
          className="flex flex-wrap justify-center gap-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {[
            { icon: '⭐', value: '10k+', label: 'Students' },
            { icon: '🎯', value: '95%', label: 'Success Rate' },
            { icon: '🏆', value: '50+', label: 'Exams Covered' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + i * 0.1 }}
              whileHover={{ scale: 1.1, y: -5 }}
            >
              <motion.div 
                className="text-5xl font-black mb-2"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
              >
                {stat.icon}
              </motion.div>
              <div className="text-2xl font-bold">
                <AnimatedCounter 
                  end={parseInt(stat.value.replace(/[^0-9]/g, ''))} 
                  suffix={stat.value.includes('+') ? '+' : stat.value.includes('%') ? '%' : ''}
                  duration={2}
                />
              </div>
              <div className="text-sm opacity-80">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <motion.div
            className="w-1.5 h-1.5 bg-white rounded-full mt-2"
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  )
}
