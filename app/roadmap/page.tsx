'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Clock, Sparkles, Rocket, Target, Zap, Brain, Users, Globe } from 'lucide-react'
import { useState } from 'react'
import AnimatedCounter from '@/components/shared/AnimatedCounter'

type RoadmapItem = {
  icon: any;
  title: string;
  desc: string;
  votes: number;
  progress?: number;
};

const roadmapItems = [
  {
    quarter: 'Q1 2025',
    status: 'completed',
    items: [
      { icon: CheckCircle2, title: 'Spaced Repetition System', desc: 'SM-2 algorithm for optimal learning', votes: 1250 },
      { icon: CheckCircle2, title: 'Dark Mode', desc: 'Beautiful dark theme for night study', votes: 980 },
      { icon: CheckCircle2, title: 'Mobile Apps', desc: 'iOS and Android native apps', votes: 2100 },
      { icon: CheckCircle2, title: 'Offline Mode', desc: 'Study without internet connection', votes: 1500 },
    ] as RoadmapItem[]
  },
  {
    quarter: 'Q2 2025',
    status: 'in-progress',
    items: [
      { icon: Zap, title: 'AI Study Assistant', desc: 'ChatGPT-powered learning companion', votes: 3200, progress: 75 },
      { icon: Brain, title: 'Smart Recommendations', desc: 'Personalized content suggestions', votes: 1800, progress: 60 },
      { icon: Users, title: 'Study Groups', desc: 'Collaborate with peers in real-time', votes: 2400, progress: 40 },
      { icon: Target, title: 'Goal Tracking', desc: 'Set and achieve learning milestones', votes: 1600, progress: 85 },
    ] as RoadmapItem[]
  },
  {
    quarter: 'Q3 2025',
    status: 'planned',
    items: [
      { icon: Globe, title: 'Multi-language Support', desc: 'Learn in your native language', votes: 2800 },
      { icon: Sparkles, title: 'AR Flashcards', desc: 'Augmented reality study experience', votes: 1900 },
      { icon: Rocket, title: 'API Access', desc: 'Build custom integrations', votes: 950 },
      { icon: Brain, title: 'Mind Maps', desc: 'Visual learning with interactive maps', votes: 2200 },
    ] as RoadmapItem[]
  },
  {
    quarter: 'Q4 2025',
    status: 'planned',
    items: [
      { icon: Users, title: 'Live Classes', desc: 'Interactive sessions with experts', votes: 3500 },
      { icon: Zap, title: 'Gamification', desc: 'Earn badges, compete on leaderboards', votes: 2600 },
      { icon: Target, title: 'Exam Simulator', desc: 'Practice with real exam conditions', votes: 3100 },
      { icon: Globe, title: 'Community Forum', desc: 'Connect with learners worldwide', votes: 1700 },
    ] as RoadmapItem[]
  }
]

const stats = [
  { label: 'Features Shipped', value: '47', icon: Rocket },
  { label: 'In Development', value: '12', icon: Clock },
  { label: 'User Votes', value: '45k+', icon: Users },
  { label: 'Planned Features', value: '28', icon: Target }
]

export default function RoadmapPage() {
  const [filter, setFilter] = useState<'all' | 'completed' | 'in-progress' | 'planned'>('all')

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'from-emerald-500 to-teal-500'
      case 'in-progress': return 'from-blue-500 to-indigo-500'
      case 'planned': return 'from-purple-500 to-pink-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed': return { text: '✓ Completed', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' }
      case 'in-progress': return { text: '⚡ In Progress', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' }
      case 'planned': return { text: '🎯 Planned', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' }
      default: return { text: 'Unknown', color: 'bg-gray-100 text-gray-700' }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-950 dark:to-gray-900 relative overflow-hidden">
      {/* Animated background */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-64 h-64 bg-indigo-200/20 dark:bg-indigo-500/10 rounded-full blur-3xl"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
          }}
          transition={{
            duration: 20 + Math.random() * 10,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}

      <section className="relative pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <motion.div
              className="inline-block px-6 py-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-8"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-indigo-600 dark:text-indigo-400 text-sm font-bold">🗺️ Product Roadmap</span>
            </motion.div>
            
            <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              What's Coming Next
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              See what we're building, vote on features, and shape the future of TrickFunda together
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg text-center"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">
                  <AnimatedCounter 
                    end={parseInt(stat.value.replace(/[^0-9]/g, ''))} 
                    suffix={stat.value.includes('+') ? '+' : stat.value.includes('k') ? 'k' : ''}
                    duration={2}
                  />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center gap-4 mb-12 flex-wrap"
          >
            {['all', 'completed', 'in-progress', 'planned'].map((status) => (
              <motion.button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
 filter === status
 ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
 : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
 }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
              </motion.button>
            ))}
          </motion.div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 opacity-20" />

            {roadmapItems
              .filter(item => filter === 'all' || item.status === filter)
              .map((quarter, qIdx) => (
                <motion.div
                  key={qIdx}
                  initial={{ opacity: 0, x: qIdx % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: qIdx * 0.1 }}
                  className="mb-16 relative"
                >
                  {/* Quarter badge */}
                  <div className="flex items-center justify-center mb-8">
                    <motion.div
                      className={`px-8 py-4 rounded-2xl bg-gradient-to-r ${getStatusColor(quarter.status)} text-white font-black text-2xl shadow-xl`}
                      whileHover={{ scale: 1.05 }}
                    >
                      {quarter.quarter}
                    </motion.div>
                  </div>

                  {/* Status badge */}
                  <div className="flex justify-center mb-8">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusBadge(quarter.status).color}`}>
                      {getStatusBadge(quarter.status).text}
                    </span>
                  </div>

                  {/* Items grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {quarter.items.map((item, iIdx) => (
                      <motion.div
                        key={iIdx}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: iIdx * 0.1 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg relative overflow-hidden"
                      >
                        {/* Progress bar for in-progress items */}
                        {item.progress !== undefined && (
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
                            <motion.div
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                              initial={{ width: 0 }}
                              whileInView={{ width: `${item.progress}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, delay: 0.5 }}
                            />
                          </div>
                        )}

                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getStatusColor(quarter.status)} flex items-center justify-center flex-shrink-0`}>
                            <item.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">{item.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">{item.desc}</p>
                            
                            <div className="flex items-center justify-between">
                              <motion.button
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                👍 <AnimatedCounter end={item.votes} duration={1.5} />
                              </motion.button>
                              
                              {item.progress !== undefined && (
                                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                  {item.progress}% Complete
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-center text-white relative overflow-hidden"
          >
            {/* Animated particles */}
            {[...Array(8)].map((_, i) => (
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

            <div className="relative z-10">
              <h2 className="text-4xl font-black mb-4">Have a Feature Request?</h2>
              <p className="text-xl mb-8 text-indigo-100">
                We'd love to hear your ideas! Share your suggestions and vote on features.
              </p>
              <motion.button
                className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg"
                whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(255,255,255,0.3)' }}
                whileTap={{ scale: 0.95 }}
              >
                Submit Idea 💡
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
