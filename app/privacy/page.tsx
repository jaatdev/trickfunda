'use client'

import { motion } from 'framer-motion'
import { Shield, Lock, Eye, Database } from 'lucide-react'

const sections = [
  {
    icon: Shield,
    title: 'Data Protection',
    content: 'We use industry-standard encryption to protect your personal information. Your data is stored securely and never shared with third parties without your explicit consent.'
  },
  {
    icon: Lock,
    title: 'Privacy Controls',
    content: 'You have full control over your data. Access, download, or delete your information anytime. We believe your data belongs to you.'
  },
  {
    icon: Eye,
    title: 'Transparency',
    content: 'We are transparent about what data we collect and why. No hidden tracking, no selling your information. What you see is what you get.'
  },
  {
    icon: Database,
    title: 'Data Retention',
    content: 'We only keep your data as long as necessary. You can request deletion at any time, and we will comply within 30 days.'
  }
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-gray-900 dark:via-slate-950 dark:to-gray-900">
      <section className="relative pb-20 px-6 bg-gradient-to-br from-slate-700 to-gray-800">
        <div className="max-w-5xl mx-auto text-center text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center"
          >
            <Shield className="w-12 h-12" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black mb-6"
          >
            Privacy Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300"
          >
            Your privacy is our priority. Here's how we protect it.
          </motion.p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-xl mb-12"
          >
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              Last updated: January 2025
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              At TrickFunda, we take your privacy seriously. This policy explains how we collect, use, and protect your personal information.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {sections.map((section, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-600 to-gray-700 flex items-center justify-center mb-6">
                  <section.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4">{section.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{section.content}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-slate-100 dark:bg-gray-800 rounded-2xl p-8 text-center"
          >
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4">Questions?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              If you have any questions about our privacy policy, please contact us.
            </p>
            <motion.a
              href="/contact"
              className="inline-block px-8 py-4 bg-gradient-to-r from-slate-600 to-gray-700 text-white rounded-xl font-bold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Contact Us
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
