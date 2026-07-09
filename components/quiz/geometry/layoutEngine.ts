/**
 * 📐 GEOMETRY LAYOUT ENGINE
 * 
 * Pure math functions for computing vertex positions from figure_data.
 * Auto-layout: no explicit coordinates needed in JSON — positions are
 * computed from shape_type, dimensions, angles, and relationships.
 */

import type { FigureData } from '@/lib/types';

export type Point = { x: number; y: number };
export type Positions = Record<string, Point>;

export const SVG_WIDTH = 400;
export const SVG_HEIGHT = 340;
export const PADDING = 55;

// ============================================================================
// SHARED UTILITIES
// ============================================================================

/** Strip units and parse a numeric value from a dimension string like "12 cm" */
export function parseNumericValue(s: string): number | null {
  const match = s.match(/([\d.]+)/);
  return match ? parseFloat(match[1]) : null;
}

/** Degrees to radians */
export function deg2rad(d: number): number {
  return (d * Math.PI) / 180;
}

/** Radians to degrees */
export function rad2deg(r: number): number {
  return (r * 180) / Math.PI;
}

/** Distance between two points */
export function dist(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/** Midpoint between two points */
export function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/** Angle from point a to point b (in radians, standard math convention) */
export function angleBetween(a: Point, b: Point): number {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

/**
 * Normalize a set of positions to fit within the SVG viewBox,
 * centered with padding on all sides.
 */
export function normalizeToViewBox(
  positions: Positions,
  width = SVG_WIDTH,
  height = SVG_HEIGHT,
  padding = PADDING
): Positions {
  const points = Object.values(positions);
  if (points.length === 0) return positions;

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }

  const dataW = maxX - minX || 1;
  const dataH = maxY - minY || 1;
  const drawW = width - 2 * padding;
  const drawH = height - 2 * padding;
  const scale = Math.min(drawW / dataW, drawH / dataH);

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const svgCenterX = width / 2;
  const svgCenterY = height / 2;

  const result: Positions = {};
  for (const [label, p] of Object.entries(positions)) {
    result[label] = {
      x: Math.round(svgCenterX + (p.x - centerX) * scale),
      y: Math.round(svgCenterY + (p.y - centerY) * scale),
    };
  }
  return result;
}

/**
 * Get a dimension value from a dimensions map, trying both orderings (AB and BA)
 */
function getDim(dims: Record<string, string>, a: string, b: string): number | null {
  const val = dims[`${a}${b}`] || dims[`${b}${a}`];
  return val ? parseNumericValue(val) : null;
}

// ============================================================================
// TRIANGLE LAYOUT
// ============================================================================

export function computeTrianglePositions(data: FigureData): Positions {
  const verts = data.vertices || ['A', 'B', 'C'];
  const [v0, v1, v2] = verts; // v0 = apex, v1 = base-left, v2 = base-right
  const dims = data.dimensions || {};
  const angles = data.known_angles || {};

  // Parse sides
  let s01 = getDim(dims, v0, v1); // side from v0 to v1
  let s12 = getDim(dims, v1, v2); // side from v1 to v2 (base)
  let s02 = getDim(dims, v0, v2); // side from v0 to v2

  // Parse vertex angles
  let a0 = angles[v0] ? parseFloat(angles[v0]) : null;
  let a1 = angles[v1] ? parseFloat(angles[v1]) : null;
  let a2 = angles[v2] ? parseFloat(angles[v2]) : null;

  // Detect right angles from relationships
  const perp = data.relationships?.perpendicular;
  if (perp && Array.isArray(perp) && perp.length >= 2) {
    const e1 = perp[0] as string;
    const e2 = perp[1] as string;
    for (const ch of e1) {
      if (e2.includes(ch) && verts.includes(ch)) {
        if (ch === v0 && a0 === null) a0 = 90;
        if (ch === v1 && a1 === null) a1 = 90;
        if (ch === v2 && a2 === null) a2 = 90;
        break;
      }
    }
  }

  // Also check known_angles for "90°"
  if (a0 === 90 || a1 === 90 || a2 === 90) {
    // Right angle detected
  }

  // SAS: two sides + included angle → compute third side via law of cosines
  if (s01 !== null && s02 !== null && a0 !== null && s12 === null) {
    s12 = Math.sqrt(s01 ** 2 + s02 ** 2 - 2 * s01 * s02 * Math.cos(deg2rad(a0)));
  }
  if (s01 !== null && s12 !== null && a1 !== null && s02 === null) {
    s02 = Math.sqrt(s01 ** 2 + s12 ** 2 - 2 * s01 * s12 * Math.cos(deg2rad(a1)));
  }
  if (s02 !== null && s12 !== null && a2 !== null && s01 === null) {
    s01 = Math.sqrt(s02 ** 2 + s12 ** 2 - 2 * s02 * s12 * Math.cos(deg2rad(a2)));
  }

  // If we have 3 sides, compute positions using law of cosines
  if (s01 !== null && s12 !== null && s02 !== null) {
    // Place v1 at origin, v2 on x-axis
    const cosA1 = (s01 ** 2 + s12 ** 2 - s02 ** 2) / (2 * s01 * s12);
    const sinA1 = Math.sqrt(Math.max(0, 1 - cosA1 ** 2));

    const raw: Positions = {
      [v1]: { x: 0, y: 0 },
      [v2]: { x: s12, y: 0 },
      [v0]: { x: s01 * cosA1, y: -s01 * sinA1 }, // above the base
    };
    return normalizeToViewBox(raw);
  }

  // Right angle with partial side info
  if (a2 === 90) {
    const sideA = s02 || 100; // v0-v2 (vertical leg)
    const sideB = s12 || sideA * 0.8; // v1-v2 (horizontal leg)
    const raw: Positions = {
      [v2]: { x: 0, y: 0 },
      [v0]: { x: 0, y: -sideA },
      [v1]: { x: sideB, y: 0 },
    };
    return normalizeToViewBox(raw);
  }
  if (a1 === 90) {
    const sideA = s01 || 100;
    const sideB = s12 || sideA * 0.8;
    const raw: Positions = {
      [v1]: { x: 0, y: 0 },
      [v0]: { x: 0, y: -sideA },
      [v2]: { x: sideB, y: 0 },
    };
    return normalizeToViewBox(raw);
  }
  if (a0 === 90) {
    const sideA = s01 || 100;
    const sideB = s02 || sideA * 0.8;
    const raw: Positions = {
      [v0]: { x: 0, y: 0 },
      [v1]: { x: -sideA, y: 0 },
      [v2]: { x: 0, y: sideB },
    };
    return normalizeToViewBox(raw);
  }

  // Default: nice generic triangle (apex at top)
  const raw: Positions = {
    [v0]: { x: 150, y: 0 },
    [v1]: { x: 0, y: 250 },
    [v2]: { x: 300, y: 250 },
  };
  return normalizeToViewBox(raw);
}

// ============================================================================
// LINES AND ANGLES LAYOUT
// ============================================================================

export function computeLinesAndAnglesPositions(data: FigureData): {
  positions: Positions;
  lines: { label: string; from: Point; to: Point }[];
} {
  const rels = data.relationships || {};
  const parallelLines = rels.parallel || [];
  const transversals = rels.transversal_lines || [];

  const lineSpacing = 160;
  const lineWidth = 340;
  const startX = 30;
  const lines: { label: string; from: Point; to: Point }[] = [];
  const positions: Positions = {};

  // Draw parallel lines horizontally
  parallelLines.forEach((lineName, i) => {
    const y = 80 + i * lineSpacing;
    const from = { x: startX, y };
    const to = { x: startX + lineWidth, y };
    lines.push({ label: lineName, from, to });
  });

  // Draw transversals crossing the parallel lines
  const numTransversals = transversals.length || 1;
  transversals.forEach((tName, i) => {
    const xCenter = startX + lineWidth * (0.3 + (i * 0.4) / Math.max(1, numTransversals - 1));
    const topY = 30;
    const bottomY = 80 + (parallelLines.length - 1) * lineSpacing + 50;
    // Slight slant for visual clarity
    const slant = (i % 2 === 0) ? 30 : -20;
    const from = { x: xCenter - slant, y: topY };
    const to = { x: xCenter + slant, y: bottomY };
    lines.push({ label: tName, from, to });

    // Compute intersection points with parallel lines
    parallelLines.forEach((pName, j) => {
      const pY = 80 + j * lineSpacing;
      // Linear interpolation to find x at pY
      const t = (pY - from.y) / (to.y - from.y);
      const pX = from.x + t * (to.x - from.x);
      // Name intersection point
      const intersectionLabel = `${tName}_${pName}`;
      positions[intersectionLabel] = { x: pX, y: pY };
    });
  });

  return { positions, lines };
}

// ============================================================================
// CIRCLE LAYOUT
// ============================================================================

export type CircleLayoutResult = {
  positions: Positions;
  circles: { center: Point; radius: number }[];
  chordEdges: string[];
  radiusEdges: string[];
  diameterEdge: string | null;
  tangentLine: { from: Point; to: Point; label: string } | null;
  inscribedTriangleVerts: string[];
};

export function computeCirclePositions(data: FigureData): CircleLayoutResult {
  const verts = data.vertices || [];
  const dims = data.dimensions || {};
  const rels = data.relationships || {};

  const cx = SVG_WIDTH / 2;
  const cy = SVG_HEIGHT / 2;
  const circleRadius = 120;

  const positions: Positions = {};
  const centerLabel = (rels.center || data.center || 'O') as string;
  positions[centerLabel] = { x: cx, y: cy };

  let chordEdges: string[] = [];
  let radiusEdges: string[] = [];
  let diameterEdge: string | null = null;
  let tangentLine: CircleLayoutResult['tangentLine'] = null;
  let inscribedTriangleVerts: string[] = [];

  // Handle chord with perpendicular from center
  if (rels.chord) {
    const chordName = rels.chord as string;
    const chordVerts = chordName.split('');
    chordEdges.push(chordName);

    // Place chord horizontally below center
    const perpDist = circleRadius * 0.7;
    const halfChord = Math.sqrt(Math.max(0, circleRadius ** 2 - perpDist ** 2));

    if (chordVerts.length >= 2) {
      positions[chordVerts[0]] = { x: cx - halfChord, y: cy + perpDist };
      positions[chordVerts[1]] = { x: cx + halfChord, y: cy + perpDist };
    }

    // Midpoint (M) if in vertices
    const midLabel = verts.find(v => !chordVerts.includes(v) && v !== centerLabel && v !== 'M') || 'M';
    if (verts.includes('M') || verts.includes(midLabel)) {
      const mLabel = verts.includes('M') ? 'M' : midLabel;
      positions[mLabel] = { x: cx, y: cy + perpDist };
    }

    // Radius to chord endpoint
    if (chordVerts[0]) {
      radiusEdges.push(`${centerLabel}${chordVerts[0]}`);
    }
  }

  // Handle diameter
  if (rels.diameter) {
    const diaName = rels.diameter as string;
    const diaVerts = diaName.split('');
    diameterEdge = diaName;

    if (diaVerts.length >= 2) {
      // Place diameter at a slight angle for visual interest
      const angle = deg2rad(-15);
      positions[diaVerts[0]] = {
        x: cx + circleRadius * Math.cos(angle + Math.PI),
        y: cy + circleRadius * Math.sin(angle + Math.PI),
      };
      positions[diaVerts[1]] = {
        x: cx + circleRadius * Math.cos(angle),
        y: cy + circleRadius * Math.sin(angle),
      };
    }
  }

  // Handle tangent line
  if (rels.tangent) {
    const tangentStr = rels.tangent as string;
    // Parse "MN at A"
    const match = tangentStr.match(/(\w+)\s+at\s+(\w)/);
    if (match) {
      const tangentLineName = match[1];
      const tangentPoint = match[2];
      const tangentVerts = tangentLineName.split('');

      // Place tangent point on the circle (top-right quadrant)
      const tangentAngle = deg2rad(-50);
      const tpX = cx + circleRadius * Math.cos(tangentAngle);
      const tpY = cy + circleRadius * Math.sin(tangentAngle);
      positions[tangentPoint] = { x: tpX, y: tpY };

      // Tangent is perpendicular to radius at the contact point
      const tangentDir = tangentAngle + Math.PI / 2; // perpendicular to radius
      const tangentLen = 100;

      if (tangentVerts.length >= 2) {
        positions[tangentVerts[0]] = {
          x: tpX - tangentLen * Math.cos(tangentDir),
          y: tpY - tangentLen * Math.sin(tangentDir),
        };
        positions[tangentVerts[1]] = {
          x: tpX + tangentLen * Math.cos(tangentDir),
          y: tpY + tangentLen * Math.sin(tangentDir),
        };
      }

      tangentLine = {
        from: positions[tangentVerts[0]],
        to: positions[tangentVerts[1]],
        label: tangentLineName,
      };
    }
  }

  // Handle inscribed triangle
  if (rels.triangle_inscribed) {
    const triStr = rels.triangle_inscribed as string;
    const triVerts = triStr.split('');
    inscribedTriangleVerts = triVerts;

    // Place triangle vertices on the circle
    triVerts.forEach((v, i) => {
      if (!positions[v]) {
        // Distribute around circle, starting from top
        const angle = deg2rad(-90 + (i * 360) / triVerts.length + 30);
        positions[v] = {
          x: cx + circleRadius * Math.cos(angle),
          y: cy + circleRadius * Math.sin(angle),
        };
      }
    });
  }

  return {
    positions,
    circles: [{ center: { x: cx, y: cy }, radius: circleRadius }],
    chordEdges,
    radiusEdges,
    diameterEdge,
    tangentLine,
    inscribedTriangleVerts,
  };
}

// ============================================================================
// COMPOSITE LAYOUT (e.g., right triangle + incircle)
// ============================================================================

export type CompositeLayoutResult = {
  positions: Positions;
  incircle: { center: Point; radius: number } | null;
  rightAngleVertex: string | null;
};

export function computeCompositePositions(data: FigureData): CompositeLayoutResult {
  const components = data.components || [];
  const verts = data.vertices || ['A', 'B', 'C'];
  const dims = data.dimensions || {};
  const rels = data.relationships || {};
  const angles = data.known_angles || {};

  let rightAngleVertex: string | null = null;
  let incircle: CompositeLayoutResult['incircle'] = null;

  // Find the right angle vertex
  for (const v of verts) {
    if (angles[v] && parseFloat(angles[v]) === 90) {
      rightAngleVertex = v;
      break;
    }
  }

  // Check perpendicular relationships
  if (!rightAngleVertex && rels.perpendicular) {
    const perp = rels.perpendicular as string[];
    if (perp.length >= 2) {
      for (const ch of perp[0]) {
        if (perp[1].includes(ch) && verts.includes(ch)) {
          rightAngleVertex = ch;
          break;
        }
      }
    }
  }

  // Compute triangle positions
  // For a right triangle with incircle, compute the missing side from incircle radius
  const [v0, v1, v2] = verts;
  const rv = rightAngleVertex;

  if (rv && components.includes('right_triangle') && components.includes('incircle')) {
    const circleRadiusDim = dims['circle_radius'] || dims['radius'];
    const r = circleRadiusDim ? parseNumericValue(circleRadiusDim) : null;

    // Get the two legs
    const otherVerts = verts.filter(v => v !== rv);
    const [a, b] = otherVerts;

    let legA = getDim(dims, rv, a);
    let legB = getDim(dims, rv, b);

    // For a right triangle: r = (a + b - c) / 2, where c = hypotenuse
    // If we know r and one leg, compute the other
    if (r !== null && legA !== null && legB === null) {
      // r = (legA + legB - sqrt(legA² + legB²)) / 2
      // 2r = legA + legB - sqrt(legA² + legB²)
      // sqrt(legA² + legB²) = legA + legB - 2r
      // legA² + legB² = (legA + legB - 2r)²
      // legA² + legB² = legA² + legB² + 4r² + 2·legA·legB - 4r·legA - 4r·legB
      // 0 = 4r² + 2·legA·legB - 4r·legA - 4r·legB
      // 2·legA·legB = 4r·legA + 4r·legB - 4r²
      // legB = (4r·legA + 4r·legB - 4r²) / (2·legA)  — but legB is unknown
      // Actually: let's simplify
      // legB(2·legA - 4r) = 4r·legA - 4r²
      // legB = 4r(legA - r) / (2(legA - 2r))  = 2r(legA - r) / (legA - 2r)
      if (legA !== 2 * r) {
        legB = (2 * r * (legA - r)) / (legA - 2 * r);
      } else {
        legB = legA; // equilateral right triangle edge case
      }
    } else if (r !== null && legB !== null && legA === null) {
      if (legB !== 2 * r) {
        legA = (2 * r * (legB - r)) / (legB - 2 * r);
      } else {
        legA = legB;
      }
    }

    // Default legs if we still don't have them
    legA = legA || 120;
    legB = legB || 100;

    // Place right angle vertex at origin, legs along axes
    const rawPositions: Positions = {
      [rv]: { x: 0, y: 0 },
      [a]: { x: 0, y: -legA },
      [b]: { x: legB, y: 0 },
    };
    const positions = normalizeToViewBox(rawPositions);

    // Compute incircle center and radius in normalized coords
    if (r !== null) {
      const hyp = Math.sqrt(legA ** 2 + legB ** 2);
      const normalizedR = r * (dist(positions[rv], positions[a]) / legA);

      // Incircle center for right triangle is at (r, r) from the right angle vertex
      // In normalized space, offset from rv toward the interior
      const rvP = positions[rv];
      const aP = positions[a];
      const bP = positions[b];

      // Direction vectors from rv to each leg
      const toA = { x: (aP.x - rvP.x) / dist(rvP, aP), y: (aP.y - rvP.y) / dist(rvP, aP) };
      const toB = { x: (bP.x - rvP.x) / dist(rvP, bP), y: (bP.y - rvP.y) / dist(rvP, bP) };

      incircle = {
        center: {
          x: rvP.x + normalizedR * (toA.x + toB.x),
          y: rvP.y + normalizedR * (toA.y + toB.y),
        },
        radius: normalizedR,
      };

      // Add incircle center point
      const incircleCenter = rels.inscribed?.center || 'O';
      if (incircleCenter) {
        positions[incircleCenter] = incircle.center;
      }
    }

    return { positions, incircle, rightAngleVertex: rv };
  }

  // Fallback: regular triangle
  const triPositions = computeTrianglePositions(data);
  return { positions: triPositions, incircle: null, rightAngleVertex };
}

// ============================================================================
// QUADRILATERAL LAYOUT
// ============================================================================

export function computeQuadrilateralPositions(data: FigureData): Positions {
  const verts = data.vertices || ['A', 'B', 'C', 'D'];
  const [v0, v1, v2, v3] = verts;
  const dims = data.dimensions || {};

  // Try to get side lengths
  const s01 = getDim(dims, v0, v1) || 100;
  const s12 = getDim(dims, v1, v2) || 80;

  // Default: rectangle-ish shape
  const raw: Positions = {
    [v0]: { x: 0, y: 0 },
    [v1]: { x: s01, y: 0 },
    [v2]: { x: s01, y: s12 },
    [v3]: { x: 0, y: s12 },
  };
  return normalizeToViewBox(raw);
}
