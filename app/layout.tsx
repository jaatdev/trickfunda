import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Caveat, Kalam } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { FullscreenProvider } from '@/lib/fullscreen-context'
import ToastProvider from '@/components/feedback/ToastProvider'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import Navbar from '@/components/layout/Navbar'
import NavbarSpacer from '@/components/layout/NavbarSpacer'
import Footer from '@/components/layout/Footer'
import GlobalFullscreenButton from '@/components/GlobalFullscreenButton'
import HackerPreloader from '@/components/preloader/HackerPreloader'
import BackToTop from '@/components/ui/BackToTop'
import TrickfundaAI from '@/components/ai/TrickfundaAI'
import 'katex/dist/katex.min.css'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' })
const caveat = Caveat({ subsets: ['latin'], variable: '--font-caveat', display: 'swap' })
const kalam = Kalam({ weight: ['400', '700'], subsets: ['devanagari', 'latin'], variable: '--font-kalam', display: 'swap' })

export const metadata: Metadata = {
  title: 'TrickFunda - World-Class Notes',
  description: 'Data-driven, crisp, recall-ready notes with flashcards, quizzes, and spaced repetition learning.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrains.variable} ${caveat.variable} ${kalam.variable}`}>
        <body suppressHydrationWarning>
          <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
            <FullscreenProvider>
              <ToastProvider>
                <LayoutWrapper>
                  <HackerPreloader />
                  <Navbar />
                  <NavbarSpacer />
                  <div className="pointer-events-none fixed inset-0 z-[-1] flex items-center justify-center opacity-[0.03]">
                    <img src="/watermark.webp" alt="" className="w-[90%] h-auto max-h-[90vh] object-contain" />
                  </div>
                  <main className="flex-1 relative z-0 flex flex-col">{children}</main>
                  <Footer />
                  <GlobalFullscreenButton />
                  <BackToTop />
                  <TrickfundaAI />
                </LayoutWrapper>
              </ToastProvider>
            </FullscreenProvider>
          </NextThemesProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
