import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getKDChapterTypeData, getKDChapterTypes, getKDChapters, getKDChapterSubjects } from '@/utils/kdMethodParser';
import { ConceptInteractiveViewer } from '@/components/kd-method/ConceptInteractiveViewer';
import { Metadata } from 'next';
import StatsBanner from '@/components/kd-method/StatsBanner';

type Props = {
  params: Promise<{ subject: string; chapter: string; type: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const typeData = await getKDChapterTypeData(params.subject, params.chapter, params.type);
  
  if (!typeData) {
    return { title: 'Type Not Found' };
  }

  const subjectTitle = params.subject.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').replace('Gs', 'GS');

  return {
    title: `${typeData.title} | ${subjectTitle} | KD Method`,
    description: `Learn about ${typeData.title}`,
  };
}

export async function generateStaticParams() {
  const subjects = await getKDChapterSubjects();
  const paramsList = [];
  
  for (const subject of subjects) {
    const chapters = await getKDChapters(subject);
    for (const chapter of chapters) {
      const types = await getKDChapterTypes(subject, chapter.slug);
      for (const type of types) {
        paramsList.push({
          subject,
          chapter: chapter.slug,
          type: type.slug,
        });
      }
    }
  }
  
  return paramsList;
}

export default async function TrickFundaTypeViewer(props: Props) {
  const params = await props.params;
  const typeData = await getKDChapterTypeData(params.subject, params.chapter, params.type);

  if (!typeData) {
    notFound();
  }

  // Format title from slug
  const chapterTitle = params.chapter.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const subjectTitle = params.subject.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').replace('Gs', 'GS');

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-4 px-4 md:pt-32 md:pb-8 md:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/kd-method" className="hover:text-emerald-500 transition-colors whitespace-nowrap">KD Method</Link>
          <span>/</span>
          <Link href={`/kd-method/${params.subject}`} className="hover:text-emerald-500 transition-colors whitespace-nowrap">{subjectTitle}</Link>
          <span>/</span>
          <Link href={`/kd-method/${params.subject}/${params.chapter}`} className="hover:text-emerald-500 transition-colors whitespace-nowrap">{chapterTitle}</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-100 truncate max-w-[150px] sm:max-w-none">{typeData.title}</span>
        </div>

        <header className="space-y-4">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">
            {typeData.title}
          </h1>
        </header>

        <StatsBanner 
          stats={{
            concepts: 1,
            videos: typeData.youtubeUrls?.length || 0,
            pdfs: typeData.pdfUrl ? 1 : 0,
            quizzes: typeData.quizzes?.length || 0,
            questions: typeData.quizzes?.reduce((acc, q) => acc + (q.questions?.length || 0), 0) || 0
          }} 
          subjectSlug={params.subject} 
          label={`${typeData.title} Totals`} 
        />

        {/* Content Viewer (Reused from English Concepts) */}
        <ConceptInteractiveViewer 
          title={`${chapterTitle}: ${typeData.title}`}
          notesMarkdown={typeData.notesMarkdown}
          noteBoxes={typeData.noteBoxes}
          pdfUrl={typeData.pdfUrl}
          youtubeUrls={typeData.youtubeUrls}
          quizzes={typeData.quizzes}
          slug={typeData.slug}
        />
      </div>
    </main>
  );
}
