import { Stroke, Point } from '@cosmic/types';

/**
 * EraserEngine.ts
 * "Beast Pen Logic" - Step 9
 * 
 * Provides high-performance vector collision detection for "Object Eraser" functionality.
 * Determines when an eraser path intersects with existing strokes.
 */

// 1. Helper: Squared Euclidean Distance
const distanceSquared = (p1: { x: number, y: number }, p2: { x: number, y: number }): number => {
    return (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;
};

// 2. Helper: Squared Distance from Point to Line Segment
const distanceToSegmentSquared = (p: { x: number, y: number }, v: { x: number, y: number }, w: { x: number, y: number }): number => {
    const l2 = distanceSquared(v, w);
    if (l2 === 0) return distanceSquared(p, v);

    // Consider the line extending the segment, parameterized as v + t (w - v).
    // We find projection of point p onto the line. 
    // It falls where t = [(p-v) . (w-v)] / |w-v|^2
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;

    // Clamp t to [0, 1] to handle segment boundedness
    t = Math.max(0, Math.min(1, t));

    // Projection point
    const projection = {
        x: v.x + t * (w.x - v.x),
        y: v.y + t * (w.y - v.y)
    };

    return distanceSquared(p, projection);
};

// 3. The Hit Tester
export const isStrokeHit = (strokePoints: Point[], eraserPoint: Point, eraserSize: number, strokeSize: number): boolean => {
    if (strokePoints.length < 2) {
        // Single point stroke (dot) check
        if (strokePoints.length === 1) {
            const distSq = distanceSquared(strokePoints[0], eraserPoint);
            const threshold = ((strokeSize + eraserSize) / 2);
            return distSq <= threshold * threshold;
        }
        return false; // Empty stroke
    }

    // Optimization: AABB Check
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of strokePoints) {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
    }

    // Pad AABB with radii
    const padding = (strokeSize + eraserSize) / 2;
    if (eraserPoint.x < minX - padding || eraserPoint.x > maxX + padding ||
        eraserPoint.y < minY - padding || eraserPoint.y > maxY + padding) {
        return false;
    }

    // Segment Check
    const thresholdSq = padding * padding;

    for (let i = 0; i < strokePoints.length - 1; i++) {
        const p1 = strokePoints[i];
        const p2 = strokePoints[i + 1];

        if (distanceToSegmentSquared(eraserPoint, p1, p2) <= thresholdSq) {
            return true;
        }
    }

    return false;
};

// 4. The Bulk Scanner
// Returns distinct IDs of strokes hit by the eraser path
export const findErasedStrokeIds = (allStrokes: Stroke[], eraserPath: Point[], eraserSize: number): string[] => {
    const hitIds = new Set<string>();

    // If eraser path has multiple points, we should ideally check the swept area (capsule vs sequence of lines)
    // But for "Object Eraser", usually touching with the tip (latest point) is sufficient 
    // IF we run this on every pointer move.
    // However, if the user moves fast, we might skip over.
    // To be robust, we iterate over the *eraser segments* vs *stroke segments*.
    // Requirement says: "Check intersection against the eraser path."
    // Simplified: Check checks if ANY point in eraserPath collides with the stroke.
    // Or normally: Check if the *latest* eraser point collides (as we run this in real-time).
    // Let's implement checking ALL points in `eraserPath` against the strokes for correctness (e.g. if we batch check).

    // Optimization: Iterate strokes first
    for (const stroke of allStrokes) {
        // If stroke is already hit, skip
        if (hitIds.has(stroke.id)) continue;

        // Check collision with ANY point in the eraser path
        // (Usually eraserPath is just [currentPoint] if we call this 120Hz)
        for (const ePoint of eraserPath) {
            // We pass stroke.size explicitly
            if (isStrokeHit(stroke.points, ePoint, eraserSize, stroke.size)) {
                hitIds.add(stroke.id);
                break; // Move to next stroke
            }
        }
    }

    return Array.from(hitIds);
};
