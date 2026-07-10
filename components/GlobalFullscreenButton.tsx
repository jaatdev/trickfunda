'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useFullscreen } from '@/lib/fullscreen-context'
import { useToast } from '@/components/feedback/ToastProvider'

export default function GlobalFullscreenButton() {
  const { isFullscreen, toggleFullscreen } = useFullscreen()
  const { showToast } = useToast()
  const pathname = usePathname()

  // Detect if current page is a notes page (topic content pages)
  // Matches: /subjects/[slug]/[topicId] and deeper paths
  // Excludes: /subjects (listing) and /subjects/[slug] (overview)
  const isNotesPage = pathname ? /^\/subjects\/[^/]+\/[^/]+/.test(pathname) : false

  // Set page type data attribute for CSS targeting
  useEffect(() => {
    const html = document.documentElement
    if (isNotesPage) {
      html.setAttribute('data-page-type', 'notes')
      console.log('Page type: notes', pathname)
    } else {
      html.setAttribute('data-page-type', 'other')
      console.log('Page type: other', pathname)
    }
  }, [isNotesPage, pathname])

  // Show toast when entering fullscreen
  useEffect(() => {
    if (isFullscreen) {
      // Don't show toast if the user is currently in the hacker preloader sequence
      if (typeof window !== 'undefined' && !sessionStorage.getItem('tf_preloader_v3')) {
        return;
      }
      
      showToast({
        message: '🎯 Fullscreen Mode Active! Press ESC or F11 to exit',
        variant: 'success',
        timeout: 4000
      })
    }
  }, [isFullscreen, showToast])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault()
        toggleFullscreen()
      }
      if (e.key === 'Escape' && isFullscreen) {
        toggleFullscreen()
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault()
        toggleFullscreen()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isFullscreen, toggleFullscreen])

  return (
    <>
      {/* Exit Button */}
      {isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="fullscreen-exit-btn"
          title="Exit fullscreen mode (Press Esc or F11)"
          aria-label="Exit fullscreen mode"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Exit Fullscreen
        </button>
      )}

      {/* Entry Button */}
      {!isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="fullscreen-btn"
          title={isNotesPage 
            ? "Enter fullscreen mode - hides navbar, footer, and all OS UI" 
            : "Enter fullscreen mode - hides all OS UI (keeps navbar & footer)"}
          aria-label="Enter fullscreen mode"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          Fullscreen
        </button>
      )}
    </>
  )
}
