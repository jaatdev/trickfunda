export type Point = { x: number; y: number; pressure?: number };

export type RecognizedShapeType = 
  | 'line' 
  | 'rectangle' 
  | 'triangle' 
  | 'right-triangle'
  | 'isosceles-triangle'
  | 'circle' 
  | 'semicircle' 
  | 'quarter-circle'
  | 'arc' 
  | 'pentagon' 
  | 'hexagon' 
  | 'star'
  | 'rhombus'
  | 'polygon'; // fallback

export interface ShapeData {
  type: RecognizedShapeType;
  points: Point[];
  boundingBox: { x: number; y: number; width: number; height: number };
}

function distance(p1: Point, p2: Point): number {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

function pathLength(points: Point[]): number {
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    length += distance(points[i - 1], points[i]);
  }
  return length;
}

function getAngle(p1: Point, p2: Point, p3: Point): number {
  const a = Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2);
  const b = Math.pow(p2.x - p3.x, 2) + Math.pow(p2.y - p3.y, 2);
  const c = Math.pow(p3.x - p1.x, 2) + Math.pow(p3.y - p1.y, 2);
  return Math.acos((a + b - c) / Math.sqrt(4 * a * b)) * (180 / Math.PI);
}

function perpendicularDistance(p: Point, p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const mag = Math.hypot(dx, dy);
  if (mag > 0) {
    return Math.abs(dx * (p1.y - p.y) - (p1.x - p.x) * dy) / mag;
  }
  return distance(p, p1);
}

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

function interpolatePath(points: Point[], spacing: number = 4): Point[] {
  if (points.length < 2) return points;
  const interpolated: Point[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const dist = distance(p1, p2);
    const steps = Math.max(1, Math.floor(dist / spacing));
    for (let j = 0; j < steps; j++) {
      interpolated.push({
        x: p1.x + (p2.x - p1.x) * (j / steps),
        y: p1.y + (p2.y - p1.y) * (j / steps),
      });
    }
  }
  interpolated.push(points[points.length - 1]);
  return interpolated;
}

// Fit a circle using Kasa method (basic least squares)
function fitCircle(points: Point[]) {
  const length = points.length;
  let sumX = 0, sumY = 0, sumX2 = 0, sumY2 = 0, sumXY = 0;
  let sumX3 = 0, sumY3 = 0, sumX2Y = 0, sumXY2 = 0;

  for (let i = 0; i < length; i++) {
    const x = points[i].x;
    const y = points[i].y;
    const x2 = x * x;
    const y2 = y * y;
    
    sumX += x;
    sumY += y;
    sumX2 += x2;
    sumY2 += y2;
    sumXY += x * y;
    sumX3 += x2 * x;
    sumY3 += y2 * y;
    sumX2Y += x2 * y;
    sumXY2 += x * y2;
  }

  const C = length * sumX2 - sumX * sumX;
  const D = length * sumXY - sumX * sumY;
  const E = length * sumX3 + length * sumXY2 - (sumX2 + sumY2) * sumX;
  const G = length * sumY2 - sumY * sumY;
  const H = length * sumX2Y + length * sumY3 - (sumX2 + sumY2) * sumY;

  const a = (H * D - E * G) / (C * G - D * D);
  const b = (H * C - E * D) / (D * D - G * C);
  const c = -(a * sumX + b * sumY + sumX2 + sumY2) / length;

  const centerX = a / -2;
  const centerY = b / -2;
  const radius = Math.sqrt(a * a + b * b - 4 * c) / 2;

  // Calculate variance (error)
  let error = 0;
  for (let i = 0; i < length; i++) {
    const dist = distance(points[i], { x: centerX, y: centerY });
    error += Math.abs(dist - radius);
  }
  
  return { center: { x: centerX, y: centerY }, radius, avgError: error / length };
}

export function recognizeShape(points: Point[]): ShapeData | null {
  if (points.length < 10) return null;

  const bbox = getBoundingBox(points);
  const diag = Math.hypot(bbox.width, bbox.height);
  if (diag < 15) return null; 

  const start = points[0];
  const end = points[points.length - 1];
  const gap = distance(start, end);
  const isClosed = gap < diag * 0.25; 
  const totalLen = pathLength(points);
  const straightDist = distance(start, end);

  // 1. Line Detection
  if (!isClosed && totalLen < straightDist * 1.1) {
    return { type: 'line', points: interpolatePath([start, end]), boundingBox: bbox };
  }

  // 2. Curve / Circle Detection
  const circleFit = fitCircle(points);
  const isCurved = circleFit.avgError < circleFit.radius * 0.15; // 15% tolerance

  if (isCurved) {
    if (isClosed) {
      return { 
        type: 'circle', 
        points: [circleFit.center, { x: circleFit.radius, y: 0 }], // center, radius encoded
        boundingBox: bbox 
      };
    } else {
      // Arc, Semicircle, or Quarter-circle
      const midPoint = points[Math.floor(points.length / 2)];
      let startAngle = Math.atan2(start.y - circleFit.center.y, start.x - circleFit.center.x);
      let endAngle = Math.atan2(end.y - circleFit.center.y, end.x - circleFit.center.x);
      
      // Determine direction (clockwise or counter-clockwise)
      const cross = (end.x - start.x) * (midPoint.y - start.y) - (end.y - start.y) * (midPoint.x - start.x);
      const isClockwise = cross > 0;
      
      if (isClockwise) {
        if (endAngle < startAngle) endAngle += Math.PI * 2;
      } else {
        if (startAngle < endAngle) startAngle += Math.PI * 2;
      }

      let angleDiff = Math.abs(endAngle - startAngle);
      
      const isSemicircle = Math.abs(angleDiff - Math.PI) < 0.6; // ~180 degrees
      const isQuarterCircle = Math.abs(angleDiff - (Math.PI / 2)) < 0.4; // ~90 degrees
      
      // Generate clean arc points
      const segments = 32;
      const cleanArc = [];
      
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const a = startAngle + (endAngle - startAngle) * t;
        cleanArc.push({
          x: circleFit.center.x + circleFit.radius * Math.cos(a),
          y: circleFit.center.y + circleFit.radius * Math.sin(a),
        });
      }

      let type: RecognizedShapeType = 'arc';
      if (isSemicircle) type = 'semicircle';
      else if (isQuarterCircle) type = 'quarter-circle';

      return {
        type,
        points: interpolatePath(cleanArc, 2),
        boundingBox: bbox
      };
    }
  }

  // 3. Polygon Detection
  const closedPoints = isClosed ? [...points, start] : points;
  let epsilon = diag * 0.05; // 5% of diagonal
  let simplified = simplifyPath(closedPoints, epsilon);
  
  if (isClosed && distance(simplified[0], simplified[simplified.length - 1]) < epsilon) {
    simplified.pop(); // Remove duplicate last point
  }

  const numCorners = simplified.length;

  // Triangles
  if (numCorners === 3 && isClosed) {
    const a = distance(simplified[0], simplified[1]);
    const b = distance(simplified[1], simplified[2]);
    const c = distance(simplified[2], simplified[0]);
    
    // Check right angle
    const angles = [
      getAngle(simplified[2], simplified[0], simplified[1]), // Angle at 0
      getAngle(simplified[0], simplified[1], simplified[2]), // Angle at 1
      getAngle(simplified[1], simplified[2], simplified[0])  // Angle at 2
    ];
    
    const isRight = angles.some(ang => Math.abs(ang - 90) < 15);
    const isIsosceles = Math.abs(a - b) < diag * 0.1 || Math.abs(b - c) < diag * 0.1 || Math.abs(a - c) < diag * 0.1;
    
    // Auto-perfect the right angle if it exists
    let outPoints = [...simplified, simplified[0]];
    if (isRight) {
       return { type: 'right-triangle', points: interpolatePath(outPoints), boundingBox: bbox };
    } else if (isIsosceles) {
       return { type: 'isosceles-triangle', points: interpolatePath(outPoints), boundingBox: bbox };
    }
    
    return { type: 'triangle', points: interpolatePath(outPoints), boundingBox: bbox };
  }

  // Quadrilaterals
  if (numCorners === 4 && isClosed) {
    const d1 = distance(simplified[0], simplified[1]);
    const d2 = distance(simplified[1], simplified[2]);
    const d3 = distance(simplified[2], simplified[3]);
    const d4 = distance(simplified[3], simplified[0]);
    
    const diag1 = distance(simplified[0], simplified[2]);
    const diag2 = distance(simplified[1], simplified[3]);

    const isRect = Math.abs(diag1 - diag2) < diag * 0.15;
    const isRhombus = Math.abs(d1 - d2) < diag * 0.1 && Math.abs(d2 - d3) < diag * 0.1;

    if (isRect) {
      return {
        type: 'rectangle',
        points: interpolatePath([
          { x: bbox.x, y: bbox.y },
          { x: bbox.x + bbox.width, y: bbox.y },
          { x: bbox.x + bbox.width, y: bbox.y + bbox.height },
          { x: bbox.x, y: bbox.y + bbox.height },
          { x: bbox.x, y: bbox.y } // closed
        ]),
        boundingBox: bbox
      };
    } else if (isRhombus) {
      return { type: 'rhombus', points: interpolatePath([...simplified, simplified[0]]), boundingBox: bbox };
    }
    return { type: 'polygon', points: interpolatePath([...simplified, simplified[0]]), boundingBox: bbox };
  }

  if (numCorners === 5 && isClosed) {
    return { type: 'pentagon', points: interpolatePath([...simplified, simplified[0]]), boundingBox: bbox };
  }

  if (numCorners === 6 && isClosed) {
    return { type: 'hexagon', points: interpolatePath([...simplified, simplified[0]]), boundingBox: bbox };
  }

  if (numCorners === 10 || numCorners === 12) {
    if (isClosed) {
      return { type: 'star', points: interpolatePath([...simplified, simplified[0]]), boundingBox: bbox };
    }
  }

  return null;
}
