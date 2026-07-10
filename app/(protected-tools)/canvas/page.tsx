import { Metadata } from 'next';
import FloatingHomeButton from '@/components/layout/FloatingHomeButton';
import IframeWrapper from '@/components/ui/IframeWrapper';

export const metadata: Metadata = {
  title: 'TrickFunda Canvas',
  description: 'A powerful infinite canvas drawing and brainstorming app.',
};

export default function CanvasPage() {
  return (
    <>
      <FloatingHomeButton />
      <IframeWrapper 
        src="https://trickfunda-canvas.vercel.app/"
        title="TrickFunda Canvas"
        allow="clipboard-read; clipboard-write; microphone"
      />
    </>
  );
}
