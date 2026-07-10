'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { PenTool, FileDown, BrainCircuit, Calendar, Calculator, Sparkles } from 'lucide-react';

const tools = [
  {
    title: 'Cosmic Canvas',
    description: 'A powerful infinite canvas for brainstorming, diagramming, and visualizing concepts.',
    icon: PenTool,
    href: '/canvas',
    color: 'from-blue-500 to-cyan-400',
    delay: 0.1,
    status: 'Live'
  },
  {
    title: 'PDF Merger',
    description: 'Quickly merge, split, and organize your study materials and past papers in seconds.',
    icon: FileDown,
    href: '/pdf-merger',
    color: 'from-rose-500 to-orange-400',
    delay: 0.2,
    status: 'Live'
  },
  {
    title: 'TrickFunda AI',
    description: 'Your personal 24/7 AI study assistant trained on TrickFunda methods.',
    icon: BrainCircuit,
    href: '/ai',
    color: 'from-violet-500 to-fuchsia-400',
    delay: 0.3,
    status: 'Live'
  },
  {
    title: 'Study Planner',
    description: 'Smart scheduling algorithm to optimize your revision timetables automatically.',
    icon: Calendar,
    href: '#',
    color: 'from-emerald-500 to-teal-400',
    delay: 0.4,
    status: 'Coming Soon'
  },
  {
    title: 'Advanced Calculator',
    description: 'Graphing and scientific calculator built directly into your browser.',
    icon: Calculator,
    href: '#',
    color: 'from-amber-500 to-yellow-400',
    delay: 0.5,
    status: 'Coming Soon'
  }
];

export default function ToolsHubPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-black pb-24">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-12 md:pt-20">
        
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4"
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold text-gray-300">TrickFunda Ecosystem</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500 tracking-tight"
          >
            Student Tools
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto"
          >
            Supercharge your productivity with our suite of custom-built applications designed specifically for TrickFunda students.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {tools.map((tool, idx) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: tool.delay }}
              className={`group relative ${idx === 0 ? 'md:col-span-2 lg:col-span-2' : ''}`}
            >
              {tool.status === 'Live' ? (
                <Link href={tool.href} className="block h-full">
                  <ToolCard tool={tool} />
                </Link>
              ) : (
                <div className="h-full cursor-not-allowed opacity-80">
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
  const Icon = tool.icon;
  const isLive = tool.status === 'Live';

  return (
    <div className={`h-full relative overflow-hidden rounded-3xl bg-white/[0.02] border border-white/10 p-8 backdrop-blur-xl transition-all duration-500 ${isLive ? 'hover:bg-white/[0.04] hover:border-white/20 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.5)]' : ''}`}>
      
      {/* Background Gradient Hover Effect */}
      {isLive && (
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br ${tool.color}`} />
      )}

      {/* Top Header: Icon & Status */}
      <div className="flex justify-between items-start mb-12 relative z-10">
        <div className={`p-4 rounded-2xl bg-gradient-to-br ${tool.color} bg-opacity-10 backdrop-blur-md shadow-inner`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        
        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${isLive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
          {tool.status}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-3">
        <h3 className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">
          {tool.title}
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed">
          {tool.description}
        </p>
      </div>

      {/* Action Arrow */}
      {isLive && (
        <div className="absolute bottom-8 right-8 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      )}
    </div>
  );
}
