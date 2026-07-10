'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, HelpCircle, Book, Settings, CreditCard, Shield, MessageCircle, Mail, Phone, Clock, ChevronDown, Sparkles, Users, FileText, Video, Zap, CheckCircle2 } from 'lucide-react';
import AnimatedCounter from '@/components/shared/AnimatedCounter';

const categories = [
  { icon: Book, title: 'Getting Started', count: 12, color: 'from-blue-500 to-indigo-600', description: 'Learn the basics and start your journey' },
  { icon: Settings, title: 'Account & Settings', count: 8, color: 'from-purple-500 to-pink-600', description: 'Manage your profile and preferences' },
  { icon: CreditCard, title: 'Billing & Plans', count: 6, color: 'from-emerald-500 to-teal-600', description: 'Subscription and payment information' },
  { icon: Shield, title: 'Privacy & Security', count: 10, color: 'from-orange-500 to-red-600', description: 'Keep your data safe and secure' },
  { icon: Video, title: 'Video Tutorials', count: 15, color: 'from-rose-500 to-pink-600', description: 'Step-by-step video guides' },
  { icon: Zap, title: 'Tips & Tricks', count: 20, color: 'from-yellow-500 to-orange-600', description: 'Pro tips to maximize productivity' },
];

const faqs = [
  { 
    q: 'How does spaced repetition work?', 
    a: 'Spaced repetition uses the SM-2 algorithm to schedule reviews at optimal intervals for maximum retention. The system automatically adjusts based on your performance, showing cards more frequently if you struggle and less often as you master them.',
    category: 'Learning'
  },
  { 
    q: 'Can I use TrickFunda offline?', 
    a: 'Yes! TrickFunda is a Progressive Web App (PWA) that works offline once you\'ve viewed content at least once. All your notes, flashcards, and progress are cached locally for seamless offline access.',
    category: 'Technical'
  },
  { 
    q: 'How do I create flashcards?', 
    a: 'Navigate to any subject, click the "Create Flashcard" button, and add your question and answer. You can also add images, code snippets, and formatting to make your cards more effective.',
    category: 'Features'
  },
  { 
    q: 'Is my data secure?', 
    a: 'Absolutely. We use industry-standard AES-256 encryption for data at rest and TLS 1.3 for data in transit. We never share your data with third parties and comply with GDPR and CCPA regulations.',
    category: 'Security'
  },
  { 
    q: 'What payment methods do you accept?', 
    a: 'We accept all major credit cards (Visa, Mastercard, Amex), PayPal, and various local payment methods depending on your region. All transactions are processed securely through Stripe.',
    category: 'Billing'
  },
  { 
    q: 'Can I export my notes?', 
    a: 'Yes! You can export your notes in multiple formats including PDF, Markdown, and JSON. Go to Settings > Export Data to download all your content.',
    category: 'Features'
  },
  { 
    q: 'How do achievements work?', 
    a: 'Achievements are unlocked by reaching milestones like study streaks, mastering flashcards, and completing quizzes. Each achievement comes with a badge and contributes to your overall learning score.',
    category: 'Learning'
  },
  { 
    q: 'Is there a mobile app?', 
    a: 'TrickFunda is a PWA, which means you can install it on your phone like a native app. Just visit the site on your mobile browser and tap "Add to Home Screen" for the full app experience.',
    category: 'Technical'
  },
];

const contactMethods = [
  { icon: MessageCircle, title: 'Live Chat', description: 'Chat with our support team', availability: 'Available 24/7', color: 'from-blue-500 to-cyan-600' },
  { icon: Mail, title: 'Email Support', description: 'support@notty.com', availability: 'Response within 2 hours', color: 'from-purple-500 to-pink-600' },
  { icon: Phone, title: 'Phone Support', description: '+1 (555) 123-4567', availability: 'Mon-Fri, 9AM-6PM EST', color: 'from-emerald-500 to-teal-600' },
  { icon: FileText, title: 'Documentation', description: 'Comprehensive guides', availability: 'Always available', color: 'from-orange-500 to-red-600' },
];

const popularArticles = [
  { title: 'Getting Started with TrickFunda', views: 15200, category: 'Getting Started' },
  { title: 'Creating Your First Flashcard', views: 12800, category: 'Features' },
  { title: 'Understanding Spaced Repetition', views: 11500, category: 'Learning' },
  { title: 'Customizing Your Study Settings', views: 9300, category: 'Settings' },
  { title: 'Keyboard Shortcuts Guide', views: 8700, category: 'Tips' },
  { title: 'Troubleshooting Common Issues', views: 7400, category: 'Technical' },
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqCategories = ['All', ...Array.from(new Set(faqs.map(f => f.category)))];
  
  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch = faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 text-sm font-medium">Help Center</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent"
            >
              How Can We Help?
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-slate-300 max-w-3xl mx-auto mb-8"
            >
              Search our knowledge base or browse categories to find answers
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative max-w-2xl mx-auto"
            >
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for help articles, guides, FAQs..."
                className="w-full pl-16 pr-6 py-5 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/50 text-lg transition-all"
              />
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          >
            {[
              { icon: FileText, label: 'Articles', value: 71 },
              { icon: Video, label: 'Video Guides', value: 15 },
              { icon: Users, label: 'Happy Users', value: 45000, suffix: '+' },
              { icon: Clock, label: 'Avg Response', value: 2, suffix: 'h' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 + idx * 0.1 }}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className="relative group"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 group-hover:border-cyan-500/50 transition-all">
                  <stat.icon className="w-8 h-8 text-cyan-400 mb-3" />
                  <div className="text-3xl font-bold text-white mb-1">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Categories Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Browse by Category</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 + idx * 0.05 }}
                  whileHover={{ y: -8 }}
                  className="group relative cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 group-hover:border-cyan-500/50 transition-all">
                    <div className="flex items-start gap-4">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center flex-shrink-0`}
                      >
                        <cat.icon className="w-7 h-7 text-white" />
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                          {cat.title}
                        </h3>
                        <p className="text-sm text-slate-400 mb-2">{cat.description}</p>
                        <p className="text-sm text-cyan-400 font-medium">{cat.count} articles</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Popular Articles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Popular Articles</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularArticles.map((article, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 hover:border-cyan-500/50 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-xs text-cyan-400 font-medium">
                      {article.category}
                    </span>
                    <span className="text-sm text-slate-400">{(article.views / 1000).toFixed(1)}k views</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white hover:text-cyan-400 transition-colors">
                    {article.title}
                  </h3>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* FAQs Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-8">
                <HelpCircle className="w-8 h-8 text-cyan-400" />
                <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
              </div>

              {/* FAQ Category Filter */}
              <div className="flex gap-2 flex-wrap mb-8">
                {faqCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
 selectedCategory === cat
 ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
 : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700/50'
 }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              
              <div className="space-y-4">
                {filteredFaqs.map((faq, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="bg-slate-800/50 rounded-xl overflow-hidden hover:bg-slate-800 transition-all"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full text-left p-6 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <span className="text-lg font-semibold text-white">{faq.q}</span>
                        <span className="ml-3 px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded text-xs text-cyan-400">
                          {faq.category}
                        </span>
                      </div>
                      <motion.div
                        animate={{ rotate: openFaq === idx ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-5 h-5 text-cyan-400" />
                      </motion.div>
                    </button>
                    <motion.div
                      initial={false}
                      animate={{ height: openFaq === idx ? 'auto' : 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-6 text-slate-300 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  </motion.div>
                ))}
              </div>

              {filteredFaqs.length === 0 && (
                <div className="text-center py-12">
                  <HelpCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-xl text-slate-400">No FAQs found matching your criteria</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Contact Methods */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Get in Touch</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactMethods.map((method, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="relative group cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 group-hover:border-cyan-500/50 transition-all text-center">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-16 h-16 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center mx-auto mb-4`}
                    >
                      <method.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-lg font-bold text-white mb-2">{method.title}</h3>
                    <p className="text-sm text-slate-300 mb-2">{method.description}</p>
                    <p className="text-xs text-cyan-400">{method.availability}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 to-blue-600" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            
            <div className="relative p-12 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="inline-block mb-6"
              >
                <CheckCircle2 className="w-16 h-16 text-white" />
              </motion.div>
              
              <h2 className="text-4xl font-bold text-white mb-4">
                Still Need Help?
              </h2>
              <p className="text-xl text-cyan-100 mb-8 max-w-2xl mx-auto">
                Our support team is available 24/7 to assist you with any questions
              </p>
              
              <div className="flex gap-4 justify-center flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-cyan-600 rounded-xl font-bold text-lg hover:shadow-2xl transition-all inline-flex items-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Start Live Chat
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-cyan-700 text-white rounded-xl font-bold text-lg hover:bg-cyan-800 transition-all inline-flex items-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Email Support
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
