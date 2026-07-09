"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FolderTree, 
  FileEdit, 
  ListChecks, 
  Settings, 
  Menu, 
  X,
  LogOut,
  ChevronRight,
  Sun,
  Moon,
  Image as ImageIcon
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { UserButton, useUser } from '@clerk/nextjs';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Content Explorer', href: '/admin/explorer', icon: FolderTree },
  { name: 'Modular Editor', href: '/admin/editor', icon: FileEdit },
  { name: 'Quiz Builder', href: '/admin/quiz-builder', icon: ListChecks },
  { name: 'Media Manager', href: '/admin/media', icon: ImageIcon },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, isLoaded } = useUser();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0a0a0a] overflow-hidden text-gray-900 dark:text-gray-100 selection:bg-emerald-500/30">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMobile}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#111111] border-r border-gray-200 dark:border-white/5 z-50 flex flex-col shadow-2xl lg:hidden"
            >
              <SidebarContent pathname={pathname} closeMobile={toggleMobile} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="hidden lg:flex flex-col bg-white dark:bg-[#111111] border-r border-gray-200 dark:border-white/5 z-30 transition-all duration-300 ease-in-out relative"
      >
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-full p-1 shadow-sm hover:scale-110 transition-transform z-40 text-gray-500 hover:text-emerald-500"
        >
          <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isSidebarOpen ? 'rotate-180' : ''}`} />
        </button>
        <SidebarContent pathname={pathname} isCollapsed={!isSidebarOpen} />
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Topbar */}
        <header className="h-16 flex-shrink-0 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-4 lg:px-8 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleMobile}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-400">
                TrickFunda CMS
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <div className="h-8 w-px bg-gray-200 dark:bg-white/10 mx-2" />
            
            {isLoaded && user ? (
              <div className="flex items-center gap-3">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium leading-none">{user.fullName}</p>
                  <p className="text-xs text-gray-500 mt-1">{user.primaryEmailAddress?.emailAddress}</p>
                </div>
                <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-9 h-9" } }} />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8 relative">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] dark:opacity-[0.03] pointer-events-none mix-blend-overlay" />
          <div className="max-w-7xl mx-auto h-full relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ pathname, isCollapsed = false, closeMobile }: { pathname: string, isCollapsed?: boolean, closeMobile?: () => void }) {
  return (
    <div className="flex flex-col h-full py-6">
      {/* Brand */}
      <div className={`px-6 flex items-center mb-10 ${isCollapsed ? 'justify-center px-0' : ''}`}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
          <span className="text-white font-bold text-xl tracking-tighter">TF</span>
        </div>
        {!isCollapsed && (
          <div className="ml-3 font-bold text-xl tracking-tight whitespace-nowrap">
            TrickFunda <span className="text-emerald-500 font-light">Pro</span>
          </div>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={closeMobile}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute left-0 w-1 h-8 bg-emerald-500 rounded-r-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-emerald-500' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
              {!isCollapsed && (
                <span className="truncate">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="px-3 mt-auto pt-6 border-t border-gray-200 dark:border-white/5">
        <Link
          href="/"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-red-500 dark:hover:text-red-400 group ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="truncate">Exit Admin</span>}
        </Link>
      </div>
    </div>
  );
}
