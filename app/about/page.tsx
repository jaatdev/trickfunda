'use client'

import { motion } from 'framer-motion'
import { Target, Users, Zap, Heart } from 'lucide-react'
import AnimatedCounter from '@/components/shared/AnimatedCounter'

const values = [
  { icon: Target, title: 'Mission-Driven', desc: 'Empowering students to achieve their dreams through better learning tools' },
  { icon: Users, title: 'Student-First', desc: 'Every feature designed with student success in mind' },
  { icon: Zap, title: 'Innovation', desc: 'Constantly pushing boundaries of educational technology' },
  { icon: Heart, title: 'Passion', desc: 'Built by learners, for learners, with love' }
]

const stats = [
  { value: '10k+', label: 'Active Students' },
  { value: '50+', label: 'Subjects Covered' },
  { value: '95%', label: 'Success Rate' },
  { value: '24/7', label: 'Support' }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900">
      <section className="relative pb-20 px-6 bg-gradient-to-br from-blue-600 to-indigo-600">
        <div className="max-w-5xl mx-auto text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black mb-6"
          >
            About TrickFunda
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl text-blue-100"
          >
            Revolutionizing how students learn and succeed
          </motion.p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-xl mb-20"
          >
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-6">Our Story</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              TrickFunda was born from a simple frustration: traditional note-taking apps weren't built for serious learners. 
              We wanted something that combined beautiful design with powerful learning science.
            </p>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Today, we're helping thousands of students ace their exams with AI-powered notes, spaced repetition, 
              and a learning experience that actually works.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 mb-20">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-lg"
              >
                <div className="text-5xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  <AnimatedCounter 
                    end={parseInt(stat.value.replace(/[^0-9]/g, ''))} 
                    suffix={stat.value.includes('+') ? '+' : stat.value.includes('%') ? '%' : ''}
                    duration={2}
                  />
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-semibold">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <h2 className="text-4xl font-black text-center text-gray-900 dark:text-white mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mb-6">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
