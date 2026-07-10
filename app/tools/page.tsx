'use client';

import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import Link from 'next/link';
import { PenTool, FileDown, BrainCircuit, Calendar, Calculator, Sparkles, ArrowRight, Stars } from 'lucide-react';
import { MouseEvent } from 'react';

const tools = [
  {
    title: 'Cosmic Canvas',
    description: 'A powerful infinite canvas for brainstorming, diagramming, and visualizing concepts.',
    icon: PenTool,
    href: '/canvas',
    color: 'from-cyan-400 to-blue-600',
    delay: 0.1,
    status: 'Live',
    size: 'large'
  },
  {
    title: 'TrickFunda AI',
    description: 'Your personal 24/7 AI study assistant trained on TrickFunda methods.',
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
      {/* Deep Space Background Grid & Glowing Orbs */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-600/30 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-blue-600/20 rounded-full blur-[150px] pointer-events-none" />

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
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0.4, duration: 1, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-gray-500 tracking-tighter pb-2 drop-shadow-sm"
          >
            Student Tools
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0.4, duration: 1, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-medium"
          >
            Supercharge your productivity with our suite of custom-built applications designed exclusively for the TrickFunda method.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[280px]">
          {tools.map((tool, idx) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.8, delay: tool.delay }}
              className={`relative h-full ${tool.size === 'large' ? 'md:col-span-2 lg:col-span-2' : ''}`}
            >
              {tool.status === 'Live' ? (
                <Link href={tool.href} className="block h-full outline-none">
                  <ToolCard tool={tool} />
                </Link>
              ) : (
                <div className="h-full cursor-not-allowed opacity-75 grayscale-[30%]">
                  <ToolCard tool={tool} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ToolCard({ tool }: { tool: any }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const isLive = tool.status === 'Live';

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div 
      className="group relative h-full w-full overflow-hidden rounded-[2rem] bg-white/[0.02] border border-white/5 p-8 transition-all duration-500 hover:border-white/20 hover:bg-white/[0.04] shadow-2xl"
      onMouseMove={handleMouseMove}
    >
      {/* Spotlight Hover Effect */}
      {isLive && (
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-0 transition duration-300 group-hover:opacity-100"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                650px circle at ${mouseX}px ${mouseY}px,
                rgba(255,255,255,0.08),
                transparent 80%
              )
            `,
          }}
        />
      )}

      {/* Internal Background Gradient Glow on Hover */}
      {isLive && (
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-700 bg-gradient-to-br ${tool.color}`} />
      )}

      {/* Top Header: Icon & Status */}
      <div className="flex justify-between items-start mb-auto relative z-10">
        <div className={`p-4 rounded-2xl bg-gradient-to-br ${tool.color} shadow-lg shadow-black/50 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
          <tool.icon className="w-8 h-8 text-white drop-shadow-md" />
        </div>
        
        <div className={`px-4 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md transition-colors ${
          isLive 
            ? 'bg-green-500/10 text-green-400 border-green-500/20 group-hover:bg-green-500/20 group-hover:border-green-500/40' 
            : 'bg-white/5 text-gray-400 border-white/10'
        }`}>
          {tool.status}
        </div>
      </div>

      {/* Content - Pushed to Bottom */}
      <div className="absolute bottom-8 left-8 right-8 z-10 flex items-end justify-between">
        <div className="space-y-2 max-w-[80%]">
          <h3 className="text-2xl font-bold text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
            {tool.title}
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors duration-300 line-clamp-2">
            {tool.description}
          </p>
        </div>

        {/* Action Button */}
        {isLive && (
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex flex-shrink-0 items-center justify-center transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-hover:bg-white/10 transition-all duration-500 backdrop-blur-md">
            <ArrowRight className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
    </div>
  );
}
