import React from 'react';

export function pointerToVideoCoords(
  e: PointerEvent | React.PointerEvent,
  containerRect: DOMRect,
  zoom: number,
  panX: number,
  panY: number
): { x: number; y: number } {
  const { clientX, clientY } = e;
  
  // Calculate relative to container
  const relativeX = clientX - containerRect.left;
  const relativeY = clientY - containerRect.top;
  
  // Apply reverse zoom and pan
  const x = (relativeX - panX) / zoom;
  const y = (relativeY - panY) / zoom;
  
  return { x, y };
}

export function videoToScreenCoords(
  videoX: number,
  videoY: number,
  containerRect: DOMRect,
  zoom: number,
  panX: number,
  panY: number
): { x: number; y: number } {
  // Apply zoom and pan
  const relativeX = videoX * zoom + panX;
  const relativeY = videoY * zoom + panY;
  
  // Convert back to screen coordinates
  const x = relativeX + containerRect.left;
  const y = relativeY + containerRect.top;
  
  return { x, y };
}
