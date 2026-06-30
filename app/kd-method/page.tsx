import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KD Method | TrickFunda',
  description: 'Learn concepts quickly with the KD Method.',
};

import KDMethodLandingClient from '@/components/kd-method/KDMethodLandingClient'
import { getAllKDStats } from '@/utils/kdMethodParser'
import StatsBanner from '@/components/kd-method/StatsBanner'

export default async function KDMethodHome() {
  const stats = await getAllKDStats()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pt-24 pb-8 px-8 md:pt-32 md:pb-16 md:px-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        <StatsBanner stats={stats} subjectSlug="default" label="KD Method Totals" />
        <KDMethodLandingClient />
      </div>
    </div>
  )
}
