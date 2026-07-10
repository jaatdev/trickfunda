import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TrickFunda Canvas',
  description: 'A powerful infinite canvas drawing and brainstorming app.',
};

export default function CanvasPage() {
  return (
    <div className="w-full flex-1 flex flex-col min-h-screen">
      <iframe 
        src="https://trickfunda-canvas.vercel.app/"
        className="flex-1 w-full border-none h-[calc(100vh-80px)]"
        title="TrickFunda Canvas"
        allow="clipboard-read; clipboard-write; microphone"
      />
    </div>
  );
}
