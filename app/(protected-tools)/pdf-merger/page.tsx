export const runtime = 'edge';
import { Metadata } from 'next';
import FloatingHomeButton from '@/components/layout/FloatingHomeButton';
import IframeWrapper from '@/components/ui/IframeWrapper';

export const metadata: Metadata = {
  title: 'TrickFunda PDF Merger',
  description: 'Merge, split, and organize PDF documents quickly and securely.',
};

export default function PdfMergerPage() {
  return (
    <>
      <FloatingHomeButton />
      <IframeWrapper 
        src="https://trickfunda-pdf-merger.vercel.app/"
        title="TrickFunda PDF Merger"
        allow="clipboard-read; clipboard-write"
      />
    </>
  );
}

