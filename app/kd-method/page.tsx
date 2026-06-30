import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KD Method | TrickFunda',
  description: 'Learn concepts quickly with the KD Method.',
};

import KDMethodLandingClient from '@/components/kd-method/KDMethodLandingClient';

export default function KDMethodLandingPage() {
  return <KDMethodLandingClient />;
}
