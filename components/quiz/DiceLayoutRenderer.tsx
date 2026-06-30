import React from 'react';
import { DiceLayout } from '@/lib/types';
import { Dice3D } from './Dice3D';
import { UnfoldedNet } from './UnfoldedNet';

interface DiceLayoutRendererProps {
  layout?: DiceLayout;
}

export const DiceLayoutRenderer: React.FC<DiceLayoutRendererProps> = ({ layout }) => {
  if (!layout) return null;

  if (layout.layout_type === '3d_isometric' && layout.dice_instances) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 my-8 overflow-hidden py-4">
        {layout.dice_instances.map((dice, idx) => (
          <div key={idx} className="flex flex-col items-center gap-4">
            <Dice3D top={dice.top} front={dice.front} right={dice.right} />
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              Figure {idx + 1}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (layout.layout_type === 'unfolded_net' && layout.grid_matrix) {
    return (
      <div className="w-full flex justify-center py-4">
        <UnfoldedNet gridMatrix={layout.grid_matrix} />
      </div>
    );
  }

  return null;
};
