'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Trash2, Move } from 'lucide-react';
import { useVideoStore } from '@video-canvas/store/useVideoStore';
import { PinnedImage } from '@video-canvas/types';

interface PinnedImageLayerProps {
  zoom: number;
  panX: number;
  panY: number;
}

export function PinnedImageLayer({ zoom, panX, panY }: PinnedImageLayerProps) {
  const pinnedImages = useVideoStore(s => s.pinnedImages);
  const selectedId = useVideoStore(s => s.selectedId);
  const selectObject = useVideoStore(s => s.selectObject);
  const updatePinnedImage = useVideoStore(s => s.updatePinnedImage);
  const deletePinnedImage = useVideoStore(s => s.deletePinnedImage);

  const handlePointerDownBg = (e: React.PointerEvent) => {
    // Only deselect if clicking directly on background
    if (e.target === e.currentTarget) {
      selectObject(null);
    }
  };

  return (
    <div
      className="absolute inset-0 pointer-events-none z-10"
      onPointerDown={handlePointerDownBg}
      style={{ overflow: 'hidden' }}
    >
      <div
        className="absolute w-full h-full"
        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {pinnedImages?.map((image) => (
          <PinnedImageItem
            key={image.id}
            image={image}
            isSelected={selectedId === image.id}
            onSelect={() => selectObject(image.id)}
            onUpdate={(updates) => updatePinnedImage(image.id, updates)}
            onRemove={() => deletePinnedImage(image.id)}
            zoom={zoom}
          />
        ))}
      </div>
    </div>
  );
}

interface PinnedImageItemProps {
  image: PinnedImage;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<PinnedImage>) => void;
  onRemove: () => void;
  zoom: number;
}

function PinnedImageItem({
  image,
  isSelected,
  onSelect,
  onUpdate,
  onRemove,
  zoom,
}: PinnedImageItemProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);
  const resizeStartRef = useRef<{ x: number; y: number; startW: number; startH: number; startX: number; startY: number; handle: string } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    onSelect();
    
    if (image.locked) return;
    
    // Set pointer capture to ensure we keep receiving events even if the pointer moves outside
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startX: image.x,
      startY: image.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging && dragStartRef.current) {
      const dx = (e.clientX - dragStartRef.current.x) / zoom;
      const dy = (e.clientY - dragStartRef.current.y) / zoom;
      
      onUpdate({
        x: dragStartRef.current.startX + dx,
        y: dragStartRef.current.startY + dy,
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      dragStartRef.current = null;
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  const handleResizeStart = (e: React.PointerEvent, handle: string) => {
    e.stopPropagation();
    onSelect();
    
    if (image.locked) return;
    
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsResizing(true);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startW: image.width,
      startH: image.height,
      startX: image.x,
      startY: image.y,
      handle,
    };
  };

  const handleResizeMove = (e: React.PointerEvent) => {
    if (isResizing && resizeStartRef.current) {
      e.stopPropagation();
      const { x, y, startW, startH, startX, startY, handle } = resizeStartRef.current;
      
      let dx = (e.clientX - x) / zoom;
      let dy = (e.clientY - y) / zoom;

      let newW = startW;
      let newH = startH;
      let newX = startX;
      let newY = startY;

      const ratio = startW / startH;
      const maintainRatio = !e.shiftKey;

      if (handle.includes('e')) newW = Math.max(20, startW + dx);
      if (handle.includes('w')) {
        newW = Math.max(20, startW - dx);
        if (newW !== 20) newX = startX + dx;
      }
      if (handle.includes('s')) newH = Math.max(20, startH + dy);
      if (handle.includes('n')) {
        newH = Math.max(20, startH - dy);
        if (newH !== 20) newY = startY + dy;
      }

      if (maintainRatio) {
        if (handle === 'se' || handle === 'nw') {
          newH = newW / ratio;
          if (handle === 'nw') {
            newY = startY + (startH - newH);
          }
        } else if (handle === 'sw' || handle === 'ne') {
          newW = newH * ratio;
          if (handle === 'sw') {
            newX = startX + (startW - newW);
          }
        }
      }

      onUpdate({
        width: newW,
        height: newH,
        x: newX,
        y: newY,
      });
    }
  };

  const handleResizeUp = (e: React.PointerEvent) => {
    if (isResizing) {
      e.stopPropagation();
      setIsResizing(false);
      resizeStartRef.current = null;
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  const opacity = image.opacity ?? 1;

  return (
    <div
      className={`absolute pointer-events-auto ${isSelected ? 'z-20' : 'z-10'}`}
      style={{
        left: image.x,
        top: image.y,
        width: image.width,
        height: image.height,
        cursor: image.locked ? 'default' : isDragging ? 'grabbing' : 'grab',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div 
        className={`w-full h-full relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
        style={{ opacity }}
      >
        {/* The actual image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.src}
          alt="Pinned"
          className="w-full h-full object-contain pointer-events-none select-none"
          draggable={false}
        />

        {/* Lock Badge */}
        {image.locked && !isSelected && (
          <div className="absolute top-2 right-2 bg-black/50 p-1 rounded-md text-white backdrop-blur-sm">
            <Lock size={14} />
          </div>
        )}

        {/* Selection UI */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg shadow-lg border border-gray-200 pointer-events-auto"
              onPointerDown={(e) => e.stopPropagation()} // Prevent drag when using controls
            >
              {/* Opacity slider */}
              <div className="flex items-center gap-2 px-2 border-r border-gray-300">
                <span className="text-xs text-gray-500 font-medium w-8">
                  {Math.round(opacity * 100)}%
                </span>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => onUpdate({ opacity: parseFloat(e.target.value) })}
                  className="w-20 accent-blue-500"
                />
              </div>

              {/* Lock toggle */}
              <button
                onClick={() => onUpdate({ locked: !image.locked })}
                className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${
                  image.locked ? 'text-blue-500 bg-blue-50' : 'text-gray-600'
                }`}
                title={image.locked ? "Unlock" : "Lock"}
              >
                {image.locked ? <Lock size={16} /> : <Unlock size={16} />}
              </button>

              {/* Delete button */}
              <button
                onClick={onRemove}
                className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition-colors"
                title="Delete image"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resize Handles */}
        {isSelected && !image.locked && (
          <>
            {['nw', 'ne', 'sw', 'se'].map((handle) => (
              <div
                key={handle}
                className="absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-sm"
                style={{
                  top: handle.includes('n') ? -6 : 'auto',
                  bottom: handle.includes('s') ? -6 : 'auto',
                  left: handle.includes('w') ? -6 : 'auto',
                  right: handle.includes('e') ? -6 : 'auto',
                  cursor: `${handle}-resize`,
                }}
                onPointerDown={(e) => handleResizeStart(e, handle)}
                onPointerMove={handleResizeMove}
                onPointerUp={handleResizeUp}
                onPointerCancel={handleResizeUp}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
