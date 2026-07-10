'use client';
import ScrollAnimation from '@/components/ScrollAnimation';
import { Briefcase, MapPin, Clock, ArrowRight } from 'lucide-react';

const jobs = [
  { title: 'Senior Frontend Engineer', dept: 'Engineering', location: 'Remote', type: 'Full-time', color: 'from-blue-500 to-cyan-600' },
  { title: 'Product Designer', dept: 'Design', location: 'San Francisco', type: 'Full-time', color: 'from-purple-500 to-pink-600' },
  { title: 'Content Strategist', dept: 'Content', location: 'Remote', type: 'Full-time', color: 'from-emerald-500 to-teal-600' },
  { title: 'DevOps Engineer', dept: 'Engineering', location: 'New York', type: 'Full-time', color: 'from-orange-500 to-red-600' },
  { title: 'Marketing Manager', dept: 'Marketing', location: 'Remote', type: 'Full-time', color: 'from-indigo-500 to-purple-600' },
  { title: 'Data Scientist', dept: 'Data', location: 'London', type: 'Full-time', color: 'from-rose-500 to-pink-600' },
];

const perks = [
  '💰 Competitive salary + equity',
  '🏥 Health, dental, vision insurance',
  '🏖️ Unlimited PTO',
  '💻 Latest tech equipment',
  '📚 Learning budget',
  '🌍 Remote-first culture',
  '🎯 Career growth opportunities',
  '🍕 Team events & retreats',
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-purple-950 to-pink-950">
      <section className="relative pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(168,85,247,0.15),transparent_50%)]" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <ScrollAnimation animation="fade-up">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-6">
                <span className="text-purple-400 text-sm font-medium">💼 Careers</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-linear-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
                Join Our Team
              </h1>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Help us build the future of learning. Work with passionate people on meaningful problems.
              </p>
            </div>
          </ScrollAnimation>

          <ScrollAnimation animation="fade-up" delay={200}>
            <div className="bg-linear-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 mb-16">
              <h2 className="text-3xl font-bold text-white mb-6">Why Join TrickFunda?</h2>
              <div className="grid md:grid-cols-4 gap-4">
                {perks.map((perk, idx) => (
                  <div key={idx} className="text-slate-300 text-center p-4 bg-slate-800/50 rounded-xl">
                    {perk}
                  </div>
                ))}
              </div>
            </div>
          </ScrollAnimation>

          <ScrollAnimation animation="fade-up" delay={300}>
            <h2 className="text-4xl font-bold text-white mb-8">Open Positions</h2>
          </ScrollAnimation>

          <div className="space-y-4">
            {jobs.map((job, idx) => (
              <ScrollAnimation key={idx} animation="fade-left" delay={idx * 50}>
                <div className="group bg-linear-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-purple-500/50 transition-all hover:scale-102 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${job.color} flex items-center justify-center`}>
                        <Briefcase className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">{job.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span>{job.dept}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</span>
                          <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{job.type}</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-6 h-6 text-purple-400 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>

          <ScrollAnimation animation="scale" delay={600}>
            <div className="mt-16 bg-linear-to-r from-purple-600 via-pink-600 to-rose-600 rounded-3xl p-12 text-center">
              <h2 className="text-4xl font-bold text-white mb-4">Don't See Your Role?</h2>
              <p className="text-xl text-purple-50 mb-8">We're always looking for talented people. Send us your resume!</p>
              <button className="px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all hover:scale-105">
                Send Application
              </button>
            </div>
          </ScrollAnimation>
        </div>
      </section>
    </div>
  );
}
