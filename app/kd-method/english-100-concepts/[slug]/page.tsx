import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getKDConceptBySlug, getKDConcepts } from '@/utils/kdMethodParser';
import { ConceptInteractiveViewer } from '@/components/kd-method/ConceptInteractiveViewer';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const concept = await getKDConceptBySlug('english-100-concepts', params.slug);
  
  if (!concept) {
    return { title: 'Concept Not Found' };
  }

  return {
    title: `${concept.title} | English 100 Concepts | KD Method`,
    description: `Learn about ${concept.title}`,
  };
}

// Generate static paths for all existing concepts
export async function generateStaticParams() {
  const concepts = await getKDConcepts('english-100-concepts');
  return concepts.map((concept) => ({
    slug: concept.slug,
  }));
}

export default async function ConceptPage(props: Props) {
  const params = await props.params;
  const concept = await getKDConceptBySlug('english-100-concepts', params.slug);

  if (!concept) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-4 px-4 md: md:pb-8 md:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/kd-method" className="hover:text-emerald-500 transition-colors">KD Method</Link>
          <span>/</span>
          <Link href="/kd-method/english-100-concepts" className="hover:text-emerald-500 transition-colors">English 100 Concepts</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-100 truncate max-w-[200px] sm:max-w-none">{concept.title}</span>
        </div>

        <header className="space-y-4">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">
            {concept.title}
          </h1>
        </header>

        <ConceptInteractiveViewer 
          title={concept.title}
          notesMarkdown={concept.notesMarkdown}
          noteBoxes={concept.noteBoxes}
          pdfUrl={concept.pdfUrl}
          youtubeUrls={concept.youtubeUrls}
          quizzes={concept.quizzes}
          slug={concept.slug}
        />
      </div>
    </div>
  );
}
