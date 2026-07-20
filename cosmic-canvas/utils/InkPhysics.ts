/**
 * InkPhysics.ts
 * Pure utility module for "Beast Pen Logic" physics calculations.
 * Handles velocity, pressure simulation, and smoothing.
 */

export interface Point {
    x: number;
    y: number;
    pressure: number;
    time: number;
}

/**
 * Calculates velocity between two points in pixels per millisecond.
 */
export function calculateVelocity(p1: Point, p2: Point): number {
    const timeDelta = p2.time - p1.time;
    if (timeDelta <= 0) return 0;

    const dist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    return dist / timeDelta;
}

/**
 * The "Beast" Taper - Simulates organic pressure.
 * 
 * @param velocity Current stroke velocity (px/ms)
 * @param currentPressure Hardware pressure (0.0 - 1.0)
 * @param isMouse Whether input is from a mouse
 * @returns Simulated pressure value (0.0 - 1.0)
 */
export function getSimulatedPressure(velocity: number, currentPressure: number, isMouse: boolean): number {
    // Physics constants for "flow" simulation
    const MIN_SPEED = 0.01;
    const MAX_SPEED = 3.0;
    const MIN_PRESSURE = 0.2;
    const MAX_PRESSURE = 0.95; // Don't hit 1.0 fully to allow heavy presses to stand out

    // 1. Calculate Velocity-based Pressure Component
    // Slower = Higher Pressure (more ink deposits)
    // Faster = Lower Pressure (ink thins out)
    const speedRatio = Math.max(0, Math.min(1, (velocity - MIN_SPEED) / (MAX_SPEED - MIN_SPEED)));
    const velocityPressure = MAX_PRESSURE - (speedRatio * (MAX_PRESSURE - MIN_PRESSURE));

    if (isMouse) {
        // Mouse has no hardware pressure, purely rely on velocity
        // We use a slight curve for better feel
        return velocityPressure;
    } else {
        // Stylus: Blend hardware pressure with velocity physics
        // This solves the "stiff" feeling of raw digitizer input
        // 60% Hardware, 40% Velocity looks best for "Beast" feel
        const BLEND_FACTOR = 0.6;
        return (currentPressure * BLEND_FACTOR) + (velocityPressure * (1 - BLEND_FACTOR));
    }
}

/**
 * LERP-based Pressure Smoothing.
 * Removes jitter from cheap stylus hardware or unstable hand movements.
 * 
 * @param current Target pressure
 * @param previous Previous pressure state
 * @param factor Smoothing factor (0.0 = old, 1.0 = new, default 0.5)
 */
export function smoothPressure(current: number, previous: number, factor: number = 0.5): number {
    return previous + (current - previous) * factor;
}
