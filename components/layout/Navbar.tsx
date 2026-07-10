'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Youtube, Send } from 'lucide-react';
import { useAuth, UserButton } from '@clerk/nextjs';

import InstallPrompt from '@/components/pwa/InstallPrompt';
import NavContinuePill from './NavContinuePill';
import { NavbarDropdown } from './NavbarDropdown';
import { NavbarMobileMenu } from './NavbarMobileMenu';
import { useAppTheme } from '@/hooks/useAppTheme';
import MagneticNavLink from '../ui/navbar/MagneticNavLink';

const navVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function Navbar() {
  const pathname = usePathname();
  const theme = useAppTheme(pathname);
  const { isSignedIn } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Track scroll for background styling
  const [scrolled, setScrolled] = useState(false);
  // Track visibility for "hide on scroll down"
  const [hidden, setHidden] = useState(false);
  
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    
    if (latest > 20) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }

    // Hide on scroll down, show on scroll up
    if (latest > 150 && latest > previous) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  // Ensure ALL hooks are called before any early return!
  const hiddenRoutes = ['/admin', '/canvas', '/pdf-merger', '/ai'];
  const isHiddenRoute = pathname && hiddenRoutes.some(route => pathname.startsWith(route)) && isSignedIn;

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen]);

  if (isHiddenRoute) return null;

  return (
    <>
      <motion.header
        variants={{
          visible: { y: 0, opacity: 1 },
          hidden: { y: "-100%", opacity: 0 }
        }}
        initial="visible"
        animate={hidden && !isMobileMenuOpen ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className={`fixed left-0 right-0 top-0 z-50 flex justify-center transition-[padding] duration-500 ${
          isMobileMenuOpen ? "h-screen px-0" : "top-4 px-4 sm:top-6"
        }`}
      >
        <motion.div
          variants={navVariants}
          initial="hidden"
          animate="visible"
          className={`relative w-full transition-all duration-500 ${
            isMobileMenuOpen
              ? "flex flex-col h-full max-w-none rounded-none px-0 pt-0 bg-black/95 backdrop-blur-3xl border-transparent"
              : `mx-auto max-w-5xl rounded-full border ${
                  scrolled
                    ? `${theme.navBgColor}/60 backdrop-blur-2xl ${theme.navBorderColor} ${theme.navGlow}`
                    : `${theme.navBgColor}/20 backdrop-blur-md border-white/5 shadow-none`
                }`
          }`}
          style={{ '--nav-glow-color': theme.navGlowHex } as React.CSSProperties}
        >
          {/* Futuristic Backgrounds */}
          {!isMobileMenuOpen && scrolled && (
            <>
              <div className="running-border" />
              <div className="cyber-grid" />
            </>
          )}

          {/* Top Bar - Always Visible */}
          <div className={`flex w-full items-center justify-between z-50 ${isMobileMenuOpen ? "px-6 py-4" : "px-6 py-3"}`}>
            {/* Logo */}
            <motion.div variants={itemVariants} className="z-50">
              <Link href="/" className="flex items-center gap-3 group" onClick={() => setIsMobileMenuOpen(false)}>
                {/* LOGO IMAGE ADDED HERE */}
                <div className="relative">
                  <div className={`absolute inset-0 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-500 ${theme.accentBg}`} />
                  <img src="/logo.jpg" alt="TrickFunda Logo" className="w-12 h-12 object-contain drop-shadow-[0_0_15px_rgba(255,215,0,0.4)] relative z-10" />
                </div>
                <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent drop-shadow-sm group-hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] transition-all duration-300">
                  TrickFunda
                </span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              <motion.div variants={itemVariants}>
                <MagneticNavLink href="/kd-method" label="KD Method" theme={theme} showBadge={true} />
              </motion.div>
              <motion.div variants={itemVariants}>
                <MagneticNavLink href="/tools" label="Tools" theme={theme} showBadge={true} />
              </motion.div>
              <motion.div variants={itemVariants}>
                <MagneticNavLink href="/#success-stories" label="Success Stories" theme={theme} />
              </motion.div>
              <motion.div variants={itemVariants}>
                <MagneticNavLink href="/pricing" label="Pro/Pricing" theme={theme} />
              </motion.div>
            </nav>

            {/* Actions (Desktop) */}
            <motion.div variants={itemVariants} className="flex items-center gap-3 z-50">
              <div className="hidden md:flex items-center gap-3">
                <div className="text-white hidden lg:block">
                  <NavContinuePill />
                </div>
                <div className="text-white hidden lg:block">
                  <InstallPrompt />
                </div>
                
                {/* Social Links */}
                <div className="flex items-center gap-3 pl-2 border-l border-white/10">
                  <a href="https://www.youtube.com/@TrickFunda" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-red-500 transition-colors">
                    <Youtube className="w-5 h-5" />
                  </a>
                  <a href="https://t.me/trickfunda" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-blue-400 transition-colors">
                    <Send className="w-5 h-5" />
                  </a>
                </div>

                {/* Authentication */}
                <div className="pl-3 border-l border-white/10">
                  {!isSignedIn ? (
                    <Link
                      href="/sign-in"
                      className="px-5 py-2 text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all"
                    >
                      Login
                    </Link>
                  ) : (
                    <div className="flex items-center gap-2">
                      <UserButton appearance={{ elements: { userButtonAvatarBox: "w-9 h-9 border border-white/20" } }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Toggle Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-white transition-transform active:scale-90 z-50 rounded-full bg-white/10 border border-white/10"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-5 w-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          </div>

          {/* The Veil - Mobile Menu Overlay */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <NavbarMobileMenu closeMenu={() => setIsMobileMenuOpen(false)} />
            )}
          </AnimatePresence>

        </motion.div>
      </motion.header>
    </>
  );
}
