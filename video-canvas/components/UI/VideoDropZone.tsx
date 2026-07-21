'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Upload, Film, AlertCircle, Loader2 } from 'lucide-react';
import { useVideoStore } from '@video-canvas/store/useVideoStore';
import { getVideoMeta, isValidVideoFile, SUPPORTED_VIDEO_FORMATS, MAX_VIDEO_SIZE } from '@video-canvas/utils/videoUtils';

export const VideoDropZone = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadVideo = useVideoStore((state) => state.loadVideo);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    setError(null);
    if (!isValidVideoFile(file)) {
      setError(`Invalid file type. Supported formats: ${SUPPORTED_VIDEO_FORMATS.join(', ')}`);
      return;
    }
    if (file.size > MAX_VIDEO_SIZE) {
      setError(`File size exceeds the ${(MAX_VIDEO_SIZE / (1024 * 1024)).toFixed(0)}MB limit.`);
      return;
    }

    try {
      setIsLoading(true);
      const blobUrl = URL.createObjectURL(file);
      const meta = await getVideoMeta(file);
      loadVideo(blobUrl, meta);
    } catch (err) {
      setError('Failed to load video metadata. Please try a different file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-[#0a0a0a] text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative w-full max-w-4xl h-full max-h-[600px] flex flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-colors duration-300 backdrop-blur-3xl overflow-hidden cursor-pointer ${
          isDragging ? 'border-purple-500 bg-purple-500/10' : 'border-neutral-700 bg-white/5 hover:bg-white/10'
        }`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={SUPPORTED_VIDEO_FORMATS.map(f => `video/${f}`).join(',')}
          onChange={handleFileChange}
        />

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-purple-400"
            >
              <Loader2 className="w-16 h-16 animate-spin mb-4" />
              <p className="text-lg font-medium">Extracting video magic...</p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-center px-6"
            >
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 blur-2xl opacity-40 animate-pulse rounded-full" />
                <div className="relative bg-neutral-900/50 p-6 rounded-full border border-neutral-800">
                  <Upload className="w-16 h-16 text-purple-400" />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400 mb-2">
                Drop your video here
              </h2>
              <p className="text-neutral-400 text-lg mb-8">or click to browse from your computer</p>

              <div className="flex gap-4">
                {['MP4', 'WebM', 'OGG'].map((format) => (
                  <div key={format} className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 text-sm text-neutral-300">
                    <Film className="w-4 h-4 text-purple-400" />
                    {format}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-8 flex items-center gap-2 text-red-400 bg-red-400/10 px-6 py-3 rounded-full border border-red-400/20"
          >
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
