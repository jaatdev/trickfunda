import React from 'react';
import { getAllKDStats, getKDChapterSubjects, getKDSubjectStats } from '@/utils/studyMaterialParser';
import { BookOpen, Files, FileText, CheckSquare, Youtube, GraduationCap, FolderTree, FileEdit } from 'lucide-react';
import { getThemeById } from '@/lib/theme-variants';

export default async function AdminDashboard() {
  const stats = await getAllKDStats();
  const subjects = await getKDChapterSubjects();
  
  // We'll fetch basic info for each subject to display in a recent/overview list
  const subjectsData = await Promise.all(
    subjects.map(async (slug) => {
      const subjectStats = await getKDSubjectStats(slug);
      const theme = getThemeById(slug);
      return {
        slug,
        title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        stats: subjectStats,
        color: theme.accent
      };
    })
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
          Dashboard Overview
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Welcome back. Here's what's happening in TrickFunda today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Subjects" value={stats.subjects} icon={BookOpen} color="text-emerald-500" bg="bg-emerald-500/10" />
        <StatCard title="Concepts" value={stats.concepts} icon={Files} color="text-blue-500" bg="bg-blue-500/10" />
        <StatCard title="Quizzes" value={stats.quizzes} icon={CheckSquare} color="text-indigo-500" bg="bg-indigo-500/10" />
        <StatCard title="Questions" value={stats.questions} icon={GraduationCap} color="text-purple-500" bg="bg-purple-500/10" />
        <StatCard title="Video Links" value={stats.videos} icon={Youtube} color="text-red-500" bg="bg-red-500/10" />
        <StatCard title="PDFs" value={stats.pdfs} icon={FileText} color="text-amber-500" bg="bg-amber-500/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Subject Statistics</h2>
            <div className="space-y-4">
              {subjectsData.map((subject) => (
                <div key={subject.slug} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-white dark:bg-black/20 shadow-sm border border-gray-200 dark:border-white/5 ${subject.color}`}>
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{subject.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">/{subject.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center hidden sm:block">
                      <div className="text-lg font-semibold">{subject.stats.concepts}</div>
                      <div className="text-xs text-gray-500">Concepts</div>
                    </div>
                    <div className="text-center hidden sm:block">
                      <div className="text-lg font-semibold">{subject.stats.quizzes}</div>
                      <div className="text-xs text-gray-500">Quizzes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">{subject.stats.questions}</div>
                      <div className="text-xs text-gray-500">Questions</div>
                    </div>
                  </div>
                </div>
              ))}
              
              {subjectsData.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  No subjects found. Go to Content Explorer to create one.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20">
            <h2 className="text-xl font-bold mb-2">Quick Actions</h2>
            <p className="text-emerald-100 text-sm mb-6">
              Manage the Study Material file structure directly from the browser.
            </p>
            <div className="space-y-3">
              <QuickActionButton href="/admin/explorer" icon={FolderTree} title="Open Content Explorer" desc="Browse and create folders" />
              <QuickActionButton href="/admin/editor" icon={FileEdit} title="Modular Editor" desc="Edit notes and quiz data" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">System Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">File System API</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Supabase Realtime</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Data Directory</span>
                <span className="font-mono text-xs text-gray-600 dark:text-gray-300">/data/study-material</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }: { title: string, value: number, icon: any, color: string, bg: string }) {
  return (
    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg} ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</div>
      </div>
    </div>
  );
}

function QuickActionButton({ href, icon: Icon, title, desc }: { href: string, icon: any, title: string, desc: string }) {
  return (
    <a href={href} className="flex items-center gap-4 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/10 group">
      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <div className="font-semibold text-white">{title}</div>
        <div className="text-xs text-emerald-100">{desc}</div>
      </div>
    </a>
  );
}
