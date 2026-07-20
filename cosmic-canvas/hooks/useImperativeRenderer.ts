import { useCallback, RefObject } from 'react';
import { Point } from '../utils/InkPhysics';
import { generateSvgPath } from '../utils/InkGeometry';

interface StrokeSettings {
    color: string;
    size: number;
    isEraser?: boolean;
    isHighlighter?: boolean;
}

export const useImperativeRenderer = (
    canvasRefs: RefObject<Map<number, HTMLCanvasElement>>,
    pageHeight: number,
    pageGap: number
) => {

    const renderStroke = useCallback((points: Point[], settings: StrokeSettings) => {
        if (!canvasRefs.current) return;

        const dpr = window.devicePixelRatio || 1;
        const pathData = generateSvgPath(points, settings.size);
        if (!pathData) return;
        const path = new Path2D(pathData);

        // Iterate through all currently mounted active page canvases
        canvasRefs.current.forEach((canvas, pageIndex) => {
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const width = canvas.width;
            const height = canvas.height;

            // Clear physical pixels
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, width, height);
            ctx.restore();

            // Set high-res scale
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            
            // Translate for page offset
            const pageTop = pageIndex * (pageHeight + pageGap);
            ctx.translate(0, -pageTop);

            // Configure Paint Style
            if (settings.isEraser) {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.fillStyle = '#000000';
            } else {
                ctx.globalCompositeOperation = 'source-over';
                ctx.fillStyle = settings.color;
            }

            if (settings.isHighlighter) {
                ctx.globalAlpha = 0.5;
                if (!settings.isEraser) {
                    ctx.globalCompositeOperation = 'source-over';
                }
            } else {
                ctx.globalAlpha = 1.0;
            }

            ctx.fill(path);

            ctx.globalAlpha = 1.0;
            ctx.globalCompositeOperation = 'source-over';
        });

    }, [canvasRefs, pageHeight, pageGap]);

    const clearCanvas = useCallback(() => {
        if (!canvasRefs.current) return;
        
        canvasRefs.current.forEach(canvas => {
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        });
    }, [canvasRefs]);


    return { renderStroke, clearCanvas };
};
