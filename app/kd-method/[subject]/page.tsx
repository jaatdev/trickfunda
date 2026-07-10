import { getKDChapters, getKDChapterSubjects, getKDSubjectStats } from '@/utils/kdMethodParser';
import Link from 'next/link';
import { Metadata } from 'next';
import SubjectListClient from '@/components/kd-method/SubjectListClient';
import StatsBanner from '@/components/kd-method/StatsBanner';
import { MathTheme } from '@/components/kd-method/themes/math/MathTheme';
import { ReasoningTheme } from '@/components/kd-method/themes/reasoning/ReasoningTheme';
import { GSCosmicTheme } from '@/components/kd-method/themes/gs/GSCosmicTheme';
import { VocabMatrixTheme } from '@/components/kd-method/themes/vocab/VocabMatrixTheme';
import { EnglishSteampunkTheme } from '@/components/kd-method/themes/english-steampunk/EnglishSteampunkTheme';

export async function generateStaticParams() {
  const subjects = await getKDChapterSubjects();
  return subjects.map(subject => ({ subject }));
}

export async function generateMetadata({ params }: { params: Promise<{ subject: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `${resolvedParams.subject.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} | KD Method | TrickFunda`,
    description: `Explore all chapters and types for ${resolvedParams.subject} in the KD Method.`,
  };
}

export default async function SubjectPage({ params }: { params: Promise<{ subject: string }> }) {
  const resolvedParams = await params;
  const { subject } = resolvedParams;
  const chapters = await getKDChapters(subject);
  const stats = await getKDSubjectStats(subject);

  const displayTitle = subject.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  // ==========================================
  // THEME ORCHESTRATION ENGINE
  // ==========================================
  if (subject === 'english-chapterwise') {
    return <EnglishSteampunkTheme subjectSlug={subject} chapters={chapters} displayTitle={displayTitle} />;
  }

  if (subject === 'vocab-trickfunda') {
    return <VocabMatrixTheme subjectSlug={subject} chapters={chapters} displayTitle={displayTitle} />;
  }

  if (subject === 'gs-trickfunda') {
    return <GSCosmicTheme subjectSlug={subject} chapters={chapters} displayTitle={displayTitle} />;
  }

  if (subject === 'maths-trickfunda' || subject === 'abhinay-sir-maths') {
    return <MathTheme subjectSlug={subject} chapters={chapters} displayTitle={displayTitle} />;
  }

  if (subject === 'reasoning-trickfunda') {
    return <ReasoningTheme subjectSlug={subject} chapters={chapters} displayTitle={displayTitle} />;
  }

  // ==========================================
  // DEFAULT FALLBACK THEME
  // ==========================================
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12 px-4 md: md:pb-8 md:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-6 relative z-10 pt-24 md:pt-32">
        {/* Breadcrumb Navigation */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <Link href="/kd-method" className="hover:text-emerald-500 transition-colors whitespace-nowrap">KD Method</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-100 truncate max-w-[200px] sm:max-w-none">{displayTitle}</span>
        </div>

        <StatsBanner stats={stats} subjectSlug={subject} label={`${displayTitle} Totals`} />

        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
            {displayTitle.split(' ')[0]} <span className="text-emerald-500">{displayTitle.split(' ').slice(1).join(' ')}</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
            Select a chapter to master its types and tricks.
          </p>
        </header>

        <SubjectListClient subjectSlug={subject} chapters={chapters} />
      </div>
    </main>
  );
}
