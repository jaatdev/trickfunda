import { getKDChapters, getKDChapterSubjects, getKDSubjectStats } from '@/utils/kdMethodParser';
import Link from 'next/link';
import SubjectListClient from '@/components/kd-method/SubjectListClient';
import StatsBanner from '@/components/kd-method/StatsBanner';

export async function generateStaticParams() {
  const subjects = await getKDChapterSubjects();
  return subjects.map(subject => ({ subject }));
}

export default async function TrickFundaIndex({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = await params;
  const chapters = await getKDChapters(subject);
  const stats = await getKDSubjectStats(subject);

  // Format title from slug
  const subjectTitle = subject.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  // Handle specific acronyms correctly
  const displayTitle = subjectTitle.replace('Gs', 'GS');

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-12 px-4 md:pt-32 md:pb-8 md:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
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
