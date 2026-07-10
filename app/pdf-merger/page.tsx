import { Metadata } from 'next';
import FloatingHomeButton from '@/components/layout/FloatingHomeButton';

export const metadata: Metadata = {
  title: 'TrickFunda PDF Merger',
  description: 'Merge, split, and organize PDF documents quickly and securely.',
};

export default function PdfMergerPage() {
  return (
    <>
      <FloatingHomeButton />
      <iframe 
        src="https://trickfunda-pdf-merger.vercel.app/"
        className="w-full h-screen block border-none m-0 p-0 overflow-hidden"
        style={{ minHeight: '100dvh' }}
        title="TrickFunda PDF Merger"
        allow="clipboard-read; clipboard-write"
      />
    </>
  );
}
