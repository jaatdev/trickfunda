'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

interface NavbarMobileMenuProps {
  closeMenu: () => void;
}

export function NavbarMobileMenu({ closeMenu }: NavbarMobileMenuProps) {
  const menuItems = [
    { label: 'KD Method', href: '/kd-method' },
    { label: 'Success Stories', href: '/success-stories' },
    { label: 'Pro/Pricing', href: '/pricing' },
  ];

  const subjects = [
    { label: 'Polity', href: '/subjects/polity' },
    { label: 'History', href: '/subjects/history' },
    { label: 'Static GK', href: '/subjects/static-gk' },
    { label: 'Law/BNS', href: '/subjects/law-bns' },
    { label: 'Hindi', href: '/subjects/hindi' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-start w-full h-full pb-20 pt-10 space-y-6 md:hidden overflow-y-auto px-6"
    >
      <div className="flex flex-col items-center gap-6 w-full">
        {menuItems.map((item, i) => (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1 }}
          >
            <Link
              href={item.href}
              onClick={closeMenu}
              className="text-3xl font-semibold text-gray-900 dark:text-white transition-colors"
            >
              {item.label}
            </Link>
          </motion.div>
        ))}

        {/* Subjects Header for Mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full text-center mt-4"
        >
          <h3 className="text-sm uppercase tracking-widest text-gray-500 font-bold mb-4">Subjects</h3>
          <div className="flex flex-col gap-4">
            {subjects.map((sub) => (
              <Link
                key={sub.href}
                href={sub.href}
                onClick={closeMenu}
                className="text-xl font-medium text-gray-700 dark:text-gray-300"
              >
                {sub.label}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.5 }}
        className="h-px w-24 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent my-6"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col w-full gap-4 max-w-sm"
      >
        <div className="flex justify-center w-full mt-4">
          <SignedOut>
            <Link 
              href="/sign-in" 
              onClick={closeMenu}
              className="w-full text-center px-8 py-4 rounded-full font-bold text-lg bg-black text-white dark:bg-white dark:text-black transition-transform active:scale-95"
            >
              Login
            </Link>
          </SignedOut>
          <SignedIn>
            <div className="flex flex-col items-center gap-2" onClick={closeMenu}>
              <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: "w-12 h-12" } }} />
              <span className="text-sm font-medium text-gray-500">Account</span>
            </div>
          </SignedIn>
        </div>
      </motion.div>
    </motion.div>
  );
}
