'use client';

import { useStore } from '@cosmic/store/useStore';
import { getStrokesBoundingBox } from '@cosmic/utils/geometry';
import { getSvgPathFromStroke } from '@cosmic/utils/ink';
import { getStroke } from 'perfect-freehand';
import { useState, useEffect, useMemo } from 'react';
import { Plus, Minus, Copy, CopyPlus, Trash2, RotateCw } from 'lucide-react';

interface LassoLayerProps {
    totalHeight: number;
}

/**
 * LassoLayer Component - Z-Index 15
 * 
 * Renders the selection UI for the Quantum Lasso:
 * - Bounding box (blue dashed)
 * - 4 Corner handles (white squares)
 * - Floating Action Bar with +/-/duplicate/delete
 * 
 * All UI elements are zoom-compensated to maintain constant screen size.
 */
export default function LassoLayer({ totalHeight }: LassoLayerProps) {
    const {
        currentTool,
        zoom,
        strokes,
        textNodes,
        selectedStrokeIds,
        selectedTextIds,
        transformStrokes,
        scaleSelectedStrokes,
        rotateSelection,
        selectionRotation,
        flipSelectionHorizontal,
        flipSelectionVertical,
        changeSelectionColor,
        changeSelectionOpacity,
        changeSelectionStrokeWidth,
        alignSelection,
        groupSelection,
        ungroupSelection,
        duplicateSelectedStrokes,
        deleteSelectedStrokes,
        clearSelection,
    } = useStore();

    // Drag state - ALL hooks must be called before any conditional returns
    const [isDragging, setIsDragging] = useState(false);
    const [activeHandle, setActiveHandle] = useState<string | null>(null);
    const [isRotating, setIsRotating] = useState(false);
    const [rotateStart, setRotateStart] = useState<{ angle: number } | null>(null);
    const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
    const [initialBbox, setInitialBbox] = useState<{ minX: number; minY: number; maxX: number; maxY: number } | null>(null);

    // Calculate bounding box from strokes (memoized)
    const selectedStrokes = useMemo(() =>
        strokes.filter(s => selectedStrokeIds.includes(s.id)),
        [strokes, selectedStrokeIds]
    );

    // Calculate bounding box from text nodes (memoized)
    const selectedTexts = useMemo(() =>
        textNodes.filter(t => selectedTextIds.includes(t.id)),
        [textNodes, selectedTextIds]
    );

    // Combined bounding box for strokes AND text
    const bbox = useMemo(() => {
        const hasStrokes = selectedStrokes.length > 0;
        const hasText = selectedTexts.length > 0;

        if (!hasStrokes && !hasText) return null;

        // Get stroke bounds
        const strokeBbox = hasStrokes ? getStrokesBoundingBox(selectedStrokes) : null;

        // Get text bounds
        let textMinX = Infinity, textMaxX = -Infinity;
        let textMinY = Infinity, textMaxY = -Infinity;

        if (hasText) {
            selectedTexts.forEach(t => {
                const width = t.content.length * (t.fontSize * 0.6);
                const height = t.fontSize * 1.2;
                textMinX = Math.min(textMinX, t.x);
                textMaxX = Math.max(textMaxX, t.x + width);
                textMinY = Math.min(textMinY, t.y);
                textMaxY = Math.max(textMaxY, t.y + height);
            });
        }

        // Combine bounds
        if (hasStrokes && hasText) {
            const minX = Math.min(strokeBbox!.minX, textMinX);
            const maxX = Math.max(strokeBbox!.maxX, textMaxX);
            const minY = Math.min(strokeBbox!.minY, textMinY);
            const maxY = Math.max(strokeBbox!.maxY, textMaxY);
            return {
                minX, maxX, minY, maxY,
                width: maxX - minX,
                height: maxY - minY,
            };
        } else if (hasStrokes) {
            return strokeBbox;
        } else {
            return {
                minX: textMinX,
                maxX: textMaxX,
                minY: textMinY,
                maxY: textMaxY,
                width: textMaxX - textMinX,
                height: textMaxY - textMinY,
            };
        }
    }, [selectedStrokes, selectedTexts]);

    // Copy Area Feature
    const handleCopyArea = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        
        if (!bbox || selectedStrokes.length === 0) return;

        try {
            const padding = 20;
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = bbox.width + padding * 2;
            tempCanvas.height = bbox.height + padding * 2;
            const ctx = tempCanvas.getContext('2d');
            if (!ctx) return;

            // Draw selected strokes
            selectedStrokes.forEach(stroke => {
                if (stroke.points.length < 2) return;
                
                // Shift points by bbox min and add padding
                const input = stroke.points.map(p => [p.x - bbox.minX + padding, p.y - bbox.minY + padding, p.pressure || 0.5] as [number, number, number]);
                
                // Get SVG path
                const strokeData = getStroke(input, { size: stroke.size, thinning: 0.5, streamline: 0.5 });
                const pathData = getSvgPathFromStroke(strokeData as any);
                const path = new Path2D(pathData);
                
                ctx.globalCompositeOperation = stroke.isEraser ? 'destination-out' : 'source-over';
                ctx.fillStyle = stroke.isEraser ? 'rgba(0,0,0,1)' : stroke.color;
                ctx.fill(path);
            });

            tempCanvas.toBlob(blob => {
                if (blob) {
                    navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                }
            });
            clearSelection();
        } catch (err) {
            console.error('Failed to copy area:', err);
        }
    };

    // Keyboard navigation - Hook called unconditionally
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only handle if we have selection and are in lasso mode
            const hasSelection = selectedStrokeIds.length > 0 || selectedTextIds.length > 0;
            if (!hasSelection || currentTool !== 'lasso') return;

            const moveAmount = 10;
            let dx = 0, dy = 0;

            switch (e.key) {
                case 'ArrowUp': dy = -moveAmount; break;
                case 'ArrowDown': dy = moveAmount; break;
                case 'ArrowLeft': dx = -moveAmount; break;
                case 'ArrowRight': dx = moveAmount; break;
                case 'Delete':
                case 'Backspace':
                    e.preventDefault();
                    deleteSelectedStrokes();
                    return;
                case 'Escape':
                    clearSelection();
                    return;
                default:
                    return;
            }

            if (dx !== 0 || dy !== 0) {
                e.preventDefault();
                transformStrokes(dx, dy);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedStrokeIds, selectedTextIds, currentTool, transformStrokes, deleteSelectedStrokes, clearSelection]);

    // Don't render if not in lasso mode or no selection - AFTER all hooks
    const hasSelection = selectedStrokeIds.length > 0 || selectedTextIds.length > 0;
    if (currentTool !== 'lasso' || !hasSelection || !bbox) {
        return null;
    }

    // Zoom compensation factor for UI elements
    const uiScale = 1 / zoom;

    // Handle sizes (in screen pixels, compensated for zoom)
    const handleSize = 12 * uiScale;
    const hitAreaSize = 24 * uiScale;

    // Corner handle positions
    const handles = [
        { id: 'tl', x: bbox.minX, y: bbox.minY },
        { id: 'tr', x: bbox.maxX, y: bbox.minY },
        { id: 'bl', x: bbox.minX, y: bbox.maxY },
        { id: 'br', x: bbox.maxX, y: bbox.maxY },
    ];

    // Pointer down on bbox (start dragging)
    const handleBboxPointerDown = (e: React.PointerEvent) => {
        e.stopPropagation();
        const x = e.pageX / zoom;
        const y = e.pageY / zoom;
        setIsDragging(true);
        setDragStart({ x, y });
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    // Pointer down on handle (start resizing)
    const handleHandlePointerDown = (handleId: string) => (e: React.PointerEvent) => {
        e.stopPropagation();
        const x = e.pageX / zoom;
        const y = e.pageY / zoom;
        setActiveHandle(handleId);
        setDragStart({ x, y });
        setInitialBbox({ ...bbox });
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    // Pointer move (dragging, resizing, or rotating)
    const handlePointerMove = (e: React.PointerEvent) => {
        if (!dragStart && !isRotating) return;

        const x = e.pageX / zoom;
        const y = e.pageY / zoom;

        if (isRotating && bbox) {
            // Calculate rotation angle
            const centerX = bbox.minX + (bbox.maxX - bbox.minX) / 2;
            const centerY = bbox.minY + (bbox.maxY - bbox.minY) / 2;
            const currentAngle = Math.atan2(y - centerY, x - centerX);
            if (rotateStart) {
                const angleDelta = currentAngle - rotateStart.angle;
                rotateSelection(angleDelta);
                setRotateStart({ angle: currentAngle });
            }
            return;
        }

        if (isDragging && dragStart) {
            const dx = x - dragStart.x;
            const dy = y - dragStart.y;
            transformStrokes(dx, dy);
            setDragStart({ x, y });
        } else if (activeHandle && initialBbox && dragStart) {
            const isEdgeHandle = ['tc', 'bc', 'ml', 'mr'].includes(activeHandle);

            if (isEdgeHandle) {
                // Edge handles: axis-constrained scaling
                const centerX = (initialBbox.minX + initialBbox.maxX) / 2;
                const centerY = (initialBbox.minY + initialBbox.maxY) / 2;
                const origin = {
                    tc: { x: centerX, y: initialBbox.maxY },
                    bc: { x: centerX, y: initialBbox.minY },
                    ml: { x: initialBbox.maxX, y: centerY },
                    mr: { x: initialBbox.minX, y: centerY },
                }[activeHandle]!;

                if (activeHandle === 'tc' || activeHandle === 'bc') {
                    const originalDist = Math.abs(dragStart.y - origin.y);
                    const newDist = Math.abs(y - origin.y);
                    if (originalDist > 0) {
                        const scaleY = newDist / originalDist;
                        transformStrokes(0, 0, 1, scaleY, origin);
                        setDragStart({ x, y });
                        setInitialBbox({ ...bbox });
                    }
                } else {
                    const originalDist = Math.abs(dragStart.x - origin.x);
                    const newDist = Math.abs(x - origin.x);
                    if (originalDist > 0) {
                        const scaleX = newDist / originalDist;
                        transformStrokes(0, 0, scaleX, 1, origin);
                        setDragStart({ x, y });
                        setInitialBbox({ ...bbox });
                    }
                }
            } else {
                // Corner handles: uniform scaling
                const oppositeCorner = {
                    tl: { x: initialBbox.maxX, y: initialBbox.maxY },
                    tr: { x: initialBbox.minX, y: initialBbox.maxY },
                    bl: { x: initialBbox.maxX, y: initialBbox.minY },
                    br: { x: initialBbox.minX, y: initialBbox.minY },
                }[activeHandle]!;

                const originalDist = Math.sqrt(
                    (dragStart.x - oppositeCorner.x) ** 2 +
                    (dragStart.y - oppositeCorner.y) ** 2
                );
                const newDist = Math.sqrt(
                    (x - oppositeCorner.x) ** 2 +
                    (y - oppositeCorner.y) ** 2
                );

                if (originalDist > 0) {
                    const scaleFactor = newDist / originalDist;
                    transformStrokes(0, 0, scaleFactor, scaleFactor, oppositeCorner);
                    setDragStart({ x, y });
                    setInitialBbox({ ...bbox });
                }
            }
        }
    };

    // Pointer up (end interaction)
    const handlePointerUp = () => {
        setIsDragging(false);
        setActiveHandle(null);
        setIsRotating(false);
        setRotateStart(null);
        setDragStart(null);
        setInitialBbox(null);
    };

    // Rotation handle interaction
    const handleRotatePointerDown = (e: React.PointerEvent) => {
        e.stopPropagation();
        if (!bbox) return;
        const x = e.pageX / zoom;
        const y = e.pageY / zoom;
        const centerX = bbox.minX + (bbox.maxX - bbox.minX) / 2;
        const centerY = bbox.minY + (bbox.maxY - bbox.minY) / 2;
        const startAngle = Math.atan2(y - centerY, x - centerX);
        setIsRotating(true);
        setRotateStart({ angle: startAngle });
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: totalHeight,
                zIndex: 15,
                pointerEvents: 'none',
            }}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        >
            {/* Bounding Box - Marching Ants Animation */}
            <svg
                style={{
                    position: 'absolute',
                    left: bbox.minX - 2 * uiScale,
                    top: bbox.minY - 2 * uiScale,
                    width: bbox.width + 4 * uiScale,
                    height: bbox.height + 4 * uiScale,
                    overflow: 'visible',
                    pointerEvents: 'none',
                }}
            >
                <style>{`
                    @keyframes marchingAnts {
                        to { stroke-dashoffset: -20; }
                    }
                `}</style>
                {/* Background line for contrast */}
                <rect
                    x={2 * uiScale}
                    y={2 * uiScale}
                    width={bbox.width}
                    height={bbox.height}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.3)"
                    strokeWidth={2 * uiScale}
                />
                {/* Animated marching ants */}
                <rect
                    x={2 * uiScale}
                    y={2 * uiScale}
                    width={bbox.width}
                    height={bbox.height}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth={2 * uiScale}
                    strokeDasharray={`${6 * uiScale} ${4 * uiScale}`}
                    style={{
                        animation: 'marchingAnts 0.4s linear infinite',
                    }}
                />
            </svg>
            {/* Invisible drag area for bounding box */}
            <div
                style={{
                    position: 'absolute',
                    left: bbox.minX,
                    top: bbox.minY,
                    width: bbox.width,
                    height: bbox.height,
                    pointerEvents: 'auto',
                    cursor: 'move',
                }}
                onPointerDown={handleBboxPointerDown}
            />

            {/* Corner Handles */}
            {handles.map(handle => (
                <div
                    key={handle.id}
                    style={{
                        position: 'absolute',
                        left: handle.x - hitAreaSize / 2,
                        top: handle.y - hitAreaSize / 2,
                        width: hitAreaSize,
                        height: hitAreaSize,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'auto',
                        cursor: handle.id === 'tl' || handle.id === 'br' ? 'nwse-resize' : 'nesw-resize',
                    }}
                    onPointerDown={handleHandlePointerDown(handle.id)}
                >
                    <div
                        style={{
                            width: handleSize,
                            height: handleSize,
                            backgroundColor: '#ffffff',
                            border: `${2 * uiScale}px solid #3b82f6`,
                            borderRadius: 2 * uiScale,
                        }}
                    />
                </div>
            ))}

            {/* Rotation Handle */}
            {(() => {
                const rotHandleDistance = 35 * uiScale;
                const centerX = bbox.minX + (bbox.maxX - bbox.minX) / 2;
                const topY = bbox.minY;
                return (
                    <>
                        {/* Connector line from top-center to rotation handle */}
                        <div
                            style={{
                                position: 'absolute',
                                left: centerX,
                                top: topY - rotHandleDistance,
                                width: 1 * uiScale,
                                height: rotHandleDistance,
                                backgroundColor: '#3b82f6',
                                pointerEvents: 'none',
                                transformOrigin: 'bottom center',
                            }}
                        />
                        {/* Rotation handle circle */}
                        <div
                            style={{
                                position: 'absolute',
                                left: centerX - (handleSize * 0.7),
                                top: topY - rotHandleDistance - (handleSize * 0.7),
                                width: handleSize * 1.4,
                                height: handleSize * 1.4,
                                borderRadius: '50%',
                                backgroundColor: '#ffffff',
                                border: `${2 * uiScale}px solid #3b82f6`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                pointerEvents: 'auto',
                                cursor: 'grab',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                            }}
                            onPointerDown={handleRotatePointerDown}
                        >
                            <RotateCw size={handleSize * 0.6} color="#3b82f6" />
                        </div>
                        {/* Live angle tooltip */}
                        {isRotating && (
                            <div
                                style={{
                                    position: 'absolute',
                                    left: centerX,
                                    top: topY - rotHandleDistance - handleSize * 2.5,
                                    transform: `translateX(-50%) scale(${uiScale})`,
                                    transformOrigin: 'bottom center',
                                    backgroundColor: 'rgba(0,0,0,0.85)',
                                    color: '#fff',
                                    padding: '3px 8px',
                                    borderRadius: 4,
                                    fontSize: 11,
                                    fontWeight: 600,
                                    pointerEvents: 'none',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {Math.round((selectionRotation * 180 / Math.PI) % 360)}°
                            </div>
                        )}
                    </>
                );
            })()}


            {/* Edge Handles (N/S/E/W) for non-uniform scaling */}
            {[
                { id: 'tc', x: bbox.minX + (bbox.maxX - bbox.minX) / 2, y: bbox.minY, cursor: 'ns-resize' },
                { id: 'bc', x: bbox.minX + (bbox.maxX - bbox.minX) / 2, y: bbox.maxY, cursor: 'ns-resize' },
                { id: 'ml', x: bbox.minX, y: bbox.minY + (bbox.maxY - bbox.minY) / 2, cursor: 'ew-resize' },
                { id: 'mr', x: bbox.maxX, y: bbox.minY + (bbox.maxY - bbox.minY) / 2, cursor: 'ew-resize' },
            ].map(handle => (
                <div
                    key={handle.id}
                    style={{
                        position: 'absolute',
                        left: handle.x - hitAreaSize / 2,
                        top: handle.y - hitAreaSize / 2,
                        width: hitAreaSize,
                        height: hitAreaSize,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'auto',
                        cursor: handle.cursor,
                    }}
                    onPointerDown={handleHandlePointerDown(handle.id)}
                >
                    <div
                        style={{
                            width: handleSize * 0.8,
                            height: handleSize * 0.8,
                            backgroundColor: '#ffffff',
                            border: `${2 * uiScale}px solid #3b82f6`,
                            borderRadius: '50%',
                        }}
                    />
                </div>
            ))}

            {/* Floating Action Bar - Full Featured */}
            <div
                style={{
                    position: 'absolute',
                    left: bbox.minX + bbox.width / 2,
                    top: bbox.maxY + 16 * uiScale,
                    transform: `translateX(-50%) scale(${uiScale})`,
                    transformOrigin: 'top center',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    padding: '6px',
                    backgroundColor: 'rgba(15, 15, 25, 0.92)',
                    borderRadius: '10px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.08)',
                    pointerEvents: 'auto',
                    backdropFilter: 'blur(12px)',
                }}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Row 1: Scale, Flip, Duplicate, Delete */}
                <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                    {[
                        { icon: <Minus size={16} />, action: () => scaleSelectedStrokes(0.9), title: 'Shrink 10%', color: 'white' },
                        { icon: <Plus size={16} />, action: () => scaleSelectedStrokes(1.1), title: 'Grow 10%', color: 'white' },
                    ].map((btn, i) => (
                        <button key={i} onClick={btn.action} title={btn.title} style={{
                            width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backgroundColor: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '6px',
                            color: btn.color, cursor: 'pointer',
                        }}>{btn.icon}</button>
                    ))}

                    <div style={{ width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.15)' }} />

                    {/* Flip H/V */}
                    <button onClick={flipSelectionHorizontal} title="Flip Horizontal" style={{
                        width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '6px',
                        color: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                    }}>↔</button>
                    <button onClick={flipSelectionVertical} title="Flip Vertical" style={{
                        width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '6px',
                        color: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                    }}>↕</button>

                    <div style={{ width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.15)' }} />

                    <button onClick={duplicateSelectedStrokes} title="Duplicate" style={{
                        width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '6px',
                        color: 'white', cursor: 'pointer',
                    }}><CopyPlus size={16} /></button>

                    <button onClick={handleCopyArea} title="Copy Area to Clipboard" style={{
                        width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '6px',
                        color: 'white', cursor: 'pointer',
                    }}><Copy size={16} /></button>

                    <button onClick={deleteSelectedStrokes} title="Delete" style={{
                        width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: '6px',
                        color: '#ef4444', cursor: 'pointer',
                    }}><Trash2 size={16} /></button>
                </div>

                {/* Row 2: Color swatches */}
                <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, marginRight: 2, whiteSpace: 'nowrap' }}>Color</span>
                    {['#ffffff', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#000000'].map(c => (
                        <button key={c} onClick={() => changeSelectionColor(c)} title={c} style={{
                            width: 20, height: 20, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)',
                            backgroundColor: c, cursor: 'pointer', padding: 0, flexShrink: 0,
                        }} />
                    ))}
                    <input
                        type="color"
                        onChange={(e) => changeSelectionColor(e.target.value)}
                        title="Custom Color"
                        style={{ width: 20, height: 20, border: 'none', padding: 0, cursor: 'pointer', borderRadius: 4, backgroundColor: 'transparent' }}
                    />
                </div>

                {/* Row 3: Opacity + Stroke Width */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, whiteSpace: 'nowrap' }}>Opacity</span>
                    <input
                        type="range" min="0" max="100" defaultValue="100"
                        onChange={(e) => changeSelectionOpacity(parseInt(e.target.value) / 100)}
                        style={{ width: 70, height: 4, accentColor: '#3b82f6', cursor: 'pointer' }}
                    />
                    <div style={{ width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.15)' }} />
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, whiteSpace: 'nowrap' }}>Width</span>
                    <input
                        type="range" min="1" max="50" defaultValue="3"
                        onChange={(e) => changeSelectionStrokeWidth(parseInt(e.target.value))}
                        style={{ width: 60, height: 4, accentColor: '#3b82f6', cursor: 'pointer' }}
                    />
                </div>

                {/* Row 4: Align + Group (only show align when ≥2 items) */}
                <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                    {(selectedStrokeIds.length + selectedTextIds.length >= 2) && (
                        <>
                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, marginRight: 2 }}>Align</span>
                            {[
                                { dir: 'left' as const, label: '⫷' },
                                { dir: 'center-h' as const, label: '⫸' },
                                { dir: 'right' as const, label: '⫸' },
                                { dir: 'top' as const, label: '⫠' },
                                { dir: 'center-v' as const, label: '⫡' },
                                { dir: 'bottom' as const, label: '⫢' },
                            ].map(({ dir, label }) => (
                                <button key={dir} onClick={() => alignSelection(dir)} title={`Align ${dir}`} style={{
                                    width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    backgroundColor: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '4px',
                                    color: 'white', cursor: 'pointer', fontSize: 10,
                                }}>{label}</button>
                            ))}
                            <div style={{ width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.15)' }} />
                        </>
                    )}
                    <button onClick={groupSelection} title="Group (Ctrl+G)" style={{
                        height: 24, display: 'flex', alignItems: 'center', gap: 3, padding: '0 8px',
                        backgroundColor: 'rgba(59,130,246,0.15)', border: 'none', borderRadius: '4px',
                        color: '#60a5fa', cursor: 'pointer', fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap',
                    }}>Group</button>
                    <button onClick={ungroupSelection} title="Ungroup (Ctrl+Shift+G)" style={{
                        height: 24, display: 'flex', alignItems: 'center', gap: 3, padding: '0 8px',
                        backgroundColor: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '4px',
                        color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap',
                    }}>Ungroup</button>
                </div>
            </div>
        </div>
    );
}
