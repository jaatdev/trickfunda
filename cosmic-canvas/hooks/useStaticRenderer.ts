import { RefObject, useEffect } from 'react';
import { Stroke } from '@cosmic/types';
import { generateSvgPath } from '@cosmic/utils/InkGeometry';

/**
 * useStaticRenderer.ts
 * "Beast Pen Logic" - Step 8
 * 
 * Responsible for "Recall": Painting the entire history of strokes
 * onto the static canvas whenever the store changes (Undo/Redo/New Stroke).
 */
export const useStaticRenderer = (
    canvasRef: RefObject<HTMLCanvasElement | null>,
    strokes: Stroke[]
) => {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 1. Handle DPI Scaling & Clearing
        // We assume the canvas "width/height" attributes match the physical pixels
        // and CSS controls the logical size.
        // But to be sure, we reset transform to identity scaled by DPR.
        // Actually, usually we set the canvas size to window.devicePixelRatio * logicalSize.
        // Here we just ensure we are drawing cleanly.

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        // Note: Ideally canvas.width/height are already set to rect.width * dpr in Stage.tsx
        // We just reset the transform to ensure 0,0 is top-left logical pixel.
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Clear the logical area
        ctx.clearRect(0, 0, rect.width, rect.height);

        // 2. Render Loop
        // Iterate through all saved strokes and paint them.
        strokes.forEach(stroke => {
            if (stroke.points.length < 1) return;

            // Save context state (for easy composite/alpha reset)
            ctx.save();

            // A. Generate Path (The Beast Geometry)
            const pathData = generateSvgPath(stroke.points, stroke.size);
            const path = new Path2D(pathData);

            // B. Apply Styles
            ctx.fillStyle = stroke.color;

            // C. Handle Eraser
            if (stroke.isEraser) {
                // 'destination-out' punches a hole through existing ink
                ctx.globalCompositeOperation = 'destination-out';
            } else {
                ctx.globalCompositeOperation = 'source-over';
            }

            // D. Handle Highlighter
            if (stroke.isHighlighter) {
                // Highlighters are semi-transparent and blend (multiply? or just alpha)
                // Requirements say alpha 0.5
                ctx.globalAlpha = 0.5;
                // Ideally highlighters might use 'multiply' blend mode for realistic effect
                // ctx.globalCompositeOperation = 'multiply'; 
                // But let's stick to requirements for now.
            }

            // E. Draw
            ctx.fill(path);

            // Restore context for next stroke
            ctx.restore();
        });

    }, [strokes, canvasRef]); // flushes whenever strokes change
};
