'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { PenTool, FileDown, BrainCircuit, Calendar, Calculator, ArrowRight, Stars } from 'lucide-react';

import { MouseTrail } from '@/components/ui/tools/MouseTrail';
import { MeteorShower } from '@/components/ui/tools/MeteorShower';
import { BentoTiltCard } from '@/components/ui/tools/BentoTiltCard';
import { MagneticButton } from '@/components/ui/tools/MagneticButton';
import { TextReveal } from '@/components/ui/tools/TextReveal';

const tools = [
  {
    title: 'Cosmic Canvas',
    description: 'A powerful infinite canvas for brainstorming, diagramming, and visualizing concepts in true 3D space.',
    icon: PenTool,
    href: '/canvas',
    color: 'from-cyan-400 to-blue-600',
    delay: 0.1,
    status: 'Live',
    size: 'large'
  },
  {
    title: 'TrickFunda AI',
    description: 'Your personal 24/7 AI study assistant trained on TrickFunda methods. Ask it anything.',
    icon: BrainCircuit,
    href: '/ai',
    color: 'from-fuchsia-400 to-violet-600',
    delay: 0.2,
    status: 'Live',
    size: 'normal'
  },
  {
    title: 'PDF Merger',
    description: 'Quickly merge, split, and organize your study materials in seconds.',
    icon: FileDown,
    href: '/pdf-merger',
    color: 'from-orange-400 to-rose-600',
    delay: 0.3,
    status: 'Live',
    size: 'normal'
  },
  {
    title: 'Study Planner',
    description: 'Smart scheduling algorithm to optimize your revision timetables automatically.',
    icon: Calendar,
    href: '#',
    color: 'from-emerald-400 to-teal-600',
    delay: 0.4,
    status: 'Coming Soon',
    size: 'normal'
  },
  {
    title: 'Advanced Calculator',
    description: 'Graphing and scientific calculator built directly into your browser.',
    icon: Calculator,
    href: '#',
    color: 'from-yellow-400 to-amber-600',
    delay: 0.5,
    status: 'Coming Soon',
    size: 'normal'
  }
];

export default function ToolsHubPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#030014] pb-24 selection:bg-violet-500/30">
      
      {/* 1. Fluid Mouse Trail */}
      <MouseTrail />
      
      {/* 2. Meteor Background */}
      <MeteorShower />

      {/* Deep Space Background Grid & Glowing Orbs */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] pointer-events-none mix-blend-overlay z-0"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />
      
      {/* Pulsing Orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-600/30 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[8000ms] z-0" />
      <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-blue-600/20 rounded-full blur-[150px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20 md:pt-32">
        
        {/* Header Section */}
        <div className="text-center mb-20 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-[0_0_20px_rgba(255,255,255,0.05)] mb-4 hover:bg-white/[0.05] transition-colors cursor-default"
          >
            <Stars className="w-4 h-4 text-yellow-400 animate-pulse" />
            <span className="text-sm font-semibold tracking-wide text-gray-300">TrickFunda Ecosystem</span>
          </motion.div>
          
          <TextReveal 
            text="Student Tools" 
            className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-gray-500 tracking-tighter pb-2 drop-shadow-sm" 
          />
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0.4, duration: 1, delay: 0.4 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-medium"
          >
            Supercharge your productivity with our suite of custom-built applications designed exclusively for the TrickFunda method.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[320px]">
          {tools.map((tool) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.8, delay: tool.delay }}
              className={`relative h-full perspective-[1000px] ${tool.size === 'large' ? 'md:col-span-2 lg:col-span-2' : ''}`}
            >
              {tool.status === 'Live' ? (
                <Link href={tool.href} className="block h-full outline-none group cursor-none">
                  <ToolCardContent tool={tool} />
                </Link>
              ) : (
                <div className="h-full cursor-not-allowed opacity-75 grayscale-[30%] group">
                  <ToolCardContent tool={tool} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ToolCardContent({ tool }: { tool: any }) {
  const isLive = tool.status === 'Live';

  return (
    <BentoTiltCard>
      {/* Background Gradient Glow on Hover */}
      {isLive && (
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-[0.06] transition-opacity duration-700 bg-gradient-to-br ${tool.color} rounded-[2rem] pointer-events-none`} />
      )}

      {/* Top Header: Icon & Status */}
      <div className="flex justify-between items-start mb-auto">
        <div className={`p-4 rounded-2xl bg-gradient-to-br ${tool.color} shadow-[0_0_30px_rgba(0,0,0,0.5)] transform group-hover:scale-[1.15] group-hover:rotate-[5deg] transition-all duration-500 ease-out`}>
          <tool.icon className="w-8 h-8 text-white drop-shadow-lg" />
        </div>
        
        <div className={`px-4 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md transition-colors ${
          isLive 
            ? 'bg-green-500/10 text-green-400 border-green-500/20 group-hover:bg-green-500/20 group-hover:border-green-500/40 group-hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]' 
            : 'bg-white/5 text-gray-400 border-white/10'
        }`}>
          {tool.status}
        </div>
      </div>

      {/* Content - Pushed to Bottom */}
      <div className="flex items-end justify-between mt-auto">
        <div className="space-y-3 max-w-[80%]">
          <h3 className="text-3xl font-black text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all duration-300">
            {tool.title}
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
            {tool.description}
          </p>
        </div>

        {/* Magnetic Action Button */}
        {isLive && (
          <MagneticButton className="transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
            <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${tool.color} flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-110 transition-transform duration-300`}>
              <ArrowRight className="w-6 h-6 text-white" />
            </div>
          </MagneticButton>
        )}
      </div>
    </BentoTiltCard>
  );
}
