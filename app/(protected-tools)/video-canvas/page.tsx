import { Metadata } from 'next';
import { Inter, Playfair_Display, Caveat, JetBrains_Mono } from "next/font/google";
import FloatingHomeButton from '@/components/layout/FloatingHomeButton';
import VideoCanvasApp from '@video-canvas/app/page';
import './video-canvas.css';

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-hand",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: 'Video Canvas | TrickFunda',
  description: 'Teach on top of any video with drawing tools, annotations, and image overlays. Import videos and annotate in real-time.',
};

export default function VideoCanvasPage() {
  return (
    <>
      <FloatingHomeButton />
      <div className={`video-canvas-wrapper dark ${inter.variable} ${playfair.variable} ${caveat.variable} ${jetbrains.variable}`}>
        <VideoCanvasApp />
      </div>
    </>
  );
}
