import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TrickFunda Canvas',
  description: 'A powerful infinite canvas drawing and brainstorming app.',
};

export default function CanvasPage() {
  return (
    <iframe 
      src="https://trickfunda-canvas.vercel.app/"
      className="w-full h-screen block border-none m-0 p-0 overflow-hidden"
      style={{ minHeight: '100dvh' }}
      title="TrickFunda Canvas"
      allow="clipboard-read; clipboard-write; microphone"
    />
  );
}
