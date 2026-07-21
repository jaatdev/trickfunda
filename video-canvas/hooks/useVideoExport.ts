'use client';

import { useCallback } from 'react';
import { useVideoStore } from '@video-canvas/store/useVideoStore';

/**
 * Hook for exporting video canvas screenshots.
 * Captures the current video frame + all annotation layers composited as a single PNG.
 */
export function useVideoExport() {
  const strokes = useVideoStore((s) => s.strokes);
  const pinnedImages = useVideoStore((s) => s.pinnedImages);
  const textNodes = useVideoStore((s) => s.textNodes);

  const captureScreenshot = useCallback(async (
    videoEl: HTMLVideoElement | null,
    drawingCanvas: HTMLCanvasElement | null,
    containerEl: HTMLDivElement | null,
  ) => {
    if (!videoEl || !containerEl) {
      console.error('Missing video or container element for screenshot');
      return;
    }

    try {
      // Create a composite canvas matching video dimensions
      const compositeCanvas = document.createElement('canvas');
      const videoWidth = videoEl.videoWidth || videoEl.clientWidth;
      const videoHeight = videoEl.videoHeight || videoEl.clientHeight;
      compositeCanvas.width = videoWidth;
      compositeCanvas.height = videoHeight;
      const ctx = compositeCanvas.getContext('2d');
      if (!ctx) return;

      // 1. Draw the video frame
      ctx.drawImage(videoEl, 0, 0, videoWidth, videoHeight);

      // 2. Draw the drawing canvas (ink strokes)
      if (drawingCanvas) {
        // Scale drawing canvas to match video resolution
        const scaleX = videoWidth / drawingCanvas.width;
        const scaleY = videoHeight / drawingCanvas.height;
        ctx.save();
        ctx.scale(scaleX, scaleY);
        ctx.drawImage(drawingCanvas, 0, 0);
        ctx.restore();
      }

      // 3. Draw pinned images
      for (const pin of pinnedImages) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Failed to load pinned image: ${pin.id}`));
          img.src = pin.src;
        });
        ctx.globalAlpha = pin.opacity;
        // Scale positions from display to video coordinates
        const displayScale = videoWidth / containerEl.clientWidth;
        ctx.drawImage(
          img,
          pin.x * displayScale,
          pin.y * displayScale,
          pin.width * displayScale,
          pin.height * displayScale
        );
        ctx.globalAlpha = 1.0;
      }

      // 4. Draw text annotations
      for (const node of textNodes) {
        const displayScale = videoWidth / containerEl.clientWidth;
        ctx.save();
        ctx.font = `${node.fontStyle} ${node.fontWeight} ${node.fontSize * displayScale}px ${node.fontFamily}`;
        
        // Draw background if set
        if (node.backgroundColor && node.backgroundColor !== 'transparent') {
          const metrics = ctx.measureText(node.content);
          const textHeight = node.fontSize * displayScale * 1.2;
          const padding = node.padding * displayScale;
          ctx.fillStyle = node.backgroundColor;
          ctx.fillRect(
            node.x * displayScale - padding,
            node.y * displayScale - textHeight + padding,
            metrics.width + padding * 2,
            textHeight + padding * 2
          );
        }

        ctx.fillStyle = node.color;
        ctx.fillText(node.content, node.x * displayScale, node.y * displayScale);
        ctx.restore();
      }

      // Export as PNG
      const dataUrl = compositeCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
      link.download = `video-canvas-screenshot-${timestamp}.png`;
      link.href = dataUrl;
      link.click();

      return dataUrl;
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
      throw error;
    }
  }, [pinnedImages, textNodes]);

  return { captureScreenshot };
}
