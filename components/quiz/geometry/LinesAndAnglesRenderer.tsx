import React, { useMemo } from 'react';
import type { FigureData } from '@/lib/types';
import { computeLinesAndAnglesPositions, SVG_WIDTH, SVG_HEIGHT, Point, angleBetween, dist } from './layoutEngine';
import { EdgeLine, VertexLabel, AngleArc, LineLabel, ParallelArrows } from './SVGGeometryUtils';

export const LinesAndAnglesRenderer: React.FC<{ data: FigureData }> = ({ data }) => {
  const {
    known_angles = {},
    unknown_angles = [],
    relationships = {},
    expressions = {}
  } = data;

  const { positions, lines } = useMemo(() => computeLinesAndAnglesPositions(data), [data]);
  const parallelLines = relationships.parallel || [];

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="w-full max-w-[400px] h-auto drop-shadow-sm"
        style={{ overflow: 'visible' }}
      >
        {/* Draw all lines (parallel and transversal) */}
        {lines.map((line, i) => {
          const isParallel = parallelLines.includes(line.label);
          return (
            <React.Fragment key={`line-${i}`}>
              <EdgeLine
                from={line.from}
                to={line.to}
                extended
                strokeWidth={isParallel ? 2.5 : 2}
                color={isParallel ? '#1e40af' : '#4b5563'} // dark blue for parallel, gray for transversal
              />
              <LineLabel
                position={line.from}
                label={line.label}
                side="left"
              />
              {isParallel && (
                <ParallelArrows from={line.from} to={line.to} count={2} />
              )}
            </React.Fragment>
          );
        })}

        {/* Intersection Points and Angles */}
        {Object.entries(positions).map(([label, pos]) => {
          // label is like "t1_l1" meaning transversal t1 intersecting parallel l1
          const parts = label.split('_');
          if (parts.length !== 2) return null;
          
          const tName = parts[0];
          const pName = parts[1];
          
          const tLine = lines.find(l => l.label === tName);
          const pLine = lines.find(l => l.label === pName);
          
          if (!tLine || !pLine) return null;

          // Four points around the intersection to define the 4 angles
          // Top-Left, Top-Right, Bottom-Left, Bottom-Right relative to the intersection
          // pLine goes left to right. tLine goes top to bottom.
          
          const pDir = { x: pLine.to.x - pLine.from.x, y: pLine.to.y - pLine.from.y };
          const tDir = { x: tLine.to.x - tLine.from.x, y: tLine.to.y - tLine.from.y };
          
          // Normalize
          const pLen = Math.sqrt(pDir.x**2 + pDir.y**2);
          const tLen = Math.sqrt(tDir.x**2 + tDir.y**2);
          
          const pUnit = { x: pDir.x/pLen, y: pDir.y/pLen };
          const tUnit = { x: tDir.x/tLen, y: tDir.y/tLen };
          
          // Generate 4 helper points a bit away from intersection to use for AngleArc
          const dist = 50;
          const leftP = { x: pos.x - pUnit.x*dist, y: pos.y - pUnit.y*dist };
          const rightP = { x: pos.x + pUnit.x*dist, y: pos.y + pUnit.y*dist };
          const topP = { x: pos.x - tUnit.x*dist, y: pos.y - tUnit.y*dist };
          const botP = { x: pos.x + tUnit.x*dist, y: pos.y + tUnit.y*dist };
          
          const anglesToRender: React.ReactNode[] = [];
          
          // In standard notation, angles might be given by positions like "top_right_l1"
          // Or just given directly if it's a simple figure.
          // Let's check known_angles for this intersection.
          
          const angleKeys = ['top_right', 'top_left', 'bottom_left', 'bottom_right'];
          const anglePoints = [
             [rightP, topP], // top right
             [topP, leftP],  // top left
             [leftP, botP],  // bottom left
             [botP, rightP]  // bottom right
          ];
          
          angleKeys.forEach((key, idx) => {
            const queryKey = `${key}_${pName}`; // e.g. top_right_l1
            
            let val = known_angles[queryKey];
            let isUnknown = false;
            
            if (!val && expressions[queryKey]) {
                val = expressions[queryKey];
            }
            if (!val && unknown_angles.includes(queryKey)) {
                val = data.unknown_variable || '?';
                isUnknown = true;
            }
            
            if (val) {
                anglesToRender.push(
                    <AngleArc
                      key={queryKey}
                      vertex={pos}
                      from={anglePoints[idx][0]}
                      to={anglePoints[idx][1]}
                      label={val}
                      isUnknown={isUnknown}
                    />
                );
            }
          });
          
          return (
            <React.Fragment key={`int-${label}`}>
              {/* Intersection dot */}
              <circle cx={pos.x} cy={pos.y} r={4} className="fill-gray-800 dark:fill-gray-200" />
              {anglesToRender}
            </React.Fragment>
          );
        })}
      </svg>
    </div>
  );
};
