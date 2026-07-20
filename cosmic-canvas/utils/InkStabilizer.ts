import { Point } from './InkPhysics';

/**
 * InkStabilizer.ts
 * "Beast Pen Logic" - Step 5
 * Pure utility for stabilizing pointer input to remove human jitter.
 */

export interface StreamlineOptions {
    factor: number; // 0.0 to 1.0 (Higher = Smoother/Laggy, Lower = Raw/Responsive)
}

/**
 * Stabilizes a raw point using Exponential Moving Average (EMA).
 * 
 * @param rawPoint The new raw input point
 * @param previousStabilizedPoint The previously stabilized point (or null if first point)
 * @param factor Smoothing factor (default 0.5)
 * @returns The new stabilized point
 */
export function stabilizePoint(
    rawPoint: Point,
    previousStabilizedPoint: Point | null,
    factor: number = 0.5
): Point {
    // If no history, return raw point (First point in stroke)
    if (!previousStabilizedPoint) {
        return { ...rawPoint };
    }

    // EMA Formula: prev + (raw - prev) * factor
    // Factor 1.0 = Jump to raw (No smoothing)
    // Factor 0.1 = Move 10% towards raw (Heavy smoothing)
    const stabilizedX = previousStabilizedPoint.x + (rawPoint.x - previousStabilizedPoint.x) * factor;
    const stabilizedY = previousStabilizedPoint.y + (rawPoint.y - previousStabilizedPoint.y) * factor;

    // Return new point object (Immutable)
    return {
        x: stabilizedX,
        y: stabilizedY,
        pressure: rawPoint.pressure, // Keep raw pressure (or smooth it separately in Physics)
        time: rawPoint.time          // Keep raw time
    };
}
