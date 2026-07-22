"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Image as ImageIcon,
  Cloud,
  Activity,
  Search,
  Command,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { UserButton, useUser } from '@clerk/nextjs';
import '@/styles/admin.css';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, shortcut: 'D' },
  { name: 'Google Drive', href: '/admin/gdrive', icon: Cloud, shortcut: 'G' },
  { name: 'Content Explorer', href: '/admin/explorer', icon: FolderTree, shortcut: 'E' },
  { name: 'Smart Editor', href: '/admin/editor', icon: FileEdit, shortcut: 'W' },
  { name: 'Quiz Builder', href: '/admin/quiz-builder', icon: ListChecks, shortcut: 'Q' },
  { name: 'Media Manager', href: '/admin/media', icon: ImageIcon, shortcut: 'M' },
  { name: 'Activity Log', href: '/admin/activity', icon: Activity, shortcut: 'A' },
  { name: 'Settings', href: '/admin/settings', icon: Settings, shortcut: 'S' },
];

// Log admin activity helper
function logActivity(action: string, detail: string) {
  try {
    const log = JSON.parse(localStorage.getItem('admin_activity_log') || '[]');
    log.unshift({ action, detail, timestamp: new Date().toISOString() });
    localStorage.setItem('admin_activity_log', JSON.stringify(log.slice(0, 100)));
  } catch { }
}

export { logActivity };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [selectedCommand, setSelectedCommand] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, isLoaded } = useUser();
  const commandInputRef = useRef<HTMLInputElement>(null);

  // Command palette keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
        setCommandQuery('');
        setSelectedCommand(0);
      }
      if (e.key === 'Escape' && isCommandOpen) {
        setIsCommandOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isCommandOpen]);

  // Focus command input when opened
  useEffect(() => {
    if (isCommandOpen) {
      setTimeout(() => commandInputRef.current?.focus(), 50);
    }
  }, [isCommandOpen]);

  // Filter commands
  const filteredCommands = navItems.filter(item =>
    item.name.toLowerCase().includes(commandQuery.toLowerCase())
  );

  const handleCommandSelect = (href: string) => {
    router.push(href);
    setIsCommandOpen(false);
    setIsMobileOpen(false);
  };

  const handleCommandKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedCommand(i => Math.min(i + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedCommand(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filteredCommands[selectedCommand]) {
      handleCommandSelect(filteredCommands[selectedCommand].href);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0a0a0a] overflow-hidden text-gray-900 dark:text-gray-100 selection:bg-emerald-500/30">

      {/* Spotlight glow */}
      <div className="admin-spotlight" />

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-72 z-50 flex flex-col lg:hidden admin-sidebar"
            >
              <SidebarContent pathname={pathname} closeMobile={() => setIsMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="hidden lg:flex flex-col z-30 admin-sidebar"
      >
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-20 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-full p-1.5 shadow-md hover:scale-110 transition-all z-40 text-gray-400 hover:text-emerald-500"
        >
          <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-300 ${isSidebarOpen ? 'rotate-180' : ''}`} />
        </button>
        <SidebarContent pathname={pathname} isCollapsed={!isSidebarOpen} />
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">

        {/* Topbar */}
        <header className="admin-topbar">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Command Palette Trigger */}
            <button
              onClick={() => { setIsCommandOpen(true); setCommandQuery(''); }}
              className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-white/20 transition-all text-sm w-64"
            >
              <Search className="w-4 h-4" />
              <span>Search commands...</span>
              <div className="ml-auto flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-white/10 text-[11px] font-mono text-gray-500">⌘</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-white/10 text-[11px] font-mono text-gray-500">K</kbd>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors hover:text-amber-500"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="h-8 w-px bg-gray-200 dark:bg-white/10" />

            {isLoaded && user ? (
              <div className="flex items-center gap-3">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-semibold leading-none">{user.fullName}</p>
                  <p className="text-xs text-gray-500 mt-1">{user.primaryEmailAddress?.emailAddress}</p>
                </div>
                <UserButton appearance={{ elements: { avatarBox: "w-9 h-9 ring-2 ring-emerald-500/20" } }} />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full admin-shimmer" />
            )}
          </div>
        </header>

        {/* Page Content with animation */}
        <main className="flex-1 overflow-auto relative">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.015] dark:opacity-[0.02] pointer-events-none mix-blend-overlay" />
          <div className="max-w-[1600px] mx-auto h-full relative z-10 p-4 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Command Palette */}
      <AnimatePresence>
        {isCommandOpen && (
          <div className="admin-command-palette">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="admin-command-backdrop"
              onClick={() => setIsCommandOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="admin-command-box"
            >
              <div className="flex items-center gap-3 px-5">
                <Command className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  ref={commandInputRef}
                  type="text"
                  placeholder="Type a command or search..."
                  value={commandQuery}
                  onChange={(e) => { setCommandQuery(e.target.value); setSelectedCommand(0); }}
                  onKeyDown={handleCommandKeyDown}
                  className="admin-command-input !border-none !px-0"
                />
              </div>
              <div className="py-2 max-h-[320px] overflow-y-auto admin-scroll">
                <div className="px-4 py-1.5">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pages</span>
                </div>
                {filteredCommands.map((item, i) => (
                  <button
                    key={item.href}
                    onClick={() => handleCommandSelect(item.href)}
                    className={`admin-command-item w-full text-left ${i === selectedCommand ? 'selected' : ''}`}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">{item.name}</span>
                    <div className="shortcut">
                      <kbd>{item.shortcut}</kbd>
                    </div>
                  </button>
                ))}
                {filteredCommands.length === 0 && (
                  <div className="px-5 py-8 text-center text-gray-400 text-sm">
                    No commands found for "{commandQuery}"
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarContent({ pathname, isCollapsed = false, closeMobile }: { pathname: string; isCollapsed?: boolean; closeMobile?: () => void }) {
  return (
    <div className="flex flex-col h-full py-6">
      {/* Brand */}
      <div className={`px-6 flex items-center mb-8 ${isCollapsed ? 'justify-center px-0' : ''}`}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 flex-shrink-0 relative">
          <span className="text-white font-bold text-lg tracking-tighter">TF</span>
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
        </div>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="ml-3"
          >
            <div className="font-bold text-lg tracking-tight whitespace-nowrap">
              TrickFunda <span className="text-emerald-500 font-light text-base">Pro</span>
            </div>
            <div className="text-[10px] text-gray-400 font-medium tracking-wider uppercase -mt-0.5">Admin Console</div>
          </motion.div>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto admin-scroll">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={closeMobile}
              className={`admin-nav-item ${isActive ? 'active' : ''} ${isCollapsed ? 'justify-center !px-3' : ''}`}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-emerald-500' : ''}`} />
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="truncate"
                >
                  {item.name}
                </motion.span>
              )}
              {!isCollapsed && isActive && (
                <motion.div
                  layoutId="nav-active-dot"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="px-3 mt-auto pt-4 border-t border-gray-200 dark:border-white/5 space-y-1">
        <Link
          href="/"
          className={`admin-nav-item text-gray-500 hover:text-red-500 dark:hover:text-red-400 ${isCollapsed ? 'justify-center !px-3' : ''}`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="truncate">Exit Admin</span>}
        </Link>
      </div>
    </div>
  );
}
