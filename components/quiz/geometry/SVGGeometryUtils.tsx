/**
 * 🎨 SVG GEOMETRY UTILITIES
 *
 * Shared SVG primitive components used by all geometry renderers.
 * Provides consistent visual language: edges, labels, angle arcs,
 * right-angle markers, tick marks, and parallel arrows.
 */

import React from 'react';
import { Point, midpoint, angleBetween, dist, deg2rad } from './layoutEngine';

// ============================================================================
// EDGE LINE — Solid, dashed, or extended with arrows
// ============================================================================

interface EdgeLineProps {
  from: Point;
  to: Point;
  dashed?: boolean;
  extended?: boolean;
  color?: string;
  strokeWidth?: number;
}

export const EdgeLine: React.FC<EdgeLineProps> = ({
  from, to, dashed = false, extended = false, color, strokeWidth = 2
}) => {
  let actualFrom = from;
  let actualTo = to;

  // Extend the line beyond both endpoints for "infinite line" appearance
  if (extended) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const ext = 20;
    actualFrom = { x: from.x - (dx / len) * ext, y: from.y - (dy / len) * ext };
    actualTo = { x: to.x + (dx / len) * ext, y: to.y + (dy / len) * ext };
  }

  return (
    <line
      x1={actualFrom.x}
      y1={actualFrom.y}
      x2={actualTo.x}
      y2={actualTo.y}
      className={color ? undefined : 'stroke-gray-800 dark:stroke-gray-200'}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeDasharray={dashed ? '6 4' : undefined}
      strokeLinecap="round"
    />
  );
};

// ============================================================================
// VERTEX LABEL — Smart text placement near a vertex
// ============================================================================

interface VertexLabelProps {
  label: string;
  position: Point;
  /** Direction to offset the label (away from shape center) */
  offsetDir?: { x: number; y: number };
  fontSize?: number;
  bold?: boolean;
  color?: string;
}

export const VertexLabel: React.FC<VertexLabelProps> = ({
  label, position, offsetDir, fontSize = 16, bold = true, color
}) => {
  const offset = offsetDir || { x: 0, y: 0 };
  const dist = 18;

  // Normalize offset direction
  const len = Math.sqrt(offset.x ** 2 + offset.y ** 2) || 1;
  const nx = (offset.x / len) * dist;
  const ny = (offset.y / len) * dist;

  return (
    <text
      x={position.x + nx}
      y={position.y + ny}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={fontSize}
      fontWeight={bold ? 700 : 400}
      fontFamily="'Inter', system-ui, sans-serif"
      className={color ? undefined : 'fill-gray-900 dark:fill-gray-100'}
      fill={color}
    >
      {label}
    </text>
  );
};

/**
 * Auto-compute label offset direction: push label AWAY from the centroid
 * of all other vertices for clean placement.
 */
export function computeLabelOffset(
  vertex: Point,
  allVertices: Point[]
): { x: number; y: number } {
  if (allVertices.length <= 1) return { x: 0, y: -1 };

  const cx = allVertices.reduce((s, p) => s + p.x, 0) / allVertices.length;
  const cy = allVertices.reduce((s, p) => s + p.y, 0) / allVertices.length;

  const dx = vertex.x - cx;
  const dy = vertex.y - cy;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;

  return { x: dx / len, y: dy / len };
}

// ============================================================================
// DIMENSION LABEL — Measurement text along an edge
// ============================================================================

interface DimensionLabelProps {
  from: Point;
  to: Point;
  text: string;
  offset?: number;
  fontSize?: number;
}

export const DimensionLabel: React.FC<DimensionLabelProps> = ({
  from, to, text, offset = 16, fontSize = 13
}) => {
  const mid = midpoint(from, to);
  const angle = angleBetween(from, to);

  // Offset perpendicular to the edge
  const perpX = -Math.sin(angle) * offset;
  const perpY = Math.cos(angle) * offset;

  return (
    <>
      {/* Background for readability */}
      <rect
        x={mid.x + perpX - text.length * 3.5 - 3}
        y={mid.y + perpY - 9}
        width={text.length * 7 + 6}
        height={18}
        rx={4}
        className="fill-white dark:fill-gray-900"
        opacity={0.85}
      />
      <text
        x={mid.x + perpX}
        y={mid.y + perpY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={fontSize}
        fontWeight={600}
        fontFamily="'Inter', system-ui, sans-serif"
        className="fill-blue-600 dark:fill-blue-400"
      >
        {text}
      </text>
    </>
  );
};

// ============================================================================
// ANGLE ARC — Small arc at a vertex showing the angle
// ============================================================================

interface AngleArcProps {
  vertex: Point;
  from: Point;
  to: Point;
  label: string;
  radius?: number;
  isUnknown?: boolean;
}

export const AngleArc: React.FC<AngleArcProps> = ({
  vertex, from, to, label, radius = 28, isUnknown = false
}) => {
  // Compute angles from vertex to each adjacent point
  let startAngle = angleBetween(vertex, from);
  let endAngle = angleBetween(vertex, to);

  // Ensure we draw the smaller arc
  let sweep = endAngle - startAngle;
  if (sweep < 0) sweep += 2 * Math.PI;
  if (sweep > Math.PI) {
    // Swap to get the smaller arc
    const temp = startAngle;
    startAngle = endAngle;
    endAngle = temp;
    sweep = endAngle - startAngle;
    if (sweep < 0) sweep += 2 * Math.PI;
  }

  const startX = vertex.x + radius * Math.cos(startAngle);
  const startY = vertex.y + radius * Math.sin(startAngle);
  const endX = vertex.x + radius * Math.cos(endAngle);
  const endY = vertex.y + radius * Math.sin(endAngle);

  const largeArc = sweep > Math.PI ? 1 : 0;
  const sweepFlag = 1;

  // Label position at the bisector of the arc
  const bisectorAngle = startAngle + sweep / 2;
  const labelR = radius + 14;
  const labelX = vertex.x + labelR * Math.cos(bisectorAngle);
  const labelY = vertex.y + labelR * Math.sin(bisectorAngle);

  const arcColor = isUnknown ? '#f97316' : '#3b82f6'; // orange for unknown, blue for known

  return (
    <>
      <path
        d={`M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} ${sweepFlag} ${endX} ${endY}`}
        fill="none"
        stroke={arcColor}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <text
        x={labelX}
        y={labelY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={700}
        fontFamily="'Inter', system-ui, sans-serif"
        fill={arcColor}
      >
        {label}
      </text>
    </>
  );
};

// ============================================================================
// RIGHT ANGLE MARKER — Small square at a 90° vertex
// ============================================================================

interface RightAngleMarkerProps {
  vertex: Point;
  towards1: Point;
  towards2: Point;
  size?: number;
}

export const RightAngleMarker: React.FC<RightAngleMarkerProps> = ({
  vertex, towards1, towards2, size = 14
}) => {
  // Unit vectors from vertex to each adjacent point
  const d1 = dist(vertex, towards1) || 1;
  const d2 = dist(vertex, towards2) || 1;
  const u1 = { x: (towards1.x - vertex.x) / d1, y: (towards1.y - vertex.y) / d1 };
  const u2 = { x: (towards2.x - vertex.x) / d2, y: (towards2.y - vertex.y) / d2 };

  const p1 = { x: vertex.x + u1.x * size, y: vertex.y + u1.y * size };
  const corner = { x: p1.x + u2.x * size, y: p1.y + u2.y * size };
  const p2 = { x: vertex.x + u2.x * size, y: vertex.y + u2.y * size };

  return (
    <path
      d={`M ${p1.x} ${p1.y} L ${corner.x} ${corner.y} L ${p2.x} ${p2.y}`}
      fill="none"
      className="stroke-gray-700 dark:stroke-gray-300"
      strokeWidth={1.5}
      strokeLinejoin="miter"
    />
  );
};

// ============================================================================
// TICK MARKS — Equal side markers on edges
// ============================================================================

interface TickMarksProps {
  from: Point;
  to: Point;
  count: number;
  size?: number;
}

export const TickMarks: React.FC<TickMarksProps> = ({
  from, to, count, size = 8
}) => {
  const mid = midpoint(from, to);
  const angle = angleBetween(from, to);
  const perpAngle = angle + Math.PI / 2;

  const spacing = 5;
  const startOffset = -((count - 1) * spacing) / 2;

  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const along = startOffset + i * spacing;
        const cx = mid.x + along * Math.cos(angle);
        const cy = mid.y + along * Math.sin(angle);

        return (
          <line
            key={i}
            x1={cx + size / 2 * Math.cos(perpAngle)}
            y1={cy + size / 2 * Math.sin(perpAngle)}
            x2={cx - size / 2 * Math.cos(perpAngle)}
            y2={cy - size / 2 * Math.sin(perpAngle)}
            className="stroke-gray-700 dark:stroke-gray-300"
            strokeWidth={1.5}
          />
        );
      })}
    </>
  );
};

// ============================================================================
// PARALLEL ARROWS — ▸▸ markers on parallel lines
// ============================================================================

interface ParallelArrowsProps {
  from: Point;
  to: Point;
  count?: number;
}

export const ParallelArrows: React.FC<ParallelArrowsProps> = ({
  from, to, count = 2
}) => {
  const mid = midpoint(from, to);
  const angle = angleBetween(from, to);
  const arrowSize = 6;
  const spacing = 7;
  const startOffset = -((count - 1) * spacing) / 2;

  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const along = startOffset + i * spacing;
        const cx = mid.x + along * Math.cos(angle);
        const cy = mid.y + along * Math.sin(angle);

        // Arrow chevron pointing in the direction of the line
        const tipX = cx + arrowSize * Math.cos(angle);
        const tipY = cy + arrowSize * Math.sin(angle);
        const perpAngle = angle + Math.PI / 2;
        const wing1X = cx - arrowSize * 0.5 * Math.cos(angle) + arrowSize * 0.5 * Math.cos(perpAngle);
        const wing1Y = cy - arrowSize * 0.5 * Math.sin(angle) + arrowSize * 0.5 * Math.sin(perpAngle);
        const wing2X = cx - arrowSize * 0.5 * Math.cos(angle) - arrowSize * 0.5 * Math.cos(perpAngle);
        const wing2Y = cy - arrowSize * 0.5 * Math.sin(angle) - arrowSize * 0.5 * Math.sin(perpAngle);

        return (
          <path
            key={i}
            d={`M ${wing1X} ${wing1Y} L ${tipX} ${tipY} L ${wing2X} ${wing2Y}`}
            fill="none"
            className="stroke-gray-600 dark:stroke-gray-400"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}
    </>
  );
};

// ============================================================================
// LINE LABEL — Label for a named line (e.g., "l", "m", "t1")
// ============================================================================

interface LineLabelProps {
  position: Point;
  label: string;
  side?: 'left' | 'right';
}

export const LineLabel: React.FC<LineLabelProps> = ({ position, label, side = 'right' }) => {
  const offsetX = side === 'right' ? 14 : -14;
  return (
    <text
      x={position.x + offsetX}
      y={position.y - 8}
      textAnchor={side === 'right' ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={15}
      fontWeight={700}
      fontStyle="italic"
      fontFamily="'Inter', system-ui, sans-serif"
      className="fill-gray-700 dark:fill-gray-300"
    >
      {label}
    </text>
  );
};
