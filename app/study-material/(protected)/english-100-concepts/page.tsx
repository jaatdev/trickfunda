import { Metadata } from 'next';
import { getKDConcepts } from '@/utils/studyMaterialParser';
import { EnglishTheme } from '@/components/study-material/themes/english/EnglishTheme';

export const metadata: Metadata = {
  title: 'English 100 Concepts | Study Material | TrickFunda',
  description: 'Master the top 100 English grammar concepts.',
};

export default async function EnglishConceptsPage() {
  const concepts = await getKDConcepts('english-100-concepts');

  return (
    <EnglishTheme concepts={concepts} displayTitle="English 100 Concepts" />
  );
}
