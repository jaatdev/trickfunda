import React from 'react';

interface UnfoldedNetProps {
  gridMatrix: (string | null)[][];
}

export const UnfoldedNet: React.FC<UnfoldedNetProps> = ({ gridMatrix }) => {
  if (!gridMatrix || gridMatrix.length === 0) return null;

  return (
    <div className="flex justify-center items-center my-6">
      <table className="border-collapse">
        <tbody>
          {gridMatrix.map((row, rIdx) => (
            <tr key={rIdx}>
              {row.map((cell, cIdx) => (
                <td 
                  key={`${rIdx}-${cIdx}`}
                  className={`w-12 h-12 md:w-16 md:h-16 text-center align-middle text-xl md:text-2xl font-black p-0 ${
                    cell 
                      ? 'border-[2px] border-gray-900 dark:border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-[inset_0_0_0_1px_transparent]'
                      : 'border-0 bg-transparent'
                  }`}
                >
                  {cell || ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
