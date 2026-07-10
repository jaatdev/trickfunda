import { Metadata } from 'next';
import { getKDConcepts } from '@/utils/kdMethodParser';
import { EnglishTheme } from '@/components/kd-method/themes/english/EnglishTheme';

export const metadata: Metadata = {
  title: 'English 100 Concepts | KD Method | TrickFunda',
  description: 'Master the top 100 English grammar concepts.',
};

export default async function EnglishConceptsPage() {
  const concepts = await getKDConcepts('english-100-concepts');

  return (
    <EnglishTheme concepts={concepts} displayTitle="English 100 Concepts" />
  );
}
