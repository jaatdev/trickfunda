import React, { useMemo } from 'react';
import type { FigureData } from '@/lib/types';
import { computeCirclePositions, SVG_WIDTH, SVG_HEIGHT, Point, midpoint, dist } from './layoutEngine';
import { EdgeLine, VertexLabel, DimensionLabel, AngleArc, RightAngleMarker, computeLabelOffset } from './SVGGeometryUtils';

export const CircleRenderer: React.FC<{ data: FigureData }> = ({ data }) => {
  const {
    known_angles = {},
    unknown_angles = [],
    dimensions = {},
    relationships = {},
    center = 'O'
  } = data;

  const layout = useMemo(() => computeCirclePositions(data), [data]);
  const { positions, circles, chordEdges, radiusEdges, diameterEdge, tangentLine, inscribedTriangleVerts } = layout;

  const getDim = (a: string, b: string) => dimensions[`${a}${b}`] || dimensions[`${b}${a}`];

  // Gather all vertices that have positions
  const allVerts = Object.entries(positions).map(([k, v]) => ({ label: k, pos: v }));

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="w-full max-w-[400px] h-auto drop-shadow-sm"
        style={{ overflow: 'visible' }}
      >
        {/* Draw Circles */}
        {circles.map((c, i) => (
          <circle
            key={`circle-${i}`}
            cx={c.center.x}
            cy={c.center.y}
            r={c.radius}
            fill="none"
            className="stroke-gray-800 dark:stroke-gray-200"
            strokeWidth={2}
          />
        ))}

        {/* Center Point */}
        <circle cx={positions[center]?.x} cy={positions[center]?.y} r={3} className="fill-gray-900 dark:fill-gray-100" />
        {positions[center] && (
          <VertexLabel
             label={center}
             position={positions[center]}
             offsetDir={{ x: -1, y: -1 }} // Usually push center label top-left slightly
          />
        )}

        {/* Diameter */}
        {diameterEdge && (
          <>
            <EdgeLine
               from={positions[diameterEdge[0]]}
               to={positions[diameterEdge[1]]}
               strokeWidth={1.5}
            />
            {getDim(diameterEdge[0], diameterEdge[1]) && (
               <DimensionLabel
                  from={positions[diameterEdge[0]]}
                  to={positions[diameterEdge[1]]}
                  text={getDim(diameterEdge[0], diameterEdge[1])!}
               />
            )}
          </>
        )}

        {/* Radii */}
        {radiusEdges.map(edge => {
          const p1 = positions[edge[0]];
          const p2 = positions[edge[1]];
          if (!p1 || !p2) return null;
          return (
            <React.Fragment key={`rad-${edge}`}>
              <EdgeLine from={p1} to={p2} strokeWidth={1.5} />
              {getDim(edge[0], edge[1]) && (
                 <DimensionLabel from={p1} to={p2} text={getDim(edge[0], edge[1])!} />
              )}
            </React.Fragment>
          );
        })}

        {/* Chords */}
        {chordEdges.map(edge => {
          const p1 = positions[edge[0]];
          const p2 = positions[edge[1]];
          if (!p1 || !p2) return null;
          return (
            <React.Fragment key={`chord-${edge}`}>
              <EdgeLine from={p1} to={p2} strokeWidth={2} />
              {getDim(edge[0], edge[1]) && (
                 <DimensionLabel from={p1} to={p2} text={getDim(edge[0], edge[1])!} />
              )}
            </React.Fragment>
          );
        })}
        
        {/* Inscribed Triangle */}
        {inscribedTriangleVerts.length === 3 && (
          <polygon
             points={`${positions[inscribedTriangleVerts[0]].x},${positions[inscribedTriangleVerts[0]].y} ${positions[inscribedTriangleVerts[1]].x},${positions[inscribedTriangleVerts[1]].y} ${positions[inscribedTriangleVerts[2]].x},${positions[inscribedTriangleVerts[2]].y}`}
             fill="none"
             className="stroke-gray-800 dark:stroke-gray-200"
             strokeWidth={2}
          />
        )}

        {/* Tangent Line */}
        {tangentLine && (
          <>
            <EdgeLine
               from={tangentLine.from}
               to={tangentLine.to}
               extended
               strokeWidth={2}
               color="#059669" // Emerald for tangent
            />
            {/* Find the intersection point (which is in positions) to draw the right angle if a radius connects to it */}
            {(() => {
                // Determine the tangent point label
                const ptLabel = Object.keys(positions).find(k => k !== center && dist(positions[k], midpoint(tangentLine.from, tangentLine.to)) < 100);
                if (ptLabel && positions[ptLabel]) {
                    const radiusLine = radiusEdges.find(e => e.includes(ptLabel));
                    if (radiusLine) {
                        return (
                            <RightAngleMarker
                               vertex={positions[ptLabel]}
                               towards1={positions[center]}
                               towards2={tangentLine.to}
                            />
                        );
                    }
                }
                return null;
            })()}
          </>
        )}

        {/* All explicit edges from data.edges */}
        {data.edges?.map(edge => {
          const p1 = positions[edge[0]];
          const p2 = positions[edge[1]];
          if (!p1 || !p2) return null;
          return (
             <React.Fragment key={`explicit-${edge}`}>
               <EdgeLine from={p1} to={p2} />
               {getDim(edge[0], edge[1]) && (
                 <DimensionLabel from={p1} to={p2} text={getDim(edge[0], edge[1])!} />
               )}
             </React.Fragment>
          );
        })}
        
        {/* Known Angles */}
        {Object.entries(known_angles).map(([v, val]) => {
          const pv = positions[v];
          if (!pv) return null;
          
          // Need to find adjacent vertices.
          // This is tricky for circles without an explicit edge list,
          // but we can look at all lines that contain this vertex.
          const connectedVerts = allVerts.filter(other => {
              if (other.label === v) return false;
              // Check if there's an edge
              const edgeStr1 = `${v}${other.label}`;
              const edgeStr2 = `${other.label}${v}`;
              
              if (radiusEdges.includes(edgeStr1) || radiusEdges.includes(edgeStr2)) return true;
              if (chordEdges.includes(edgeStr1) || chordEdges.includes(edgeStr2)) return true;
              if (data.edges?.includes(edgeStr1) || data.edges?.includes(edgeStr2)) return true;
              if (inscribedTriangleVerts.includes(v) && inscribedTriangleVerts.includes(other.label)) return true;
              
              return false;
          });
          
          if (connectedVerts.length >= 2) {
             return <AngleArc key={`angle-${v}`} vertex={pv} from={connectedVerts[0].pos} to={connectedVerts[1].pos} label={val} />;
          }
          return null;
        })}

        {/* Vertex Labels (skip center, already done) */}
        {allVerts.filter(v => v.label !== center).map(v => {
           // Compute offset relative to center of circle
           const offset = { x: v.pos.x - positions[center].x, y: v.pos.y - positions[center].y };
           return (
             <VertexLabel
                key={`lbl-${v.label}`}
                label={v.label}
                position={v.pos}
                offsetDir={offset}
             />
           );
        })}
      </svg>
    </div>
  );
};
