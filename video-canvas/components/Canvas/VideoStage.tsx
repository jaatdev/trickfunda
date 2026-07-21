'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useVideoStore } from '@video-canvas/store/useVideoStore';
import { VideoLayer } from '@video-canvas/components/Canvas/VideoLayer';
import DrawingCanvas from '@video-canvas/components/Canvas/DrawingCanvas';
import { PinnedImageLayer } from '@video-canvas/components/Canvas/PinnedImageLayer';
import { TextLayer } from '@video-canvas/components/Canvas/TextLayer';

export default function VideoStage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const zoom = useVideoStore((state: any) => state.zoom ?? 1);
  const panX = useVideoStore((state: any) => state.panX ?? 0);
  const panY = useVideoStore((state: any) => state.panY ?? 0);
  const activeTool = useVideoStore((state: any) => state.activeTool ?? 'select');
  const setZoom = useVideoStore((state: any) => state.setZoom);
  const setPan = useVideoStore((state: any) => state.setPan);
  const undo = useVideoStore((state: any) => state.undo);
  const redo = useVideoStore((state: any) => state.redo);
  const toggleToolbar = useVideoStore((state: any) => state.toggleToolbar);
  const deleteSelected = useVideoStore((state: any) => state.deleteSelected);
  const deselectAll = useVideoStore((state: any) => state.deselectAll);

  const [isDraggingPan, setIsDraggingPan] = useState(false);
  const lastPanPoint = useRef({ x: 0, y: 0 });

  // Helper to find video element if store doesn't handle playback directly
  const getVideoElement = () => document.querySelector('video');

  // Handle Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      const video = getVideoElement();

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          if (video) {
            if (video.paused) video.play();
            else video.pause();
          }
          break;
        case 'z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (e.shiftKey) {
              redo?.();
            } else {
              undo?.();
            }
          }
          break;
        case 'y':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            redo?.();
          }
          break;
        case 't':
          e.preventDefault();
          toggleToolbar?.();
          break;
        case '=':
        case '+':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setZoom?.(Math.min(4, zoom + 0.25));
          }
          break;
        case '-':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setZoom?.(Math.max(0.25, zoom - 0.25));
          }
          break;
        case '0':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setZoom?.(1);
            setPan?.(0, 0);
          }
          break;
        case 'delete':
        case 'backspace':
          e.preventDefault();
          deleteSelected?.();
          break;
        case 'escape':
          e.preventDefault();
          deselectAll?.();
          break;
        case 'arrowleft':
          e.preventDefault();
          if (video) video.currentTime = Math.max(0, video.currentTime - 5);
          break;
        case 'arrowright':
          e.preventDefault();
          if (video) video.currentTime = Math.min(video.duration, video.currentTime + 5);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoom, setZoom, setPan, undo, redo, toggleToolbar, deleteSelected, deselectAll]);

  // Handle Wheel Zooming via native event to prevent default easily
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey || true) {
        // Zooming
        const zoomDelta = e.deltaY * -0.001;
        const newZoom = Math.min(Math.max(0.25, zoom * (1 + zoomDelta)), 4);
        
        if (newZoom !== zoom && setZoom && setPan) {
          // Calculate zoom centered on cursor
          const rect = container.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;

          // How far the mouse is from the center of the container
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          // Adjust pan to keep the point under the mouse fixed
          const scaleChange = newZoom / zoom;
          const newPanX = panX - (mouseX - centerX - panX) * (scaleChange - 1);
          const newPanY = panY - (mouseY - centerY - panY) * (scaleChange - 1);

          setZoom(newZoom);
          setPan(newPanX, newPanY);
        }
      }
    };

    // Passive false to allow preventDefault
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [zoom, panX, panY, setZoom, setPan]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button === 1 || activeTool === 'pan') {
      setIsDraggingPan(true);
      lastPanPoint.current = { x: e.clientX, y: e.clientY };
      if (e.target instanceof HTMLElement) {
        e.target.setPointerCapture(e.pointerId);
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDraggingPan && setPan) {
      const dx = e.clientX - lastPanPoint.current.x;
      const dy = e.clientY - lastPanPoint.current.y;
      setPan(panX + dx, panY + dy);
      lastPanPoint.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingPan) {
      setIsDraggingPan(false);
      if (e.target instanceof HTMLElement) {
        e.target.releasePointerCapture(e.pointerId);
      }
    }
  };

  const getCursorStyle = () => {
    if (isDraggingPan) return 'grabbing';
    switch (activeTool) {
      case 'pen':
      case 'eraser':
      case 'shape':
      case 'lasso':
        return 'crosshair';
      case 'pan':
        return 'grab';
      case 'text':
        return 'text';
      case 'pinImage':
        return 'copy';
      case 'select':
      default:
        return 'default';
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-black"
      style={{ cursor: getCursorStyle(), touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Layer 0: Video */}
      <VideoLayer />
      
      {/* Layer 5: Drawing Canvas (ink/shapes) */}
      <DrawingCanvas />
      
      {/* Layer 10: Pinned Images */}
      <PinnedImageLayer zoom={zoom} panX={panX} panY={panY} />
      
      {/* Layer 12: Text Annotations */}
      <TextLayer zoom={zoom} panX={panX} panY={panY} containerRef={containerRef} />
    </div>
  );
}
