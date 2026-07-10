'use client';
import ScrollAnimation from '@/components/ScrollAnimation';
import { Users, MessageCircle, Trophy, Heart, TrendingUp, Sparkles } from 'lucide-react';

const stats = [
  { icon: Users, label: 'Active Members', value: '50K+', color: 'from-violet-500 to-purple-600' },
  { icon: MessageCircle, label: 'Discussions', value: '125K+', color: 'from-fuchsia-500 to-pink-600' },
  { icon: Trophy, label: 'Achievements', value: '500K+', color: 'from-amber-500 to-orange-600' },
  { icon: Heart, label: 'Study Groups', value: '2.5K+', color: 'from-rose-500 to-red-600' },
];

const members = [
  { name: 'Sarah Chen', role: 'Top Contributor', avatar: '👩🎓', posts: 1250, likes: 8500 },
  { name: 'Alex Kumar', role: 'Study Group Leader', avatar: '👨💻', posts: 980, likes: 6200 },
  { name: 'Emma Wilson', role: 'Community Helper', avatar: '👩🏫', posts: 850, likes: 5800 },
  { name: 'James Park', role: 'Rising Star', avatar: '👨🎓', posts: 620, likes: 4100 },
];

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-violet-950 to-fuchsia-950">
      <section className="relative pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(139,92,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(217,70,239,0.15),transparent_50%)]" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollAnimation animation="fade-up">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full mb-6">
                <span className="text-violet-400 text-sm font-medium">👥 Community</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-linear-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                Join Our Community
              </h1>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Connect with thousands of learners, share knowledge, and grow together
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, idx) => (
              <ScrollAnimation key={idx} animation="scale" delay={idx * 100}>
                <div className="bg-linear-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 text-center hover:scale-105 transition-all">
                  <div className={`w-14 h-14 rounded-xl bg-linear-to-br ${stat.color} flex items-center justify-center mx-auto mb-4`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-slate-400">{stat.label}</div>
                </div>
              </ScrollAnimation>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            <ScrollAnimation animation="fade-right">
              <div className="bg-linear-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-violet-400" />
                  Top Contributors
                </h2>
                
                <div className="space-y-4">
                  {members.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-all cursor-pointer">
                      <div className="text-4xl">{member.avatar}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white">{member.name}</h3>
                        <p className="text-sm text-violet-400">{member.role}</p>
                      </div>
                      <div className="text-right text-sm text-slate-400">
                        <div>{member.posts} posts</div>
                        <div>{member.likes} likes</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollAnimation>

            <ScrollAnimation animation="fade-left">
              <div className="bg-linear-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-fuchsia-400" />
                  Recent Discussions
                </h2>
                
                <div className="space-y-4">
                  {['How to master calculus in 30 days?', 'Best note-taking strategies for STEM', 'Study group for physics finals', 'Tips for memorizing historical dates'].map((topic, idx) => (
                    <div key={idx} className="p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-all cursor-pointer">
                      <h3 className="text-white font-semibold mb-2">{topic}</h3>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span>💬 {Math.floor(Math.random() * 50) + 10} replies</span>
                        <span>👁️ {Math.floor(Math.random() * 500) + 100} views</span>
                        <span>🕐 {Math.floor(Math.random() * 24) + 1}h ago</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollAnimation>
          </div>

          <ScrollAnimation animation="scale">
            <div className="bg-linear-to-r from-violet-600 via-fuchsia-600 to-pink-600 rounded-3xl p-12 text-center">
              <h2 className="text-4xl font-bold text-white mb-4">Ready to Join?</h2>
              <p className="text-xl text-violet-50 mb-8">Become part of the fastest-growing learning community</p>
              <button className="px-8 py-4 bg-white text-violet-600 rounded-xl font-semibold hover:bg-violet-50 transition-all hover:scale-105">
                Join Community
              </button>
            </div>
          </ScrollAnimation>
        </div>
      </section>
    </div>
  );
}
