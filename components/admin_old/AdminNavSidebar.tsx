'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminNavSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  icon: string;
  href: string;
  description?: string;
}

interface QuickAction {
  label: string;
  icon: string;
  onClick: () => void;
  color: string;
}

export default function AdminNavSidebar({ isOpen, onClose }: AdminNavSidebarProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { label: 'Dashboard', icon: '📊', href: '/admin', description: 'Overview & stats' },
    { label: 'Notes', icon: '📝', href: '/admin/notes', description: 'Manage all notes' },
    { label: 'Subjects', icon: '📚', href: '/admin/subjects', description: 'Subject management' },
    { label: 'Analytics', icon: '📈', href: '/analytics', description: 'Performance insights' },
  ];

  const quickActions: QuickAction[] = [
    { 
      label: 'New Subject', 
      icon: '➕', 
      onClick: () => {
        // Handle new subject
        console.log('Create new subject');
      },
      color: 'bg-indigo-600 hover:bg-indigo-700'
    },
    { 
      label: 'Manage Notes', 
      icon: '⚙️', 
      onClick: () => {
        window.location.href = '/admin/notes';
      },
      color: 'bg-purple-600 hover:bg-purple-700'
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-slate-900/95 backdrop-blur-xl border-r border-white/10 shadow-2xl z-50 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold">
                N
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">TrickFunda Admin</h2>
                <p className="text-xs text-slate-400">Control Center</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
                Navigation
              </p>
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'bg-indigo-500/20 border-l-2 border-indigo-500 text-white'
                        : 'hover:bg-slate-800/50 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      {item.description && (
                        <div className="text-xs text-slate-500 group-hover:text-slate-400">
                          {item.description}
                        </div>
                      )}
                    </div>
                    {isActive && (
                      <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-3">
                Quick Actions
              </p>
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => {
                      action.onClick();
                      onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg ${action.color} text-white font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-lg`}
                  >
                    <span className="text-xl">{action.icon}</span>
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Keyboard Shortcut Hint */}
            <div className="mt-8 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
              <p className="text-xs text-slate-400 mb-2">💡 Keyboard Shortcuts</p>
              <div className="space-y-1 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Toggle Admin Nav</span>
                  <kbd className="px-2 py-1 rounded bg-slate-700/50 text-slate-300 font-mono">Ctrl+B</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Toggle Note Types</span>
                  <kbd className="px-2 py-1 rounded bg-slate-700/50 text-slate-300 font-mono">Ctrl+\</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Save Draft</span>
                  <kbd className="px-2 py-1 rounded bg-slate-700/50 text-slate-300 font-mono">Ctrl+S</kbd>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-green-400 to-emerald-600 flex items-center justify-center text-sm font-bold text-white">
                K
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Admin User</p>
                <p className="text-xs text-slate-400">Online</p>
              </div>
              <button
                className="w-8 h-8 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                title="Settings"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
