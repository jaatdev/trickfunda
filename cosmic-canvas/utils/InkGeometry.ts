import { getStroke, StrokeOptions } from 'perfect-freehand';
import { Point } from '@cosmic/types';

/**
 * InkGeometry.ts
 * "Beast Pen Logic" - Step 3
 * Pure utility for generating liquid-smooth SVG paths from raw input points.
 */

// Configuration for the "Liquid" Feel
const smoothOptions: StrokeOptions = {
    thinning: 0.6, // High dynamic range for taper
    smoothing: 0.5, // Standard curve fitting
    streamline: 0.5, // Stabilizes shaky hands
    start: {
        taper: 0,
        cap: true
    },
    end: {
        taper: 0,
        cap: true
    },
    simulatePressure: false // Handled by InkPhysics
};

/**
 * Generates an SVG path string from a set of points.
 * 
 * @param points Raw input points {x, y, pressure, ...}
 * @param size Base stroke size
 * @returns SVG Path data string (d attribute)
 */
export function generateSvgPath(points: Point[], size: number): string {
    if (points.length === 0) return '';

    // Convert to perfect-freehand format: [x, y, pressure]
    const inputPoints = points.map(p => [p.x, p.y, p.pressure]);

    // Generate the stroke polygon
    const stroke = getStroke(inputPoints, { ...smoothOptions, size });

    // Convert polygon to SVG path
    return getSvgPathFromStroke(stroke);
}

/**
 * Converts a polygon (array of points) to an SVG Path string.
 * Uses Quadratic Bezier curves for maximum smoothness.
 * 
 * @param strokePoints Array of [x, y] coordinates representing the stroke outline
 */
export function getSvgPathFromStroke(strokePoints: number[][]): string {
    const len = strokePoints.length;
    if (!len) return '';

    const d = strokePoints.reduce(
        (acc, [x0, y0], i, arr) => {
            const [x1, y1] = arr[(i + 1) % len]; // Wrap around to close
            acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
            return acc;
        },
        ['M', ...strokePoints[0], 'Q']
    );

    d.push('Z');
    return d.join(' ');
}
