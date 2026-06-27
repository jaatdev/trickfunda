import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { FullscreenProvider } from '@/lib/fullscreen-context'
import ToastProvider from '@/components/feedback/ToastProvider'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import GlobalFullscreenButton from '@/components/GlobalFullscreenButton'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' })

export const metadata: Metadata = {
  title: 'Notty - World-Class Notes',
  description: 'Data-driven, crisp, recall-ready notes with flashcards, quizzes, and spaced repetition learning.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrains.variable}`}>
        <body>
          <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
            <FullscreenProvider>
              <ToastProvider>
                <LayoutWrapper>
                  <Navbar />
                  <main className="flex-1 relative z-0">{children}</main>
                  <Footer />
                  <GlobalFullscreenButton />
                </LayoutWrapper>
              </ToastProvider>
            </FullscreenProvider>
          </NextThemesProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
