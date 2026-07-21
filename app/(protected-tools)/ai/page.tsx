export const runtime = 'edge';
import { Metadata } from 'next';
import FloatingHomeButton from '@/components/layout/FloatingHomeButton';
import IframeWrapper from '@/components/ui/IframeWrapper';

export const metadata: Metadata = {
  title: 'TrickFunda AI',
  description: 'AI-powered study assistant for TrickFunda students.',
};

export default function AiPage() {
  return (
    <>
      <FloatingHomeButton />
      <IframeWrapper 
        src="https://trickfunda-ai.vercel.app/"
        title="TrickFunda AI"
        allow="clipboard-read; clipboard-write; microphone"
      />
    </>
  );
}

