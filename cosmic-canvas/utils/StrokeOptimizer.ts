import { Point } from './InkPhysics';

/**
 * StrokeOptimizer.ts
 * "Beast Pen Logic" - Step 6
 * Compresses stroke data using Ramer-Douglas-Peucker (RDP) algorithm.
 * Significantly reduces memory usage and SVG path complexity.
 */

// --- Internal Math Helpers ---

/**
 * Basic Euclidean distance between two points.
 */
function getDistance(p1: Point, p2: Point): number {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

/**
 * Perpendicular distance of point p from the line segment p1-p2.
 */
function getPerpendicularDistance(p: Point, p1: Point, p2: Point): number {
    const { x, y } = p;
    const { x: x1, y: y1 } = p1;
    const { x: x2, y: y2 } = p2;

    if (x1 === x2 && y1 === y2) {
        return getDistance(p, p1);
    }

    const numerator = Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1);
    const denominator = Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));

    return numerator / denominator;
}

// --- Optimization Logic ---

/**
 * 1. Clean Points
 * Filters out points that are too close to the previous point (Hover Noise).
 * Removes duplicates where distance < threshold (0.1px).
 */
export function cleanPoints(points: Point[], threshold: number = 0.1): Point[] {
    if (points.length < 2) return points;

    const cleaned: Point[] = [points[0]];
    let lastPoint = points[0];

    for (let i = 1; i < points.length; i++) {
        if (getDistance(points[i], lastPoint) >= threshold) {
            cleaned.push(points[i]);
            lastPoint = points[i];
        }
    }
    return cleaned;
}

/**
 * 2. Ramer-Douglas-Peucker (RDP) Algorithm
 * Recursively simplifies a curve by removing points within epsilon tolerance.
 * Keeps the "shape" but removes redundant points on straight lines.
 */
// Using recursion (Safe for typical stroke lengths < 10k points)
function rdp(points: Point[], epsilon: number): Point[] {
    if (points.length < 3) return points;

    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];

    let maxDist = 0;
    let index = 0;

    // Find the point furthest from the simplified line (first -> last)
    for (let i = 1; i < points.length - 1; i++) {
        const dist = getPerpendicularDistance(points[i], firstPoint, lastPoint);
        if (dist > maxDist) {
            maxDist = dist;
            index = i;
        }
    }

    // If deviation is significant, split and recurse
    if (maxDist > epsilon) {
        const left = rdp(points.slice(0, index + 1), epsilon);
        const right = rdp(points.slice(index), epsilon);

        // Concatenate logic: slice removal ensures no duplicate middle point
        return left.slice(0, left.length - 1).concat(right);
    } else {
        // Linear Approximation is good enough
        return [firstPoint, lastPoint];
    }
}

/**
 * 3. Main Exporter
 * The full optimization pipeline: Clean -> RDP.
 * call this when the stroke is finished (OnPointerUp).
 * 
 * @param points Raw stroke points
 * @param epsilon Error tolerance (default 0.5px). Higher = Cleaner/Sharper. Lower = More detailed.
 */
export function compressStroke(points: Point[], epsilon: number = 0.5): Point[] {
    const cleaned = cleanPoints(points);
    return rdp(cleaned, epsilon); // Apply RDP
}
