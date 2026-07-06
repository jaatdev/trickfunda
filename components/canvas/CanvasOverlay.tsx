'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import getStroke from 'perfect-freehand';
import { Pen, Eraser, Trash2, X, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Basic path generator for perfect-freehand
function getSvgPathFromStroke(stroke: number[][]) {
  if (!stroke.length) return '';
  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ['M', ...stroke[0], 'Q']
  );
  d.push('Z');
  return d.join(' ');
}

type Point = { x: number; y: number; pressure: number };

type Stroke = {
  id: string;
  points: Point[];
  color: string;
  size: number;
  isEraser: boolean;
};

interface CanvasOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  questionIndex?: number;
}

export default function CanvasOverlay({ isOpen, onClose, questionIndex }: CanvasOverlayProps) {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState<string>('#ef4444');
  const [penSize, setPenSize] = useState<number>(4);
  const [eraserSize, setEraserSize] = useState<number>(20);
  const [showSettings, setShowSettings] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const staticCanvasRef = useRef<HTMLCanvasElement>(null);
  const activeCanvasRef = useRef<HTMLCanvasElement>(null);

  // Drawing state (bypassing React state for buttery smoothness)
  const isDrawing = useRef(false);
  const currentPoints = useRef<Point[]>([]);

  // Initialize and resize canvases
  useEffect(() => {
    if (!isOpen) return;
    
    const resizeCanvas = () => {
      const container = containerRef.current;
      const staticCanvas = staticCanvasRef.current;
      const activeCanvas = activeCanvasRef.current;
      
      if (!container || !staticCanvas || !activeCanvas) return;
      
      const { clientWidth, clientHeight } = container;
      const dpr = window.devicePixelRatio || 1;
      
      // Set physical pixels
      staticCanvas.width = clientWidth * dpr;
      staticCanvas.height = clientHeight * dpr;
      activeCanvas.width = clientWidth * dpr;
      activeCanvas.height = clientHeight * dpr;
      
      // Set logical CSS pixels
      staticCanvas.style.width = `${clientWidth}px`;
      staticCanvas.style.height = `${clientHeight}px`;
      activeCanvas.style.width = `${clientWidth}px`;
      activeCanvas.style.height = `${clientHeight}px`;
      
      // Scale context for DPI
      const staticCtx = staticCanvas.getContext('2d');
      const activeCtx = activeCanvas.getContext('2d');
      if (staticCtx) {
        staticCtx.setTransform(1, 0, 0, 1, 0, 0);
        staticCtx.scale(dpr, dpr);
      }
      if (activeCtx) {
        activeCtx.setTransform(1, 0, 0, 1, 0, 0);
        activeCtx.scale(dpr, dpr);
      }
      
      renderStaticLayer();
    };

    window.addEventListener('resize', resizeCanvas);
    // Slight delay to ensure layout is complete before sizing
    setTimeout(resizeCanvas, 0);
    
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [isOpen]); // Only re-run if isOpen changes

  // Disable body scroll when drawing
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Auto-clear on question change
  useEffect(() => {
    setStrokes([]);
  }, [questionIndex]);

  // Render static layer when strokes change
  const renderStaticLayer = useCallback(() => {
    const canvas = staticCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas based on physical bounds, but we are scaled, so we clear logical bounds
    // Let's just clear the whole transform bounding box by resetting transform temporarily
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    strokes.forEach(stroke => {
      if (stroke.points.length < 2) return;
      
      const input = stroke.points.map(p => [p.x, p.y, p.pressure]);
      const strokeData = getStroke(input, { size: stroke.size, thinning: 0.5, streamline: 0.5 });
      const pathData = getSvgPathFromStroke(strokeData);
      const path = new Path2D(pathData);
      
      ctx.globalCompositeOperation = stroke.isEraser ? 'destination-out' : 'source-over';
      ctx.fillStyle = stroke.isEraser ? 'rgba(0,0,0,1)' : stroke.color;
      ctx.fill(path);
    });
  }, [strokes]);

  useEffect(() => {
    if (isOpen) {
      renderStaticLayer();
    }
  }, [strokes, isOpen, renderStaticLayer]);

  const drawLiveSegment = (ctx: CanvasRenderingContext2D, points: Point[], isEraser: boolean, currentColor: string, currentSize: number) => {
    if (points.length < 2) return;
    
    // Clear active layer
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();

    // Use perfect-freehand for the live stroke as well, it's fast enough on canvas
    const input = points.map(p => [p.x, p.y, p.pressure]);
    const strokeData = getStroke(input, { size: currentSize, thinning: 0.5, streamline: 0.5 });
    const pathData = getSvgPathFromStroke(strokeData);
    const path = new Path2D(pathData);
    
    ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
    ctx.fillStyle = isEraser ? 'rgba(255, 255, 255, 0.5)' : currentColor; // Show a semi-transparent white/gray for eraser preview
    ctx.fill(path);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    
    (e.target as Element).setPointerCapture?.(e.pointerId);
    
    isDrawing.current = true;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pressure = e.pressure !== 0 ? e.pressure : 0.5;

    currentPoints.current = [{ x, y, pressure }];
    setShowSettings(false);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing.current) return;
    
    // Use requestAnimationFrame for buttery smooth coalescing if needed, 
    // but direct context drawing is usually fast enough.
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Fast coordinate extraction
    // Add multiple points if event coalescing is supported (Chrome/Edge)
    const newPoints: Point[] = [];
    const nativeEvent = e.nativeEvent as PointerEvent;
    if (nativeEvent.getCoalescedEvents) {
      const events = nativeEvent.getCoalescedEvents();
      for (const ev of events) {
        newPoints.push({
          x: ev.clientX - rect.left,
          y: ev.clientY - rect.top,
          pressure: ev.pressure !== 0 ? ev.pressure : 0.5
        });
      }
    } else {
      newPoints.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        pressure: e.pressure !== 0 ? e.pressure : 0.5
      });
    }

    currentPoints.current.push(...newPoints);

    // Draw to active canvas
    const activeCanvas = activeCanvasRef.current;
    if (activeCanvas) {
      const ctx = activeCanvas.getContext('2d');
      if (ctx) {
        requestAnimationFrame(() => {
          drawLiveSegment(
            ctx, 
            currentPoints.current, 
            tool === 'eraser', 
            color, 
            tool === 'eraser' ? eraserSize : penSize
          );
        });
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    if (currentPoints.current.length > 0) {
      const newStroke: Stroke = {
        id: Date.now().toString(),
        points: [...currentPoints.current],
        color,
        size: tool === 'eraser' ? eraserSize : penSize,
        isEraser: tool === 'eraser',
      };
      
      // Clear active canvas
      const activeCanvas = activeCanvasRef.current;
      if (activeCanvas) {
        const ctx = activeCanvas.getContext('2d');
        if (ctx) {
          ctx.save();
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, activeCanvas.width, activeCanvas.height);
          ctx.restore();
        }
      }

      // Add to React state which will trigger renderStaticLayer
      setStrokes((prev) => [...prev, newStroke]);
    }
    currentPoints.current = [];
  };

  const clearCanvas = () => setStrokes([]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col pointer-events-none">
      
      {/* Drawing Area */}
      <div 
        ref={containerRef}
        className="flex-1 w-full h-full pointer-events-auto touch-none relative"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Static Layer (Finished Strokes) */}
        <canvas 
          ref={staticCanvasRef} 
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
        
        {/* Active Layer (Live Stroke) */}
        <canvas 
          ref={activeCanvasRef} 
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
      </div>

      {/* Floating Toolbar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto">
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-4 w-64"
            >
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 font-medium mb-2 block flex justify-between">
                    <span>Pen Size</span>
                    <span>{penSize}px</span>
                  </label>
                  <input 
                    type="range" 
                    min="1" max="20" 
                    value={penSize} 
                    onChange={(e) => setPenSize(parseInt(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-medium mb-2 block flex justify-between">
                    <span>Eraser Size</span>
                    <span>{eraserSize}px</span>
                  </label>
                  <input 
                    type="range" 
                    min="5" max="100" 
                    value={eraserSize} 
                    onChange={(e) => setEraserSize(parseInt(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-medium mb-2 block">Custom Color</label>
                  <input 
                    type="color" 
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-8 rounded cursor-pointer border-none p-0 bg-transparent"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-2 p-2 bg-gray-900/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl"
        >
          {/* Colors */}
          <div className="flex gap-2 p-1 border-r border-white/10 pr-3">
            {[
              { id: '#ef4444', label: 'Red' },
              { id: '#3b82f6', label: 'Blue' },
              { id: '#eab308', label: 'Yellow' },
              { id: '#10b981', label: 'Green' },
              { id: '#ffffff', label: 'White' },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => { setTool('pen'); setColor(c.id); }}
                className={`w-8 h-8 rounded-full transition-transform ${tool === 'pen' && color === c.id ? 'scale-110 ring-2 ring-white/50' : 'hover:scale-105'}`}
                style={{ backgroundColor: c.id }}
                title={c.label}
              />
            ))}
          </div>

          {/* Tools */}
          <div className="flex gap-2 p-1 border-r border-white/10 pr-3 pl-1">
            <button
              onClick={() => setTool('pen')}
              className={`p-2 rounded-xl transition-colors ${tool === 'pen' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
              title="Pen"
            >
              <Pen className="w-5 h-5" />
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={`p-2 rounded-xl transition-colors ${tool === 'eraser' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
              title="Eraser"
            >
              <Eraser className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-xl transition-colors ${showSettings ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
              title="Settings"
            >
              <Settings2 className="w-5 h-5" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2 p-1 pl-1">
            <button
              onClick={clearCanvas}
              className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-white/10 transition-colors"
              title="Clear Canvas"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Close Canvas"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
