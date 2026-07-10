'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useMemo, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { useAppTheme } from '@/hooks/useAppTheme'

// Seeded random for consistent SSR/client rendering
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

// Typing Effect Component
const TerminalText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const startTyping = () => {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayedText(text.slice(0, i + 1));
        i++;
        if (i >= text.length) clearInterval(interval);
      }, 50);
      return interval;
    };
    
    timeoutId = setTimeout(() => {
      const interval = startTyping();
      return () => clearInterval(interval);
    }, delay);
    
    return () => clearTimeout(timeoutId);
  }, [text, delay]);

  return (
    <span className="font-mono text-xs opacity-70 tracking-widest flex items-center gap-1">
      {displayedText}
      <motion.span 
        animate={{ opacity: [1, 0] }} 
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="w-2 h-3 bg-current inline-block"
      />
    </span>
  );
};

// Bracket Hover Link Component
const FooterLink = ({ href, label, color }: { href: string; label: string; color: string }) => {
  return (
    <Link href={href} className="group relative inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300">
      <span className={`opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 font-mono text-${color}-400`}>
        [
      </span>
      <span className="relative z-10 group-hover:translate-x-1 transition-transform duration-300">
        {label}
      </span>
      <span className={`opacity-0 translate-x-2 group-hover:opacity-100 group-hover:-translate-x-0 transition-all duration-300 font-mono text-${color}-400`}>
        ]
      </span>
    </Link>
  );
};

export default function Footer() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const theme = useAppTheme(pathname);

  const orbs = useMemo(() => 
    [...Array(15)].map((_, i) => ({
      id: i,
      left: Math.round(seededRandom(i * 4 + 1) * 100) % 100,
      top: Math.round(seededRandom(i * 4 + 2) * 100) % 100,
      x: Math.round((seededRandom(i * 4 + 3) * 50 - 25) * 10) / 10,
      y: Math.round((seededRandom(i * 4 + 4) * 50 - 25) * 10) / 10,
      duration: Math.round(15 + seededRandom(i * 4 + 5) * 10),
      delay: Math.round(seededRandom(i * 4 + 6) * 5),
    })), 
  [])

  const hiddenRoutes = ['/admin', '/canvas', '/pdf-merger', '/ai'];
  if (pathname && hiddenRoutes.some(route => pathname.startsWith(route)) && isSignedIn) return null;

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
    <footer 
      className={`relative bg-gradient-to-br ${theme.footerGradient} text-white overflow-hidden transition-colors duration-700 border-t border-white/5 mt-20`}
      style={{ '--nav-glow-color': theme.navGlowHex } as React.CSSProperties}
    >
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{
             backgroundImage: `
               linear-gradient(to right, white 1px, transparent 1px),
               linear-gradient(to bottom, white 1px, transparent 1px)
             `,
             backgroundSize: '40px 40px'
           }}
      />

      {/* Animated glowing orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {orbs.map((orb) => (
          <motion.div
            key={orb.id}
            className={`absolute w-48 h-48 ${theme.footerOrbColor} rounded-full blur-[80px] transition-colors duration-700`}
            style={{
              left: `${orb.left}%`,
              top: `${orb.top}%`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.05, 0.15, 0.05],
              x: [0, orb.x * 2, 0],
              y: [0, orb.y * 2, 0],
            }}
            transition={{
              duration: orb.duration,
              repeat: Infinity,
              delay: orb.delay,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-16">
        
        {/* Newsletter Section - Cyberpunk Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="relative rounded-3xl bg-black/40 backdrop-blur-md border border-white/10 p-1 overflow-hidden group max-w-3xl mx-auto">
            {/* Running edge border specifically for newsletter */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
            
            <div className="bg-black/60 rounded-[22px] p-8 relative overflow-hidden border border-white/5 z-10">
              <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 text-center md:text-left">
                  <div className={`text-sm font-mono mb-2 ${theme.accentText}`}>
                    <TerminalText text="> INIT_COMM_PROTOCOL" />
                  </div>
                  <h3 className="text-3xl font-black mb-2 tracking-tight">Stay Updated</h3>
                  <p className="text-gray-400 text-sm">Receive data packets regarding new subjects and features.</p>
                </div>
                
                <div className="w-full md:w-auto flex-1 max-w-md flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-gray-500">{'>'}</span>
                    <input
                      type="email"
                      placeholder="user@network.com"
                      className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm placeholder-gray-600 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
                    />
                  </div>
                  <motion.button
                    className={`px-6 py-3 rounded-xl ${theme.accentBg} text-white font-bold font-mono text-sm shadow-[0_0_15px_rgba(255,255,255,0.1)] relative overflow-hidden group/btn`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10">EXECUTE</span>
                    <span className="absolute inset-0 bg-white/20 -translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-4 mb-8 group inline-flex">
              <motion.div 
                className="relative w-14 h-14 rounded-2xl overflow-hidden bg-black/50 border border-white/10 p-2"
                whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity ${theme.accentBg}`} />
                <img src="/logo.jpg" alt="TrickFunda Logo" className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-3xl font-black tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all duration-300">
                  TrickFunda
                </span>
                <span className={`text-xs font-mono tracking-wider uppercase mt-1 ${theme.accentText}`}>
                  <TerminalText text="SYS.ONLINE" delay={500} />
                </span>
              </div>
            </Link>
            
            <p className="text-gray-400 mb-8 max-w-sm leading-relaxed text-sm">
              Advanced knowledge acquisition framework. Flashcards, quizzes, and spaced repetition learning modules for competitive exams.
            </p>
            
            <div className="flex gap-4">
              {socialLinks.map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  className="w-12 h-12 rounded-xl bg-black/40 hover:bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10 transition-all group relative overflow-hidden"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.label}
                >
                  <span className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity ${theme.accentBg}`} />
                  <span className="text-xl relative z-10 group-hover:scale-110 transition-transform">{social.icon}</span>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Footer Link Sections */}
          {footerSections.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <span className={`w-2 h-2 rounded-full ${section.color === 'violet' ? 'bg-violet-400' : section.color === 'fuchsia' ? 'bg-fuchsia-400' : 'bg-pink-400'} shadow-[0_0_8px_currentColor]`} />
                <h3 className="font-bold text-white tracking-wide uppercase text-sm">
                  {section.title}
                </h3>
              </div>
              <ul className="space-y-4">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <FooterLink href={link.href} label={link.label} color={section.color} />
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 relative">
          <motion.div 
            className="flex items-center gap-2 text-gray-400 text-sm font-mono"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <span>© 2025 TRICKFUNDA</span>
            <span className="text-white/20">|</span>
            <span className="flex items-center gap-2">
              BUILD WITH 
              <motion.span
                className={`inline-block w-2 h-2 rounded-full ${theme.accentBg}`}
                animate={{ opacity: [1, 0.2, 1], scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </span>
          </motion.div>
          
          <div className="flex gap-8 text-sm font-mono">
            {['TERMS', 'PRIVACY', 'COOKIES'].map((item, i) => (
              <motion.div key={i} whileHover={{ scale: 1.05 }}>
                <Link 
                  href={`/${item.toLowerCase()}`} 
                  className="text-gray-500 hover:text-white transition-colors tracking-wider"
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
