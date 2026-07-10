'use client'

import { useState } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { Brain, Zap, Target, Trophy, Sparkles, Shield, Rocket, Heart, Users, Globe } from 'lucide-react'
import Link from 'next/link'

const features = [
  { icon: Brain, title: 'AI-Powered Learning', desc: 'Smart algorithms adapt to your learning style and pace', color: 'from-blue-500 to-indigo-600', stats: '95% accuracy' },
  { icon: Zap, title: 'Lightning Fast', desc: 'Instant search and navigation across all notes', color: 'from-indigo-500 to-purple-600', stats: '<100ms response' },
  { icon: Target, title: 'Spaced Repetition', desc: 'SM-2 algorithm for optimal memory retention', color: 'from-purple-500 to-pink-600', stats: '3x retention' },
  { icon: Trophy, title: 'Achievement System', desc: '10+ badges to track your learning journey', color: 'from-pink-500 to-rose-600', stats: '10+ badges' },
  { icon: Sparkles, title: 'Beautiful UI', desc: 'Stunning dark theme optimized for studying', color: 'from-rose-500 to-orange-600', stats: '100% accessible' },
  { icon: Shield, title: 'Privacy First', desc: 'Your data stays secure and private always', color: 'from-orange-500 to-amber-600', stats: 'End-to-end' },
  { icon: Rocket, title: 'PWA Support', desc: 'Install as app, works offline seamlessly', color: 'from-amber-500 to-yellow-600', stats: 'Offline ready' },
  { icon: Heart, title: 'Accessibility', desc: 'WCAG compliant with keyboard navigation', color: 'from-yellow-500 to-lime-600', stats: 'WCAG 2.1 AA' },
  { icon: Users, title: 'Community', desc: 'Join thousands of learners worldwide', color: 'from-lime-500 to-green-600', stats: '10k+ users' },
  { icon: Globe, title: 'Multi-Platform', desc: 'Works on desktop, tablet, and mobile', color: 'from-green-500 to-emerald-600', stats: 'All devices' },
]

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const [isHovered, setIsHovered] = useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-100, 100], [10, -10])
  const rotateY = useTransform(x, [-100, 100], [-10, 10])

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        x.set(e.clientX - rect.left - rect.width / 2)
        y.set(e.clientY - rect.top - rect.height / 2)
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        x.set(0)
        y.set(0)
      }}
      style={{ rotateX, rotateY }}
      className="relative group transform-3d"
    >
      <motion.div
        className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 overflow-hidden"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* Gradient glow */}
        <motion.div
          className={`absolute inset-0 bg-linear-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`}
          animate={isHovered ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Icon */}
        <motion.div
          className={`w-16 h-16 rounded-2xl bg-linear-to-br ${feature.color} flex items-center justify-center mb-6 shadow-2xl transform-[translateZ(50px)]`}
          animate={isHovered ? { rotate: [0, 360] } : {}}
          transition={{ duration: 0.6 }}
        >
          <feature.icon className="w-8 h-8 text-white" />
        </motion.div>

        {/* Content */}
        <div className="transform-[translateZ(30px)]">
          <h3 className="text-2xl font-black text-white mb-3">{feature.title}</h3>
          <p className="text-gray-400 mb-4">{feature.desc}</p>
          <motion.div
            className={`inline-block px-4 py-2 rounded-full bg-linear-to-r ${feature.color} text-white text-sm font-bold`}
            whileHover={{ scale: 1.1 }}
          >
            {feature.stats}
          </motion.div>
        </div>

        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
          }}
          animate={isHovered ? { x: ['-100%', '200%'] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
        />
      </motion.div>
    </motion.div>
  )
}

export default function FeaturesPage() {
  const [activeFeature, setActiveFeature] = useState(0)

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-violet-950 to-gray-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-64 h-64 bg-violet-500/10 rounded-full blur-3xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.1, 0.3, 0.1],
              x: [0, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 100 - 50, 0],
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative pb-20 px-6">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <motion.div
              className="inline-block px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-violet-300 text-sm font-bold">✨ Powerful Features</span>
            </motion.div>
            
            <motion.h1 
              className="text-6xl md:text-8xl font-black mb-6 bg-linear-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent bg-size-[200%_100%]"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              Everything You Need
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Discover the powerful features that make TrickFunda the ultimate learning platform for students worldwide
            </motion.p>
          </motion.div>

          {/* Featured Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-linear-to-br from-violet-500/10 to-fuchsia-500/10 backdrop-blur-xl border border-white/10 rounded-3xl p-12 mb-20"
          >
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <motion.div 
                  className={`w-24 h-24 rounded-3xl bg-linear-to-br ${features[activeFeature].color} flex items-center justify-center mb-8 shadow-2xl`}
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  {(() => {
                    const Icon = features[activeFeature].icon
                    return <Icon className="w-12 h-12 text-white" />
                  })()}
                </motion.div>
                
                <h3 className="text-4xl font-black text-white mb-4">{features[activeFeature].title}</h3>
                <p className="text-xl text-gray-300 mb-6">{features[activeFeature].desc}</p>
                
                <div className="flex gap-2 flex-wrap mb-6">
                  {features.map((_, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => setActiveFeature(idx)}
                      className={`h-2 rounded-full transition-all ${idx === activeFeature ? 'bg-violet-400 w-12' : 'bg-gray-600 w-2 hover:bg-gray-500'}`}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    />
                  ))}
                </div>

                <motion.div
                  className={`inline-block px-6 py-3 rounded-full bg-linear-to-r ${features[activeFeature].color} text-white font-bold text-lg`}
                  whileHover={{ scale: 1.05 }}
                >
                  {features[activeFeature].stats}
                </motion.div>
              </div>

              <motion.div 
                className="relative h-96 bg-linear-to-br from-gray-900/50 to-gray-800/50 rounded-3xl border border-white/10 flex items-center justify-center overflow-hidden transform-3d"
              >
                <motion.div
                  className={`w-64 h-64 rounded-full bg-linear-to-br ${features[activeFeature].color} opacity-20 blur-3xl absolute`}
                  animate={{ scale: [1, 1.2, 1], rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity }}
                />
                <motion.div
                  animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  {(() => {
                    const Icon = features[activeFeature].icon
                    return <Icon className="w-48 h-48 text-violet-400/30 relative z-10" />
                  })()}
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {features.map((feature, idx) => (
              <FeatureCard key={idx} feature={feature} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto relative"
        >
          <div className="relative bg-linear-to-r from-violet-600 via-fuchsia-600 to-pink-600 rounded-3xl p-16 text-center overflow-hidden">
            {/* Animated background */}
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-32 h-32 bg-white/10 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: 5 + Math.random() * 5,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}

            <div className="relative z-10">
              <h2 className="text-5xl font-black text-white mb-6">Ready to Experience These Features?</h2>
              <p className="text-2xl text-white/90 mb-10">Start your learning journey today with TrickFunda</p>
              
              <Link href="/#subjects">
                <motion.button
                  className="px-12 py-6 bg-white text-violet-600 rounded-2xl font-black text-xl shadow-2xl"
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(255, 255, 255, 0.3)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started Free 🚀
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
