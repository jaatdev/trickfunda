/**
 * Geometry Utilities for Shape Engine
 * 
 * Helper functions to generate shapes with Shift-key aspect ratio locking.
 * Returns arrays of Point objects for stroke-based rendering.
 */

import { Point } from '@cosmic/types';

interface Vec2 {
    x: number;
    y: number;
}

/**
 * Create a Point with default pressure
 */
const pt = (x: number, y: number, pressure: number = 0.5): Point => ({ x, y, pressure });

/**
 * Get rectangle points (outline as stroke path)
 * If isShift, forces a perfect square
 */
export function getRect(start: Vec2, end: Vec2, isShift: boolean): Point[] {
    let width = end.x - start.x;
    let height = end.y - start.y;

    if (isShift) {
        // Force square: use the smaller dimension
        const size = Math.min(Math.abs(width), Math.abs(height));
        width = Math.sign(width) * size || size;
        height = Math.sign(height) * size || size;
    }

    const x1 = start.x;
    const y1 = start.y;
    const x2 = start.x + width;
    const y2 = start.y + height;

    // Return rectangle outline as continuous path
    return [
        pt(x1, y1), pt(x2, y1), pt(x2, y2), pt(x1, y2), pt(x1, y1)
    ];
}

/**
 * Get circle/ellipse points (approximated with many points)
 * If isShift, forces a perfect circle
 */
export function getCircle(start: Vec2, end: Vec2, isShift: boolean): Point[] {
    let radiusX = Math.abs(end.x - start.x) / 2;
    let radiusY = Math.abs(end.y - start.y) / 2;

    if (isShift) {
        // Force circle: use the smaller radius
        const radius = Math.min(radiusX, radiusY);
        radiusX = radius;
        radiusY = radius;
    }

    const centerX = start.x + (end.x - start.x) / 2;
    const centerY = start.y + (end.y - start.y) / 2;

    // If isShift, adjust center to maintain square bounds from start
    if (isShift) {
        const size = Math.min(Math.abs(end.x - start.x), Math.abs(end.y - start.y));
        const signX = Math.sign(end.x - start.x) || 1;
        const signY = Math.sign(end.y - start.y) || 1;
        const adjustedEndX = start.x + signX * size;
        const adjustedEndY = start.y + signY * size;
        // Recalculate center
        const cx = start.x + (adjustedEndX - start.x) / 2;
        const cy = start.y + (adjustedEndY - start.y) / 2;

        const points: Point[] = [];
        const segments = 64;
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            points.push(pt(
                cx + radiusX * Math.cos(angle),
                cy + radiusY * Math.sin(angle)
            ));
        }
        return points;
    }

    const points: Point[] = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        points.push(pt(
            centerX + radiusX * Math.cos(angle),
            centerY + radiusY * Math.sin(angle)
        ));
    }
    return points;
}

/**
 * Get isosceles triangle points
 */
export function getTriangle(start: Vec2, end: Vec2): Point[] {
    const width = end.x - start.x;
    const height = end.y - start.y;

    // Apex at top center, base at bottom
    const apex = pt(start.x + width / 2, start.y);
    const bottomLeft = pt(start.x, start.y + height);
    const bottomRight = pt(end.x, start.y + height);

    return [apex, bottomRight, bottomLeft, apex];
}

/**
 * Get line points
 * If isShift, snaps to nearest 45-degree angle
 */
export function getLine(start: Vec2, end: Vec2, isShift: boolean): Point[] {
    let finalEnd = { ...end };

    if (isShift) {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const angle = Math.atan2(dy, dx);
        const length = Math.sqrt(dx * dx + dy * dy);

        // Snap to nearest 45-degree increment (0, 45, 90, 135, 180, etc.)
        const snappedAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);

        finalEnd = {
            x: start.x + length * Math.cos(snappedAngle),
            y: start.y + length * Math.sin(snappedAngle)
        };
    }

    return [pt(start.x, start.y), pt(finalEnd.x, finalEnd.y)];
}

/**
 * Get arrow points (line with arrowhead)
 * If isShift, snaps line to nearest 45-degree angle
 */
export function getArrow(start: Vec2, end: Vec2, isShift: boolean): Point[] {
    let finalEnd = { ...end };

    if (isShift) {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const angle = Math.atan2(dy, dx);
        const length = Math.sqrt(dx * dx + dy * dy);

        // Snap to nearest 45-degree increment
        const snappedAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);

        finalEnd = {
            x: start.x + length * Math.cos(snappedAngle),
            y: start.y + length * Math.sin(snappedAngle)
        };
    }

    // Calculate arrowhead
    const dx = finalEnd.x - start.x;
    const dy = finalEnd.y - start.y;
    const theta = Math.atan2(dy, dx);
    const length = Math.sqrt(dx * dx + dy * dy);

    // Arrowhead size proportional to line length, capped
    const headLength = Math.min(20, length * 0.25);
    const headAngle = Math.PI / 6; // 30 degrees

    // Arrowhead tip angles (135 degrees offset from line direction)
    const tip1Angle = theta + Math.PI - headAngle;
    const tip2Angle = theta + Math.PI + headAngle;

    const tip1 = {
        x: finalEnd.x + headLength * Math.cos(tip1Angle),
        y: finalEnd.y + headLength * Math.sin(tip1Angle)
    };

    const tip2 = {
        x: finalEnd.x + headLength * Math.cos(tip2Angle),
        y: finalEnd.y + headLength * Math.sin(tip2Angle)
    };

    // Return path: line + arrowhead (go to tip1, back to end, to tip2)
    return [
        pt(start.x, start.y),
        pt(finalEnd.x, finalEnd.y),
        pt(tip1.x, tip1.y),
        pt(finalEnd.x, finalEnd.y),
        pt(tip2.x, tip2.y)
    ];
}

/**
 * Get shape points based on shape type
 */
export function getShapePoints(
    shapeType: string,
    start: Vec2,
    end: Vec2,
    isShift: boolean
): Point[] {
    switch (shapeType) {
        case 'rectangle':
            return getRect(start, end, isShift);
        case 'circle':
            return getCircle(start, end, isShift);
        case 'triangle':
            return getTriangle(start, end);
        case 'line':
            return getLine(start, end, isShift);
        case 'arrow':
            return getArrow(start, end, isShift);
        default:
            return getRect(start, end, isShift);
    }
}

// ==================== LASSO PATH SMOOTHING UTILITIES ====================

/**
 * Ramer-Douglas-Peucker point simplification
 * Reduces excessive points while preserving overall shape
 */
export function simplifyPoints(points: Point[], tolerance: number = 2): Point[] {
    if (points.length <= 2) return points;

    // Find the point furthest from the line between first and last
    let maxDist = 0;
    let maxIndex = 0;

    const first = points[0];
    const last = points[points.length - 1];

    for (let i = 1; i < points.length - 1; i++) {
        const dist = perpendicularDistance(points[i], first, last);
        if (dist > maxDist) {
            maxDist = dist;
            maxIndex = i;
        }
    }

    if (maxDist > tolerance) {
        const left = simplifyPoints(points.slice(0, maxIndex + 1), tolerance);
        const right = simplifyPoints(points.slice(maxIndex), tolerance);
        return [...left.slice(0, -1), ...right];
    } else {
        return [first, last];
    }
}

/**
 * Perpendicular distance from a point to a line segment
 */
function perpendicularDistance(point: Point, lineStart: Point, lineEnd: Point): number {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;

    if (dx === 0 && dy === 0) {
        return Math.sqrt((point.x - lineStart.x) ** 2 + (point.y - lineStart.y) ** 2);
    }

    const t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (dx * dx + dy * dy);
    const closestX = lineStart.x + t * dx;
    const closestY = lineStart.y + t * dy;

    return Math.sqrt((point.x - closestX) ** 2 + (point.y - closestY) ** 2);
}

/**
 * Catmull-Rom spline interpolation
 * Creates smooth curves through all control points
 * @param points - Control points
 * @param segmentsPerCurve - Number of interpolated points between each pair
 * @param tension - Spline tension (0 = loose, 1 = tight). Default 0.5
 */
export function catmullRomSpline(points: Point[], segmentsPerCurve: number = 6, tension: number = 0.5): Point[] {
    if (points.length < 3) return points;

    const result: Point[] = [];
    const alpha = tension;

    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[Math.min(points.length - 1, i + 1)];
        const p3 = points[Math.min(points.length - 1, i + 2)];

        for (let t = 0; t < segmentsPerCurve; t++) {
            const s = t / segmentsPerCurve;
            const s2 = s * s;
            const s3 = s2 * s;

            // Catmull-Rom basis functions
            const b0 = -alpha * s3 + 2 * alpha * s2 - alpha * s;
            const b1 = (2 - alpha) * s3 + (alpha - 3) * s2 + 1;
            const b2 = (alpha - 2) * s3 + (3 - 2 * alpha) * s2 + alpha * s;
            const b3 = alpha * s3 - alpha * s2;

            result.push({
                x: b0 * p0.x + b1 * p1.x + b2 * p2.x + b3 * p3.x,
                y: b0 * p0.y + b1 * p1.y + b2 * p2.y + b3 * p3.y,
                pressure: 0.5,
            });
        }
    }

    // Add the last point
    result.push(points[points.length - 1]);
    return result;
}

// ==================== LASSO SELECTION UTILITIES ====================

/**
 * Bounding Box interface
 */
export interface BoundingBox {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}

/**
 * Check if a point is inside a polygon using the ray casting algorithm
 */
export function isPointInPolygon(point: Point, polygon: Point[]): boolean {
    if (polygon.length < 3) return false;

    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;

        const intersect = ((yi > point.y) !== (yj > point.y))
            && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

/**
 * Get bounding box for a set of points
 */
export function getPointsBoundingBox(points: Point[]): BoundingBox {
    if (points.length === 0) {
        return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }

    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);

    return {
        minX: Math.min(...xs),
        maxX: Math.max(...xs),
        minY: Math.min(...ys),
        maxY: Math.max(...ys),
    };
}

/**
 * Check if two bounding boxes overlap
 */
export function doBBoxesOverlap(bbox1: BoundingBox, bbox2: BoundingBox): boolean {
    return !(bbox1.maxX < bbox2.minX ||
        bbox2.maxX < bbox1.minX ||
        bbox1.maxY < bbox2.minY ||
        bbox2.maxY < bbox1.minY);
}

/**
 * Check if a stroke intersects with a selection polygon
 * Uses bounding box optimization first, then point-in-polygon test
 */
export function doesStrokeIntersectSelection(
    strokePoints: Point[],
    selectionPoly: Point[]
): boolean {
    if (strokePoints.length === 0 || selectionPoly.length < 3) {
        return false;
    }

    // Quick bounding box check first
    const strokeBBox = getPointsBoundingBox(strokePoints);
    const polyBBox = getPointsBoundingBox(selectionPoly);

    if (!doBBoxesOverlap(strokeBBox, polyBBox)) {
        return false;
    }

    // Check if any stroke point is inside the polygon
    return strokePoints.some(point => isPointInPolygon(point, selectionPoly));
}

/**
 * Checks if a point is within a given distance to a line segment.
 */
export function distancePointToSegment(point: Point, lineStart: Point, lineEnd: Point): number {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;

    if (dx === 0 && dy === 0) {
        return Math.sqrt((point.x - lineStart.x) ** 2 + (point.y - lineStart.y) ** 2);
    }

    let t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (dx * dx + dy * dy);
    t = Math.max(0, Math.min(1, t)); // Constrain to segment

    const closestX = lineStart.x + t * dx;
    const closestY = lineStart.y + t * dy;

    return Math.sqrt((point.x - closestX) ** 2 + (point.y - closestY) ** 2);
}

/**
 * Check two line segments for intersection
 */
export function doLineSegmentsIntersect(p1: Point, p2: Point, p3: Point, p4: Point): boolean {
    const ccw = (A: Point, B: Point, C: Point) => (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
    return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
}

/**
 * Check if a stroke strictly touches/intersects the selection line/path
 * This acts like a pencil selection, selecting things physically crossed by the drawn lasso
 */
export function doesStrokeTouchSelection(
    strokePoints: Point[],
    selectionPath: Point[],
    tolerance: number = 5
): boolean {
    if (strokePoints.length === 0 || selectionPath.length < 2) {
        return false;
    }

    const strokeBBox = getPointsBoundingBox(strokePoints);
    const polyBBox = getPointsBoundingBox(selectionPath);
    
    // Add tolerance to BBox overlap check
    const expandedPolyBBox: BoundingBox = {
        minX: polyBBox.minX - tolerance,
        maxX: polyBBox.maxX + tolerance,
        minY: polyBBox.minY - tolerance,
        maxY: polyBBox.maxY + tolerance,
    };

    if (!doBBoxesOverlap(strokeBBox, expandedPolyBBox)) {
        return false;
    }

    // Fast check: distance from sparse selection path to dense stroke points
    // This is useful for long strokes that might barely graze the lasso
    for (let i = 0; i < selectionPath.length - 1; i++) {
        const segStart = selectionPath[i];
        const segEnd = selectionPath[i+1];
        
        // BBox check per segment optimization could be added here, but usually strokePoints is the larger set
        for (const p of strokePoints) {
            if (distancePointToSegment(p, segStart, segEnd) <= tolerance) {
                return true;
            }
        }
    }
    
    // Also check backwards (stroke segments cross lasso Points) for cases where stroke is sparse
    for (let i = 0; i < strokePoints.length - 1; i++) {
        const segStart = strokePoints[i];
        const segEnd = strokePoints[i+1];
        
        for (const p of selectionPath) {
            if (distancePointToSegment(p, segStart, segEnd) <= tolerance) {
                return true;
            }
        }
    }
    
    // Fallback rigorous intersection
    for (let i = 0; i < selectionPath.length - 1; i++) {
        for (let j = 0; j < strokePoints.length - 1; j++) {
            if (doLineSegmentsIntersect(selectionPath[i], selectionPath[i+1], strokePoints[j], strokePoints[j+1])) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Get bounding box for multiple strokes
 */
export function getStrokesBoundingBox(strokes: Array<{ points: Point[] }>): BoundingBox & { width: number; height: number } {
    const allPoints = strokes.flatMap(s => s.points);
    const bbox = getPointsBoundingBox(allPoints);

    return {
        ...bbox,
        width: bbox.maxX - bbox.minX,
        height: bbox.maxY - bbox.minY,
    };
}

/**
 * Check if a point is inside a bounding box
 */
export function isPointInBBox(point: Point, bbox: BoundingBox): boolean {
    return point.x >= bbox.minX &&
        point.x <= bbox.maxX &&
        point.y >= bbox.minY &&
        point.y <= bbox.maxY;
}

/**
 * Scale a point relative to a center point
 * Used for resizing stroke selections
 */
export function scalePoint(point: Point, center: Point, scaleX: number, scaleY: number): Point {
    return {
        x: center.x + (point.x - center.x) * scaleX,
        y: center.y + (point.y - center.y) * scaleY,
        pressure: point.pressure,
    };
}

/**
 * Rotate a point around a center by a given angle (radians)
 */
export function rotatePoint(point: Point, center: { x: number; y: number }, angle: number): Point {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    return {
        x: center.x + dx * cos - dy * sin,
        y: center.y + dx * sin + dy * cos,
        pressure: point.pressure,
    };
}

/**
 * Rotate multiple points around a center by a given angle (radians)
 */
export function rotatePoints(points: Point[], center: { x: number; y: number }, angle: number): Point[] {
    return points.map(p => rotatePoint(p, center, angle));
}

/**
 * Check if a text node intersects with a selection polygon
 * Estimates text bounds and checks if the rectangle overlaps with the lasso
 */
export interface TextNodeBounds {
    id: string;
    x: number;
    y: number;
    content: string;
    fontSize: number;
}

export function doesTextIntersectSelection(
    textNode: TextNodeBounds,
    selectionPoly: Point[]
): boolean {
    if (selectionPoly.length < 3) return false;

    // Estimate text dimensions
    const width = textNode.content.length * (textNode.fontSize * 0.6);
    const height = textNode.fontSize * 1.2;

    // Text node bounding box
    const textBBox: BoundingBox = {
        minX: textNode.x,
        maxX: textNode.x + width,
        minY: textNode.y,
        maxY: textNode.y + height,
    };

    // Quick bounding box check
    const polyBBox = getPointsBoundingBox(selectionPoly);
    if (!doBBoxesOverlap(textBBox, polyBBox)) {
        return false;
    }

    // Check if any corner of the text box is inside the polygon
    const corners: Point[] = [
        { x: textBBox.minX, y: textBBox.minY, pressure: 0.5 },
        { x: textBBox.maxX, y: textBBox.minY, pressure: 0.5 },
        { x: textBBox.maxX, y: textBBox.maxY, pressure: 0.5 },
        { x: textBBox.minX, y: textBBox.maxY, pressure: 0.5 },
    ];

    // Check if any corner is inside the polygon
    if (corners.some(corner => isPointInPolygon(corner, selectionPoly))) {
        return true;
    }

    // Check if the center of the text is inside the polygon
    const centerPoint: Point = {
        x: (textBBox.minX + textBBox.maxX) / 2,
        y: (textBBox.minY + textBBox.maxY) / 2,
        pressure: 0.5,
    };

    return isPointInPolygon(centerPoint, selectionPoly);
}

/**
 * Fallback to check if a regular unclosed line touches text
 */
export function doesTextTouchSelection(
    textNode: TextNodeBounds,
    selectionPath: Point[],
    tolerance: number = 5
): boolean {
    if (selectionPath.length < 2) return false;

    const width = textNode.content.length * (textNode.fontSize * 0.6);
    const height = textNode.fontSize * 1.2;

    const textBBox: BoundingBox = {
        minX: textNode.x - tolerance,
        maxX: textNode.x + width + tolerance,
        minY: textNode.y - tolerance,
        maxY: textNode.y + height + tolerance,
    };

    const polyBBox = getPointsBoundingBox(selectionPath);
    if (!doBBoxesOverlap(textBBox, polyBBox)) {
        return false;
    }

    const corners: Point[] = [
        { x: textNode.x, y: textNode.y, pressure: 0.5 },
        { x: textNode.x + width, y: textNode.y, pressure: 0.5 },
        { x: textNode.x + width, y: textNode.y + height, pressure: 0.5 },
        { x: textNode.x, y: textNode.y + height, pressure: 0.5 },
    ];
    
    // Check if lasso path intersects bounding box edges
    for (let i = 0; i < selectionPath.length - 1; i++) {
        const segStart = selectionPath[i];
        const segEnd = selectionPath[i+1];
        
        // Fast point in extended bbox check
        if (segStart.x >= textBBox.minX && segStart.x <= textBBox.maxX && segStart.y >= textBBox.minY && segStart.y <= textBBox.maxY) {
             return true;          
        }
        
        // Edge intersection check
        for(let j = 0; j < 4; j++) {
             if (doLineSegmentsIntersect(segStart, segEnd, corners[j], corners[(j+1)%4])) {
                 return true;
             }
        }
    }

    return false;
}
