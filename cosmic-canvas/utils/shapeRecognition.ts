export type Point = { x: number; y: number; pressure?: number };

export type ShapeType = 'line' | 'rectangle' | 'triangle' | 'circle';

export interface ShapeData {
  type: ShapeType;
  points: Point[];
  boundingBox: { x: number; y: number; width: number; height: number };
}

// Distance between two points
function distance(p1: Point, p2: Point): number {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

// Total length of a path
function pathLength(points: Point[]): number {
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    length += distance(points[i - 1], points[i]);
  }
  return length;
}

// Perpendicular distance from a point to a line segment
function perpendicularDistance(p: Point, p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const mag = Math.hypot(dx, dy);
  if (mag > 0) {
    return Math.abs(dx * (p1.y - p.y) - (p1.x - p.x) * dy) / mag;
  }
  return distance(p, p1);
}

// Ramer-Douglas-Peucker algorithm to simplify path
function simplifyPath(points: Point[], epsilon: number): Point[] {
  if (points.length < 3) return points;

  let dmax = 0;
  let index = 0;
  const end = points.length - 1;

  for (let i = 1; i < end; i++) {
    const d = perpendicularDistance(points[i], points[0], points[end]);
    if (d > dmax) {
      index = i;
      dmax = d;
    }
  }

  if (dmax > epsilon) {
    const left = simplifyPath(points.slice(0, index + 1), epsilon);
    const right = simplifyPath(points.slice(index), epsilon);
    return left.slice(0, left.length - 1).concat(right);
  } else {
    return [points[0], points[end]];
  }
}

// Calculate bounding box
function getBoundingBox(points: Point[]) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

// Main shape recognition heuristic
export function recognizeShape(points: Point[]): ShapeData | null {
  if (points.length < 10) return null;

  const bbox = getBoundingBox(points);
  const diag = Math.hypot(bbox.width, bbox.height);
  if (diag < 10) return null; // Too small

  const start = points[0];
  const end = points[points.length - 1];
  const gap = distance(start, end);
  const isClosed = gap < diag * 0.2; // 20% of diagonal threshold for closure

  const totalLength = pathLength(points);

  // Line detection
  if (!isClosed) {
    const straightDist = distance(start, end);
    // If the path length is very close to the straight line distance
    if (totalLength < straightDist * 1.15) {
      return {
        type: 'line',
        points: [start, end],
        boundingBox: bbox,
      };
    }
    return null; // Not a shape we recognize
  }

  // If closed, check circle
  const centerX = bbox.x + bbox.width / 2;
  const centerY = bbox.y + bbox.height / 2;
  const center = { x: centerX, y: centerY };
  
  let radiusSum = 0;
  let maxR = -Infinity;
  let minR = Infinity;

  // Subsample for circle check to avoid too many loops
  const step = Math.max(1, Math.floor(points.length / 40));
  let count = 0;
  for (let i = 0; i < points.length; i += step) {
    const r = distance(points[i], center);
    radiusSum += r;
    if (r > maxR) maxR = r;
    if (r < minR) minR = r;
    count++;
  }
  
  const avgRadius = radiusSum / count;
  // If the variance is small enough, it's a circle/ellipse
  if (maxR - minR < avgRadius * 0.4) {
    return {
      type: 'circle',
      points: [center, { x: avgRadius, y: 0 }], // encode center and radius
      boundingBox: bbox,
    };
  }

  // Simplify for polygon detection (rectangle, triangle)
  const epsilon = diag * 0.1; // 10% of diagonal
  // For polygons, make sure we have a fully closed loop in simplification
  const closedPoints = [...points, start];
  let simplified = simplifyPath(closedPoints, epsilon);
  
  // Remove duplicate last point if it exists
  if (distance(simplified[0], simplified[simplified.length - 1]) < epsilon) {
    simplified.pop();
  }

  const numCorners = simplified.length;

  if (numCorners === 3) {
    return {
      type: 'triangle',
      points: simplified,
      boundingBox: bbox,
    };
  }

  if (numCorners === 4) {
    // Determine if it's a rectangle by checking angles, or simply return as quadrilateral/rectangle
    // We'll normalize it to a perfect rectangle based on bounding box if it's axis-aligned
    // Or we could return the 4 points. For a "perfect" canvas rectangle, we usually use the bounding box.
    return {
      type: 'rectangle',
      points: [
        { x: bbox.x, y: bbox.y },
        { x: bbox.x + bbox.width, y: bbox.y },
        { x: bbox.x + bbox.width, y: bbox.y + bbox.height },
        { x: bbox.x, y: bbox.y + bbox.height }
      ],
      boundingBox: bbox,
    };
  }

  return null;
}
