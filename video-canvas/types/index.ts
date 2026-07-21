// Re-export cosmic-canvas types we reuse
export type { Point, Stroke, Tool as CosmicTool, ShapeType, CanvasImage, TextNode, ActionItem, StrokeConfig } from '@cosmic/types';

// Video Canvas specific tool type (adds pan, pinImage to cosmic tools)
export type VideoTool = 'pen' | 'eraser' | 'select' | 'shape' | 'text' | 'lasso' | 'highlighter' | 'pan' | 'pinImage';

// Pinned image overlay (for hiding logos etc)
export interface PinnedImage {
  id: string;
  src: string;  // blob URL or data URL
  x: number;    // position relative to video viewport
  y: number;
  width: number;
  height: number;
  opacity: number;  // 0-1
  locked: boolean;  // if true, cannot be moved/resized
}

// Video metadata
export interface VideoMeta {
  name: string;
  duration: number;  // seconds
  width: number;     // display width
  height: number;    // display height
  naturalWidth: number;  // native video width
  naturalHeight: number; // native video height
  type: string;      // MIME type
}

// Video-specific action items for undo/redo
export type VideoActionItem =
  | { type: 'stroke'; data: import('@cosmic/types').Stroke }
  | { type: 'delete_strokes'; data: import('@cosmic/types').Stroke[] }
  | { type: 'image'; data: PinnedImage }
  | { type: 'delete_image'; data: PinnedImage }
  | { type: 'text'; data: import('@cosmic/types').TextNode }
  | { type: 'delete_text'; data: import('@cosmic/types').TextNode };
