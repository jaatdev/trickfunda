'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useVideoStore } from '@video-canvas/store/useVideoStore';
import getStroke from 'perfect-freehand';
import { getSvgPathFromStroke } from '@cosmic/utils/ink';
import type { Point, Stroke } from '@cosmic/types';
import { getShapePoints } from '@cosmic/utils/geometry';

const getStrokeOptions = (size: number) => ({
    size,
    thinning: 0.5,
    smoothing: 0.5,
    streamline: 0.5,
    easing: (t: number) => t,
    start: { taper: 0, cap: true },
    end: { taper: size * 3, cap: true },
});

export default function DrawingCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const staticCanvasRef = useRef<HTMLCanvasElement>(null);
  const liveCanvasRef = useRef<HTMLCanvasElement>(null);

  const strokes = useVideoStore(s => s.strokes);
  const activeTool = useVideoStore(s => s.activeTool);
  const penColor = useVideoStore(s => s.penColor);
  const penWidth = useVideoStore(s => s.penWidth);
  const highlighterColor = useVideoStore(s => s.highlighterColor);
  const highlighterWidth = useVideoStore(s => s.highlighterWidth);
  const eraserWidth = useVideoStore(s => s.eraserWidth);
  const activeShape = useVideoStore(s => s.activeShape);
  const zoom = useVideoStore(s => s.zoom);
  const panX = useVideoStore(s => s.panX);
  const panY = useVideoStore(s => s.panY);
  const addStroke = useVideoStore(s => s.addStroke);
  const deleteStrokes = useVideoStore(s => s.deleteStrokes);
  const selectObject = useVideoStore(s => s.selectObject);

  const [isDrawing, setIsDrawing] = useState(false);
  const currentPoints = useRef<Point[]>([]);
  const startPoint = useRef<Point | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        const dpr = window.devicePixelRatio || 1;
        
        [staticCanvasRef.current, liveCanvasRef.current].forEach(canvas => {
          if (canvas) {
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.scale(dpr, dpr);
            }
          }
        });
        renderStatic();
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [strokes, zoom, panX, panY]);

  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = liveCanvasRef.current;
    if (!canvas) return { x: 0, y: 0, pressure: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    
    return {
      x: (screenX - panX) / zoom,
      y: (screenY - panY) / zoom,
      pressure: e.pressure !== 0 ? e.pressure : 0.5
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // If we click the canvas with a drawing tool, deselect any pinned image/text
    selectObject(null);

    if (activeTool === 'pan' || activeTool === 'select' || activeTool === 'pinImage') return;
    
    e.preventDefault(); 
    const point = getCanvasPoint(e);
    setIsDrawing(true);
    currentPoints.current = [point];
    startPoint.current = point;

    liveCanvasRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const point = getCanvasPoint(e);
    currentPoints.current.push(point);

    let tool = activeTool;
    if (e.buttons & 2) {
      tool = 'eraser';
    }

    if (tool === 'eraser') {
       const hits = strokes.filter(s => {
           return s.points.some(p => {
               const dx = p.x - point.x;
               const dy = p.y - point.y;
               return Math.sqrt(dx*dx + dy*dy) < eraserWidth / zoom;
           });
       });
       if (hits.length > 0) {
           deleteStrokes(hits.map(s => s.id));
       }
    } else {
        renderLive();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    let tool = activeTool;
    if (e.buttons & 2) {
      tool = 'eraser';
    }

    const points = currentPoints.current;

    if (points.length > 0) {
      if (tool === 'pen') {
        addStroke({ points, color: penColor, size: penWidth, isShape: false, isHighlighter: false } as any, false, false, false);
      } else if (tool === 'highlighter') {
        addStroke({ points, color: highlighterColor, size: highlighterWidth, isShape: false, isHighlighter: true } as any, false, false, true);
      } else if (tool === 'shape' && startPoint.current) {
        const endPoint = getCanvasPoint(e);
        const shapePoints = getShapePoints(activeShape as any, startPoint.current, endPoint, false);
        addStroke({ points: shapePoints, color: penColor, size: penWidth, isShape: true, isHighlighter: false } as any, false, true, false);
      }
    }

    currentPoints.current = [];
    startPoint.current = null;
    clearLive();
    renderStatic();
    
    liveCanvasRef.current?.releasePointerCapture(e.pointerId);
  };

  const clearLive = () => {
    const canvas = liveCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const renderLive = () => {
    const canvas = liveCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    let tool = activeTool;
    if (tool === 'eraser') return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(panX, panY);
    ctx.scale(zoom, zoom);
    
    const points = currentPoints.current;
    if (points.length === 0) {
        ctx.restore();
        return;
    }

    if (tool === 'pen' || tool === 'highlighter') {
      const size = tool === 'pen' ? penWidth : highlighterWidth;
      const color = tool === 'pen' ? penColor : highlighterColor;
      
      const strokePoints = getStroke(points as any, getStrokeOptions(size));
      const pathData = getSvgPathFromStroke(strokePoints as number[][]);
      
      const p = new Path2D(pathData);
      
      if (tool === 'highlighter') {
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.5;
          ctx.globalCompositeOperation = 'multiply';
      } else {
          ctx.fillStyle = color;
          ctx.globalAlpha = 1.0;
          ctx.globalCompositeOperation = 'source-over';
      }
      
      ctx.fill(p);
    } else if (tool === 'shape' && startPoint.current) {
      const endPoint = points[points.length - 1];
      const shapePoints = getShapePoints(activeShape as any, startPoint.current, endPoint, false);
      
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      if (shapePoints.length > 0) {
        ctx.moveTo(shapePoints[0].x, shapePoints[0].y);
        for (let i = 1; i < shapePoints.length; i++) {
          ctx.lineTo(shapePoints[i].x, shapePoints[i].y);
        }
      }
      ctx.stroke();
    }
    
    ctx.restore();
  };

  const renderStatic = () => {
    const canvas = staticCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(panX, panY);
    ctx.scale(zoom, zoom);
    
    strokes.forEach(stroke => {
      if (stroke.isShape) {
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = 'source-over';
        
        ctx.beginPath();
        if (stroke.points.length > 0) {
          ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
          for (let i = 1; i < stroke.points.length; i++) {
            ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
          }
        }
        ctx.stroke();
      } else {
        const strokePoints = getStroke(stroke.points as any, getStrokeOptions(stroke.size));
        const pathData = getSvgPathFromStroke(strokePoints as number[][]);
        const p = new Path2D(pathData);
        
        ctx.fillStyle = stroke.color;
        if (stroke.isHighlighter) {
            ctx.globalAlpha = 0.5;
            ctx.globalCompositeOperation = 'multiply';
        } else {
            ctx.globalAlpha = 1.0;
            ctx.globalCompositeOperation = 'source-over';
        }
        
        ctx.fill(p);
      }
    });
    
    ctx.restore();
  };

  useEffect(() => {
    renderStatic();
  }, [strokes, zoom, panX, panY]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 z-10 touch-none"
    >
      <canvas
        ref={staticCanvasRef}
        className="absolute inset-0 pointer-events-none"
      />
      <canvas
        ref={liveCanvasRef}
        className="absolute inset-0"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerOut={handlePointerUp}
      />
    </div>
  );
}
