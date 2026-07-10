'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { BookOpen, Calculator, Globe, Brain, SpellCheck, ArrowRight, ShieldCheck } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

import { NeuralBackground } from '@/components/ui/kd-method/NeuralBackground';
import { GlitchText } from '@/components/ui/kd-method/GlitchText';
import { ScannerCard } from '@/components/ui/kd-method/ScannerCard';

export type Category = {
  href: string;
  title: string;
  description: string;
  iconName: string;
  color: string;
  iconColor: string;
  hoverBorder: string;
  hoverText: string;
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } },
};

// Map original colors to the neon equivalent for ScannerCard props
function getNeonColor(colorClass: string) {
  if (colorClass.includes('emerald') || colorClass.includes('green')) return 'emerald';
  if (colorClass.includes('cyan') || colorClass.includes('blue')) return 'cyan';
  if (colorClass.includes('violet') || colorClass.includes('purple')) return 'violet';
  if (colorClass.includes('rose') || colorClass.includes('red')) return 'rose';
  if (colorClass.includes('amber') || colorClass.includes('yellow')) return 'amber';
  return 'emerald'; // default
}

// Static color maps for Tailwind CSS
const colorMaps: Record<string, any> = {
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    borderHover: 'group-hover:border-emerald-500/40',
    text: 'text-emerald-400',
    textHover: 'group-hover:text-emerald-300',
    shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
    shadowHover: 'group-hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]',
    borderBase: 'border-emerald-500/20'
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    borderHover: 'group-hover:border-cyan-500/40',
    text: 'text-cyan-400',
    textHover: 'group-hover:text-cyan-300',
    shadow: 'shadow-[0_0_15px_rgba(6,182,212,0.3)]',
    shadowHover: 'group-hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]',
    borderBase: 'border-cyan-500/20'
  },
  violet: {
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    borderHover: 'group-hover:border-violet-500/40',
    text: 'text-violet-400',
    textHover: 'group-hover:text-violet-300',
    shadow: 'shadow-[0_0_15px_rgba(139,92,246,0.3)]',
    shadowHover: 'group-hover:shadow-[0_0_15px_rgba(139,92,246,0.2)]',
    borderBase: 'border-violet-500/20'
  },
  rose: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    borderHover: 'group-hover:border-rose-500/40',
    text: 'text-rose-400',
    textHover: 'group-hover:text-rose-300',
    shadow: 'shadow-[0_0_15px_rgba(244,63,94,0.3)]',
    shadowHover: 'group-hover:shadow-[0_0_15px_rgba(244,63,94,0.2)]',
    borderBase: 'border-rose-500/20'
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    borderHover: 'group-hover:border-amber-500/40',
    text: 'text-amber-400',
    textHover: 'group-hover:text-amber-300',
    shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]',
    shadowHover: 'group-hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]',
    borderBase: 'border-amber-500/20'
  }
};

export default function KDMethodLandingClient({ categories }: { categories: Category[] }) {
  return (
    <div className="min-h-screen bg-[#020617] text-gray-100 pt-24 pb-12 px-4 md:pt-32 md:pb-16 md:px-8 relative overflow-hidden selection:bg-emerald-500/30">
      
      {/* Interactive Background */}
      <NeuralBackground />

      <div className="max-w-6xl mx-auto space-y-16 relative z-10">
        
        {/* Header Section */}
        <header className="space-y-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-none bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)] mb-4"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-mono tracking-widest text-emerald-300 uppercase">System Initialized</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 tracking-tighter drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] pb-2"
          >
            <GlitchText text="KD Method" />
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-mono"
          >
            Rapid learning protocol online. Select a datacore module to begin knowledge transfer.
          </motion.p>
        </header>

        {/* Datacore Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-[250px]"
        >
          {categories.map((category, index) => {
            const Icon = (LucideIcons as any)[category.iconName] || BookOpen;
            const neonColor = getNeonColor(category.color);
            const style = colorMaps[neonColor] || colorMaps.emerald;
            
            return (
              <motion.div key={category.href} variants={itemVariants} className="h-full">
                <Link href={category.href} className="block h-full outline-none group">
                  <ScannerCard color={neonColor}>
                    
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <div className={`p-3 rounded-md ${style.bg} ${style.border} ${style.shadow}`}>
                        <Icon className={`w-6 h-6 ${style.text} drop-shadow-md`} />
                      </div>
                      <div className={`px-3 py-1 rounded-sm border ${style.borderBase} bg-slate-950 font-mono text-xs ${style.text} uppercase tracking-widest`}>
                        Module {(index + 1).toString().padStart(2, '0')}
                      </div>
                    </div>

                    <div className="mt-auto space-y-2 relative z-10">
                      <h3 className={`text-2xl font-bold text-gray-100 ${style.textHover} transition-colors duration-300 font-mono tracking-tight`}>
                        {category.title}
                      </h3>
                      <p className="text-sm text-gray-400 group-hover:text-gray-300 line-clamp-2 transition-colors duration-300">
                        {category.description}
                      </p>
                    </div>

                    <div className={`absolute bottom-6 right-6 w-10 h-10 rounded-md ${style.bg} ${style.border} flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-2`}>
                      <ArrowRight className={`w-5 h-5 ${style.text}`} />
                    </div>

                  </ScannerCard>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </div>
  );
}
