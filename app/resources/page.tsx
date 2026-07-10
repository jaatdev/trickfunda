'use client';
import ScrollAnimation from '@/components/ScrollAnimation';
import { BookOpen, Video, FileText, Headphones, Download, ExternalLink } from 'lucide-react';

type ResourceItem = 
  | { title: string; type: string; size: string }
  | { title: string; type: string; duration: string }
  | { title: string; type: string; downloads: string }
  | { title: string; type: string; episodes: string };

const resources = [
  {
    category: 'Study Guides',
    icon: BookOpen,
    color: 'from-rose-500 to-pink-600',
    items: [
      { title: 'Effective Note-Taking Strategies', type: 'PDF', size: '2.4 MB' },
      { title: 'Memory Techniques Masterclass', type: 'PDF', size: '1.8 MB' },
      { title: 'Time Management for Students', type: 'PDF', size: '3.1 MB' },
    ] as ResourceItem[]
  },
  {
    category: 'Video Tutorials',
    icon: Video,
    color: 'from-orange-500 to-amber-600',
    items: [
      { title: 'Getting Started with TrickFunda', type: 'Video', duration: '12:30' },
      { title: 'Mastering Flashcards', type: 'Video', duration: '8:45' },
      { title: 'Advanced Study Techniques', type: 'Video', duration: '15:20' },
    ] as ResourceItem[]
  },
  {
    category: 'Templates',
    icon: FileText,
    color: 'from-amber-500 to-yellow-600',
    items: [
      { title: 'Cornell Notes Template', type: 'Template', downloads: '12.5K' },
      { title: 'Mind Map Template', type: 'Template', downloads: '8.2K' },
      { title: 'Study Schedule Template', type: 'Template', downloads: '15.7K' },
    ] as ResourceItem[]
  },
  {
    category: 'Podcasts',
    icon: Headphones,
    color: 'from-lime-500 to-green-600',
    items: [
      { title: 'Learning Science Explained', type: 'Podcast', episodes: '24' },
      { title: 'Student Success Stories', type: 'Podcast', episodes: '18' },
      { title: 'Study Tips Weekly', type: 'Podcast', episodes: '52' },
    ] as ResourceItem[]
  },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-rose-950 to-orange-950">
      <section className="relative pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(244,63,94,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_60%,rgba(251,146,60,0.15),transparent_50%)]" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollAnimation animation="fade-up">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-full mb-6">
                <span className="text-rose-400 text-sm font-medium">📚 Free Resources</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-linear-to-r from-rose-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
                Learning Resources
              </h1>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Everything you need to supercharge your learning journey. All free, forever.
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid lg:grid-cols-2 gap-8">
            {resources.map((resource, idx) => (
              <ScrollAnimation key={idx} animation="fade-up" delay={idx * 100}>
                <div className="bg-linear-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 hover:border-rose-500/50 transition-all">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-14 h-14 rounded-xl bg-linear-to-br ${resource.color} flex items-center justify-center`}>
                      <resource.icon className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">{resource.category}</h2>
                  </div>
                  
                  <div className="space-y-4">
                    {resource.items.map((item, i) => (
                      <div key={i} className="group flex items-center justify-between p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-all cursor-pointer">
                        <div>
                          <h3 className="text-white font-semibold mb-1 group-hover:text-rose-400 transition-colors">{item.title}</h3>
                          <p className="text-sm text-slate-400">
                            {item.type} • {'size' in item ? item.size : 'duration' in item ? item.duration : 'downloads' in item ? item.downloads : 'episodes' in item ? item.episodes : ''}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 bg-slate-700 rounded-lg hover:bg-rose-600 transition-all">
                            <Download className="w-5 h-5 text-white" />
                          </button>
                          <button className="p-2 bg-slate-700 rounded-lg hover:bg-rose-600 transition-all">
                            <ExternalLink className="w-5 h-5 text-white" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>

          <ScrollAnimation animation="scale" delay={400}>
            <div className="mt-16 bg-linear-to-r from-rose-600 via-orange-600 to-amber-600 rounded-3xl p-12 text-center">
              <h2 className="text-4xl font-bold text-white mb-4">Want More Resources?</h2>
              <p className="text-xl text-rose-50 mb-8">Subscribe to get weekly study materials delivered to your inbox</p>
              <div className="flex gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-3 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button className="px-8 py-3 bg-white text-rose-600 rounded-xl font-semibold hover:bg-rose-50 transition-all hover:scale-105">
                  Subscribe
                </button>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>
    </div>
  );
}
