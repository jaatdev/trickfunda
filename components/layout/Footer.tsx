'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useMemo } from 'react'

// Seeded random for consistent SSR/client rendering
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

import { usePathname } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname();

  const orbs = useMemo(() => 
    [...Array(20)].map((_, i) => ({
      id: i,
      left: Math.round(seededRandom(i * 4 + 1) * 1000) / 10,
      top: Math.round(seededRandom(i * 4 + 2) * 1000) / 10,
      x: Math.round((seededRandom(i * 4 + 3) * 50 - 25) * 10) / 10,
      y: Math.round((seededRandom(i * 4 + 4) * 50 - 25) * 10) / 10,
      duration: Math.round(10 + seededRandom(i * 4 + 5) * 10),
      delay: Math.round(seededRandom(i * 4 + 6) * 5),
    })), 
  [])

  if (pathname.startsWith('/admin')) return null;

  const socialLinks = [
    { icon: '▶️', label: 'YouTube', href: 'https://www.youtube.com/@TrickFunda' },
    { icon: '✈️', label: 'Telegram', href: 'https://t.me/trickfunda' },
  ]

  const footerSections = [
    {
      title: 'Product',
      color: 'violet',
      links: [
        { label: 'Features', href: '/features' },
        { label: 'Subjects', href: '/subjects' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Roadmap', href: '/roadmap' },
      ]
    },
    {
      title: 'Resources',
      color: 'fuchsia',
      links: [
        { label: 'Blog', href: '/blog' },
        { label: 'Study Guides', href: '/study-guides' },
        { label: 'Help Center', href: '/help-center' },
        { label: 'Community', href: '/community' },
      ]
    },
    {
      title: 'Company',
      color: 'pink',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Careers', href: '/careers' },
        { label: 'Contact', href: '/contact' },
        { label: 'Privacy', href: '/privacy' },
      ]
    }
  ]

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-violet-950 to-gray-900 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {orbs.map((orb) => (
          <motion.div
            key={orb.id}
            className="absolute w-32 h-32 bg-violet-500/5 rounded-full blur-xl"
            style={{
              left: `${orb.left}%`,
              top: `${orb.top}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.1, 0.3, 0.1],
              x: [0, orb.x, 0],
              y: [0, orb.y, 0],
            }}
            transition={{
              duration: orb.duration,
              repeat: Infinity,
              delay: orb.delay,
            }}
          />
        ))}
      </div>

      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <motion.div 
                className="w-14 h-14 flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <img src="/logo.jpg" alt="TrickFunda Logo" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,215,0,0.4)] rounded-2xl" />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-3xl font-black bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                  TrickFunda
                </span>
                <span className="text-xs text-gray-400">Learn, Master, Excel</span>
              </div>
            </Link>
            
            <p className="text-gray-400 mb-6 max-w-sm leading-relaxed">
              World-class notes with flashcards, quizzes, and spaced repetition learning. 
              Ace your competitive exams with confidence.
            </p>
            
            <div className="flex gap-3">
              {socialLinks.map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  className="w-11 h-11 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10 transition-all"
                  whileHover={{ scale: 1.1, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.label}
                >
                  <span className="text-xl">{social.icon}</span>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <h3 className={`font-bold text-${section.color}-300 mb-4 text-lg`}>
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <Link 
                      href={link.href} 
                      className="text-gray-400 hover:text-white transition-all inline-flex items-center gap-2 group"
                    >
                      <motion.span
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        initial={false}
                      >
                        →
                      </motion.span>
                      <span className="group-hover:translate-x-1 transition-transform">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 p-8 rounded-3xl bg-gradient-to-r from-violet-600/10 via-fuchsia-600/10 to-pink-600/10 backdrop-blur-sm border border-white/10"
        >
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-black mb-3 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              📬 Stay Updated
            </h3>
            <p className="text-gray-400 mb-6">
              Get the latest study tips, new subjects, and exclusive content delivered to your inbox.
            </p>
            <div className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-all"
              />
              <motion.button
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold shadow-lg"
                whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(139, 92, 246, 0.4)' }}
                whileTap={{ scale: 0.95 }}
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <motion.p 
            className="text-gray-400 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            © 2025 TrickFunda. Made with{' '}
            <motion.span
              className="inline-block"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              💜
            </motion.span>
            {' '}for learners worldwide.
          </motion.p>
          
          <div className="flex gap-6 text-sm">
            {['Terms', 'Privacy', 'Cookies'].map((item, i) => (
              <motion.div key={i} whileHover={{ scale: 1.05 }}>
                <Link 
                  href={`/${item.toLowerCase()}`} 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {item}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
