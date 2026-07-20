import { Metadata } from 'next';
import { Inter, Playfair_Display, Caveat, JetBrains_Mono } from "next/font/google";
import FloatingHomeButton from '@/components/layout/FloatingHomeButton';
import CanvasApp from '@cosmic/app/page';
import './canvas.css';

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
  title: 'TrickFunda Canvas',
  description: 'A powerful infinite canvas drawing and brainstorming app.',
};

export default function CanvasPage() {
  return (
    <>
      <FloatingHomeButton />
      <div className={`canvas-container dark ${inter.variable} ${playfair.variable} ${caveat.variable} ${jetbrains.variable}`}>
        <CanvasApp />
      </div>
    </>
  );
}
