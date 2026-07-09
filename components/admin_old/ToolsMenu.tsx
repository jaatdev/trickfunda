'use client'

import { useState } from 'react'

interface ToolsMenuProps {
  onHelpClick?: () => void
  onPerformanceClick?: () => void
  onAnalyticsClick?: () => void
  onSearchClick?: () => void
  onBackupClick?: () => void
  onQuickNoteClick?: () => void
}

export default function ToolsMenu({
  onHelpClick,
  onPerformanceClick,
  onAnalyticsClick,
  onSearchClick,
  onBackupClick,
  onQuickNoteClick,
}: ToolsMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { icon: '❓', label: 'Help', onClick: onHelpClick },
    { icon: '⚡', label: 'Performance', onClick: onPerformanceClick },
    { icon: '📊', label: 'Analytics', onClick: onAnalyticsClick },
    { icon: '🔍', label: 'Search', onClick: onSearchClick },
    { icon: '💾', label: 'Backup', onClick: onBackupClick },
    { icon: '✏️', label: 'Quick Note', onClick: onQuickNoteClick },
  ]

  const handleMenuClick = (onClick?: () => void) => {
    if (onClick) onClick()
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800/50 transition text-slate-300 hover:text-white"
        aria-label="Toggle tools menu"
      >
        {isOpen ? (
          <>
            <span>✕</span>
            <span className="text-xs font-medium">Close</span>
          </>
        ) : (
          <>
            <span>⋮</span>
            <span className="text-xs font-medium">Tools</span>
          </>
        )}
      </button>

      {/* Expanded Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-40">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Content */}
          <div className="absolute top-12 right-0 z-50 w-screen sm:w-96 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200">Tools & Actions</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-700 rounded transition text-slate-400 hover:text-white"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            {/* Menu Items */}
            <div className="divide-y divide-slate-700 max-h-[70vh] overflow-y-auto">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleMenuClick(item.onClick)}
                  className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-slate-800/80 transition group"
                >
                  <span className="text-xl group-hover:scale-110 transition">
                    {item.icon}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-200 group-hover:text-white">
                      {item.label}
                    </div>
                    <div className="text-xs text-slate-500">
                      {getItemDescription(item.label)}
                    </div>
                  </div>
                  <span className="text-slate-600 group-hover:text-slate-400">→</span>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="bg-slate-800/30 px-4 py-2 border-t border-slate-700">
              <p className="text-xs text-slate-500 text-center">
                Click an option or press ESC to close
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function getItemDescription(label: string): string {
  const descriptions: Record<string, string> = {
    Help: 'Get help and documentation',
    Performance: 'Monitor app performance',
    Analytics: 'View usage analytics',
    Search: 'Search notes and content',
    Backup: 'Create or restore backups',
    'Quick Note': 'Create a quick note',
  }
  return descriptions[label] || ''
}
