import React, { useMemo } from 'react';
import type { FigureData } from '@/lib/types';
import { computeTrianglePositions, SVG_WIDTH, SVG_HEIGHT, Point, dist } from './layoutEngine';
import { EdgeLine, VertexLabel, DimensionLabel, AngleArc, RightAngleMarker, TickMarks, computeLabelOffset } from './SVGGeometryUtils';

export const TriangleRenderer: React.FC<{ data: FigureData }> = ({ data }) => {
  const {
    vertices = ['A', 'B', 'C'],
    dimensions = {},
    known_angles = {},
    unknown_angles = [],
    relationships = {},
    tick_marks = {}
  } = data;

  const [v0, v1, v2] = vertices;

  // Precompute layout positions
  const positions = useMemo(() => computeTrianglePositions(data), [data]);

  const p0 = positions[v0];
  const p1 = positions[v1];
  const p2 = positions[v2];
  if (!p0 || !p1 || !p2) return null;

  // Determine label offsets pushing outward
  const allVerts = [p0, p1, p2];
  const off0 = computeLabelOffset(p0, allVerts);
  const off1 = computeLabelOffset(p1, allVerts);
  const off2 = computeLabelOffset(p2, allVerts);

  // Helper to safely check perpendiculars
  const isRightAngle = (v: string) => {
    if (known_angles[v] === '90°' || known_angles[v] === '90') return true;
    const p = relationships.perpendicular;
    if (p && Array.isArray(p) && p.length >= 2) {
      return p[0].includes(v) && p[1].includes(v);
    }
    return false;
  };

  // Helper to find dimension text for an edge
  const getDim = (a: string, b: string) => dimensions[`${a}${b}`] || dimensions[`${b}${a}`];

  // Helper to get tick count for an edge
  const getTicks = (a: string, b: string) => {
    const k1 = `${a}${b}`;
    const k2 = `${b}${a}`;
    if (tick_marks[k1]) return tick_marks[k1];
    if (tick_marks[k2]) return tick_marks[k2];
    
    // Check equal_sides relationships
    const eq = relationships.equal_sides;
    if (eq && Array.isArray(eq)) {
      for (let i = 0; i < eq.length; i++) {
        if (eq[i].includes(k1) || eq[i].includes(k2)) {
          return i + 1; // 1 tick for first group, 2 for second, etc.
        }
      }
    }
    return 0;
  };

  // Edges to draw
  const edges = [
    { from: p0, to: p1, fromL: v0, toL: v1 },
    { from: p1, to: p2, fromL: v1, toL: v2 },
    { from: p2, to: p0, fromL: v2, toL: v0 },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="w-full max-w-[400px] h-auto drop-shadow-sm"
        style={{ overflow: 'visible' }}
      >
        {/* Fill polygon for base background */}
        <polygon
          points={`${p0.x},${p0.y} ${p1.x},${p1.y} ${p2.x},${p2.y}`}
          className="fill-blue-50/50 dark:fill-blue-900/20"
        />

        {/* Extended Lines if specified */}
        {data.extended_edges?.map(e => {
          const ep1 = positions[e[0]];
          const ep2 = positions[e[1]];
          if (!ep1 || !ep2) return null;
          return <EdgeLine key={`ext-${e}`} from={ep1} to={ep2} extended dashed color="#9ca3af" />;
        })}

        {/* Solid Edges & Tick Marks */}
        {edges.map((e, i) => (
          <React.Fragment key={`edge-${i}`}>
            <EdgeLine from={e.from} to={e.to} />
            {getTicks(e.fromL, e.toL) > 0 && (
              <TickMarks from={e.from} to={e.to} count={getTicks(e.fromL, e.toL)} />
            )}
          </React.Fragment>
        ))}

        {/* Known Angles */}
        {Object.entries(known_angles).map(([v, val]) => {
          if (val === '90°' || val === '90') return null; // handled by right angle marker
          const pv = positions[v];
          if (!pv) return null;
          // Find adjacent vertices for the arc
          const adj = edges.filter(e => e.fromL === v || e.toL === v).map(e => (e.fromL === v ? e.to : e.from));
          if (adj.length < 2) return null;
          return <AngleArc key={`angle-${v}`} vertex={pv} from={adj[0]} to={adj[1]} label={val} />;
        })}

        {/* Unknown Angles */}
        {unknown_angles.map(v => {
          const pv = positions[v];
          if (!pv) return null;
          const adj = edges.filter(e => e.fromL === v || e.toL === v).map(e => (e.fromL === v ? e.to : e.from));
          if (adj.length < 2) return null;
          const label = data.unknown_variable && v === data.unknown_variable ? '?' : 'θ';
          return <AngleArc key={`unk-${v}`} vertex={pv} from={adj[0]} to={adj[1]} label={label} isUnknown />;
        })}

        {/* Right Angle Markers */}
        {vertices.map(v => {
          if (!isRightAngle(v)) return null;
          const pv = positions[v];
          const adj = edges.filter(e => e.fromL === v || e.toL === v).map(e => (e.fromL === v ? e.to : e.from));
          if (adj.length < 2) return null;
          return <RightAngleMarker key={`right-${v}`} vertex={pv} towards1={adj[0]} towards2={adj[1]} />;
        })}

        {/* Dimensions */}
        {edges.map((e, i) => {
          const dim = getDim(e.fromL, e.toL);
          if (!dim) return null;
          return <DimensionLabel key={`dim-${i}`} from={e.from} to={e.to} text={dim} />;
        })}

        {/* Vertex Labels */}
        <VertexLabel label={v0} position={p0} offsetDir={off0} color="#1d4ed8" />
        <VertexLabel label={v1} position={p1} offsetDir={off1} color="#1d4ed8" />
        <VertexLabel label={v2} position={p2} offsetDir={off2} color="#1d4ed8" />
      </svg>
    </div>
  );
};
