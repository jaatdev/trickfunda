'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

import InstallPrompt from '@/components/pwa/InstallPrompt';
import NavContinuePill from './NavContinuePill';
import { NavbarDropdown } from './NavbarDropdown';
import { NavbarMobileMenu } from './NavbarMobileMenu';

export default function Navbar() {
  const pathname = usePathname();
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

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen]);

  const subjectsMenuItems = [
    { label: 'Polity', href: '/subjects/polity' },
    { label: 'History', href: '/subjects/history' },
    { label: 'Static GK', href: '/subjects/static-gk' },
    { label: 'Law/BNS', href: '/subjects/law-bns' },
    { label: 'Hindi', href: '/subjects/hindi' },
  ];

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
        <div
          className={`relative w-full transition-all duration-500 ${
            isMobileMenuOpen
              ? "flex flex-col h-full max-w-none rounded-none px-0 pt-0 bg-black/95 backdrop-blur-3xl border-transparent"
              : `mx-auto max-w-5xl rounded-full ${
                  scrolled
                    ? "bg-black/40 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]"
                    : "bg-black/10 backdrop-blur-md border border-white/5 shadow-none"
                }`
          }`}
        >
          {/* Top Bar - Always Visible */}
          <div className={`flex w-full items-center justify-between z-50 ${isMobileMenuOpen ? "px-6 py-4" : "px-6 py-3"}`}>
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group z-50" onClick={() => setIsMobileMenuOpen(false)}>
              {/* LOGO IMAGE ADDED HERE */}
              <img src="/logo.jpg" alt="TrickFunda Logo" className="w-12 h-12 object-contain drop-shadow-[0_0_15px_rgba(255,215,0,0.4)]" />
              <span className="font-black text-2xl tracking-tight text-white drop-shadow-sm">
                TrickFunda
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
              <Link
                href="/kd-method"
                className="px-4 py-2 rounded-xl text-sm font-bold text-gray-300 transition-colors hover:text-white relative group flex items-center gap-1"
              >
                <span className="relative z-10">KD Method</span>
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 absolute -top-0 -right-1 opacity-80 shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
              </Link>
              
              <div className="text-gray-300 hover:text-white">
                <NavbarDropdown label="Subjects" items={subjectsMenuItems} />
              </div>
              
              <Link
                href="/success-stories"
                className="px-4 py-2 rounded-xl text-sm font-bold text-gray-300 transition-colors hover:text-white"
              >
                Success Stories
              </Link>
              <Link
                href="/pricing"
                className="px-4 py-2 rounded-xl text-sm font-bold text-gray-300 transition-colors hover:text-white"
              >
                Pro/Pricing
              </Link>
            </nav>

            {/* Actions (Desktop) */}
            <div className="flex items-center gap-3 z-50">
              <div className="hidden md:flex items-center gap-3">
                <div className="text-white hidden lg:block">
                  <NavContinuePill />
                </div>
                <div className="text-white hidden lg:block">
                  <InstallPrompt />
                </div>

                {/* Authentication */}
                <div className="pl-2 border-l border-white/10">
                  <SignedOut>
                    <Link href="/sign-in">
                      <motion.div
                        className="px-5 py-2 rounded-full text-sm font-bold bg-white text-black hover:bg-gray-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Login
                      </motion.div>
                    </Link>
                  </SignedOut>
                  <SignedIn>
                    <UserButton afterSignOutUrl="/" />
                  </SignedIn>
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
            </div>
          </div>

          {/* The Veil - Mobile Menu Overlay */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <NavbarMobileMenu closeMenu={() => setIsMobileMenuOpen(false)} />
            )}
          </AnimatePresence>

        </div>
      </motion.header>
    </>
  );
}
