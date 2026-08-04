import React from 'react';

interface Props {
  isScanning: boolean;
  count: number;
}

export const RadarAnimation: React.FC<Props> = ({ isScanning, count }) => {
  return (
    <div className="relative w-48 h-48 flex items-center justify-center mx-auto">
      {/* Base Grid/Circles */}
      <div className="absolute inset-0 rounded-full border border-indigo-500/20"></div>
      <div className="absolute inset-4 rounded-full border border-indigo-500/30"></div>
      <div className="absolute inset-10 rounded-full border border-indigo-500/40"></div>
      
      {/* Crosshairs */}
      <div className="absolute inset-0 w-full h-px bg-indigo-500/20 top-1/2 -translate-y-1/2"></div>
      <div className="absolute inset-0 h-full w-px bg-indigo-500/20 left-1/2 -translate-x-1/2"></div>

      {/* Sweep */}
      {isScanning && (
        <div 
          className="absolute inset-0 rounded-full overflow-hidden origin-center animate-[spin_4s_linear_infinite]"
          style={{ background: 'conic-gradient(from 0deg, transparent 70%, rgba(56, 189, 248, 0.1) 80%, rgba(56, 189, 248, 0.4) 100%)' }}
        >
          <div className="absolute top-0 bottom-1/2 left-1/2 w-px bg-gradient-to-b from-cyan-400 to-transparent"></div>
        </div>
      )}

      {/* Center Count */}
      <div className="relative z-10 flex flex-col items-center justify-center w-16 h-16 rounded-full bg-[#030014]/80 backdrop-blur-md border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
        <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-cyan-300">{count}</span>
        <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">URLs</span>
      </div>

      {/* Simulated Blips if count > 0 */}
      {count > 0 && isScanning && (
        <>
          <div className="absolute top-10 left-12 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></div>
          <div className="absolute bottom-14 right-10 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-[pulse_2s_ease-in-out_infinite]"></div>
          <div className="absolute top-20 right-8 w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(129,140,248,0.8)] animate-[pulse_3s_ease-in-out_infinite]"></div>
        </>
      )}
    </div>
  );
};
