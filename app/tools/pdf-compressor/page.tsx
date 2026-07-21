import { Metadata } from 'next';
import PDFCompressorClient from './PDFCompressorClient';
import FloatingHomeButton from '@/components/layout/FloatingHomeButton';

export const metadata: Metadata = {
  title: 'PDF Compressor - TrickFunda | Fastest Browser-Based PDF Compression',
  description: 'Compress PDF files instantly in your browser. No uploads, 100% private. Reduce 500MB PDFs to 20MB in seconds.',
};

export default function PDFCompressorPage() {
  return (
    <>
      <FloatingHomeButton />
      <PDFCompressorClient />
    </>
  );
}
