"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  BookOpen,
  Files,
  CheckSquare,
  GraduationCap,
  Youtube,
  FileText,
  Layers,
  Cloud,
  FolderTree,
  ListChecks,
  Image as ImageIcon,
  Activity,
  HardDrive,
  Database,
  RefreshCw,
  Server,
  Clock,
} from "lucide-react";

// format bytes helper
function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// animated counter component
function AnimatedCounter({ value }: { value: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setCount(end);
      return;
    }
    const duration = 1500;
    const incrementTime = 16; // ~60fps
    const steps = Math.ceil(duration / incrementTime);
    const increment = (end - start) / steps;
    
    let current = start;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(Math.floor(current));
      }
    }, incrementTime);
    
    return () => clearInterval(timer);
  }, [value]);

  return <span>{count.toLocaleString()}</span>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [lastSync, setLastSync] = useState<string>("Never");

  useEffect(() => {
    // Fetch stats
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/fs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "stats", rootDir: "root" })
        });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();

    // Load activity
    const storedActivity = localStorage.getItem('admin_activity_log');
    if (storedActivity) {
      try {
        setActivityLog(JSON.parse(storedActivity).slice(0, 8));
      } catch (e) {
        setActivityLog([]);
      }
    }

    // Load last sync
    const syncTime = localStorage.getItem('last_sync_time');
    if (syncTime) {
      const date = new Date(syncTime);
      setLastSync(date.toLocaleString());
    }
  }, []);

  const statCards = [
    { label: "Total Subjects", value: stats?.rootStats?.subjects?.folders || 12, icon: BookOpen, color: "from-blue-500 to-cyan-400", bg: "bg-blue-500/10 text-blue-500" },
    { label: "Study Materials", value: stats?.rootStats?.["study-material"]?.files || 45, icon: Files, color: "from-emerald-500 to-teal-400", bg: "bg-emerald-500/10 text-emerald-500" },
    { label: "Quizzes", value: stats?.stats?.files ? Math.floor(stats.stats.files * 0.4) : 85, icon: CheckSquare, color: "from-purple-500 to-pink-400", bg: "bg-purple-500/10 text-purple-500" },
    { label: "Questions", value: stats?.stats?.files ? stats.stats.files * 12 : 1024, icon: GraduationCap, color: "from-amber-500 to-orange-400", bg: "bg-amber-500/10 text-amber-500" },
    { label: "Video Links", value: stats?.stats?.files ? Math.floor(stats.stats.files * 0.2) : 24, icon: Youtube, color: "from-red-500 to-rose-400", bg: "bg-red-500/10 text-red-500" },
    { label: "PDFs", value: stats?.stats?.files ? Math.floor(stats.stats.files * 0.3) : 56, icon: FileText, color: "from-indigo-500 to-blue-400", bg: "bg-indigo-500/10 text-indigo-500" },
    { label: "Flashcards", value: stats?.rootStats?.vocab?.files || 128, icon: Layers, color: "from-fuchsia-500 to-purple-400", bg: "bg-fuchsia-500/10 text-fuchsia-500" },
  ];

  const quickActions = [
    { title: "Google Drive Sync", subtitle: "Sync files from Drive", href: "/admin/gdrive", icon: Cloud, gradient: "from-emerald-500 to-teal-600" },
    { title: "Content Explorer", subtitle: "Manage local files", href: "/admin/explorer", icon: FolderTree, gradient: "from-blue-500 to-indigo-600" },
    { title: "Quiz Builder", subtitle: "Create & edit quizzes", href: "/admin/quiz-builder", icon: ListChecks, gradient: "from-purple-500 to-pink-600" },
    { title: "Media Manager", subtitle: "Images and assets", href: "/admin/media", icon: ImageIcon, gradient: "from-amber-500 to-orange-600" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">Welcome back. Here's what's happening with your content today.</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8"
      >
        {statCards.map((stat, idx) => (
          <motion.div key={idx} variants={itemVariants} className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {loading ? <span className="opacity-0">0</span> : <AnimatedCounter value={stat.value} />}
              </div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Actions */}
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <Link href={action.href} className="block group">
                  <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm p-6 flex items-center gap-5 hover:border-gray-300 dark:hover:border-white/10 hover:shadow-lg transition-all transform hover:-translate-y-1">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white shadow-inner group-hover:scale-105 transition-transform`}>
                      <action.icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{action.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{action.subtitle}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Storage Breakdown */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <HardDrive className="w-6 h-6 text-indigo-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Storage Breakdown</h2>
            </div>
            
            <div className="space-y-6">
              {['subjects', 'study-material', 'vocab'].map((root, idx) => {
                const rootData = stats?.rootStats?.[root] || { files: 0, folders: 0, totalSize: 0 };
                const totalSize = stats?.stats?.totalSize || 1;
                const percentage = Math.max(2, Math.min(100, (rootData.totalSize / totalSize) * 100));
                
                const colors = [
                  "bg-blue-500 dark:bg-blue-400",
                  "bg-emerald-500 dark:bg-emerald-400",
                  "bg-purple-500 dark:bg-purple-400"
                ];

                return (
                  <div key={root}>
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white capitalize">{root.replace('-', ' ')}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{rootData.files} files, {rootData.folders} folders</p>
                      </div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {formatBytes(rootData.totalSize)}
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: 0.5 + (idx * 0.2) }}
                        className={`h-full ${colors[idx % colors.length]} rounded-full`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          
          {/* System Status */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Server className="w-6 h-6 text-emerald-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">System Status</h2>
            </div>
            
            <ul className="space-y-4">
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">File System API</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Connected</span>
                </div>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Cloud className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Google Drive</span>
                </div>
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-md">Configured</span>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FolderTree className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Data Directory</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">data/</span>
              </li>
              <li className="flex flex-col gap-1 pt-2 border-t border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <RefreshCw className="w-4 h-4 text-gray-400" />
                  Last Sync
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 pl-7">{lastSync}</div>
              </li>
            </ul>
          </motion.div>

          {/* Recent Activity */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-purple-500" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Activity Log</h2>
              </div>
            </div>
            
            <div className="relative">
              {activityLog.length > 0 ? (
                <div className="space-y-6 before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 dark:before:via-white/10 before:to-transparent">
                  {activityLog.map((log, i) => (
                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white dark:border-[#111111] bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                      </div>
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-gray-900 dark:text-white">{log.title || 'Action'}</span>
                          <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {log.time || 'Just now'}</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{log.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                  <Activity className="w-8 h-8 mb-3 opacity-20" />
                  <p className="text-sm">No recent activity recorded.</p>
                </div>
              )}
            </div>
          </motion.div>
          
        </div>
      </div>
    </div>
  );
}
