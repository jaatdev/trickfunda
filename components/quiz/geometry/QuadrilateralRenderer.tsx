import React, { useMemo } from 'react';
import type { FigureData } from '@/lib/types';
import { computeQuadrilateralPositions, SVG_WIDTH, SVG_HEIGHT } from './layoutEngine';
import { EdgeLine, VertexLabel, DimensionLabel, AngleArc, RightAngleMarker, computeLabelOffset } from './SVGGeometryUtils';

export const QuadrilateralRenderer: React.FC<{ data: FigureData }> = ({ data }) => {
  const {
    vertices = ['A', 'B', 'C', 'D'],
    dimensions = {},
    known_angles = {},
    unknown_angles = []
  } = data;

  const positions = useMemo(() => computeQuadrilateralPositions(data), [data]);

  const [v0, v1, v2, v3] = vertices;
  const p0 = positions[v0];
  const p1 = positions[v1];
  const p2 = positions[v2];
  const p3 = positions[v3];
  
  if (!p0 || !p1 || !p2 || !p3) return null;

  const allVerts = [p0, p1, p2, p3];

  const edges = [
    { from: p0, to: p1, fromL: v0, toL: v1 },
    { from: p1, to: p2, fromL: v1, toL: v2 },
    { from: p2, to: p3, fromL: v2, toL: v3 },
    { from: p3, to: p0, fromL: v3, toL: v0 },
  ];

  const getDim = (a: string, b: string) => dimensions[`${a}${b}`] || dimensions[`${b}${a}`];

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="w-full max-w-[400px] h-auto drop-shadow-sm"
        style={{ overflow: 'visible' }}
      >
        <polygon
          points={`${p0.x},${p0.y} ${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`}
          className="fill-indigo-50/50 dark:fill-indigo-900/20"
        />

        {edges.map((e, i) => (
          <React.Fragment key={`edge-${i}`}>
            <EdgeLine from={e.from} to={e.to} />
            {getDim(e.fromL, e.toL) && (
              <DimensionLabel from={e.from} to={e.to} text={getDim(e.fromL, e.toL)!} />
            )}
          </React.Fragment>
        ))}

        {vertices.map(v => {
          const pv = positions[v];
          if (!pv) return null;
          
          const adj = edges.filter(e => e.fromL === v || e.toL === v).map(e => e.fromL === v ? e.to : e.from);
          if (adj.length < 2) return null;

          if (known_angles[v] === '90°' || known_angles[v] === '90') {
            return <RightAngleMarker key={`right-${v}`} vertex={pv} towards1={adj[0]} towards2={adj[1]} />;
          }

          if (known_angles[v]) {
            return <AngleArc key={`angle-${v}`} vertex={pv} from={adj[0]} to={adj[1]} label={known_angles[v]} />;
          }

          if (unknown_angles.includes(v)) {
            const label = data.unknown_variable && v === data.unknown_variable ? '?' : 'θ';
            return <AngleArc key={`unk-${v}`} vertex={pv} from={adj[0]} to={adj[1]} label={label} isUnknown />;
          }

          return null;
        })}

        {vertices.map(v => (
          <VertexLabel
            key={`lbl-${v}`}
            label={v}
            position={positions[v]}
            offsetDir={computeLabelOffset(positions[v], allVerts)}
            color="#4338ca"
          />
        ))}
      </svg>
    </div>
  );
};
