'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Volume1, Repeat, SkipBack, SkipForward, Gauge } from 'lucide-react';
import { useVideoStore } from '@video-canvas/store/useVideoStore';
import { formatDuration } from '@video-canvas/utils/videoUtils';

export const VideoControls: React.FC = () => {
  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    isLooping,
    setPlaying,
    setCurrentTime,
    setVolume,
    toggleMute,
    setPlaybackRate,
    toggleLoop
  } = useVideoStore();

  const [isVisible, setIsVisible] = useState(true);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const resetHideTimeout = useCallback(() => {
    setIsVisible(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setIsVisible(false);
        setShowSpeedMenu(false);
      }
    }, 3000);
  }, [isPlaying]);

  useEffect(() => {
    window.addEventListener('mousemove', resetHideTimeout);
    return () => {
      window.removeEventListener('mousemove', resetHideTimeout);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [resetHideTimeout]);

  // If paused, keep controls visible
  useEffect(() => {
    if (!isPlaying) {
      setIsVisible(true);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    } else {
      resetHideTimeout();
    }
  }, [isPlaying, resetHideTimeout]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(Number(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
  };

  const skipBy = (seconds: number) => {
    setCurrentTime(Math.max(0, Math.min(currentTime + seconds, duration)));
  };

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercent = isMuted ? 0 : volume * 100;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-[80px] left-1/2 -translate-x-1/2 w-full max-w-[800px] z-[99990] px-4"
          onMouseEnter={() => {
            if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
          }}
          onMouseLeave={resetHideTimeout}
        >
          <div className="flex items-center gap-4 bg-black/70 backdrop-blur-xl rounded-2xl border border-white/10 p-3 text-white shadow-2xl">
            {/* Play/Pause */}
            <button
              onClick={() => setPlaying(!isPlaying)}
              className="w-11 h-11 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors shrink-0"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
            </button>

            {/* Skip Back */}
            <button
              onClick={() => skipBy(-5)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors shrink-0"
              title="Skip backward 5s"
            >
              <SkipBack size={18} />
            </button>

            {/* Time */}
            <div className="text-xs font-mono opacity-80 select-none shrink-0 min-w-[40px] text-right">
              {formatDuration(currentTime || 0)}
            </div>

            {/* Seek Bar */}
            <div className="flex-1 flex items-center relative h-6 group">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime || 0}
                onChange={handleSeek}
                className="w-full h-1.5 appearance-none bg-white/20 rounded-full outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                style={{
                  background: `linear-gradient(to right, white ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%)`
                }}
              />
            </div>

            {/* Duration */}
            <div className="text-xs font-mono opacity-80 select-none shrink-0 min-w-[40px]">
              {formatDuration(duration || 0)}
            </div>

            {/* Skip Forward */}
            <button
              onClick={() => skipBy(5)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors shrink-0"
              title="Skip forward 5s"
            >
              <SkipForward size={18} />
            </button>

            {/* Volume Group */}
            <div className="flex items-center gap-1 shrink-0 group/volume">
              <button
                onClick={toggleMute}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                <VolumeIcon size={18} />
              </button>
              <div className="w-0 overflow-hidden group-hover/volume:w-[50px] transition-all duration-300 ease-in-out opacity-0 group-hover/volume:opacity-100 flex items-center">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : (volume ?? 1)}
                  onChange={handleVolumeChange}
                  className="w-[50px] h-1.5 appearance-none bg-white/20 rounded-full outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  style={{
                    background: `linear-gradient(to right, white ${volumePercent}%, rgba(255,255,255,0.2) ${volumePercent}%)`
                  }}
                />
              </div>
            </div>

            {/* Speed Selector */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="flex items-center gap-1 p-2 hover:bg-white/10 rounded-full transition-colors text-xs font-mono"
                title="Playback Speed"
              >
                <Gauge size={18} />
                <span>{playbackRate || 1}x</span>
              </button>
              
              <AnimatePresence>
                {showSpeedMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full mb-2 right-0 bg-black/90 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden flex flex-col py-1 min-w-[80px] shadow-2xl"
                  >
                    {speeds.map((rate) => (
                      <button
                        key={rate}
                        onClick={() => {
                          setPlaybackRate(rate);
                          setShowSpeedMenu(false);
                        }}
                        className={`px-3 py-1.5 text-xs text-left hover:bg-white/10 transition-colors ${
                          playbackRate === rate ? 'text-blue-400 font-bold' : 'text-white'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Loop Toggle */}
            <button
              onClick={toggleLoop}
              className={`p-2 rounded-full transition-colors shrink-0 ${
                isLooping ? 'text-blue-400 bg-blue-400/10' : 'text-white hover:bg-white/10'
              }`}
              title="Toggle Loop"
            >
              <Repeat size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
