'use client';
import { motion } from 'framer-motion';
import { BookOpen, Download, Star, Clock, TrendingUp, Users, Award, FileText, Search, Filter, ChevronDown, Sparkles, Target, Zap, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import AnimatedCounter from '@/components/shared/AnimatedCounter';

const guides = [
  { id: 1, title: 'Mathematics Mastery', subject: 'Math', category: 'Core', rating: 4.9, downloads: 25400, time: '45 min', pages: 87, level: 'Advanced', color: 'from-blue-500 to-cyan-600', description: 'Complete guide covering algebra, calculus, and geometry with practice problems' },
  { id: 2, title: 'Physics Fundamentals', subject: 'Physics', category: 'Core', rating: 4.8, downloads: 18200, time: '60 min', pages: 102, level: 'Intermediate', color: 'from-purple-500 to-pink-600', description: 'Master mechanics, thermodynamics, and electromagnetism with real-world examples' },
  { id: 3, title: 'Chemistry Quick Reference', subject: 'Chemistry', category: 'Core', rating: 4.7, downloads: 22100, time: '30 min', pages: 64, level: 'Beginner', color: 'from-emerald-500 to-teal-600', description: 'Essential formulas, reactions, and periodic table insights for quick revision' },
  { id: 4, title: 'Biology Essentials', subject: 'Biology', category: 'Core', rating: 4.9, downloads: 20800, time: '50 min', pages: 95, level: 'Intermediate', color: 'from-orange-500 to-red-600', description: 'Cell biology, genetics, and ecology explained with detailed diagrams' },
  { id: 5, title: 'History Timeline Guide', subject: 'History', category: 'Humanities', rating: 4.6, downloads: 15300, time: '40 min', pages: 78, level: 'Beginner', color: 'from-indigo-500 to-purple-600', description: 'Chronological overview of major historical events and their significance' },
  { id: 6, title: 'English Grammar Mastery', subject: 'English', category: 'Language', rating: 4.8, downloads: 30500, time: '35 min', pages: 71, level: 'Advanced', color: 'from-rose-500 to-pink-600', description: 'Comprehensive grammar rules, writing techniques, and literary analysis' },
  { id: 7, title: 'Computer Science Basics', subject: 'CS', category: 'Technology', rating: 4.9, downloads: 28700, time: '55 min', pages: 110, level: 'Intermediate', color: 'from-cyan-500 to-blue-600', description: 'Programming fundamentals, algorithms, and data structures simplified' },
  { id: 8, title: 'Economics Principles', subject: 'Economics', category: 'Social Science', rating: 4.7, downloads: 16900, time: '45 min', pages: 82, level: 'Intermediate', color: 'from-yellow-500 to-orange-600', description: 'Micro and macroeconomics concepts with market analysis techniques' },
  { id: 9, title: 'Psychology Insights', subject: 'Psychology', category: 'Social Science', rating: 4.8, downloads: 19400, time: '50 min', pages: 88, level: 'Beginner', color: 'from-pink-500 to-rose-600', description: 'Human behavior, cognitive processes, and psychological theories explained' },
  { id: 10, title: 'Statistics & Probability', subject: 'Math', category: 'Core', rating: 4.6, downloads: 14200, time: '40 min', pages: 69, level: 'Advanced', color: 'from-teal-500 to-emerald-600', description: 'Statistical methods, probability distributions, and data analysis techniques' },
  { id: 11, title: 'World Geography', subject: 'Geography', category: 'Humanities', rating: 4.7, downloads: 12800, time: '35 min', pages: 75, level: 'Beginner', color: 'from-green-500 to-teal-600', description: 'Physical and political geography with climate zones and cultural regions' },
  { id: 12, title: 'Philosophy Foundations', subject: 'Philosophy', category: 'Humanities', rating: 4.5, downloads: 11500, time: '55 min', pages: 92, level: 'Advanced', color: 'from-violet-500 to-purple-600', description: 'Major philosophical movements, thinkers, and ethical frameworks explored' },
];

const categories = ['All', 'Core', 'Humanities', 'Language', 'Technology', 'Social Science'];
const levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];

export default function StudyGuidesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGuides = guides.filter(guide => {
    const matchesCategory = selectedCategory === 'All' || guide.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All Levels' || guide.level === selectedLevel;
    const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          guide.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesLevel && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, delay: 1 }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative pb-16 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-medium">Expert Study Guides</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent"
            >
              Master Any Subject
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-slate-300 max-w-3xl mx-auto"
            >
              Comprehensive study guides created by top educators to accelerate your learning journey
            </motion.p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          >
            {[
              { icon: FileText, label: 'Study Guides', value: 12, suffix: '' },
              { icon: Download, label: 'Total Downloads', value: 234000, suffix: '+' },
              { icon: Star, label: 'Avg Rating', value: 4.8, suffix: '/5', decimals: 1 },
              { icon: Users, label: 'Active Learners', value: 45000, suffix: '+' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 + idx * 0.1 }}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className="relative group"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 group-hover:border-emerald-500/50 transition-all">
                  <stat.icon className="w-8 h-8 text-emerald-400 mb-3" />
                  <div className="text-3xl font-bold text-white mb-1">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
                  </div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 mb-12"
          >
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search guides..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-3 rounded-xl font-medium transition-all ${
 selectedCategory === cat
 ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
 : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700/50'
 }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Level Filter */}
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
              >
                {levels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </motion.div>

          {/* Guides Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGuides.map((guide, idx) => (
              <motion.div
                key={guide.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                whileHover={{ y: -8 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden group-hover:border-emerald-500/50 transition-all">
                  {/* Header */}
                  <div className={`h-40 bg-gradient-to-br ${guide.color} relative flex items-center justify-center overflow-hidden`}>
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <BookOpen className="w-20 h-20 text-white/30" />
                    </motion.div>
                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur-xl rounded-full text-sm font-medium text-white">
                      {guide.subject}
                    </div>
                    <div className="absolute top-4 left-4 px-3 py-1 bg-black/30 backdrop-blur-xl rounded-full text-xs font-medium text-white">
                      {guide.level}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                      {guide.title}
                    </h3>
                    
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                      {guide.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span>{guide.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        <span>{(guide.downloads / 1000).toFixed(1)}k</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{guide.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        <span>{guide.pages}p</span>
                      </div>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Guide
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredGuides.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-xl text-slate-400">No guides found matching your criteria</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-600" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            
            <div className="relative p-12 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="inline-block mb-6"
              >
                <Target className="w-16 h-16 text-white" />
              </motion.div>
              
              <h2 className="text-4xl font-bold text-white mb-4">
                Can't Find What You Need?
              </h2>
              <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
                Request a custom study guide and our expert educators will create it for you
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-emerald-600 rounded-xl font-bold text-lg hover:shadow-2xl transition-all inline-flex items-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Request Custom Guide
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
