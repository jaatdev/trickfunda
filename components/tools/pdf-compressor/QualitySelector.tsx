import { motion } from 'framer-motion';
import { Shield, Zap, Gauge } from 'lucide-react';

interface QualitySelectorProps {
  selected: 'ultra' | 'balanced' | 'maximum';
  onSelect: (quality: 'ultra' | 'balanced' | 'maximum') => void;
  isDisabled: boolean;
}

const presets = [
  {
    id: 'ultra',
    title: 'Ultra',
    description: 'Zero Visual Loss',
    specs: 'JPEG 92%, No downscaling',
    ratio: '10-30% smaller',
    icon: Shield,
    color: 'cyan',
    gradient: 'from-cyan-400/20 to-blue-600/20',
    border: 'border-cyan-500/50',
    glow: 'shadow-[0_0_30px_rgba(34,211,238,0.2)]'
  },
  {
    id: 'balanced',
    title: 'Balanced',
    description: 'Smart Compression',
    specs: 'JPEG 75%, 2048px max',
    ratio: '40-70% smaller',
    icon: Zap,
    color: 'violet',
    gradient: 'from-violet-400/20 to-fuchsia-600/20',
    border: 'border-violet-500/50',
    glow: 'shadow-[0_0_30px_rgba(139,92,246,0.2)]'
  },
  {
    id: 'maximum',
    title: 'Maximum',
    description: 'Maximum Savings',
    specs: 'JPEG 55%, 1200px max',
    ratio: '70-90% smaller',
    icon: Gauge,
    color: 'rose',
    gradient: 'from-rose-400/20 to-red-600/20',
    border: 'border-rose-500/50',
    glow: 'shadow-[0_0_30px_rgba(244,63,94,0.2)]'
  }
] as const;

export default function QualitySelector({ selected, onSelect, isDisabled }: QualitySelectorProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, bounce: 0.4 } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mx-auto mt-8"
    >
      {presets.map((preset) => {
        const isSelected = selected === preset.id;
        const Icon = preset.icon;
        
        return (
          <motion.button
            key={preset.id}
            variants={item}
            onClick={() => onSelect(preset.id as any)}
            disabled={isDisabled}
            className={`relative flex flex-col items-start p-6 rounded-2xl text-left transition-all duration-300 ${
              isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            } ${
              isSelected 
                ? `bg-gradient-to-br ${preset.gradient} ${preset.border} border-2 ${preset.glow} scale-[1.02]` 
                : 'bg-white/[0.03] border-white/10 border backdrop-blur hover:bg-white/[0.05]'
            }`}
          >
            <div className={`p-3 rounded-xl mb-4 ${
              isSelected ? 'bg-white/10' : 'bg-white/5'
            }`}>
              <Icon className={`w-6 h-6 ${
                preset.color === 'cyan' ? 'text-cyan-400' : 
                preset.color === 'violet' ? 'text-violet-400' : 'text-rose-400'
              }`} />
            </div>
            
            <h4 className="text-xl font-bold text-white mb-1">{preset.title}</h4>
            <div className="text-sm font-semibold text-gray-300 mb-3">{preset.description}</div>
            
            <div className="space-y-1 mt-auto w-full">
              <div className="text-xs text-gray-500">{preset.specs}</div>
              <div className="text-xs font-medium text-gray-400 bg-black/20 px-2 py-1 rounded inline-block">
                ~ {preset.ratio}
              </div>
            </div>
            
            {isSelected && (
              <motion.div 
                layoutId="activeQuality"
                className={`absolute inset-0 rounded-2xl border-2 ${preset.border} pointer-events-none`}
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </motion.button>
        );
      })}
    </motion.div>
  );
}
