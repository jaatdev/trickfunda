'use client';

import { useRef, useEffect, useState, useCallback, RefObject, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useWindowDimensions } from '@cosmic/hooks/useWindowDimensions';
import getStroke from 'perfect-freehand';
import { getSvgPathFromStroke } from '@cosmic/utils/ink';
import { getShapePoints, doesStrokeIntersectSelection, doesTextIntersectSelection, doesStrokeTouchSelection, doesTextTouchSelection, getStrokesBoundingBox, isPointInBBox, catmullRomSpline, simplifyPoints } from '@cosmic/utils/geometry';
import { getPointerPosition } from '@cosmic/utils/canvasUtils';
import { useStore } from '@cosmic/store/useStore';
import { Point, Stroke, CanvasImage } from '@cosmic/types';
import { PAGE_HEIGHT, PAGE_WIDTH, PDF_PAGE_GAP } from '@cosmic/constants/canvas';
import BackgroundLayer from './BackgroundLayer';
import ObjectLayer from './ObjectLayer';
import TextLayer from './TextLayer';
import LassoLayer from './LassoLayer';
import WatermarkLayer from './WatermarkLayer';
import GridView from '../UI/GridView';
import { saveState } from '@cosmic/utils/storage';

// Beast Logic Imports
import { useImperativeRenderer } from '@cosmic/hooks/useImperativeRenderer';
import { calculateVelocity, getSimulatedPressure, Point as InkPoint } from '@cosmic/utils/InkPhysics'; // Alias InkPoint
import { stabilizePoint } from '@cosmic/utils/InkStabilizer';
import { compressStroke } from '@cosmic/utils/StrokeOptimizer';
import { findErasedStrokeIds } from '@cosmic/utils/EraserEngine';

// Dynamic import for PDFLayer to avoid SSR issues (DOMMatrix not available on server)
const PDFLayer = dynamic(() => import('./PDFLayer'), { ssr: false });

// perfect-freehand options for gel pen feel
const getStrokeOptions = (size: number) => ({
    size,
    thinning: 0.5,
    smoothing: 0.5,
    streamline: 0.5,
    easing: (t: number) => t,
    start: {
        taper: 0,
        cap: true,
    },
    end: {
        taper: size * 3,
        cap: true,
    },
});

// Smart Scale: Calculate dimensions to fit viewport (centered on current view)
const calculateSmartScale = (
    naturalWidth: number,
    naturalHeight: number,
    viewportWidth: number,
    viewportHeight: number,
    scrollY: number = 0
): { width: number; height: number; x: number; y: number } => {
    const maxWidth = Math.min(600, viewportWidth * 0.5);
    const maxHeight = viewportHeight * 0.6;

    const aspectRatio = naturalWidth / naturalHeight;

    let width = maxWidth;
    let height = width / aspectRatio;

    if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
    }

    // Horizontal center
    const x = (viewportWidth - width) / 2;
    // Vertical center of current viewport
    const y = scrollY + (viewportHeight - height) / 2;

    return { width, height, x, y };
};

// Generate unique ID
const generateId = () => `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Stage Component - Multi-Page Scrollable Canvas
 * 
 * Uses pageX/pageY for correct coordinates on scrolled pages.
 */
export default function Stage() {
    const staticLayerRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
    const activeLayerRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
    const containerRef = useRef<HTMLDivElement>(null);
    const { width, height, pixelRatio } = useWindowDimensions();

    // Zustand store
    const {
        strokes,
        images,
        textNodes,
        currentTool,
        penColor,
        penWidth,
        eraserWidth,
        pageCount,
        currentPage,
        zoom,
        activeShape,
        selectedStrokeIds,
        selectedTextIds,
        projectName,
        canvasBackground,
        canvasPattern,
        highlighterColor,
        highlighterWidth,
        canvasDimensions,
        lassoMode,
        addStroke,
        addImage,
        selectImage,
        selectStrokes,
        selectText,
        clearSelection,
        transformStrokes,
        clearStrokeSelection,
        setPageHeight,
        setCanvasDimensions,
        setZoom,
        loadProject,
        getPersistedState,
        undo,
        redo,
        setCurrentPage,
        deleteStrokes,
        isOverlayMode,
    } = useStore();

    // Dynamic page dimensions from store (or defaults)
    const pageWidth = canvasDimensions.width;
    const pageHeight = canvasDimensions.height;

    // Local drawing state
    const [isDrawing, setIsDrawing] = useState(false);
    const [isBarrelButtonDown, setIsBarrelButtonDown] = useState(false);
    const [isShiftHeld, setIsShiftHeld] = useState(false);
    const currentPointsRef = useRef<InkPoint[] | null>(null); // Use InkPoint (Has time)
    const shapeStartRef = useRef<{ x: number; y: number } | null>(null);

    // Beast Logic Refs
    const lastPointRef = useRef<InkPoint | null>(null);
    const lastStabilizedRef = useRef<InkPoint | null>(null);

    // Beast Logic Hooks
    // Cast ref to avoid strict null check issues with generic hook type
    const { renderStroke, clearCanvas: clearActiveLayer } = useImperativeRenderer(
        activeLayerRefs,
        pageHeight,
        PDF_PAGE_GAP
    );

    // Lasso selection state
    const [lassoPoints, setLassoPoints] = useState<Point[]>([]);
    const [isDraggingSelection, setIsDraggingSelection] = useState(false);
    const [activeHandle, setActiveHandle] = useState<string | null>(null); // 'tl', 'tr', 'bl', 'br', or null
    const [dragStart, setDragStart] = useState<{ x: number; y: number; bbox?: { minX: number; minY: number; maxX: number; maxY: number } } | null>(null);

    // Marching Ants Animation
    const dashOffsetRef = useRef(0);
    const marchingAntsRAFRef = useRef<number | null>(null);
    const [, setMarchingAntsTick] = useState(0);

    // Start/stop marching ants animation loop when lasso is drawing or has selection
    useEffect(() => {
        const shouldAnimate = (currentTool === 'lasso' && lassoPoints.length > 1) ||
            (currentTool === 'lasso' && (selectedStrokeIds.length > 0 || selectedTextIds.length > 0));

        if (shouldAnimate) {
            const animate = () => {
                dashOffsetRef.current = (dashOffsetRef.current + 0.5) % 20;
                // Trigger re-render which calls renderActiveLayer
                setMarchingAntsTick(t => t + 1);
                marchingAntsRAFRef.current = requestAnimationFrame(animate);
            };
            marchingAntsRAFRef.current = requestAnimationFrame(animate);
        } else {
            if (marchingAntsRAFRef.current) {
                cancelAnimationFrame(marchingAntsRAFRef.current);
                marchingAntsRAFRef.current = null;
            }
        }

        return () => {
            if (marchingAntsRAFRef.current) {
                cancelAnimationFrame(marchingAntsRAFRef.current);
                marchingAntsRAFRef.current = null;
            }
        };
    }, [currentTool, lassoPoints.length, selectedStrokeIds.length, selectedTextIds.length]);

    // Total canvas height (all pages + gaps) - uses dynamic page height
    // Each page has its height plus a gap after it (except the last page)
    const singlePageTotal = pageHeight + PDF_PAGE_GAP;
    const totalHeight = (pageHeight * pageCount) + (PDF_PAGE_GAP * (pageCount - 1));

    // Calculate visible page range for virtualization
    const RENDER_WINDOW = 2;
    const { minPage, maxPage } = useMemo(() => {
        return {
            minPage: Math.max(0, currentPage - 1 - RENDER_WINDOW),
            maxPage: Math.min(pageCount, currentPage + RENDER_WINDOW),
        };
    }, [currentPage, pageCount]);

    const visiblePages = useMemo(() => {
        const pages = [];
        for (let i = minPage; i < maxPage; i++) {
            pages.push(i);
        }
        return pages;
    }, [minPage, maxPage]);

    // IntersectionObserver Page Detection (Scroll Drift Fix)
    // Observes REAL page containers at 50% visibility threshold
    useEffect(() => {
        // Skip if Grid View is open
        if (useStore.getState().isGridView) return;

        const observer = new IntersectionObserver(
            (entries) => {
                // Find the most visible page (highest intersectionRatio)
                let maxRatio = 0;
                let visiblePageIndex = -1;

                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
                        maxRatio = entry.intersectionRatio;
                        const pageIndex = parseInt(entry.target.getAttribute('data-page-index') || '0', 10);
                        visiblePageIndex = pageIndex;
                    }
                });

                // Update state only if a valid page is detected and different from current
                if (visiblePageIndex >= 0) {
                    const newPage = visiblePageIndex + 1; // Convert 0-indexed to 1-indexed
                    const currentPage = useStore.getState().currentPage;
                    if (newPage !== currentPage) {
                        useStore.getState().setCurrentPage(newPage);
                    }
                }
            },
            {
                root: null, // viewport
                threshold: 0.5, // Trigger when 50% visible
            }
        );

        // Observe all page containers
        const pageElements = document.querySelectorAll('.canvas-page-container');
        pageElements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, [pageCount]);

    // Set page height on mount or when dimensions change (for export and other calculations)
    useEffect(() => {
        setPageHeight(pageHeight);
    }, [setPageHeight, pageHeight]);

    // DPI Lock: Enforce scaling on both canvases when dimensions change
    // This ensures the Active Layer context never loses its scale transform
    useEffect(() => {
        const dpr = window.devicePixelRatio || 1;
        const logicalWidth = pageWidth;
        const logicalHeight = pageHeight;

        // Setup Static Layer Canvases
        staticLayerRefs.current.forEach((canvas) => {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Set physical dimensions
                canvas.width = logicalWidth * dpr;
                canvas.height = logicalHeight * dpr;
                // Set CSS dimensions
                canvas.style.width = `${logicalWidth}px`;
                canvas.style.height = `${logicalHeight}px`;
                // Apply DPI scale
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.scale(dpr, dpr);
            }
        });

        // Setup Active Layer Canvases
        activeLayerRefs.current.forEach((canvas) => {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Set physical dimensions
                canvas.width = logicalWidth * dpr;
                canvas.height = logicalHeight * dpr;
                // Set CSS dimensions explicitly
                canvas.style.width = `${logicalWidth}px`;
                canvas.style.height = `${logicalHeight}px`;
                // CRITICAL: Apply DPI scale immediately
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.scale(dpr, dpr);
            }
        });
    }, [canvasDimensions, pageCount, pageWidth, pageHeight, visiblePages]);

    // THE MONITOR LOCK (Stable Slide Architecture)
    // Lock canvas dimensions to physical monitor size, use ZOOM to fit into window
    useEffect(() => {
        const initDimensions = () => {
            // If a PDF is loaded, it already set the exact PDF dimensions during upload!
            if (useStore.getState().documentId) return;

            // LOCK to the physical monitor size (e.g., 1920x1080)
            // This ensures "Fullscreen" is the Native 1:1 state
            const maxWidth = window.screen.width;
            const maxHeight = window.screen.height;

            useStore.getState().setCanvasDimensions(maxWidth, maxHeight);
        };

        const handleResize = () => {
            const { canvasDimensions } = useStore.getState();
            if (canvasDimensions.height === 0) return; // Not ready

            // Calculate Scale needed to fit the Big Canvas into the Small Window
            // We fit by Height to ensure "Single Page View" without scrolling
            const scaleHeight = window.innerHeight / canvasDimensions.height;
            const scaleWidth = window.innerWidth / canvasDimensions.width;

            // Use the smaller scale to ensure it fits entirely
            const newZoom = Math.min(scaleHeight, scaleWidth);

            useStore.getState().setZoom(newZoom);
        };

        // Initial: Lock dimensions first, then calculate zoom
        initDimensions();
        handleResize();

        // Listen for Resize (zoom adjusts, dimensions stay locked)
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Hydration: Load saved project on mount
    useEffect(() => {
        loadProject();
    }, [loadProject]);

    // Auto-save: Debounced save whenever content changes
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const state = getPersistedState();
            // Only save if there's actual content
            if (state.strokes.length > 0 || state.images.length > 0 || state.textNodes.length > 0) {
                saveState(state);
            }
        }, 1000); // 1 second debounce

        return () => clearTimeout(timeoutId);
    }, [strokes, images, textNodes, pageCount, projectName, canvasBackground, canvasPattern, penColor, penWidth, getPersistedState]);

    // Get current stroke settings based on tool
    const getCurrentStrokeSettings = useCallback(() => {
        if (currentTool === 'eraser') {
            return { color: '#000000', size: eraserWidth, isEraser: true, isHighlighter: false };
        }
        if (currentTool === 'highlighter') {
            return { color: highlighterColor, size: highlighterWidth, isEraser: false, isHighlighter: true };
        }
        return { color: penColor, size: penWidth, isEraser: false, isHighlighter: false };
    }, [currentTool, penColor, penWidth, eraserWidth, highlighterColor, highlighterWidth]);

    // Draw a single stroke to a canvas context
    const drawStroke = useCallback((
        ctx: CanvasRenderingContext2D,
        stroke: Pick<Stroke, 'points' | 'color' | 'size' | 'isEraser'> & { isShape?: boolean; isHighlighter?: boolean; opacity?: number }
    ) => {
        if (stroke.points.length < 2) return;

        // Apply opacity (default 1.0)
        const strokeOpacity = stroke.opacity ?? 1.0;

        // Save context state for highlighter
        const wasHighlighter = stroke.isHighlighter;
        if (wasHighlighter) {
            ctx.globalAlpha = 0.5 * strokeOpacity;
        } else if (strokeOpacity < 1.0) {
            ctx.globalAlpha = strokeOpacity;
        }

        if (stroke.isEraser) {
            ctx.globalCompositeOperation = 'destination-out';
        } else {
            ctx.globalCompositeOperation = 'source-over';
        }

        // Shape strokes: render with clean geometric lines
        if (stroke.isShape) {
            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = stroke.size;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.beginPath();
            ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
            for (let i = 1; i < stroke.points.length; i++) {
                ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
            }
            ctx.stroke();
            if (wasHighlighter || strokeOpacity < 1.0) ctx.globalAlpha = 1.0;
            return;
        }

        // Highlighter strokes: use butt lineCap for chisel tip feel
        if (wasHighlighter) {
            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = stroke.size;
            ctx.lineCap = 'butt';
            ctx.lineJoin = 'round';

            ctx.beginPath();
            ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
            for (let i = 1; i < stroke.points.length; i++) {
                ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
            }
            ctx.stroke();
            ctx.globalAlpha = 1.0;
            ctx.lineCap = 'round';
            return;
        }

        // Freehand strokes: use perfect-freehand for natural feel
        const inputPoints = stroke.points.map(p => [p.x, p.y, p.pressure]);
        const strokeOutline = getStroke(inputPoints, getStrokeOptions(stroke.size));
        const pathData = getSvgPathFromStroke(strokeOutline);
        const path = new Path2D(pathData);

        ctx.fillStyle = stroke.isEraser ? '#000000' : stroke.color;
        ctx.fill(path);

        // Reset opacity
        if (strokeOpacity < 1.0) ctx.globalAlpha = 1.0;
    }, []);

    /**
     * Draw live stroke segment with Quadratic Bezier smoothing (O(1) per frame)
     * Creates buttery-smooth curves instead of jagged lineTo segments
     */
    const drawLiveSegment = useCallback((
        ctx: CanvasRenderingContext2D,
        points: Point[],
        fromIndex: number,
        color: string,
        size: number,
        isEraser: boolean,
        isHighlighter: boolean
    ) => {
        if (points.length < 2) return;

        // Set drawing properties
        ctx.strokeStyle = isEraser ? '#000000' : color;
        ctx.lineWidth = size;
        ctx.lineCap = isHighlighter ? 'butt' : 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = isHighlighter ? 0.5 : 1.0;
        ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';

        ctx.beginPath();

        // For initial segment, just draw a line
        if (fromIndex === 0 && points.length >= 2) {
            ctx.moveTo(points[0].x, points[0].y);
            const midX = (points[0].x + points[1].x) / 2;
            const midY = (points[0].y + points[1].y) / 2;
            ctx.lineTo(midX, midY);
            ctx.stroke();
            return;
        }

        // Bezier smoothing: draw curve from previous segment to new point
        // We need at least 3 points for smooth curves
        const startIdx = Math.max(0, fromIndex - 1);
        const p0 = points[startIdx];
        const p1 = points[startIdx + 1];
        const p2 = points[startIdx + 2] || p1;

        // Calculate midpoints for smooth connection
        const mid0X = (p0.x + p1.x) / 2;
        const mid0Y = (p0.y + p1.y) / 2;
        const mid1X = (p1.x + p2.x) / 2;
        const mid1Y = (p1.y + p2.y) / 2;

        // Draw quadratic curve through the control point
        ctx.moveTo(mid0X, mid0Y);
        ctx.quadraticCurveTo(p1.x, p1.y, mid1X, mid1Y);
        ctx.stroke();

        // Reset state
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = 'source-over';
    }, []);

    // Setup canvas with High-DPI scaling - MUST update on pageCount change
    const setupCanvas = useCallback((canvas: HTMLCanvasElement | null, forceRedraw: boolean = false) => {
        if (!canvas || totalHeight === 0) return null;

        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // Only resize if dimensions changed (resizing clears canvas)
        const targetWidth = PAGE_WIDTH * pixelRatio;
        const targetHeight = totalHeight * pixelRatio;

        if (canvas.width !== targetWidth || canvas.height !== targetHeight || forceRedraw) {
            canvas.width = targetWidth;
            canvas.height = targetHeight;
        }

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(pixelRatio, pixelRatio);

        return ctx;
    }, [totalHeight, pixelRatio]);

    // Render static layer (stroke history)
    const renderStaticLayer = useCallback(() => {
        visiblePages.forEach(pageIndex => {
            const canvas = staticLayerRefs.current.get(pageIndex);
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Resize canvas if needed
            const targetWidth = pageWidth * pixelRatio;
            const targetHeight = pageHeight * pixelRatio;

            if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                canvas.style.width = `${pageWidth}px`;
                canvas.style.height = `${pageHeight}px`;
            }

            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(pixelRatio, pixelRatio);
            ctx.clearRect(0, 0, pageWidth, pageHeight);

            // Translate ctx for page offset so world coordinates draw correctly on this chunk
            const pageTop = pageIndex * (pageHeight + PDF_PAGE_GAP);
            ctx.translate(0, -pageTop);

            // Draw all strokes
            strokes.forEach((stroke) => drawStroke(ctx, stroke));
            ctx.globalCompositeOperation = 'source-over';
        });
    }, [visiblePages, pixelRatio, strokes, drawStroke, pageWidth, pageHeight]);

    // Render active layer (current stroke or shape preview)
    // Account for barrel button override for visual feedback
    // NUCLEAR DPI FIX: Force setTransform every frame to prevent scale corruption
    const renderActiveLayer = useCallback(() => {
        const dpr = window.devicePixelRatio || 1;

        visiblePages.forEach(pageIndex => {
            const canvas = activeLayerRefs.current.get(pageIndex);
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Resize canvas if needed (sets physical pixels)
            const targetWidth = pageWidth * dpr;
            const targetHeight = pageHeight * dpr;

            if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                // Set CSS dimensions explicitly
                canvas.style.width = `${pageWidth}px`;
                canvas.style.height = `${pageHeight}px`;
            }

            // NUCLEAR FIX: Force scale matrix immediately before drawing
            // This ensures even if canvas resized between frames, we draw at HiDPI
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            // Clear using logical dimensions (setTransform handles the scaling)
            ctx.clearRect(0, 0, pageWidth, pageHeight);

            // Translate for page offset
            const pageTop = pageIndex * (pageHeight + PDF_PAGE_GAP);
            ctx.translate(0, -pageTop);

        // Shape tool rendering - draw geometric shapes with crisp lines
        if (currentTool === 'shape' && shapeStartRef.current && currentPointsRef.current && currentPointsRef.current.length > 0) {
            const start = shapeStartRef.current;
            const end = currentPointsRef.current[currentPointsRef.current.length - 1];
            const shapePoints = getShapePoints(activeShape, start, end, isShiftHeld);

            if (shapePoints.length >= 2) {
                ctx.strokeStyle = penColor;
                ctx.lineWidth = penWidth;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                ctx.beginPath();
                ctx.moveTo(shapePoints[0].x, shapePoints[0].y);
                for (let i = 1; i < shapePoints.length; i++) {
                    ctx.lineTo(shapePoints[i].x, shapePoints[i].y);
                }
                ctx.stroke();
            }
            return;
        }

        // Freehand stroke rendering (pen/eraser)
        const currentPoints = currentPointsRef.current;
        if (currentPoints && currentPoints.length >= 2) {
            // Check barrel button state to override eraser mode
            const settings = getCurrentStrokeSettings();
            const effectiveIsEraser = isBarrelButtonDown || settings.isEraser;

            if (effectiveIsEraser) {
                ctx.globalCompositeOperation = 'destination-out';
            } else {
                ctx.globalCompositeOperation = 'source-over';
            }

            drawStroke(ctx, {
                points: currentPoints,
                color: effectiveIsEraser ? '#000000' : settings.color,
                size: effectiveIsEraser ? eraserWidth : settings.size,
                isEraser: effectiveIsEraser,
            });

            ctx.globalCompositeOperation = 'source-over';
        }

        // Lasso path rendering: Smooth dotted line (Pencil-like dashed path)
        if (currentTool === 'lasso' && lassoPoints.length > 1) {
            // Simplify + smooth the lasso path for a natural draw feel
            const simplified = simplifyPoints(lassoPoints, 2);
            const smoothed = simplified.length >= 3 ? catmullRomSpline(simplified, 6, 0.5) : simplified;

            // Solid white background line for contrast (thin)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.setLineDash([]);

            ctx.beginPath();
            ctx.moveTo(smoothed[0].x, smoothed[0].y);
            for (let i = 1; i < smoothed.length; i++) {
                ctx.lineTo(smoothed[i].x, smoothed[i].y);
            }
            ctx.stroke();

            // Animated marching ants (dark dashes moving over white, giving a dotted 'vibe')
            ctx.strokeStyle = '#1a1a2e';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.lineDashOffset = -dashOffsetRef.current;

            ctx.beginPath();
            ctx.moveTo(smoothed[0].x, smoothed[0].y);
            for (let i = 1; i < smoothed.length; i++) {
                ctx.lineTo(smoothed[i].x, smoothed[i].y);
            }
            // Close the path for filling
            ctx.closePath();
            
            // Fill the area with a translucent blue to make it highly visible
            ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
            ctx.fill();
            
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.lineDashOffset = 0;
        }

        // Selection bounding box rendering - animated marching ants
        if (selectedStrokeIds.length > 0 && currentTool === 'lasso') {
            const selectedStrokes = strokes.filter(s => selectedStrokeIds.includes(s.id));
            const bbox = getStrokesBoundingBox(selectedStrokes);

            // Layer 1: Subtle white background rect for contrast
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.setLineDash([]);
            ctx.strokeRect(bbox.minX, bbox.minY, bbox.width, bbox.height);

            // Layer 2: Marching ants bounding box
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            ctx.lineDashOffset = -dashOffsetRef.current;
            ctx.strokeRect(bbox.minX, bbox.minY, bbox.width, bbox.height);
            ctx.setLineDash([]);
            ctx.lineDashOffset = 0;

            // Draw corner handles
            const handleSize = 8;
            const handles = [
                { x: bbox.minX, y: bbox.minY }, // Top-left
                { x: bbox.maxX, y: bbox.minY }, // Top-right
                { x: bbox.minX, y: bbox.maxY }, // Bottom-left
                { x: bbox.maxX, y: bbox.maxY }, // Bottom-right
            ];

            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 2;

            handles.forEach(handle => {
                ctx.beginPath();
                ctx.arc(handle.x, handle.y, handleSize, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            });
        }
        });
    }, [visiblePages, pageHeight, pageWidth, getCurrentStrokeSettings, drawStroke, isBarrelButtonDown, eraserWidth, currentTool, activeShape, penColor, penWidth, isShiftHeld, lassoPoints, selectedStrokeIds, strokes]);

    // Re-render static layer when stroke history or page count changes
    useEffect(() => {
        renderStaticLayer();
    }, [strokes, pageCount, renderStaticLayer]);

    // Process image blob and add to canvas - centers on current page
    const processImageBlob = useCallback((blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const img = new Image();

        img.onload = () => {
            // 1. Get Dynamic Dimensions (The actual screen size captured in Step 41)
            const { currentPage, canvasDimensions, addImage } = useStore.getState();

            // 2. Smart Scaling (Max 50% of screen width)
            const maxW = canvasDimensions.width * 0.5;
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            let width = img.naturalWidth;
            let height = img.naturalHeight;

            if (width > maxW) {
                width = maxW;
                height = maxW / aspectRatio;
            }

            // 3. DYNAMIC CENTER X
            // Use canvasDimensions.width, NOT the A4 constant
            const x = (canvasDimensions.width / 2) - (width / 2);

            // 4. DYNAMIC CENTER Y
            // Use canvasDimensions.height
            const gap = PDF_PAGE_GAP;
            const singlePageHeight = canvasDimensions.height + gap;
            const pageTop = (currentPage - 1) * singlePageHeight;

            const y = pageTop + (canvasDimensions.height / 2) - (height / 2);

            const canvasImage: CanvasImage = {
                id: generateId(),
                url,
                x,
                y,
                width,
                height,
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight,
            };

            addImage(canvasImage);
        };

        img.src = url;
    }, []);

    // Paste event handler (The Clipboard Arbiter)
    useEffect(() => {
        const handlePaste = async (e: ClipboardEvent) => {
            // 1. PRIORITY CHECK: OS CLIPBOARD
            const items = e.clipboardData?.items;
            let osImageFound = false;

            if (items) {
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    if (item.type.indexOf('image') !== -1) {
                        // FOUND SNIPPET!
                        e.preventDefault(); // Stop browser default
                        osImageFound = true;

                        const blob = item.getAsFile();
                        if (!blob) return;

                        const url = URL.createObjectURL(blob);
                        const img = new Image();
                        img.src = url;

                        img.onload = () => {
                            // --- GET FRESH STATE ---
                            const { canvasDimensions, addImage, zoom } = useStore.getState();
                            const scrollTop = window.scrollY;
                            const clientHeight = window.innerHeight;

                            // --- SMART SCALING ---
                            const aspectRatio = img.naturalWidth / img.naturalHeight;
                            let width = img.naturalWidth;
                            let height = img.naturalHeight;
                            if (width > 600) {
                                width = 600;
                                height = 600 / aspectRatio;
                            }

                            // --- VIEWPORT ANCHOR LOGIC ---
                            // X: Center of Paper
                            const x = (canvasDimensions.width / 2) - (width / 2);

                            // Y: Center of VISIBLE SCREEN (Accounting for Zoom)
                            // Convert ScrollTop to Physics Units first
                            const scrollYPhysics = scrollTop / zoom;
                            const viewportHeightPhysics = clientHeight / zoom;

                            const y = scrollYPhysics + (viewportHeightPhysics / 2) - (height / 2);

                            // --- ADD TO UNIVERSE ---
                            addImage({
                                id: crypto.randomUUID(),
                                url,
                                x,
                                y,
                                width,
                                height,
                                naturalWidth: img.naturalWidth,
                                naturalHeight: img.naturalHeight,
                            });
                        };

                        // CRITICAL: Exit the function. Do not check internal clipboard.
                        return;
                    }
                }
            }

            // 2. FALLBACK: INTERNAL CLIPBOARD
            // Only runs if NO OS image was found in the loop above
            if (!osImageFound) {
                const { clipboard, pasteImage } = useStore.getState();
                if (clipboard) {
                    e.preventDefault();
                    pasteImage(); // Paste the internal object
                }
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, []);

    // Custom Smooth Keyboard Scrolling
    useEffect(() => {
        const handleSmoothScrollBy = (distance: number) => {
            // Use the browser's native, hardware-accelerated smooth scrolling.
            // This is instantly responsive, ultra-smooth, and feels premium without any artificial lag.
            window.scrollBy({
                top: distance,
                behavior: 'smooth'
            });
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if focus is in an input field
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            let distance = 0;
            // 25% of the viewport height for arrow keys
            const scrollStep = window.innerHeight * 0.25;
            // 80% for page keys
            const pageStep = window.innerHeight * 0.8;

            if (e.key === 'ArrowUp') distance = -scrollStep;
            else if (e.key === 'ArrowDown') distance = scrollStep;
            else if (e.key === 'PageUp') distance = -pageStep;
            else if (e.key === 'PageDown') distance = pageStep;
            else return;

            e.preventDefault();
            handleSmoothScrollBy(distance);
        };

        // We only intercept keyboard for custom slow scrolling.
        // We let the mouse wheel behave natively so trackpad momentum works perfectly.
        window.addEventListener('keydown', handleKeyDown, { passive: false });
        
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // NOTE: Page tracking is now handled by IntersectionObserver (line 143)
    // This removes the dual-handler bug that caused scroll drift

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isCtrlOrCmd = e.ctrlKey || e.metaKey;

            if (isCtrlOrCmd && e.key.toLowerCase() === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
            }

            if (isCtrlOrCmd && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
                e.preventDefault();
                redo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    // Pointer Down - Start drawing or deselect
    // Uses pageX/pageY for document-relative coordinates
    // IRON PALM: Only allow pen and mouse, reject all touch input
    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        // Strict palm rejection: only allow 'pen' or 'mouse', reject 'touch'
        if (e.pointerType !== 'pen' && e.pointerType !== 'mouse') return;

        // Get canvas-relative coordinates using unified calculator
        const { x, y } = getPointerPosition(e, containerRef.current, zoom);

        // Lasso mode: Check for handle or bbox interaction
        if (currentTool === 'lasso' && selectedStrokeIds.length > 0) {
            const selectedStrokes = strokes.filter(s => selectedStrokeIds.includes(s.id));
            const bbox = getStrokesBoundingBox(selectedStrokes);

            // Check if clicking on a resize handle (8px radius)
            const handleSize = 8;
            const handles = [
                { id: 'tl', x: bbox.minX, y: bbox.minY },
                { id: 'tr', x: bbox.maxX, y: bbox.minY },
                { id: 'bl', x: bbox.minX, y: bbox.maxY },
                { id: 'br', x: bbox.maxX, y: bbox.maxY },
            ];

            for (const handle of handles) {
                const dist = Math.sqrt((x - handle.x) ** 2 + (y - handle.y) ** 2);
                if (dist <= handleSize) {
                    // Start resizing from this handle
                    setActiveHandle(handle.id);
                    setDragStart({ x, y, bbox });
                    (e.target as HTMLElement).setPointerCapture(e.pointerId);
                    return;
                }
            }

            if (isPointInBBox({ x, y, pressure: 0.5 }, bbox)) {
                // Start dragging selection
                setIsDraggingSelection(true);
                setDragStart({ x, y });
                (e.target as HTMLElement).setPointerCapture(e.pointerId);
                return;
            } else {
                // Clicked outside - commit and clear selection
                clearStrokeSelection();
            }
        }

        // In select mode, clicking empty canvas deselects image
        if (currentTool === 'select') {
            selectImage(null);
            return;
        }

        // Lasso mode: Start drawing lasso loop
        if (currentTool === 'lasso') {
            setLassoPoints([{ x, y, pressure: 0.5 }]);
            setIsDrawing(true);
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            return;
        }

        // Smart Button Logic: Check if barrel button (right-click/side button) is pressed
        // Bitmask: button 2 = right-click or pen barrel button
        const isSideButton = (e.buttons & 2) === 2;
        setIsBarrelButtonDown(isSideButton);

        // Track Shift key state
        setIsShiftHeld(e.shiftKey);

        (e.target as HTMLElement).setPointerCapture(e.pointerId);

        // For shape tool, record start point
        if (currentTool === 'shape') {
            shapeStartRef.current = { x, y };
        }

        // Reset Beast Logic Refs
        lastPointRef.current = null;
        lastStabilizedRef.current = null;

        // Clear active canvas for fresh stroke
        clearActiveLayer();

        // Initial Point Processing
        // 1. Stabilize (Step 5) - First point returns itself (but setup history)
        const rawPoint = { x, y, pressure: e.pressure || 0.5, time: Date.now() };
        const stabilized = stabilizePoint(rawPoint, null, 0.5);
        lastStabilizedRef.current = stabilized;

        // 2. Physics (Step 2) - Initial point has no velocity, use default pressure
        const finalPoint = { ...stabilized, pressure: rawPoint.pressure };
        lastPointRef.current = finalPoint;

        currentPointsRef.current = [finalPoint];

        // 3. Render Initial Dot (Step 4)
        const settings = getCurrentStrokeSettings();
        const effectiveIsEraser = isSideButton || settings.isEraser; // Check side button for eraser toggle

        renderStroke(currentPointsRef.current, {
            color: effectiveIsEraser ? '#000000' : settings.color,
            size: effectiveIsEraser ? eraserWidth : settings.size,
            isEraser: effectiveIsEraser,
            isHighlighter: settings.isHighlighter
        });

        setIsDrawing(true);
    }, [currentTool, selectImage, zoom, selectedStrokeIds, strokes, clearStrokeSelection, clearActiveLayer, getCurrentStrokeSettings, eraserWidth, renderStroke]);

    // Pointer Move - Continue drawing
    // IRON PALM: Strict filtering for pen/mouse only
    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        // Strict palm rejection: only allow 'pen' or 'mouse', reject 'touch'
        if (e.pointerType !== 'pen' && e.pointerType !== 'mouse') return;

        // Get canvas-relative coordinates using unified calculator
        const { x, y } = getPointerPosition(e, containerRef.current, zoom);

        // Handle resizing via corner handles
        if (activeHandle && dragStart && dragStart.bbox) {
            const originalBbox = dragStart.bbox;
            let newBbox = { ...originalBbox };

            // Update bbox based on which handle is being dragged
            switch (activeHandle) {
                case 'tl': // Top-left
                    newBbox.minX = x;
                    newBbox.minY = y;
                    break;
                case 'tr': // Top-right
                    newBbox.maxX = x;
                    newBbox.minY = y;
                    break;
                case 'bl': // Bottom-left
                    newBbox.minX = x;
                    newBbox.maxY = y;
                    break;
                case 'br': // Bottom-right
                    newBbox.maxX = x;
                    newBbox.maxY = y;
                    break;
            }

            // Calculate scale factors
            const scaleX = (newBbox.maxX - newBbox.minX) / (originalBbox.maxX - originalBbox.minX);
            const scaleY = (newBbox.maxY - newBbox.minY) / (originalBbox.maxY - originalBbox.minY);

            // Calculate translation (movement of the opposite corner)
            let dx = 0, dy = 0;
            switch (activeHandle) {
                case 'tl': // Top-left: opposite is bottom-right
                    dx = newBbox.minX - originalBbox.minX;
                    dy = newBbox.minY - originalBbox.minY;
                    break;
                case 'tr': // Top-right: opposite is bottom-left
                    dx = newBbox.maxX - originalBbox.maxX;
                    dy = newBbox.minY - originalBbox.minY;
                    break;
                case 'bl': // Bottom-left: opposite is top-right
                    dx = newBbox.minX - originalBbox.minX;
                    dy = newBbox.maxY - originalBbox.maxY;
                    break;
                case 'br': // Bottom-right: opposite is top-left
                    dx = newBbox.maxX - originalBbox.maxX;
                    dy = newBbox.maxY - originalBbox.maxY;
                    break;
            }

            // Determine the origin point (opposite corner from the handle)
            let origin = { x: 0, y: 0 };
            switch (activeHandle) {
                case 'tl': origin = { x: originalBbox.maxX, y: originalBbox.maxY }; break;
                case 'tr': origin = { x: originalBbox.minX, y: originalBbox.maxY }; break;
                case 'bl': origin = { x: originalBbox.maxX, y: originalBbox.minY }; break;
                case 'br': origin = { x: originalBbox.minX, y: originalBbox.minY }; break;
            }

            // Apply transformation
            transformStrokes(0, 0, scaleX, scaleY, origin);
            setDragStart({ ...dragStart, bbox: newBbox });
            renderActiveLayer();
            return;
        }

        // Handle dragging selected strokes
        if (isDraggingSelection && dragStart) {
            const dx = x - dragStart.x;
            const dy = y - dragStart.y;
            transformStrokes(dx, dy);
            setDragStart({ x, y });
            return;
        }

        // Handle lasso drawing - with distance-based downsampling
        if (currentTool === 'lasso' && isDrawing) {
            // Only add point if it's at least 3px from the last point (reduces noise)
            const lastPoint = lassoPoints[lassoPoints.length - 1];
            const dist = lastPoint ? Math.sqrt((x - lastPoint.x) ** 2 + (y - lastPoint.y) ** 2) : Infinity;
            if (dist >= 3) {
                setLassoPoints(prev => [...prev, { x, y, pressure: 0.5 }]);
            }
            renderActiveLayer();
            return;
        }

        if (!isDrawing) return;

        // Continue tracking barrel button state during stroke
        const isSideButton = (e.buttons & 2) === 2;
        if (isSideButton !== isBarrelButtonDown) {
            setIsBarrelButtonDown(isSideButton);
        }

        // Track Shift key state for shape constraints
        if (e.shiftKey !== isShiftHeld) {
            setIsShiftHeld(e.shiftKey);
        }

        if (currentPointsRef.current) {
            if (currentTool === 'shape') {
                // SHAPE LOGIC
                const currentStartCoords = currentPointsRef.current[0];
                currentPointsRef.current = [currentStartCoords, { x, y, pressure: e.pressure || 0.5, time: Date.now() }];

                clearActiveLayer();
                
                // Draw a direct line on the current active canvases
                // We should use renderStroke from useImperativeRenderer
                renderStroke([{ x, y, pressure: 0.5, time: Date.now() }], {
                    color: penColor,
                    size: penWidth
                });
            } else if (currentTool === 'eraser' && isBarrelButtonDown === false) { // Explicit Eraser Tool (Object Eraser)
                // Note: If using Barrel Button (Temporary Eraser), we might want Pixel Eraser behavior or Object Eraser.
                // Requirement: "The Upgrade (Vector/Object Eraser)... You touch a stroke anywhere, and the entire stroke vanishes."
                // We apply this for the standard 'eraser' tool.

                const eraserPoint = { x, y, pressure: e.pressure || 0.5 };

                // 1. Detect Hits
                // Use current store state for strokes (Static Layer)
                const hitIds = findErasedStrokeIds(strokes, [eraserPoint], eraserWidth);

                if (hitIds.length > 0) {
                    console.log("Hit Strokes:", hitIds);
                    // 2. Delete Strokes
                    deleteStrokes(hitIds);
                }

                // 3. Visual Trail (Optional - Render a clearing dot)
                // We can render a cursor trail on active layer so user knows where they are
                renderStroke([{ ...eraserPoint, time: Date.now() } as any], { // Cast to any for InkPoint type
                    color: '#000000',
                    size: eraserWidth,
                    isEraser: true
                });

            } else {
                // BEAST LOGIC
                const coalescedEvents = e.nativeEvent.getCoalescedEvents?.() || [e.nativeEvent];
                const settings = getCurrentStrokeSettings();
                const effectiveIsEraser = isBarrelButtonDown || settings.isEraser;

                for (const event of coalescedEvents) {
                    const coalescedPos = getPointerPosition(
                        { clientX: event.clientX, clientY: event.clientY } as React.PointerEvent,
                        containerRef.current,
                        zoom
                    );

                    const rawP = {
                        x: coalescedPos.x,
                        y: coalescedPos.y,
                        pressure: event.pressure || 0.5,
                        time: Date.now()
                    };

                    const stabilized = stabilizePoint(rawP, lastStabilizedRef.current, 0.5);
                    lastStabilizedRef.current = stabilized;

                    const prev = lastPointRef.current;
                    const velocity = prev ? calculateVelocity(prev, stabilized) : 0;
                    const isMouse = e.pointerType === 'mouse';
                    const simPressure = getSimulatedPressure(velocity, rawP.pressure, isMouse);

                    const finalPoint = { ...stabilized, pressure: simPressure };
                    lastPointRef.current = finalPoint;

                    currentPointsRef.current.push(finalPoint);
                }

                renderStroke(currentPointsRef.current, {
                    color: effectiveIsEraser ? '#000000' : settings.color,
                    size: effectiveIsEraser ? eraserWidth : settings.size,
                    isEraser: effectiveIsEraser,
                    isHighlighter: settings.isHighlighter
                });
            }
        }
    }, [isDrawing, isBarrelButtonDown, isShiftHeld, renderStroke, clearActiveLayer, zoom, currentTool, isDraggingSelection, dragStart, transformStrokes, activeHandle, getCurrentStrokeSettings, eraserWidth]);

    // Pointer Up - End drawing and save stroke
    // IRON PALM: Strict filtering for pen/mouse only
    const handlePointerUp = useCallback((e: React.PointerEvent) => {
        // Strict palm rejection: only allow 'pen' or 'mouse', reject 'touch'
        if (e.pointerType !== 'pen' && e.pointerType !== 'mouse') return;

        (e.target as HTMLElement).releasePointerCapture(e.pointerId);

        // Handle end of selection drag or resize
        if (isDraggingSelection || activeHandle) {
            setIsDraggingSelection(false);
            setActiveHandle(null);
            setDragStart(null);
            return;
        }

        // Lasso tool: Process selection
        if (currentTool === 'lasso' && lassoPoints.length > 2) {
            // ALWAYS use the drawing as a loop to select things inside it
            const poly = [...lassoPoints, lassoPoints[0]];

            // Find strokes that intersect with the lasso polygon
            let lassoSelectedStrokeIds = strokes
                .filter(stroke => doesStrokeIntersectSelection(stroke.points, poly))
                .map(s => s.id);

            // Find text nodes that intersect with the lasso polygon
            let lassoSelectedTextIds = textNodes
                .filter(node => doesTextIntersectSelection(node, poly))
                .map(t => t.id);

            // Group expansion: auto-select all items sharing the same groupId
            const selectedGroupIds = new Set<string>();
            strokes.filter(s => lassoSelectedStrokeIds.includes(s.id) && s.groupId).forEach(s => selectedGroupIds.add(s.groupId!));
            textNodes.filter(t => lassoSelectedTextIds.includes(t.id) && t.groupId).forEach(t => selectedGroupIds.add(t.groupId!));

            if (selectedGroupIds.size > 0) {
                strokes.forEach(s => {
                    if (s.groupId && selectedGroupIds.has(s.groupId) && !lassoSelectedStrokeIds.includes(s.id)) {
                        lassoSelectedStrokeIds.push(s.id);
                    }
                });
                textNodes.forEach(t => {
                    if (t.groupId && selectedGroupIds.has(t.groupId) && !lassoSelectedTextIds.includes(t.id)) {
                        lassoSelectedTextIds.push(t.id);
                    }
                });
            }

            selectStrokes(lassoSelectedStrokeIds);
            selectText(lassoSelectedTextIds);
            setLassoPoints([]);
            setIsDrawing(false);

            // Clear active layer
            clearActiveLayer();
            return;
        }

        // Shape tool: commit shape as stroke points
        if (currentTool === 'shape' && shapeStartRef.current && currentPointsRef.current && currentPointsRef.current.length > 0) {
            const start = shapeStartRef.current;
            const end = currentPointsRef.current[currentPointsRef.current.length - 1];
            const shapePoints = getShapePoints(activeShape, start, end, e.shiftKey || isShiftHeld);

            if (shapePoints.length >= 2) {
                addStroke({
                    points: shapePoints,
                    color: penColor,
                    size: penWidth,
                }, false, true);  // forceEraser=false, isShape=true
            }

            shapeStartRef.current = null;
            currentPointsRef.current = null;
            setIsDrawing(false);
            setIsShiftHeld(false);

            clearActiveLayer();
            return;
        }

        // Freehand stroke commit
        const points = currentPointsRef.current;
        if (points && points.length >= 2) {
            // If barrel button was held, force eraser mode for this stroke only
            const wasBarrelButtonErasing = isBarrelButtonDown;

            if (wasBarrelButtonErasing) {
                // Force eraser stroke using forceEraser parameter
                addStroke({
                    points,
                    color: '#000000',
                    size: eraserWidth,
                }, true); // forceEraser = true
            } else {
                const settings = getCurrentStrokeSettings();
                addStroke({
                    points,
                    color: settings.color,
                    size: settings.size,
                });
            }
        }

        currentPointsRef.current = null;
        setIsDrawing(false);
        setIsBarrelButtonDown(false);
        setIsShiftHeld(false);

        clearActiveLayer();
    }, [addStroke, getCurrentStrokeSettings, isBarrelButtonDown, eraserWidth, currentTool, activeShape, penColor, penWidth, isShiftHeld, isDraggingSelection, lassoPoints, strokes, selectStrokes]);

    // Pointer Leave
    const handlePointerLeave = useCallback((e: React.PointerEvent) => {
        if (isDrawing && currentPointsRef.current) {
            const points = currentPointsRef.current;
            if (points.length >= 2) {
                const settings = getCurrentStrokeSettings();
                addStroke({
                    points,
                    color: settings.color,
                    size: settings.size,
                });
            }
            currentPointsRef.current = null;
            setIsDrawing(false);
        }
    }, [isDrawing, addStroke, getCurrentStrokeSettings]);

    const canvasStyle: React.CSSProperties = {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
    };

    // Determine cursor: barrel button erasing overrides tool cursor
    const getCursor = () => {
        if (isBarrelButtonDown) return 'cell'; // Eraser cursor when barrel button held
        if (currentTool === 'eraser') return 'cell';
        if (currentTool === 'select') return 'default';
        return 'crosshair';
    };

    return (
        /* The Desk - dark background, handles scrolling */
        <div
            style={{
                position: 'relative',
                width: '100vw',
                minHeight: '100vh',
                backgroundColor: '#1a1a2e',
                display: 'flex',
                justifyContent: 'center',
                overflow: 'auto',
            }}
        >
            {/* The Paper - dynamic width based on PDF */}
            <div
                ref={containerRef}
                style={{
                    position: 'relative',
                    width: pageWidth * zoom,
                    height: totalHeight * zoom,
                    minHeight: '100vh',
                    flexShrink: 0,
                    // CSS Hardening for palm rejection
                    touchAction: 'none',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    cursor: getCursor(),
                    // Paper shadow effect
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                }}
                onContextMenu={(e) => e.preventDefault()}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerLeave}
            >
                {/* Transform Wrapper - scales all canvas layers */}
                <div
                    style={{
                        transform: `scale(${zoom})`,
                        transformOrigin: 'top left',
                        width: pageWidth,
                        height: totalHeight,
                    }}
                >
                    {/* Scroll Snap Targets - invisible page markers with gaps */}
                    {/* Page Containers - observed by IntersectionObserver for page detection */}
                    {Array.from({ length: pageCount }).map((_, i) => (
                        <div
                            key={`page-container-${i}`}
                            className="canvas-page-container"
                            data-page-index={i}
                            style={{
                                position: 'absolute',
                                top: i * singlePageTotal,
                                left: 0,
                                width: '100%',
                                height: pageHeight,
                                scrollSnapAlign: 'start',
                                scrollSnapStop: 'always',
                                pointerEvents: 'none',
                            }}
                        />
                    ))}

                    {/* Z-Index 0: Background */}
                    <BackgroundLayer />

                    {/* Z-Index 1: PDF Document Layer */}
                    {!isOverlayMode && <PDFLayer />}

                    {/* Z-Index 5: Images */}
                    <ObjectLayer totalHeight={totalHeight} />

                    {/* Z-Index 7: Text Nodes */}
                    <TextLayer totalHeight={totalHeight} />

                    {/* Z-Index 8: Animated Watermark */}
                    <WatermarkLayer pageCount={pageCount} pageHeight={pageHeight} pageWidth={pageWidth} />

                    {/* Z-Index 10: Stroke History + Page Separators */}
                    <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
                        {visiblePages.map(i => (
                            <canvas
                                key={`static_${i}`}
                                ref={el => {
                                    if (el) staticLayerRefs.current.set(i, el);
                                    else staticLayerRefs.current.delete(i);
                                }}
                                className="absolute"
                                style={{
                                    top: i * (pageHeight + PDF_PAGE_GAP),
                                    left: 0,
                                    width: pageWidth,
                                    height: pageHeight,
                                    touchAction: 'none'
                                }}
                            />
                        ))}
                    </div>

                    {/* Z-Index 15: Lasso Selection UI */}
                    <LassoLayer totalHeight={totalHeight} />
                    <div style={{ position: 'absolute', inset: 0, zIndex: 30, pointerEvents: 'none' }}>
                        {visiblePages.map(i => (
                            <canvas
                                key={`active_${i}`}
                                ref={el => {
                                    if (el) activeLayerRefs.current.set(i, el);
                                    else activeLayerRefs.current.delete(i);
                                }}
                                className="absolute"
                                style={{
                                    top: i * (pageHeight + PDF_PAGE_GAP),
                                    left: 0,
                                    width: pageWidth,
                                    height: pageHeight,
                                    touchAction: 'none'
                                }}
                            />
                        ))}
                    </div>
                    <GridView />
                </div>
            </div>
        </div>
    );
}
