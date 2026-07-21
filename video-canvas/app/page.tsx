'use client';

import { useEffect } from 'react';

import dynamic from 'next/dynamic';
import { useVideoStore } from '@video-canvas/store/useVideoStore';

// Dynamic imports with SSR disabled to prevent DOM API errors during build
const VideoStage = dynamic(() => import('@video-canvas/components/Canvas/VideoStage'), { ssr: false });
const VideoToolbar = dynamic(() => import('@video-canvas/components/UI/VideoToolbar').then(mod => mod.VideoToolbar as any), { ssr: false });
const VideoDropZone = dynamic(() => import('@video-canvas/components/UI/VideoDropZone').then(mod => mod.VideoDropZone as any), { ssr: false });
const ToolbarToggle = dynamic(() => import('@video-canvas/components/UI/ToolbarToggle').then(mod => mod.ToolbarToggle as any), { ssr: false });

export default function VideoCanvasApp() {
  const showDropzone = useVideoStore((s) => s.showDropzone);
  const videoSrc = useVideoStore((s) => s.videoSrc);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target as HTMLElement).isContentEditable) {
        return;
      }

      const store = useVideoStore.getState();
      if (!store.videoSrc) return;

      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          store.setPlaying(!store.isPlaying);
          break;
        case 'ArrowRight':
          e.preventDefault();
          store.setCurrentTime(Math.min(store.currentTime + 5, store.duration));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          store.setCurrentTime(Math.max(store.currentTime - 5, 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          store.setVolume(Math.min(store.volume + 0.1, 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          store.setVolume(Math.max(store.volume - 0.1, 0));
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Show drop zone when no video is loaded */}
      {showDropzone && <VideoDropZone />}

      {/* Main video canvas (shown when video is loaded) */}
      {!showDropzone && videoSrc && (
        <>
          <VideoStage />
          <VideoToolbar />
          <ToolbarToggle />
        </>
      )}
    </>
  );
}
