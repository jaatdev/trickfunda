import React from 'react';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { Calendar, ChevronRight, Lock, Library } from 'lucide-react';

interface Props {
  params: Promise<{ category: string }>;
}

export default async function CategoryDaysPage({ params }: Props) {
  const { category } = await params;
  
  const categoryLabels: Record<string, string> = {
    vocab: 'Vocabulary (Anto & Syno)',
    ows: 'One Word Substitution',
    idioms: 'Idioms & Phrases',
  };

  const label = categoryLabels[category] || category;

  const dataDir = path.join(process.cwd(), 'data', 'vocab-trickfunda', category);
  
  let files: string[] = [];
  try {
    if (fs.existsSync(dataDir)) {
      files = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));
    }
  } catch (e) {
    console.error(e);
  }

  // Parse days from file names (e.g., day-1.json -> 1)
  const availableDays = files.map(file => {
    const match = file.match(/day-(\d+)\.json/);
    return match ? parseInt(match[1]) : 0;
  }).filter(n => n > 0).sort((a, b) => a - b);

  // Identify custom files that don't match the standard day format
  const customFiles = files.filter(file => !file.match(/day-(\d+)\.json/)).map(file => file.replace('.json', ''));

  // We show 60 days total, lock the ones that don't exist
  const totalDays = 60;
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  return (
    <div className="min-h-[80vh] bg-gray-50 dark:bg-gray-950 p-8 md:p-16 flex flex-col items-center">
      <div className="max-w-6xl w-full space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <Link href="/study-material/vocab-trickfunda" className="text-emerald-500 hover:text-emerald-400 font-medium mb-4 flex items-center gap-2">
            <ChevronRight className="w-4 h-4 rotate-180" /> Back to Dashboard
          </Link>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 dark:text-white capitalize">
            {label}
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Your 60-Day Mastery Plan. Start your daily session to unlock mind-blowing memory hacks.
          </p>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {days.map(dayNum => {
            const isAvailable = availableDays.includes(dayNum);

            if (isAvailable) {
              return (
                <Link
                  key={dayNum}
                  href={`/study-material/vocab-trickfunda/${category}/day-${dayNum}`}
                  className="group relative bg-white dark:bg-[#111] border-2 border-emerald-500/20 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:-translate-y-1 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />
                  <Calendar className="w-8 h-8 text-emerald-500 relative z-10" />
                  <span className="font-bold text-lg text-gray-900 dark:text-white relative z-10">Day {dayNum}</span>
                </Link>
              );
            }

            return (
              <div
                key={dayNum}
                className="bg-gray-100 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 opacity-60 cursor-not-allowed"
              >
                <Lock className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                <span className="font-bold text-lg text-gray-500 dark:text-gray-500">Day {dayNum}</span>
              </div>
            );
          })}
        </div>
        
        {/* Custom Decks Section */}
        {customFiles.length > 0 && (
          <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-6">
              <Library className="w-6 h-6 text-emerald-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Custom Decks</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {customFiles.map(deckName => (
                <Link
                  key={deckName}
                  href={`/study-material/vocab-trickfunda/${category}/${deckName}`}
                  className="group relative bg-white dark:bg-[#111] border-2 border-purple-500/20 hover:border-purple-500 rounded-2xl p-6 flex flex-col gap-3 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:-translate-y-1 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors" />
                  <div className="flex items-start justify-between relative z-10">
                    <span className="font-bold text-lg text-gray-900 dark:text-white capitalize break-words">
                      {deckName.replace(/-/g, ' ')}
                    </span>
                    <ChevronRight className="w-5 h-5 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export const dynamicParams = false;
