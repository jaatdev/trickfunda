'use client'

import { motion } from 'framer-motion'
import { Calendar, Clock, User, ArrowRight, TrendingUp, BookOpen, Lightbulb } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import AnimatedCounter from '@/components/shared/AnimatedCounter'

const categories = ['All', 'Study Tips', 'Exam Prep', 'Success Stories', 'Technology', 'Productivity']

const blogPosts = [
  {
    id: 1,
    title: 'How Spaced Repetition Changed My UPSC Preparation',
    excerpt: 'Discover how the SM-2 algorithm helped me retain 95% of what I studied and crack UPSC in my first attempt.',
    author: 'Priya Sharma',
    date: 'Jan 15, 2025',
    readTime: '8 min',
    category: 'Success Stories',
    image: '📚',
    views: 12500,
    featured: true,
    gradient: 'from-violet-500 to-purple-500'
  },
  {
    id: 2,
    title: '10 Proven Study Techniques for Better Retention',
    excerpt: 'Science-backed methods to improve your memory and ace any competitive exam with confidence.',
    author: 'Dr. Rahul Verma',
    date: 'Jan 12, 2025',
    readTime: '6 min',
    category: 'Study Tips',
    image: '🧠',
    views: 8900,
    featured: true,
    gradient: 'from-blue-500 to-indigo-500'
  },
  {
    id: 3,
    title: 'The Ultimate Guide to JEE Advanced 2025',
    excerpt: 'Complete roadmap, study plan, and resources to crack JEE Advanced with top rank.',
    author: 'Arjun Singh',
    date: 'Jan 10, 2025',
    readTime: '12 min',
    category: 'Exam Prep',
    image: '🎯',
    views: 15200,
    featured: true,
    gradient: 'from-emerald-500 to-teal-500'
  },
  {
    id: 4,
    title: 'AI in Education: The Future of Learning',
    excerpt: 'How artificial intelligence is revolutionizing the way students learn and prepare for exams.',
    author: 'Tech Team',
    date: 'Jan 8, 2025',
    readTime: '5 min',
    category: 'Technology',
    image: '🤖',
    views: 6700,
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    id: 5,
    title: 'From 60% to 95%: My NEET Success Story',
    excerpt: 'How I improved my accuracy and scored 720/720 in NEET using smart study strategies.',
    author: 'Ananya Patel',
    date: 'Jan 5, 2025',
    readTime: '10 min',
    category: 'Success Stories',
    image: '⚕️',
    views: 11300,
    gradient: 'from-amber-500 to-orange-500'
  },
  {
    id: 6,
    title: 'Time Management Hacks for Students',
    excerpt: 'Maximize your productivity with these proven time management techniques and tools.',
    author: 'Sneha Reddy',
    date: 'Jan 3, 2025',
    readTime: '7 min',
    category: 'Productivity',
    image: '⏰',
    views: 9400,
    gradient: 'from-cyan-500 to-blue-500'
  },
  {
    id: 7,
    title: 'Understanding the Psychology of Learning',
    excerpt: 'Deep dive into how our brain learns and retains information for long-term memory.',
    author: 'Dr. Vikram Kumar',
    date: 'Dec 30, 2024',
    readTime: '9 min',
    category: 'Study Tips',
    image: '🧬',
    views: 7800,
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: 8,
    title: 'CAT 2025: Complete Preparation Strategy',
    excerpt: 'Expert tips and strategies to score 99+ percentile in CAT and get into top IIMs.',
    author: 'MBA Mentor',
    date: 'Dec 28, 2024',
    readTime: '11 min',
    category: 'Exam Prep',
    image: '💼',
    views: 13600,
    gradient: 'from-indigo-500 to-purple-500'
  },
  {
    id: 9,
    title: 'The Power of Active Recall in Learning',
    excerpt: 'Why testing yourself is more effective than re-reading and how to implement it.',
    author: 'Learning Lab',
    date: 'Dec 25, 2024',
    readTime: '6 min',
    category: 'Study Tips',
    image: '💡',
    views: 8200,
    gradient: 'from-yellow-500 to-orange-500'
  }
]

const stats = [
  { label: 'Articles Published', value: 127, icon: BookOpen },
  { label: 'Total Readers', value: 250000, suffix: '+', icon: User },
  { label: 'Success Stories', value: 89, icon: TrendingUp },
  { label: 'Expert Authors', value: 24, icon: Lightbulb }
]

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [hoveredPost, setHoveredPost] = useState<number | null>(null)

  const filteredPosts = selectedCategory === 'All' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory)

  const featuredPosts = blogPosts.filter(post => post.featured)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-orange-950 dark:to-gray-900 relative overflow-hidden">
      {/* Animated background */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-64 h-64 bg-orange-200/20 dark:bg-orange-500/10 rounded-full blur-3xl"
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
              className="inline-block px-6 py-3 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-8"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-orange-600 dark:text-orange-400 text-sm font-bold">📝 Learning Blog</span>
            </motion.div>
            
            <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
              Learn & Grow
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Expert tips, success stories, and study strategies to help you ace your exams
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
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} duration={2} />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Featured Posts */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3">
              <span className="text-4xl">🔥</span> Featured Articles
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {featuredPosts.map((post, idx) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  onHoverStart={() => setHoveredPost(post.id)}
                  onHoverEnd={() => setHoveredPost(null)}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl relative"
                >
                  <div className={`h-48 bg-gradient-to-br ${post.gradient} flex items-center justify-center text-8xl relative overflow-hidden`}>
                    <motion.div
                      animate={hoveredPost === post.id ? { scale: 1.2, rotate: 10 } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      {post.image}
                    </motion.div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full font-bold">
                        {post.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.readTime}
                      </span>
                    </div>
                    
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 line-clamp-2">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">{post.author}</span>
                      </div>
                      <motion.button
                        className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-bold"
                        whileHover={{ x: 5 }}
                      >
                        Read <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-12"
          >
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-8">All Articles</h2>
            <div className="flex gap-3 flex-wrap">
              {categories.map((category) => (
                <motion.button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-xl font-bold transition-all ${
 selectedCategory === category
 ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
 : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
 }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* All Posts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredPosts.map((post, idx) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${post.gradient} flex items-center justify-center text-4xl mb-4`}>
                  {post.image}
                </div>
                
                <div className="flex items-center gap-3 mb-3 text-xs text-gray-600 dark:text-gray-400">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full font-bold">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {post.date}
                  </span>
                </div>
                
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {post.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-500">
                    <AnimatedCounter end={post.views} duration={1.5} /> views
                  </span>
                  <motion.button
                    className="text-orange-600 dark:text-orange-400 font-bold flex items-center gap-1"
                    whileHover={{ x: 3 }}
                  >
                    Read <ArrowRight className="w-3 h-3" />
                  </motion.button>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Newsletter CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 rounded-3xl p-12 text-center text-white relative overflow-hidden"
          >
            {[...Array(6)].map((_, i) => (
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
              <h2 className="text-4xl font-black mb-4">Never Miss an Article</h2>
              <p className="text-xl mb-8 text-orange-100">
                Get the latest study tips and success stories delivered to your inbox
              </p>
              <div className="flex gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 rounded-xl text-gray-900 font-semibold focus:outline-none focus:ring-4 focus:ring-white/50"
                />
                <motion.button
                  className="px-8 py-4 bg-white text-orange-600 rounded-xl font-bold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Subscribe
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
