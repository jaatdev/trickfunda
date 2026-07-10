'use client';

export type AppTheme = {
  name: string;
  navBgColor: string; // The specific tailwind color class for the glassmorphism background
  navBorderColor: string;
  navGlow: string;
  footerGradient: string;
  footerOrbColor: string;
  accentText: string;
  accentBg: string;
};

export const defaultTheme: AppTheme = {
  name: 'default',
  navBgColor: 'bg-black',
  navBorderColor: 'border-white/10',
  navGlow: 'shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]',
  footerGradient: 'from-gray-900 via-violet-950 to-gray-900',
  footerOrbColor: 'bg-violet-500/5',
  accentText: 'text-violet-400',
  accentBg: 'bg-violet-500',
};

const cosmicTheme: AppTheme = {
  name: 'cosmic',
  navBgColor: 'bg-[#0a001a]',
  navBorderColor: 'border-cyan-500/30',
  navGlow: 'shadow-[0_8px_32px_0_rgba(6,182,212,0.2)]', // cyan glow
  footerGradient: 'from-[#030014] via-fuchsia-950/40 to-[#030014]',
  footerOrbColor: 'bg-cyan-500/10',
  accentText: 'text-cyan-400',
  accentBg: 'bg-cyan-500',
};

const matrixTheme: AppTheme = {
  name: 'matrix',
  navBgColor: 'bg-[#001100]',
  navBorderColor: 'border-emerald-500/30',
  navGlow: 'shadow-[0_8px_32px_0_rgba(16,185,129,0.2)]', // emerald glow
  footerGradient: 'from-black via-[#002200] to-black',
  footerOrbColor: 'bg-emerald-500/10',
  accentText: 'text-emerald-400',
  accentBg: 'bg-emerald-500',
};

const mathTheme: AppTheme = {
  name: 'math',
  navBgColor: 'bg-[#000814]',
  navBorderColor: 'border-blue-500/30',
  navGlow: 'shadow-[0_8px_32px_0_rgba(59,130,246,0.2)]', // blue glow
  footerGradient: 'from-slate-950 via-blue-950/40 to-slate-950',
  footerOrbColor: 'bg-blue-500/10',
  accentText: 'text-blue-400',
  accentBg: 'bg-blue-500',
};

const steampunkTheme: AppTheme = {
  name: 'steampunk',
  navBgColor: 'bg-[#1a0f00]',
  navBorderColor: 'border-amber-700/40',
  navGlow: 'shadow-[0_8px_32px_0_rgba(217,119,6,0.2)]', // amber glow
  footerGradient: 'from-[#1a0f00] via-[#3a2000] to-[#1a0f00]',
  footerOrbColor: 'bg-amber-600/10',
  accentText: 'text-amber-500',
  accentBg: 'bg-amber-600',
};

const oxfordTheme: AppTheme = {
  name: 'oxford',
  navBgColor: 'bg-[#001a0f]',
  navBorderColor: 'border-emerald-700/40',
  navGlow: 'shadow-[0_8px_32px_0_rgba(5,150,105,0.2)]', // emerald glow
  footerGradient: 'from-[#001a0f] via-[#00331a] to-[#001a0f]',
  footerOrbColor: 'bg-emerald-600/10',
  accentText: 'text-emerald-500',
  accentBg: 'bg-emerald-600',
};

const reasoningTheme: AppTheme = {
  name: 'reasoning',
  navBgColor: 'bg-[#0f001a]',
  navBorderColor: 'border-violet-500/30',
  navGlow: 'shadow-[0_8px_32px_0_rgba(139,92,246,0.2)]', // violet glow
  footerGradient: 'from-gray-950 via-[#1a0033] to-gray-950',
  footerOrbColor: 'bg-violet-500/10',
  accentText: 'text-violet-400',
  accentBg: 'bg-violet-500',
};

const toolsTheme: AppTheme = {
  name: 'tools',
  navBgColor: 'bg-[#030014]',
  navBorderColor: 'border-fuchsia-500/30',
  navGlow: 'shadow-[0_8px_32px_0_rgba(217,70,239,0.2)]', // fuchsia glow
  footerGradient: 'from-[#030014] via-violet-950/50 to-[#030014]',
  footerOrbColor: 'bg-fuchsia-500/10',
  accentText: 'text-fuchsia-400',
  accentBg: 'bg-fuchsia-500',
};


export function useAppTheme(pathname: string | null): AppTheme {
  if (!pathname) return defaultTheme;

  if (pathname.includes('/gs-trickfunda')) {
    return cosmicTheme;
  }
  if (pathname.includes('/vocab-trickfunda')) {
    return matrixTheme;
  }
  if (pathname.includes('/maths-trickfunda') || pathname.includes('/abhinay-sir-maths')) {
    return mathTheme;
  }
  if (pathname.includes('/english-chapterwise')) {
    return steampunkTheme;
  }
  if (pathname.includes('/english-100-concepts')) {
    return oxfordTheme;
  }
  if (pathname.includes('/reasoning-trickfunda')) {
    return reasoningTheme;
  }
  if (pathname.startsWith('/tools') || pathname.startsWith('/canvas') || pathname.startsWith('/ai') || pathname.startsWith('/pdf-merger')) {
    return toolsTheme;
  }
  
  return defaultTheme;
}
