'use client';

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { useVideoStore } from '@video-canvas/store/useVideoStore';

import { useShallow } from 'zustand/react/shallow';

export interface VideoLayerProps {
  // Add any specific props if needed, mostly handled via Zustand
}

export const VideoLayer = forwardRef<HTMLVideoElement, VideoLayerProps>((props, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const {
    videoSrc,
    isPlaying,
    volume,
    isMuted,
    playbackRate,
    isLooping,
    currentTime,
    zoom,
    panX,
    panY,
    setCurrentTime,
    setDuration,
    setPlaying
  } = useVideoStore(
    useShallow((state: any) => ({
      videoSrc: state.videoSrc,
      isPlaying: state.isPlaying,
      volume: state.volume,
      isMuted: state.isMuted,
      playbackRate: state.playbackRate,
      isLooping: state.isLooping,
      currentTime: state.currentTime,
      zoom: state.zoom,
      panX: state.panX,
      panY: state.panY,
      setCurrentTime: state.setCurrentTime,
      setDuration: state.setDuration,
      setPlaying: state.setPlaying
    }))
  );

  useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement, []);

  // Sync isPlaying state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying && video.paused) {
      video.play().catch((err) => console.error('Video play error:', err));
    } else if (!isPlaying && !video.paused) {
      video.pause();
    }
  }, [isPlaying]);

  // Sync volume and mute state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume ?? 1;
      videoRef.current.muted = isMuted ?? false;
    }
  }, [volume, isMuted]);

  // Sync playback rate
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate || 1;
    }
  }, [playbackRate]);

  // Sync loop state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.loop = isLooping ?? false;
    }
  }, [isLooping]);

  // Sync seek when store currentTime changes externally
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Prevent recursive updates by checking the difference
    if (Math.abs(video.currentTime - (currentTime || 0)) > 0.5) {
      video.currentTime = currentTime || 0;
    }
  }, [currentTime]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleDurationChange = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleEnded = () => {
    if (!isLooping) {
      setPlaying(false);
    }
  };

  const handleLoadedMetadata = () => {
    // Dispatch dimensions if the store accepts them in the future
  };

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      <video
        ref={videoRef}
        src={videoSrc || ''}
        className="absolute w-full h-full object-contain pointer-events-none"
        style={{
          transform: `scale(${zoom || 1}) translate(${panX || 0}px, ${panY || 0}px)`,
          transformOrigin: 'center center',
        }}
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={handleDurationChange}
        onEnded={handleEnded}
        onLoadedMetadata={handleLoadedMetadata}
        playsInline
        crossOrigin="anonymous"
      />
    </div>
  );
});

VideoLayer.displayName = 'VideoLayer';
