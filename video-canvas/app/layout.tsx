import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, Caveat, JetBrains_Mono } from "next/font/google";
import "./globals.css";

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Video Canvas | Teach on Any Video",
  description: "Import any video, draw annotations, pin images to hide logos, and teach on top of video in real-time with full drawing tools and zoom control.",
  keywords: ["video", "teaching", "canvas", "annotation", "drawing", "overlay"],
  authors: [{ name: "TrickFunda" }],
};

export default function VideoCanvasLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${playfair.variable} ${caveat.variable} ${jetbrains.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
