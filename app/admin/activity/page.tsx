"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  Trash2, 
  RefreshCw, 
  Plus, 
  Edit3, 
  Trash, 
  Navigation, 
  Clock, 
  BarChart2, 
  Calendar,
  AlertTriangle
} from "lucide-react";

interface ActivityLog {
  action: string;
  detail: string;
  timestamp: string;
}

const ACTION_COLORS: Record<string, string> = {
  sync: "bg-blue-500",
  create: "bg-green-500",
  edit: "bg-amber-500",
  delete: "bg-red-500",
  navigate: "bg-gray-500",
  default: "bg-emerald-500"
};

const ACTION_ICONS: Record<string, any> = {
  sync: RefreshCw,
  create: Plus,
  edit: Edit3,
  delete: Trash,
  navigate: Navigation,
  default: Activity
};

const timeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${Math.max(0, seconds)}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
};

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem("admin_activity_log");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ActivityLog[];
        parsed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setLogs(parsed);
      } catch (e) {
        console.error("Failed to parse activity log", e);
      }
    }
  }, []);

  const handleClear = () => {
    localStorage.removeItem("admin_activity_log");
    setLogs([]);
    setShowClearConfirm(false);
  };

  const filteredLogs = logs.filter(
    (log) => filter === "all" || log.action.toLowerCase() === filter.toLowerCase()
  );

  const getStats = () => {
    if (!logs.length) return null;
    
    const today = new Date().toDateString();
    const todayCount = logs.filter(l => new Date(l.timestamp).toDateString() === today).length;
    
    const actionCounts = logs.reduce((acc, log) => {
      const act = log.action.toLowerCase();
      acc[act] = (acc[act] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommon = Object.entries(actionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";
    
    return {
      total: logs.length,
      today: todayCount,
      mostCommon,
      lastAction: logs[0] ? timeAgo(logs[0].timestamp) : "Never"
    };
  };

  const stats = getStats();

  if (!isMounted) return null;

  return (
    <div className="min-h-screen p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              Activity Log
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Track and monitor administrative actions across the platform.
            </p>
          </div>
          
          {logs.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-600 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="font-medium">Clear History</span>
            </button>
          )}
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Activity} label="Total Actions" value={stats.total.toString()} />
            <StatCard icon={Calendar} label="Actions Today" value={stats.today.toString()} />
            <StatCard icon={BarChart2} label="Most Common" value={stats.mostCommon} className="capitalize" />
            <StatCard icon={Clock} label="Last Action" value={stats.lastAction} />
          </div>
        )}

        {/* Content */}
        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-4">
                <Activity className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">No activity recorded yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm">
                Your admin actions will appear here as you use the panel.
              </p>
            </div>
          ) : (
            <div className="p-6">
              {/* Filters */}
              <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-100 dark:border-white/5 pb-6">
                {["all", "sync", "create", "edit", "delete"].map((f) => {
                  const count = f === "all" ? logs.length : logs.filter(l => l.action.toLowerCase() === f).length;
                  return (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        filter === f
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                          : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"
                      }`}
                    >
                      <span className="capitalize">{f}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        filter === f 
                          ? "bg-white/20 text-white" 
                          : "bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-gray-300"
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Timeline */}
              <div className="relative border-l-2 border-gray-100 dark:border-white/10 ml-4 space-y-8 pb-4">
                <AnimatePresence mode="popLayout">
                  {filteredLogs.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="pl-8 text-gray-500 dark:text-gray-400 py-4"
                    >
                      No activities match the selected filter.
                    </motion.div>
                  ) : (
                    filteredLogs.map((log, idx) => {
                      const logAction = log.action.toLowerCase();
                      const colorClass = ACTION_COLORS[logAction] || ACTION_COLORS.default;
                      const textColorClass = colorClass.replace('bg-', 'text-');
                      const Icon = ACTION_ICONS[logAction] || ACTION_ICONS.default;
                      
                      return (
                        <motion.div
                          key={`${log.timestamp}-${idx}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: Math.min(idx * 0.05, 0.5), duration: 0.3 }}
                          className="relative pl-8"
                        >
                          <div className={`absolute -left-[9px] top-2 w-4 h-4 rounded-full border-2 border-white dark:border-[#111111] shadow-sm ${colorClass}`} />
                          
                          <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl p-4 hover:shadow-md transition-shadow">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-lg bg-white dark:bg-white/10 shadow-sm`}>
                                  <Icon className={`w-4 h-4 ${textColorClass}`} />
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white capitalize">
                                  {log.action}
                                </span>
                              </div>
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {timeAgo(log.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {log.detail}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-full">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Clear Activity Log?</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to permanently delete all activity history? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClear}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors font-medium shadow-sm shadow-red-600/20"
                >
                  Yes, Clear All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, className = "" }: { icon: any, label: string, value: string | number, className?: string }) {
  return (
    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
        <Icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
        <p className={`text-xl font-bold text-gray-900 dark:text-white ${className}`}>{value}</p>
      </div>
    </div>
  );
}
