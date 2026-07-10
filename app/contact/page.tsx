'use client'

import { motion } from 'framer-motion'
import { Mail, MessageSquare, Phone, MapPin } from 'lucide-react'
import { useState } from 'react'

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 dark:from-gray-900 dark:via-pink-950 dark:to-gray-900">
      <section className="relative pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              We'd love to hear from you. Send us a message!
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-6">Send Message</h2>
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-pink-500 outline-none transition-colors"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-pink-500 outline-none transition-colors"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Message</label>
                    <textarea
                      rows={6}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-pink-500 outline-none transition-colors resize-none"
                      placeholder="Your message..."
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                    />
                  </div>
                  <motion.button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl font-bold text-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Send Message 📨
                  </motion.button>
                </form>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {[
                { icon: Mail, title: 'Email', value: 'hello@notty.app', color: 'from-pink-500 to-rose-500' },
                { icon: MessageSquare, title: 'Live Chat', value: 'Available 24/7', color: 'from-rose-500 to-red-500' },
                { icon: Phone, title: 'Phone', value: '+1 (555) 123-4567', color: 'from-red-500 to-orange-500' },
                { icon: MapPin, title: 'Office', value: 'San Francisco, CA', color: 'from-orange-500 to-amber-500' }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  whileHover={{ scale: 1.05, x: 10 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg flex items-center gap-4"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0`}>
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-500 dark:text-gray-400">{item.title}</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{item.value}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
