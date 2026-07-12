import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Study Material | TrickFunda',
  description: 'Learn concepts quickly with the Study Material.',
};

import StudyMaterialLandingClient, { Category } from '@/components/study-material/StudyMaterialLandingClient'
import { getAllKDStats, getKDChapterSubjects } from '@/utils/studyMaterialParser'
import StatsBanner from '@/components/study-material/StatsBanner'
import { getSubjectTheme } from '@/utils/themeMapping'

export default async function StudyMaterialHome() {
  const stats = await getAllKDStats()
  const dynamicSubjects = await getKDChapterSubjects();
  const englishTheme = getSubjectTheme('english');
  const categories: Category[] = [
    {
      href: '/study-material/english-100-concepts',
      title: 'English 100 Concepts',
      description: 'Master the top 100 English grammar rules and concepts with our proven Study Material. Includes notes and targeted quizzes.',
      iconName: 'BookOpen',
      color: englishTheme.bgLight,
      ...englishTheme,
    }
  ];

  dynamicSubjects.forEach((subject) => {
    if (subject === 'vocab-trickfunda') return;
    const title = subject.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').replace('Gs', 'GS');
    const theme = getSubjectTheme(subject);
    categories.push({
      href: `/study-material/${subject}`,
      title,
      description: `Master ${title} chapter by chapter with comprehensive notes and interactive practice quizzes.`,
      iconName: subject.includes('math') ? 'Calculator' : subject.includes('english') ? 'BookOpen' : subject.includes('reasoning') ? 'Brain' : subject.includes('gs') ? 'Globe' : subject.includes('vocab') ? 'SpellCheck' : 'BookOpen',
      color: theme.bgLight,
      ...theme,
    });
  });

  categories.push({
    href: '/study-material/custom-quiz',
    title: 'Custom Quiz Builder',
    description: 'Build your own advanced all-in-one quiz. Select subjects and topics to generate a randomized test.',
    iconName: 'Settings2',
    color: 'from-blue-500/10 to-transparent dark:from-blue-500/20',
    iconColor: 'text-blue-500',
    hoverBorder: 'group-hover:border-blue-500/50',
    hoverText: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
  });

  categories.push({
    href: '/study-material/vocab-trickfunda',
    title: 'Gamified KD Flashcards',
    description: 'Master Vocabulary, Idioms, and One-Word Substitutions with mind-blowing 3-stage animated hacks in a structured daily curriculum.',
    iconName: 'Brain',
    color: 'from-emerald-500/10 to-transparent dark:from-emerald-500/20',
    iconColor: 'text-emerald-500',
    hoverBorder: 'group-hover:border-emerald-500/50',
    hoverText: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pb-8 px-8 md: md:pb-16 md:px-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        <StatsBanner stats={stats} subjectSlug="default" label="Study Material Totals" />
        <StudyMaterialLandingClient categories={categories} />
      </div>
    </div>
  )
}
