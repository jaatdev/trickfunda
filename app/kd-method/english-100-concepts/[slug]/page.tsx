import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getKDConceptBySlug, getKDConcepts } from '@/utils/kdMethodParser';
import { ConceptInteractiveViewer } from '@/components/kd-method/ConceptInteractiveViewer';
import { Metadata } from 'next';
import { EnglishViewerWrapper } from '@/components/kd-method/themes/english/EnglishViewerWrapper';
import { GoldenDustBackground } from '@/components/kd-method/themes/english/GoldenDustBackground';

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
    <EnglishViewerWrapper>
      <div className="min-h-screen relative overflow-hidden pb-4 px-4 md:pb-8 md:px-8 pt-8">
        <GoldenDustBackground />
        
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center space-x-2 text-sm text-amber-500/60 font-serif mb-8 border-b border-amber-900/30 pb-4">
            <Link href="/kd-method" className="hover:text-amber-400 transition-colors">KD Method</Link>
            <span>/</span>
            <Link href="/kd-method/english-100-concepts" className="hover:text-amber-400 transition-colors">English 100 Concepts</Link>
            <span>/</span>
            <span className="text-amber-200 truncate max-w-[200px] sm:max-w-none">{concept.title}</span>
          </div>

          <header className="space-y-4 mb-8 text-center">
            <h1 className="text-3xl md:text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-200 to-amber-600 drop-shadow-sm tracking-wide">
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
    </EnglishViewerWrapper>
  );
}
