// components/admin/HamburgerSidebar.tsx
'use client';
import React from 'react';
import { NoteBoxType } from '@/lib/admin-types';

const BOX_TYPE_ICONS: Partial<Record<NoteBoxType, string>> = {
  'big-notes': '📝',
  'small-notes': '📋',
  'right-wrong': '✓✗',
  'mnemonic-magic': '🔤',
  'mnemonic-card': '🎴',
  'container-notes': '📦',
  'quick-reference': '📌',
  'flashcard': '🎯',
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  selectedType: NoteBoxType;
  onTypeSelect: (type: NoteBoxType) => void;
  onCreateNote: () => void;
  onResetForm: () => void;
  activeUsers: Array<{ user_id: string; display_name?: string }>;
  editorId: string;
};

export default function HamburgerSidebar({
  isOpen,
  onClose,
  selectedType,
  onTypeSelect,
  onCreateNote,
  onResetForm,
  activeUsers,
  editorId,
}: Props) {
  const BOX_TYPES: Array<{ key: NoteBoxType; label: string; hint: string }> = [
    { key: 'big-notes', label: 'Big Notes', hint: 'Long explanation' },
    { key: 'small-notes', label: 'Small Notes', hint: 'Bullet points' },
    { key: 'right-wrong', label: 'Right/Wrong', hint: 'True/False' },
    { key: 'mnemonic-magic', label: 'Mnemonic Magic', hint: 'Breakdown' },
    { key: 'mnemonic-card', label: 'Mnemonic Card', hint: 'Quick recall' },
    { key: 'container-notes', label: 'Container', hint: 'Sections' },
    { key: 'quick-reference', label: 'Quick Ref', hint: 'Label/Value' },
    { key: 'flashcard', label: 'Flashcard', hint: 'Q&A pairs' },
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar Drawer */}
      <div
        className={`fixed left-0 top-0 h-full w-80 bg-slate-900/95 backdrop-blur-xl border-r border-white/10 shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-xl">
                📝
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Admin Center</h2>
                <p className="text-xs text-slate-400">NoteBox Creator</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200"
            >
              ✕
            </button>
          </div>

          {/* Note Types Grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Note Types
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {BOX_TYPES.map((bt) => (
                  <button
                    key={bt.key}
                    onClick={() => {
                      onTypeSelect(bt.key);
                      onClose();
                    }}
                    className={`group relative p-4 rounded-xl transition-all duration-200 ${
                      selectedType === bt.key
                        ? 'bg-linear-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-400/50 shadow-lg shadow-indigo-500/20'
                        : 'bg-slate-800/30 border border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-800/50'
                    }`}
                  >
                    {/* Selected Indicator */}
                    {selectedType === bt.key && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                    )}
                    
                    <div className="text-3xl mb-2">{BOX_TYPE_ICONS[bt.key]}</div>
                    <div className="text-sm font-medium text-white mb-1">{bt.label}</div>
                    <div className="text-xs text-slate-400">{bt.hint}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Collaboration Status */}
            {activeUsers.length > 1 && (
              <div className="mt-6 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  👥 Collaboration
                </h3>
                <div className="space-y-2">
                  {activeUsers
                    .filter((u) => u.user_id !== editorId)
                    .map((u) => (
                      <div key={u.user_id} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm text-slate-300">
                          {u.display_name || u.user_id.slice(0, 8)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Keyboard Shortcuts */}
            <div className="mt-6 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                ⌨️ Shortcuts
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Toggle Sidebar</span>
                  <kbd className="px-2 py-1 rounded bg-slate-700/50 text-slate-300 font-mono">
                    Ctrl+\
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Save Draft</span>
                  <kbd className="px-2 py-1 rounded bg-slate-700/50 text-slate-300 font-mono">
                    Ctrl+S
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Create Note</span>
                  <kbd className="px-2 py-1 rounded bg-slate-700/50 text-slate-300 font-mono">
                    Ctrl+Enter
                  </kbd>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            <button
              onClick={() => {
                onCreateNote();
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-linear-to-r from-indigo-600 to-cyan-500 text-white font-medium hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-200 hover:scale-[1.02]"
            >
              ✨ Create Note
            </button>
            <button
              onClick={() => {
                onResetForm();
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-300 font-medium hover:bg-slate-700/50 hover:border-slate-600 transition-all duration-200"
            >
              🔄 Reset Form
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
