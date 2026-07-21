import React from 'react';
import Link from 'next/link';
import { BookOpen, Sparkles, Languages, ChevronRight, Brain } from 'lucide-react';

export default function VocabTrickfundaDashboard() {
  const categories = [
    { 
      id: 'vocab', 
      label: 'Vocabulary (Antonyms & Synonyms)', 
      desc: 'Master standard words with their meanings, synonyms, and antonyms.',
      icon: BookOpen,
      color: 'from-blue-500/20 to-blue-600/5',
      borderColor: 'border-blue-500/20',
      iconColor: 'text-blue-500',
    },
    { 
      id: 'ows', 
      label: 'One Word Substitution (OWS)', 
      desc: 'Learn single words that can replace entire phrases perfectly.',
      icon: Sparkles,
      color: 'from-emerald-500/20 to-emerald-600/5',
      borderColor: 'border-emerald-500/20',
      iconColor: 'text-emerald-500',
    },
    { 
      id: 'idioms', 
      label: 'Idioms & Phrases', 
      desc: 'Discover common phrases and their hidden historical or cultural meanings.',
      icon: Languages,
      color: 'from-purple-500/20 to-purple-600/5',
      borderColor: 'border-purple-500/20',
      iconColor: 'text-purple-500',
    },
  ];

  return (
    <div className="min-h-[80vh] bg-gray-50 dark:bg-gray-950 p-8 md:p-16 flex flex-col items-center">
      <div className="max-w-5xl w-full space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 transform rotate-3 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
            <Brain className="w-12 h-12 text-emerald-500" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 dark:text-white">
            Vocab <span className="text-emerald-500">TrickFunda</span>
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Your daily curriculum for mastering vocabulary through mind-blowing KD Hacks. Select a category below to access your daily flashcards.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          {categories.map(cat => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                href={`/study-material/vocab-trickfunda/${cat.id}`}
                className={`group relative overflow-hidden bg-white dark:bg-[#111] p-8 rounded-3xl border-2 ${cat.borderColor} hover:border-emerald-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/10 flex flex-col items-start h-full`}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${cat.color} blur-3xl -mr-10 -mt-10 rounded-full transition-transform group-hover:scale-150 duration-700`} />
                
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl mb-6 relative z-10 border border-gray-100 dark:border-white/5">
                  <Icon className={`w-8 h-8 ${cat.iconColor}`} />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 relative z-10">
                  {cat.label}
                </h2>
                
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-8 flex-1 relative z-10">
                  {cat.desc}
                </p>

                <div className="flex items-center gap-2 text-emerald-500 font-bold tracking-wide relative z-10 group-hover:gap-4 transition-all">
                  Open Curriculum <ChevronRight className="w-5 h-5" />
                </div>
              </Link>
            )
          })}
        </div>
        
      </div>
    </div>
  );
}

export const dynamicParams = false;
