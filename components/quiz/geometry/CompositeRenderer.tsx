import React, { useMemo } from 'react';
import type { FigureData } from '@/lib/types';
import { computeCompositePositions, SVG_WIDTH, SVG_HEIGHT } from './layoutEngine';
import { EdgeLine, VertexLabel, DimensionLabel, RightAngleMarker, computeLabelOffset } from './SVGGeometryUtils';

export const CompositeRenderer: React.FC<{ data: FigureData }> = ({ data }) => {
  const {
    vertices = ['A', 'B', 'C'],
    dimensions = {},
    relationships = {}
  } = data;

  const layout = useMemo(() => computeCompositePositions(data), [data]);
  const { positions, incircle, rightAngleVertex } = layout;

  const [v0, v1, v2] = vertices;
  const p0 = positions[v0];
  const p1 = positions[v1];
  const p2 = positions[v2];
  
  if (!p0 || !p1 || !p2) return null;

  const allVerts = [p0, p1, p2];

  const edges = [
    { from: p0, to: p1, fromL: v0, toL: v1 },
    { from: p1, to: p2, fromL: v1, toL: v2 },
    { from: p2, to: p0, fromL: v2, toL: v0 },
  ];

  const getDim = (a: string, b: string) => dimensions[`${a}${b}`] || dimensions[`${b}${a}`];

  // Specific center label for incircle
  const centerLabel = relationships.inscribed?.center || 'O';

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="w-full max-w-[400px] h-auto drop-shadow-sm"
        style={{ overflow: 'visible' }}
      >
        <polygon
          points={`${p0.x},${p0.y} ${p1.x},${p1.y} ${p2.x},${p2.y}`}
          className="fill-blue-50/50 dark:fill-blue-900/20"
        />

        {incircle && (
          <circle
            cx={incircle.center.x}
            cy={incircle.center.y}
            r={incircle.radius}
            fill="none"
            className="stroke-emerald-600 dark:stroke-emerald-400"
            strokeWidth={2}
          />
        )}
        
        {incircle && positions[centerLabel] && (
           <>
              <circle cx={incircle.center.x} cy={incircle.center.y} r={3} className="fill-gray-900 dark:fill-gray-100" />
              <VertexLabel
                 label={centerLabel}
                 position={incircle.center}
                 offsetDir={{ x: -1, y: -1 }} // slightly top-left
              />
              
              {/* If radius is given, draw a line from center to an edge */}
              {(dimensions['circle_radius'] || dimensions['radius']) && (
                  <EdgeLine
                     from={incircle.center}
                     to={{ x: incircle.center.x, y: incircle.center.y + incircle.radius }}
                     strokeWidth={1.5}
                     dashed
                  />
              )}
           </>
        )}

        {edges.map((e, i) => (
          <React.Fragment key={`edge-${i}`}>
            <EdgeLine from={e.from} to={e.to} />
            {getDim(e.fromL, e.toL) && (
              <DimensionLabel from={e.from} to={e.to} text={getDim(e.fromL, e.toL)!} />
            )}
          </React.Fragment>
        ))}

        {rightAngleVertex && positions[rightAngleVertex] && (
           <RightAngleMarker
              vertex={positions[rightAngleVertex]}
              towards1={edges.find(e => e.fromL === rightAngleVertex)?.to || edges.find(e => e.toL === rightAngleVertex)?.from!}
              towards2={edges.find(e => e.fromL === rightAngleVertex && e.toL !== rightAngleVertex)?.to || edges.find(e => e.toL === rightAngleVertex)?.from!}
           />
        )}

        {vertices.map(v => (
          <VertexLabel
            key={`lbl-${v}`}
            label={v}
            position={positions[v]}
            offsetDir={computeLabelOffset(positions[v], allVerts)}
            color="#1d4ed8"
          />
        ))}
      </svg>
    </div>
  );
};
