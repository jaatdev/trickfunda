/**
 * 🎨 FIGURE RENDERER (Dispatcher)
 *
 * This is the main entry point for dynamic geometry rendering.
 * It reads the `shape_type` from `FigureData` and delegates rendering
 * to the appropriate specialized component.
 */

import React from 'react';
import type { FigureData } from '@/lib/types';

import { TriangleRenderer } from './TriangleRenderer';
import { QuadrilateralRenderer } from './QuadrilateralRenderer';
import { CircleRenderer } from './CircleRenderer';
import { LinesAndAnglesRenderer } from './LinesAndAnglesRenderer';
import { CompositeRenderer } from './CompositeRenderer';

interface FigureRendererProps {
  data: FigureData;
  className?: string;
}

export const FigureRenderer: React.FC<FigureRendererProps> = ({ data, className = '' }) => {
  if (!data || !data.shape_type) {
    return null;
  }

  return (
    <div className={`figure-renderer-container bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {(() => {
        switch (data.shape_type) {
          case 'triangle':
            return <TriangleRenderer data={data} />;
          case 'quadrilateral':
            return <QuadrilateralRenderer data={data} />;
          case 'circle':
          case 'semi_circle':
            return <CircleRenderer data={data} />;
          case 'lines_and_angles':
            return <LinesAndAnglesRenderer data={data} />;
          case 'composite':
            return <CompositeRenderer data={data} />;
          default:
            console.warn(`[FigureRenderer] Unsupported shape_type: ${data.shape_type}`);
            return (
              <div className="w-full h-full flex items-center justify-center p-8 text-gray-400 text-sm italic">
                Unsupported shape: {data.shape_type}
              </div>
            );
        }
      })()}
    </div>
  );
};
