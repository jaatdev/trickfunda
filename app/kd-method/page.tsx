import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KD Method | TrickFunda',
  description: 'Learn concepts quickly with the KD Method.',
};

import KDMethodLandingClient, { Category } from '@/components/kd-method/KDMethodLandingClient'
import { getAllKDStats, getKDChapterSubjects } from '@/utils/kdMethodParser'
import StatsBanner from '@/components/kd-method/StatsBanner'
import { getSubjectTheme } from '@/utils/themeMapping'

export default async function KDMethodHome() {
  const stats = await getAllKDStats()
  const dynamicSubjects = await getKDChapterSubjects();
  const englishTheme = getSubjectTheme('english');
  const categories: Category[] = [
    {
      href: '/kd-method/english-100-concepts',
      title: 'English 100 Concepts',
      description: 'Master the top 100 English grammar rules and concepts with our proven KD Method. Includes notes and targeted quizzes.',
      iconName: 'BookOpen',
      color: englishTheme.bgLight,
      ...englishTheme,
    }
  ];

  dynamicSubjects.forEach((subject) => {
    const title = subject.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').replace('Gs', 'GS');
    const theme = getSubjectTheme(subject);
    categories.push({
      href: `/kd-method/${subject}`,
      title,
      description: `Master ${title} chapter by chapter with comprehensive notes and interactive practice quizzes.`,
      iconName: subject.includes('math') ? 'Calculator' : subject.includes('english') ? 'BookOpen' : subject.includes('reasoning') ? 'Brain' : subject.includes('gs') ? 'Globe' : subject.includes('vocab') ? 'SpellCheck' : 'BookOpen',
      color: theme.bgLight,
      ...theme,
    });
  });

  categories.push({
    href: '/kd-method/custom-quiz',
    title: 'Custom Quiz Builder',
    description: 'Build your own advanced all-in-one quiz. Select subjects and topics to generate a randomized test.',
    iconName: 'Settings2',
    color: 'from-blue-500/10 to-transparent dark:from-blue-500/20',
    iconColor: 'text-blue-500',
    hoverBorder: 'group-hover:border-blue-500/50',
    hoverText: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pb-8 px-8 md: md:pb-16 md:px-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        <StatsBanner stats={stats} subjectSlug="default" label="KD Method Totals" />
        <KDMethodLandingClient categories={categories} />
      </div>
    </div>
  )
}
