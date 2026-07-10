'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth, UserButton } from '@clerk/nextjs';
import { Youtube, Send } from 'lucide-react';

interface NavbarMobileMenuProps {
  closeMenu: () => void;
}

export function NavbarMobileMenu({ closeMenu }: NavbarMobileMenuProps) {
  const { isSignedIn } = useAuth();
  const menuItems = [
    { label: 'KD Method', href: '/kd-method' },
    { label: 'Student Tools', href: '/tools' },
    { label: 'Success Stories', href: '/#success-stories' },
    { label: 'Pro/Pricing', href: '/pricing' },
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
              className="text-3xl font-semibold text-white transition-colors"
            >
              {item.label}
            </Link>
          </motion.div>
        ))}
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
        <div className="flex items-center justify-center gap-8 py-4">
          <a href="https://www.youtube.com/@TrickFunda" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-red-500 transition-colors">
            <Youtube className="w-8 h-8" />
          </a>
          <a href="https://t.me/trickfunda" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-blue-400 transition-colors">
            <Send className="w-8 h-8" />
          </a>
        </div>
        
        <div className="flex justify-center w-full mt-2">
          {!isSignedIn ? (
            <Link 
              href="/sign-in" 
              onClick={closeMenu}
              className="w-full text-center px-8 py-4 rounded-full font-bold text-lg bg-black text-white dark:bg-white dark:text-black transition-transform active:scale-95"
            >
              Login
            </Link>
          ) : (
            <div className="flex flex-col items-center gap-2" onClick={closeMenu}>
              <UserButton appearance={{ elements: { userButtonAvatarBox: "w-12 h-12" } }} />
              <span className="text-sm font-medium text-gray-500">Account</span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
