import { Metadata } from 'next';
import FloatingHomeButton from '@/components/layout/FloatingHomeButton';

export const metadata: Metadata = {
  title: 'TrickFunda AI',
  description: 'AI-powered study assistant for TrickFunda students.',
};

export default function AiPage() {
  return (
    <>
      <FloatingHomeButton />
      <iframe 
        src="https://trickfunda-ai.vercel.app/"
        className="w-full h-screen block border-none m-0 p-0 overflow-hidden"
        style={{ minHeight: '100dvh' }}
        title="TrickFunda AI"
        allow="clipboard-read; clipboard-write; microphone"
      />
    </>
  );
}
