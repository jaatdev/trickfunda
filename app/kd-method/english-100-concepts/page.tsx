import Link from 'next/link';
import { Metadata } from 'next';
import { getKDConcepts } from '@/utils/kdMethodParser';
import ChapterTypesClient from '@/components/kd-method/ChapterTypesClient';

export const metadata: Metadata = {
  title: 'English 100 Concepts | KD Method | TrickFunda',
  description: 'Master the top 100 English grammar concepts.',
};

export default async function EnglishConceptsPage() {
  const concepts = await getKDConcepts('english-100-concepts');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pt-24 pb-8 px-8 md:pt-32 md:pb-16 md:px-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        <header className="space-y-4 mb-12">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <Link href="/kd-method" className="hover:text-emerald-500 transition-colors">KD Method</Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-gray-100">English 100 Concepts</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            English 100 Concepts
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
            Select a concept to review the notes and test your knowledge.
          </p>
        </header>

        <ChapterTypesClient 
          subjectSlug="english" 
          baseRoute="/kd-method/english-100-concepts"
          types={concepts} 
        />
      </div>
    </div>
  );
}
