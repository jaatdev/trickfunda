import { getKDChapterTypes, getKDChapters, getKDChapterSubjects } from '@/utils/kdMethodParser';
import Link from 'next/link';
import { Metadata } from 'next';
import ChapterTypesClient from '@/components/kd-method/ChapterTypesClient';

export type Props = {
  params: Promise<{ subject: string; chapter: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const chapterTitle = params.chapter.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const subjectTitle = params.subject.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').replace('Gs', 'GS');
  
  return {
    title: `${chapterTitle} | ${subjectTitle} | KD Method`,
    description: `Learn about ${chapterTitle}`,
  };
}

export async function generateStaticParams() {
  const subjects = await getKDChapterSubjects();
  const paramsList = [];
  
  for (const subject of subjects) {
    const chapters = await getKDChapters(subject);
    for (const chapter of chapters) {
      paramsList.push({
        subject,
        chapter: chapter.slug,
      });
    }
  }
  
  return paramsList;
}

export default async function TrickFundaChapter(props: Props) {
  const params = await props.params;
  const types = await getKDChapterTypes(params.subject, params.chapter);
  
  // Format title from slug
  const chapterTitle = params.chapter.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const subjectTitle = params.subject.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').replace('Gs', 'GS');

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-12 px-4 md:pt-32 md:pb-8 md:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Breadcrumb Navigation */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <Link href="/kd-method" className="hover:text-emerald-500 transition-colors whitespace-nowrap">KD Method</Link>
          <span>/</span>
          <Link href={`/kd-method/${params.subject}`} className="hover:text-emerald-500 transition-colors whitespace-nowrap">{subjectTitle}</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-100 truncate max-w-[200px] sm:max-w-none">{chapterTitle}</span>
        </div>

        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
            {chapterTitle}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
            Select a specific type to learn the tricks and practice bilingual questions.
          </p>
        </header>

        <ChapterTypesClient subjectSlug={params.subject} chapterSlug={params.chapter} types={types} />
      </div>
    </main>
  );
}
